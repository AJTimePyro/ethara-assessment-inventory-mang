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
        "flex flex-col items-center justify-center gap-3 py-14",
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <Icon className={cn("h-7 w-7 text-red-400", iconClassName)} />
      </div>
      <div className="text-center">
        <p
          className={cn(
            "text-sm font-semibold text-foreground",
            titleClassName,
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            "mt-1 text-xs text-muted-foreground",
            descriptionClassName,
          )}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
