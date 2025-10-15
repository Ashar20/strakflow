"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Workflow, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavigationTabs() {
  const pathname = usePathname();

  const tabs = [
    {
      name: "Payment Workflow",
      href: "/workflow",
      icon: Workflow,
      description: "Token transfers & contracts",
    },
    {
      name: "Atomic Swap",
      href: "/atomic-swap",
      icon: ArrowLeftRight,
      description: "Cross-chain swaps",
    },
  ];

  return (
    <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-4" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "group relative px-6 py-4 font-medium text-sm flex items-center gap-2 transition-all duration-200",
                  isActive
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
                )}
              >
                <Icon className="w-5 h-5" />
                <div className="flex flex-col">
                  <span className="font-semibold">{tab.name}</span>
                  <span className="text-xs text-gray-400 group-hover:text-gray-500">
                    {tab.description}
                  </span>
                </div>
                
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 via-purple-600 to-purple-400" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

