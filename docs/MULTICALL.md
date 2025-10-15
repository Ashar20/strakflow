# Starknet Native Multicall for Batch Transfers

This document explains how Chippy Pay uses Starknet's native multicall feature for efficient batch token transfers.

## 🎯 What is Multicall?

Multicall is Starknet's **native Account Abstraction** feature that allows multiple contract calls to be executed in a single transaction.

### Without Multicall (Traditional Approach):
```
Transfer to User1 → Transaction 1 → Gas Fee 1
Transfer to User2 → Transaction 2 → Gas Fee 2
Transfer to User3 → Transaction 3 → Gas Fee 3
...
Transfer to User100 → Transaction 100 → Gas Fee 100

Total: 100 transactions, 100 gas fees, 100 confirmations
```

### With Multicall (Starknet Native):
```
[Transfer to User1, User2, User3, ..., User100] → 1 Transaction → 1 Gas Fee

Total: 1 transaction, 1 gas fee, 1 confirmation
```

## 🌟 Why Starknet's Multicall is Superior

### Comparison with ERC-4337 (Ethereum)

| Feature | ERC-4337 (Ethereum) | Starknet Native AA |
|---------|---------------------|-------------------|
| **Implementation** | Smart contract layer | Built into protocol |
| **Deployment** | Requires EntryPoint contract | No deployment needed |
| **Gas Efficiency** | Uses bundlers, extra overhead | Direct protocol optimization |
| **Flexibility** | Limited by standard | Full protocol access |
| **Complexity** | Multiple components (bundler, paymaster, etc.) | Simple account.execute() |
| **Compatibility** | Ethereum & EVMs | Starknet only |

### Key Advantages:

1. **No Custom Contract Needed** ✅
   - Works with any Starknet account immediately
   - No deployment, no maintenance
   - No security audits required

2. **Better Gas Efficiency** 💰
   - Single transaction fee for multiple operations
   - Protocol-level optimization
   - 50-90% cheaper than individual transactions

3. **Atomic Execution** 🔒
   - All transfers succeed or all fail
   - No partial execution states
   - Better error handling

4. **Simpler Implementation** 🎯
   - One function call: `account.execute(calls)`
   - Native SDK support
   - Less code, fewer bugs

5. **Better UX** 👥
   - One signature approval
   - One transaction to monitor
   - Faster overall execution

## 🔧 How It Works

### Architecture

```
┌─────────────────────────────────────────┐
│         User's Starknet Account         │
│      (Every account is a contract!)     │
└─────────────────┬───────────────────────┘
                  │
                  │ Single Transaction
                  │
                  ▼
┌─────────────────────────────────────────┐
│           account.execute()              │
│  ┌─────────────────────────────────┐    │
│  │ Call 1: transfer(user1, 100)    │    │
│  │ Call 2: transfer(user2, 200)    │    │
│  │ Call 3: transfer(user3, 150)    │    │
│  │ ...                              │    │
│  │ Call N: transfer(userN, amount) │    │
│  └─────────────────────────────────┘    │
└─────────────────┬───────────────────────┘
                  │
                  │ All executed atomically
                  │
                  ▼
┌─────────────────────────────────────────┐
│          ERC20 Token Contract            │
│   (Receives all transfer calls)         │
└─────────────────────────────────────────┘
```

### Code Example

```typescript
import { Account, Call } from "starknet";

// Prepare calls for each transfer
const calls: Call[] = recipients.map(recipient => ({
  contractAddress: tokenAddress, // ERC20 token
  entrypoint: 'transfer',        // Function to call
  calldata: [
    recipient.address,           // Transfer to
    recipient.amount,            // Amount (low 128 bits)
    '0'                          // Amount (high 128 bits)
  ]
}));

// Execute ALL transfers in ONE transaction
const result = await account.execute(calls);

console.log(`All transfers executed in tx: ${result.transaction_hash}`);
```

## 📊 Performance Comparison

### Gas Costs (Example: 50 Recipients)

#### Individual Transfers:
```
50 transfers × ~30,000 gas each = 1,500,000 gas
At 100 gwei = 0.15 ETH (~$300)
```

