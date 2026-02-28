//POKE OST PLAYLIST
const PokeBGM = (() => {

    const PLAYLIST = [
        { title: 'Opening Movie',    file: 'https://vgmtreasurechest.com/soundtracks/pokemon-red-green-blue-yellow/sxkijvde/01.%20Opening%20Movie%20%28Red%2C%20Green%20%26%20Blue%20Version%29.mp3' },
        { title: 'Title Screen',     file: 'https://vgmtreasurechest.com/soundtracks/pokemon-red-green-blue-yellow/qmnegucf/03%20Title%20Screen.mp3' },
        { title: 'Pallet Town',      file: 'https://vgmtreasurechest.com/soundtracks/pokemon-red-green-blue-yellow/syqhoybn/04%20Pallet%20Town.mp3' },
        { title: 'Route 1',          file: 'https://vgmtreasurechest.com/soundtracks/pokemon-red-green-blue-yellow/mftcfuji/13%20Route%201.mp3' },
        { title: 'Trainer Battle',   file: 'https://vgmtreasurechest.com/soundtracks/pokemon-red-green-blue-yellow/itsilhcr/10.%20Battle%21%20%28Trainer%20Battle%29.mp3' },
    ];

    let current = 0;
    let audio   = null;
    let playing = false;

    function buildAudio(index) {
        if (audio) { audio.pause(); audio.src = ''; }
        audio = new Audio(PLAYLIST[index].file);
        audio.loop   = true;
        audio.volume = 0.5;
        updateUI(index);
    }

    function updateUI(index) {
        const el = document.getElementById('music-title');
        if (el) el.textContent = PLAYLIST[index].title;
    }

    buildAudio(0);

    return {
        start() {
            if (playing) return;
            playing = true;
            audio.play().catch(() => {});
        },
        stop() {
            playing = false;
            audio.pause();
        },
        toggle(on) { on ? this.start() : this.stop(); },
        next() {
            current = (current + 1) % PLAYLIST.length;
            buildAudio(current);
            if (playing) audio.play().catch(() => {});
        },
        prev() {
            current = (current - 1 + PLAYLIST.length) % PLAYLIST.length;
            buildAudio(current);
            if (playing) audio.play().catch(() => {});
        },
        setVolume(v) {
            if (audio) audio.volume = Math.max(0, Math.min(1, v));
        },
    };
})();

['click', 'keydown', 'touchstart'].forEach(ev =>
    document.addEventListener(ev, () => PokeBGM.start(), { once: true, passive: true })
);