import * as React from "react";
import { cn } from "@/lib/utils";

export function Breadcrumb({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("breadcrumb", className)} {...props} />
  );
}
