
"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function SearchBar({ searchTerm, onSearchChange, className, ...props }: SearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/60" /> {/* Adjusted text color */}
      <Input
        type="search"
        placeholder="搜索事件..." // Shortened placeholder
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className={cn(
            "pl-8 h-8 text-sm w-full",
            // Make input background transparent to inherit parent gradient
            "bg-transparent border-0 focus:ring-0 placeholder-foreground/50"
        )}
        {...props}
      />
    </div>
  );
}
