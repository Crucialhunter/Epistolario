import { ArchiveMetricVM } from '@/lib/view-models';

export default function MetricPanel({ metrics }: { metrics: ArchiveMetricVM[] }) {
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-4 sm:flex-row sm:gap-0">
      {metrics.map((metric, index) => (
        <div key={metric.label} className="flex items-center gap-0">
          {/* Vertical divider between items (not before first) */}
          {index > 0 && (
            <div className="hidden h-14 w-px bg-gradient-to-b from-transparent via-[#c5a059]/25 to-transparent sm:block sm:mx-10 md:mx-14 lg:mx-16" />
          )}
          <div className="text-center">
            <p className="reader-display text-[2.2rem] font-semibold leading-none text-[#221c13] md:text-[2.6rem]">
              {metric.value}
            </p>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.26em] text-[#8f7742]">
              {metric.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
