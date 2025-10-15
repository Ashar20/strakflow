# 💼 Wallet Info Panel - Complete Guide

## 🎯 **Overview**
Added a comprehensive wallet information panel that displays your wallet balance, tokens, and quick actions after connecting your Chippi Pay wallet.

## ✨ **Features**

### 📊 **Wallet Dashboard**
- **Wallet Address**: Full address with copy and view on explorer buttons
- **Wallet Type**: Shows your connection type (Chippi Pay SDK)
- **Total Balance**: Combined USD value of all tokens
- **Token List**: All tokens in your wallet with balances

### 🪙 **Token Display**
Shows real-time balances for:
- **ETH** (Ethereum)
- **STRK** (Starknet Token)
- **USDC** (USD Coin)
- **CHIPPY** (Chippy Pay Token) - highlighted

Each token shows:
- Token symbol and name
- Balance amount
- USD equivalent value
- Color-coded icons

### 🔄 **Interactive Features**

1. **Collapsible Panel**
   - Click header to expand/collapse
   - Saves screen space when building workflows

2. **Copy Address**
   - One-click copy to clipboard
   - Visual confirmation with checkmark

3. **View on Explorer**
   - Opens StarkScan in new tab
   - View transactions and history

4. **Refresh Balances**
   - Manual refresh button
   - Updates all token balances

5. **Quick Actions**
   - **Receive**: Show QR code / address
   - **Send**: Quick send tokens

## 🎨 **UI Design**

### **Layout**
```
┌─────────────────────────────────────────────────────┐
│  Left Sidebar (1/3)      │  Main Area (2/3)        │
│  ┌──────────────────┐    │  ┌──────────────────┐   │
│  │  Wallet Info     │    │  │  Workflow Builder│   │
│  │  ─────────────   │    │  │                  │   │
│  │  Address         │    │  │  Available Blocks│   │
│  │  Type            │    │  │                  │   │
│  │  Total Balance   │    │  │  Your Workflow   │   │
│  │  ─────────────   │    │  │                  │   │
│  │  Tokens:         │    │  └──────────────────┘   │
│  │  • ETH           │    │                          │
│  │  • STRK          │    │                          │
│  │  • USDC          │    │                          │
│  │  • CHIPPY        │    │                          │
│  │  ─────────────   │    │                          │
│  │  [Receive][Send] │    │                          │
│  └──────────────────┘    │                          │
└─────────────────────────────────────────────────────┘
```

### **Styling**
- **Neobrutalism Design**: Bold borders, shadows
- **Color Coding**: Each token has unique color
- **Hover Effects**: Interactive shadows and transforms
- **CHIPPY Token**: Special purple highlight

## 🔧 **Technical Implementation**

### **Component: `WalletInfo.tsx`**

```typescript
interface Token {
  symbol: string;        // ETH, STRK, USDC, CHIPPY
  name: string;          // Full name
  balance: string;       // Amount held
  usdValue?: string;     // USD equivalent
  contractAddress?: string; // Starknet contract
}

interface WalletInfoProps {
  wallet: { 
    address: string;     // Wallet address
    type: string;        // Connection type
  };
}
```

### **Key Functions**

1. **`fetchTokenBalances()`**
   - Currently uses mock data
   - In production: Calls Starknet RPC
   - Fetches real balances from chain

2. **`getTotalUsdValue()`**
   - Sums all token USD values
   - Formats as currency

3. **`copyAddress()`**
   - Copies to clipboard
   - Shows confirmation

## 📡 **Integration with Starknet (Production)**

### **Real Balance Fetching**

Replace mock data with real Starknet calls:

```typescript
const fetchTokenBalances = async () => {
  setIsLoading(true);
  
  try {
    // Get ETH balance
    const ethBalance = await provider.getBalance(wallet.address);
    
    // Get ERC20 token balances
    const tokenContracts = [
      { address: "0x04718...", symbol: "STRK" },
      { address: "0x053c9...", symbol: "USDC" },
      { address: "0x...", symbol: "CHIPPY" },
    ];
    
    const balances = await Promise.all(
      tokenContracts.map(async (token) => {
        const contract = new Contract(ERC20_ABI, token.address, provider);
        const balance = await contract.balanceOf(wallet.address);
        return { ...token, balance };
      })
    );
    
    setTokens(balances);
  } catch (error) {
    console.error("Failed to fetch balances:", error);
  }
  
  setIsLoading(false);
};
```

### **Price Feed Integration**

Add real-time USD prices:

```typescript
// Fetch from CoinGecko, Binance, or Starknet oracle
const fetchTokenPrices = async () => {
  const prices = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,starknet&vs_currencies=usd');
  const data = await prices.json();
  
  return {
    ETH: data.ethereum.usd,
    STRK: data.starknet.usd,
    // ... etc
  };
};
```

## 🎯 **User Experience Flow**

### **First View**
1. User connects wallet via Chippi Pay
2. Wallet info panel loads
3. Shows loading spinner
4. Fetches token balances
5. Displays all tokens with USD values

### **Ongoing Use**
1. Panel stays visible while building workflow
2. Can collapse to save space
3. Refresh button updates balances
4. Copy/view explorer for quick access

### **Building Workflows**
1. See available balance before building
2. Check if sufficient funds
3. Know which tokens can be sent
4. Quick reference while configuring blocks

## 💡 **Future Enhancements**

### **Planned Features**
- [ ] Real-time balance updates (WebSocket)
- [ ] Transaction history
- [ ] NFT display
- [ ] Multi-wallet support
- [ ] Wallet switching
- [ ] Gas estimation for workflows
- [ ] Token approval status
- [ ] Recent activity feed

### **Advanced Features**
- [ ] Price charts
- [ ] Portfolio analytics
- [ ] Profit/loss tracking
- [ ] Export transactions
- [ ] Custom token import
- [ ] Hide small balances
- [ ] Sort by value/name

## 🚀 **Testing**

### **Current (Mock Data)**
```bash
# Open workflow page
http://localhost:3000/workflow

# Connect wallet
# See wallet info panel with mock balances:
# - ETH: 0.5234 ($1,847.23)
# - STRK: 125.50 ($251.00)
# - USDC: 1,000.00 ($1,000.00)
# - CHIPPY: 5,000.00 ($500.00)
```

### **Production Testing**
1. Connect real Starknet wallet
2. Verify actual balances shown
3. Test refresh functionality
4. Verify USD values accurate
5. Test copy/explorer links

## 📊 **Mock Data (Current)**

```typescript
const mockTokens: Token[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    balance: "0.5234",
    usdValue: "$1,847.23",
    contractAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  },
  {
    symbol: "STRK",
    name: "Starknet Token",
    balance: "125.50",
    usdValue: "$251.00",
    contractAddress: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    balance: "1,000.00",
    usdValue: "$1,000.00",
    contractAddress: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
  },
  {
    symbol: "CHIPPY",
    name: "Chippy Pay Token",
    balance: "5,000.00",
    usdValue: "$500.00",
    contractAddress: "0x...",
  },
];
```

## ✅ **Benefits**

1. **Transparency**: See exactly what you have
2. **Confidence**: Know balances before sending
3. **Convenience**: Quick access to wallet info
4. **Professional**: Polished, complete UX
5. **Informative**: All key info at a glance

## 🎉 **Result**

Users now have a **complete wallet dashboard** showing:
- ✅ Full wallet details
- ✅ All token balances
- ✅ USD values
- ✅ Quick actions
- ✅ Professional UI
- ✅ Collapsible for focus

---

**Built for Chippy Pay Workflow Builder** | Starknet Hackathon 2025

