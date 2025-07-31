import * as React from "react";
import { cn } from "@/lib/utils";

export function Dialog({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("dialog", className)} {...props} />
  );
}
