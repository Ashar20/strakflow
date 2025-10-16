# StarkFlow - Visual Workflow Builder for Starknet

<div align="center">

![StarkFlow Logo](https://img.shields.io/badge/StarkFlow-Visual%20Workflow%20Builder-orange?style=for-the-badge&logo=ethereum)

**Drag-and-drop automation builder for Starknet ecosystem**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Starknet](https://img.shields.io/badge/Starknet-Validated-green.svg)](https://starknet.io/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-Contracts-blue.svg)](https://www.openzeppelin.com/)

</div>

## 🚀 Inspiration

We were inspired by how no-code tools like Zapier and Buildspace automate complex workflows off-chain. We wanted to bring that same power to the Starknet ecosystem—where anyone, regardless of coding background, can visually create, deploy, and automate on-chain actions like minting NFTs, deploying tokens, or running AI-generated contracts.

## ✨ What it does

StarkFlow is a drag-and-drop automation builder for Starknet. It allows users to create complete on-chain workflows—from deploying and minting contracts to performing swaps or batch payments—without writing a single line of code. Each block represents a Starknet action, and connecting them builds a fully executable flow that can be deployed instantly.

### Key Features

- 🎨 **Visual Workflow Builder** - Intuitive drag-and-drop interface
- 🔗 **Cross-Chain Swaps** - Powered by Atomiq for Bitcoin, Solana, and Starknet
- 💰 **Batch Payments** - Chipi Pay integration for efficient token distribution
- 🏗️ **Smart Contract Deployment** - OpenZeppelin-based ERC-20 and NFT contracts
- 🤖 **AI-Powered Blocks** - Generate custom Cairo contracts with natural language
- 📊 **Real-time Monitoring** - Track workflow execution and transaction status

## 🛠️ How we built it

### Frontend
- **Next.js 15** with React 19 for the main application
- **React Flow** for the visual workflow builder
- **Tailwind CSS** for modern, responsive UI design
- **Radix UI** components for accessible interface elements
- **TypeScript** for type safety and better developer experience

### Backend
- **Python Flask** for API endpoints and contract management
- **Starknet.py** for Starknet integration and transaction handling
- **Scarb** and **sncast** for Cairo contract compilation and deployment
- **OpenZeppelin Contracts** for secure, audited smart contract templates

### Key Integrations
- **Atomiq SDK** - Cross-chain atomic swaps between Bitcoin, Solana, and Starknet
- **Chipi Pay** - Batch payment processing and wallet management
- **OpenZeppelin** - Standardized, secure smart contract implementations
- **Clerk** - Authentication and user management

## 🏗️ Architecture

```
StarkFlow/
├── app/                    # Next.js application
│   ├── api/               # API routes
│   ├── workflow/          # Workflow builder page
│   └── atomic-swap/       # Atomic swap interface
├── backend/               # Python Flask backend
│   ├── app.py            # Main Flask application
│   ├── token-contract/   # ERC-20 token contracts
│   ├── openzeppelin-nft/ # NFT contract templates
│   └── contract-deployment/ # Dynamic contract deployment
├── components/            # React components
│   ├── WorkflowBuilder.tsx    # Main workflow interface
│   ├── WorkflowPiece.tsx      # Individual workflow blocks
│   └── AtomicSwapWalletSelector.tsx # Cross-chain wallet management
├── services/              # Business logic services
│   ├── atomicSwap.ts     # Atomiq integration
│   ├── chippiWalletCreation.ts # Chipi Pay wallet management
│   └── contractBuilder.ts # Smart contract deployment
└── constants/             # Configuration and constants
    ├── workflows.ts      # Workflow block definitions
    └── atomicSwapBlocks.ts # Atomic swap specific blocks
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Starknet wallet (ArgentX, Braavos, etc.)

### Frontend Setup
```bash
# Clone the repository
git clone https://github.com/your-username/starkflow.git
cd starkflow

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your configuration

# Start the development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp ../env.example .env
# Edit .env with your configuration

# Start the Flask server
python app.py
```

### Environment Variables
```env
# Starknet Configuration
NEXT_PUBLIC_STARKNET_RPC_URL=https://starknet-sepolia.public.blastapi.io/rpc/v0_8
NEXT_PUBLIC_STARKNET_NETWORK=SEPOLIA

# Atomiq Configuration
NEXT_PUBLIC_ATOMIQ_API_KEY=your_atomiq_api_key
NEXT_PUBLIC_BITCOIN_NETWORK=TESTNET
NEXT_PUBLIC_SOLANA_NETWORK=DEVNET

# Chipi Pay Configuration
NEXT_PUBLIC_CHIPI_API_KEY=your_chipi_api_key
NEXT_PUBLIC_CHIPI_BASE_URL=https://api.chipi.com

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

## 🎯 Usage

### Creating a Workflow
1. **Connect Wallet** - Link your Starknet wallet or create a Chipi Pay wallet
2. **Add Blocks** - Drag and drop workflow blocks from the sidebar
3. **Configure Blocks** - Set parameters for each block (token addresses, amounts, etc.)
4. **Connect Blocks** - Link blocks to create your workflow
5. **Execute** - Run the workflow and monitor real-time execution

### Available Workflow Blocks

#### Wallet Management
- **Connect Wallet** - Link Starknet or Chipi Pay wallets
- **Create Chipi Wallet** - Generate new Chipi Pay wallets
- **Derive Address** - Generate wallet addresses

#### Token Operations
- **Transfer Token** - Send tokens to recipients
- **Batch Transfer** - Send tokens to multiple addresses
- **Create Token** - Deploy new ERC-20 tokens
- **Mint NFT** - Create and mint NFT collections

#### Cross-Chain Operations
- **Atomic Swap** - Exchange tokens across Bitcoin, Solana, and Starknet
- **Cross-Chain Transfer** - Move assets between chains

#### Utility Blocks
- **Validate Receiver** - Check address validity
- **CSV Import** - Import recipient lists
- **Transaction Summary** - Generate execution reports

## 🔗 Integrations

### Atomiq - Cross-Chain Swaps
StarkFlow integrates with Atomiq to enable seamless atomic swaps between:
- **Bitcoin Testnet** - For BTC transactions
- **Solana Devnet** - For SOL and SPL token swaps
- **Starknet Sepolia** - For STRK and ERC-20 tokens

**Example Transaction:**
- [Starknet Transaction](https://sepolia.voyager.online/tx/0x70be0f2d428287d8a9b8b274a9ae7fa0f6ab92fe0bf28c6f0ede1ebfdd00114)
- [Bitcoin Transaction](https://blockstream.info/testnet/tx/fe8e2f4f197ecd65c68f5f7f960ab1bb6bc009cda1bd54897ceba8b4deb9e8ce)

### Chipi Pay - Batch Payments
- **Wallet Creation** - Generate secure, non-custodial wallets
- **Batch Processing** - Efficient multi-recipient transactions
- **Fee Optimization** - Minimize transaction costs
- **Real-time Monitoring** - Track payment status

### OpenZeppelin - Smart Contracts
All deployed contracts use OpenZeppelin's audited templates:
- **ERC-20 Tokens** - Standard fungible token implementation
- **ERC-721 NFTs** - Non-fungible token collections
- **Access Control** - Role-based permissions
- **Security Features** - Reentrancy protection, overflow checks

## 🚧 Challenges we ran into

1. **Starknet Tooling Integration** - Managing the complexity of Starknet tooling, especially with asynchronous deployments and fee estimation
2. **Flow Engine Design** - Creating a flexible flow engine that could translate visual nodes into real Starknet transactions
3. **Cross-Chain Complexity** - Ensuring composability across different contract templates while keeping execution deterministic
4. **Real-time Synchronization** - Maintaining state consistency across multiple blockchain networks

## 🏆 Accomplishments we're proud of

- ✅ **Working Prototype** - Fully functional visual workflow builder
- ✅ **Cross-Chain Integration** - Seamless swaps between Bitcoin, Solana, and Starknet
- ✅ **AI-Powered Contracts** - Dynamic contract generation from natural language
- ✅ **Batch Processing** - Efficient multi-recipient payments via Chipi Pay
- ✅ **OpenZeppelin Integration** - Secure, audited smart contract deployment
- ✅ **Real-time Monitoring** - Live transaction tracking and status updates

## 📚 What we learned

- **Starknet Orchestration** - How to orchestrate Starknet tooling in a user-friendly environment
- **Modular Design** - The importance of modular contract design for composability
- **AI Integration** - How natural language can accelerate blockchain development
- **Automation Benefits** - How automation can simplify complex on-chain processes without compromising transparency

## 🔮 What's next for StarkFlow

### Short Term
- **Flow Marketplace** - Share and reuse StarkFlow templates
- **On-Chain Scheduling** - Automated recurring workflow execution
- **Enhanced AI** - More sophisticated contract generation capabilities

### Long Term
- **Multi-L2 Support** - Expand beyond Starknet to other L2 networks
- **Advanced Analytics** - Comprehensive workflow performance metrics
- **Enterprise Features** - Team collaboration and permission management
- **Mobile App** - Native iOS and Android applications

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Starknet Foundation** - For the amazing ecosystem and developer tools
- **Atomiq Labs** - For cross-chain swap infrastructure
- **Chipi Pay** - For batch payment solutions
- **OpenZeppelin** - For secure smart contract templates
- **React Flow** - For the visual workflow builder framework

## 📞 Contact

- **Website**: [starkflow.dev](https://starkflow.dev)
- **Twitter**: [@StarkFlowDev](https://twitter.com/StarkFlowDev)
- **Discord**: [StarkFlow Community](https://discord.gg/starkflow)
- **Email**: hello@starkflow.dev

---

<div align="center">

**Built with ❤️ for the Starknet Hackathon**

*Making blockchain automation accessible to everyone*

</div>
