import { makeEndings, makeFinale } from "../finale";
import { enter, exit, hold, nar, phone, react, say, set, sfx } from "../script";
import type { Beat, RouteDef } from "../types";

/**
 * Universo B — Flávio Bolsonaro venceu um segundo turno fictício e os boatos ganharam vida.
 * Flávio aparece como caricatura explicitamente fictícia. As falas são invenções
 * da obra, não citações. A piada mira a regra autoritária imaginada, a burocracia
 * e a incompetência dos vendedores, nunca mulheres, compradores ou nacionalidades.
 */

const KIT = {
  edition: "Kit Sobrevivência Edição Brasil Exportado",
  contents: "caixa tamanho continente e etiqueta impossível",
  otherEdition: "Kit Edição Igreja Fechada",
  delivery: "às 6h12, por frete internacional",
  gift: "uma sacola que aguenta uma refinaria (não aguenta)",
  otherFear: "a igreja fechar com um cadeado gigante",
};

/* ------------------------------------------------------------------ */
/* Episódio A — Brasil, Frete Internacional                            */
/* ------------------------------------------------------------------ */

const fimDoFrete: Beat[] = [phone("Família Reunida 🇧🇷❤️", "Tia Nilza (em Orlando): chegou o presente??? e o Brasil, veio junto?")];

