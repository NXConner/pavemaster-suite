import * as React from "react";
import { cn } from "@/lib/utils";

export function Switch({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("switch", className)} {...props} />
  );
}
