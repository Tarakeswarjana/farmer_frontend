import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-start gap-3 p-6">
      <h2 className="text-xl font-bold">{title}</h2>
      {body ? <p className="text-muted">{body}</p> : null}
      {action}
    </div>
  );
}

export function EmptyAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button size="lg" onClick={onClick}>
      {label}
    </Button>
  );
}
