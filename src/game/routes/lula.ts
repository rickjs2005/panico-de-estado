import type { RouteDef } from "../types";

/**
 * Rota A — Brasil hipotético em que Lula venceu.
 * O Presidente é uma caricatura hipotética: aparece em cena e reage, mas não tem falas.
 * Os boatos são invenções para o jogo e a piada é sempre a máquina de pânico:
 * quem inventa, quem encaminha sem ler, quem tenta conter e quem lucra.
 */
export const lula: RouteDef = {
  id: "lula",
  name: "Brasil: Governo Lula",
  tagline: "Igrejas fechando, comunismo na geladeira, o país “entregue à China”. Nada disso é verdade. Tente explicar isso.",
  ministry: "Ministério da Tranquilidade Pública",
  rumors: [
    "“O governo vai fechar as igrejas.”",
    "“O Brasil vai virar comunista.”",
    "“O país será entregue à China.”",
    "“Crianças serão obrigadas a trocar de sexo.”",
  ],
  intro: [
    "Brasil hipotético. Lula venceu. O país acordou dividido em dois grupos de WhatsApp.",
    "Você é assessor(a) de comunicação do Ministério da Tranquilidade Pública. É o seu primeiro dia.",
    "Sua missão: impedir que quatro boatos absurdos virem o fim do mundo.",
    "O fim do mundo já tem 4 mil encaminhamentos.",
  ],
  cast: ["voce", "lula", "brisa", "jessica", "wellington", "rubens", "vibes", "nilza", "osvaldo", "kelly", "didi"],
  roles: { player: "voce", boss: "jessica", president: "lula" },
  rounds: [
    // 1 ─ o boato nasce no grupo da família (escolha contra o relógio)
    {
      id: "igrejas",
      mode: "choice",
      kind: "chat",
      channel: "Família Reunida 🇧🇷❤️",
      meta: "237 membros · Tio Osvaldo está digitando…",
      time: "06:12",
      cast: [
        { id: "osvaldo", mood: "susto" },
        { id: "nilza", mood: "preocupado" },
        { id: "kelly", mood: "deboche" },
        { id: "didi", mood: "neutro" },
      ],
      lines: [
        { tone: "system", text: "Hoje" },
        {
          tone: "forward",
          from: "Tio Osvaldo",
          text: "URGENTE!!! O governo vai FECHAR TODAS AS IGREJAS a partir de segunda. Já tem lista. REPASSEM",
        },
        { tone: "fiction", text: "Boato inventado para este jogo. No grupo, ninguém leu este aviso." },
        { from: "Prima Kelly", text: "que lista?" },
        { from: "Tio Osvaldo", text: "a lista que eles não querem que a gente veja" },
        { from: "Tia Nilza", text: "já tirei o santo da parede e guardei no porta-luvas" },
        { from: "Vô Didi", text: "a igreja do bairro tá fechada mesmo" },
        { from: "Prima Kelly", text: "vô, é terça, 6 da manhã" },
        { tone: "dm", from: "Jéssica Ventania", text: "4 mil encaminhamentos. Responde esse grupo AGORA. Você tem 20 segundos." },
      ],
      prompt: "Responda antes que o boato saia do grupo",
      timer: 20,
      timeout: {
        effects: { panico: 10, caos: 10 },
        result: [
          "Você demorou.",
          "Prima Kelly respondeu “kkkkk” e foi removida do grupo por deboche.",
          "Sem a Kelly, ninguém mais pergunta “fonte?”.",
        ],
        reactions: { kelly: "desespero", osvaldo: "comemora", nilza: "deboche" },
      },
      choices: [
        {
          id: "foto",
          label: "Mandar a foto da missa de hoje, com data e hora",
          effects: { panico: 5, popularidade: 5, caos: 10 },
          result: [
            "Tio Osvaldo dá zoom na foto: “MISSA CLANDESTINA”.",
            "A missa das 7h, que tinha 9 pessoas, agora tem 400 e um carro de som.",
            "O padre agradece ao governo pelo público.",
          ],
          reactions: { osvaldo: "susto", nilza: "comemora", kelly: "deboche", didi: "comemora" },
        },
        {
          id: "audio",
          label: "Mandar um áudio de 7 minutos explicando tudo",
          effects: { panico: 10, popularidade: -5, caos: 10 },
          result: [
            "Ninguém ouviu o áudio.",
            "Vô Didi ouviu no viva-voz, dentro da igreja.",
            "A igreja inteira escutou a palavra “fechar” e foi embora antes do sermão.",
          ],
          reactions: { didi: "susto", osvaldo: "comemora", nilza: "desespero", kelly: "deboche" },
        },
        {
          id: "silenciar",
          label: "Silenciar o grupo por 8 horas",
          effects: { panico: -5, caos: 5 },
          ignore: true,
          result: ["Silêncio.", "Por 9 segundos."],
          reactions: { nilza: "preocupado", osvaldo: "deboche" },
          aftershock: { from: "Tia Nilza", text: "Silenciou o grupo? Na igreja a gente chama isso de omissão." },
        },
      ],
    },

    // 2 ─ o boato vaza: tocar nas notificações
    {
      id: "avalanche",
      mode: "tap",
      kind: "feed",
      channel: "O boato saiu do grupo",
      meta: "Notificações chegando mais rápido do que você lê",
      time: "07:40",
      cast: [
        { id: "voce", mood: "susto" },
        { id: "jessica", mood: "preocupado" },
      ],
      lines: [
        { tone: "dm", from: "Jéssica Ventania", text: "O boato das igrejas vazou do grupo. Silencia o que puder antes que cubra o seu celular." },
      ],
      prompt: "Toque nas notificações antes que elas cubram a tela",
      duration: 14,
      spawnEvery: 1300,
      maxOnScreen: 6,
      items: [
        { from: "@verdadeoculta_br", text: "MINHA IGREJA JÁ TÁ COM CADEADO (era o cadeado da bicicleta do padre)" },
        { from: "Tia Nilza", text: "levei as cadeiras de plástico da igreja pra casa, por segurança" },
        { from: "Grupo do Condomínio", text: "o salão de festas conta como igreja? temos culto de aniversário sábado" },
        { from: "@comunicando.a.verdade", text: "e quando fecharem as igrejas vão abrir o quê? SINDICATO COM ÓRGÃO?" },
        { from: "Rádio Fim de Tarde", text: "Fiéis fazem fila para entrar antes que feche; igreja nunca esteve tão cheia" },
        { from: "Coach Rubens Muralha", text: "KIT FÉ BLINDADA 🔒 com terço anti-hacker. 12x" },
        { from: "Vô Didi", text: "rezei em casa por precaução. a vizinha ouviu e chamou a polícia" },
        { from: "@tiozao.alerta", text: "padre visto saindo da igreja COM UMA MALA (era o almoço)" },
      ],
      outcomes: {
        good: {
          effects: { panico: -10, popularidade: 5, caos: -5 },
          result: [
            "Você silenciou a avalanche. O celular respira.",
            "A igreja do bairro bateu recorde de público: todo mundo foi conferir se tinha fechado.",
            "Ninguém ficou para a missa. Mas todos tiraram selfie na porta.",
          ],
          reactions: { voce: "comemora", jessica: "comemora" },
        },
        mid: {
          effects: { panico: 5, caos: 5 },
          result: [
            "Algumas escaparam.",
            "Uma delas chegou ao grupo dos coroinhas, que entrou em greve preventiva.",
            "Ninguém sabe contra quem.",
          ],
          reactions: { voce: "preocupado", jessica: "preocupado" },
        },
        bad: {
          effects: { panico: 15, popularidade: -5, caos: 10 },
          result: [
            "As notificações cobriram a tela.",
            "Uma delas era sua mãe perguntando se você está bem. Você não viu.",
            "Ela encaminhou a pergunta para 237 pessoas.",
          ],
          reactions: { voce: "desespero", jessica: "desespero" },
        },
      },
    },

    // 3 ─ pronunciamento: cortar o sinal antes do trecho recortável
    {
      id: "comunismo",
      mode: "interrupt",
      kind: "speech",
      channel: "Rede Nacional",
      meta: "Pronunciamento do Ministro da Tranquilidade Pública",
      time: "21:00",
      cast: [
        { id: "brisa", mood: "preocupado" },
        { id: "lula", mood: "neutro" },
        { id: "voce", mood: "preocupado" },
      ],
      lines: [
        { tone: "aside", text: "Novo boato do dia: “o Brasil vai virar comunista e o governo vai dividir a sua casa”." },
        { tone: "fiction", text: "Boato inventado para este jogo." },
        { tone: "aside", text: "O ministro Otávio Brisa vai ao ar para desmentir. O Presidente, caricato e mudo, assiste do fundo." },
        { tone: "dm", from: "Jéssica Ventania", text: "Tem uma frase nesse texto que vira corte em 4 segundos. Você está com o botão de cortar o sinal." },
      ],
      prompt: "Corte a transmissão antes do trecho que dá para tirar de contexto",
      speaker: "Ministro Otávio Brisa",
      script:
        "Boa noite. Sobre o boato de que o Brasil vai virar comunista: isso não existe. Ninguém vai dividir a sua casa. | Quem disser que [o governo vai dividir a sua casa] está mentindo.",
      msPerWord: 430,
      outcomes: {
        good: {
          effects: { panico: -10, popularidade: 10, caos: -5 },
          result: [
            "Sinal cortado no segundo exato.",
            "Só sobrou “ninguém vai dividir a sua casa”.",
            "Virou frase de para-choque de caminhão. E de faixa de casamento.",
          ],
          reactions: { brisa: "comemora", lula: "comemora", voce: "comemora" },
        },
        mid: {
          effects: { panico: 5, caos: 10 },
          result: [
            "Você cortou cedo, no meio de uma frase.",
            "O país inteiro quer saber o que vinha depois. Três teorias antes da novela.",
            "A mais votada: “vão dividir a sua geladeira”.",
          ],
          reactions: { brisa: "susto", lula: "preocupado", voce: "desespero" },
        },
        bad: {
          effects: { panico: 15, popularidade: -10, caos: 15 },
          result: [
            "O corte sai: “o governo vai dividir a sua casa”.",
            "Em 20 minutos, Tio Osvaldo instalou uma catraca na geladeira.",
            "Tia Nilza dividiu o sofá com fita crepe. Ficou com a parte do controle.",
          ],
          reactions: { brisa: "desespero", lula: "desespero", voce: "desespero" },
        },
      },
    },

    // 4 ─ influenciador vende proteção (escolha contra o relógio)
    {
      id: "china",
      mode: "choice",
      kind: "live",
      channel: "🔴 AO VIVO · Coach Rubens Muralha",
      meta: "38 mil assistindo · 2,1 mi corações",
      time: "22:40",
      cast: [
        { id: "rubens", mood: "deboche" },
        { id: "vibes", mood: "neutro" },
        { id: "voce", mood: "preocupado" },
      ],
      lines: [
        { tone: "fiction", text: "Boato da noite (inventado): “o país será entregue à China”." },
        { from: "Rubens Muralha", text: "Já reparou que tudo na sua casa é feito na China? Não é coincidência. É ensaio." },
        {
          from: "Rubens Muralha",
          text: "Por isso: ADESIVO “PRODUTO NACIONAL” para colar em tudo. Pacote com 50. Fabricado em… isso não vem ao caso.",
        },
        { tone: "comment", from: "@zecarlos_raiz", text: "chegou o adesivo, atrás tá escrito made in china" },
        { tone: "comment", from: "@rubensmuralha", text: "isso PROVA que eles já infiltraram o adesivo, Zé" },
        { tone: "msg", from: "@CompanheiraVibes (story)", text: "Contra a paranoia: KIT CALMA 🌿 com chá importado de… gente, não importa. Cupom TRANQUILIDADE10" },
        { tone: "dm", from: "Jéssica Ventania", text: "Os dois lucrando com o mesmo boato. Decide rápido." },
      ],
      variants: [
        {
          meter: "caos",
          min: 45,
          lines: [{ tone: "system", text: "Adesivos: esgotados. Kit Calma: esgotado. Estoque de calma no país: —" }],
        },
      ],
      prompt: "Decida antes que a live termine (e comece outra)",
      timer: 18,
      timeout: {
        effects: { panico: 10, caos: 10 },
        result: ["Você demorou.", "A live acabou e começou outra, mais longa.", "Agora são duas lives e um podcast sobre as lives."],
        reactions: { rubens: "comemora", vibes: "comemora", voce: "desespero" },
      },
      choices: [
        {
          id: "denunciar",
          label: "Denunciar o adesivo",
          effects: { panico: 10, caos: 10 },
          result: [
            "A denúncia viralizou. As vendas subiram 900%.",
            "Rubens agradece “ao governo pela divulgação”.",
            "Lança o Adesivo Pro: agora com adesivo no adesivo.",
          ],
          reactions: { rubens: "comemora", vibes: "deboche", voce: "desespero" },
        },
        {
          id: "contratar",
          label: "Contratar a @CompanheiraVibes para a campanha oficial",
          effects: { panico: -5, popularidade: 5, caos: 10 },
          result: [
            "O Kit Calma ganha selo do ministério.",
            "Rubens grava: “O governo está vendendo calma importada. Desconfie.”",
            "Ele vende desconfiança nacional a R$ 97.",
          ],
          reactions: { vibes: "comemora", rubens: "deboche", voce: "preocupado" },
        },
        {
          id: "comprar",
          label: "Comprar o adesivo. Só por precaução.",
          effects: { panico: 15, popularidade: -5, caos: 5 },
          result: [
            "Você cola “produto nacional” no celular, no micro-ondas e no ventilador.",
            "Num momento de fraqueza, cola no próprio crachá.",
            "A segurança do ministério não te reconhece mais.",
          ],
          reactions: { rubens: "comemora", vibes: "susto", voce: "desespero" },
        },
      ],
    },

    // 5 ─ arrastar o meme para a lixeira (ele se multiplica)
    {
      id: "sexto-ano",
      mode: "drag",
      kind: "feed",
      channel: "Em alta agora",
      meta: "Um meme, muitas versões",
      time: "08:30",
      cast: [
        { id: "kelly", mood: "deboche" },
        { id: "nilza", mood: "susto" },
        { id: "voce", mood: "preocupado" },
      ],
      lines: [
        { tone: "meme", from: "@alerta.familia.br", text: "URGENTE: ESCOLAS VÃO OBRIGAR CRIANÇAS A TROCAR DE SEXO" },
        { tone: "fiction", text: "Boato inventado para este jogo. Veja abaixo de onde ele saiu." },
        { from: "Prima Kelly", text: "gente. o bilhete original da escola diz: “alunos do SEXTO ANO vão TROCAR DE SALA”" },
        { from: "Prima Kelly", text: "alguém leu rápido demais e com muita vontade" },
        { from: "Tia Nilza", text: "mas e se trocarem de sala E de sexto?" },
        { tone: "dm", from: "Jéssica Ventania", text: "Joga isso fora. Cuidado: cada vez que alguém apaga, aparece um print do print." },
      ],
      prompt: "Arraste o boato até a lixeira antes que ele se espalhe",
      duration: 15,
      rumor: { from: "@alerta.familia.br", text: "Escolas vão obrigar crianças a trocar de sexo" },
      copies: [
        "PRINT DO PRINT (agora em vermelho)",
        "versão com narração dramática",
        "versão em vídeo com música de suspense",
        "versão traduzida para o espanhol e de volta",
        "versão com uma foto aleatória de sala de aula",
      ],
      outcomes: {
        good: {
          effects: { panico: -10, popularidade: 10, caos: -10 },
          result: [
            "Timeline limpa.",
            "Na escola, o sexto ano trocou de sala. A sala nova tem ar-condicionado.",
            "Os pais fazem abaixo-assinado para todo mundo trocar de sala.",
          ],
          reactions: { kelly: "comemora", nilza: "preocupado", voce: "comemora" },
        },
        mid: {
          effects: { panico: 5, caos: 5 },
          result: [
            "Sobraram alguns prints.",
            "Tia Nilza imprimiu um e colou na geladeira, ao lado da catraca.",
            "A escola manda outro bilhete. Agora em letra maior. Ninguém lê.",
          ],
          reactions: { kelly: "preocupado", nilza: "deboche", voce: "preocupado" },
        },
        bad: {
          effects: { panico: 15, popularidade: -5, caos: 15 },
          result: [
            "Os prints venceram.",
            "Hoje à noite, o bilhete da escola vai dar coletiva própria.",
            "A professora do sexto ano trocou de número. E de sala, por via das dúvidas.",
          ],
          reactions: { kelly: "desespero", nilza: "susto", voce: "desespero" },
        },
      },
    },

    // 6 ─ coletiva: escolher qual crise atender primeiro
    {
      id: "coletiva",
      mode: "choice",
      layout: "cards",
      kind: "press",
      channel: "Coletiva de Imprensa",
      meta: "Ministério da Tranquilidade Pública",
      time: "10:05",
      cast: [
        { id: "wellington", mood: "preocupado" },
        { id: "brisa", mood: "susto" },
        { id: "jessica", mood: "preocupado" },
        { id: "voce", mood: "susto" },
      ],
      lines: [
        { tone: "aside", text: "O ministro sobe ao púlpito. Três crises explodem ao mesmo tempo. Os assessores cochicham alto demais." },
        { from: "Wellington Ponto", text: "(cochicho) começa pela China" },
        { from: "Jéssica Ventania", text: "(cochicho) não, pelas igrejas. Igreja dá mais engajamento" },
        { from: "Repórter · Jornal da Véspera", text: "Ministro, qual crise o senhor nega primeiro?" },
        { tone: "aside", text: "O ministro olha para você." },
      ],
      prompt: "Escolha qual crise atender primeiro. As outras não vão esperar.",
      timer: 22,
      timeout: {
        effects: { panico: 10, popularidade: -10, caos: 20 },
        result: [
          "Você travou. O ministro, nervoso, negou as três crises.",
          "E uma quarta, que ninguém tinha inventado ainda.",
          "Agora ela existe. Tem até hashtag.",
        ],
        reactions: { brisa: "desespero", wellington: "desespero", jessica: "desespero", voce: "desespero" },
      },
      choices: [
        {
          id: "igrejas",
          label: "IGREJAS: um padre jura que recebeu “ordem de fechamento”. Era a conta de luz.",
          effects: { panico: 5, popularidade: 5, caos: 10 },
          result: [
            "Você mostra a conta de luz ao vivo. Igrejas: resolvido.",
            "Enquanto isso, a crise da China ganhou trilha sonora.",
            "E a da casa dividida virou podcast com três temporadas.",
          ],
          reactions: { brisa: "comemora", jessica: "comemora", wellington: "preocupado", voce: "preocupado" },
        },
        {
          id: "china",
          label: "CHINA: o Cristo Redentor aparece com etiqueta “made in China”. É um chaveiro.",
          effects: { panico: 5, popularidade: -5, caos: 15 },
          result: [
            "Você ergue o chaveiro diante das câmeras.",
            "Manchete: “MINISTÉRIO EXIBE CRISTO CHINÊS EM COLETIVA”.",
            "Resolveu uma crise e fabricou outra, em escala industrial.",
          ],
          reactions: { brisa: "susto", wellington: "comemora", jessica: "desespero", voce: "susto" },
        },
        {
          id: "sofa",
          label: "COMUNISMO: um vizinho jura que o governo levou metade do sofá dele. Foi a ex-mulher.",
          effects: { panico: -10, popularidade: 10, caos: 5 },
          result: [
            "Você liga para a ex-mulher ao vivo. Ela confirma: levou o sofá e não se arrepende.",
            "A popularidade sobe. O Brasil inteiro está do lado dela.",
            "O vizinho pede asilo no grupo da família.",
          ],
          reactions: { brisa: "comemora", jessica: "deboche", wellington: "comemora", voce: "comemora" },
        },
      ],
    },

    // 7 ─ silêncio em casa (escolha sem relógio; o celular cobra)
    {
      id: "silencio",
      mode: "choice",
      kind: "home",
      channel: "Sala de estar",
      meta: "Celular virado para baixo",
      time: "23:47",
      cast: [{ id: "voce", mood: "preocupado" }],
      lines: [
        { tone: "aside", text: "Você chega em casa. Silencia tudo. Vira o celular para baixo." },
        { tone: "aside", text: "A casa fica quieta. A geladeira zune. É bom." },
        { tone: "aside", text: "Então a TV liga. Ou você ligou e esqueceu. Você não lembra." },
        { tone: "headline", from: "Jornal da Véspera", text: "Governo nega que vá fechar as igrejas" },
        { tone: "headline", from: "Jornal da Véspera", text: "Governo nega que vá fechar as igrejas" },
        { tone: "headline", from: "Jornal da Véspera", text: "Governo nega que vá fechar as igrejas" },
        { tone: "aside", text: "A cada repetição, a palavra “nega” parece mais baixa." },
      ],
      variants: [
        {
          meter: "panico",
          min: 50,
          lines: [
            { tone: "headline", from: "Jornal da Véspera", text: "Governo        vá fechar as igrejas" },
            { tone: "aside", text: "Dessa vez não teve “nega”. Ou teve?" },
          ],
        },
      ],
      prompt: "O que você faz?",
      choices: [
        {
          id: "desligar-tv",
          label: "Desligar a TV",
          effects: { panico: 5 },
          ignore: true,
          result: [
            "A TV desliga.",
            "O celular, virado para baixo, ilumina a mesa.",
            "47 notificações. Todas com a mesma prévia: “Você viu isso?”",
          ],
          reactions: { voce: "susto" },
        },
        {
          id: "volume",
          label: "Aumentar o volume para ouvir direito",
          effects: { panico: 15, caos: 5 },
          result: [
            "No volume máximo, você ouve o “nega”.",
            "O vizinho, do outro lado da parede, ouve só “fechar as igrejas”.",
            "Ele já mandou no grupo do prédio. Com o áudio da sua TV como prova.",
          ],
          reactions: { voce: "desespero" },
        },
        {
          id: "imovel",
          label: "Ficar imóvel até a TV parar sozinha",
          effects: { panico: 10 },
          ignore: true,
          result: ["Ela não para.", "Às 3h12, entra a previsão do tempo.", "Previsão: 80% de chance de boato, com pancadas de desmentido."],
          reactions: { voce: "preocupado" },
        },
      ],
    },

    // 8 ─ a ligação das 3h33
    {
      id: "ligacao",
      mode: "choice",
      kind: "call",
      channel: "Chamada recebida",
      meta: "Celular",
      time: "03:33",
      cast: [{ id: "voce", mood: "susto" }],
      lines: [
        { tone: "aside", text: "O celular toca. O número na tela é o seu." },
        { tone: "system", text: "Chamada de: VOCÊ" },
      ],
      variants: [
        {
          meter: "panico",
          min: 45,
          lines: [{ tone: "aside", text: "Por baixo do toque, baixinho: “você viu isso? você viu isso?”" }],
        },
      ],
      prompt: "Atende?",
      timer: 12,
      timeout: {
        effects: { panico: 5 },
        ignore: true,
        result: ["O celular para de tocar.", "Começa a tocar o micro-ondas.", "O número no visor também é o seu."],
        reactions: { voce: "desespero" },
      },
      choices: [
        {
          id: "atender",
          label: "Atender",
          effects: { panico: 10, caos: 5 },
          result: [
            "Uma voz igual à sua lê, sem pausa, todas as mensagens que você ignorou hoje.",
            "No final, pergunta: “Encaminhar para todos?”",
            "Você não lembra de ter respondido. O celular lembra.",
          ],
          reactions: { voce: "desespero" },
        },
        {
          id: "recusar",
          label: "Recusar",
          effects: { panico: 5 },
          ignore: true,
          result: [
            "A chamada vira mensagem de voz.",
            "A mensagem de voz vira áudio no grupo da família.",
            "Tia Nilza: “áudio estranho, vou repassar”.",
          ],
          reactions: { voce: "susto" },
        },
        {
          id: "desligar",
          label: "Desligar o celular de vez",
          effects: { panico: -10, caos: 5 },
          ignore: true,
          result: ["Tela preta.", "Pela primeira vez no dia, silêncio de verdade.", "No reflexo da tela preta, uma notificação continua acesa."],
          reactions: { voce: "preocupado" },
        },
      ],
    },
  ],
  notifications: [
    { app: "Família Reunida 🇧🇷❤️", text: "Tio Osvaldo: olha isso aqui" },
    { app: "Jéssica Ventania", text: "CADÊ VOCÊ" },
    { app: "@verdadeoculta_br", text: "PADRE VISTO COM MALA (era marmita)" },
    { app: "Rubens Muralha", text: "está ao vivo: “eles vêm pela sua geladeira”" },
    { app: "@CompanheiraVibes", text: "últimas unidades do Kit Calma 🌿" },
    { app: "Família Reunida 🇧🇷❤️", text: "Tia Nilza encaminhou uma mensagem (47x)" },
    { app: "Grupo do Prédio", text: "alguém sabe se o salão de festas vai virar cooperativa?" },
    { app: "Jornal da Véspera", text: "Governo nega. Oposição nega que governo negue." },
    { app: "Wellington Ponto", text: "negar de novo ou não negar?" },
    { app: "Número desconhecido", text: "Você viu isso?" },
  ],
  ticker: [
    "Jornal da Véspera: Governo nega fechamento de igrejas",
    "Portal Alerta Total: Governo não nega o suficiente",
    "Rádio Fim de Tarde: Venda de catracas para geladeira sobe 300%",
    "Portal Alerta Total: Cristo Redentor estaria “olhando para o Oriente”; Cristo não comenta",
    "Jornal da Véspera: Especialistas pedem calma; calma esgota",
    "Instituto Termômetro: 50% têm medo; os outros 50% têm medo dos 50%",
  ],
  chaosTicker: [
    "Portal Alerta Total: Igrejas lotadas provam que vão fechar, dizem fiéis lotando igrejas",
    "Jornal da Véspera: Ministério lança nota negando nota anterior",
    "Rádio Fim de Tarde: Sofá dividido ao meio vira símbolo nacional; os dois lados reivindicam a metade com almofada",
  ],
  endings: {
    calma: {
      title: "Calma Oficial",
      lines: [
        "Decreto publicado: o país está oficialmente calmo.",
        "As igrejas seguem abertas e lotadas de gente conferindo se estão abertas.",
        "Tia Nilza devolve as cadeiras de plástico. Fica com duas, “por precaução”.",
        "Instituto Termômetro: 87% se dizem calmos. 91% dizem que os outros não estão.",
      ],
      kicker: "Notificações não lidas: subindo.",
      cast: [
        { id: "lula", mood: "comemora" },
        { id: "brisa", mood: "comemora" },
        { id: "voce", mood: "preocupado" },
        { id: "nilza", mood: "deboche" },
      ],
    },
    comissao: {
      title: "A Comissão da Comissão",
      lines: [
        "O governo vence a crise.",
        "Para que nunca se repita, cria a Comissão Especial de Investigação do Boato das Igrejas.",
        "A oposição pede uma comissão para investigar quem criou a comissão.",
        "Aprovada por unanimidade. A primeira sessão é numa igreja, para provar que ela está aberta.",
      ],
      kicker: "Próxima reunião: indefinidamente.",
      cast: [
        { id: "brisa", mood: "deboche" },
        { id: "wellington", mood: "comemora" },
        { id: "rubens", mood: "comemora" },
        { id: "voce", mood: "desespero" },
      ],
    },
    transmite: {
      title: "Tudo Transmite",
      lines: [
        "Você desliga o celular.",
        "A TV liga sozinha: “Você viu isso?”",
        "O rádio do vizinho: “Você viu isso?”",
        "A catraca da geladeira do Tio Osvaldo apita três vezes. No visor: VIU?",
        "O relógio da cozinha marca 3:33 há três dias.",
      ],
      kicker: "Desligar não é uma opção. É um conteúdo.",
      cast: [
        { id: "voce", mood: "desespero" },
        { id: "osvaldo", mood: "susto" },
        { id: "didi", mood: "susto" },
      ],
    },
    silencio: {
      title: "Saiu do Grupo",
      lines: [
        "Você sai do grupo “Família Reunida 🇧🇷❤️”.",
        "Tia Nilza cria “Família Reunida 2 🇧🇷❤️ (só quem tem fé)”.",
        "Você é adicionado(a) automaticamente.",
        "Descrição do grupo: “aqui a gente fala a verdade que escondem de você”.",
      ],
      kicker: "Você agora está em 238 grupos.",
      cast: [
        { id: "nilza", mood: "deboche" },
        { id: "osvaldo", mood: "comemora" },
        { id: "voce", mood: "susto" },
      ],
    },
    outro: {
      title: "O Outro Brasil",
      lines: [
        "Exausto(a), você abre um portal do outro Brasil, aquele em que o outro lado venceu.",
        "Lá, o boato é que o país vai ser entregue aos Estados Unidos.",
        "O grupo da família é o mesmo. A tia é a mesma. O medo é o mesmo.",
        "Só muda a cor do alerta.",
      ],
      kicker: "Outra rota disponível. O medo agradece a visita.",
      cast: [
        { id: "voce", mood: "preocupado" },
        { id: "nilza", mood: "neutro" },
        { id: "kelly", mood: "deboche" },
      ],
    },
  },
};
