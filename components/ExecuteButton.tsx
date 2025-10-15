import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BlockType, BlockValues } from "@/types";
import { validateWallet } from "@/services/validateWallet";
import { validateReceiverAddress } from "@/services/validateReceiver";
import { transferToken } from "@/services/transferToken";

interface ExecuteButtonProps {
  blocks: BlockType[];
  values: BlockValues;
  onLog: (message: string, type: "info" | "success" | "error" | "warning") => void;
  onStepChange: (step: number) => void;
  onExecutionStart: () => void;
  onExecutionEnd: () => void;
  onProgress: (progress: number) => void;
  wallet?: { address: string; type: string };
}

const ExecuteButton: React.FC<ExecuteButtonProps> = ({
  blocks,
  values,
  onLog,
  onStepChange,
  onExecutionStart,
  onExecutionEnd,
  onProgress,
  wallet,
}) => {
  const [isExecuting, setIsExecuting] = useState(false);

  const simulateStepExecution = async (
    block: BlockType,
    index: number
  ): Promise<void> => {
    const blockValues = values[`chain-${index}`] || {};
    onLog(`Starting: ${block.name}`, "info");

    // Simulate different execution times based on block type
    const executionTime = block.isLoop ? 3000 : 1500;
    await new Promise((resolve) => setTimeout(resolve, executionTime));

    // Simulate success/failure based on block
    if (block.id === "import_csv") {
      const csvFile = blockValues["CSV File"];
      if (!csvFile) {
        throw new Error("CSV file not provided");
      }
      onLog(`✓ Imported CSV: ${csvFile}`, "success");
      onLog(`Found 25 recipients in CSV`, "info");
    } else if (block.id === "validate_wallet") {
      const validationType = (blockValues["Validation Type"] || "Full Validation") as "Quick Check" | "Full Validation" | "With Token Scan";
      const balanceCheck = (blockValues["Minimum Balance Check"] || "Check ETH Only") as "Skip" | "Check ETH Only" | "Check All Tokens";
      
      // Debug: Log wallet object
      console.log("🐛 DEBUG: wallet object in ExecuteButton:", wallet);
      console.log("🐛 DEBUG: wallet?.address:", wallet?.address);
      
      // Get wallet address from connected wallet
      const walletAddress = wallet?.address || "0x0";
      
      onLog(`🔍 Running ${validationType}...`, "info");
      onLog(`📍 Wallet Address: ${walletAddress}`, "info");
      
      if (!walletAddress || walletAddress === "0x0") {
        console.error("❌ No wallet address found! wallet object:", wallet);
        throw new Error("No wallet connected. Please connect your wallet first.");
      }
      
      try {
        // Run actual validation
        const result = await validateWallet(walletAddress, validationType, balanceCheck);
        
        // Show validation results
        if (result.isValid) {
          onLog(`✓ Wallet address is valid`, "success");
        } else {
          onLog(`✗ Wallet address is invalid`, "error");
        }
        
        if (result.tokens.length > 0) {
          onLog(`✓ Found ${result.tokens.length} token${result.tokens.length > 1 ? 's' : ''} in wallet`, "success");
          
          // Show each token
          result.tokens.forEach(token => {
            onLog(`  • ${token.symbol}: ${token.balance} (${token.usdValue})`, "info");
          });
          
          onLog(`💰 Total Portfolio Value: ${result.totalUsdValue}`, "success");
        } else {
          onLog(`⚠ No tokens found in wallet`, "warning");
        }
        
        // Show balance check results
        if (result.hasBalance) {
          if (balanceCheck === "Check ETH Only") {
            onLog(`✓ ETH balance sufficient for gas fees`, "success");
          } else if (balanceCheck === "Check All Tokens") {
            onLog(`✓ Wallet has sufficient token balances`, "success");
          }
        } else {
          onLog(`⚠ Wallet has insufficient balance`, "warning");
        }
        
        // Show any errors
        if (result.errors.length > 0) {
          result.errors.forEach(error => {
            onLog(`❌ ${error}`, "error");
          });
        }
        
        // Show any warnings
        if (result.warnings.length > 0) {
          result.warnings.forEach(warning => {
            onLog(`⚠ ${warning}`, "warning");
          });
        }
      } catch (error) {
        onLog(`❌ Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`, "error");
        throw error;
      }
    } else if (block.id === "validate_receiver") {
      const receiverAddress = blockValues["Receiver Address"];
      const validationType = (blockValues["Validation Type"] || "Format + Balance Check") as "Format Only" | "Format + Balance Check" | "Full Validation";
      
      if (!receiverAddress) {
        throw new Error("Receiver address is required");
      }
      
      onLog(`🔍 Validating receiver address...`, "info");
      onLog(`📍 Address: ${receiverAddress}`, "info");
      
      try {
        const result = await validateReceiverAddress(receiverAddress, validationType);
        
        if (result.isValid) {
          onLog(`✓ Receiver address is valid`, "success");
        } else {
          onLog(`✗ Receiver address is invalid`, "error");
        }
        
        if (result.hasBalance) {
          onLog(`✓ Receiver has existing balance`, "success");
        } else {
          onLog(`⚠ Receiver has no balance (may be a new wallet)`, "warning");
        }
        
        if (validationType === "Full Validation") {
          if (result.isDeployed) {
            onLog(`✓ Account is deployed on-chain`, "success");
          } else {
            onLog(`⚠ Account not yet deployed (counterfactual address)`, "warning");
          }
        }
        
        if (result.errors.length > 0) {
          result.errors.forEach(error => {
            onLog(`❌ ${error}`, "error");
          });
          throw new Error("Receiver validation failed");
        }
        
        if (result.warnings.length > 0) {
          result.warnings.forEach(warning => {
            onLog(`⚠ ${warning}`, "warning");
          });
        }
      } catch (error) {
        onLog(`❌ Receiver validation failed: ${error instanceof Error ? error.message : "Unknown error"}`, "error");
        throw error;
      }
    } else if (block.id === "transfer_token") {
      const token = (blockValues["Token"] || "ETH") as "ETH" | "STRK" | "USDC" | "USDT";
      const receiverAddress = blockValues["Receiver Address"];
      const amount = blockValues["Amount"];
      
      if (!receiverAddress) {
        throw new Error("Receiver address is required");
      }
      
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error("Valid amount is required");
      }
      
      const walletAddress = wallet?.address || "0x0";
      
      if (!walletAddress || walletAddress === "0x0") {
        throw new Error("No wallet connected");
      }
      
      // Get encryption key from localStorage (stored when wallet was connected)
      let encryptKey = "";
      if (typeof window !== "undefined") {
        encryptKey = localStorage.getItem("wallet_private_key") || "";
      }
      
      if (!encryptKey) {
        onLog(`❌ No encryption key found in wallet state`, "error");
        onLog(`   Please connect wallet with Private Key method to enable transfers`, "error");
        throw new Error("Encryption key required for transfer. Please reconnect wallet using Private Key method.");
      }
      
      onLog(`💸 Initiating ${token} transfer...`, "info");
      onLog(`   From: ${walletAddress}`, "info");
      onLog(`   To: ${receiverAddress}`, "info");
      onLog(`   Amount: ${amount} ${token}`, "info");
      
      try {
        const result = await transferToken(token, receiverAddress, amount, encryptKey, walletAddress);
        
        if (result.success) {
          onLog(`✓ Transfer successful!`, "success");
          onLog(`   Transaction Hash: ${result.transactionHash}`, "success");
          onLog(`   ${amount} ${token} sent to ${receiverAddress}`, "info");
        } else {
          onLog(`✗ Transfer failed: ${result.error}`, "error");
          throw new Error(result.error || "Transfer failed");
        }
      } catch (error) {
        onLog(`❌ Transfer failed: ${error instanceof Error ? error.message : "Unknown error"}`, "error");
        throw error;
      }
    } else if (block.id === "validate_addresses") {
      onLog(`✓ Validated 25 addresses`, "success");
      onLog(`All addresses are valid Starknet addresses`, "success");
    } else if (block.id === "check_balance") {
      const tokenAddress = blockValues["Token Address"];
      onLog(`✓ Checked balance for token: ${tokenAddress || "ETH"}`, "success");
      onLog(`Balance: 1000 tokens (sufficient)`, "success");
    } else if (block.id === "approve_token") {
      const approvalType = blockValues["Approval Type"];
      onLog(`✓ Token approved (${approvalType || "Exact Amount"})`, "success");
    } else if (block.id === "loop_recipients") {
      const batchSize = blockValues["Batch Size"] || "10";
      onLog(`✓ Processing recipients in batches of ${batchSize}`, "info");
      onLog(`3 batches will be processed`, "info");
    } else if (block.id === "batch_transfer") {
      const mode = blockValues["Execution Mode"] || "Sequential";
      onLog(`✓ Executing batch transfer (${mode} mode)`, "success");
      onLog(`Batch completed: 10 transfers successful`, "success");
    } else if (block.id === "check_tx_status") {
      onLog(`✓ All transactions confirmed`, "success");
      onLog(`Average confirmation time: 2.3 seconds`, "info");
    } else if (block.id === "transaction_summary") {
      onLog(`✓ Transaction summary generated`, "success");
      onLog(`Total: 25 recipients, 25 successful, 0 failed`, "success");
      onLog(`Total amount sent: 500 tokens`, "info");
      onLog(`Total gas fees: 0.025 ETH`, "info");
    } else if (block.id === "export_report") {
      const format = blockValues["Export Format"] || "CSV";
      const filename = blockValues["Filename"] || "transaction-report";
      onLog(`✓ Report exported as ${format}`, "success");
      onLog(`Filename: ${filename}.${format.toLowerCase()}`, "info");
    } else if (block.id === "connect_wallet") {
      const walletType = blockValues["Wallet Type"] || "ArgentX";
      onLog(`✓ Connected to ${walletType}`, "success");
      if (wallet?.address) {
        onLog(`Address: ${wallet.address}`, "info");
      }
    } else {
      onLog(`✓ ${block.name} completed`, "success");
    }
  };

  const executeWorkflow = async () => {
    if (isExecuting) return;

    setIsExecuting(true);
    onExecutionStart();
    onLog("=== Starting Workflow Execution ===", "info");

    try {
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        onStepChange(i);
        onProgress(((i + 1) / blocks.length) * 100);

        await simulateStepExecution(block, i);

        // If it's a loop block, simulate multiple iterations
        if (block.isLoop) {
          const batchSize = parseInt(values[`chain-${i}`]?.["Batch Size"] || "10");
          const totalRecipients = 25; // simulated
          const batches = Math.ceil(totalRecipients / batchSize);
          
          for (let batch = 1; batch <= batches; batch++) {
            onLog(`Processing batch ${batch}/${batches}...`, "info");
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }

      onLog("=== Workflow Completed Successfully ===", "success");
      onStepChange(-1);
      onProgress(100);
    } catch (error) {
      onLog(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error"
      );
      onLog("=== Workflow Failed ===", "error");
      onStepChange(-1);
    } finally {
      setIsExecuting(false);
      onExecutionEnd();
    }
  };

  return (
    <Button
      onClick={executeWorkflow}
      disabled={isExecuting || blocks.length === 0}
      className={cn(
        "bg-black text-white border-2 border-black rounded-xl",
        "shadow-[4px_4px_0_0_rgba(0,0,0,1)]",
        "hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)]",
        "hover:translate-y-[-2px]",
        "transition-all duration-200",
        "font-bold",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      )}
    >
      {isExecuting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Executing...
        </>
      ) : (
        <>
          <Play className="mr-2 h-4 w-4" />
          Execute Workflow
        </>
      )}
    </Button>
  );
};

export default ExecuteButton;

