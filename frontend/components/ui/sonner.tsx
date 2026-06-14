"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:p-4 group-[.toaster]:flex group-[.toaster]:gap-3 group-[.toaster]:items-center",
          error:
            "group-[.toaster]:!bg-red-50 group-[.toaster]:!text-red-950 group-[.toaster]:!border-red-200 [&_svg]:!text-red-600",
          success:
            "group-[.toaster]:!bg-emerald-50 group-[.toaster]:!text-emerald-950 group-[.toaster]:!border-emerald-200 [&_svg]:!text-emerald-600",
          warning:
            "group-[.toaster]:!bg-amber-50 group-[.toaster]:!text-amber-950 group-[.toaster]:!border-amber-200 [&_svg]:!text-amber-600",
          info: "group-[.toaster]:!bg-blue-50 group-[.toaster]:!text-blue-950 group-[.toaster]:!border-blue-200 [&_svg]:!text-blue-600",
          title: "group-[.toast]:font-semibold group-[.toast]:text-sm",
          description: "group-[.toast]:text-xs group-[.toast]:opacity-85",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
