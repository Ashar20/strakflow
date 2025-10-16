import { Coins } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const Header = () => {
  return (
    <header className="bg-white border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div
              className={cn(
                "inline-flex items-center gap-3 px-4 py-2",
                "bg-white border-2 border-black rounded-xl",
                "shadow-[4px_4px_0_0_rgba(0,0,0,1)]",
                "hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)]",
                "hover:translate-y-[-2px]",
                "transition-all duration-200"
              )}
            >
              <Coins size={32} className="text-orange-500" />
              <div className="flex flex-col items-start">
                <span className="font-black text-xl tracking-tight">
                  Chippy Pay
                </span>
                <span className="text-xs font-bold text-gray-500">
                  Workflow Builder
                </span>
              </div>
            </div>
          </Link>
          <div className="text-sm font-medium text-gray-600">
            Starknet Hackathon 2025
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

