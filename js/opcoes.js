const optDescriptions = {
    bgm:        'MÚSICA (BGM): Ativa ou desativa a trilha sonora de fundo durante as batalhas.',
    sfx:        'EFEITOS SONOROS (CRY): Toca o grito do Pokémon ao entrar na arena ou vencer.',
    fullscreen: 'TELA CHEIA: Expande o simulador para ocupar toda a tela do dispositivo.',
    textanim:   'ANIMAÇÕES DE TEXTO: Exibe o texto letra por letra, estilo RPG clássico.',
};

document.querySelectorAll('#page-options .opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const group = btn.dataset.group;

        document.querySelectorAll(`#page-options .opt-btn[data-group="${group}"]`)
            .forEach(b => b.classList.remove('active'));

        btn.classList.add('active');

        const box = document.getElementById('opt-dialogue');
        if (box) {
            box.innerHTML = optDescriptions[group] + '<span class="opt-arrow">▼</span>';
        }

        // ── TELA CHEIA ──────────────────────────────
        if (group === 'fullscreen') {
            if (btn.dataset.value === 'on') {
                const el = document.documentElement;
                if (el.requestFullscreen)            el.requestFullscreen();
                else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
                else if (el.mozRequestFullScreen)    el.mozRequestFullScreen();
            } else {
                if (document.exitFullscreen)            document.exitFullscreen();
                else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
                else if (document.mozCancelFullScreen)  document.mozCancelFullScreen();
            }
        }
    });
});

// Sincroniza botão quando usuário aperta ESC para sair do fullscreen
document.addEventListener('fullscreenchange', () => {
    const estaCheia = !!document.fullscreenElement;
    document.querySelectorAll('#page-options .opt-btn[data-group="fullscreen"]').forEach(b => {
        b.classList.remove('active');
        if ((b.dataset.value === 'on') === estaCheia) b.classList.add('active');
    });
});

// SALVAR
document.getElementById('btn-opt-save')?.addEventListener('click', () => {
    const box = document.getElementById('opt-dialogue');
    if (box) box.innerHTML = 'Configurações salvas!<span class="opt-arrow">▼</span>';
});

// PADRÃO
document.getElementById('btn-opt-default')?.addEventListener('click', () => {
    document.querySelectorAll('#page-options .opt-btns').forEach(group => {
        const btns = group.querySelectorAll('.opt-btn');
        btns.forEach(b => b.classList.remove('active'));
        if (btns[0]) btns[0].classList.add('active');
    });
    if (document.fullscreenElement) document.exitFullscreen();
    const box = document.getElementById('opt-dialogue');
    if (box) box.innerHTML = 'Configurações restauradas para o padrão.<span class="opt-arrow">▼</span>';
});

// VOLTAR
document.getElementById('btn-opt-back')?.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
    document.querySelector('.nav-btn[data-target="page-battle"]')?.classList.add('active');
    document.getElementById('page-battle')?.classList.add('active');
});