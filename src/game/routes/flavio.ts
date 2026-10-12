import type { RouteDef } from "../types";

/**
 * Rota B — Brasil hipotético em que Flávio Bolsonaro venceu.
 * O Presidente é uma caricatura hipotética: aparece em cena e reage, mas não tem falas.
 * Estrutura espelhada da rota A (mesmos minijogos, mesmo peso nos indicadores),
 * com boatos, personagens e piadas próprios.
 */
export const flavio: RouteDef = {
  id: "flavio",
  name: "Brasil: Governo Flávio",
  tagline: "O país “entregue aos EUA”, o voto feminino “ameaçado”, a Petrobras “vendida aos árabes”. Nada disso é verdade. Tente explicar isso.",
  ministry: "Ministério da Ordem Comunicacional",
  rumors: [
    "“O Brasil será entregue aos Estados Unidos.”",
    "“As mulheres perderão o direito ao voto.”",
    "“A Petrobras foi vendida para os árabes.”",
  ],
  intro: [
    "Brasil hipotético. Flávio venceu. O país acordou dividido em dois grupos de WhatsApp.",
    "Você é assessor(a) de comunicação do Ministério da Ordem Comunicacional. É o seu primeiro dia.",
    "Sua missão: impedir que três boatos absurdos virem o fim do mundo.",
    "O fim do mundo já tem 4 mil encaminhamentos.",
  ],
  cast: ["voce", "flavio", "fortaleza", "kaique", "wanderley", "livia", "patriota", "nilza", "osvaldo", "kelly", "didi"],
  roles: { player: "voce", boss: "kaique", president: "flavio" },
  rounds: [
    // 1 ─ o boato nasce no grupo da família (escolha contra o relógio)
    {
      id: "eua",
      mode: "choice",
      kind: "chat",
      channel: "Família Reunida 🇧🇷❤️",
      meta: "237 membros · Tia Nilza está digitando…",
      time: "06:12",
      cast: [
        { id: "nilza", mood: "susto" },
        { id: "osvaldo", mood: "preocupado" },
        { id: "kelly", mood: "deboche" },
        { id: "didi", mood: "neutro" },
      ],
      lines: [
        { tone: "system", text: "Hoje" },
        {
          tone: "forward",
          from: "Tia Nilza",
          text: "URGENTE!!! O BRASIL VAI SER ENTREGUE AOS ESTADOS UNIDOS. A partir de segunda o real vira dólar e o almoço vira BRUNCH. REPASSEM",
        },
        { tone: "fiction", text: "Boato inventado para este jogo. No grupo, ninguém leu este aviso." },
        { from: "Prima Kelly", text: "brunch??" },
        { from: "Tia Nilza", text: "café da manhã atrasado com preço de jantar. é assim que começa" },
        { from: "Tio Osvaldo", text: "já escondi o feijão no armário de cima" },
        { from: "Vô Didi", text: "eu não vou aprender a dizer brunch nessa idade" },
        { from: "Prima Kelly", text: "vô, o senhor acabou de dizer" },
        { tone: "dm", from: "Kaique Trincheira", text: "4 mil encaminhamentos. Responde esse grupo AGORA. Você tem 20 segundos." },
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
        reactions: { kelly: "desespero", nilza: "comemora", osvaldo: "deboche" },
      },
      choices: [
        {
          id: "foto",
          label: "Mandar a foto do almoço do ministério: arroz, feijão e farofa",
          effects: { panico: 5, popularidade: 5, caos: 10 },
          result: [
            "Tia Nilza dá zoom na foto: tem um ketchup no canto da mesa.",
            "“COMEÇOU.”",
            "A farofa vira símbolo de resistência. Esgota em três estados.",
          ],
          reactions: { nilza: "susto", osvaldo: "comemora", kelly: "deboche", didi: "comemora" },
        },
        {
          id: "audio",
          label: "Mandar um áudio de 7 minutos explicando tudo",
          effects: { panico: 10, popularidade: -5, caos: 10 },
          result: [
            "Ninguém ouviu o áudio.",
            "Vô Didi ouviu no viva-voz, num restaurante por quilo.",
            "O restaurante inteiro ouviu a palavra “brunch”, largou o prato e pediu a conta.",
          ],
          reactions: { didi: "susto", nilza: "comemora", osvaldo: "desespero", kelly: "deboche" },
        },
        {
          id: "silenciar",
          label: "Silenciar o grupo por 8 horas",
          effects: { panico: -5, caos: 5 },
          ignore: true,
          result: ["Silêncio.", "Por 9 segundos."],
          reactions: { osvaldo: "preocupado", nilza: "deboche" },
          aftershock: { from: "Tio Osvaldo", text: "Silenciou o grupo? Típico de quem já fala inglês." },
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
        { id: "kaique", mood: "preocupado" },
      ],
      lines: [
        { tone: "dm", from: "Kaique Trincheira", text: "O boato do brunch vazou do grupo. Silencia o que puder antes que cubra o seu celular." },
      ],
      prompt: "Toque nas notificações antes que elas cubram a tela",
      duration: 14,
      spawnEvery: 1300,
      maxOnScreen: 6,
      items: [
        { from: "@patriota.acordado", text: "vão trocar o Carnaval pelo Halloween. fantasia de pirata vai ser obrigatória? (já tenho)" },
        { from: "Tio Osvaldo", text: "comprei 9 kg de feijão por precaução. onde guarda 9 kg de feijão" },
        { from: "Grupo do Condomínio", text: "a piscina vai ter salva-vidas americano? alguém sabe nadar em inglês?" },
        { from: "@resistencia.diaria", text: "BRUNCH OBRIGATÓRIO É SÓ O COMEÇO. depois vem o gramado na frente de casa" },
        { from: "Rádio Fim de Tarde", text: "Brasileiros correm para trocar dólar por real antes que o real acabe; real nunca valeu tanto" },
        { from: "Professora Lívia Resistência", text: "Curso “Como Resistir ao Brunch”. 12x" },
        { from: "Vô Didi", text: "fui na padaria pedir pão na chapa e a moça disse ok. OK. já começou" },
        { from: "@tiozao.alerta", text: "bandeira americana vista em Brasília (era uma toalha de praia)" },
      ],
      outcomes: {
        good: {
          effects: { panico: -10, popularidade: 5, caos: -5 },
          result: [
            "Você silenciou a avalanche. O celular respira.",
            "As padarias batem recorde de pão na chapa: todo mundo quis provar que ainda pode.",
            "Ninguém comeu. Todos tiraram foto do pão.",
          ],
          reactions: { voce: "comemora", kaique: "comemora" },
        },
        mid: {
          effects: { panico: 5, caos: 5 },
          result: [
            "Algumas escaparam.",
            "Uma delas chegou ao grupo da academia, que trocou o supino por “exercícios nacionais”.",
            "Ninguém sabe quais são.",
          ],
          reactions: { voce: "preocupado", kaique: "preocupado" },
        },
        bad: {
          effects: { panico: 15, popularidade: -5, caos: 10 },
          result: [
            "As notificações cobriram a tela.",
            "Uma delas era sua mãe perguntando se você está bem. Você não viu.",
            "Ela encaminhou a pergunta para 237 pessoas.",
          ],
          reactions: { voce: "desespero", kaique: "desespero" },
        },
      },
    },

    // 3 ─ pronunciamento: cortar o sinal antes do trecho recortável
    {
      id: "voto",
      mode: "interrupt",
      kind: "speech",
      channel: "Rede Nacional",
      meta: "Pronunciamento do Ministro da Ordem Comunicacional",
      time: "21:00",
      cast: [
        { id: "fortaleza", mood: "preocupado" },
        { id: "flavio", mood: "neutro" },
        { id: "voce", mood: "preocupado" },
      ],
      lines: [
        { tone: "aside", text: "Novo boato do dia: “as mulheres vão perder o direito ao voto”." },
        { tone: "fiction", text: "Boato inventado para este jogo." },
        { tone: "aside", text: "O ministro Heitor Fortaleza vai ao ar para desmentir. O Presidente, caricato e mudo, assiste do fundo." },
        { tone: "dm", from: "Kaique Trincheira", text: "Tem uma frase nesse texto que vira corte em 4 segundos. Você está com o botão de cortar o sinal." },
      ],
      prompt: "Corte a transmissão antes do trecho que dá para tirar de contexto",
      speaker: "Ministro Heitor Fortaleza",
      script:
        "Boa noite. Sobre o boato de que as mulheres vão perder o voto: isso é absurdo. Ninguém vai mexer no voto de ninguém. | Quem disser que [o governo vai tirar o voto das mulheres] está mentindo.",
      msPerWord: 430,
      outcomes: {
        good: {
          effects: { panico: -10, popularidade: 10, caos: -5 },
          result: [
            "Sinal cortado no segundo exato.",
            "Só sobrou “isso é absurdo”.",
            "Virou figurinha. Usada para tudo, inclusive contra o próprio ministério.",
          ],
          reactions: { fortaleza: "comemora", flavio: "comemora", voce: "comemora" },
        },
        mid: {
          effects: { panico: 5, caos: 10 },
          result: [
            "Você cortou cedo, no meio de uma frase.",
            "O país inteiro quer saber o que vinha depois. Três teorias antes da novela.",
            "A mais votada: “vão mexer no seu brunch”.",
          ],
          reactions: { fortaleza: "susto", flavio: "preocupado", voce: "desespero" },
        },
        bad: {
          effects: { panico: 15, popularidade: -10, caos: 15 },
          result: [
            "O corte sai: “o governo vai tirar o voto das mulheres”.",
            "Tia Nilza, que vota desde 1974, anuncia que vai votar duas vezes de raiva.",
            "As mulheres da família criam três grupos novos. Nenhum homem foi adicionado.",
          ],
          reactions: { fortaleza: "desespero", flavio: "desespero", voce: "desespero" },
        },
      },
    },

    // 4 ─ influenciadora vende proteção (escolha contra o relógio)
    {
      id: "ingles",
      mode: "choice",
      kind: "live",
      channel: "🔴 AO VIVO · Professora Lívia Resistência",
      meta: "38 mil assistindo · 2,1 mi corações",
      time: "22:40",
      cast: [
        { id: "livia", mood: "deboche" },
        { id: "patriota", mood: "neutro" },
        { id: "voce", mood: "preocupado" },
      ],
      lines: [
        { tone: "fiction", text: "Boato da noite (inventado): “o Brasil será entregue aos Estados Unidos”." },
        { from: "Lívia Resistência", text: "Hoje é o brunch. Amanhã, o Dia de Ação de Graças. Depois, a sua avó falando “awesome”." },
        {
          from: "Lívia Resistência",
          text: "Por isso abri o curso INGLÊS DEFENSIVO: aprenda a NÃO falar inglês. 12x de R$ 49,70. Lição 1: “brunch” se diz “almoço atrasado”.",
        },
        { tone: "comment", from: "@ana.consciente", text: "me inscrevi, mas a aula tá no app em inglês" },
        { tone: "comment", from: "@liviaresistencia", text: "isso PROVA que eles já infiltraram o app, Ana" },
        { tone: "msg", from: "@PatriotaRaiz.Oficial (story)", text: "Contra a histeria: BONÉ SOBERANO 🇧🇷, bordado no exterior com muito amor. Cupom ORDEM10" },
        { tone: "dm", from: "Kaique Trincheira", text: "Os dois lucrando com o mesmo boato. Decide rápido." },
      ],
      variants: [
        {
          meter: "caos",
          min: 45,
          lines: [{ tone: "system", text: "Vagas do curso: esgotadas. Boné Soberano: esgotado. Estoque de calma no país: —" }],
        },
      ],
      prompt: "Decida antes que a live termine (e comece outra)",
      timer: 18,
      timeout: {
        effects: { panico: 10, caos: 10 },
        result: ["Você demorou.", "A live acabou e começou outra, mais longa.", "Agora são duas lives e um podcast sobre as lives."],
        reactions: { livia: "comemora", patriota: "comemora", voce: "desespero" },
      },
      choices: [
        {
          id: "denunciar",
          label: "Denunciar o curso",
          effects: { panico: 10, caos: 10 },
          result: [
            "A denúncia viralizou. As matrículas subiram 900%.",
            "Lívia agradece “ao regime pela divulgação”.",
            "Abre turma avançada: “Como não entender legenda”.",
          ],
          reactions: { livia: "comemora", patriota: "deboche", voce: "desespero" },
        },
        {
          id: "contratar",
          label: "Contratar o @PatriotaRaiz.Oficial para a campanha oficial",
          effects: { panico: -5, popularidade: 5, caos: 10 },
          result: [
            "O Boné Soberano ganha selo do ministério.",
            "Lívia grava: “O governo vende boné bordado lá fora. Desconfie.”",
            "Ela vende desconfiança nacional a R$ 97.",
          ],
          reactions: { patriota: "comemora", livia: "deboche", voce: "preocupado" },
        },
        {
          id: "comprar",
          label: "Fazer o curso. Só por precaução.",
          effects: { panico: 15, popularidade: -5, caos: 5 },
          result: [
            "Primeira prova: pedir um hambúrguer sem dizer nenhuma palavra estrangeira.",
            "Você sai da lanchonete com um “pão com carne redondo” e uma crise de identidade.",
            "A segurança do ministério não te reconhece mais.",
          ],
          reactions: { livia: "comemora", patriota: "susto", voce: "desespero" },
        },
      ],
    },

    // 5 ─ arrastar o meme para a lixeira (ele se multiplica)
    {
      id: "petrobras",
      mode: "drag",
      kind: "feed",
      channel: "Em alta agora",
      meta: "Um meme, muitas versões",
      time: "08:30",
      cast: [
        { id: "kelly", mood: "deboche" },
        { id: "osvaldo", mood: "susto" },
        { id: "voce", mood: "preocupado" },
      ],
      lines: [
        { tone: "meme", from: "@alerta.patria.br", text: "URGENTE: A PETROBRAS FOI VENDIDA PARA OS ÁRABES" },
        { tone: "fiction", text: "Boato inventado para este jogo. Veja abaixo de onde ele saiu." },
        { from: "Prima Kelly", text: "gente. a foto original é de um posto que abriu uma lanchonete. a placa diz “PETRO-ESFIHA”" },
        { from: "Prima Kelly", text: "alguém viu a placa de longe e com muita vontade" },
        { from: "Tio Osvaldo", text: "e quem garante que a esfiha não é estatal?" },
        { tone: "dm", from: "Kaique Trincheira", text: "Joga isso fora. Cuidado: cada vez que alguém apaga, aparece um print do print." },
      ],
      prompt: "Arraste o boato até a lixeira antes que ele se espalhe",
      duration: 15,
      rumor: { from: "@alerta.patria.br", text: "A Petrobras foi vendida para os árabes" },
      copies: [
        "PRINT DO PRINT (agora em vermelho)",
        "versão com narração dramática",
        "versão em vídeo com música de suspense",
        "versão com mapa e setas que não apontam para nada",
        "versão com foto de uma esfiha suspeita",
      ],
      outcomes: {
        good: {
          effects: { panico: -10, popularidade: 10, caos: -10 },
          result: [
            "Timeline limpa.",
            "O posto vende 3 mil esfihas no fim de semana.",
            "O dono manda um combo de agradecimento ao ministério. Ninguém come: pode ser prova.",
          ],
          reactions: { kelly: "comemora", osvaldo: "preocupado", voce: "comemora" },
        },
        mid: {
          effects: { panico: 5, caos: 5 },
          result: [
            "Sobraram alguns prints.",
            "Tio Osvaldo imprimiu um e colou no tanque do carro.",
            "Agora ele só abastece “em postos de confiança”: o do cunhado, que fechou em 2019.",
          ],
          reactions: { kelly: "preocupado", osvaldo: "deboche", voce: "preocupado" },
        },
        bad: {
          effects: { panico: 15, popularidade: -5, caos: 15 },
          result: [
            "Os prints venceram.",
            "Hoje à noite, a esfiha vai dar coletiva própria.",
            "O dono do posto trocou a placa para “POSTO 100% NACIONAL”. Agora dizem que ele está escondendo algo.",
          ],
          reactions: { kelly: "desespero", osvaldo: "susto", voce: "desespero" },
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
      meta: "Ministério da Ordem Comunicacional",
      time: "10:05",
      cast: [
        { id: "wanderley", mood: "preocupado" },
        { id: "fortaleza", mood: "susto" },
        { id: "kaique", mood: "preocupado" },
        { id: "voce", mood: "susto" },
      ],
      lines: [
        { tone: "aside", text: "O ministro sobe ao púlpito. Três crises explodem ao mesmo tempo. Os assessores cochicham alto demais." },
        { from: "Wanderley Coturno", text: "(cochicho) começa pela Petrobras" },
        { from: "Kaique Trincheira", text: "(cochicho) não, pelo voto. Voto dá mais engajamento" },
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
        reactions: { fortaleza: "desespero", wanderley: "desespero", kaique: "desespero", voce: "desespero" },
      },
      choices: [
        {
          id: "voto",
          label: "VOTO: foto de uma porta “SÓ HOMENS” numa seção eleitoral. É o banheiro.",
          effects: { panico: 5, popularidade: 5, caos: 10 },
          result: [
            "Você mostra ao vivo a porta do lado: “MULHERES”. Voto: resolvido.",
            "Enquanto isso, a crise do brunch ganhou trilha sonora.",
            "E a da Petrobras virou podcast com três temporadas.",
          ],
          reactions: { fortaleza: "comemora", kaique: "comemora", wanderley: "preocupado", voce: "preocupado" },
        },
        {
          id: "eua",
          label: "EUA: bandeira americana hasteada numa escola. É a festa junina da escola bilíngue.",
          effects: { panico: 5, popularidade: -5, caos: 15 },
          result: [
            "Você entra ao vivo na festa junina.",
            "A quadrilha grita “anarriê, please”. Manchete: “MINISTÉRIO DANÇA COM OS AMERICANOS”.",
            "Resolveu uma crise e fabricou outra, com sanfona.",
          ],
          reactions: { fortaleza: "susto", wanderley: "comemora", kaique: "desespero", voce: "susto" },
        },
        {
          id: "sheik",
          label: "PETROBRAS: um “sheik” foi visto abastecendo no Rio. É fantasia de bloco de carnaval.",
          effects: { panico: -10, popularidade: 10, caos: 5 },
          result: [
            "Você liga para o folião ao vivo. Ele confirma: a fantasia é de 2023 e ainda serve.",
            "A popularidade sobe. O Brasil inteiro quer a fantasia.",
            "O folião ganha 2 milhões de seguidores e anuncia candidatura.",
          ],
          reactions: { fortaleza: "comemora", kaique: "deboche", wanderley: "comemora", voce: "comemora" },
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
        { tone: "headline", from: "Jornal da Véspera", text: "Governo garante que o Brasil não será entregue aos EUA" },
        { tone: "headline", from: "Jornal da Véspera", text: "Governo garante que o Brasil não será entregue aos EUA" },
        { tone: "headline", from: "Jornal da Véspera", text: "Governo garante que o Brasil não será entregue aos EUA" },
        { tone: "aside", text: "A cada repetição, o “não” parece mais baixo." },
      ],
      variants: [
        {
          meter: "panico",
          min: 50,
          lines: [
            { tone: "headline", from: "Jornal da Véspera", text: "Governo garante que o Brasil      será entregue aos EUA" },
            { tone: "aside", text: "Dessa vez não teve “não”. Ou teve?" },
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
            "No volume máximo, você ouve o “não”.",
            "A vizinha, do outro lado da parede, ouve só “entregue aos EUA”.",
            "Ela já mandou no grupo do condomínio. Com o áudio da sua TV como prova.",
          ],
          reactions: { voce: "desespero" },
        },
        {
          id: "imovel",
          label: "Ficar imóvel até a TV parar sozinha",
          effects: { panico: 10 },
          ignore: true,
          result: [
            "Ela não para.",
            "Às 3h12, entra a previsão do tempo.",
            "Previsão: 80% de chance de boato, com rajadas de desmentido vindas do litoral.",
          ],
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
        result: ["O celular para de tocar.", "Começa a tocar a cafeteira.", "O número no visor também é o seu."],
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
            "Tio Osvaldo: “áudio estranho, vou repassar”.",
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
    { app: "Família Reunida 🇧🇷❤️", text: "Tia Nilza: olha isso aqui" },
    { app: "Kaique Trincheira", text: "CADÊ VOCÊ" },
    { app: "@patriota.acordado", text: "PADARIA VENDENDO “DONUT” (era sonho)" },
    { app: "Lívia Resistência", text: "está ao vivo: “eles vêm pelo seu pão na chapa”" },
    { app: "@PatriotaRaiz.Oficial", text: "últimas unidades do Boné Soberano 🇧🇷" },
    { app: "Família Reunida 🇧🇷❤️", text: "Tio Osvaldo encaminhou uma mensagem (47x)" },
    { app: "Grupo do Condomínio", text: "alguém sabe se o churrasco do salão vai virar barbecue?" },
    { app: "Jornal da Véspera", text: "Governo garante. Oposição garante que governo garante demais." },
    { app: "Wanderley Coturno", text: "negar de novo ou não negar?" },
    { app: "Número desconhecido", text: "Você viu isso?" },
  ],
  ticker: [
    "Jornal da Véspera: Governo garante soberania nacional",
    "Portal Resistência Já: Governo garante demais",
    "Rádio Fim de Tarde: Venda de feijão sobe 300%; ninguém sabe onde guardar",
    "Portal Resistência Já: Petro-Esfiha estaria “olhando para o Golfo”; esfiha não comenta",
    "Jornal da Véspera: Especialistas pedem calma; calma esgota",
    "Instituto Termômetro: 50% têm medo; os outros 50% têm medo dos 50%",
  ],
  chaosTicker: [
    "Portal Resistência Já: Restaurantes lotados de gente provando que ainda pode almoçar",
    "Jornal da Véspera: Ministério lança nota negando nota anterior",
    "Rádio Fim de Tarde: Farofa vira símbolo nacional; os dois lados reivindicam a mais crocante",
  ],
  endings: {
    calma: {
      title: "Calma Oficial",
      lines: [
        "Decreto publicado: o país está oficialmente calmo e soberano.",
        "Os restaurantes servem almoço no horário de sempre. Ninguém pede brunch.",
        "Tio Osvaldo desce os 9 kg de feijão do armário. Deixa 2 kg lá em cima, “por precaução”.",
        "Instituto Termômetro: 87% se dizem calmos. 91% dizem que os outros não estão.",
      ],
      kicker: "Notificações não lidas: subindo.",
      cast: [
        { id: "flavio", mood: "comemora" },
        { id: "fortaleza", mood: "comemora" },
        { id: "voce", mood: "preocupado" },
        { id: "osvaldo", mood: "deboche" },
      ],
    },
    comissao: {
      title: "A Comissão da Comissão",
      lines: [
        "O governo vence a crise.",
        "Para que nunca se repita, cria a Comissão Especial de Investigação do Boato do Brunch.",
        "A oposição pede uma comissão para investigar quem criou a comissão.",
        "Aprovada por unanimidade. A primeira sessão começa às 11h e alguém chama de brunch. Crise.",
      ],
      kicker: "Próxima reunião: indefinidamente.",
      cast: [
        { id: "fortaleza", mood: "deboche" },
        { id: "wanderley", mood: "comemora" },
        { id: "livia", mood: "comemora" },
        { id: "voce", mood: "desespero" },
      ],
    },
    transmite: {
      title: "Tudo Transmite",
      lines: [
        "Você desliga o celular.",
        "A TV liga sozinha: “Você viu isso?”",
        "O rádio da vizinha: “Você viu isso?”",
        "A cafeteira goteja em código: V… I… U…",
        "O relógio da cozinha marca 3:33 há três dias.",
      ],
      kicker: "Desligar não é uma opção. É um conteúdo.",
      cast: [
        { id: "voce", mood: "desespero" },
        { id: "nilza", mood: "susto" },
        { id: "didi", mood: "susto" },
      ],
    },
    silencio: {
      title: "Saiu do Grupo",
      lines: [
        "Você sai do grupo “Família Reunida 🇧🇷❤️”.",
        "Tio Osvaldo cria “Família Reunida 2 🇧🇷❤️ (só os de verdade)”.",
        "Você é adicionado(a) automaticamente.",
        "Descrição do grupo: “aqui a gente fala a verdade que escondem de você”.",
      ],
      kicker: "Você agora está em 238 grupos.",
      cast: [
        { id: "osvaldo", mood: "deboche" },
        { id: "nilza", mood: "comemora" },
        { id: "voce", mood: "susto" },
      ],
    },
    outro: {
      title: "O Outro Brasil",
      lines: [
        "Exausto(a), você abre um portal do outro Brasil, aquele em que o outro lado venceu.",
        "Lá, o boato é que fecharam as igrejas.",
        "O grupo da família é o mesmo. O tio é o mesmo. O medo é o mesmo.",
        "Só muda a cor do alerta.",
      ],
      kicker: "Outra rota disponível. O medo agradece a visita.",
      cast: [
        { id: "voce", mood: "preocupado" },
        { id: "osvaldo", mood: "neutro" },
        { id: "kelly", mood: "deboche" },
      ],
    },
  },
};
