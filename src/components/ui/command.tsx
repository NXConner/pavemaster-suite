import * as React from "react";
import { cn } from "@/lib/utils";

export function Command({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("command", className)} {...props} />
  );
}
