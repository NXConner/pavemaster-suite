import * as React from "react";
import { cn } from "@/lib/utils";

export function Table({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("table", className)} {...props} />
  );
}
