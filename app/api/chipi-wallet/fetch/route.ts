import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ChipiServerSDK } from "@chipi-stack/backend";

export async function POST(request: NextRequest) {
  try {
    // Verify Clerk authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the bearer token from the request
    const { bearerToken } = await request.json();
    
    if (!bearerToken) {
      return NextResponse.json(
        { error: "Bearer token is required" },
        { status: 400 }
      );
    }

    // Initialize Chippi Pay server SDK with secret key
    const chipiSDK = new ChipiServerSDK({
      apiPublicKey: process.env.NEXT_PUBLIC_CHIPI_API_KEY!,
      apiSecretKey: process.env.CHIPI_SECRET_KEY!,
      environment: (process.env.NEXT_PUBLIC_CHIPI_ENV as "development" | "production") || "production",
      nodeUrl: process.env.NEXT_PUBLIC_STARKNET_RPC_URL || "https://starknet-mainnet.public.blastapi.io/rpc/v0_8"
    });

    // Fetch wallet using the bearer token
    const wallet = await chipiSDK.getWallet(
      { externalUserId: userId },
      bearerToken
    );

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet not found" },
        { status: 404 }
      );
    }

    console.log("✅ Wallet fetched successfully:", wallet);

    return NextResponse.json({
      success: true,
      wallet: {
        address: wallet.normalizedPublicKey || wallet.publicKey,
        publicKey: wallet.publicKey,
      }
    });
  } catch (error: any) {
    console.error("❌ Error fetching Chippi Pay wallet:", error);
    
    // Return 404 for wallet not found (expected case)
    if (error.message?.includes("404") || error.message?.includes("not found")) {
      return NextResponse.json(
        { error: "Wallet not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to fetch wallet",
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

