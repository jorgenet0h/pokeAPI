document.querySelectorAll('.nav-btn[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.target).classList.add('active');
    });
});

let typeInterval = null;
function typeText(str) {
    const box = document.getElementById('dialogue-text');
    if (!box) return;
    if (typeInterval) clearInterval(typeInterval);
    box.innerHTML = '';
    let i = 0;
    typeInterval = setInterval(() => {
        if (i >= str.length) { clearInterval(typeInterval); return; }
        const ch = str[i++];
        box.innerHTML += ch === '\n' ? '<br>' : ch;
    }, 45);
}

const API = 'https://pokeapi.co/api/v2/pokemon/';

class PokeNotFoundError extends Error {}
class PokeNetworkError  extends Error {}
class PokeDataError     extends Error {}

async function fetchPokemon(idOrName) {
    const query = String(idOrName).toLowerCase().trim();

    if (!query) throw new PokeNotFoundError('Digite um nome ou número.');

    if (!/^[a-z0-9-]+$/.test(query)) {
        throw new PokeNotFoundError(`"${idOrName}" não é um nome válido.`);
    }

    let res;
    try {
        res = await fetch(API + query);
    } catch (networkErr) {
        throw new PokeNetworkError('Sem conexão com a internet.');
    }

    if (res.status === 404) {
        throw new PokeNotFoundError(`"${idOrName}" não encontrado na Pokédex.`);
    }
    if (!res.ok) {
        throw new PokeNetworkError(`Erro do servidor (${res.status}). Tente novamente.`);
    }

    let data;
    try {
        data = await res.json();
    } catch {
        throw new PokeDataError('Resposta inválida da API.');
    }

    if (!data?.name || !Array.isArray(data?.stats) || !Array.isArray(data?.types)) {
        throw new PokeDataError('Dados do Pokémon incompletos.');
    }

    return data;
}

function hpColor(pct) {
    if (pct > 50) return '#58C840';
    if (pct > 20) return '#F8D030';
    return '#CC0000';
}

function renderCard(data, cardId) {
    try {
    const card   = document.getElementById(cardId);
    if (!card) return;

    const name   = data.name.toUpperCase();
    const id     = String(data.id).padStart(3, '0');
    const sprite = `assets/sprites/${data.id}.png`;
    const spriteFallback = data.sprites?.front_default || '';
    const types  = data.types.map(t => t.type.name);
    const hp     = data.stats.find(s => s.stat.name === 'hp')?.base_stat || 50;
    const hpPct  = 100;

    const img = card.querySelector('.sprite-preview');
    if (img) {
        img.onerror = () => { if (spriteFallback) img.src = spriteFallback; };
        img.src = sprite;
        img.alt = name;
    }

    const idEl = card.querySelector('.poke-id');
    if (idEl) idEl.textContent = `#${id}`;

    const input = card.querySelector('.card-input');
    if (input) input.value = name;

    const STAT_MAP = [
        { key: 'hp',              cls: 'hp',  label: 'HP',  max: 255 },
        { key: 'attack',          cls: 'atk', label: 'ATK', max: 190 },
        { key: 'defense',         cls: 'def', label: 'DEF', max: 230 },
        { key: 'special-attack',  cls: 'spa', label: 'SPA', max: 194 },
        { key: 'speed',           cls: 'spd', label: 'SPD', max: 200 },
    ];
    const statsWrap = card.querySelector('.stat-bars');
    if (statsWrap) {
        STAT_MAP.forEach(s => {
            const val  = data.stats.find(st => st.stat.name === s.key)?.base_stat ?? 0;
            const pct  = Math.min(100, Math.round(val / s.max * 100));
            const fill = statsWrap.querySelector(`.stat-fill.${s.cls}`);
            const valEl = fill?.closest('.stat-row')?.querySelector('.stat-val');
            if (fill)  { fill.style.width = pct + '%'; }
            if (valEl) valEl.textContent = val;
        });
    }

    const badges = card.querySelector('.type-badges');
    if (badges) {
        badges.innerHTML = types.map(t => `<span class="type ${t}">${t.toUpperCase()}</span>`).join('');
    }

    card.dataset.pokemonId = data.id;
    } catch (err) {
        console.error('[renderCard]', cardId, err);
    }
}


