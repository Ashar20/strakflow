import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BlockType, BlockValues } from "@/types";

interface ExecuteButtonProps {
  blocks: BlockType[];
  values: BlockValues;
  onLog: (message: string, type: "info" | "success" | "error" | "warning") => void;
  onStepChange: (step: number) => void;
  onExecutionStart: () => void;
  onExecutionEnd: () => void;
  onProgress: (progress: number) => void;
}

const ExecuteButton: React.FC<ExecuteButtonProps> = ({
  blocks,
  values,
  onLog,
  onStepChange,
  onExecutionStart,
  onExecutionEnd,
  onProgress,
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
      onLog(`Address: 0x0742...5e8a`, "info");
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

