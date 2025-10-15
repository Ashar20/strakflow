import {
  Wallet,
  FileUp,
  CheckCircle,
  Coins,
  Shield,
  Repeat,
  Send,
  Clock,
  FileDown,
  BarChart3,
  ArrowRightLeft,
  UserCheck,
} from "lucide-react";
import { BlockType } from "@/types";

export const blocks: BlockType[] = [
  {
    id: "connect_wallet",
    name: "Connect Wallet",
    color: "from-purple-400 to-purple-600",
    icon: Wallet,
    description: "Connect your Starknet wallet or create a new Chippy Pay wallet",
    category: "wallet",
    technology: "Starknet",
    inputs: [
      {
        type: "select",
        label: "Wallet Type",
        options: ["ArgentX", "Braavos", "ChippyPay Wallet"],
        required: true,
        defaultValue: "ChippyPay Wallet",
      },
    ],
    compatibleWith: ["validate_wallet", "import_csv"],
  },
  {
    id: "validate_wallet",
    name: "Validate Wallet",
    color: "from-cyan-400 to-cyan-600",
    icon: CheckCircle,
    description: "Check wallet validity, balance, and available tokens",
    category: "validation",
    technology: "Starknet",
    inputs: [
      {
        type: "select",
        label: "Validation Type",
        options: ["Quick Check", "Full Validation", "With Token Scan"],
        required: true,
        defaultValue: "Full Validation",
      },
      {
        type: "select",
        label: "Minimum Balance Check",
        options: ["Skip", "Check ETH Only", "Check All Tokens"],
        required: false,
        defaultValue: "Check ETH Only",
      },
    ],
    compatibleWith: ["import_csv", "validate_receiver", "transfer_token"],
  },
  {
    id: "validate_receiver",
    name: "Validate Receiver Address",
    color: "from-teal-400 to-teal-600",
    icon: UserCheck,
    description: "Validate receiver wallet address before transfer",
    category: "validation",
    technology: "Starknet",
    inputs: [
      {
        type: "address",
        label: "Receiver Address",
        placeholder: "0x... (Starknet address)",
        required: true,
      },
      {
        type: "select",
        label: "Validation Type",
        options: ["Format Only", "Format + Balance Check", "Full Validation"],
        required: true,
        defaultValue: "Format + Balance Check",
      },
    ],
    compatibleWith: ["transfer_token"],
  },
  {
    id: "transfer_token",
    name: "Transfer Token",
    color: "from-violet-400 to-violet-600",
    icon: ArrowRightLeft,
    description: "Transfer tokens to a receiver address",
    category: "transfer",
    technology: "ChippyPay",
    inputs: [
      {
        type: "select",
        label: "Token",
        options: ["ETH", "STRK", "USDC", "USDT"],
        required: true,
        defaultValue: "ETH",
      },
      {
        type: "address",
        label: "Receiver Address",
        placeholder: "0x... (Starknet address)",
        required: true,
      },
      {
        type: "number",
        label: "Amount",
        placeholder: "0.0",
        required: true,
      },
    ],
    compatibleWith: ["check_tx_status", "transaction_summary"],
  },
  {
    id: "import_csv",
    name: "Import CSV Recipients",
    color: "from-blue-400 to-blue-600",
    icon: FileUp,
    description: "Upload CSV file with recipient addresses and amounts",
    category: "import",
    technology: "CSV",
    inputs: [
      {
        type: "file",
        label: "CSV File",
        placeholder: "Select CSV file",
        required: true,
        accept: ".csv",
      },
      {
        type: "textarea",
        label: "Expected Format",
        placeholder: "address,amount\n0x123...,100\n0x456...,200",
        required: false,
      },
    ],
    compatibleWith: ["validate_addresses"],
  },
  {
    id: "validate_addresses",
    name: "Validate Addresses",
    color: "from-green-400 to-green-600",
    icon: CheckCircle,
    description: "Validate recipient addresses are valid Starknet addresses",
    category: "validation",
    technology: "Starknet",
    inputs: [
      {
        type: "select",
        label: "Validation Level",
        options: ["Basic", "Strict", "With Balance Check"],
        required: true,
        defaultValue: "Strict",
      },
    ],
    compatibleWith: ["check_balance"],
  },
  {
    id: "check_balance",
    name: "Check Balance",
    color: "from-yellow-400 to-yellow-600",
    icon: Coins,
    description: "Check if wallet has sufficient balance for transfers",
    category: "balance",
    technology: "Starknet",
    inputs: [
      {
        type: "address",
        label: "Token Address",
        placeholder: "0x... (ETH, STRK, or custom token)",
        required: true,
      },
      {
        type: "number",
        label: "Gas Buffer (%)",
        placeholder: "10",
        required: false,
        unit: "%",
        defaultValue: "10",
      },
    ],
    compatibleWith: ["approve_token"],
  },
  {
    id: "approve_token",
    name: "Approve Token",
    color: "from-orange-400 to-orange-600",
    icon: Shield,
    description: "Approve token spending for batch transfers",
    category: "approval",
    technology: "Starknet",
    inputs: [
      {
        type: "select",
        label: "Approval Type",
        options: ["Exact Amount", "Unlimited"],
        required: true,
        defaultValue: "Exact Amount",
      },
    ],
    compatibleWith: ["loop_recipients"],
  },
  {
    id: "loop_recipients",
    name: "Loop through Recipients",
    color: "from-indigo-400 to-indigo-600",
    icon: Repeat,
    description: "Process transfers for all recipients",
    category: "transfer",
    technology: "ChippyPay",
    isLoop: true,
    inputs: [
      {
        type: "number",
        label: "Batch Size",
        placeholder: "10",
        required: true,
        defaultValue: "10",
      },
      {
        type: "number",
        label: "Delay Between Batches (ms)",
        placeholder: "1000",
        required: false,
        defaultValue: "1000",
        unit: "ms",
      },
    ],
    compatibleWith: ["batch_transfer"],
  },
  {
    id: "batch_transfer",
    name: "Batch Transfer",
    color: "from-pink-400 to-pink-600",
    icon: Send,
    description: "Execute batch transfer to recipients",
    category: "transfer",
    technology: "ChippyPay",
    inputs: [
      {
        type: "select",
        label: "Execution Mode",
        options: ["Sequential", "Parallel"],
        required: true,
        defaultValue: "Sequential",
      },
    ],
    compatibleWith: ["check_tx_status"],
  },
  {
    id: "check_tx_status",
    name: "Check Transaction Status",
    color: "from-cyan-400 to-cyan-600",
    icon: Clock,
    description: "Monitor transaction status and confirmations",
    category: "monitoring",
    technology: "Starknet",
    inputs: [
      {
        type: "number",
        label: "Max Retries",
        placeholder: "5",
        required: false,
        defaultValue: "5",
      },
      {
        type: "number",
        label: "Retry Delay (ms)",
        placeholder: "3000",
        required: false,
        defaultValue: "3000",
        unit: "ms",
      },
    ],
    compatibleWith: ["transaction_summary", "loop_recipients"],
  },
  {
    id: "transaction_summary",
    name: "Transaction Summary",
    color: "from-emerald-400 to-emerald-600",
    icon: BarChart3,
    description: "Generate summary of all transactions",
    category: "reporting",
    technology: "Reporting",
    inputs: [
      {
        type: "select",
        label: "Summary Format",
        options: ["Detailed", "Compact"],
        required: true,
        defaultValue: "Detailed",
      },
    ],
    compatibleWith: ["export_report"],
  },
  {
    id: "export_report",
    name: "Export Report",
    color: "from-gray-400 to-gray-600",
    icon: FileDown,
    description: "Export transaction report as CSV/PDF",
    category: "reporting",
    technology: "Reporting",
    inputs: [
      {
        type: "select",
        label: "Export Format",
        options: ["CSV", "PDF", "JSON"],
        required: true,
        defaultValue: "CSV",
      },
      {
        type: "text",
        label: "Filename",
        placeholder: "transaction-report",
        required: false,
        defaultValue: "transaction-report",
      },
    ],
    compatibleWith: [],
  },
];

// Helper function to get blocks by technology
export const getBlocksByTechnology = (technology: BlockType["technology"]) => {
  return blocks.filter((block) => block.technology === technology);
};

// Helper function to get all available technologies
export const getAvailableTechnologies = (): BlockType["technology"][] => {
  return Array.from(new Set(blocks.map((block) => block.technology)));
};

// Helper to get block by ID
export const getBlockById = (id: string): BlockType | undefined => {
  return blocks.find((block) => block.id === id);
};

