export interface ErrorReporter {
  capture(error: unknown, context?: Record<string, string>): void;
}

const reporter: ErrorReporter = {
  capture(error, context) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (process.env.NODE_ENV !== "production") {
      console.error("[error]", message, context ?? {});
    }
  },
};

export function reportError(error: unknown, context?: Record<string, string>) {
  reporter.capture(error, context);
}

export const errorReporter = reporter;
