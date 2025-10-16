# Deployment Guide

This project is configured for deployment on multiple platforms. The "No Next.js version detected" error has been resolved by adding proper configuration files.

## Supported Platforms

### Vercel (Recommended)
- Configuration: `vercel.json`
- Root directory: `.` (current directory)
- Build command: `npm run build`
- Framework: Next.js

### Netlify
- Configuration: `netlify.toml`
- Build command: `npm run build`
- Publish directory: `.next`

### GitHub Actions
- Configuration: `.github/workflows/deploy.yml`
- Automatically builds and deploys on push to `main` or `frontend` branches
- Supports Vercel deployment

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Make sure to set the following environment variables in your deployment platform:

- `NEXT_PUBLIC_CHIPI_API_KEY`
- `CHIPI_SECRET_KEY`
- `NEXT_PUBLIC_CHIPI_ENV`
- `NEXT_PUBLIC_STARKNET_RPC_URL`
- `REACT_APP_SOLANA_RPC_URL`
- `REACT_APP_SOLANA_NETWORK`
- `REACT_APP_STARKNET_RPC_URL`
- `REACT_APP_STARKNET_NETWORK`
- `REACT_APP_BITCOIN_NETWORK`
- And other environment variables as needed

## Build Configuration

- TypeScript type checking is disabled for faster builds
- ESLint is disabled during builds
- All necessary polyfills are configured for browser compatibility

## Troubleshooting

If you encounter "No Next.js version detected" error:
1. Ensure you're deploying from the root directory (not a subdirectory)
2. Check that `package.json` contains Next.js in dependencies
3. Verify the deployment platform is using the correct build command
4. Make sure the configuration files (vercel.json, netlify.toml) are in the root directory
