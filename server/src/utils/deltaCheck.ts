export function calculateDeltaCheck(previous: number, current: number) {
  const difference = current - previous;
  const percentChange = previous === 0 ? 100 : Math.abs((difference / previous) * 100);
  return {
    difference,
    percentChange: Number(percentChange.toFixed(2)),
  };
}

export function isDeltaCheckWithinLimit(previous: number, current: number, limitPercent: number) {
  return calculateDeltaCheck(previous, current).percentChange <= limitPercent;
}
