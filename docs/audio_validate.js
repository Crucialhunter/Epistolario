import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const eventsFile = path.resolve(__dirname, '../dataset_demo/derived/event_markers.json');
const mp3Dir = path.resolve(__dirname, '../dataset_demo/mp3');
const reportFile = path.resolve(__dirname, 'audio_fetch_validation.json');

const eventsData = JSON.parse(fs.readFileSync(eventsFile, 'utf8'));

const results = [];
let ok = 0;
let notFound = 0;

eventsData.forEach(ev => {
    if (!ev.audio_path) {
        results.push({ event_id: ev.event_id, status: 'NO_AUDIO_PATH' });
        notFound++;
        return;
    }

    // Check file on disk
    const filePath = path.resolve(__dirname, '../dataset_demo', ev.audio_path);
    const exists = fs.existsSync(filePath);
    const hasDoubleMp3 = ev.audio_path.includes('.mp3.mp3');

    if (exists && !hasDoubleMp3) {
        results.push({ event_id: ev.event_id, audio_path: ev.audio_path, status: '200_OK' });
        ok++;
    } else {
        results.push({
            event_id: ev.event_id,
            audio_path: ev.audio_path,
            status: exists ? 'DOUBLE_MP3_WARNING' : '404_NOT_FOUND',
            file_checked: filePath
        });
        notFound++;
    }
});

const report = {
    timestamp: new Date().toISOString(),
    total_events: eventsData.length,
    ok_count: ok,
    not_found_count: notFound,
    results: results
};

fs.writeFileSync(reportFile, JSON.stringify(report, null, 2), 'utf8');

console.log(`Validación completada: ${ok}/${eventsData.length} OK, ${notFound} errores.`);
