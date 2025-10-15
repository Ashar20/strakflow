import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  UserPlus,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Download,
  Copy,
  Loader2,
} from "lucide-react";
import {
  createChippyPayWallet,
  recoverChippyPayWallet,
  loginToChippyPayWallet,
  isUsernameAvailable,
  validatePasswordStrength,
  validateEmail,
  CreatedWallet,
  WalletCreationOptions,
  WalletRecoveryOptions,
} from "@/services/walletCreation";

interface WalletCreationProps {
  onWalletCreated: (wallet: CreatedWallet) => void;
  onWalletConnected: (wallet: CreatedWallet) => void;
}

const WalletCreation: React.FC<WalletCreationProps> = ({
  onWalletCreated,
  onWalletConnected,
}) => {
  const [activeTab, setActiveTab] = useState("create");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createdWallet, setCreatedWallet] = useState<CreatedWallet | null>(null);
  const [showRecoveryPhrase, setShowRecoveryPhrase] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
  });

  const [recoverForm, setRecoverForm] = useState({
    username: "",
    password: "",
    recoveryPhrase: "",
  });

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  // Validation states
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<{
    isValid: boolean;
    errors: string[];
  } | null>(null);

  // Handle form changes
  const handleCreateFormChange = (field: string, value: string) => {
    setCreateForm((prev) => ({ ...prev, [field]: value }));
    setError("");

    // Validate password strength
    if (field === "password") {
      setPasswordStrength(validatePasswordStrength(value));
    }

    // Check username availability
    if (field === "username" && value.length >= 3) {
      isUsernameAvailable(value).then(setUsernameAvailable);
    }
  };

  const handleRecoverFormChange = (field: string, value: string) => {
    setRecoverForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleLoginFormChange = (field: string, value: string) => {
    setLoginForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  // Handle wallet creation
  const handleCreateWallet = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate form
      if (createForm.password !== createForm.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (!passwordStrength?.isValid) {
        throw new Error("Password does not meet requirements");
      }

      if (usernameAvailable === false) {
        throw new Error("Username is not available");
      }

      if (createForm.email && !validateEmail(createForm.email)) {
        throw new Error("Invalid email format");
      }

      // Create wallet
      const options: WalletCreationOptions = {
        username: createForm.username,
        password: createForm.password,
        email: createForm.email || undefined,
      };

      const wallet = await createChippyPayWallet(options);
      
      setCreatedWallet(wallet);
      setSuccess("Wallet created successfully!");
      onWalletCreated(wallet);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create wallet");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle wallet recovery
  const handleRecoverWallet = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const options: WalletRecoveryOptions = {
        username: recoverForm.username,
        password: recoverForm.password,
        recoveryPhrase: recoverForm.recoveryPhrase,
      };

      const wallet = await recoverChippyPayWallet(options);
      
      setCreatedWallet(wallet);
      setSuccess("Wallet recovered successfully!");
      onWalletConnected(wallet);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to recover wallet");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle wallet login
  const handleLoginWallet = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const wallet = await loginToChippyPayWallet(
        loginForm.username,
        loginForm.password
      );
      
      setCreatedWallet(wallet);
      setSuccess("Login successful!");
      onWalletConnected(wallet);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess("Copied to clipboard!");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card
        className={cn(
          "bg-white border-2 border-black rounded-xl",
          "shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <UserPlus className="text-purple-500" />
            Chippy Pay Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          {createdWallet ? (
            <div className="space-y-4">
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700">
                  {success}
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Wallet Address
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={createdWallet.address}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(createdWallet.address)}
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Username
                  </label>
                  <Input
                    value={createdWallet.username}
                    readOnly
                    className="mt-1"
                  />
                </div>

                {createdWallet.recoveryPhrase && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Recovery Phrase (Save this securely!)
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type={showRecoveryPhrase ? "text" : "password"}
                        value={createdWallet.recoveryPhrase}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowRecoveryPhrase(!showRecoveryPhrase)}
                      >
                        {showRecoveryPhrase ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(createdWallet.recoveryPhrase || "")}
                      >
                        <Copy size={16} />
                      </Button>
                    </div>
                    <p className="text-xs text-red-600 mt-1">
                      ⚠️ This phrase will only be shown once. Save it securely!
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={() => onWalletConnected(createdWallet)}
                  >
                    Continue to Workflow Builder
                  </Button>
                  
                  <div className="text-center">
                    <p className="text-sm text-purple-600 font-medium">
                      🪙 Your CHIPPY tokens are ready for batch payments!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="create">Create</TabsTrigger>
                <TabsTrigger value="recover">Recover</TabsTrigger>
                <TabsTrigger value="login">Login</TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Username *
                    </label>
                    <Input
                      value={createForm.username}
                      onChange={(e) => handleCreateFormChange("username", e.target.value)}
                      placeholder="Choose a unique username"
                      className="mt-1"
                    />
                    {usernameAvailable !== null && (
                      <p className={`text-xs mt-1 ${
                        usernameAvailable ? "text-green-600" : "text-red-600"
                      }`}>
                        {usernameAvailable ? "✅ Available" : "❌ Not available"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Password *
                    </label>
                    <Input
                      type="password"
                      value={createForm.password}
                      onChange={(e) => handleCreateFormChange("password", e.target.value)}
                      placeholder="Strong password"
                      className="mt-1"
                    />
                    {passwordStrength && (
                      <div className="mt-1">
                        {passwordStrength.errors.map((error, index) => (
                          <p key={index} className="text-xs text-red-600">
                            ❌ {error}
                          </p>
                        ))}
                        {passwordStrength.isValid && (
                          <p className="text-xs text-green-600">✅ Password is strong</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Confirm Password *
                    </label>
                    <Input
                      type="password"
                      value={createForm.confirmPassword}
                      onChange={(e) => handleCreateFormChange("confirmPassword", e.target.value)}
                      placeholder="Confirm your password"
                      className="mt-1"
                    />
                    {createForm.confirmPassword && createForm.password !== createForm.confirmPassword && (
                      <p className="text-xs text-red-600 mt-1">❌ Passwords do not match</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Email (Optional)
                    </label>
                    <Input
                      type="email"
                      value={createForm.email}
                      onChange={(e) => handleCreateFormChange("email", e.target.value)}
                      placeholder="your@email.com"
                      className="mt-1"
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleCreateWallet}
                    disabled={isLoading || !passwordStrength?.isValid || usernameAvailable === false}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Wallet...
                      </>
                    ) : (
                      <>
                        <KeyRound className="mr-2 h-4 w-4" />
                        Create Wallet
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="recover" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Username *
                    </label>
                    <Input
                      value={recoverForm.username}
                      onChange={(e) => handleRecoverFormChange("username", e.target.value)}
                      placeholder="Your username"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Password *
                    </label>
                    <Input
                      type="password"
                      value={recoverForm.password}
                      onChange={(e) => handleRecoverFormChange("password", e.target.value)}
                      placeholder="Your password"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Recovery Phrase *
                    </label>
                    <Input
                      value={recoverForm.recoveryPhrase}
                      onChange={(e) => handleRecoverFormChange("recoveryPhrase", e.target.value)}
                      placeholder="Enter your 12-word recovery phrase"
                      className="mt-1"
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleRecoverWallet}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Recovering...
                      </>
                    ) : (
                      <>
                        <KeyRound className="mr-2 h-4 w-4" />
                        Recover Wallet
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="login" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Username *
                    </label>
                    <Input
                      value={loginForm.username}
                      onChange={(e) => handleLoginFormChange("username", e.target.value)}
                      placeholder="Your username"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Password *
                    </label>
                    <Input
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => handleLoginFormChange("password", e.target.value)}
                      placeholder="Your password"
                      className="mt-1"
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleLoginWallet}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging In...
                      </>
                    ) : (
                      <>
                        <KeyRound className="mr-2 h-4 w-4" />
                        Login
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {error && (
            <Alert className="mt-4 border-red-500 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletCreation;
