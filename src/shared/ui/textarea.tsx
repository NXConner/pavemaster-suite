import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("textarea", className)} {...props} />
  );
}
