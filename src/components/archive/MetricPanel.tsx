import { ArchiveMetricVM } from '@/lib/view-models';

export default function MetricPanel({ metrics }: { metrics: ArchiveMetricVM[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <article key={metric.label} className="app-surface rounded-[1.45rem] px-5 py-5">
          <p className="app-label">{metric.label}</p>
          <p className="reader-display mt-3 text-3xl font-semibold text-[#221c13]">{metric.value}</p>
          <p className="mt-2 text-sm leading-relaxed text-[#6a5d47]">{metric.hint}</p>
        </article>
      ))}
    </div>
  );
}
