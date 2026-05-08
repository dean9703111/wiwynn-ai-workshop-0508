import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MeteorsProps {
  number?: number;
  className?: string;
}

export function Meteors({ number = 18, className }: MeteorsProps) {
  const [meteors, setMeteors] = useState<
    {
      top: string;
      left: string;
      delay: string;
      duration: string;
    }[]
  >([]);

  useEffect(() => {
    setMeteors(
      Array.from({ length: number }).map(() => ({
        top: `${Math.floor(Math.random() * 100)}%`,
        left: `${Math.floor(Math.random() * 100)}%`,
        delay: `${(Math.random() * 4).toFixed(2)}s`,
        duration: `${(Math.random() * 4 + 4).toFixed(2)}s`,
      }))
    );
  }, [number]);

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {meteors.map((m, idx) => (
        <span
          key={idx}
          style={{
            top: m.top,
            left: m.left,
            animationDelay: m.delay,
            animationDuration: m.duration,
          }}
          className={cn(
            "absolute h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-full bg-slate-400 shadow-[0_0_0_1px_rgba(167,139,250,0.2)]",
            "before:absolute before:top-1/2 before:h-px before:w-[60px] before:-translate-y-1/2 before:bg-gradient-to-r before:from-violet-400 before:to-transparent before:content-['']"
          )}
        />
      ))}
    </div>
  );
}
