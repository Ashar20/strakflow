# Chippy Pay Workflow Builder

**Chippy Pay Workflow Builder** is an intuitive, visual workflow builder for executing batch payments on Starknet. Built for the Starknet Hackathon, it enables users to create complex payment workflows through a drag-and-drop interface inspired by OpenAI's workflow builder.

## 🌟 Key Features

- **Visual Workflow Builder:** Create payment workflows using an intuitive drag-and-drop interface
- **Starknet Native Multicall:** Leverage Starknet's built-in Account Abstraction for batch transfers - no custom contract needed!
- **Batch Payment Processing:** Send tokens to multiple recipients in a single transaction
- **CSV Import:** Import recipient lists from CSV files
- **Address Validation:** Comprehensive validation for Starknet addresses
- **Real-time Monitoring:** Track execution progress with detailed logs
- **Transaction Reports:** Export detailed reports in CSV, JSON, or PDF format
- **Starknet Integration:** Native support for ArgentX and Braavos wallets
- **Neobrutalist Design:** Modern, bold UI inspired by B4B project

## 📋 Workflow Steps

The workflow builder supports the following steps:

1. **Connect Wallet** - Connect your Starknet wallet (ArgentX or Braavos)
2. **Import CSV Recipients** - Upload a CSV file with recipient addresses and amounts
3. **Validate Addresses** - Validate all recipient addresses
4. **Check Balance** - Verify sufficient token balance for transfers
5. **Approve Token** - Approve token spending for batch transfers
6. **Loop through Recipients** - Process transfers in optimized batches
   - **Batch Transfer** - Execute transfers to multiple recipients
   - **Check Transaction Status** - Monitor transaction confirmations
7. **Transaction Summary** - Generate comprehensive transaction summary
8. **Export Report** - Download transaction report (CSV/JSON/PDF)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A Starknet wallet (ArgentX or Braavos)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd strakflow
```

2. Set up environment variables:
```bash
cp env.example .env.local
```
Edit `.env.local` with your configuration (see [ENVIRONMENT.md](./ENVIRONMENT.md))

3. Install dependencies:
```bash
npm install
# or
yarn install
# or
bun install
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
strakflow/
├── app/                      # Next.js app directory
│   ├── workflow/            # Workflow builder page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── BlockInput.tsx       # Input component for blocks
│   ├── ExecuteButton.tsx    # Workflow execution button
│   ├── Header.tsx           # App header
│   ├── WorkflowBuilder.tsx  # Main workflow builder
│   ├── WorkflowPiece.tsx    # Draggable workflow block
│   └── WorkflowVisualizer.tsx # Workflow execution visualizer
├── constants/               # Constants and configurations
│   └── workflows.ts         # Workflow block definitions
├── services/                # Service utilities
│   ├── starknet.ts          # Starknet integration
│   ├── csv.ts               # CSV parsing and export
│   └── batchTransfer.ts     # Batch transfer logic
├── hooks/                   # Custom React hooks
│   └── use-toast.ts         # Toast notifications
├── lib/                     # Utility libraries
│   └── utils.ts             # Helper functions
└── types.ts                 # TypeScript type definitions
```

## 💡 Usage

### Creating a Workflow

1. Navigate to the **Workflow Builder** page
2. Drag workflow blocks from the "Available Workflow Blocks" section
3. Drop them into "Your Workflow" area in the desired order
4. Configure each block's parameters (e.g., CSV file, token address, batch size)
5. Click "Execute Workflow" to run the payment process

### CSV Format

Your CSV file should follow this format:

```csv
address,amount
0x0742d3e5cfe8b4e8e3a7b9c8f5e4d3c2b1a0f9e8d7c6b5a49384756e8a,100
0x0843e4f6dgf9c5f9f4b8cab9g6f5e4d3c2b1b0gaf9e8d7c6b5b49384756f9b,200
0x0944f5g7ehgad6gag5c9dbaah7g6f5e4d3c2c1hbgafae9e8d7d6c5c49384757gac,150
```

- **address**: Valid Starknet address (0x + 64 hex characters)
- **amount**: Token amount to send (positive number)

## 🎨 Design System

The project uses a **neobrutalist design** style with:

- Bold borders (2px solid black)
- Drop shadows (`shadow-[4px_4px_0_0_rgba(0,0,0,1)]`)
- Bright, saturated colors
- Clean, geometric shapes
- Playful interactions (hover effects, animations)

## 🔧 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI + shadcn/ui
- **Blockchain:** Starknet (with native Account Abstraction)
- **Batch Processing:** Starknet Multicall (no custom contract needed!)
- **CSV Parsing:** PapaParse
- **Icons:** Lucide React

## 🌐 Starknet Integration

### Native Multicall - No Custom Contract Required! 🎉

Chippy Pay uses **Starknet's native Account Abstraction** for batch transfers. Unlike Ethereum's ERC-4337, Starknet has AA built into the protocol, meaning:

- ✅ **No contract deployment needed**
- ✅ **Works with any Starknet account immediately**
- ✅ **Single transaction for multiple transfers**
- ✅ **50-90% cheaper gas costs**
- ✅ **Atomic execution (all succeed or all fail)**

See [docs/MULTICALL.md](./docs/MULTICALL.md) for detailed explanation.

### Production Integration

To connect to actual Starknet:

1. Install Starknet dependencies:
```bash
npm install starknet get-starknet-core
```

2. Set environment variable:
```bash
NEXT_PUBLIC_DEMO_MODE=false
```

3. Update `services/multicall.ts` with real implementations using:
   - `get-starknet-core` for wallet connections
   - `starknet.js` for multicall execution
   - Native `account.execute(calls)` for batch transfers

## 📝 Development Roadmap

- [x] Starknet native multicall integration
- [ ] Implement real Starknet wallet connection
- [ ] Add production multicall execution
- [ ] Implement PDF export functionality
- [ ] Add workflow templates
- [ ] Support for NFT batch transfers (using multicall)
- [ ] Multi-token support in single workflow
- [ ] Workflow saving and loading
- [ ] Advanced gas estimation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is created for the Starknet Hackathon 2025.

## 🙏 Acknowledgments

- Inspired by [B4B (Bitcoin4Babies)](https://github.com/yourusername/B4B) project
- Design inspired by OpenAI's workflow builder
- Built for Starknet Hackathon 2025
- UI components from [shadcn/ui](https://ui.shadcn.com/)

## 📧 Contact

For questions or feedback about this project, please open an issue on GitHub.

---

Built with ❤️ for the Starknet community

