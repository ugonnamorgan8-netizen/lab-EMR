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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Patients on record" value={metrics.totalPatients} hint="Total patient registry size" />
        <MetricCard label="Visits today" value={metrics.visitsToday} hint="Registrations since midnight" />
        <MetricCard label="Active visits" value={metrics.activeVisits} hint="Work still moving through the lab" />
        <MetricCard label="Pending collection" value={metrics.pendingSamples} hint="Samples awaiting specimen collection" />
        <MetricCard label="Tests in analysis" value={metrics.testsInAnalysis} hint="Orders currently on the bench" />
        <MetricCard label="Reports ready" value={metrics.reportsGenerated} hint="Generated or dispatched reports" />
        <MetricCard label="Collected revenue" value={formatCurrency(metrics.revenueCollected)} hint="Payments recorded in the system" />
        <MetricCard label="Outstanding balance" value={formatCurrency(metrics.outstandingBalance)} hint="Open patient receivables" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Queue pressure</h3>
              <p className="text-sm text-slate-500">Current status, urgency, and breach posture</p>
            </div>
            <StatusBadge status={metrics.tatBreaches === 0 ? "IN_CONTROL" : "TAT_BREACH"} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">Visit statuses</p>
              {analytics.data.visitStatusBreakdown.map((item) => (
                <div key={item.status} className="flex items-center justify-between rounded-2xl border border-brand-border p-3">
                  <StatusBadge status={item.status} />
                  <span className="font-semibold text-slate-900">{item.count}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">Urgency mix</p>
              {analytics.data.urgencyBreakdown.map((item) => (
                <div key={item.urgency} className="flex items-center justify-between rounded-2xl border border-brand-border p-3">
                  <StatusBadge status={item.urgency} />
                  <span className="font-semibold text-slate-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
            {metrics.tatBreaches} test order{metrics.tatBreaches === 1 ? "" : "s"} are currently beyond TAT.
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Recent activity</h3>
            <p className="text-sm text-slate-500">Latest visits entering or moving through the workflow</p>
          </div>
          {analytics.data.recentVisits.length === 0 ? (
            <EmptyState title="No recent visits" message="New activity will show up here automatically." />
          ) : (
            <div className="space-y-3">
              {analytics.data.recentVisits.map((visit) => (
                <div key={visit.id} className="rounded-2xl border border-brand-border p-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{visit.patientName}</p>
                      <p className="text-sm text-slate-500">
                        {visit.visitId} - {visit.testCount} tests - {formatDate(visit.registeredAt)}
                      </p>
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

      <Card className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Department workload</h3>
          <p className="text-sm text-slate-500">Test-order volume by department</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {analytics.data.departmentVolumes.map((item) => (
            <div key={item.department} className="rounded-2xl border border-brand-border p-3">
              <p className="text-sm text-slate-500">{item.department}</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{item.count}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
