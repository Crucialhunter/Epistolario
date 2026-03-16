import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const eventsFile = path.resolve(__dirname, '../dataset_demo/derived/event_markers.json');
const mp3Dir = path.resolve(__dirname, '../dataset_demo/mp3');
const reportFile = path.resolve(__dirname, 'audio_binding_report.md');

try {
    // 1) Leer event_markers.json
    const eventsData = JSON.parse(fs.readFileSync(eventsFile, 'utf8'));
    const totalEvents = eventsData.length;

    // Lista de event_id
    const eventIds = new Set();
    const eventIdMap = new Map(); // Para buscar despues
    eventsData.forEach(ev => {
        if (ev.event_id) {
            eventIds.add(ev.event_id);
            eventIdMap.set(ev.event_id, ev);
        }
    });

    // 2) Escanear mp3/
    let totalMp3 = 0;
    const mp3Files = [];
    if (fs.existsSync(mp3Dir)) {
        const files = fs.readdirSync(mp3Dir);
        for (const file of files) {
            if (file.toLowerCase().endsWith('.mp3')) {
                mp3Files.push(file);
                totalMp3++;
            }
        }
    }

    // 3) Construir mapa: event_id -> filename
    let matchedCount = 0;
    const missingMp3 = [];
    const orphanMp3 = new Set(mp3Files); // Empezamos asumiendo que todos son huerfanos
    const bindings = new Map();

    // Verificamos cada evento
    for (const eid of eventIds) {
        // Regla: el filename contiene `__${event_id}__`
        const pattern = `__${eid}__`;
        let foundMatch = null;

        for (const file of mp3Files) {
            if (file.includes(pattern)) {
                foundMatch = file;
                orphanMp3.delete(file);
                break;
            }
        }

        if (foundMatch) {
            bindings.set(eid, foundMatch);
            matchedCount++;
        } else {
            missingMp3.push(eid);
        }
    }

    // 4) Reporte
    let md = `# Audio Binding Report\n\n`;
    md += `- **Total Events:** ${totalEvents}\n`;
    md += `- **Total MP3 Files:** ${totalMp3}\n`;
    md += `- **Matched Count:** ${matchedCount}\n\n`;

    if (missingMp3.length > 0) {
        md += `## ❌ Missing MP3 for Events\n`;
        missingMp3.forEach(eid => {
            md += `- \`${eid}\`\n`;
        });
        md += '\n';
    } else {
        md += `## ✅ All Events have an Audio Match\n\n`;
    }

    if (orphanMp3.size > 0) {
        md += `## ⚠️ Orphan MP3 Files (No matching event_id)\n`;
        orphanMp3.forEach(file => {
            md += `- \`${file}\`\n`;
        });
        md += '\n';
    }

    md += `## Mappings\n`;
    bindings.forEach((filename, eid) => {
        md += `- \`${eid}\` -> \`${filename}\`\n`;
    });

    fs.writeFileSync(reportFile, md, 'utf8');

    console.log(`Report generated. Matches: ${matchedCount}/${totalEvents}. Missing: ${missingMp3.length}. Orphans: ${orphanMp3.size}.`);

    if (matchedCount !== totalEvents) {
        console.warn(`WARNING: Matched count (${matchedCount}) does not equal total events (${totalEvents}). Please check the report.`);
    }

} catch (err) {
    console.error('Error during audit:', err);
}