#### Multicall:
```
1 transaction × ~200,000 gas = 200,000 gas
At 100 gwei = 0.02 ETH (~$40)
```

**Savings: 87% reduction in gas costs!** 💰

### Execution Time (Example: 50 Recipients)

#### Individual Transfers:
```
50 transactions × 10 seconds = 500 seconds (~8 minutes)
```

#### Multicall:
```
1 transaction × 10 seconds = 10 seconds
```

**Savings: 98% faster!** ⚡

## 🚀 Implementation in Chippy Pay

### File Structure

```
services/
├── multicall.ts          # Multicall implementation
├── batchTransfer.ts      # Batch transfer logic
└── starknet.ts          # Starknet wallet integration
```

### Key Functions

#### 1. Prepare Transfer Calls

```typescript
// services/multicall.ts
export const prepareTransferCalls = (
  recipients: Array<{ address: string; amount: string }>,
  tokenAddress: string
): Call[] => {
  return recipients.map((recipient) => {
    const amountBigInt = BigInt(recipient.amount);
    const low = (amountBigInt & BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")).toString();
    const high = (amountBigInt >> BigInt(128)).toString();

    return {
      contractAddress: tokenAddress,
      entrypoint: "transfer",
      calldata: [recipient.address, low, high],
    };
  });
};
```

#### 2. Execute Multicall

```typescript
// services/multicall.ts
export const executeMulticall = async (
  calls: Call[]
): Promise<{ transactionHash: string }> => {
  // In production:
  const account: Account = ... // from wallet
  const result = await account.execute(calls);
  return { transactionHash: result.transaction_hash };
};
```

#### 3. Batch Processing

```typescript
// services/batchTransfer.ts
export const executeBatchTransfer = async (
  recipients: Recipient[],
  tokenAddress: string,
  batchSize: number = 50
) => {
  // Split into optimal batches
  const batches = splitIntoBatches(recipients, batchSize);

  // Process each batch with multicall
  for (const batch of batches) {
    const calls = prepareTransferCalls(batch, tokenAddress);
    const { transactionHash } = await executeMulticall(calls);
    // ... handle results
  }
};
```

## 🎨 Workflow Integration

### Chippy Pay Workflow Blocks

1. **Connect Wallet** → Connects Starknet account (already a smart contract!)
2. **Import CSV** → Load recipient list
3. **Validate Addresses** → Check all addresses
4. **Check Balance** → Verify sufficient funds
5. **Approve Token** → One-time approval
6. **Loop through Recipients** → Split into batches
7. **Batch Transfer** → ✨ **Uses Multicall Here!** ✨
8. **Check Tx Status** → Monitor single transaction per batch
9. **Transaction Summary** → Report results
10. **Export Report** → Download summary

## 🔍 Optimal Batch Sizing

### Automatic Calculation

```typescript
export const calculateOptimalBatchSize = (totalRecipients: number): number => {
  if (totalRecipients <= 50) {
    return totalRecipients;  // All in one transaction
  } else if (totalRecipients <= 200) {
    return 50;               // Chunks of 50
  } else {
    return 30;               // Chunks of 30 for safety
  }
};
```

### Considerations:

- **Transaction Size Limit**: Starknet has limits on calldata size
- **Gas Estimation**: Larger batches may have unpredictable gas
- **Risk Management**: Smaller batches = safer but more transactions
- **Network Conditions**: Adjust based on network congestion

### Recommended Batch Sizes:

| Recipients | Batch Size | Transactions | Reason |
|-----------|-----------|-------------|--------|
| 1-50 | All at once | 1 | Optimal efficiency |
| 51-200 | 50 | 2-4 | Good balance |
| 201-500 | 30-50 | 7-17 | Safety first |
| 500+ | 30 | 17+ | Maximum safety |

## 🛡️ Error Handling

### Atomic Execution

If ANY transfer in a multicall fails, ALL transfers revert:

```typescript
try {
  const result = await executeMulticall(calls);
  // All transfers succeeded
} catch (error) {
  // All transfers reverted
  // No partial state!
}
```

