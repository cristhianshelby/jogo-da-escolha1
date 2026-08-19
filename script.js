// ===== ESTADO DO JOGO =====
const GAME_KEY = 'jogoDecisaoData';

const defaultState = {
    health: 100,
    maxHealth: 100,
    steps: 0,
    inventory: [],
    decisions: [],
    gameOver: false,
    path: [],
    forca: 0,
    magia: 0,
    diplomacia: 0,
    // SISTEMA DE PONTUAÇÃO PARA FINAIS
    pontosFinais: 0, // Pontuação total acumulada
    escolhasBoas: 0,
    escolhasRuins: 0,
    escolhasNeutras: 0,
    finalCalculado: false
};

function getState() {
    try {
        const saved = localStorage.getItem(GAME_KEY);
        if (saved) return { ...defaultState, ...JSON.parse(saved) };
    } catch(e) {}
    return { ...defaultState };
}

function saveState(state) {
    localStorage.setItem(GAME_KEY, JSON.stringify(state));
}

function resetState() {
    localStorage.removeItem(GAME_KEY);
    return { ...defaultState };
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function modifyHealth(amount) {
    const state = getState();
    state.health = Math.max(0, Math.min(state.maxHealth, state.health + amount));
    saveState(state);
    return state.health;
}

function addItem(item) {
    const state = getState();
    if (!state.inventory.includes(item)) {
        state.inventory.push(item);
        saveState(state);
        return true;
    }
    return false;
}

function hasItem(item) {
    return getState().inventory.includes(item);
}

function removeItem(item) {
    const state = getState();
    const idx = state.inventory.indexOf(item);
    if (idx !== -1) {
        state.inventory.splice(idx, 1);
        saveState(state);
        return true;
    }
    return false;
}

function addDecision(decisionName) {
    const state = getState();
    state.decisions.push(decisionName);
    state.steps += 1;
    saveState(state);
}

function addForca(valor) {
    const state = getState();
    state.forca += valor;
    saveState(state);
}

function addMagia(valor) {
    const state = getState();
    state.magia += valor;
    saveState(state);
}

function addDiplomacia(valor) {
    const state = getState();
    state.diplomacia += valor;
    saveState(state);
}

// ===== SISTEMA DE PONTOS PARA FINAIS =====
function addPontoFinal(valor) {
    const state = getState();
    state.pontosFinais += valor;
    if (valor > 0) state.escolhasBoas += 1;
    else if (valor < 0) state.escolhasRuins += 1;
    else state.escolhasNeutras += 1;
    saveState(state);
    console.log(`⭐ Pontos: ${valor > 0 ? '+' : ''}${valor} | Total: ${state.pontosFinais}`);
}

function addPontoBom() {
    addPontoFinal(2);
}

function addPontoRuim() {
    addPontoFinal(-2);
}

function addPontoNeutro() {
    addPontoFinal(0);
}

// ===== FUNÇÃO QUE CALCULA O FINAL AUTOMATICAMENTE =====
function calcularFinalAutomatico() {
    const state = getState();
    
    // 1. PONTOS DAS ESCOLHAS (já acumulados)
    let pontuacao = state.pontosFinais || 0;
    
    // 2. BÔNUS POR ATRIBUTOS (cada 5 pontos = +1)
    pontuacao += Math.floor((state.forca || 0) / 5);
    pontuacao += Math.floor((state.magia || 0) / 5);
    pontuacao += Math.floor((state.diplomacia || 0) / 5);
    
    // 3. BÔNUS POR ITENS ESPECIAIS
    if (hasItem('Espada Lendária')) pontuacao += 5;
    if (hasItem('Armadura Reforçada')) pontuacao += 4;
    if (hasItem('Poder Mágico')) pontuacao += 5;
    if (hasItem('Diplomacia')) pontuacao += 4;
    if (hasItem('Bênção dos Deuses')) pontuacao += 5;
    if (hasItem('Livro de Feitiços')) pontuacao += 3;
    if (hasItem('Estratégia de Batalha')) pontuacao += 3;
    if (hasItem('Fragmento de Dragão')) pontuacao += 5;
    if (hasItem('Amuleto')) pontuacao += 3;
    if (hasItem('Pérola')) pontuacao += 3;
    
    // 4. BÔNUS POR VIDA RESTANTE
    if (state.health > 80) pontuacao += 5;
    else if (state.health > 60) pontuacao += 3;
    else if (state.health > 40) pontuacao += 1;
    else if (state.health <= 20) pontuacao -= 3;
    
    // 5. BÔNUS POR DECISÕES TOMADAS (quanto mais, melhor - mostra que jogou)
    pontuacao += Math.floor((state.steps || 0) / 2);
    
    // 6. PENALIDADE POR ITENS PERDIDOS OU DECISÕES RUINS
    if (state.escolhasRuins > state.escolhasBoas) {
        pontuacao -= (state.escolhasRuins - state.escolhasBoas) * 2;
    }
    
    // Salva a pontuação final
    state.pontuacaoFinal = pontuacao;
    state.finalCalculado = true;
    saveState(state);
    
    console.log(`📊 PONTUAÇÃO FINAL: ${pontuacao}`);
    console.log(`✅ Escolhas Boas: ${state.escolhasBoas}`);
    console.log(`❌ Escolhas Ruins: ${state.escolhasRuins}`);
    console.log(`⚖️ Escolhas Neutras: ${state.escolhasNeutras}`);
    
    return pontuacao;
}

// ===== FUNÇÃO PARA IR DIRETO AO FINAL CORRETO =====
function irParaFinal() {
    const pontuacao = calcularFinalAutomatico();
    const state = getState();
    
    // Determina o final baseado na pontuação
    if (pontuacao >= 30) {
        // FINAL BOM - Herói Lendário
        state.finalTipo = 'bom';
        saveState(state);
        window.location.href = 'final-bom.html';
    } else if (pontuacao >= 15) {
        // FINAL NEUTRO - Sobrevivente
        state.finalTipo = 'neutro';
        saveState(state);
        window.location.href = 'final-neutro.html';
    } else {
        // FINAL RUIM - Reino Destruído
        state.finalTipo = 'ruim';
        state.gameOver = true;
        saveState(state);
        window.location.href = 'final-ruim.html';
    }
}

function goToMenu() {
    window.location.href = 'index.html';
}

function resetGame() {
    if (confirm('Reiniciar jornada?')) {
        resetState();
        window.location.href = 'index.html';
    }
}

function updateUI() {
    const state = getState();
    const h = document.getElementById('health');
    const s = document.getElementById('steps');
    const i = document.getElementById('inventory-display');
    const p = document.getElementById('pontos-display');
    
    if (h) {
        h.textContent = state.health;
        h.className = state.health <= 20 ? 'low' : state.health <= 50 ? 'medium' : '';
    }
    if (s) s.textContent = state.steps;
    if (i) i.textContent = state.inventory.length > 0 ? state.inventory.join(' | ') : 'Vazio';
    if (p) p.textContent = state.pontosFinais || 0;
}

// ===== EXPORTA =====
window.getState = getState;
window.saveState = saveState;
window.resetState = resetState;
window.modifyHealth = modifyHealth;
window.addItem = addItem;
window.hasItem = hasItem;
window.removeItem = removeItem;
window.goToMenu = goToMenu;
window.resetGame = resetGame;
window.updateUI = updateUI;
window.randomInt = randomInt;
window.addDecision = addDecision;
window.addForca = addForca;
window.addMagia = addMagia;
window.addDiplomacia = addDiplomacia;
window.addPontoBom = addPontoBom;
window.addPontoRuim = addPontoRuim;
window.addPontoNeutro = addPontoNeutro;
window.addPontoFinal = addPontoFinal;
window.calcularFinalAutomatico = calcularFinalAutomatico;
window.irParaFinal = irParaFinal;