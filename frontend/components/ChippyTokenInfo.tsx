import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
  Coins,
  TrendingUp,
  Users,
  Activity,
  ExternalLink,
  RefreshCw,
  DollarSign,
} from "lucide-react";
import {
  getChippyTokenInfo,
  getChippyTokenBalance,
  getChippyTokenPrice,
  getChippyTokenStats,
  TokenBalance,
} from "@/services/chippyToken";

interface ChippyTokenInfoProps {
  walletAddress: string;
  onTokenSelect?: (tokenAddress: string) => void;
}

const ChippyTokenInfo: React.FC<ChippyTokenInfoProps> = ({
  walletAddress,
  onTokenSelect,
}) => {
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null);
  const [tokenPrice, setTokenPrice] = useState<number>(0);
  const [tokenStats, setTokenStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const tokenInfo = getChippyTokenInfo();

  useEffect(() => {
    loadTokenData();
  }, [walletAddress]);

  const loadTokenData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [balance, price, stats] = await Promise.all([
        getChippyTokenBalance(walletAddress),
        getChippyTokenPrice(),
        getChippyTokenStats(),
      ]);

      setTokenBalance(balance);
      setTokenPrice(price);
      setTokenStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load token data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadTokenData();
  };

  const handleSelectToken = () => {
    if (onTokenSelect) {
      onTokenSelect(tokenInfo.address);
    }
  };

  return (
    <div className="space-y-4">
      <Card
        className={cn(
          "bg-white border-2 border-purple-500 rounded-xl",
          "shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
        )}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Coins className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl">{tokenInfo.name}</CardTitle>
                <p className="text-sm text-gray-600">Official Chippy Pay Token</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {tokenInfo.symbol}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 border-red-500 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Token Balance */}
              {tokenBalance && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-700">Your Balance</h3>
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div>
                      <p className="text-2xl font-bold text-purple-700">
                        {tokenBalance.formattedBalance}
                      </p>
                      {tokenBalance.usdValue && (
                        <p className="text-sm text-gray-600">
                          {tokenBalance.usdValue}
                        </p>
                      )}
                    </div>
                    <Coins className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
              )}

              {/* Token Price */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700">Current Price</h3>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <span className="text-lg font-semibold">${tokenPrice.toFixed(4)}</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2.3%
                  </Badge>
                </div>
              </div>

              {/* Token Stats */}
              {tokenStats && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-700">Token Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-600">Holders</span>
                      </div>
                      <p className="text-lg font-semibold">
                        {tokenStats.holders.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-gray-600">Volume 24h</span>
                      </div>
                      <p className="text-lg font-semibold">
                        ${(tokenStats.volume24h / 1000000).toFixed(2)}M
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Token Address */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700">Token Address</h3>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <code className="text-sm font-mono flex-1 truncate">
                    {tokenInfo.address}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(tokenInfo.address)}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700">About</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {tokenInfo.description}
                </p>
              </div>

              {/* Action Button */}
              {onTokenSelect && (
                <Button
                  className="w-full"
                  onClick={handleSelectToken}
                  disabled={!tokenBalance || parseFloat(tokenBalance.balance) === 0}
                >
                  <Coins className="mr-2 h-4 w-4" />
                  Use CHIPPY Token for Payments
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card className="bg-white border-2 border-gray-200 rounded-xl shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Learn More</h3>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" className="text-xs">
              <ExternalLink className="h-3 w-3 mr-1" />
              Website
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              <ExternalLink className="h-3 w-3 mr-1" />
              Twitter
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              <ExternalLink className="h-3 w-3 mr-1" />
              Discord
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              <ExternalLink className="h-3 w-3 mr-1" />
              GitHub
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChippyTokenInfo;
