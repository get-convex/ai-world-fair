import styles from "./Step.module.css";
import { Skeleton } from "../ui/skeleton";
import { StepAccordion } from "../stepAccordion";
import { Badge } from "../ui/badge";

export function Step({
  title,
  description,
  details,
  subdetails,
  status,
  badge,
}) {
  const dot =
    status === "active" ? (
      <div className={`w-4 h-4 bg-green-400 ${styles.dot}`}></div>
    ) : status === "complete" ? (
      <div className={`w-4 h-4 bg-green-500 ${styles.successDot}`}></div>
    ) : (
      <Skeleton className="h-4 w-4 rounded-full" />
    );

  const listenBadgeStyle =
    (status === "active" || status === "complete") && badge
      ? `text-green-500 bg-green-100 border-green-500 cursor-pointer hover:bg-green-200`
      : `text-slate-300 bg-slate-100 border-slate-200`;

  return (
    <div className="pt-4 pb-4 flex">
      <div className={`pt-1 mr-2`}>{dot}</div>
      <div className="flex-column items-center grow">
        <div className="flex-column">
          <div className="font-bold text-sm">
            {title}{" "}
            {badge ? (
              <Badge variant={"outline"} className={listenBadgeStyle}>
                Listen live{" "}
                {status !== "pending" && (
                  <div
                    className={`ml-2 w-2 h-2 bg-green-400 ${styles.dot}`}
                  ></div>
                )}
              </Badge>
            ) : null}{" "}
          </div>
          <div className="text-sm">{description}</div>
        </div>
        <div className="flex-column">
          {status === "complete" && (
            <StepAccordion details={details} subdetails={subdetails} />
          )}
        </div>
      </div>
    </div>
  );
}
