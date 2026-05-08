import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedListProps {
  children: React.ReactNode[];
  className?: string;
  delay?: number;
}

export function AnimatedList({
  children,
  className,
  delay = 0.05,
}: AnimatedListProps) {
  return (
    <ul className={cn("flex flex-col gap-2", className)}>
      <AnimatePresence>
        {children.map((child, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, delay: index * delay }}
          >
            {child}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
