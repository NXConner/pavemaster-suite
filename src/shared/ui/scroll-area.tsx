import * as React from "react";
import { cn } from "@/lib/utils";

export function Scroll-area({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("scroll-area", className)} {...props} />
  );
}
