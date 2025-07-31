import * as React from "react";
import { cn } from "@/lib/utils";

export function Slider({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("slider", className)} {...props} />
  );
}
