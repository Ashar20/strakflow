# Environment Variables Guide

This guide explains all environment variables used in the Chippy Pay Workflow Builder.

## Quick Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Update values** in `.env.local` according to your needs

3. **Restart development server** to apply changes
   ```bash
   npm run dev
   ```

## Environment Files

- `.env.example` - Template with all variables (commit to git)
- `.env.local` - Your local configuration (DO NOT commit)
- `.env.production` - Production configuration (set in hosting platform)

## Variable Types

### Public Variables (NEXT_PUBLIC_*)
- Exposed to the browser
- Use for client-side configuration
- Example: `NEXT_PUBLIC_STARKNET_NETWORK`

### Private Variables
- Server-side only
- Never exposed to browser
- Use for API keys, secrets
- Example: `STARKNET_API_KEY`

## Configuration Sections

### 1. Network Configuration

```env
NEXT_PUBLIC_STARKNET_NETWORK=sepolia
NEXT_PUBLIC_STARKNET_RPC_URL=https://starknet-sepolia.public.blastapi.io
NEXT_PUBLIC_CHAIN_ID=SN_SEPOLIA
```

**Options:**
- `mainnet` - Starknet mainnet (real transactions)
- `sepolia` - Starknet testnet (recommended for development)
- `devnet` - Local development network

**RPC Providers:**
- Public: `https://starknet-sepolia.public.blastapi.io`
- Alchemy: `https://starknet-sepolia.g.alchemy.com/v2/YOUR-API-KEY`
- Infura: `https://starknet-sepolia.infura.io/v3/YOUR-API-KEY`

### 2. Contract Addresses

```env
NEXT_PUBLIC_ETH_TOKEN_ADDRESS=0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7
NEXT_PUBLIC_STRK_TOKEN_ADDRESS=0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d
NEXT_PUBLIC_BATCH_TRANSFER_CONTRACT=0x...
```

**Sepolia Testnet Addresses:**
- ETH: `0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7`
- STRK: `0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d`

**Deploy Your Batch Transfer Contract:**
1. Deploy contract to Starknet
2. Update `NEXT_PUBLIC_BATCH_TRANSFER_CONTRACT`
3. Restart application

### 3. Wallet Configuration

```env
NEXT_PUBLIC_DEFAULT_WALLET=argentx
NEXT_PUBLIC_ENABLE_WALLET_CONNECT=true
```

**Supported Wallets:**
- `argentx` - ArgentX wallet
- `braavos` - Braavos wallet

### 4. Transaction Settings

```env
NEXT_PUBLIC_DEFAULT_BATCH_SIZE=10
NEXT_PUBLIC_DEFAULT_BATCH_DELAY=1000
NEXT_PUBLIC_MAX_RETRY_ATTEMPTS=5
NEXT_PUBLIC_TX_TIMEOUT=300000
```

**Batch Size:**
- Small (1-10): Safer, slower
- Medium (10-30): Balanced
- Large (30-50): Faster, higher risk

**Batch Delay:**
- 1000ms (1 second) - Recommended
- 500ms - Faster but riskier
- 2000ms - Safer but slower

### 5. Feature Flags

```env
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_ENABLE_CSV_VALIDATION=true
NEXT_PUBLIC_ENABLE_ADDRESS_VALIDATION=true
```

**Demo Mode:**
- `true` - Uses simulated transactions (no blockchain)
- `false` - Real blockchain transactions

**Validation:**
- Enable for production
- Can disable for development testing

### 6. API Keys (Optional)

```env
STARKNET_API_KEY=your_api_key
ALCHEMY_API_KEY=your_alchemy_key
INFURA_API_KEY=your_infura_key
```

**When to use:**
- Higher rate limits
- Better reliability
- Production deployments

**Get API Keys:**
- Alchemy: https://www.alchemy.com/
- Infura: https://infura.io/

### 7. Analytics (Optional)

```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_MIXPANEL_TOKEN=your_token
```

**Tracking:**
- User workflows
- Transaction success rates
- Error monitoring

### 8. Development Settings

```env
NEXT_PUBLIC_DEBUG=false
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=false
SENTRY_DSN=your_sentry_dsn
```

**Debug Mode:**
- Logs detailed information to console
- Shows additional UI indicators
- Useful for troubleshooting