const lockedCards = new Set();

function toggleLock(cardId) {
    const btn = document.querySelector(`.btn-lock[data-card="${cardId}"]`);
    if (lockedCards.has(cardId)) {
        lockedCards.delete(cardId);
        if (btn) { btn.textContent = '🔓'; btn.classList.remove('locked'); }
        typeText(`Card
destravado!`);
    } else {
        lockedCards.add(cardId);
        if (btn) { btn.textContent = '🔒'; btn.classList.add('locked'); }
        typeText(`Card
travado!`);
    }
}

document.querySelectorAll('.btn-lock').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLock(btn.dataset.card);
    });
});

function attachInputSearch(cardId) {
    const card  = document.getElementById(cardId);
    if (!card) return;
    const input = card.querySelector('.card-input');
    const btn   = card.querySelector('.btn-search');
    if (!input) return;

    let lastSearched = '';

    async function search() {
        const val = input.value.trim();
        if (!val || val === lastSearched) return;

        if (btn) { btn.textContent = '⏳'; btn.disabled = true; }
        input.classList.add('searching');

        typeText(`Buscando\n${val.toUpperCase()}...`);
        try {
            const data = await fetchPokemon(val);
            window.PDEX_CACHE = window.PDEX_CACHE || {};
            window.PDEX_CACHE[data.id] = data; 
            lastSearched = data.name;
            input.value  = data.name.toUpperCase();
            renderCard(data, cardId);
            updatePokedexCard(data, cardId);
            typeText(`${data.name.toUpperCase()}\nestá pronto\npara lutar!`);
            if (btn) { btn.textContent = '✓'; btn.style.color = '#58C840'; }
            setTimeout(() => {
                if (btn) { btn.textContent = '🔍'; btn.style.color = ''; btn.disabled = false; }
            }, 1500);
        } catch(e) {
            let msg;
            if (e instanceof PokeNotFoundError) {
                msg = e.message;
            } else if (e instanceof PokeNetworkError) {
                msg = e.message;
            } else if (e instanceof PokeDataError) {
                msg = e.message;
            } else {
                msg = 'Erro desconhecido.\nTente novamente.';
            }
            typeText(msg.replace(/\. /g, '.\n'));
            input.classList.add('search-error');
            setTimeout(() => input.classList.remove('search-error'), 1000);
            if (btn) { btn.textContent = '✗'; btn.style.color = '#CC0000'; }
            setTimeout(() => {
                if (btn) { btn.textContent = '🔍'; btn.style.color = ''; btn.disabled = false; }
            }, 1500);
        }
        input.classList.remove('searching');
    }

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); search(); }
        if (e.key !== 'Enter') lastSearched = '';
    });

    if (btn) btn.addEventListener('click', () => search());
}

attachInputSearch('card-red-1');
attachInputSearch('card-red-2');
attachInputSearch('card-blue-1');
attachInputSearch('card-blue-2');

const PDEX_IDS = [
    1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,
    21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,
    41,42,43,44,45,46,47,50,51,52,53,54,55,56,57,58,59,60,61,62,
    63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,
    83,84,85,86,87,88,89,91,92,93,94,95,96,97,100,101,102,103,104,105,
    106,107,109,110,111,112,113,114,120,121,122,123,124,125,126,127,128,129,130,131,
    132,134,135,137,138,139,140,141,142,143,144,145,146,147,148,149,150,175,176,180,
    183,184,197,198,200,205,208,209,210,215,220,221,227,228,229,233,236,237,238,248,
    261,262,302,329,330,354,355,356,359,361,362,371,372,373,442,491
];

function randomId() { return PDEX_IDS[Math.floor(Math.random() * PDEX_IDS.length)]; }

async function loadRandom(cardId) {
    if (lockedCards.has(cardId)) return '__locked__';
    try {
        const data = await fetchPokemon(randomId());
        window.PDEX_CACHE = window.PDEX_CACHE || {};
        window.PDEX_CACHE[data.id] = data;
        renderCard(data, cardId);
        updatePokedexCard(data, cardId);
        return data.name.toUpperCase();
    } catch(e) {
        console.warn('[loadRandom]', cardId, e.message);
        return null;
    }
}

