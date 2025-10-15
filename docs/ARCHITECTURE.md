# Chippy Pay Architecture

This document explains the technical architecture of Chippy Pay Workflow Builder.

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│  (Next.js App Router + React Components)                │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Landing     │  │  Workflow    │  │  Visualizer  │  │
│  │  Page        │  │  Builder     │  │  & Logs      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 Service Layer                            │
│  (Business Logic & Blockchain Integration)               │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Multicall   │  │  Batch       │  │  CSV         │  │
│  │  Service     │  │  Transfer    │  │  Service     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Starknet Protocol                           │
│  (Native Account Abstraction)                            │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  User Account (Smart Contract)                   │   │
│  │                                                   │   │
│  │  account.execute([                               │   │
│  │    { to: token, call: transfer(user1, amt1) },  │   │
│  │    { to: token, call: transfer(user2, amt2) },  │   │
│  │    { to: token, call: transfer(user3, amt3) },  │   │
│  │  ])                                              │   │
│  └──────────────────────────────────────────────────┘   │
│                         │                                │
│                         ▼                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │  ERC20 Token Contract                            │   │
│  │  (Receives all transfers atomically)             │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
strakflow/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Landing page
│   ├── workflow/            # Workflow builder page
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
│
├── components/              # React Components
│   ├── WorkflowBuilder.tsx  # Main builder interface
│   ├── WorkflowPiece.tsx    # Draggable workflow blocks
│   ├── WorkflowVisualizer.tsx # Execution monitor
│   ├── ExecuteButton.tsx    # Execution controller
│   ├── BlockInput.tsx       # Block input fields
│   ├── Header.tsx           # App header
│   └── ui/                  # shadcn/ui components
│
├── services/                # Business Logic Layer
│   ├── multicall.ts         # 🌟 Starknet multicall implementation
│   ├── batchTransfer.ts     # Batch processing logic
│   ├── starknet.ts          # Wallet & blockchain integration
│   └── csv.ts               # CSV parsing & export
│
├── constants/               # Configuration
│   └── workflows.ts         # Workflow block definitions
│
├── lib/                     # Utilities
│   ├── config.ts            # Environment configuration
│   └── utils.ts             # Helper functions
│
├── hooks/                   # Custom React Hooks
│   └── use-toast.ts         # Toast notifications
│
├── types.ts                 # TypeScript type definitions
│
└── docs/                    # Documentation
    ├── MULTICALL.md         # 🌟 Multicall explanation
    ├── ARCHITECTURE.md      # This file
    └── ...
```

## 🔄 Data Flow

### 1. Workflow Building

```
User drags blocks
    ↓
WorkflowBuilder component
    ↓
Update chainBlocks state
    ↓
Validate compatibility
    ↓
Render WorkflowPiece components
    ↓
Collect block input values
    ↓
Store in blockValues state
```

### 2. Workflow Execution

```
User clicks Execute
    ↓
ExecuteButton component
    ↓
For each block in workflow:
    ↓
    Simulate execution (demo) OR
    Call service layer (production)
    ↓
    Update progress
    ↓
    Add log entries
    ↓
    Move to next block
    ↓
Generate summary
    ↓
Export report
```

### 3. Batch Transfer (Production)

```
Import CSV recipients
    ↓
Validate addresses
    ↓
Split into optimal batches (30-50 per batch)
    ↓
For each batch:
    ↓
    Prepare multicall:
    prepareTransferCalls() → Call[]
    ↓
    Execute multicall:
    account.execute(calls) → tx_hash
    ↓
    Wait for confirmation:
    checkTransactionStatus() → success/failed
    ↓
    Update recipient statuses
    ↓
    Report progress
    ↓
Generate transaction summary
    ↓
