"use client";

import type { ComponentType, SVGProps } from "react";
import { WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export interface ErrorStateProps {
  title?: string;
  description?: string;
  icon?: IconComponent;
  className?: string;
  iconClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function ErrorState({
  title = "Unable to reach the server",
  description = "Make sure the backend is running and try again.",
  icon: Icon = WifiOff,
  className,
  iconClassName,
  titleClassName,
  descriptionClassName,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground",
        className,
      )}
    >
      <Icon className={cn("h-8 w-8", iconClassName)} />
      <p className={cn("text-sm font-medium", titleClassName)}>{title}</p>
      <p className={cn("text-xs", descriptionClassName)}>{description}</p>
    </div>
  );
}
