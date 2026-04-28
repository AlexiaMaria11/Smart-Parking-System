import { cn } from "../../utils/formatters";
import "./Common.css";

export function SectionHeading({ eyebrow, title, description, align = "left" }) {
  return (
    <div className={cn("section-heading", align === "center" ? "section-heading-center" : "")}>
      {eyebrow ? <p className="section-heading-eyebrow">{eyebrow}</p> : null}
      <h2 className="section-title">{title}</h2>
      {description ? <p className="section-heading-description">{description}</p> : null}
    </div>
  );
}