document.getElementById('btn-random-red')?.addEventListener('click', async () => {
    typeText('Sorteando\ntime vermelho...');
    const [n1, n2] = await Promise.all([
        loadRandom('card-red-1'),
        loadRandom('card-red-2'),
    ]);
    const names = [n1, n2].filter(n => n && n !== '__locked__');
    if (names.length) typeText(names.join('\ne ') + '\nprontos p/ lutar!');
    else typeText('Todos os cards\nestão travados!');
});

document.getElementById('btn-random-blue')?.addEventListener('click', async () => {
    typeText('Sorteando\ntime azul...');
    const [n1, n2] = await Promise.all([
        loadRandom('card-blue-1'),
        loadRandom('card-blue-2'),
    ]);
    const names = [n1, n2].filter(n => n && n !== '__locked__');
    if (names.length) typeText(names.join('\ne ') + '\nprontos p/ lutar!');
    else typeText('Todos os cards\nestão travados!');
});

const pokedexMap = {
    'card-red-1':  'pdex-red-1',
    'card-red-2':  'pdex-red-2',
    'card-blue-1': 'pdex-blue-1',
    'card-blue-2': 'pdex-blue-2',
};

function updatePokedexCard(data, battleCardId) {
    const pdexId = pokedexMap[battleCardId];
    if (!pdexId) return;
    const card = document.getElementById(pdexId);
    if (!card) return;

    const name   = data.name.toUpperCase();
    const id     = String(data.id).padStart(3, '0');
    const sprite = data.sprites.front_default || '';
    const types  = data.types.map(t => t.type.name);
    const height = (data.height / 10).toFixed(1) + 'm';
    const weight = (data.weight / 10).toFixed(1) + 'kg';
    const ability = data.abilities[0]?.ability.name.toUpperCase() || '--';
    const hp     = data.stats.find(s => s.stat.name === 'hp')?.base_stat     || '--';
    const atk    = data.stats.find(s => s.stat.name === 'attack')?.base_stat || '--';
    const def    = data.stats.find(s => s.stat.name === 'defense')?.base_stat|| '--';
    const spd    = data.stats.find(s => s.stat.name === 'speed')?.base_stat  || '--';

    card.querySelector('.pokedex-card-title').textContent = `#${id} ${name}`;

    const img = card.querySelector('.pokedex-sprite');
    if (img) { img.src = sprite; img.alt = name; }

    const info = card.querySelector('.pokedex-info');
    if (info) info.innerHTML = `
        <div class="type-badges">${types.map(t=>`<span class="type ${t}">${t.toUpperCase()}</span>`).join('')}</div>
        <div class="pokedex-stat">ALTURA: ${height}</div>
        <div class="pokedex-stat">PESO: ${weight}</div>
        <div class="pokedex-stat">HABILIDADE:<br>${ability}</div>
        <div class="pokedex-stat">HP: ${hp} | ATK: ${atk}</div>
        <div class="pokedex-stat">DEF: ${def} | SPD: ${spd}</div>
    `;
}

document.getElementById('btn-bag')?.addEventListener('click',  () => typeText("Sua mochila\nestá vazia..."));
document.getElementById('btn-mon')?.addEventListener('click',  () => typeText("Estes são seus\núnicos Pokémon!"));
document.getElementById('btn-run')?.addEventListener('click',  () => typeText("Não dá para\nfugir de uma\nbatalha de treinador!"));

