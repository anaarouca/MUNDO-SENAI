
const grade = document.getElementById("grade");
const listaPalavras = document.getElementById("listaPalavras");
const nivel = document.getElementById("nivel");
const progresso = document.getElementById("progresso");
const restantes = document.getElementById("restantes");
const mensagem = document.getElementById("mensagem");
const novoJogo = document.getElementById("novoJogo");

// BANCO DE PALAVRAS

const bancoPalavras = [
    "ESTOQUE",
    "ARMAZENAGEM",
    "TRANSPORTE",
    "DISTRIBUICAO",
    "INVENTARIO",

    "CIRCUITO",
    "RESISTOR",
    "CAPACITOR",
    "TENSAO",
    "CORRENTE",

    "MOTOR",
    "SENSOR",
    "AUTOMACAO",
    "MANUTENCAO",
    "ATUADOR",

    "TORNO",
    "FRESA",
    "USINAGEM",
    "SOLDAGEM",
    "ENGRENAGEM",

    "ALGORITMO",
    "CODIGO",
    "BANCODEDADOS",
    "SOFTWARE",
    "JAVASCRIPT"
];

// DIREÇÕES DAS PALAVRAS

const direcoes = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1]
];

let tamanho;
let palavras = [];
let letras = [];
let inicio = null;
let encontradas = [];
let celulasEncontradas = new Set();
let faseConcluida = false;

// EMBARALHAR PALAVRAS

function embaralhar(lista) {
    return [...lista].sort(() => Math.random() - 0.5);
}

// CRIAR TABULEIRO

function criarGrade() {

    letras = Array.from(
        { length: tamanho },
        () => Array(tamanho).fill("")
    );

}

// POSICIONAR PALAVRAS

function posicionarPalavra(palavra) {

    for (let tentativa = 0; tentativa < 1000; tentativa++) {

        const [linhaDirecao, colunaDirecao] =
            direcoes[Math.floor(Math.random() * direcoes.length)];

        const linha = Math.floor(Math.random() * tamanho);
        const coluna = Math.floor(Math.random() * tamanho);

        const finalLinha =
            linha + (palavra.length - 1) * linhaDirecao;

        const finalColuna =
            coluna + (palavra.length - 1) * colunaDirecao;

        if (
            finalLinha < 0 ||
            finalLinha >= tamanho ||
            finalColuna < 0 ||
            finalColuna >= tamanho
        ) {
            continue;
        }

        let podeColocar = true;

        for (let i = 0; i < palavra.length; i++) {

            const l = linha + i * linhaDirecao;
            const c = coluna + i * colunaDirecao;

            if (
                letras[l][c] !== "" &&
                letras[l][c] !== palavra[i]
            ) {
                podeColocar = false;
                break;
            }

        }

        if (!podeColocar) continue;

        for (let i = 0; i < palavra.length; i++) {

            const l = linha + i * linhaDirecao;
            const c = coluna + i * colunaDirecao;

            letras[l][c] = palavra[i];

        }

        return true;

    }

    return false;

}

// PREENCHER ESPAÇOS VAZIOS

function preencherVazios() {

    const alfabeto = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (let l = 0; l < tamanho; l++) {

        for (let c = 0; c < tamanho; c++) {

            if (letras[l][c] === "") {

                const sorteada = Math.floor(
                    Math.random() * alfabeto.length
                );

                letras[l][c] = alfabeto[sorteada];

            }

        }

    }

}

// MOSTRAR GRADE NA TELA

function mostrarGrade() {

    grade.innerHTML = "";

    grade.style.gridTemplateColumns =
        `repeat(${tamanho}, minmax(0, 1fr))`;

    for (let l = 0; l < tamanho; l++) {

        for (let c = 0; c < tamanho; c++) {

            const botao = document.createElement("button");

            botao.className = "letra";
            botao.textContent = letras[l][c];

            botao.dataset.linha = l;
            botao.dataset.coluna = c;

            const chave = `${l}-${c}`;

            if (celulasEncontradas.has(chave)) {
                botao.classList.add("encontrada");
            }

            botao.addEventListener("click", selecionarLetra);

            grade.appendChild(botao);

        }

    }

}

// MOSTRAR LISTA DE PALAVRAS

function mostrarPalavras() {

    listaPalavras.innerHTML = "";

    palavras.forEach(palavra => {

        const item = document.createElement("li");

        item.textContent = palavra;

        if (encontradas.includes(palavra)) {
            item.classList.add("encontrada");
        }

        listaPalavras.appendChild(item);

    });

}

// SELECIONAR LETRAS

