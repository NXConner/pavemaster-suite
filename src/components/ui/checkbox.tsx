import * as React from "react";
import { cn } from "@/lib/utils";

export function Checkbox({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("checkbox", className)} {...props} />
  );
}