const TYPE_ADVANTAGE = {
    fire:     { weakTo: ['water','rock','ground'],    strongAgainst: ['grass','ice','bug','steel'] },
    water:    { weakTo: ['grass','electric'],          strongAgainst: ['fire','rock','ground'] },
    grass:    { weakTo: ['fire','ice','bug','flying'], strongAgainst: ['water','rock','ground'] },
    electric: { weakTo: ['ground'],                   strongAgainst: ['water','flying'] },
    ice:      { weakTo: ['fire','rock','steel','fighting'], strongAgainst: ['grass','ground','flying','dragon'] },
    dragon:   { weakTo: ['ice','dragon','fairy'],     strongAgainst: ['dragon'] },
    psychic:  { weakTo: ['bug','dark','ghost'],       strongAgainst: ['fighting','poison'] },
    ghost:    { weakTo: ['dark','ghost'],              strongAgainst: ['psychic','ghost'] },
    dark:     { weakTo: ['fighting','bug','fairy'],   strongAgainst: ['psychic','ghost'] },
    fairy:    { weakTo: ['steel','poison'],            strongAgainst: ['fighting','dragon','dark'] },
    poison:   { weakTo: ['ground','psychic'],         strongAgainst: ['grass','fairy'] },
    fighting: { weakTo: ['psychic','flying','fairy'], strongAgainst: ['normal','rock','steel','ice','dark'] },
    rock:     { weakTo: ['water','grass','fighting','ground','steel'], strongAgainst: ['fire','ice','flying','bug'] },
    ground:   { weakTo: ['water','grass','ice'],      strongAgainst: ['fire','electric','poison','rock','steel'] },
    steel:    { weakTo: ['fire','fighting','ground'], strongAgainst: ['ice','rock','fairy'] },
    bug:      { weakTo: ['fire','flying','rock'],     strongAgainst: ['grass','psychic','dark'] },
    flying:   { weakTo: ['electric','ice','rock'],    strongAgainst: ['grass','fighting','bug'] },
    normal:   { weakTo: ['fighting'],                 strongAgainst: [] },
};

function calcTypeBonus(attackers, defenders) {
    let bonusTotal = 0;
    const details = [];

    const TYPE_PT = {
        fire:'Fogo', water:'Água', grass:'Planta', electric:'Elétrico',
        psychic:'Psíquico', ice:'Gelo', dragon:'Dragão', dark:'Sombrio',
        fairy:'Fada', poison:'Veneno', fighting:'Lutador', rock:'Pedra',
        ground:'Terra', ghost:'Fantasma', steel:'Metal', normal:'Normal',
        bug:'Inseto', flying:'Voador',
    };

    attackers.forEach(atk => {
        defenders.forEach(def => {
            atk.types.forEach(atkType => {
                def.types.forEach(defType => {
                    const adv = TYPE_ADVANTAGE[atkType];
                    if (!adv) return;
                    if (adv.strongAgainst.includes(defType)) {
                        bonusTotal += 0.1;
                        details.push(`${TYPE_PT[atkType]||atkType} > ${TYPE_PT[defType]||defType} (+10%)`);
                    }
                });
            });
        });
    });

    return { bonus: Math.min(bonusTotal, 0.20), details };
}

function getPokemonData(cardId) {
    const card = document.getElementById(cardId);
    if (!card) return null;
    const cachedId = parseInt(card.dataset.pokemonId);
    const pData = window.PDEX_CACHE?.[cachedId] || null;
    if (!pData) return null;
    const total = pData.stats.reduce((sum, st) => sum + st.base_stat, 0);
    const types = pData.types.map(t => t.type.name);
    return { total, name: pData.name.toUpperCase(), types, id: pData.id };
}

function showResult(r1, r2, b1, b2, redBonus, blueBonus) {
    const rawRed   = r1.total + r2.total;
    const rawBlue  = b1.total + b2.total;
    const redFinal  = Math.round(rawRed  * (1 + redBonus.bonus));
    const blueFinal = Math.round(rawBlue * (1 + blueBonus.bonus));

    const result = document.getElementById('battle-result');
    const title  = document.getElementById('result-title');

    const bonusTagRed  = redBonus.bonus  > 0 ? ` (+${Math.round(redBonus.bonus*100)}% tipo)` : '';
    const bonusTagBlue = blueBonus.bonus > 0 ? ` (+${Math.round(blueBonus.bonus*100)}% tipo)` : '';

    document.getElementById('score-red').textContent  = `${redFinal} pts${bonusTagRed}`;
    document.getElementById('score-blue').textContent = `${blueFinal} pts${bonusTagBlue}`;
    document.getElementById('detail-red').innerHTML   =
        `${r1.name} (${r1.total}) + ${r2.name} (${r2.total})<br>` +
        (redBonus.details.length ? `<span class="bonus-tag">${redBonus.details.join(' | ')}</span>` : `<span class="bonus-tag muted">Sem bônus de tipo</span>`);
    document.getElementById('detail-blue').innerHTML  =
        `${b1.name} (${b1.total}) + ${b2.name} (${b2.total})<br>` +
        (blueBonus.details.length ? `<span class="bonus-tag">${blueBonus.details.join(' | ')}</span>` : `<span class="bonus-tag muted">Sem bônus de tipo</span>`);

    const glow    = document.getElementById('result-glow');
    const eyebrow = document.getElementById('result-eyebrow');

    if (redFinal > blueFinal) {
        title.textContent = 'TIME VERMELHO VENCE!';
        title.className   = 'result-title winner-red';
        if (glow)    { glow.className    = 'result-glow red'; }
        if (eyebrow) { eyebrow.className = 'result-eyebrow red'; eyebrow.textContent = '🔴 VITÓRIA — TIME VERMELHO'; }
    } else if (blueFinal > redFinal) {
        title.textContent = 'TIME AZUL VENCE!';
        title.className   = 'result-title winner-blue';
        if (glow)    { glow.className    = 'result-glow blue'; }
        if (eyebrow) { eyebrow.className = 'result-eyebrow blue'; eyebrow.textContent = '🔵 VITÓRIA — TIME AZUL'; }
    } else {
        title.textContent = 'EMPATE!';
        title.className   = 'result-title winner-draw';
        if (glow)    { glow.className    = 'result-glow draw'; }
        if (eyebrow) { eyebrow.className = 'result-eyebrow draw'; eyebrow.textContent = '⚔ BATALHA EMPATADA'; }
    }

    result.style.display = 'block';
    result.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const winner = redFinal > blueFinal ? 'red' : blueFinal > redFinal ? 'blue' : null;
    setupSwap(winner);
}

