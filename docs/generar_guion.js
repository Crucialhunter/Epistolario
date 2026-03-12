import fs from 'fs';
import path from 'path';

// Asegurar rutas desde donde se ejecute el script (asumiendo que se llama desde la raiz del proyecto)
const inputFile = path.resolve('dataset_demo/derived/event_markers.json');
const outputFile = path.resolve('docs/narracion_eventos.txt');

try {
    const rawArgs = fs.readFileSync(inputFile, 'utf8');
    const data = JSON.parse(rawArgs);

    // Ordenar por date_iso ascendente (sin fecha al final)
    data.sort((a, b) => {
        const d1 = a.date_iso || '9999-99-99';
        const d2 = b.date_iso || '9999-99-99';
        return d1.localeCompare(d2);
    });

    let out = '';
    let processed = 0;
    let errors = [];

    // Limpia comillas y caracteres no deseados
    const cleanStr = (str) => {
        if (!str) return '';
        return String(str).replace(/[""«»“”‘’]/g, '').trim();
    };

    data.forEach(ev => {
        if (!ev.title || !ev.summary) {
            errors.push(ev.event_id || 'UNKNOWN');
            return;
        }

        const title = cleanStr(ev.title);
        const date = ev.date_iso || '(sin fecha)';

        let placesStr = '';
        if (ev.place_labels && ev.place_labels.length > 0) {
            placesStr = ev.place_labels.join(', ');
        } else if (ev.place_keys && ev.place_keys.length > 0) {
            placesStr = ev.place_keys.join(', ');
        }

        // Encabezado
        out += `EVENTO: ${title}\n`;
        if (placesStr) {
            out += `FECHA: ${date} | LUGARES: ${placesStr}\n`;
        } else {
            out += `FECHA: ${date}\n`;
        }

        // Nombre de archivo de audio
        const audioDate = ev.date_iso || 'sin-fecha';
        const eventId = ev.event_id || 'no-id';
        const slug = title.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 60)
            .replace(/-+$/, '');

        out += `AUDIO: ${audioDate}__${eventId}__${slug}.mp3\n\n`;

        // Párrafo 1
        const p1 = cleanStr(ev.summary);
        out += p1 + '\n\n';

        // Párrafo 2
        let p2 = '';
        const lettersCount = (ev.letters_source && Array.isArray(ev.letters_source)) ? ev.letters_source.length : 0;

        if (lettersCount === 1) {
            p2 = 'Lo sabemos por una carta conservada en el legajo que detalla estos sucesos.';
        } else if (lettersCount > 1) {
            p2 = 'Lo sabemos por varias cartas conservadas en el legajo que detallan estos sucesos.';
        } else {
            if (ev.evidence_quotes && ev.evidence_quotes.length > 0) {
                p2 = 'Esta información se sustenta en referencias documentales conservadas en el archivo.';
            } else {
                p2 = 'Estos hechos han quedado atestiguados en los registros históricos del legajo.';
            }
        }

        out += p2 + '\n\n\n';
        processed++;
    });

    out += 'VALIDACIÓN\n';
    out += `Eventos procesados: ${processed}\n`;
    if (errors.length > 0) {
        out += `IDs sin título/resumen: ${errors.join(', ')}\n`;
    }

    fs.writeFileSync(outputFile, out, 'utf8');
    console.log(`¡Éxito! Procesados: ${processed}, Errores: ${errors.length}. Creado: ${outputFile}`);

} catch (err) {
    console.error('Error procesando el archivo:', err);
}
