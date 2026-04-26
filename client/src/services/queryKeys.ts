export const queryKeys = {
  patientsSearch: (query: string) => ["patients", "search", query] as const,
  patient: (id: string) => ["patients", id] as const,
  visits: (filters?: Record<string, string | undefined>) => ["visits", filters] as const,
  samples: (filters?: Record<string, string | undefined>) => ["samples", filters] as const,
  catalog: () => ["catalog"] as const,
  invoice: (visitId: string) => ["invoice", visitId] as const,
  notifications: () => ["notifications"] as const,
};