## Usage in Code

### Accessing Variables

```typescript
// Client-side (browser)
const network = process.env.NEXT_PUBLIC_STARKNET_NETWORK;
const rpcUrl = process.env.NEXT_PUBLIC_STARKNET_RPC_URL;

// Server-side only
const apiKey = process.env.STARKNET_API_KEY;
```

### Example Service

```typescript
// services/config.ts
export const config = {
  network: process.env.NEXT_PUBLIC_STARKNET_NETWORK || 'sepolia',
  rpcUrl: process.env.NEXT_PUBLIC_STARKNET_RPC_URL,
  ethTokenAddress: process.env.NEXT_PUBLIC_ETH_TOKEN_ADDRESS,
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
};
```

## Environment-Specific Configurations

### Development

```env
NEXT_PUBLIC_STARKNET_NETWORK=sepolia
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_DEBUG=true
```

### Staging

```env
NEXT_PUBLIC_STARKNET_NETWORK=sepolia
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_DEBUG=false
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=true
```

### Production

```env
NEXT_PUBLIC_STARKNET_NETWORK=mainnet
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_DEBUG=false
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=true
SENTRY_DSN=your_production_sentry_dsn
```

## Deployment

### Vercel

1. Go to Project Settings → Environment Variables
2. Add each variable
3. Select environment (Production, Preview, Development)
4. Redeploy

### Netlify

1. Site Settings → Build & deploy → Environment
2. Add variables
3. Trigger new deploy

### Docker

```dockerfile
# Use build args
ARG NEXT_PUBLIC_STARKNET_NETWORK
ARG NEXT_PUBLIC_RPC_URL

# Set environment
ENV NEXT_PUBLIC_STARKNET_NETWORK=$NEXT_PUBLIC_STARKNET_NETWORK
ENV NEXT_PUBLIC_RPC_URL=$NEXT_PUBLIC_RPC_URL
```

## Security Best Practices

### ✅ Do:
- Use `.env.local` for local development
- Add `.env.local` to `.gitignore`
- Use private variables for sensitive data
- Rotate API keys regularly
- Use different keys for dev/prod

### ❌ Don't:
- Commit `.env.local` to git
- Share API keys in public repos
- Use production keys in development
- Hardcode sensitive values
- Use NEXT_PUBLIC_ for secrets

## Troubleshooting

### Variables Not Loading

**Problem:** Environment variables return `undefined`

**Solutions:**
1. Restart dev server: `npm run dev`
2. Check file name: `.env.local` (not `.env`)
3. Verify syntax: `KEY=value` (no spaces around =)
4. Check NEXT_PUBLIC_ prefix for client-side variables

### RPC Connection Fails

**Problem:** Can't connect to Starknet

**Solutions:**
1. Verify RPC URL is correct
2. Check network is running
3. Try alternative RPC provider
4. Verify API key if using private RPC

### Wrong Network

**Problem:** Connected to wrong Starknet network

**Solutions:**
1. Check `NEXT_PUBLIC_STARKNET_NETWORK` value
2. Verify wallet is on same network
3. Match contract addresses to network

## Example Configurations

### Local Development
```bash
# .env.local
NEXT_PUBLIC_STARKNET_NETWORK=sepolia
NEXT_PUBLIC_STARKNET_RPC_URL=https://starknet-sepolia.public.blastapi.io
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_DEBUG=true
```

### Production Ready
```bash
# Set in Vercel/Netlify
NEXT_PUBLIC_STARKNET_NETWORK=mainnet
NEXT_PUBLIC_STARKNET_RPC_URL=https://starknet-mainnet.g.alchemy.com/v2/YOUR-KEY
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_DEBUG=false
STARKNET_API_KEY=your_private_key
SENTRY_DSN=your_sentry_dsn
```

## Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Starknet Networks](https://docs.starknet.io/documentation/architecture_and_concepts/Network_Architecture/network-architecture/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Security Best Practices](https://nextjs.org/docs/basic-features/environment-variables#environment-variable-load-order)

## Questions?

Check:
1. `.env.example` for all available variables
2. This guide for detailed explanations
3. [README.md](./README.md) for project setup
4. [QUICKSTART.md](./QUICKSTART.md) for getting started

---

**Remember:** Never commit sensitive data to version control!

