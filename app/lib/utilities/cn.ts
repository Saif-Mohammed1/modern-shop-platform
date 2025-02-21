// lib/utilities/cn.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage example:
// <div className={cn("px-4", active && "bg-blue-500", className)}>
