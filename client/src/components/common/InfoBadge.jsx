import { cn } from "../../utils/formatters";

const tones = {
  success: "bg-[#e9f7e1] text-[#608d38]",
  warning: "bg-[#fff6da] text-[#a48200]",
  danger: "bg-[#ffe4e7] text-[#b84d62]",
  info: "bg-[#eaf6fb] text-[#377593]"
};

export function InfoBadge({ children, tone = "info" }) {
  return <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", tones[tone])}>{children}</span>;
}
