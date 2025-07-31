import * as React from "react";
import { cn } from "@/lib/utils";

export function Collapsible({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("collapsible", className)} {...props} />
  );
}