const freteInternacional: RouteDef["episodes"][number] = {
  id: "frete",
  title: "Episódio 1 — Brasil, Frete Internacional",
  objective: "Despachar o presente de aniversário da Tia Nilza, que está em Orlando.",
  backdrop: "transportadora",
  scene: { peso: "4.700.000 t" },
  beats: [
    nar("Universo fictício: Flávio venceu. Aqui, os boatos ganharam vida."),
    enter("voce", 8, { mood: "neutro", holding: "presente", scale: 0.9 }),
    enter("robson", 88, { mood: "neutro" }),
    say("robson", "Próximo! Ah, não. Ainda é o anterior.", "preocupado"),
    enter("kaique", 56, { from: "right", mood: "fala" }),
    enter("flavio", 72, { from: "right", mood: "aponta" }),
    say("flavio", "Bom dia. Quero mandar o Brasil para os Estados Unidos. Aquela caixa ali.", "aponta"),
    {
      t: "choice",
      prompt: "Você está com o presente na mão. Reação rápida:",
      options: [
        { label: "“Com licença, é só um presentinho…”", beats: [say("flavio", "O meu também. É o Brasil. Tem laço.", "comemora")] },
        { label: "Esconder o presente atrás das costas", beats: [say("kaique", "Presidente, ele está escondendo algo. Pode ser soberania.", "aponta")] },
        { label: "Pegar uma senha e sentar", beats: [say("robson", "Sua senha é a 48. Estamos atendendo o país 47.", "deboche")] },
      ],
    },
    say("robson", "Peso?", "neutro"),
    sfx("buzina"),
    say("robson", "Excesso de bagagem. Só Brasília veio com ministérios demais.", "susto"),
    say("kaique", "É tudo equipamento de uso pessoal.", "fala"),
    say("robson", "Um Congresso é de uso pessoal?", "deboche"),
    say("kaique", "É dobrável.", "preocupado"),
    say("flavio", "E o Cristo vai na bagagem de mão. Ele já está de braços abertos, facilita a revista.", "fala"),
    set("caixa", "aberta"),
    sfx("pop"),
    nar("A tampa estoura. Os ministérios saem da caixa discutindo quem chegou primeiro."),
    react({ robson: "desespero", kaique: "susto", flavio: "susto", voce: "susto" }),
    say("robson", "Limite internacional: 3 kg por caixa. Você, do presente: me ajuda a separar isso?", "aponta"),
    say("voce", "Eu só queria mandar um presente.", "preocupado"),
    {
      t: "task",
      task: {
        kind: "assign",
        objective: "A caixa para os EUA aceita só 3 kg. Separe o que vai e o que fica no Brasil.",
        timer: 50,
        forgive: 2,
        slots: [
          { id: "caixa", label: "Caixa para os EUA", capacity: 3 },
          { id: "fica", label: "Fica no Brasil" },
        ],
        items: [
          { id: "presente", prop: "presente", label: "Presente da Tia Nilza", weight: 1, goal: "caixa", right: "O presente cabe. Finalmente algo do tamanho certo.", wrong: "O presente ficou no Brasil. A tia vai reclamar no grupo." },
          { id: "congresso", prop: "congresso", label: "Congresso", weight: 900, goal: "fica", right: "O Congresso fica. Entrou em recesso.", wrong: "O Congresso não passou. Pediu vista." },
          { id: "pesca", prop: "ministerio", label: "Ministério da Pesca", weight: 300, goal: "fica", right: "O Ministério da Pesca fica. Levou o mar junto.", wrong: "Excesso de bagagem: o Ministério da Pesca trouxe o mar." },
          { id: "reunioes", prop: "ministerio", label: "Ministério das Reuniões", weight: 300, goal: "fica", right: "Fica. Já marcou uma reunião sobre ter ficado.", wrong: "O Ministério das Reuniões marcou uma reunião sobre o próprio peso." },
          { id: "cristo", prop: "cristo", label: "Cristo Redentor", weight: 635, goal: "fica", right: "O Cristo fica. Ele gosta da vista.", wrong: "Não fecha a caixa: ele está de braços abertos." },
          { id: "amazonia", prop: "arvore", label: "Amazônia", weight: 9999, goal: "fica", right: "A Amazônia fica. Ninguém tinha perguntado a ela.", wrong: "A Amazônia não cabe em caixa nenhuma. Tentaram." },
          { id: "churrasqueira", prop: "churrasqueira", label: "Churrasqueira do Kaique", weight: 40, goal: "fica", right: "Fica. O Kaique chora baixinho.", wrong: "Churrasqueira em voo internacional? A alfândega sentiu cheiro de picanha." },
        ],
      },
      branches: {
        otimo: [
          set("caixa", "vazia"),
          set("peso", "1 kg"),
          nar("A caixa para os EUA sai com 1 kg: o presente da Tia Nilza."),
          say("robson", "Despachado! Destino: Orlando.", "comemora"),
          say("flavio", "E o Brasil?", "susto"),
          say("robson", "Fica. Excesso de bagagem não viaja.", "deboche"),
          say("kaique", "Presidente, tecnicamente o senhor entregou um presente aos Estados Unidos.", "fala"),
          say("flavio", "Então missão cumprida.", "comemora"),
          sfx("carimbo"),
          set("carimbo", "ENVIADO: 1 PRESENTE"),
          { t: "outcome", result: "vitoria", reward: { prop: "presente", name: "Comprovante de envio", blurb: "Um presente chegou a Orlando. O Brasil continua aqui." } },
          ...fimDoFrete,
        ],
        medio: [
          set("peso", "300 kg"),
          nar("Um ministério ficou escondido na caixa. Ele embarca sozinho, sem saber falar inglês."),
          say("robson", "Ministério desacompanhado. Vai precisar de autorização dos pais.", "preocupado"),
          say("kaique", "Ele é maior de idade. Tem até CNPJ.", "fala"),
          sfx("carimbo"),
          set("carimbo", "EXTRAVIADO"),
          { t: "outcome", result: "meio", reward: { prop: "ministerio", name: "Ministério extraviado", blurb: "Último paradeiro: esteira 4 de um aeroporto qualquer." } },
          ...fimDoFrete,
        ],
        ruim: [
          sfx("falha"),
          nar("O tempo acaba. A caixa explode de vez e os ministérios saem marchando em todas as direções."),
          react({ robson: "desespero", flavio: "desespero", kaique: "desespero" }),
          say("robson", "Conteúdo declarado: uma discussão.", "desespero"),
          say("flavio", "Embala do jeito que estiver.", "aponta"),
          say("robson", "Discussão não tem embalagem, presidente. Só tem continuação.", "deboche"),
          sfx("carimbo"),
          set("carimbo", "CONTEÚDO: BRIGA"),
          { t: "outcome", result: "desastre", reward: { prop: "etiqueta", name: "Etiqueta impossível", blurb: "Remetente: Brasil. Destino: Brasil, nos EUA. Conteúdo: Brasil." } },
          ...fimDoFrete,
        ],
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Episódio B — Urna com Autorização                                   */
/* ------------------------------------------------------------------ */

const flavioNaFila: Beat[] = [
  enter("flavio", 88, { from: "right", mood: "susto" }),
  say("flavio", "Que confusão é essa? Quem autorizou essa fila?", "aponta"),
  say("kelly", "O senhor tem autorização para perguntar?", "deboche"),
  nar("O presidente procura nos bolsos. Não tem."),
  say("flavio", "Vou… pedir ali.", "preocupado"),
  exit("flavio", "right"),
  say("mesario", "Entrou na fila. Pegou a senha nº ∞.", "deboche"),
  phone("Família Reunida 🇧🇷❤️", "Tia Nilza: a Kelly votou?? manda foto do comprovante (e da urna chorando)"),
];

const kellyResolve = (result: "vitoria" | "meio"): Beat[] => [
  set("urnaPisca", "1"),
  set("urna", "ERRO: CONTRADIÇÃO NÃO AUTORIZADA"),
  nar("A urna trava. A Kelly tem uma ideia."),
  say("kelly", "Se ninguém pode autorizar sem autorização, alguém precisa começar.", "aponta"),
  hold("kelly", "carimbo-autorizo"),
  say("kelly", "Eu me autorizo.", "deboche"),
  sfx("carimbo"),
  set("carimbo", "AUTORIZADA POR: ELA MESMA"),
  set("urnaPisca", null),
  set("urna", "VOTO REGISTRADO :)"),
  react({ mesario: "comemora", voce: "comemora", kelly: "comemora" }),
  say("mesario", "Isso pode?", "susto"),
  say("kelly", "Está no regulamento. Na parte que diz “ver regulamento”.", "deboche"),
  result === "vitoria"
    ? { t: "outcome", result: "vitoria", reward: { prop: "carimbo-autorizo", name: "Carimbo AUTORIZO", blurb: "A Kelly autorizou a si mesma. Saiu a melhor foto do título." } }
    : { t: "outcome", result: "meio", reward: { prop: "pasta", name: "Pasta da Kelly", blurb: "Tem um documento para tudo. Inclusive para a pasta." } },
  ...flavioNaFila,
];

const urnaAutorizacao: RouteDef["episodes"][number] = {
  id: "urna",
  title: "Episódio 2 — Urna com Autorização",
  objective: "Acompanhar a Prima Kelly até a urna.",
  backdrop: "secao",
  scene: { urna: "BEM-VINDA. APRESENTE AUTORIZAÇÃO" },
  beats: [
    enter("voce", 10, { from: "left", mood: "neutro", scale: 0.9 }),
    enter("kelly", 30, { from: "left", mood: "neutro", holding: "pasta" }),
    enter("mesario", 66, { mood: "preocupado" }),
    say("mesario", "Bom dia. Regra nova do governo: para votar, a cidadã precisa de autorização.", "preocupado"),
    say("kelly", "Autorização de quem?", "deboche"),
    say("mesario", "Da urna. Ela está muito exigente desde a atualização.", "preocupado"),
    sfx("ping"),
    set("urna", "APRESENTE AUTORIZAÇÃO DO MARIDO"),
    {
      t: "choice",
      prompt: "A Kelly olha para você. Reação rápida:",
      options: [
        { label: "“Isso não pode ser sério.”", beats: [say("mesario", "Também acho. Mas a urna é concursada.", "preocupado")] },
        { label: "Procurar a autorização no bolso", beats: [say("voce", "Achei um ticket de estacionamento.", "preocupado"), say("mesario", "Esse vale para estacionar, não para votar.", "fala")] },
        { label: "Fazer cara de quem já esperava", beats: [say("kelly", "Você também viu no grupo? Pois é. Aconteceu.", "deboche")] },
      ],
    },
    say("kelly", "Eu não sou casada.", "neutro"),
    set("urna", "APRESENTE AUTORIZAÇÃO PARA SER SOLTEIRA"),
    react({ voce: "susto", mesario: "desespero" }),
    say("kelly", "Tudo bem. Eu vim preparada. Tenho uma pasta para tudo.", "carrega"),
    say("voce", "Até para isso?", "susto"),
    say("kelly", "Principalmente para isso. Me ajuda a escolher os documentos.", "aponta"),
    set("urna", "EXIGÊNCIAS: VER ABAIXO ↓"),
    {
      t: "task",
      task: {
        kind: "steps",
        objective: "Escolha o documento que deixa a urna sem resposta. Respostas burocráticas geram mais papel.",
        asker: "A urna",
        maxErrors: 3,
        steps: [
          {
            demand: "APRESENTE AUTORIZAÇÃO DO MARIDO.",
            options: [
              { label: "Declaração de que não tem marido", prop: "certidao", good: true, reply: "URNA: “ACEITA. APRESENTE AUTORIZAÇÃO DO MARIDO PARA A DECLARAÇÃO.” Kelly: “Do marido que eu não tenho?” URNA: “…PROCESSANDO.”" },
              { label: "Foto de um homem qualquer", prop: "papel", good: false, reply: "A urna aceita a foto como marido e exige a certidão de casamento com a foto." },
              { label: "Pedir com muita educação", good: false, reply: "A urna imprime um Formulário de Súplica, em três vias." },
            ],
          },
          {
            demand: "APRESENTE AUTORIZAÇÃO DO PAI.",
            options: [
              { label: "Certidão de nascimento: Kelly tem 34 anos", prop: "certidao", good: true, reply: "URNA: “MAIORIDADE DETECTADA. ISSO NÃO ESTAVA NO MANUAL.”" },
              { label: "Ligar para o pai", prop: "celular", good: false, reply: "O pai pergunta se é golpe. A urna também." },
              { label: "Autorização da mãe", prop: "papel", good: false, reply: "A urna não reconhece mães. A mãe da Kelly está a caminho para conversar com a urna." },
            ],
          },
          {
            demand: "APRESENTE O REGULAMENTO QUE EXIGE AUTORIZAÇÃO.",
            options: [
              { label: "Pedir o regulamento ao mesário", prop: "formulario", good: true, reply: "O mesário procura e lê em voz alta: “Ver regulamento.” Só isso. É o regulamento inteiro." },
              { label: "Assinar um termo de concordância", prop: "papel", good: false, reply: "A Kelly concorda com 47 cláusulas, incluindo a de não discordar." },
              { label: "Esperar a urna se acalmar", prop: "senha", good: false, reply: "A urna entrega a senha nº ∞ e começa a tocar música de espera." },
            ],
          },
          {
            demand: "APRESENTE AUTORIZAÇÃO PARA SOLICITAR AUTORIZAÇÃO.",
            options: [
              { label: "O título de eleitora da Kelly", prop: "titulo", good: true, reply: "URNA: “TÍTULO… DE… ELEITORA…” A tela pisca. A urna não sabe o que fazer com um documento que já autoriza." },
              { label: "Autorização para solicitar a autorização da autorização", prop: "formulario", good: false, reply: "A urna agradece e pede autorização para recebê-la." },
              { label: "RG", prop: "rg", good: false, reply: "A urna aceita o RG e pede o RG do RG." },
            ],
          },
        ],
      },
      branches: {
        otimo: kellyResolve("vitoria"),
        medio: kellyResolve("meio"),
        travou: [
          set("pilha", "18"),
          sfx("falha"),
          nar("Formulários demais. A pilha passa da altura da cabine."),
          react({ mesario: "desespero", voce: "susto" }),
          say("mesario", "A urna pediu férias.", "desespero"),
          say("kelly", "Então eu voto no papel.", "aponta"),
          say("mesario", "Papel não pode.", "preocupado"),
          say("kelly", "Papel é o que mais tem aqui.", "deboche"),
          nar("Ela escreve o voto no verso do Formulário 27-B e coloca na urna. A urna, sem saber o que fazer, aceita."),
          set("urna", "VOTO… ACEITO?"),
          { t: "outcome", result: "desastre", reward: { prop: "formulario", name: "Formulário 27-B (com voto no verso)", blurb: "O único voto contado à mão este ano. Contado três vezes." } },
          ...flavioNaFila,
        ],
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Episódio C — Petrobras na Sacola                                    */
/* ------------------------------------------------------------------ */

const fimDaRefinaria: Beat[] = [
  phone("Família Reunida 🇧🇷❤️", "Tio Osvaldo: VENDERAM A PETROBRAS NUMA SACOLA!!! (foto de uma sacola vazia)"),
  say("voce", "E o meu combustível?", "preocupado"),
  say("wanderley", "Acabou. Mas tem sacola.", "fala"),
];

const petrobrasNaSacola: RouteDef["episodes"][number] = {
  id: "sacola",
  title: "Episódio 3 — Petrobras na Sacola",
  objective: "Abastecer o carro no posto ao lado da refinaria.",
  backdrop: "refinaria",
  scene: { sacola: "vazia", placa: "VENDE-SE · TRATAR AQUI" },
  beats: [
    enter("voce", 8, { from: "left", mood: "neutro", scale: 0.9 }),
    enter("flavio", 34, { from: "right", mood: "carrega", holding: "sacola" }),
    enter("wanderley", 56, { from: "right", mood: "fala" }),
    enter("leila", 84, { from: "right", mood: "neutro", holding: "pasta" }),
    say("flavio", "Prontinho. A refinaria vai aqui na sacola. Só falta caber.", "carrega"),
    say("leila", "Leila Farah, Consórcio Golfo Azul. Antes de assinar, umas perguntas práticas.", "fala"),
    {
      t: "choice",
      prompt: "Você só queria abastecer. Reação rápida:",
      options: [
        { label: "Perguntar se a gasolina vem junto na sacola", beats: [say("flavio", "Vem. A gasolina, o posto e você, se couber.", "comemora")] },
        { label: "Oferecer uma sacola maior", beats: [say("wanderley", "Não precisa. Essa é retornável.", "fala")] },
        { label: "Fingir que é frentista", beats: [say("leila", "Ótimo, alguém que entende do assunto. Fique por perto.", "aponta")] },
      ],
    },
    say("leila", "Vem com manual?", "neutro"),
    say("wanderley", "Manual… vem. Está na sacola. Embaixo da refinaria.", "preocupado"),
    say("leila", "E o cabo para ligar a refinaria?", "neutro"),
    say("flavio", "Ela liga na tomada?", "susto"),
    say("leila", "E o frete? Como isso chega até nós?", "neutro"),
    say("wanderley", "A gente dobra a chaminé e manda como carta registrada.", "fala"),
    nar("Ninguém incluiu o manual, o frete ou o cabo."),
    say("leila", "Sem os três, eu não fecho negócio. Nem abro.", "deboche"),
    say("flavio", "Você aí, do posto. Ajuda a gente a montar essa entrega?", "aponta"),
    say("voce", "Eu só vim abastecer.", "desespero"),
    {
      t: "task",
      task: {
        kind: "assign",
        objective: "Um item certo para cada exigência da compradora. O resto vai para o lixo.",
        timer: 70,
        forgive: 3,
        slots: [
          { id: "manual", label: "Manual" },
          { id: "cabo", label: "Cabo de ligar" },
          { id: "frete", label: "Frete" },
          { id: "lixo", label: "Não serve (lixo)" },
        ],
        items: [
          { id: "m-wand", prop: "formulario", label: "Manual escrito à mão pelo Wanderley", goal: "manual", right: "Leila lê a página 1: “Ligar. Não desligar.” Ela anota: “conciso”.", wrong: "Leila: “Isso é o único manual que existe. Não joga fora.”" },
          { id: "m-micro", prop: "manual", label: "Manual do micro-ondas", goal: "lixo", wrong: "Leila: “Esse manual ensina a fazer pipoca. A refinaria faz outras coisas.”" },
          { id: "m-video", prop: "celular", label: "Tutorial em vídeo de 4 horas", goal: "lixo", wrong: "Leila: “Começa com 40 minutos de propaganda de curso.”" },
          { id: "c-9km", prop: "cabo", label: "Cabo de 9 km enrolado no Kaique", goal: "cabo", right: "O cabo chega com o Kaique enrolado. Leila aceita os dois.", wrong: "Leila: “Esse é o único cabo que alcança. Com Kaique e tudo.”" },
          { id: "c-ext", prop: "extensao", label: "Extensão de 3 metros", goal: "lixo", wrong: "Leila: “A refinaria fica a 8 mil quilômetros da tomada.”" },
          { id: "c-cel", prop: "cabo", label: "Carregador de celular", goal: "lixo", wrong: "Leila: “Carrega 2% de refinaria por hora.”" },
          { id: "f-cam", prop: "caminhao", label: "Caminhão emprestado do posto", goal: "frete", right: "O frentista empresta o caminhão. Pede de volta com o tanque cheio.", wrong: "Leila: “É o único veículo maior que a sacola.”" },
          { id: "f-bike", prop: "bicicleta", label: "Bicicleta de entrega", goal: "lixo", wrong: "Leila: “A refinaria não cabe na mochila térmica.”" },
          { id: "f-car", prop: "carrinho", label: "Carrinho de supermercado", goal: "lixo", wrong: "Leila: “Tem uma rodinha travada. E é uma refinaria.”" },
          { id: "fita", prop: "fita-crepe", label: "Fita crepe", goal: "lixo", wrong: "Wanderley: “Com fita crepe, fecha qualquer coisa.” Leila: “Não fecha negócio.”" },
        ],
      },
      branches: {
        otimo: [
          set("sacola", "cheia"),
          hold("flavio", null),
          nar("Manual, cabo e frete prontos. Por algum motivo, a refinaria também coube na sacola."),
          say("leila", "Agora sim. Só falta uma coisa.", "comemora"),
          say("flavio", "O quê?", "susto"),
          say("leila", "O dono. Quem assina a venda?", "neutro"),
          say("flavio", "Ele.", "aponta"),
          say("wanderley", "Eu? Eu sou o rapaz da sacola.", "desespero"),
          nar("Ninguém tem autorização para vender. A venda é cancelada por falta de vendedor."),
          set("placa", "NÃO SE VENDE (NINGUÉM SABE COMO)"),
          react({ leila: "deboche", flavio: "desespero", voce: "comemora" }),
          { t: "outcome", result: "vitoria", reward: { prop: "sacola", name: "Sacola “Obrigado”", blurb: "Ex-embalagem de uma refinaria. Aguenta 5 kg." } },
          ...fimDaRefinaria,
        ],
        medio: [
          nar("O tempo acaba com a entrega pela metade. Algumas peças ficaram no chão do posto."),
          say("leila", "Assim eu devolvo. Por favor, embalem do jeito que veio.", "preocupado"),
          say("flavio", "Veio sem embalagem.", "fala"),
          say("leila", "Exatamente.", "deboche"),
          { t: "outcome", result: "meio", reward: { prop: "cabo", name: "Cabo de 9 km", blurb: "O Kaique ainda está enrolado nele." } },
          ...fimDaRefinaria,
        ],
        ruim: [
          sfx("falha"),
          nar("O tempo acaba. Wanderley tenta enfiar a refinaria na sacola com o pé."),
          set("carimbo", "RASGOU"),
          react({ wanderley: "desespero", flavio: "desespero", leila: "deboche" }),
          say("leila", "Vou mandar um e-mail. Com um manual de como vender uma refinaria.", "deboche"),
          say("flavio", "Vem com cabo?", "desespero"),
          exit("leila", "right"),
          { t: "outcome", result: "desastre", reward: { prop: "fita-crepe", name: "Fita crepe presidencial", blurb: "Não fechou o negócio. Fechou a sacola, pelo menos." } },
          ...fimDaRefinaria,
        ],
      },
    },
  ],
};

export const flavio: RouteDef = {
  id: "flavio",
  name: "Brasil: Governo Flávio",
  tagline: "O Flávio caricato despacha o Brasil para os EUA, cria uma urna que pede autorização e tenta vender uma refinaria numa sacola.",
  errands: ["Despachar um presente", "Levar a Prima Kelly para votar", "Abastecer o carro"],
  president: "flavio",
  episodes: [freteInternacional, urnaAutorizacao, petrobrasNaSacola],
  finale: makeFinale(KIT),
  endings: makeEndings(KIT),
};