function selecionarLetra(evento) {

    // Impedir novas seleções após concluir a fase

    if (faseConcluida) return;

    const linha = Number(evento.target.dataset.linha);
    const coluna = Number(evento.target.dataset.coluna);

    if (inicio === null) {

        inicio = { linha, coluna };

        mostrarSelecao();

        return;

    }

    const fim = { linha, coluna };

    const diferencaLinha = fim.linha - inicio.linha;
    const diferencaColuna = fim.coluna - inicio.coluna;

    const quantidade = Math.max(
        Math.abs(diferencaLinha),
        Math.abs(diferencaColuna)
    );

    // VERIFICAR SE A SELEÇÃO É RETA

    const alinhada =
        quantidade > 0 &&
        (
            diferencaLinha === 0 ||
            diferencaColuna === 0 ||
            Math.abs(diferencaLinha) === Math.abs(diferencaColuna)
        );

    if (!alinhada) {

        inicio = { linha, coluna };

        mostrarSelecao();

        return;

    }

    const passoLinha = diferencaLinha / quantidade;
    const passoColuna = diferencaColuna / quantidade;

    let palavraSelecionada = "";
    let celulas = [];

    for (let i = 0; i <= quantidade; i++) {

        const l = inicio.linha + i * passoLinha;
        const c = inicio.coluna + i * passoColuna;

        palavraSelecionada += letras[l][c];

        celulas.push(`${l}-${c}`);

    }

    const palavraInvertida = palavraSelecionada
        .split("")
        .reverse()
        .join("");

    const palavraCorreta = palavras.find(p =>
        p === palavraSelecionada ||
        p === palavraInvertida
    );

    if (
        palavraCorreta &&
        !encontradas.includes(palavraCorreta)
    ) {

        encontradas.push(palavraCorreta);

        celulas.forEach(celula => {
            celulasEncontradas.add(celula);
        });

        atualizarJogo();

    }

    inicio = null;

    mostrarGrade();

}

// DESTACAR PRIMEIRA LETRA SELECIONADA

function mostrarSelecao() {

    mostrarGrade();

    const botoes = document.querySelectorAll(".letra");

    botoes.forEach(botao => {

        const l = Number(botao.dataset.linha);
        const c = Number(botao.dataset.coluna);

        if (
            l === inicio.linha &&
            c === inicio.coluna
        ) {
            botao.classList.add("selecionada");
        }

    });

}

// ANIMAÇÃO DE CONFETES

function soltarConfetes() {

    const cores = ["#C83232", "#213E91"];

    for (let i = 0; i < 150; i++) {

        const confete = document.createElement("div");

        confete.classList.add("confete");

        confete.style.left = Math.random() * 100 + "vw";

        confete.style.backgroundColor =
            cores[Math.floor(Math.random() * cores.length)];

        confete.style.animationDuration =
            (3 + Math.random() * 3) + "s";

        confete.style.animationDelay =
            Math.random() * 1.5 + "s";

        confete.style.borderRadius =
            Math.random() > 0.5 ? "50%" : "2px";

        document.body.appendChild(confete);

        setTimeout(() => {
            confete.remove();
        }, 6500);

    }

}

// ATUALIZAR CONTADOR E VERIFICAR CONCLUSÃO

function atualizarJogo() {

    const quantidadeEncontrada = encontradas.length;

    const quantidadeRestante =
        palavras.length - quantidadeEncontrada;

    progresso.textContent =
        `${quantidadeEncontrada} / ${palavras.length}`;

    restantes.textContent = quantidadeRestante;

    mostrarPalavras();
    mostrarGrade();

    // COMEMORAR QUANDO TODAS AS PALAVRAS FOREM ENCONTRADAS

    if (
        quantidadeEncontrada === palavras.length &&
        palavras.length > 0 &&
        !faseConcluida
    ) {

        faseConcluida = true;

        mensagem.textContent =
            "PARABÉNS! VOCÊ CONCLUIU A FASE!";

        soltarConfetes();

    }

}

// INICIAR NOVO JOGO

function iniciarJogo() {

    inicio = null;
    encontradas = [];
    celulasEncontradas = new Set();

    // LIBERAR UMA NOVA COMEMORAÇÃO

    faseConcluida = false;

    mensagem.textContent = "";

    const configuracoes = {
        facil: { tamanho: 10, quantidade: 5 },
        medio: { tamanho: 13, quantidade: 10 },
        dificil: { tamanho: 16, quantidade: 15 }
    };

    const configuracao = configuracoes[nivel.value];

    tamanho = configuracao.tamanho;

    criarGrade();

    const disponiveis = bancoPalavras.filter(
        palavra => palavra.length <= tamanho
    );

    const sorteadas = embaralhar(disponiveis)
        .slice(0, configuracao.quantidade);

    palavras = [];

    sorteadas.forEach(palavra => {

        if (posicionarPalavra(palavra)) {
            palavras.push(palavra);
        }

    });

    preencherVazios();

    mostrarGrade();
    mostrarPalavras();

    progresso.textContent = `0 / ${palavras.length}`;
    restantes.textContent = palavras.length;

}

// BOTÃO DE NOVO JOGO

novoJogo.addEventListener("click", iniciarJogo);

// TROCAR DIFICULDADE

nivel.addEventListener("change", iniciarJogo);

// INICIAR AO ABRIR A PÁGINA

iniciarJogo();
