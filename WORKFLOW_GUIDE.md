# Chippy Pay Workflow Guide

This guide explains how to use the Chippy Pay Workflow Builder to create and execute batch payment workflows on Starknet.

## 📖 Table of Contents

1. [Overview](#overview)
2. [Workflow Blocks](#workflow-blocks)
3. [Creating Your First Workflow](#creating-your-first-workflow)
4. [Best Practices](#best-practices)
5. [Troubleshooting](#troubleshooting)

## Overview

The Chippy Pay Workflow Builder uses a visual, drag-and-drop interface to create complex payment workflows. Each workflow consists of multiple **blocks** that execute sequentially.

### Key Concepts

- **Blocks**: Individual steps in your workflow (e.g., Connect Wallet, Import CSV)
- **Compatibility**: Blocks can only be connected if they're compatible
- **Loop Blocks**: Special blocks that repeat operations (e.g., processing multiple batches)
- **Execution**: Workflows run from top to bottom, executing each block in order

## Workflow Blocks

### 1. Connect Wallet 🔌
**Category**: Wallet  
**Technology**: Starknet

Connects your Starknet wallet to the application.

**Configuration**:
- **Wallet Type**: Choose between ArgentX or Braavos

**Compatible With**: Import CSV Recipients

---

### 2. Import CSV Recipients 📁
**Category**: Import  
**Technology**: CSV

Uploads a CSV file containing recipient addresses and amounts.

**Configuration**:
- **CSV File**: Upload your recipient list

**CSV Format**:
```csv
address,amount
0x0742...56e8a,100
0x0843...56f9b,200
```

**Compatible With**: Validate Addresses

---

### 3. Validate Addresses ✅
**Category**: Validation  
**Technology**: Starknet

Validates that all recipient addresses are valid Starknet addresses.

**Configuration**:
- **Validation Level**: 
  - Basic: Quick format check
  - Strict: Detailed format validation
  - With Balance Check: Validate format and check if addresses exist

**Compatible With**: Check Balance

---

### 4. Check Balance 💰
**Category**: Balance  
**Technology**: Starknet

Verifies your wallet has sufficient balance for all transfers.

**Configuration**:
- **Token Address**: Address of the token to transfer (ETH, STRK, or custom)
- **Gas Buffer (%)**: Extra percentage to reserve for gas fees (default: 10%)

**Compatible With**: Approve Token

---

### 5. Approve Token 🔐
**Category**: Approval  
**Technology**: Starknet

Approves the payment contract to spend tokens from your wallet.

**Configuration**:
- **Approval Type**:
  - Exact Amount: Approve only the total amount needed
  - Unlimited: Approve unlimited spending (not recommended)

**Compatible With**: Loop through Recipients

---

### 6. Loop through Recipients 🔄
**Category**: Transfer  
**Technology**: ChippyPay  
**Special**: Loop Block

Iterates through all recipients, processing them in batches.

**Configuration**:
- **Batch Size**: Number of recipients to process per batch (default: 10)
- **Delay Between Batches (ms)**: Wait time between batches (default: 1000ms)

**Compatible With**: Batch Transfer

---

### 7. Batch Transfer 📤
**Category**: Transfer  
**Technology**: ChippyPay

Executes the actual token transfer to recipients.

**Configuration**:
- **Execution Mode**:
  - Sequential: Process transfers one at a time (safer)
  - Parallel: Process multiple transfers simultaneously (faster)

**Compatible With**: Check Transaction Status

---

### 8. Check Transaction Status ⏱️
**Category**: Monitoring  
**Technology**: Starknet

Monitors transaction status and waits for confirmations.

**Configuration**:
- **Max Retries**: Maximum number of status check attempts (default: 5)
- **Retry Delay (ms)**: Wait time between status checks (default: 3000ms)

**Compatible With**: Transaction Summary, Loop through Recipients (for retry logic)

---

### 9. Transaction Summary 📊
**Category**: Reporting  
**Technology**: Reporting

Generates a comprehensive summary of all transactions.

**Configuration**:
- **Summary Format**:
  - Detailed: Full breakdown with all transaction details
  - Compact: Summary statistics only

**Compatible With**: Export Report

---

### 10. Export Report 💾
**Category**: Reporting  
**Technology**: Reporting

Exports the transaction report to a file.

**Configuration**:
- **Export Format**: CSV, JSON, or PDF
- **Filename**: Name for the exported file (default: transaction-report)

**Compatible With**: None (end of workflow)

---

## Creating Your First Workflow

### Simple Payment Workflow

Here's a basic workflow to send tokens to multiple recipients:

```
[Start]
  ↓
[Connect Wallet]
  ↓
[Import CSV Recipients]
  ↓
[Validate Addresses]
  ↓
[Check Balance]
  ↓
[Approve Token]
  ↓
[Loop through Recipients]
  ↳ [Batch Transfer]
  ↳ [Check Transaction Status]
  ↓
[Transaction Summary]
  ↓
[Export Report]
  ↓
[End]
```

### Step-by-Step Instructions

1. **Open the Workflow Builder**
   - Navigate to `/workflow` page
   - You'll see "Available Workflow Blocks" at the top

2. **Add Connect Wallet Block**
   - Drag "Connect Wallet" from the Starknet tab
   - Drop it into "Your Workflow" area
   - Select your wallet type (ArgentX or Braavos)

3. **Add Import CSV Block**
   - Drag "Import CSV Recipients" from the CSV tab
   - Drop it after the Connect Wallet block
   - Upload your CSV file with recipients

4. **Add Validation Block**
   - Drag "Validate Addresses" from the Starknet tab
   - Choose validation level (Strict recommended)

5. **Add Balance Check**
   - Drag "Check Balance" from the Starknet tab
   - Enter the token address you want to send
   - Set gas buffer (10% recommended)

6. **Add Token Approval**
   - Drag "Approve Token" from the Starknet tab
   - Choose "Exact Amount" for security

7. **Add Loop Block**
   - Drag "Loop through Recipients" from the ChippyPay tab
   - Set batch size (10-50 recommended)
   - Set delay between batches (1000ms recommended)

8. **Add Batch Transfer**
   - Drag "Batch Transfer" from the ChippyPay tab
   - This will be executed within the loop
   - Choose Sequential for safety or Parallel for speed

9. **Add Status Check**
   - Drag "Check Transaction Status" from the Starknet tab
   - Set max retries to 5
   - Set retry delay to 3000ms

10. **Add Summary**
    - Drag "Transaction Summary" from the Reporting tab
    - Choose Detailed format

11. **Add Export Report**
    - Drag "Export Report" from the Reporting tab
    - Choose CSV format
    - Set filename

12. **Execute**
    - Click "Execute Workflow" button
    - Watch the progress in real-time
    - Check execution logs for details

## Best Practices

### Security
- ✅ Always use "Exact Amount" for token approval
- ✅ Validate your CSV file before uploading
- ✅ Test with small amounts first
- ✅ Use "Strict" validation level
- ❌ Never share your private keys
- ❌ Don't use "Unlimited" approval on mainnet

### Performance
- ✅ Use batch sizes between 10-50 recipients
- ✅ Add delays between batches (1000-3000ms)
- ✅ Use "Sequential" mode for reliability
- ✅ Monitor gas fees before execution
- ❌ Don't set batch size too large (>100)
- ❌ Don't skip validation steps

### CSV Preparation
- ✅ Verify all addresses are correct
- ✅ Check amounts have correct decimals
- ✅ Remove duplicate addresses
- ✅ Test with sample CSV first
- ❌ Don't use Excel number formatting
- ❌ Don't include invalid characters

### Error Handling
- ✅ Set appropriate retry limits
- ✅ Monitor execution logs
- ✅ Export reports after completion
- ✅ Keep backup of recipient lists
- ❌ Don't ignore validation errors
- ❌ Don't retry indefinitely

## Troubleshooting

### Common Issues

#### "Block not compatible" Error
**Problem**: You're trying to add a block that doesn't follow the previous one.

**Solution**: Check the compatibility guide above. Each block can only connect to specific next blocks.

---

#### CSV Import Fails
**Problem**: CSV file format is incorrect.

**Solution**: 
- Ensure first row has headers: `address,amount`
- Verify addresses start with `0x`
- Check amounts are positive numbers
- Use the sample CSV in `/public/sample-recipients.csv` as reference

---

#### Validation Fails
**Problem**: Some addresses don't pass validation.

**Solution**:
- Starknet addresses must be 66 characters (0x + 64 hex chars)
- Remove any spaces or special characters
- Check for duplicate addresses
- Verify addresses are correct network (mainnet/testnet)

---

#### Insufficient Balance
**Problem**: Wallet doesn't have enough tokens.

**Solution**:
- Check token balance in your wallet
- Include gas fee buffer (10%)
- Reduce batch size or split into multiple workflows
- Ensure you're checking the correct token address

---

#### Transaction Fails
**Problem**: Transaction reverts or fails.

**Solution**:
- Check network status
- Verify gas fees are sufficient
- Ensure token approval is complete
- Try reducing batch size
- Check wallet connection is stable

---

#### Export Not Working
**Problem**: Can't download the report.

**Solution**:
- Check browser allows downloads
- Disable popup blockers
- Try different export format (CSV vs JSON)
- Check browser console for errors

---

## Advanced Features

### Loop Optimization

For large recipient lists (>100), optimize your loop:

```
Batch Size: 20
Delay: 2000ms
Max Retries: 3
```

This configuration balances speed and reliability.

### Gas Optimization

To minimize gas fees:

1. Use larger batch sizes (30-50)
2. Use "Parallel" execution mode
3. Execute during low-traffic periods
4. Consider gas buffer based on network congestion

### Workflow Templates

Common workflow patterns:

**Simple Send**:
```
Connect → Import → Validate → Balance → Approve → Loop → Transfer → Status → Summary → Export
```

**With Retry Logic**:
```
Connect → Import → Validate → Balance → Approve → Loop → Transfer → Status → [if failed] → Loop → Summary → Export
```

**Multi-Token**:
```
Create separate workflows for each token type
```

## Need Help?

- 📖 Check the main [README.md](./README.md)
- 🐛 Report issues on GitHub
- 💬 Join our community discussions
- 📧 Contact support

---

**Happy Workflow Building! 🚀**

