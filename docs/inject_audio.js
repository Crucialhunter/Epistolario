import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const eventsFile = path.resolve(__dirname, '../dataset_demo/derived/event_markers.json');
const backupFile = path.resolve(__dirname, '../dataset_demo/derived/event_markers.before_audio.json');
const mp3Dir = path.resolve(__dirname, '../dataset_demo/mp3');

try {
    // 1) Leer JSON
    const rawArgs = fs.readFileSync(eventsFile, 'utf8');
    const eventsData = JSON.parse(rawArgs);

    // 2) Guardar Backup
    fs.writeFileSync(backupFile, rawArgs, 'utf8');
    console.log(`Backup creado: ${backupFile}`);

    // 3) Leer audios para cruzar
    const mp3Files = [];
    if (fs.existsSync(mp3Dir)) {
        const files = fs.readdirSync(mp3Dir);
        for (const file of files) {
            if (file.toLowerCase().endsWith('.mp3')) {
                mp3Files.push(file);
            }
        }
    }

    // 4) Inyectar metadatos
    let injectedCount = 0;
    eventsData.forEach(ev => {
        if (!ev.event_id) return;

        const pattern = `__${ev.event_id}__`;
        let foundMatch = null;
        for (const file of mp3Files) {
            if (file.includes(pattern)) {
                foundMatch = file;
                break;
            }
        }

        if (foundMatch) {
            ev.audio_file = foundMatch;
            ev.audio_path = `mp3/${foundMatch}`;
            ev.audio_enabled = true;
            injectedCount++;
        }
    });

    // 5) Sobrescribir el master original
    fs.writeFileSync(eventsFile, JSON.stringify(eventsData, null, 2), 'utf8');
    console.log(`JSON Maestro Actualizado. Inyectados: ${injectedCount}/${eventsData.length}`);

} catch (err) {
    console.error('Error during injection:', err);
}
