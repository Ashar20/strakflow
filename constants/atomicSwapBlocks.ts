import {
  Wallet,
  ArrowLeftRight,
  Bitcoin,
  Coins,
  Network,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react";
import { BlockType } from "@/types";

export const atomicSwapBlocks: BlockType[] = [
  {
    id: "connect_wallet_swap",
    name: "Connect Wallet",
    color: "from-purple-400 to-purple-600",
    icon: Wallet,
    description: "Connect your wallet for atomic swaps (Testnet: Starknet Sepolia, Bitcoin Testnet, Solana Devnet)",
    category: "wallet",
    technology: "Multi-Chain",
    inputs: [
      {
        type: "select",
        label: "Source Chain",
        options: ["Starknet (Sepolia)", "Bitcoin (Testnet)", "Solana (Devnet)"],
        required: true,
        defaultValue: "Starknet (Sepolia)",
      },
      {
        type: "select",
        label: "Wallet Type",
        options: ["ArgentX", "Braavos", "Phantom", "Backpack", "Manual Address"],
        required: true,
        defaultValue: "ArgentX",
      },
    ],
    compatibleWith: ["select_swap_pair", "get_quote", "btc_to_starknet", "starknet_to_btc", "solana_to_starknet"],
  },
  {
    id: "select_swap_pair",
    name: "Select Swap Pair",
    color: "from-blue-400 to-blue-600",
    icon: ArrowLeftRight,
    description: "Choose source and destination tokens for atomic swap",
    category: "swap",
    technology: "swap",
    inputs: [
      {
        type: "select",
        label: "From Chain",
        options: ["Starknet", "Bitcoin", "Solana"],
        required: true,
        defaultValue: "Starknet",
      },
      {
        type: "select",
        label: "From Token",
        options: ["ETH", "STRK", "USDC", "USDT", "BTC", "SOL"],
        required: true,
        defaultValue: "ETH",
      },
      {
        type: "select",
        label: "To Chain",
        options: ["Starknet", "Bitcoin", "Solana"],
        required: true,
        defaultValue: "Bitcoin",
      },
      {
        type: "select",
        label: "To Token",
        options: ["BTC", "ETH", "STRK", "SOL", "USDC"],
        required: true,
        defaultValue: "BTC",
      },
      {
        type: "number",
        label: "Amount",
        placeholder: "0.0",
        required: true,
      },
    ],
    compatibleWith: ["get_quote"],
  },
  {
    id: "get_quote",
    name: "Get Swap Quote",
    color: "from-emerald-400 to-emerald-600",
    icon: Coins,
    description: "Fetch real-time atomic swap quote from Atomiq",
    category: "swap",
    technology: "swap",
    inputs: [
      {
        type: "select",
        label: "Swap Type",
        options: ["Standard", "Lightning Network", "SPV Vault"],
        required: true,
        defaultValue: "Standard",
      },
      {
        type: "select",
        label: "Priority",
        options: ["Normal", "Fast", "Instant"],
        required: false,
        defaultValue: "Normal",
      },
    ],
    compatibleWith: ["execute_swap", "validate_quote"],
  },
  {
    id: "validate_quote",
    name: "Validate Quote",
    color: "from-cyan-400 to-cyan-600",
    icon: CheckCircle,
    description: "Verify swap quote details, fees, and rates",
    category: "validation",
    technology: "validation",
    inputs: [
      {
        type: "select",
        label: "Check Type",
        options: ["Quick Check", "Full Validation", "Compare Rates"],
        required: true,
        defaultValue: "Full Validation",
      },
    ],
    compatibleWith: ["execute_swap"],
  },
  {
    id: "execute_swap",
    name: "Execute Atomic Swap",
    color: "from-orange-400 to-orange-600",
    icon: Network,
    description: "Execute trustless atomic swap across chains",
    category: "swap",
    technology: "swap",
    inputs: [
      {
        type: "select",
        label: "Execution Mode",
        options: ["Automatic", "Manual Confirmation"],
        required: true,
        defaultValue: "Automatic",
      },
      {
        type: "number",
        label: "Slippage Tolerance (%)",
        placeholder: "1.0",
        required: false,
        defaultValue: "1.0",
        unit: "%",
      },
    ],
    compatibleWith: ["track_swap", "swap_summary"],
  },
  {
    id: "track_swap",
    name: "Track Swap Status",
    color: "from-violet-400 to-violet-600",
    icon: Clock,
    description: "Monitor atomic swap progress across chains",
    category: "monitoring",
    technology: "monitoring",
    inputs: [
      {
        type: "number",
        label: "Polling Interval (seconds)",
        placeholder: "5",
        required: false,
        defaultValue: "5",
        unit: "s",
      },
      {
        type: "select",
        label: "Alert On",
        options: ["Completion", "All Updates", "Errors Only"],
        required: false,
        defaultValue: "All Updates",
      },
    ],
    compatibleWith: ["swap_summary"],
  },
  {
    id: "swap_summary",
    name: "Swap Summary",
    color: "from-pink-400 to-pink-600",
    icon: BarChart3,
    description: "View detailed atomic swap transaction summary",
    category: "reporting",
    technology: "reporting",
    inputs: [
      {
        type: "select",
        label: "Detail Level",
        options: ["Basic", "Detailed", "Technical"],
        required: true,
        defaultValue: "Detailed",
      },
      {
        type: "select",
        label: "Include Transaction Links",
        options: ["Yes", "No"],
        required: false,
        defaultValue: "Yes",
      },
    ],
    compatibleWith: [],
  },
  {
    id: "btc_to_starknet",
    name: "Bitcoin → Starknet",
    color: "from-amber-400 to-amber-600",
    icon: Bitcoin,
    description: "Atomic swap from Bitcoin to Starknet (BTC → ETH/STRK)",
    category: "swap",
    technology: "swap",
    inputs: [
      {
        type: "number",
        label: "BTC Amount",
        placeholder: "0.001",
        required: true,
      },
      {
        type: "select",
        label: "Destination Token",
        options: ["ETH", "STRK", "USDC"],
        required: true,
        defaultValue: "ETH",
      },
      {
        type: "address",
        label: "Starknet Address",
        placeholder: "0x... (Starknet address)",
        required: true,
      },
    ],
    compatibleWith: ["track_swap", "swap_summary"],
  },
  {
    id: "starknet_to_btc",
    name: "Starknet → Bitcoin",
    color: "from-yellow-400 to-yellow-600",
    icon: Bitcoin,
    description: "Atomic swap from Starknet to Bitcoin (ETH/STRK → BTC)",
    category: "swap",
    technology: "swap",
    inputs: [
      {
        type: "select",
        label: "Source Token",
        options: ["ETH", "STRK", "USDC"],
        required: true,
        defaultValue: "ETH",
      },
      {
        type: "number",
        label: "Amount",
        placeholder: "0.1",
        required: true,
      },
      {
        type: "text",
        label: "Bitcoin Address",
        placeholder: "bc1... or 1... (Bitcoin address)",
        required: true,
      },
    ],
    compatibleWith: ["track_swap", "swap_summary"],
  },
  {
    id: "solana_to_starknet",
    name: "Solana → Starknet",
    color: "from-purple-400 to-purple-600",
    icon: Network,
    description: "Atomic swap from Solana to Starknet (SOL → ETH/STRK)",
    category: "swap",
    technology: "swap",
    inputs: [
      {
        type: "number",
        label: "SOL Amount",
        placeholder: "1.0",
        required: true,
      },
      {
        type: "select",
        label: "Destination Token",
        options: ["ETH", "STRK", "USDC"],
        required: true,
        defaultValue: "ETH",
      },
      {
        type: "address",
        label: "Starknet Address",
        placeholder: "0x... (Starknet address)",
        required: true,
      },
    ],
    compatibleWith: ["track_swap", "swap_summary"],
  },
];

// Helper function to get atomic swap blocks by category
export const getAtomicSwapBlocksByCategory = (category: string) => {
  return atomicSwapBlocks.filter((block) => block.category === category);
};

// Helper function to get block by ID
export const getAtomicSwapBlockById = (id: string): BlockType | undefined => {
  return atomicSwapBlocks.find((block) => block.id === id);
};

// Get all available swap pairs
export const getAvailableSwapPairs = () => {
  return [
    { from: "Starknet", to: "Bitcoin", tokens: ["ETH → BTC", "STRK → BTC"] },
    { from: "Bitcoin", to: "Starknet", tokens: ["BTC → ETH", "BTC → STRK"] },
    { from: "Solana", to: "Starknet", tokens: ["SOL → ETH", "SOL → STRK"] },
    { from: "Starknet", to: "Solana", tokens: ["ETH → SOL", "STRK → SOL"] },
  ];
};

