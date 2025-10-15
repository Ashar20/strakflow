# Quick Start Guide

Get started with Chippy Pay Workflow Builder in 5 minutes!

## ⚡ Quick Setup

### 1. Set Up Environment Variables

```bash
cp env.example .env.local
```

The default settings work out of the box for demo mode!

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
bun install
```

### 3. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
bun dev
```

### 4. Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Create Your First Workflow

### Option 1: Use the UI

1. Click **"Build Workflow"** on the landing page
2. Drag blocks from "Available Workflow Blocks" to "Your Workflow"
3. Configure each block's settings
4. Click **"Execute Workflow"** to run

### Option 2: Follow the Complete Flow

1. **Connect Wallet** (Starknet tab)
   - Choose ArgentX or Braavos

2. **Import CSV** (CSV tab)
   - Use `/public/sample-recipients.csv` as a template
   - Or create your own:
   ```csv
   address,amount
   0x0742d3e5cfe8b4e8e3a7b9c8f5e4d3c2b1a0f9e8d7c6b5a49384756e8a,100
   0x0843e4f6d0f9c5f9f4b8cab9f6f5e4d3c2b1b0faf9e8d7c6b5b49384756f9b,200
   ```

3. **Validate Addresses** (Starknet tab)
   - Select "Strict" validation

4. **Check Balance** (Starknet tab)
   - Enter token address (e.g., ETH address)
   - Set gas buffer to 10%

5. **Approve Token** (Starknet tab)
   - Choose "Exact Amount"

6. **Loop through Recipients** (ChippyPay tab)
   - Set batch size to 10
   - Set delay to 1000ms

7. **Batch Transfer** (ChippyPay tab)
   - Choose "Sequential" mode

8. **Check Transaction Status** (Starknet tab)
   - Max retries: 5
   - Retry delay: 3000ms

9. **Transaction Summary** (Reporting tab)
   - Choose "Detailed" format

10. **Export Report** (Reporting tab)
    - Choose CSV format
    - Filename: "my-report"

### Click Execute! 🚀

Watch your workflow execute with real-time logs and progress tracking.

## 📝 CSV Template

Download the sample CSV from `/public/sample-recipients.csv` or create one:

```csv
address,amount
0x0742d3e5cfe8b4e8e3a7b9c8f5e4d3c2b1a0f9e8d7c6b5a49384756e8a,100
0x0843e4f6d0f9c5f9f4b8cab9f6f5e4d3c2b1b0faf9e8d7c6b5b49384756f9b,200
0x0944f5f7e0fad6faf5c9dbaa07f6f5e4d3c2c1fbfafae9e8d7d6c5c49384757fac,150
```

## 🎨 Key Features

✅ **Drag & Drop Interface** - Visual workflow building  
✅ **Starknet Native Multicall** - 🌟 No custom contract needed!  
✅ **Real-time Execution** - Watch your workflow run  
✅ **Batch Processing** - Multiple transfers in ONE transaction  
✅ **Progress Tracking** - Monitor each step  
✅ **Execution Logs** - Detailed status updates  
✅ **Export Reports** - Download transaction summaries  

## 🔍 Troubleshooting

### Port Already in Use

```bash
# Use different port
npm run dev -- -p 3001
```

### Dependencies Installation Failed

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Wallet Connection Issues

- Make sure you have ArgentX or Braavos wallet installed
- Check you're on the correct network (Sepolia testnet)
- Refresh the page and try again

## 📚 Next Steps

1. Read the [Complete README](./README.md)
2. Check out the [Workflow Guide](./WORKFLOW_GUIDE.md)
3. Explore the code in `/components` and `/services`
4. Customize blocks in `/constants/workflows.ts`

## 🎓 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Starknet Documentation](https://docs.starknet.io)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

## 🤝 Need Help?

- Check [Workflow Guide](./WORKFLOW_GUIDE.md) for detailed instructions
- Read [README](./README.md) for architecture details
- Open an issue on GitHub

---

**Ready to build? Let's go! 🚀**

