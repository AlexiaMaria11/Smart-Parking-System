import { motion } from "framer-motion";
import { cn } from "../../utils/formatters";
import "./Common.css";

const variants = {
  primary: "button-primary",
  secondary: "button-secondary",
  ghost: "button-ghost"
};

export function Button({ children, variant = "primary", className, ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -1 }}
      className={cn(
        "button",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
