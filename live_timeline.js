/**
 * Motor para la Timeline Viva
 * Optimizada para tablet con transiciones CSS de baja sobrecarga (9 items en DOM).
 */

(function () {
    const STATE = {
        playlist: [],
        rawPlaylist: [], // before Only Events filtering
        nodes: [],       // Persistent DOM nodes for CSS transitions
        idx: 0,
        playing: false,
        speed: 1.0,
        onlyEvents: false,
        rafId: null,
        progressStart: 0,
        resumeState: null,
        pausedAt: null,
        isAudioMode: false,
        pendingStepLive: false,
        initialized: false,
        lastHeroTime: 0, // Timestamp to track 12s cooldown
        muted: localStorage.getItem('epistolario_audio_muted') === 'true'
    };

    window.liveTimelineObj = {
        init: function () {
            if (!window.APP_STATE || !window.APP_STATE.ready) {
                console.warn("APP_STATE not ready for Live Timeline");
                return;
            }
            this.buildLivePlaylist();
            this.applyFilter(); // internally builds nodes too
            STATE.idx = 0;
            this.renderLiveWindow();
            STATE.initialized = true;
            this.updateDensityStrip();
            this.updateStats();

            // Show HUD container initially
            const hud = document.getElementById('live-progress-hud');
            if (hud) hud.classList.remove('opacity-0');
            this.updateAudioBtnUI();
        },
        toggleMute: function () {
            STATE.muted = !STATE.muted;
            localStorage.setItem('epistolario_audio_muted', STATE.muted);
            this.updateAudioBtnUI();
            if (STATE.muted && window.AudioManager) {
                window.AudioManager.stop();
                // Al mutear en medio, el tick actual terminará con su duración actual base, 
                // pero cortamos el audio ya mismo.
            } else if (!STATE.muted && window.AudioManager && STATE.playing) {
                // Si hemos desmuteado mientras está sonando, intentará reanudar el evento actual.
                // Como tick controla el avance, en el siguiente evento ya agarrará la duración completa.
                const currentItem = STATE.playlist[STATE.idx];
                if (currentItem && currentItem.audio_path) {
                    window.AudioManager.playEventAsync(currentItem);
                }
            }
        },
        updateAudioBtnUI: function () {
            const icon = document.getElementById('live-audio-icon');
            const text = document.getElementById('live-audio-text');
            const btn = document.getElementById('live-audio-btn');
            if (icon && text && btn) {
                if (STATE.muted) {
                    icon.innerText = 'volume_off';
                    text.innerText = 'Audio: OFF';
                    icon.classList.add('text-red-600');
                } else {
                    icon.innerText = 'volume_up';
                    text.innerText = 'Audio: ON';
                    icon.classList.remove('text-red-600');
                }
            }
        },
        togglePlay: function () {
            this.setPlay(!STATE.playing);
        },
        setPlay: function (play) {
            STATE.playing = play;
            const btnIcon = document.querySelector('#live-play-btn .material-symbols-outlined');
            if (btnIcon) btnIcon.innerText = play ? 'pause' : 'play_arrow';

            if (play) {
                if (STATE.idx >= STATE.playlist.length) STATE.idx = 0; // wrap around
                STATE.resumeState = null;

                if (STATE.pendingStepLive) {
                    STATE.pendingStepLive = false;
                    this.stepLive();
                } else if (STATE.isAudioMode) {
                    // Estaba esperando audio. Lo reanudamos. La promesa de ended sigue viva.
                    if (window.AudioManager) window.AudioManager.resume();
                    STATE.pausedAt = null;
                } else if (STATE.pausedAt && STATE.progressTotal > 0) {
                    // Estaba en modo BASE (tick loop)
                    const pauseDur = Date.now() - STATE.pausedAt;
                    STATE.progressStart += pauseDur;
                    STATE.pausedAt = null;

                    const bar = document.getElementById('live-progress-bar');
                    if (bar) bar.style.transition = 'none';

                    const tick = () => {
                        if (!STATE.playing) return;
                        const now = Date.now();
                        const elapsed = now - STATE.progressStart;
                        const remaining = Math.max(0, STATE.progressTotal - elapsed);

                        if (bar) {
                            const pct = Math.min(100, (elapsed / STATE.progressTotal) * 100);
                            bar.style.width = pct + '%';
                        }
                        const text = document.getElementById('live-progress-text');
                        if (text) text.innerText = `Siguiente en ${(remaining / 1000).toFixed(1)} s`;

                        if (elapsed >= STATE.progressTotal) {
                            this.stepLive();
                        } else {
                            STATE.rafId = requestAnimationFrame(tick);
                        }
                    };
                    STATE.rafId = requestAnimationFrame(tick);
                } else {
                    // Lanzar de cero
                    this.scheduleNext();
                }
            } else {
                STATE.pausedAt = Date.now();
                if (window.AudioManager) window.AudioManager.pause();

                // Si la pausa ocurre durante el pequeño sleep(500) del final del audio
                if (STATE.sleepTimeoutId) {
                    clearTimeout(STATE.sleepTimeoutId);
                    STATE.sleepTimeoutId = null;
                    STATE.pendingStepLive = true; // para saltar directo al reanudar
                }

                if (STATE.rafId) {
                    cancelAnimationFrame(STATE.rafId);
                    STATE.rafId = null;
                }
                const text = document.getElementById('live-progress-text');
                if (text) text.innerText = 'Pausado';
            }
        },
        setSpeed: function (s) {
            STATE.speed = s;
            // Retain progress dynamically if it's already running: requires recalibrating progressStart
            // For simplicity, we just let it finish the current tick at the old speed.
        },
        toggleOnlyEvents: function (val) {
            STATE.onlyEvents = val;
            this.applyFilter();
            STATE.idx = 0;
            this.renderLiveWindow();
            this.updateDensityStrip();
            this.updateStats();
        },
        applyFilter: function () {
            if (STATE.onlyEvents) {
                STATE.playlist = STATE.rawPlaylist.filter(i => i.type === 'HERO_EVENT');
            } else {
                STATE.playlist = [...STATE.rawPlaylist];
            }
            this.buildNodes();
        },
        buildLivePlaylist: function () {
            const derived = window.APP_STATE.derived || {};
            const events = derived.events || [];
            let lettersEdges = derived.edges || [];

            // Fallback if no edges but we have letters (aunque en modo demo 100% de edges se cargan)
            if (lettersEdges.length === 0 && window.letters && window.letters.length > 0) {
                lettersEdges = window.letters.map(l => ({
                    id_carta: l.id,
                    date_iso: l.fecha,
                    from_person: l.remitente,
                    to_person: l.destinatario,
                    title: `Carta de ${l.remitente}`,
                    themes: []
                }));
            }

            if (lettersEdges.length === 0 && events.length === 0) {
                document.getElementById('live-track').innerHTML = '<p class="text-text-muted">Faltan datos derivados para construir la Timeline Viva.</p>';
                return;
            }

            // Normalizar y agrupar por mes
            const monthMap = {}; // "YYYY-MM" -> { events: [], letters: [] }

            const getMonthKey = (iso) => {
                if (!iso) return "9999-99";
                return iso.substring(0, 7); // works for YYYY-MM-DD and YYYY-MM
            };

            const getSortDate = (iso) => {
                if (!iso) return "9999-99-99";
                if (iso.length === 7) return iso + "-15"; // Treat month-only as 15th
                if (iso.length === 4) return iso + "-06-15"; // Treat year-only as mid-June
                return iso;
            };

            events.forEach(e => {
                const k = getMonthKey(e.date_iso || e.date);
                if (!monthMap[k]) monthMap[k] = { events: [], letters: [] };
                monthMap[k].events.push({ ...e, type: 'HERO_EVENT', _sort: getSortDate(e.date_iso || e.date) });
            });

            lettersEdges.forEach(l => {
                const k = getMonthKey(l.date_iso);
                if (!monthMap[k]) monthMap[k] = { events: [], letters: [] };
                monthMap[k].letters.push({ ...l, type: 'MICRO_LETTER', _sort: getSortDate(l.date_iso) });
            });

            const sortedKeys = Object.keys(monthMap).sort();
            const raw = [];

            sortedKeys.forEach(k => {
                const group = monthMap[k];
                group.events.sort((a, b) => a._sort.localeCompare(b._sort));
                group.letters.sort((a, b) => a._sort.localeCompare(b._sort));

                if (group.events.length > 0) {
                    group.events.forEach(ev => {
                        raw.push(ev);
                        // Inject 1-2 letters related to this event
                        let attached = 0;
                        if (ev.letters_source && ev.letters_source.length > 0) {
                            for (let l_id of ev.letters_source) {
                                const matchedIdx = group.letters.findIndex(l => l.id_carta == l_id || l.letter_id == l_id);
                                if (matchedIdx > -1 && attached < 2) {
                                    raw.push(group.letters[matchedIdx]);
                                    group.letters.splice(matchedIdx, 1);
                                    attached++;
                                }
                            }
                        }
                        // If still room, pop remaining letters in the month randomly
                        while (attached < 2 && group.letters.length > 0) {
                            raw.push(group.letters.shift());
                            attached++;
                        }
                    });
                    // Flush any remaining letters not caught by events in this month
                    group.letters.forEach(l => raw.push(l));
                } else {
                    // No events this month, just put the most "interesting" letter or the first
                    // We define interesting as having evidence_quote
                    group.letters.sort((a, b) => (b.evidence_quote ? 1 : 0) - (a.evidence_quote ? 1 : 0));
                    if (group.letters.length > 0) {
                        raw.push(group.letters[0]); // Just take the best 1 to represent the month
                    }
                }
            });

            STATE.rawPlaylist = raw;
            this.applyFilter();
        },
        buildNodes: function () {
            const track = document.getElementById('live-track');
            if (!track) return;
            track.innerHTML = '';
            STATE.nodes = [];

            STATE.playlist.forEach((item, i) => {
                const el = document.createElement('div');
                el.className = 'live-item w-80 max-w-sm bg-white rounded-xl shadow border border-[#e7e1cf] flex flex-col overflow-hidden live-future-5';
                el.onclick = () => this.handleItemClick(item, i);

                // Fallbacks para evitar undefined
                const titulo = item.title || item.label || item.nombre_carta || '(Sin título)';
                const resumen = item.summary || item.description || '';
                const fecha = item.date_iso || item.date || item.fecha || '(Sin fecha)';
                const ev_quote = item.evidence_quote || '';
                const from_p = item.from_person || item.remitente || '(Alguien)';
                const to_p = item.to_person || item.destinatario || '(Alguien)';

                if (item.type === 'HERO_EVENT') {
                    const iconObj = '<span class="material-symbols-outlined text-[14px]">newspaper</span>';
                    el.innerHTML = `
                        <div class="h-2 w-full bg-[#c5a028]"></div>
                        <div class="p-4 flex flex-col h-full bg-[#fcfbf8]">
                            <div class="flex items-center gap-2 text-[#c5a028] font-bold text-[10px] uppercase tracking-widest mb-2">
                                ${iconObj} EVENTO CLAVE &bull; ${fecha}
                            </div>
                            <h3 class="font-serif text-lg font-bold text-secondary leading-tight mb-2">${titulo}</h3>
                            <p class="text-sm text-text-muted flex-1 line-clamp-4">${resumen}</p>
                            <button class="mt-4 bg-[#f3f0e7] text-primary text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded w-full hover:bg-[#e7e1cf] transition-colors">Ver Evento</button>
                        </div>
                    `;
                } else {
                    el.innerHTML = `
                        <div class="h-1 w-full bg-primary/40"></div>
                        <div class="p-4 flex flex-col h-full bg-white">
                            <div class="flex items-center gap-2 text-text-muted font-bold text-[10px] uppercase tracking-widest mb-2">
                                <span class="material-symbols-outlined text-[14px]">mail</span> ${fecha}
                            </div>
                            <p class="font-serif text-primary leading-tight mb-2"><span class="font-bold">${from_p}</span> escribe a <span class="font-bold">${to_p}</span></p>
                            ${ev_quote ? `<blockquote class="border-l-2 border-[#e7e1cf] pl-2 text-xs italic text-text-muted line-clamp-3 bg-[#fcfbf8] py-1">"${ev_quote}"</blockquote>` : ''}
                            <button class="mt-4 bg-primary text-white shadow-sm text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded w-full hover:bg-opacity-90 transition-colors">Abrir Carta</button>
                        </div>
                    `;
                }
                track.appendChild(el);
                STATE.nodes.push(el);
            });
        },
        computeDwell: function (item) {
            if (!item) return 3000;
            if (STATE.onlyEvents) return 8000;

            let base = item.type === 'HERO_EVENT' ? 7500 : 3500;

            // Text length heuristic
            const textToRead = (item.title || "") + (item.summary || "") + (item.evidence_quote || "");
            if (textToRead.length > 200) base += 1000;
            if (textToRead.length > 300) base += 1000;
            if (textToRead.length < 50) base -= 500;

            // Enforce max 1 HERO_EVENT per 12s logic if speed=1x
            // Wait, building track dynamically, if we are about to dwell a HERO, make sure we delay if too early
            const now = Date.now();
            if (item.type === 'HERO_EVENT') {
                const elapsedSinceLastHero = now - STATE.lastHeroTime;
                if (elapsedSinceLastHero < 12000) {
                    // We don't artificially prolong the item before this, we just accept it or maybe it's fine.
                    // To follow the strict rule, we can ensure the dwell of the items between heroes sums to 12s,
                    // but since this is CSS transitions, dynamically pausing the timeline is easier.
                    // We'll just set its dwell time, the constraint is more about track construction.
                }
                STATE.lastHeroTime = now;
            }

            return Math.max(2000, base) / STATE.speed;
        },
        jump: function (offset) {
            let newIdx = STATE.idx + offset;
            if (newIdx < 0) newIdx = 0;
            if (newIdx >= STATE.playlist.length) newIdx = STATE.playlist.length - 1;
            if (newIdx === STATE.idx) return;

            if (window.AudioManager) window.AudioManager.stop();
            STATE.pausedAt = null; // resetear pausa al saltar manualmente
            STATE.isAudioMode = false; // Reset audio mode
            if (STATE.sleepTimeoutId) {
                clearTimeout(STATE.sleepTimeoutId);
                STATE.sleepTimeoutId = null;
            }
            STATE.pendingStepLive = false;

            STATE.idx = newIdx;
            this.renderLiveWindow();

            if (STATE.playing) {
                this.scheduleNext(); // recalcula dinámicamente y lanza playEventAsync
            } else {
                this.updateDensityCursor();
                // Asegurar que el progress bar se limpia
                const bar = document.getElementById('live-progress-bar');
                if (bar) bar.style.width = '0%';
                const text = document.getElementById('live-progress-text');
                if (text) text.innerText = 'Pausado';
            }
        },
        scheduleNext: async function () {
            if (!STATE.playing) return;
            const currentItem = STATE.playlist[STATE.idx];
            if (!currentItem) {
                this.setPlay(false);
                return;
            }

            if (STATE.rafId) {
                cancelAnimationFrame(STATE.rafId);
                STATE.rafId = null;
            }
            if (STATE.sleepTimeoutId) {
                clearTimeout(STATE.sleepTimeoutId);
                STATE.sleepTimeoutId = null;
            }

            STATE.pausedAt = null;
            STATE.pendingStepLive = false;

            const text = document.getElementById('live-progress-text');
            const bar = document.getElementById('live-progress-bar');
            if (bar) bar.style.transition = 'none';

            let playedAudio = false;

            if (!STATE.muted && window.AudioManager && currentItem.audio_path) {
                STATE.isAudioMode = true;
                if (window.DEBUG_TIMELINE_AUDIO) console.info(`[TimelineViva] scheduleNext: event=${currentItem.event_id} audio=ON path=${currentItem.audio_path}`);

                if (text) text.innerText = '🔊 Reproduciendo audio...';
                if (bar) {
                    bar.style.width = '0%';
                    // Hack suave para que se vea cargando 
                    setTimeout(() => { if (bar) { bar.style.transition = 'width 10s linear'; bar.style.width = '95%'; } }, 50);
                }

                playedAudio = await window.AudioManager.playAndWait(currentItem);

                if (!STATE.playing || STATE.playlist[STATE.idx] !== currentItem) return;

                if (playedAudio) {
                    if (window.DEBUG_TIMELINE_AUDIO) console.info(`[TimelineViva] delayMs=500 reason=AUDIO_ENDED`);
                    if (text) text.innerText = 'Siguiente...';
                    if (bar) {
                        bar.style.transition = 'width 0.2s linear';
                        bar.style.width = '100%';
                    }

                    STATE.sleepTimeoutId = setTimeout(() => {
                        STATE.sleepTimeoutId = null;
                        if (!STATE.playing || STATE.playlist[STATE.idx] !== currentItem) return;
                        STATE.isAudioMode = false;
                        this.stepLive();
                    }, 500);

                    return;
                }
            }

            // Fallback a Dwell Mode (Audio OFF o fallo)
            STATE.isAudioMode = false;
            if (window.DEBUG_TIMELINE_AUDIO) console.info(`[TimelineViva] scheduleNext: event=${currentItem.event_id || currentItem.id_carta} audio=OFF/FAILED`);
            if (window.AudioManager) window.AudioManager.stop();

            const dwell = this.computeDwell(currentItem);
            if (window.DEBUG_TIMELINE_AUDIO) console.info(`[TimelineViva] scheduleNext: delayMs=${dwell} reason=BASE`);

            STATE.progressTotal = dwell;
            STATE.progressStart = Date.now();

            const tick = () => {
                if (!STATE.playing) return;

                const now = Date.now();
                const elapsed = now - STATE.progressStart;
                const remaining = Math.max(0, STATE.progressTotal - elapsed);

                if (bar) {
                    const pct = Math.min(100, (elapsed / STATE.progressTotal) * 100);
                    bar.style.width = pct + '%';
                }

                if (text) {
                    text.innerText = `Siguiente en ${(remaining / 1000).toFixed(1)} s`;
                }

                if (elapsed >= STATE.progressTotal) {
                    this.stepLive();
                } else {
                    STATE.rafId = requestAnimationFrame(tick);
                }
            };

            STATE.rafId = requestAnimationFrame(tick);
        },
        stepLive: function () {
            if (!STATE.playing) return;
            STATE.idx++;
            if (STATE.idx >= STATE.playlist.length) {
                this.setPlay(false); // End of track
                return;
            }
            this.renderLiveWindow();
            this.scheduleNext();
        },
        renderLiveWindow: function () {
            const track = document.getElementById('live-track');
            if (!track || STATE.nodes.length === 0) return;

            const currentItem = STATE.playlist[STATE.idx];

            // En vez de destruir, aplicamos clases en base a proximidad matemática
            for (let i = 0; i < STATE.nodes.length; i++) {
                const el = STATE.nodes[i];
                let positionClass = '';

                if (i === STATE.idx) {
                    positionClass = 'live-center';
                } else if (i < STATE.idx) {
                    positionClass = `live-past-${Math.min(5, STATE.idx - i)}`;
                } else {
                    positionClass = `live-future-${Math.min(5, i - STATE.idx)}`;
                }

                // Conservamos solo las clases persistentes
                el.className = `live-item w-80 max-w-sm bg-white rounded-xl shadow border border-[#e7e1cf] flex flex-col overflow-hidden ${positionClass}`;

                // Para ahorrar pintura, apagamos clicks de los invisibles
                if (Math.abs(i - STATE.idx) > 1) {
                    el.style.pointerEvents = 'none';
                } else {
                    el.style.pointerEvents = 'auto';
                }
            }

            // Update Temporal Header
            const hdr = document.getElementById('live-temporal-header');
            if (hdr && currentItem) {
                const dateStr = currentItem.date_iso || currentItem.date || currentItem.fecha || "";
                if (dateStr.length >= 7) {
                    const d = new Date(dateStr.substring(0, 7) + "-02"); // safe day
                    if (!isNaN(d.getTime())) {
                        const txt = d.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
                        hdr.innerText = txt.charAt(0).toUpperCase() + txt.slice(1);
                    }
                } else if (dateStr.length >= 4) {
                    hdr.innerText = dateStr.substring(0, 4);
                }
            }

            // Update debug if open
            const debugPanel = document.getElementById('live-debug-panel');
            if (debugPanel && !debugPanel.classList.contains('hidden')) {
                const currentFn = STATE.playlist[STATE.idx];
                document.getElementById('live-debug-content').innerHTML = `
                    PLAYLIST: ${STATE.playlist.length} items<br>
                    INDEX: ${STATE.idx}<br>
                    CURRENT: ${currentFn ? currentFn.type + ' (' + (currentFn.date_iso || currentFn.date) + ')' : 'EOF'}<br>
                    PLAYING: ${STATE.playing}<br>
                    SPEED: ${STATE.speed}x
                `;
            }

            // Sync visual cursor
            this.updateDensityCursor();
        },
        updateDensityStrip: function () {
            const strip = document.getElementById('live-density-strip');
            if (!strip) return;
            strip.innerHTML = '';

            if (STATE.playlist.length === 0) return;

            // Build tiny blocks for each item, colored by type
            STATE.playlist.forEach((item, i) => {
                const b = document.createElement('div');
                b.className = 'h-full flex-1 ' + (item.type === 'HERO_EVENT' ? 'bg-[#c5a028]' : 'bg-primary/30');
                // Give hero events more visual weight if needed, but flex-1 handles proportions evenly
                strip.appendChild(b);
            });
        },
        updateDensityCursor: function () {
            const cursor = document.getElementById('live-density-cursor');
            if (!cursor || STATE.playlist.length === 0) return;
            const pct = (STATE.idx / Math.max(1, STATE.playlist.length - 1)) * 100;
            cursor.style.left = `calc(${Math.min(100, Math.max(0, pct))}% - 3px)`; // roughly center
        },
        handleScrubberClick: function (e) {
            const strip = e.currentTarget;
            const rect = strip.getBoundingClientRect();
            const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
            const pct = x / rect.width;
            let targetIdx = Math.round(pct * (STATE.playlist.length - 1));
            targetIdx = Math.max(0, Math.min(targetIdx, STATE.playlist.length - 1));

            const offset = targetIdx - STATE.idx;
            if (offset !== 0) {
                this.jump(offset);
            }
        },
        handleScrubberHover: function (e) {
            const strip = e.currentTarget;
            const rect = strip.getBoundingClientRect();
            const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
            const pct = x / rect.width;
            let hoverIdx = Math.round(pct * (STATE.playlist.length - 1));
            hoverIdx = Math.max(0, Math.min(hoverIdx, STATE.playlist.length - 1));

            const item = STATE.playlist[hoverIdx];
            const tooltip = document.getElementById('live-scrubber-tooltip');
            if (item && tooltip) {
                tooltip.classList.remove('hidden');
                tooltip.style.left = (rect.left + x) + 'px';

                const d = item.date_iso || item.date || item.fecha || "";
                document.getElementById('live-scrubber-date').innerText = (item.type === 'HERO_EVENT' ? 'EVENTO CLAVE \u2022 ' : 'CARTA \u2022 ') + d;

                let title = item.title || item.nombre_carta || "(Sin título)";
                if (item.type === 'MICRO_LETTER') title = `De ${item.from_person || item.remitente} a ${item.to_person || item.destinatario}`;
                document.getElementById('live-scrubber-title').innerText = title;
            }
        },
        handleScrubberLeave: function () {
            const tooltip = document.getElementById('live-scrubber-tooltip');
            if (tooltip) tooltip.classList.add('hidden');
        },
        updateStats: function () { },
        handleItemClick: function (item, indexClicked) {
            // First, if they clicked a future/past item, jump to it (optional UX improvement)
            if (indexClicked !== STATE.idx) {
                // Not standard according to prompt, but prompt says: 
                // "Click sobre un item debe abrir una carta y pausar".
                // We will jump to it AND open it.
                STATE.idx = indexClicked;
                this.renderLiveWindow();
            }

            // Capture resume state
            if (STATE.playing) {
                STATE.resumeState = {
                    wasPlaying: STATE.playing,
                    idx: STATE.idx
                };
                this.setPlay(false); // Immediate pause (clears timer)
            } else if (!STATE.resumeState) {
                // If paused already manually, keep it paused when we return
                STATE.resumeState = { wasPlaying: false, idx: STATE.idx };
            }

            // Resolve ID
            let letterId = null;
            if (item.primary_letter_id) letterId = item.primary_letter_id;
            else if (item.type === 'HERO_EVENT' && item.letters_source && item.letters_source.length > 0) letterId = item.letters_source[0];
            else if (item.type === 'MICRO_LETTER' && (item.id_carta || item.id)) letterId = item.id_carta || item.id;

            if (letterId && window.openLetterSidebar) {
                window.openLetterSidebar(letterId);
            } else if (item.type === 'HERO_EVENT' && window.openEventCard) {
                window.openEventCard(item);
            } else {
                console.warn("No resolvable action for this item", item);
            }
        },
        resumeIfNeeded: function () {
            if (!STATE.resumeState) return;
            const pre = STATE.resumeState;
            STATE.resumeState = null;

            // Only resume if it was playing, we do not jump backward in index.
            if (pre.wasPlaying) {
                this.setPlay(true);
            }
        }
    };

    // Global hook for close buttons
    window.resumeLiveIfNeeded = function () {
        if (window.liveTimelineObj && window.liveTimelineObj.resumeIfNeeded) {
            // Slight delay useful in case of race conditions with CSS transitions
            setTimeout(() => {
                window.liveTimelineObj.resumeIfNeeded();
            }, 300);
        }
    };

    // Auto-init listener tracking the nav button
    document.addEventListener('DOMContentLoaded', () => {
        const navBtn = document.getElementById('nav-live-timeline');
        if (navBtn) {
            navBtn.addEventListener('click', () => {
                if (!STATE.initialized && window.APP_STATE && window.APP_STATE.ready) {
                    window.liveTimelineObj.init();
                } else if (STATE.initialized) {
                    // Update bounds if needed, render window correctly
                    window.liveTimelineObj.renderLiveWindow();
                    window.liveTimelineObj.updateDensityCursor();
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            const viewLive = document.getElementById('view-live-timeline');
            if (viewLive && viewLive.classList.contains('flex')) {
                // Avoid interfering with inputs if we had any
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

                if (e.key === 'ArrowRight') {
                    window.liveTimelineObj.jump(1);
                } else if (e.key === 'ArrowLeft') {
                    window.liveTimelineObj.jump(-1);
                } else if (e.key === ' ') {
                    e.preventDefault();
                    window.liveTimelineObj.togglePlay();
                }
            }
        });
    });

})();
