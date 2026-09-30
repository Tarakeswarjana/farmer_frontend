import { getData } from "@/lib/api/client";
import type { MatchResult } from "@/types/api";

export const matchingApi = {
  mine(signal?: AbortSignal) {
    return getData<MatchResult>("/matches/my", undefined, signal);
  },
};
