# 🔍 Validate Wallet Block

## Overview
The **Validate Wallet** block is a new workflow step that verifies your connected wallet, checks balances, and scans available tokens before proceeding with payment workflows.

## 🎯 Purpose

Before sending payments, you should validate:
- ✅ Wallet address is valid
- ✅ Wallet has sufficient balance
- ✅ Available tokens and their amounts
- ✅ Total portfolio value
- ✅ Wallet type (Account contract)

## 📍 Position in Workflow

```
Connect Wallet
      ↓
Validate Wallet ← NEW! (Optional but recommended)
      ↓
Import CSV Recipients
      ↓
... rest of workflow
```

## ⚙️ Configuration Options

### **1. Validation Type**

#### **Quick Check**
- ✅ Validates address format only
- ⚡ Fastest option
- 📝 Use when: You just need to confirm address is valid

#### **Full Validation** (Recommended)
- ✅ Validates address format
- ✅ Fetches ETH and STRK balances
- ✅ Checks wallet type (contract/EOA)
- 📝 Use when: Standard validation before payments

#### **With Token Scan**
- ✅ Everything in Full Validation
- ✅ Scans ALL tokens (USDC, CHIPPY, etc.)
- ✅ Calculates total USD portfolio value
- 📝 Use when: You need complete token inventory

### **2. Minimum Balance Check**

#### **Skip**
- No balance verification
- Proceeds regardless of balance

#### **Check ETH Only** (Recommended)
- Ensures wallet has ETH for gas fees
- Warns if ETH balance is zero

#### **Check All Tokens**
- Ensures wallet has at least one token
- Useful to confirm wallet is funded

## 🔄 What It Does

### **Validation Process:**

1. **Address Validation**
   - Checks Starknet address format (0x...)
   - Verifies length and hex format

2. **Balance Fetch** (Full/Token Scan modes)
   - Calls Starknet RPC
   - Retrieves token balances
   - Gets current USD values

3. **Token Scan** (Token Scan mode)
   - Scans common tokens (ETH, STRK, USDC, CHIPPY)
   - Can be extended to custom tokens
   - Shows full portfolio

4. **Wallet Type Check**
   - Determines if EOA or Account contract
   - Identifies contract type (ArgentX/Braavos/ChippyPay)

5. **Result Summary**
   - Total USD value
   - Token list with balances
   - Errors (if any)
   - Warnings (if any)

## 📊 Example Output

### **Successful Validation**

```
🔍 Wallet Validation Results
══════════════════════════════════════════════════

✅ Valid Address: Yes
💰 Has Balance: Yes
💵 Total Value: $3,598.23

📊 Tokens Found (4):
   • ETH: 0.5234 ($1,847.23)
   • STRK: 125.50 ($251.00)
   • USDC: 1000.00 ($1,000.00)
   • CHIPPY: 5000.00 ($500.00)

⚠️  Warnings:
   • Wallet is a smart contract (Account Contract - ArgentX)
```

### **Validation with Low Balance**

```
🔍 Wallet Validation Results
══════════════════════════════════════════════════

✅ Valid Address: Yes
💰 Has Balance: No
💵 Total Value: $0.00

📊 Tokens Found (0):
   (No tokens found)

⚠️  Warnings:
   • Wallet has insufficient balance for transactions
   • Consider funding wallet before proceeding
```

### **Invalid Address**

```
🔍 Wallet Validation Results
══════════════════════════════════════════════════

❌ Valid Address: No
💰 Has Balance: No
💵 Total Value: $0.00

❌ Errors:
   • Invalid Starknet address format
```

## 💻 Implementation

### **Service: `validateWallet.ts`**

```typescript
export interface WalletValidationResult {
  isValid: boolean;
  hasBalance: boolean;
  tokens: Token[];
  totalUsdValue: string;
  errors: string[];
  warnings: string[];
}

// Main validation function
validateWallet(
  walletAddress: string,
  validationType: "Quick Check" | "Full Validation" | "With Token Scan",
  minimumBalanceCheck: "Skip" | "Check ETH Only" | "Check All Tokens"
): Promise<WalletValidationResult>
```

### **Current Implementation**

- 🧪 **Mock Data**: Currently uses simulated balances
- 🔄 **Production**: Will integrate with Starknet RPC
- 📡 **API Calls**: `getBalance()`, `call()` for ERC20 tokens

## 🚀 Usage

### **In Workflow Builder**

1. **Connect your wallet** (auto-added)
2. **Look for the hint**: "Next: Drag Validate Wallet or Import CSV Recipients"
3. **Go to Starknet tab**
4. **Drag "Validate Wallet"** to your workflow
5. **Configure options**:
   - Choose validation type
   - Set balance check preference
6. **Continue workflow**

### **When to Use**

✅ **Recommended for:**
- Payment workflows (batch transfers)
- Token operations (swaps, approvals)
- When wallet status is critical

❌ **Skip if:**
- Just testing workflow builder
- Wallet already validated elsewhere
- Performance is critical

## 🔧 Production Integration

### **Starknet RPC Calls**

```typescript
// Get ETH balance
const ethBalance = await provider.getBalance(walletAddress);

// Get ERC20 token balance
const contract = new Contract(ERC20_ABI, tokenAddress, provider);
const balance = await contract.balanceOf(walletAddress);

// Get token decimals
const decimals = await contract.decimals();
```

### **Price Feed**

```typescript
// Fetch USD prices from oracle or API
const prices = await fetch('https://api.coingecko.com/api/v3/simple/price...');
```

### **Wallet Type Detection**

```typescript
// Check if address has deployed code
const code = await provider.getCode(walletAddress);
const isContract = code !== "0x";
```

## 📈 Benefits

### **For Users**
- 🔒 **Safety**: Verify wallet before operations
- 💡 **Transparency**: See exact balances
- ⚡ **Early Detection**: Catch issues before execution
- 📊 **Portfolio View**: Complete token overview

### **For Developers**
- 🐛 **Error Prevention**: Catch invalid addresses early
- 📝 **Logging**: Track validation results
- 🔄 **Reusable**: Validation logic in service
- 🧪 **Testable**: Mock/real modes

## 🎨 UI/UX

### **Block Appearance**
- **Color**: Cyan gradient (cyan-400 to cyan-600)
- **Icon**: CheckCircle ✓
- **Category**: Validation
- **Technology**: Starknet

### **Configuration Panel**
- Dropdown for Validation Type
- Dropdown for Balance Check
- Real-time validation as you configure

### **Execution Display**
- Progress indicator during validation
- Token list with balances
- Success/error messages
- Expandable details

## 🔮 Future Enhancements

- [ ] Custom token list import
- [ ] Multi-chain validation (L1 + L2)
- [ ] Historical balance tracking
- [ ] NFT detection and display
- [ ] DeFi position scanning
- [ ] Gas estimation for workflow
- [ ] Recommended actions based on balance
- [ ] Export validation report

## 📝 Notes

### **Current Status**
- ✅ Block definition added
- ✅ Service implementation (mock)
- ✅ Workflow integration
- ⏳ UI execution (pending)
- ⏳ Real Starknet RPC (pending)

### **Next Steps**
1. Implement execution UI
2. Integrate real Starknet RPC
3. Add price feed integration
4. Test with real wallets
5. Add error handling for network issues

---

**Built for Chippy Pay Workflow Builder** | Starknet Hackathon 2025

