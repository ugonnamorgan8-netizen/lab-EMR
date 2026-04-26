import { Card } from "./Card";

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 py-10 text-center text-slate-500">
      <span aria-hidden="true" className="text-2xl">◻</span>
      <div>
        <p className="font-semibold text-slate-700">{title}</p>
        <p className="text-sm">{message}</p>
      </div>
    </Card>
  );
}
