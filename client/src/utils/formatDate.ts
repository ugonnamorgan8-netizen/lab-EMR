export function formatDate(value?: string | Date | null) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
