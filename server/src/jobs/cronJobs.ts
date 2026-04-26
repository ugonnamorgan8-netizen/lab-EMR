export function startCronJobs() {
  const noop = () => undefined;
  setInterval(noop, 15 * 60 * 1000);
}
