import { cn } from "../../utils/formatters";
import "./Common.css";

const tones = {
  success: "info-badge-success",
  warning: "info-badge-warning",
  danger: "info-badge-danger",
  info: "info-badge-info"
};

export function InfoBadge({ children, tone = "info" }) {
  return <span className={cn("info-badge", tones[tone])}>{children}</span>;
}
