import { Button } from "@/components/ui/button";
import { isApiError } from "@/lib/api/errors";

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = isApiError(error) ? error.message : error instanceof Error ? error.message : "Something went wrong";
  return (
    <div role="alert" className="card border-danger/30 p-6">
      <h2 className="text-lg font-bold text-danger">{message}</h2>
      {onRetry ? (
        <Button className="mt-4" variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
