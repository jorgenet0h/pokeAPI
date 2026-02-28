const PokeSFX = (() => {

    let ctx = null;
    let enabled = true;

    function getCtx() {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    }

    function osc(freq, type, startT, dur, vol, c) {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, startT);
        g.gain.setValueAtTime(vol, startT);
        g.gain.linearRampToValueAtTime(0, startT + dur);
        o.connect(g); g.connect(c.destination);
        o.start(startT); o.stop(startT + dur);
    }

    function sweep(f1, f2, type, startT, dur, vol, c) {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = type;
        o.frequency.setValueAtTime(f1, startT);
        o.frequency.linearRampToValueAtTime(f2, startT + dur);
        g.gain.setValueAtTime(vol, startT);
        g.gain.linearRampToValueAtTime(0, startT + dur);
        o.connect(g); g.connect(c.destination);
        o.start(startT); o.stop(startT + dur);
    }

    function noise(startT, dur, vol, hipass, c) {
        const len = Math.ceil(c.sampleRate * dur);
        const buf = c.createBuffer(1, len, c.sampleRate);
        const d   = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        const src = c.createBufferSource();
        src.buffer = buf;
        const hp = c.createBiquadFilter();
        hp.type = 'highpass'; hp.frequency.value = hipass;
        const g = c.createGain();
        g.gain.setValueAtTime(vol, startT);
        g.gain.linearRampToValueAtTime(0, startT + dur);
        src.connect(hp); hp.connect(g); g.connect(c.destination);
        src.start(startT); src.stop(startT + dur);
    }

    const SOUNDS = {

        // Cursor se movendo / hover
        select() {
            const c = getCtx(), t = c.currentTime;
            osc(1200, 'square', t,        0.04, 0.15, c);
            osc(1600, 'square', t + 0.04, 0.04, 0.12, c);
        },

        // Confirmar / pressionar botão principal
        confirm() {
            const c = getCtx(), t = c.currentTime;
            osc(523,  'square', t,        0.06, 0.18, c);
            osc(659,  'square', t + 0.06, 0.06, 0.18, c);
            osc(784,  'square', t + 0.12, 0.12, 0.18, c);
        },

        // Cancelar / voltar
        cancel() {
            const c = getCtx(), t = c.currentTime;
            osc(600, 'square', t,        0.06, 0.15, c);
            osc(400, 'square', t + 0.06, 0.10, 0.12, c);
        },

        // Erro / ação inválida
        error() {
            const c = getCtx(), t = c.currentTime;
            osc(200, 'square', t,        0.08, 0.20, c);
            osc(180, 'square', t + 0.08, 0.08, 0.20, c);
            osc(160, 'square', t + 0.16, 0.12, 0.18, c);
        },

        // Dado aleatório / 🎲
        random() {
            const c = getCtx(), t = c.currentTime;
            // Série de notas rápidas ascendentes
            const notes = [262, 330, 392, 494, 587, 698, 784, 988];
            notes.forEach((f, i) => {
                osc(f, 'square', t + i * 0.04, 0.04, 0.14, c);
            });
        },

        // Botão LUTAR
        fight() {
            const c = getCtx(), t = c.currentTime;
            // Impacto grave + sweep ascendente
            osc(80,  'sawtooth', t,        0.08, 0.3,  c);
            sweep(300, 900, 'square', t + 0.05, 0.15, 0.2, c);
            noise(t, 0.08, 0.15, 2000, c);
        },

        // Salvar configurações
        save() {
            const c = getCtx(), t = c.currentTime;
            const notes = [523, 659, 784, 1047];
            notes.forEach((f, i) => {
                osc(f, 'square', t + i * 0.07, 0.07, 0.15, c);
            });
        },

        // Pokémon entrou / random completou
        fanfare() {
            const c = getCtx(), t = c.currentTime;
            osc(523,  'square', t,        0.08, 0.2, c);
            osc(659,  'square', t + 0.08, 0.08, 0.2, c);
            osc(784,  'square', t + 0.16, 0.08, 0.2, c);
            osc(1047, 'square', t + 0.24, 0.16, 0.2, c);
        },
    };

    return {
        play(name) {
            if (!enabled) return;
            try {
                SOUNDS[name]?.();
            } catch(e) {
                console.warn('[PokeSFX]', e);
            }
        },
        toggle(on) { enabled = on; },
    };
})();

// Aplica sons nos botões automaticamente
document.addEventListener('DOMContentLoaded', () => {

    // Botões de navegação da sidebar 
    document.querySelectorAll('.nav-btn[data-target]').forEach(btn => {
        btn.addEventListener('click', () => PokeSFX.play('select'));
    });

    // Botões das opções 
    document.querySelectorAll('.opt-btn').forEach(btn => {
        btn.addEventListener('click', () => PokeSFX.play('confirm'));
    });

    // Botão LUTAR 
    document.getElementById('btn-fight')?.addEventListener('click', () => PokeSFX.play('fight'));

    // Botões random 
    document.getElementById('btn-random-red')?.addEventListener('click',  () => PokeSFX.play('random'));
    document.getElementById('btn-random-blue')?.addEventListener('click', () => PokeSFX.play('random'));

    // Mochila / Pokémon / Fugir 
    document.getElementById('btn-bag')?.addEventListener('click', () => PokeSFX.play('cancel'));
    document.getElementById('btn-mon')?.addEventListener('click', () => PokeSFX.play('cancel'));
    document.getElementById('btn-run')?.addEventListener('click', () => PokeSFX.play('cancel'));

    // Salvar
    document.getElementById('btn-opt-save')?.addEventListener('click', () => PokeSFX.play('save'));

    // Padrão → error (som de "reset")
    document.getElementById('btn-opt-default')?.addEventListener('click', () => PokeSFX.play('error'));

    // Voltar → cancel
    document.getElementById('btn-opt-back')?.addEventListener('click', () => PokeSFX.play('cancel'));
});