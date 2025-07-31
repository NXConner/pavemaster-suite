import * as React from "react";
import { cn } from "@/lib/utils";

export function Dropdown-menu({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("dropdown-menu", className)} {...props} />
  );
}
