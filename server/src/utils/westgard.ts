export type QCPoint = {
  zScore: number;
};

export type WestgardRule =
  | "IN_CONTROL"
  | "WARNING_1_2S"
  | "REJECT_1_3S"
  | "REJECT_2_2S"
  | "REJECT_R_4S"
  | "REJECT_4_1S"
  | "REJECT_10X";

export function applyWestgardRules(history: QCPoint[]): WestgardRule {
  if (history.length === 0) {
    return "IN_CONTROL";
  }

  const last = history.at(-1)!;

  if (Math.abs(last.zScore) > 3) {
    return "REJECT_1_3S";
  }

  if (Math.abs(last.zScore) > 2) {
    if (history.length >= 2) {
      const prev = history.at(-2)!;
      if ((last.zScore > 2 && prev.zScore > 2) || (last.zScore < -2 && prev.zScore < -2)) {
        return "REJECT_2_2S";
      }
      if ((last.zScore > 2 && prev.zScore < -2) || (last.zScore < -2 && prev.zScore > 2)) {
        return "REJECT_R_4S";
      }
    }

    return "WARNING_1_2S";
  }

  if (
    history.length >= 4 &&
    history.slice(-4).every((point) => point.zScore > 1 || point.zScore < -1) &&
    (history.slice(-4).every((point) => point.zScore > 1) || history.slice(-4).every((point) => point.zScore < -1))
  ) {
    return "REJECT_4_1S";
  }

  if (
    history.length >= 10 &&
    (history.slice(-10).every((point) => point.zScore > 0) || history.slice(-10).every((point) => point.zScore < 0))
  ) {
    return "REJECT_10X";
  }

  return "IN_CONTROL";
}
