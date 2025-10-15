import {
  Coins,
  ArrowRight,
  Zap,
  Shield,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#FFFDFA] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 grid grid-cols-10 gap-4 p-4 opacity-[0.02]">
        {Array.from({ length: 100 }).map((_, i) => (
          <Coins key={i} size={24} className="text-black rotate-12" />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative max-w-6xl mx-auto px-4 pt-32 pb-20">
        <div className="space-y-8 text-center">
          {/* Logo Section */}
          <div
            className={cn(
              "inline-flex items-center gap-3 px-6 py-3",
              "bg-white border-2 border-black rounded-2xl",
              "shadow-[6px_6px_0_0_rgba(0,0,0,1)]",
              "hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)]",
              "hover:translate-y-[-4px]",
              "transition-all duration-200",
              "mb-8"
            )}
          >
            <div className="relative">
              <Coins size={48} className="text-orange-500" />
              <span className="absolute -top-1 -right-1 text-lg font-black">
                ⚡
              </span>
            </div>
            <div className="flex flex-col items-start">
              <span className="font-black text-3xl tracking-tight">
                Chippy Pay
              </span>
              <span className="text-sm font-bold text-gray-500">Workflow Builder</span>
            </div>
          </div>

          {/* Hero Section */}
          <h1 className="text-6xl sm:text-7xl font-black text-black max-w-3xl mx-auto leading-tight">
            Batch Payments Made Simple 💸
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Build your payment workflow with our intuitive drag-and-drop
            interface. Send tokens to multiple recipients on Starknet with ease!
          </p>

          {/* CTA Button */}
          <div className="flex justify-center gap-4 pt-8">
            <Link href="/workflow">
              <Button
                className={cn(
                  "bg-black text-white border-2 border-black rounded-xl",
                  "text-lg font-bold px-8 py-6",
                  "shadow-[6px_6px_0_0_rgba(0,0,0,1)]",
                  "hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)]",
                  "hover:translate-y-[-4px]",
                  "transition-all duration-200",
                  "flex items-center gap-2"
                )}
              >
                Build Workflow
                <ArrowRight size={20} />
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-20">
            {[
              {
                title: "Visual Workflow",
                description:
                  "Build complex payment flows through an intuitive drag-and-drop interface",
                icon: Layers,
              },
              {
                title: "Batch Processing",
                description:
                  "Send tokens to hundreds of recipients in optimized batches",
                icon: Zap,
              },
              {
                title: "Secure & Reliable",
                description:
                  "Built on Starknet with comprehensive validation and error handling",
                icon: Shield,
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={cn(
                  "bg-white p-6 rounded-xl",
                  "border-2 border-black",
                  "shadow-[4px_4px_0_0_rgba(0,0,0,1)]",
                  "hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)]",
                  "hover:translate-y-[-2px]",
                  "transition-all duration-200"
                )}
              >
                <feature.icon size={24} className="mb-4 text-orange-500" />
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Workflow Preview */}
          <div className="pt-32">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Payment Workflow</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Complete payment automation from CSV import to transaction
                reporting. Monitor every step with real-time status updates.
              </p>
            </div>

            <div
              className={cn(
                "bg-white p-8 rounded-xl max-w-4xl mx-auto",
                "border-2 border-black",
                "shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
              )}
            >
              <div className="space-y-2 text-left font-mono text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span>Connect Wallet</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <ArrowRight size={16} />
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>Import CSV Recipients</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <ArrowRight size={16} />
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Validate Addresses</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <ArrowRight size={16} />
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span>Check Balance</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <ArrowRight size={16} />
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <span>Approve Token</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <ArrowRight size={16} />
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                  <span>Loop through Recipients</span>
                </div>
                <div className="flex items-center gap-2 ml-8">
                  <div className="w-2 h-2 bg-pink-500 rounded-full" />
                  <span>Batch Transfer</span>
                </div>
                <div className="flex items-center gap-2 ml-8">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                  <span>Check Transaction Status</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <ArrowRight size={16} />
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span>Transaction Summary</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <ArrowRight size={16} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full" />
                  <span>Export Report</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-center text-gray-500 font-medium">
        Built for Starknet Hackathon with ❤️ using Chippy Pay
      </div>
    </div>
  );
};

export default LandingPage;

