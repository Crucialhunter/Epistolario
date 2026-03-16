import { ArchiveMetricVM } from '@/lib/view-models';

export default function MetricPanel({ metrics }: { metrics: ArchiveMetricVM[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <article key={metric.label} className="rounded-[1.5rem] border border-[#e7dcc6] bg-white px-5 py-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f7742]">{metric.label}</p>
          <p className="reader-display mt-3 text-3xl font-semibold text-[#221c13]">{metric.value}</p>
          <p className="mt-2 text-sm leading-relaxed text-[#6a5d47]">{metric.hint}</p>
        </article>
      ))}
    </div>
  );
}
