(function () {

    const API = 'https://pokeapi.co/api/v2/pokemon/';

    function spriteUrl(id) {
        return `assets/sprites/${id}.png`;
    }
    function spriteFallback(id) {
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    }

    const TYPE_PT = {
        fire:'Fogo', water:'Água', grass:'Planta', electric:'Elétrico',
        psychic:'Psíquico', ice:'Gelo', dragon:'Dragão', dark:'Sombrio',
        fairy:'Fada', poison:'Veneno', fighting:'Lutador', rock:'Pedra',
        ground:'Terra', ghost:'Fantasma', steel:'Metal', normal:'Normal',
        bug:'Inseto', flying:'Voador',
    };

    const EVO_GROUPS = {
        fire:     [[4,5,6],[37,38],[58,59],[77,78],[126],[135],[146]],
        water:    [[7,8,9],[54,55],[60,61,62],[72,73],[79,80],[129,130],[131],[134],[86,87],[120,121]],
        grass:    [[1,2,3],[43,44,45],[69,70,71],[114],[102,103]],
        electric: [[25,26],[81,82],[100,101],[125],[135],[145],[180]],
        psychic:  [[63,64,65],[96,97],[124],[122],[150],[79,80],[102,103]],
        ice:      [[86,87],[91],[124],[144],[220,221],[238],[361,362]],
        dragon:   [[147,148,149],[371,372,373],[329,330]],
        dark:     [[197],[198],[215],[228,229],[248],[261,262],[359],[491]],
        fairy:    [[35,36],[39,40],[175,176],[183,184],[209,210]],
        poison:   [[23,24],[29,30,31],[32,33,34],[41,42],[88,89],[109,110]],
        fighting: [[56,57],[66,67,68],[106],[107],[236,237]],
        rock:     [[74,75,76],[95],[111,112],[138,139],[140,141],[142]],
        ground:   [[27,28],[50,51],[104,105],[111,112],[74,75,76]],
        ghost:    [[92,93,94],[200],[302],[354,355,356],[442]],
        steel:    [[81,82],[208],[227],[137],[205],[233]],
        normal:   [[19,20],[52,53],[83],[113],[128],[132],[143],[137]],
        bug:      [[10,11,12],[13,14,15],[46,47],[127],[123]],
        flying:   [[16,17,18],[21,22],[84,85],[83],[142],[144],[146],[145]],
    };

    const ALL_GROUPS = Object.values(EVO_GROUPS)
        .flat()
        .filter((g, i, arr) => arr.findIndex(x => x[0] === g[0]) === i);

    window.PDEX_CACHE = {};

    let activeType  = 'all';
    let loading     = false;
    let initialized = false;

    const teamSlots = { red: 0, blue: 0 };
    const assigned = {};

    function getGrid()   { return document.getElementById('pdex-grid'); }
    function getStatus() { return document.getElementById('pdex-status'); }
    function setStatus(msg) { const el = getStatus(); if (el) el.textContent = msg; }

    function typeBadge(type) {
        return `<span class="type ${type}">${(TYPE_PT[type]||type).toUpperCase()}</span>`;
    }

    function makeCard(p) {
        const id     = String(p.id).padStart(3,'0');
        const name   = p.name.toUpperCase();
        const sprite = spriteUrl(p.id);
        const types  = p.types.map(t => t.type.name);
        const hp  = p.stats.find(s=>s.stat.name==='hp')?.base_stat      || '--';
        const atk = p.stats.find(s=>s.stat.name==='attack')?.base_stat  || '--';
        const def = p.stats.find(s=>s.stat.name==='defense')?.base_stat || '--';
        const spd = p.stats.find(s=>s.stat.name==='speed')?.base_stat   || '--';
        const badges = types.map(typeBadge).join('');
        const teamBadge = assigned[p.id]
            ? `<div class="evo-team-badge ${assigned[p.id]}">${assigned[p.id]==='red'?'🔴':'🔵'}</div>` : '';

        return `
        <div class="evo-card" data-pid="${p.id}" title="Clique para adicionar ao time">
            ${teamBadge}
            <div class="evo-card-id">#${id}</div>
            <div class="evo-sprite-wrap">
                <img src="${sprite}" alt="${name}" loading="lazy" onerror="this.onerror=null;this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png'">
            </div>
            <div class="evo-card-name">${name}</div>
            <div class="type-badges" style="justify-content:center;margin:3px 0">${badges}</div>
            <div class="evo-stats">HP:${hp} ATK:${atk}<br>DEF:${def} SPD:${spd}</div>
        </div>`;
    }

    function makeGroupRow(ids) {
        const pokemon = ids.map(id => window.PDEX_CACHE[id]).filter(Boolean);
        if (!pokemon.length) return null;

        const firstTypes = pokemon[0].types.map(t=>t.type.name);
        const color = firstTypes.includes('dark')   ? 'dark'
                    : firstTypes.includes('fire') || firstTypes.includes('dragon') ? 'red'
                    : 'blue';

        const inner = pokemon.map((p, i) => {
            const arrow = i < pokemon.length - 1 ? `<div class="evo-arrow">▶</div>` : '';
            return makeCard(p) + arrow;
        }).join('');

        const pad = pokemon.length < 3
            ? Array(3 - pokemon.length).fill(`<div class="evo-card evo-card-empty"></div>`).join('') : '';

        const el = document.createElement('div');
        el.className = `evo-row ${color}-top`;
        el.innerHTML = `<div class="evo-stripe"></div><div class="evo-row-inner">${inner}${pad}</div>`;
        return el;
    }

    function render(groups) {
        const grid = getGrid();
        if (!grid) return;
        grid.innerHTML = '';
        let count = 0;
        groups.forEach(ids => {
            const row = makeGroupRow(ids);
            if (row) { grid.appendChild(row); count += ids.filter(id=>window.PDEX_CACHE[id]).length; }
        });
        setStatus(`${count} Pokémon carregado${count!==1?'s':''}`);
    }

    async function loadType(type) {
        if (loading) return;
        loading = true;
        activeType = type;
        const groups = type === 'all' ? ALL_GROUPS : (EVO_GROUPS[type] || []);
        const allIds = [...new Set(groups.flat())];
        const needed = allIds.filter(id => !window.PDEX_CACHE[id]);

        if (needed.length > 0) {
            setStatus('Carregando...');
            const BATCH = 15;
            for (let i = 0; i < needed.length; i += BATCH) {
                const batch = needed.slice(i, i + BATCH);
                const results = await Promise.allSettled(
                    batch.map(id => fetch(API+id).then(r=>r.ok?r.json():null).catch(()=>null))
                );
                results.forEach(r => { if (r.status==='fulfilled'&&r.value) window.PDEX_CACHE[r.value.id]=r.value; });
                render(groups);
            }
        }
        render(groups);
        loading = false;
    }

    function buildPopover() {
        const pop = document.createElement('div');
        pop.id = 'pdex-popover';
        pop.innerHTML = `
            <div class="pdex-pop-sprite-wrap">
                <img id="pdex-pop-sprite" src="" alt="">
            </div>
            <div class="pdex-pop-name" id="pdex-pop-name"></div>
            <div class="pdex-pop-label">ADICIONAR AO TIME:</div>
            <div class="pdex-pop-btns">
                <button class="pdex-pop-btn" data-team="red">🔴 VERMELHO</button>
                <button class="pdex-pop-btn" data-team="blue">🔵 AZUL</button>
            </div>`;
        document.body.appendChild(pop);

        pop.querySelectorAll('.pdex-pop-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const team = btn.dataset.team;
                const pid  = parseInt(pop.dataset.pid);
                const pData = window.PDEX_CACHE[pid];
                if (!pData) return;

                if (window.__swapTarget && window.__swapTeam === team) {
                    closePop();
                    window.applySwap(pData);
                    return;
                }

                const slotIdx = teamSlots[team] % 2;
                const cardId  = `card-${team}-${slotIdx + 1}`;
                teamSlots[team]++;

                if (typeof renderCard === 'function') renderCard(pData, cardId);

                assigned[pid] = team;
                closePop();

                typeText?.(`${pData.name.toUpperCase()}\nadicionado ao\ntime ${team === 'red' ? 'vermelho' : 'azul'}!`);
                setTimeout(() => {
                    document.querySelector('.nav-btn[data-target="page-battle"]')?.click();
                }, 800);

                const groups = activeType === 'all' ? ALL_GROUPS : (EVO_GROUPS[activeType] || []);
                render(groups);
            });
        });

        document.addEventListener('click', e => {
            if (!pop.contains(e.target) && !e.target.closest('.evo-card[data-pid]')) closePop();
        });

        return pop;
    }

    let pop = null;
    function openPop(pid, anchor) {
        if (!pop) pop = buildPopover();
        const pData = window.PDEX_CACHE[pid];
        if (!pData) return;

        pop.dataset.pid = pid;
        pop.querySelector('#pdex-pop-name').textContent = pData.name.toUpperCase();
        pop.querySelector('#pdex-pop-sprite').src = pData.sprites.front_default || '';

        const rect = anchor.getBoundingClientRect();
        const scrollY = window.scrollY;
        let left = rect.left + rect.width / 2 - 120;
        left = Math.max(8, Math.min(left, window.innerWidth - 256));
        pop.style.left = left + 'px';
        pop.style.top  = (rect.top + scrollY - 10) + 'px';
        pop.classList.add('open');
    }
    function closePop() { pop?.classList.remove('open'); }

    document.addEventListener('click', e => {
        const card = e.target.closest('.evo-card[data-pid]');
        if (!card) return;
        const pid = parseInt(card.dataset.pid);
        if (pid) openPop(pid, card);
    });

    function initListeners() {
        document.querySelectorAll('[data-type]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-type]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                loadType(btn.dataset.type);
            });
        });
    }

    function tryInit() {
        if (initialized) return;
        initialized = true;
        initListeners();
        loadType('all');
    }

    document.addEventListener('DOMContentLoaded', () => {
        initListeners();
        const page = document.getElementById('page-pokedex');
        if (page) {
            new MutationObserver(() => {
                if (page.classList.contains('active') && !initialized) tryInit();
            }).observe(page, { attributes: true, attributeFilter: ['class'] });
        }
        document.querySelector('.nav-btn[data-target="page-pokedex"]')
            ?.addEventListener('click', () => setTimeout(tryInit, 50));
    });

})();