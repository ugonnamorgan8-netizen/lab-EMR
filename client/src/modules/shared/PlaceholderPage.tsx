import { Card } from "../../components/ui/Card";

export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </Card>
  );
}
