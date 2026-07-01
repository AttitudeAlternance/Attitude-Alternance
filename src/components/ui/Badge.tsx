import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { STATUS_LABELS, STATUS_STYLES, type ApplicationStatus } from "@/lib/types";

interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: ApplicationStatus;
}

// Badge coloré représentant le statut d'une candidature dans le CRM.
export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium",
        STATUS_STYLES[status],
        className
      )}
      {...props}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

// Badge générique neutre (utilisé hors contexte candidature)
export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-500",
        className
      )}
      {...props}
    />
  );
}
