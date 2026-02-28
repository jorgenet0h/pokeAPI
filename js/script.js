document.querySelectorAll('.nav-btn[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(btn.dataset.target).classList.add('active');
    });
});

function typeText(str) {
    const box = document.getElementById('dialogue-text');
    if (!box) return;
    box.innerHTML = '';
    let i = 0;
    const iv = setInterval(() => {
        if (i >= str.length) { clearInterval(iv); return; }
        const ch = str[i++];
        box.innerHTML += ch === '\n' ? '<br>' : ch;
    }, 45);
}

document.getElementById('btn-bag').addEventListener('click', () => typeText("Sua mochila\nestá vazia..."));
document.getElementById('btn-mon').addEventListener('click', () => typeText("Estes são seus\núnicos Pokémon!"));
document.getElementById('btn-run').addEventListener('click', () => typeText("Não dá para\nfugir de uma\nbatalha de treinador!"));

function gerarIdAleatorio() {
    return Math.floor(Math.random() * 1025) + 1; 
}

document.getElementById('btn-random-red').addEventListener('click', () => {
    document.querySelector('#card-red-1 .card-input').value = gerarIdAleatorio();
    document.querySelector('#card-red-2 .card-input').value = gerarIdAleatorio();
    typeText("TIME VERMELHO\nsorteou seus\nlutadores!");
});

document.getElementById('btn-random-blue').addEventListener('click', () => {
    document.querySelector('#card-blue-1 .card-input').value = gerarIdAleatorio();
    document.querySelector('#card-blue-2 .card-input').value = gerarIdAleatorio();
    typeText("TIME AZUL\nsorteou seus\nlutadores!");
});

document.getElementById('btn-fight').addEventListener('click', () => {
    typeText("Conectando à\nPokeAPI...");
});
document.getElementById('press-start')?.addEventListener('click', () => {
    document.querySelector('.nav-btn[data-target="page-battle"]')?.click();
});