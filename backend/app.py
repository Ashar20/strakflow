import logging
import os
import re
import subprocess
from time import sleep
from typing import Any, Dict, Tuple

from flask import Flask, jsonify, request


def create_app() -> Flask:
    app = Flask(__name__)

    # Configure basic logging; in production, hook into your centralized logger
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    logging.basicConfig(level=getattr(logging, log_level, logging.INFO))
    logger = logging.getLogger(__name__)

    @app.route("/create-token", methods=["POST"])
    def create_token():
        if not request.is_json:
            return jsonify({"error": "Expected application/json body"}), 400

        payload: Dict[str, Any] = request.get_json(silent=True) or {}
        name = payload.get("name")
        symbol = payload.get("symbol")
        max_token = payload.get("max_token")

        # Basic type/format checks
        if not isinstance(name, str) or not isinstance(symbol, str):
            return jsonify({"error": "'name' and 'symbol' must be strings"}), 400
        try:
            max_token_int = int(max_token)
            if max_token_int <= 0:
                raise ValueError
        except (TypeError, ValueError):
            return jsonify({"error": "'max_token' must be a positive integer"}), 400

        # Run deployment in the token-contract directory
        token_contract_dir = os.path.join(os.path.dirname(__file__), "token-contract")

        def run_cmd(command: str, cwd: str) -> Tuple[int, str, str]:
            completed = subprocess.run(
                command,
                cwd=cwd,
                shell=True,
                text=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            # Print full command outputs for diagnostics
            logger.info("Command: %s", command)
            if completed.stdout:
                logger.info("STDOUT:\n%s", completed.stdout)
            if completed.stderr:
                logger.info("STDERR:\n%s", completed.stderr)
            return completed.returncode, completed.stdout, completed.stderr

        # 1) Build contracts
        code, out, err = run_cmd("scarb build", cwd=token_contract_dir)
        logger.info("scarb build -> code=%s", code)
        if code != 0:
            logger.error("scarb build failed: %s", err or out)
            return jsonify({"error": "scarb build failed", "stdout": out, "stderr": err}), 500

        # 2) Declare contract
        declare_cmd = (
            "sncast --account=sepolia declare --contract-name=MyToken --network=sepolia"
        )
        code, out, err = run_cmd(declare_cmd, cwd=token_contract_dir)
        logger.info("declare -> code=%s", code)
        if code != 0 and "already declared" not in (err + out):
            logger.error("declare failed: %s", err or out)
            return jsonify({"error": "declare failed", "stdout": out, "stderr": err}), 500

        # Extract class hash from declare output
        class_hash_match = re.search(r"Class Hash:\s*(0x[0-9a-fA-F]+)", out + "\n" + err)
        if not class_hash_match:
            # If already declared, we may need to parse the hash from the message itself; fall back to reading last hex in output
            fallback_match = re.findall(r"0x[0-9a-fA-F]{10,}", out + "\n" + err)
            class_hash = fallback_match[-1] if fallback_match else None
        else:
            class_hash = class_hash_match.group(1)

        if not class_hash:
            return jsonify({"error": "could not determine class hash from declare output", "stdout": out, "stderr": err}), 500
        sleep(30)
        # 3) Deploy contract
        deploy_cmd = (
            f"sncast --account=sepolia deploy --class-hash {class_hash} --salt 0x1 --network sepolia"
        )
        code, out, err = run_cmd(deploy_cmd, cwd=token_contract_dir)
        logger.info("deploy -> code=%s", code)
        if code != 0:
            logger.error("deploy failed: %s", err or out)
            return jsonify({"error": "deploy failed", "stdout": out, "stderr": err}), 500

        # Parse contract address and transaction hash
        address_match = re.search(r"Contract Address:\s*(0x[0-9a-fA-F]+)", out)
        tx_hash_match = re.search(r"Transaction Hash:\s*(0x[0-9a-fA-F]+)", out)
        contract_address = address_match.group(1) if address_match else None
        transaction_hash = tx_hash_match.group(1) if tx_hash_match else None
        if not contract_address or not transaction_hash:
            return jsonify({"error": "could not parse deploy output", "stdout": out, "stderr": err}), 500

        tx_url = f"https://sepolia.starkscan.co/tx/{transaction_hash}"

        logger.info(
            "Deployed token: name=%s, symbol=%s, max_token=%s, class_hash=%s, address=%s, tx=%s",
            name,
            symbol,
            max_token_int,
            class_hash,
            contract_address,
            transaction_hash,
        )

        return jsonify(
            {
                "name": name,
                "symbol": symbol,
                "max_token": max_token_int,
                "class_hash": class_hash,
                "contract_address": contract_address,
                "transaction_hash": transaction_hash,
                "transaction_url": tx_url,
            }
        ), 201

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)