function resetBattle() {
    const IDS = ['card-red-1','card-red-2','card-blue-1','card-blue-2'];
    IDS.forEach(id => {
        const card = document.getElementById(id);
        if (!card) return;
        if (lockedCards.has(id)) return;
        card.dataset.pokemonId = '';
        const img = card.querySelector('.sprite-preview');
        if (img) { img.onerror = () => { img.onerror=null; img.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'; }; img.src = 'assets/pokeball.png'; }
        const input = card.querySelector('.card-input');
        if (input) input.value = '';
        const idEl = card.querySelector('.poke-id');
        if (idEl) idEl.textContent = '???';
        card.querySelectorAll('.stat-fill').forEach(f => f.style.width = '0%');
        card.querySelectorAll('.stat-val').forEach(v => v.textContent = '--');
        const badges = card.querySelector('.type-badges');
        if (badges) badges.innerHTML = '';
    });
    document.getElementById('battle-result').style.display = 'none';
    document.getElementById('result-swap').style.display = 'none';
    document.getElementById('btn-swap-toggle').style.display = 'none';
    winnerTeam = null;
    typeText('Novos combatentes!\nEscolha seus\nPokémon!');
}


let winnerTeam = null;

function setupSwap(team) {
    winnerTeam = team;
    if (!team) {
        document.getElementById('btn-swap-toggle').style.display = 'none';
        return;
    }

    const btn = document.getElementById('btn-swap-toggle');
    btn.style.display = 'block';
    btn.onclick = () => toggleSwapPanel(team);
}

function toggleSwapPanel(team) {
    const panel = document.getElementById('result-swap');
    if (panel.style.display !== 'none') {
        panel.style.display = 'none';
        return;
    }

    const slots = team === 'red'
        ? [{ id: 'card-red-1', label: 'Pokémon 1' }, { id: 'card-red-2', label: 'Pokémon 2' }]
        : [{ id: 'card-blue-1', label: 'Pokémon 1' }, { id: 'card-blue-2', label: 'Pokémon 2' }];

    const label = team === 'red' ? '🔴 TIME VERMELHO' : '🔵 TIME AZUL';
    document.getElementById('result-swap-title').textContent =
        `${label} — Escolha qual Pokémon trocar:`;

    const container = document.getElementById('result-swap-slots');
    container.innerHTML = '';

    slots.forEach(slot => {
        const card = document.getElementById(slot.id);
        const pid  = parseInt(card?.dataset.pokemonId);
        const pData = window.PDEX_CACHE?.[pid];
        const name  = pData ? pData.name.toUpperCase() : '???';
        const sprite = pid ? `assets/sprites/${pid}.png` : 'assets/pokeball.png';

        const btn = document.createElement('button');
        btn.className = 'swap-slot-btn';
        btn.innerHTML = `
            <img src="${sprite}" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pid}.png'" alt="${name}">
            <span>${name}</span>`;

        if (lockedCards.has(slot.id)) {
            btn.disabled = true;
            btn.title = 'Card travado';
            btn.innerHTML += '<span class="swap-lock">🔒</span>';
        } else {
            btn.onclick = () => startSwapFor(slot.id, team);
        }

        container.appendChild(btn);
    });

    panel.style.display = 'block';
}

function startSwapFor(cardId, team) {
    document.getElementById('result-swap').style.display = 'none';
    window.__swapTarget = cardId;
    window.__swapTeam   = team;

    typeText(`Escolha um\nPokémon na\nPokédex para\ntrocar!`);
    setTimeout(() => {
        document.querySelector('.nav-btn[data-target="page-pokedex"]')?.click();
    }, 400);
}

window.applySwap = function(pData) {
    const cardId = window.__swapTarget;
    const team   = window.__swapTeam;
    if (!cardId || !pData) return;

    renderCard(pData, cardId);
    window.__swapTarget = null;
    window.__swapTeam   = null;

    typeText(`${pData.name.toUpperCase()}\nentra no time\n${team === 'red' ? 'vermelho' : 'azul'}!`);
    document.querySelector('.nav-btn[data-target="page-battle"]')?.click();
};

document.getElementById('btn-fight')?.addEventListener('click', () => {
    const r1 = getPokemonData('card-red-1')  || { total:0, name:'---', types:[] };
    const r2 = getPokemonData('card-red-2')  || { total:0, name:'---', types:[] };
    const b1 = getPokemonData('card-blue-1') || { total:0, name:'---', types:[] };
    const b2 = getPokemonData('card-blue-2') || { total:0, name:'---', types:[] };

    if (!r1.total && !r2.total && !b1.total && !b2.total) {
        typeText('Nenhum Pokémon\nescolhido!\nUse o 🎲 ou\na Pokédex.');
        return;
    }

    const redBonus  = calcTypeBonus([r1, r2], [b1, b2]);
    const blueBonus = calcTypeBonus([b1, b2], [r1, r2]);

    const rawRed    = r1.total + r2.total;
    const rawBlue   = b1.total + b2.total;
    const redFinal  = Math.round(rawRed  * (1 + redBonus.bonus));
    const blueFinal = Math.round(rawBlue * (1 + blueBonus.bonus));

    const bonusMsgRed  = redBonus.bonus  > 0 ? `\n+${Math.round(redBonus.bonus*100)}% bônus tipo!` : '';
    const bonusMsgBlue = blueBonus.bonus > 0 ? `\n+${Math.round(blueBonus.bonus*100)}% bônus tipo!` : '';

    if (redFinal > blueFinal) {
        typeText(`TIME VERMELHO\nvence! ${redFinal} pts${bonusMsgRed}`);
    } else if (blueFinal > redFinal) {
        typeText(`TIME AZUL\nvence! ${blueFinal} pts${bonusMsgBlue}`);
    } else {
        typeText(`EMPATE!\nAmbos com\n${redFinal} pts!`);
    }

    setTimeout(() => showResult(r1, r2, b1, b2, redBonus, blueBonus), 1500);
});

document.getElementById('btn-replay')?.addEventListener('click', resetBattle);

document.getElementById('press-start')?.addEventListener('click', () => {
    document.querySelector('.nav-btn[data-target="page-battle"]')?.click();
});

async function autoFillIfEmpty() {
    const allEmpty = ['card-red-1','card-red-2','card-blue-1','card-blue-2']
        .every(id => !document.getElementById(id)?.dataset.pokemonId);
    if (!allEmpty) return;
    typeText('Carregando\nPok\u00e9mon...');
    await Promise.all([
        loadRandom('card-red-1'),
        loadRandom('card-red-2'),
        loadRandom('card-blue-1'),
        loadRandom('card-blue-2'),
    ]);
    typeText('Times prontos!\nClique em LUTAR!');
}

document.addEventListener('DOMContentLoaded', () => autoFillIfEmpty());
document.querySelectorAll('.nav-btn[data-target="page-battle"]').forEach(btn =>
    btn.addEventListener('click', () => setTimeout(autoFillIfEmpty, 50))
);