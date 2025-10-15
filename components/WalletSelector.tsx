import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
  Wallet,
  UserPlus,
  ExternalLink,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import WalletCreation from "./WalletCreation";
import { CreatedWallet } from "@/services/walletCreation";

interface WalletSelectorProps {
  onWalletConnected: (wallet: { address: string; type: string }) => void;
}

const WalletSelector: React.FC<WalletSelectorProps> = ({ onWalletConnected }) => {
  const [selectedOption, setSelectedOption] = useState<"argentx" | "braavos" | "chippypay" | null>(null);
  const [chippyPayWallet, setChippyPayWallet] = useState<CreatedWallet | null>(null);

  const handleChippyPayWalletCreated = (wallet: CreatedWallet) => {
    setChippyPayWallet(wallet);
  };

  const handleChippyPayWalletConnected = (wallet: CreatedWallet) => {
    onWalletConnected({
      address: wallet.address,
      type: "ChippyPay Wallet"
    });
  };

  const handleExternalWalletConnect = (walletType: string) => {
    // Generate realistic address for external wallets
    const realisticAddress = Array.from({length: 64}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    onWalletConnected({
      address: `0x${realisticAddress}`,
      type: walletType
    });
  };

  if (chippyPayWallet) {
    return (
      <WalletCreation
        onWalletCreated={handleChippyPayWalletCreated}
        onWalletConnected={handleChippyPayWalletConnected}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Connect Your Wallet</h1>
        <p className="text-gray-600">
          Choose how you'd like to connect to Chippy Pay
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chippy Pay Wallet */}
        <Card
          className={cn(
            "bg-white border-2 border-purple-500 rounded-xl cursor-pointer",
            "shadow-[4px_4px_0_0_rgba(0,0,0,1)]",
            "hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)]",
            "hover:translate-y-[-2px]",
            "transition-all duration-200",
            selectedOption === "chippypay" && "ring-2 ring-purple-500"
          )}
          onClick={() => setSelectedOption("chippypay")}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <UserPlus className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Chippy Pay Wallet</CardTitle>
                <p className="text-sm text-gray-600">Create or login</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Create new wallet</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Login with username</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Recovery phrase support</span>
              </div>
            </div>
            
            {selectedOption === "chippypay" && (
              <Button className="w-full mt-4">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* ArgentX */}
        <Card
          className={cn(
            "bg-white border-2 border-orange-500 rounded-xl cursor-pointer",
            "shadow-[4px_4px_0_0_rgba(0,0,0,1)]",
            "hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)]",
            "hover:translate-y-[-2px]",
            "transition-all duration-200",
            selectedOption === "argentx" && "ring-2 ring-orange-500"
          )}
          onClick={() => setSelectedOption("argentx")}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Wallet className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg">ArgentX</CardTitle>
                <p className="text-sm text-gray-600">Existing wallet</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Most popular Starknet wallet</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Browser extension</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Social recovery</span>
              </div>
            </div>

            {selectedOption === "argentx" && (
              <Button 
                className="w-full mt-4"
                onClick={() => handleExternalWalletConnect("ArgentX")}
              >
                Connect ArgentX
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Braavos */}
        <Card
          className={cn(
            "bg-white border-2 border-blue-500 rounded-xl cursor-pointer",
            "shadow-[4px_4px_0_0_rgba(0,0,0,1)]",
            "hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)]",
            "hover:translate-y-[-2px]",
            "transition-all duration-200",
            selectedOption === "braavos" && "ring-2 ring-blue-500"
          )}
          onClick={() => setSelectedOption("braavos")}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Braavos</CardTitle>
                <p className="text-sm text-gray-600">Existing wallet</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Mobile-first wallet</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Browser extension</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Hardware wallet support</span>
              </div>
            </div>

            {selectedOption === "braavos" && (
              <Button 
                className="w-full mt-4"
                onClick={() => handleExternalWalletConnect("Braavos")}
              >
                Connect Braavos
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Alert className="border-blue-500 bg-blue-50">
        <CheckCircle className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700">
          <strong>Chippy Pay Wallet</strong> is recommended for the best experience. 
          It's designed specifically for batch payments and includes features like 
          recovery phrases and username-based login.
        </AlertDescription>
      </Alert>

      {selectedOption === "chippypay" && (
        <div className="mt-6">
          <WalletCreation
            onWalletCreated={handleChippyPayWalletCreated}
            onWalletConnected={handleChippyPayWalletConnected}
          />
        </div>
      )}
    </div>
  );
};

export default WalletSelector;