Export report
```

## 🎨 Component Architecture

### WorkflowBuilder

**Responsibility:** Main orchestration component

**State:**
- `chainBlocks` - Array of workflow blocks
- `blockValues` - Configuration values for each block
- `draggedBlock` - Currently dragged block

**Key Functions:**
- `handleDragStart()` - Initiate drag
- `handleDrop()` - Add block to workflow
- `removeBlock()` - Remove block from workflow
- `handleValueChange()` - Update block configuration

### WorkflowVisualizer

**Responsibility:** Display execution status and logs

**State:**
- `logs` - Array of execution log entries
- `currentStep` - Currently executing block index
- `progress` - Overall execution progress (0-100%)
- `isExecuting` - Execution status flag

**Key Functions:**
- `addLog()` - Add new log entry
- `renderBlockValues()` - Display block configurations
- `getFlowStatus()` - Determine workflow status

### ExecuteButton

**Responsibility:** Control workflow execution

**State:**
- `isExecuting` - Execution status

**Key Functions:**
- `executeWorkflow()` - Main execution loop
- `simulateStepExecution()` - Execute/simulate single block

## 🔧 Service Layer

### multicall.ts - 🌟 Core Innovation

**Key Functions:**

1. **prepareTransferCalls()**
   - Converts recipients to Starknet calls
   - Formats amounts as uint256 (low, high)
   - Returns array of Call objects

2. **executeMulticall()**
   - Executes all calls in single transaction
   - Uses `account.execute(calls)`
   - Returns transaction hash

3. **splitIntoBatches()**
   - Splits recipients into optimal batches
   - Considers transaction size limits
   - Balances efficiency vs. safety

4. **calculateOptimalBatchSize()**
   - Determines best batch size
   - Based on total recipient count
   - Returns recommended size

### batchTransfer.ts

**Key Functions:**

1. **executeBatchTransfer()**
   - Main batch processing orchestrator
   - Splits recipients into batches
   - Executes each batch with multicall
   - Handles progress tracking
   - Manages retries and errors

2. **validateRecipients()**
   - Validates addresses and amounts
   - Checks for duplicates
   - Returns validation errors

### starknet.ts

**Key Functions:**

1. **connectWallet()**
   - Connects ArgentX or Braavos
   - Returns wallet address and provider

2. **getBalance()**
   - Checks token balance
   - Returns formatted balance

3. **approveToken()**
   - Approves token spending
   - Returns transaction hash

4. **checkTransactionStatus()**
   - Monitors transaction confirmation
   - Returns pending/success/failed

### csv.ts

**Key Functions:**

1. **parseCSV()**
   - Parses CSV file with PapaParse
   - Validates required fields
   - Returns array of recipients

2. **exportTransactionReport()**
   - Generates report in CSV/JSON/PDF
   - Downloads file to user

## 🎯 Workflow Block System

### Block Definition

```typescript
interface BlockType {
  id: string;              // Unique identifier
  name: string;            // Display name
  color: string;           // Gradient colors
  icon: LucideIcon;        // Icon component
  description: string;     // Help text
  category: string;        // Block category
  technology: string;      // Technology group
  inputs?: InputConfig[];  // Configuration inputs
  compatibleWith: string[]; // Next compatible blocks
  isLoop?: boolean;        // Loop indicator
}
```

### Compatibility System

Each block defines which blocks can follow it:

```typescript
{
  id: "connect_wallet",
  compatibleWith: ["import_csv"]
}
↓
{
  id: "import_csv",
  compatibleWith: ["validate_addresses"]
}
↓
{
  id: "validate_addresses",
  compatibleWith: ["check_balance"]
}
```

This creates a **directed graph** of valid workflows.

## 🔐 Security Considerations

### 1. Input Validation

```typescript
// Address validation
if (!address.startsWith("0x") || address.length !== 66) {
  throw new Error("Invalid Starknet address");
}

// Amount validation
if (parseFloat(amount) <= 0) {
  throw new Error("Amount must be positive");
}
```

### 2. Balance Checks

```typescript
// Before execution
const totalAmount = recipients.reduce((sum, r) => sum + BigInt(r.amount), 0n);
const balance = await getBalance(address, tokenAddress);
if (balance < totalAmount) {
  throw new Error("Insufficient balance");
}
```

### 3. Atomic Execution

Starknet's multicall ensures:
- All transfers succeed OR all revert
- No partial state
- No fund loss from failed batches

### 4. Demo Mode

```typescript
// Prevent accidental real transactions
if (!config.demoMode && !userConfirmed) {
  throw new Error("Please confirm you want to execute on mainnet");
}
```

## 📊 Performance Optimizations

### 1. Batch Sizing

```typescript
// Auto-calculate optimal batch size
const batchSize = totalRecipients <= 50 ? totalRecipients : 
                  totalRecipients <= 200 ? 50 : 30;
```

### 2. Parallel Processing

```typescript
// Multiple batches can be prepared in parallel
const batches = splitIntoBatches(recipients);
const preparedCalls = await Promise.all(
  batches.map(batch => prepareTransferCalls(batch, tokenAddress))
);
```

### 3. Progress Tracking

```typescript
// Real-time progress updates
onProgress((completed / total) * 100);
```

### 4. Lazy Loading

- Components loaded on-demand
- Large CSV files streamed
- Logs virtualized for performance

## 🧪 Testing Strategy

### Unit Tests
- Service functions (multicall, csv, validation)
- Helper utilities
- State management

### Integration Tests
- Workflow execution flow
- CSV import/export
- Batch processing

### E2E Tests
- Full workflow creation and execution
- Error handling
- Report generation

### Demo Mode
- Simulated blockchain interactions
- No real transactions
- Full feature testing

## 🚀 Deployment Architecture

### Development
```
Local Machine
    ↓
npm run dev
    ↓
Next.js Dev Server (localhost:3000)
    ↓
Demo Mode (simulated blockchain)
```

### Production
```
Git Repository
    ↓
Vercel/Netlify
    ↓
Build & Deploy
    ↓
CDN (Static Assets)
    ↓
Starknet RPC (Blockchain)
```

## 🔮 Future Enhancements

### 1. Smart Contract Verification
- Verify token contracts before transfer
- Check for scam tokens
- Validate contract security

### 2. Gas Optimization
- Dynamic batch sizing based on gas prices
- Gas price prediction
- Transaction timing optimization

### 3. Advanced Workflows
- Conditional branches
- Parallel execution paths
- Loop conditions

### 4. Multi-Token Support
- Transfer different tokens in one workflow
- Token swaps within workflow
- Cross-chain transfers

---

For more details:
- [Multicall Documentation](./MULTICALL.md)
- [Main README](../README.md)
- [Workflow Guide](../WORKFLOW_GUIDE.md)

