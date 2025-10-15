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
        contract_src_path = os.path.join(token_contract_dir, "src", "erc20_token.cairo")

        # Update constructor values in the Cairo source from request body
        try:
            with open(contract_src_path, "r", encoding="utf-8") as f:
                cairo_src = f.read()

            # Replace name and symbol (ByteArray string literals)
            updated_src = re.sub(
                r'let\s+name:\s*ByteArray\s*=\s*".*?";',
                f'let name: ByteArray = "{name}";',
                cairo_src,
                count=1,
            )
            updated_src = re.sub(
                r'let\s+symbol:\s*ByteArray\s*=\s*".*?";',
                f'let symbol: ByteArray = "{symbol}";',
                updated_src,
                count=1,
            )
            # Decimals remains 18 by default; only change if provided
            if "decimals" in payload and payload.get("decimals") is not None:
                try:
                    decimals_int = int(payload.get("decimals"))
                except (TypeError, ValueError):
                    return jsonify({"error": "'decimals' must be an integer"}), 400
                updated_src = re.sub(
                    r"let\s+decimals:\s*u8\s*=\s*\d+;",
                    f"let decimals: u8 = {decimals_int};",
                    updated_src,
                    count=1,
                )

            # initial_supply from max_token
            updated_src = re.sub(
                r"let\s+initial_supply:\s*u256\s*=\s*\d+;",
                f"let initial_supply: u256 = {max_token_int};",
                updated_src,
                count=1,
            )

            if updated_src == cairo_src:
                return jsonify({
                    "error": "contract source unchanged after edit",
                    "hint": "Regex did not match current constructor lines. Please share current lines around constructor.",
                    "path": contract_src_path
                }), 400

            with open(contract_src_path, "w", encoding="utf-8") as f:
                f.write(updated_src)
        except FileNotFoundError:
            return jsonify({"error": "contract source not found", "path": contract_src_path}), 500
        except OSError as e:
            return jsonify({"error": "failed to update contract source", "details": str(e)}), 500

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

    @app.route("/deploy-contract", methods=["POST"])
    def deploy_contract():
        # Accept either JSON with { code: "..." } or raw text/plain body
        if request.is_json:
            body: Dict[str, Any] = request.get_json(silent=True) or {}
            cairo_code = body.get("code")
        else:
            cairo_code = request.data.decode("utf-8") if request.data else None

        if not cairo_code or not isinstance(cairo_code, str):
            return jsonify({"error": "Provide Cairo code as JSON {code: string} or text/plain body"}), 400

        project_dir = os.path.join(os.path.dirname(__file__), "contract-deployment")
        src_path = os.path.join(project_dir, "src", "your_contract.cairo")

        try:
            os.makedirs(os.path.dirname(src_path), exist_ok=True)
            with open(src_path, "w", encoding="utf-8") as f:
                f.write(cairo_code)
        except OSError as e:
            return jsonify({"error": "failed to write contract source", "details": str(e)}), 500

        def run_cmd(command: str, cwd: str) -> Tuple[int, str, str]:
            completed = subprocess.run(
                command,
                cwd=cwd,
                shell=True,
                text=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            logger.info("Command: %s", command)
            if completed.stdout:
                logger.info("STDOUT:\n%s", completed.stdout)
            if completed.stderr:
                logger.info("STDERR:\n%s", completed.stderr)
            return completed.returncode, completed.stdout, completed.stderr

        # Build
        code, out, err = run_cmd("scarb build", cwd=project_dir)
        if code != 0:
            return jsonify({"error": "scarb build failed", "stdout": out, "stderr": err}), 500

        # Declare contract (assumes contract name YourContract in Scarb config)
        declare_cmd = "sncast --account=sepolia declare --contract-name=YourContract --network=sepolia"
        code, out, err = run_cmd(declare_cmd, cwd=project_dir)
        if code != 0 and "already declared" not in (err + out):
            return jsonify({"error": "declare failed", "stdout": out, "stderr": err}), 500

        class_hash_match = re.search(r"Class Hash:\s*(0x[0-9a-fA-F]+)", out + "\n" + err)
        if not class_hash_match:
            # fallback: last long hex
            fallback_match = re.findall(r"0x[0-9a-fA-F]{10,}", out + "\n" + err)
            class_hash = fallback_match[-1] if fallback_match else None
        else:
            class_hash = class_hash_match.group(1)

        if not class_hash:
            return jsonify({"error": "could not determine class hash from declare output", "stdout": out, "stderr": err}), 500

        sleep(30)
        # Deploy
        # Attempt to infer constructor arguments (ContractAddress) and pass zero addresses by default
        try:
            constructor_sig = re.search(r"#[\t ]*constructor\s*\n\s*fn\s+constructor\(([^)]*)\)", cairo_code)
            calldata_parts = []
            if constructor_sig:
                params_text = constructor_sig.group(1)
                # Remove the leading self param portion
                params_text = re.sub(r"^\s*ref\s+self:\s*ContractState\s*,?\s*", "", params_text)
                if params_text:
                    # Count ContractAddress params and fill with 0x0
                    contract_addr_count = len(re.findall(r":\s*ContractAddress\b", params_text))
                    if contract_addr_count > 0:
                        calldata_parts.extend(["0x0"] * contract_addr_count)
            calldata_arg = f" --constructor-calldata {' '.join(calldata_parts)}" if calldata_parts else ""
        except Exception:
            calldata_arg = ""

        deploy_cmd = f"sncast --account=sepolia deploy --class-hash {class_hash} --salt 0x1 --network sepolia{calldata_arg}"
        code, out, err = run_cmd(deploy_cmd, cwd=project_dir)
        if code != 0:
            return jsonify({"error": "deploy failed", "stdout": out, "stderr": err}), 500

        address_match = re.search(r"Contract Address:\s*(0x[0-9a-fA-F]+)", out)
        tx_hash_match = re.search(r"Transaction Hash:\s*(0x[0-9a-fA-F]+)", out)
        contract_address = address_match.group(1) if address_match else None
        transaction_hash = tx_hash_match.group(1) if tx_hash_match else None
        if not contract_address or not transaction_hash:
            return jsonify({"error": "could not parse deploy output", "stdout": out, "stderr": err}), 500

        tx_url = f"https://sepolia.starkscan.co/tx/{transaction_hash}"

        return jsonify(
            {
                "class_hash": class_hash,
                "contract_address": contract_address,
                "transaction_hash": transaction_hash,
                "transaction_url": tx_url,
            }
        ), 201

    @app.route("/deploy-nft", methods=["POST"])
    def deploy_nft():
        if not request.is_json:
            return jsonify({"error": "Expected application/json body"}), 400

        body: Dict[str, Any] = request.get_json(silent=True) or {}
        name = body.get("name")
        symbol = body.get("symbol")
        base_uri = body.get("base_uri")

        if not isinstance(name, str) or not isinstance(symbol, str) or not isinstance(base_uri, str):
            return jsonify({"error": "'name', 'symbol', and 'base_uri' must be strings"}), 400

        # Owner will be hardcoded in contract; no owner in request is required

        project_dir = os.path.join(os.path.dirname(__file__), "openzeppelin-nft")
        contract_path = os.path.join(project_dir, "src", "your_collectible.cairo")

        # Update constructor literals in your_collectible.cairo
        try:
            with open(contract_path, "r", encoding="utf-8") as f:
                cairo_src = f.read()

            updated_src = re.sub(
                r'let\s+name:\s*ByteArray\s*=\s*".*?";',
                f'let name: ByteArray = "{name}";',
                cairo_src,
                count=1,
            )
            updated_src = re.sub(
                r'let\s+symbol:\s*ByteArray\s*=\s*".*?";',
                f'let symbol: ByteArray = "{symbol}";',
                updated_src,
                count=1,
            )

            # Remove owner param from constructor signature
            updated_src = re.sub(
                r"fn\s+constructor\(ref\s+self:\s*ContractState\s*,\s*owner:\s*ContractAddress\)",
                "fn constructor(ref self: ContractState)",
                updated_src,
                count=1,
            )
            # Hardcode owner before initializer
            updated_src = re.sub(
                r"self\.ownable\.initializer\(\s*owner\s*\);",
                (
                    "let owner: ContractAddress = "
                    "0x04C23F4996013A9A52C78B9f5Ae4D116AC1cb70BB1ED36e193E2901C6479e626"
                    ".try_into().unwrap();\n        self.ownable.initializer(owner);"
                ),
                updated_src,
                count=1,
            )
            updated_src = re.sub(
                r'let\s+base_uri:\s*ByteArray\s*=\s*".*?";',
                f'let base_uri: ByteArray = "{base_uri}";',
                updated_src,
                count=1,
            )

            with open(contract_path, "w", encoding="utf-8") as f:
                f.write(updated_src)
        except FileNotFoundError:
            return jsonify({"error": "contract source not found", "path": contract_path}), 500
        except OSError as e:
            return jsonify({"error": "failed to update contract source", "details": str(e)}), 500

        def run_cmd(command: str, cwd: str) -> Tuple[int, str, str]:
            completed = subprocess.run(
                command,
                cwd=cwd,
                shell=True,
                text=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            logger.info("Command: %s", command)
            if completed.stdout:
                logger.info("STDOUT:\n%s", completed.stdout)
            if completed.stderr:
                logger.info("STDERR:\n%s", completed.stderr)
            return completed.returncode, completed.stdout, completed.stderr

        # Build the NFT project
        code, out, err = run_cmd("scarb build", cwd=project_dir)
        if code != 0:
            return jsonify({"error": "scarb build failed", "stdout": out, "stderr": err}), 500

        # Declare YourCollectible
        declare_cmd = "sncast --account=sepolia declare --contract-name=YourCollectible --network=sepolia"
        code, out, err = run_cmd(declare_cmd, cwd=project_dir)
        if code != 0 and "already declared" not in (err + out):
            return jsonify({"error": "declare failed", "stdout": out, "stderr": err}), 500

        class_hash_match = re.search(r"Class Hash:\s*(0x[0-9a-fA-F]+)", out + "\n" + err)
        if not class_hash_match:
            fallback_match = re.findall(r"0x[0-9a-fA-F]{10,}", out + "\n" + err)
            class_hash = fallback_match[-1] if fallback_match else None
        else:
            class_hash = class_hash_match.group(1)

        if not class_hash:
            return jsonify({"error": "could not determine class hash from declare output", "stdout": out, "stderr": err}), 500

        # No constructor calldata required (owner hardcoded)
        calldata_arg = ""

        sleep(30)
        deploy_cmd = f"sncast --account=sepolia deploy --class-hash {class_hash} --salt 0x1 --network sepolia{calldata_arg}"
        code, out, err = run_cmd(deploy_cmd, cwd=project_dir)
        if code != 0:
            return jsonify({"error": "deploy failed", "stdout": out, "stderr": err}), 500

        address_match = re.search(r"Contract Address:\s*(0x[0-9a-fA-F]+)", out)
        tx_hash_match = re.search(r"Transaction Hash:\s*(0x[0-9a-fA-F]+)", out)
        contract_address = address_match.group(1) if address_match else None
        transaction_hash = tx_hash_match.group(1) if tx_hash_match else None
        if not contract_address or not transaction_hash:
            return jsonify({"error": "could not parse deploy output", "stdout": out, "stderr": err}), 500

        tx_url = f"https://sepolia.starkscan.co/tx/{transaction_hash}"

        return jsonify(
            {
                "name": name,
                "symbol": symbol,
                "base_uri": base_uri,
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