### Retry Strategy

```typescript
// Retry failed batches
for (let attempt = 0; attempt < maxRetries; attempt++) {
  try {
    const result = await executeMulticall(calls);
    break; // Success!
  } catch (error) {
    if (attempt === maxRetries - 1) throw error;
    await delay(retryDelay);
  }
}
```

## 💡 Best Practices

### 1. Gas Estimation

```typescript
// Always estimate before execution
const estimate = await estimateMulticallGas(calls);
console.log(`Estimated gas: ${estimate.gasEstimate}`);
console.log(`Estimated fee: ${estimate.feeEstimate}`);
```

### 2. Balance Check

```typescript
// Verify sufficient balance for all transfers
const totalAmount = recipients.reduce(
  (sum, r) => sum + BigInt(r.amount), 
  BigInt(0)
);
const balance = await getBalance(account.address, tokenAddress);
if (BigInt(balance) < totalAmount) {
  throw new Error("Insufficient balance");
}
```

### 3. Approval Check

```typescript
// Ensure token approval is sufficient
const allowance = await checkAllowance(
  tokenAddress,
  account.address,
  account.address
);
if (BigInt(allowance) < totalAmount) {
  await approveToken(tokenAddress, totalAmount);
}
```

### 4. Progress Tracking

```typescript
// Update UI with progress
for (let i = 0; i < batches.length; i++) {
  const batch = batches[i];
  await processBatch(batch);
  onProgress((i + 1) / batches.length * 100);
}
```

## 🎓 Learn More

### Resources:

1. **Starknet Account Abstraction**
   - [Official Docs](https://docs.starknet.io/documentation/architecture_and_concepts/Accounts/introduction/)
   - [Account Contract](https://github.com/starkware-libs/cairo/blob/main/corelib/src/starknet/account.cairo)

2. **Starknet.js SDK**
   - [Account.execute()](https://www.starknetjs.com/docs/API/account)
   - [Multicall Examples](https://www.starknetjs.com/docs/guides/multicall)

3. **Cairo Smart Contracts**
   - [ERC20 Implementation](https://github.com/OpenZeppelin/cairo-contracts/blob/main/src/token/erc20/erc20.cairo)
   - [Account Abstraction](https://book.starknet.io/ch16-00-account-abstraction.html)

## 🔬 Testing

### Demo Mode

Chippy Pay includes a demo mode for testing without blockchain:

```env
NEXT_PUBLIC_DEMO_MODE=true
```

### Test Scenarios

1. **Small Batch** (5 recipients) - Verify basic functionality
2. **Medium Batch** (50 recipients) - Test optimal single-transaction
3. **Large Batch** (200 recipients) - Test multi-batch processing
4. **Error Handling** - Test with invalid addresses, insufficient balance
5. **Gas Estimation** - Verify accurate gas calculations

## 🚀 Production Deployment

### Checklist:

- [ ] Set `NEXT_PUBLIC_DEMO_MODE=false`
- [ ] Configure Starknet RPC URL
- [ ] Test on Sepolia testnet first
- [ ] Verify token addresses for mainnet
- [ ] Set appropriate batch sizes
- [ ] Configure error reporting
- [ ] Set up transaction monitoring
- [ ] Test with small amounts first

## ❓ FAQ

### Q: Do I need to deploy a contract?
**A:** No! Multicall is native to Starknet. Every account already supports it.

### Q: What's the maximum batch size?
**A:** Theoretically unlimited, but we recommend 30-50 for safety and gas predictability.

### Q: Can I use this with any ERC20 token?
**A:** Yes! Works with any standard ERC20 token on Starknet.

### Q: What if one transfer fails?
**A:** All transfers in that multicall batch will revert atomically.

### Q: Is this more expensive than ERC-4337?
**A:** No! It's actually cheaper because it's native to the protocol with no bundler overhead.

### Q: Can I use this for NFTs?
**A:** Yes! Replace `transfer` with `transferFrom` and adjust the calldata.

---

**Built with ❤️ for the Starknet community**

For questions or contributions, check our [GitHub repository](../README.md).

