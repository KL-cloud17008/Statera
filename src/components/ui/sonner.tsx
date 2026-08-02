"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      richColors
      position="top-center"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "rounded-panel border border-rule bg-overlay px-4 py-3 text-row text-primary shadow-overlay",
          title: "text-row font-medium text-primary",
          description: "text-caption text-secondary",
        },
      }}
      /* Sonner reads these from its own inline scope. They previously pointed
         at --popover/--popover-foreground/--border, none of which exist as
         custom properties here (only the --color-* theme keys do), so every
         toast fell back to Sonner's stock white. */
      style={
        {
          "--normal-bg": "var(--surface-overlay)",
          "--normal-text": "var(--text-primary)",
          "--normal-border": "var(--rule)",
          "--border-radius": "var(--radius-md)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
