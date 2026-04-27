import { Card } from "./Card";

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <Card className="flex flex-col items-center justify-center gap-4 py-12 text-center text-slate-500">
      <span aria-hidden="true" className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-400">
        0
      </span>
      <div>
        <p className="font-semibold text-slate-700">{title}</p>
        <p className="mt-1 text-sm leading-6">{message}</p>
      </div>
    </Card>
  );
}
