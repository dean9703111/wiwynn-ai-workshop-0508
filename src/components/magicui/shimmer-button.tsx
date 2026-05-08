import * as React from "react";
import { cn } from "@/lib/utils";

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
}

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(
  (
    {
      shimmerColor = "#ffffff",
      shimmerSize = "0.05em",
      shimmerDuration = "2.5s",
      borderRadius = "10px",
      background = "linear-gradient(120deg, hsl(252 90% 60%), hsl(268 83% 58%), hsl(320 80% 60%))",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background,
          } as React.CSSProperties
        }
        className={cn(
          "group relative z-0 inline-flex h-11 cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap rounded-[var(--radius)] border border-white/10 px-6 text-sm font-medium text-white shadow-[0_8px_24px_-8px_hsl(268_83%_58%/0.6)] transition-all hover:shadow-[0_12px_28px_-8px_hsl(268_83%_58%/0.7)] active:translate-y-[1px] disabled:pointer-events-none disabled:opacity-60 [background:var(--bg)]",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 -z-30 overflow-hidden rounded-[inherit] [container-type:size]">
          <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
            <div className="absolute -inset-full rotate-0 animate-spin-around [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
          </div>
        </div>
        <span className="relative z-10 inline-flex items-center justify-center gap-2">
          {children}
        </span>
        <div className="absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]" />
      </button>
    );
  }
);
ShimmerButton.displayName = "ShimmerButton";
