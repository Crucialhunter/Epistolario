import { DocumentMetadata } from '../types';
import { Check, X, AlertCircle } from 'lucide-react';

interface MetadataComparisonProps {
  groundTruth?: DocumentMetadata;
  prediction?: DocumentMetadata;
}

export default function MetadataComparison({ groundTruth, prediction }: MetadataComparisonProps) {
  if (!groundTruth && !prediction) return null;

  // Collect all unique keys
  const allKeys = new Set<string>();
  if (groundTruth) Object.keys(groundTruth).forEach(k => allKeys.add(k));
  if (prediction) Object.keys(prediction).forEach(k => allKeys.add(k));

  // Filter out internal keys
  const keys = Array.from(allKeys).filter(k => !['transcripcion', 'imagenes', 'capturado_en'].includes(k)).sort();

  if (keys.length === 0) return null;

  return (
    <div className="mb-6 bg-white border border-ink/10 rounded-lg overflow-hidden">
      <div className="bg-stone/20 px-4 py-2 border-b border-ink/10 flex justify-between items-center">
        <h3 className="text-xs font-semibold text-ink/60 uppercase tracking-wider">Extracción de Metadatos</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-ink/60 bg-stone/5 border-b border-ink/5">
            <tr>
              <th className="px-4 py-2 font-medium">Campo</th>
              <th className="px-4 py-2 font-medium">Ground Truth</th>
              <th className="px-4 py-2 font-medium">Predicción del Modelo</th>
              <th className="px-4 py-2 font-medium w-10 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {keys.map(key => {
              const gtVal = groundTruth ? groundTruth[key] : undefined;
              const predVal = prediction ? prediction[key] : undefined;

              const isMatch = String(gtVal).trim().toLowerCase() === String(predVal).trim().toLowerCase();
              const isMissingGt = gtVal === undefined || gtVal === null || gtVal === '';
              const isMissingPred = predVal === undefined || predVal === null || predVal === '';

              let statusIcon = null;
              let rowClass = "";

              if (isMatch && !isMissingGt) {
                statusIcon = <Check className="w-4 h-4 text-olive" />;
                rowClass = "bg-olive/5";
              } else if (!isMissingGt && !isMissingPred && !isMatch) {
                statusIcon = <X className="w-4 h-4 text-burgundy" />;
                rowClass = "bg-burgundy/5";
              } else if (isMissingGt && !isMissingPred) {
                statusIcon = <span title="Encontrado por modelo, ausente en GT"><AlertCircle className="w-4 h-4 text-ink/40" /></span>;
                rowClass = "bg-stone/10";
              } else if (!isMissingGt && isMissingPred) {
                statusIcon = <span title="Omitido por modelo"><X className="w-4 h-4 text-burgundy/50" /></span>;
                rowClass = "bg-burgundy/5";
              }

              return (
                <tr key={key} className={`hover:bg-stone/5 transition-colors ${rowClass}`}>
                  <td className="px-4 py-2 font-medium text-ink/70 capitalize">{key.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-2 text-ink/90">{gtVal !== undefined ? String(gtVal) : <span className="text-ink/30 italic">No proporcionado</span>}</td>
                  <td className="px-4 py-2 text-ink/90">{predVal !== undefined ? String(predVal) : <span className="text-ink/30 italic">No extraído</span>}</td>
                  <td className="px-4 py-2 flex justify-center">{statusIcon}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
