import * as React from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("label", className)} {...props} />
  );
}
