import { motion } from "framer-motion";
import { cn } from "../../utils/formatters";

const variants = {
  primary: "bg-primary text-white shadow-soft hover:bg-[#b63d55]",
  secondary: "bg-white text-ink border border-border hover:bg-blush",
  ghost: "bg-white/50 text-primary hover:bg-white"
};

export function Button({ children, variant = "primary", className, ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -1 }}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-all",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
