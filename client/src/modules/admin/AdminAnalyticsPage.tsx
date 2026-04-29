import { MetricCard } from "../../components/shared/MetricCard";
import { PageHero } from "../../components/shared/PageHero";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { useQuery } from "@tanstack/react-query";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";
import type { AdminAnalytics } from "../../types/app";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

const DEPARTMENT_ICONS: Record<string, string> = {
  Haematology: "🩸",
  Biochemistry: "⚗️",
  Microbiology: "🦠",
  Immunology: "🛡️",
  Histopathology: "🔬",
  Parasitology: "🧫",
  Serology: "💉",
  Urinalysis: "🧪",
  Coagulation: "🩺",
  Endocrinology: "⚡",
};

export function AdminAnalyticsPage() {
  const analytics = useQuery({
    queryKey: queryKeys.adminAnalytics(),
    queryFn: async () => {
      const response = await api.get("/admin/analytics");
      return response.data as AdminAnalytics;
    },
  });

  if (analytics.isLoading) {
    return <Skeleton className="h-72 w-full" />;
  }

  if (analytics.isError || !analytics.data) {
    return <EmptyState title="Analytics unavailable" message="Operational metrics could not be loaded right now." />;
  }

  const { metrics } = analytics.data;

  return (
    <div className="space-y-5">
      <PageHero
        eyebrow="Executive Oversight"
        title="Analytics dashboard"
        description="A command-level view of throughput, TAT pressure, patient volume, and revenue exposure across the lab."
        aside={<div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-slate-100">Snapshot {formatDate(analytics.data.generatedAt)}</div>}
      />

      {/* ── Top 8 metric cards ──────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Patients on record"
          value={metrics.totalPatients}
          hint="Total patient registry size"
          icon="👥"
          variant="blue"
        />
        <MetricCard
          label="Visits today"
          value={metrics.visitsToday}
          hint="Registrations since midnight"
          icon="🏥"
          variant="teal"
        />
        <MetricCard
          label="Active visits"
          value={metrics.activeVisits}
          hint="Work still moving through the lab"
          icon="⚡"
          variant="violet"
        />
        <MetricCard
          label="Pending collection"
          value={metrics.pendingSamples}
          hint="Samples awaiting specimen collection"
          icon="🧪"
          variant="amber"
        />
        <MetricCard
          label="Tests in analysis"
          value={metrics.testsInAnalysis}
          hint="Orders currently on the bench"
          icon="🔬"
          variant="indigo"
        />
        <MetricCard
          label="Reports ready"
          value={metrics.reportsGenerated}
          hint="Generated or dispatched reports"
          icon="📄"
          variant="green"
        />
        <MetricCard
          label="Collected revenue"
          value={formatCurrency(metrics.revenueCollected)}
          hint="Payments recorded in the system"
          icon="💰"
          variant="emerald"
        />
        <MetricCard
          label="Outstanding balance"
          value={formatCurrency(metrics.outstandingBalance)}
          hint="Open patient receivables"
          icon="📊"
          variant="rose"
        />
      </div>

      {/* ── Queue pressure + Recent activity ────────────────────────────── */}
      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card variant="gradient" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 text-xl text-white shadow">
                📡
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Queue pressure</h3>
                <p className="text-sm text-slate-500">Current status, urgency, and breach posture</p>
              </div>
            </div>
            <StatusBadge status={metrics.tatBreaches === 0 ? "IN_CONTROL" : "TAT_BREACH"} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">Visit statuses</p>
              {analytics.data.visitStatusBreakdown.map((item) => (
                <div key={item.status} className="flex items-center justify-between rounded-2xl border border-brand-border bg-white/70 p-3 shadow-sm">
                  <StatusBadge status={item.status} />
                  <span className="font-semibold text-slate-900">{item.count}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">Urgency mix</p>
              {analytics.data.urgencyBreakdown.map((item) => (
                <div key={item.urgency} className="flex items-center justify-between rounded-2xl border border-brand-border bg-white/70 p-3 shadow-sm">
                  <StatusBadge status={item.urgency} />
                  <span className="font-semibold text-slate-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-white/60 p-3 text-sm text-slate-600">
            <span className="text-lg">⏱️</span>
            {metrics.tatBreaches} test order{metrics.tatBreaches === 1 ? "" : "s"} are currently beyond TAT.
          </div>
        </Card>

        <Card variant="gradient" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 text-xl text-white shadow">
              🕐
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Recent activity</h3>
              <p className="text-sm text-slate-500">Latest visits entering or moving through the workflow</p>
            </div>
          </div>
          {analytics.data.recentVisits.length === 0 ? (
            <EmptyState title="No recent visits" message="New activity will show up here automatically." />
          ) : (
            <div className="space-y-3">
              {analytics.data.recentVisits.map((visit) => (
                <div key={visit.id} className="rounded-2xl border border-brand-border bg-white/70 p-3 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-lg">
                        🧑‍⚕️
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{visit.patientName}</p>
                        <p className="text-sm text-slate-500">
                          {visit.visitId} · {visit.testCount} tests · {formatDate(visit.registeredAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={visit.urgency} />
                      <StatusBadge status={visit.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Department workload ──────────────────────────────────────────── */}
      <Card variant="accent" className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-700 text-xl text-white shadow">
            🏛️
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Department workload</h3>
            <p className="text-sm text-slate-500">Test-order volume by department</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {analytics.data.departmentVolumes.map((item) => (
            <div
              key={item.department}
              className="flex items-center gap-4 rounded-2xl border border-brand-border bg-white/70 p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-blue-50 text-2xl shadow-sm">
                {DEPARTMENT_ICONS[item.department] ?? "🔬"}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.department}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{item.count}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
