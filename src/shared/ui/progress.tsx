import * as React from "react";
import { cn } from "@/lib/utils";

export function Progress({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("progress", className)} {...props} />
  );
}
