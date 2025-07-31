import * as React from "react";
import { cn } from "@/lib/utils";

export function Popover({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("popover", className)} {...props} />
  );
}
