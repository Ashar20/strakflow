/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Add Node.js polyfills for browser environment
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        url: require.resolve("url"),
        zlib: require.resolve("zlib-browserify"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        assert: require.resolve("assert"),
        os: require.resolve("os-browserify/browser"),
        buffer: require.resolve("buffer"),
        process: require.resolve("process/browser"),
      };

      // Provide global variables
      config.plugins.push(
        new config.webpack.ProvidePlugin({
          process: "process/browser",
          Buffer: ["buffer", "Buffer"],
        })
      );
    }

    return config;
  },
  // Add environment variables that start with REACT_APP_ to the client
  env: {
    REACT_APP_SOLANA_RPC_URL: process.env.REACT_APP_SOLANA_RPC_URL,
    REACT_APP_SOLANA_NETWORK: process.env.REACT_APP_SOLANA_NETWORK,
    REACT_APP_STARKNET_RPC_URL: process.env.REACT_APP_STARKNET_RPC_URL,
    REACT_APP_STARKNET_NETWORK: process.env.REACT_APP_STARKNET_NETWORK,
    REACT_APP_STARKNET_BLOCK_EXPLORER: process.env.REACT_APP_STARKNET_BLOCK_EXPLORER,
    REACT_APP_BITCOIN_NETWORK: process.env.REACT_APP_BITCOIN_NETWORK,
    REACT_APP_BTC_BLOCK_EXPLORER: process.env.REACT_APP_BTC_BLOCK_EXPLORER,
    REACT_APP_SOL_BLOCK_EXPLORER: process.env.REACT_APP_SOL_BLOCK_EXPLORER,
    REACT_APP_UNISAT_API_URL: process.env.REACT_APP_UNISAT_API_URL,
  },
};

module.exports = nextConfig;
