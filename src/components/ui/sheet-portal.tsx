import * as React from "react";
import { cn } from "@/lib/utils";

export function Sheet-portal({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("sheet-portal", className)} {...props} />
  );
}
