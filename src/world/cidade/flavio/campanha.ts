import type { Decisao } from "../definicao";
import type { Campanha, Cond, Efeito, FalaPorEstado, MissaoDef, Regra, SeloDef } from "../missoes/motor";

/**
 * Campanha do Brasil do Flávio: seis missões, em ordem, uma ativa por vez, mais a Eleição no Cofre.
 * Mesmo motor e mesmas convenções da cidade do Lula ("falou:<morador>", "usou:<ponto>", flags com o id
 * da missão, decisões em `d.<missão>`). Os ids de prédios, lugares e moradores são os do Brasil do Flávio.
 *
 * Tudo é ficção satírica: a sátira mira a burocracia, o autoritarismo imaginado e quem vende medo,
 * nunca quem trabalha, quem vota ou quem compra.
 */

const nenhum: Cond = { item: "" };
const com = (item: string): Cond => ({ item });
const tem = (flag: string): Cond => ({ flag });
const vale = (flag: string, igual: string | number | boolean): Cond => ({ flag, igual });
const min = (flag: string, n: number): Cond => ({ flag, min: n });
const nao = (c: Cond): Cond => ({ nao: c });
const no = (lugar: string, estado: string): Cond => ({ lugar, estado });

const nota = (id: string, texto: string): Efeito => ({ nota: id, texto });
const decide = (missao: string, valor: string): Efeito => ({ flag: `d.${missao}`, valor });
/** Avança quando o contador de pistas chega ao mínimo. */
const avancaCom = (contador: string, n: number): Efeito => ({ se: [min(contador, n)], entao: [{ avancar: true }] });

const PATRIOTA = { x: 1680, y: 1780, label: "@PatriotaRaiz.Oficial" };
const DURVAL = { x: 700, y: 2920, label: "Seu Durval, na Fábrica Feliz" };

// ------------------------------------------------------------------ 1 · Chicote Expresso

const brechaZeca: Regra = {
  evento: "falou:fl-zeca",
  faz: [
    { marca: "chicote.brecha" },
    { dialogo: ["A ordem diz “um chicote”. Não diz de quê.", "Tenho de couro, que só serve de enfeite, e de alcaçuz, que a criançada adora. Escolhe com calma, presidente."], quem: "Zeca da Selaria" },
    nota("brecha-chicote", "Zeca: a ordem pede “um chicote”, mas não diz de quê. Tem de alcaçuz."),
  ],
};

const CHICOTE: MissaoDef = {
  id: "chicote",
  numero: 1,
  titulo: "Chicote Expresso",
  local: "Distrito do Chicote",
  inicio: {
    npc: "fl-patriota",
    quem: "@PatriotaRaiz.Oficial, na Praça do Desfile",
    alvo: PATRIOTA,
    dialogo: [
      "@PatriotaRaiz: Viralizou! Na Fábrica Feliz o patrão trata funcionário BEM. Almoço sentado, saída no horário.",
      "O Ministério da Produtividade mandou corrigir: um chicote da Selaria do Zeca, entregue ao Seu Durval, dono da fábrica.",
      "Chicote Expresso, presidente! Confere a fábrica e decide como entregar. Eu vou gravando.",
    ],
  },
  etapas: [
    {
      id: "falar",
      objetivo: "Fale com @PatriotaRaiz.Oficial, na Praça do Desfile.",
      alvo: PATRIOTA,
      regras: [{ evento: "falou:fl-patriota", faz: [{ avancar: true }] }],
    },
    {
      id: "fabrica",
      objetivo: "Confira a Fábrica Feliz: fale com Seu Durval e leia o quadro de metas lá dentro ({chicote.n}/2).",
      alvo: DURVAL,
      alvos: [
        { se: [nao(tem("chicote.durval"))], alvo: DURVAL },
        { se: [nao(tem("chicote.quadro"))], alvo: { predio: "fl-ind-fabrica", label: "Quadro de metas, na Fábrica Feliz" } },
      ],
      lista: [
        { rotulo: "Seu Durval, na porta da fábrica", feito: [tem("chicote.durval")] },
        { rotulo: "Quadro de metas, dentro da fábrica", feito: [tem("chicote.quadro")] },
      ],
      regras: [
        {
          evento: "falou:fl-durval",
          faz: [
            { marca: "chicote.durval", conta: "chicote.n" },
            { dialogo: ["Chicote? Aqui a única coisa que estala é a panela do almoço.", "A meta da fábrica é todo mundo voltar pra casa inteiro. Dizem que agora isso é infração."], quem: "Seu Durval" },
            nota("durval", "Seu Durval: a meta da Fábrica Feliz é todo mundo voltar pra casa inteiro."),
            avancaCom("chicote.n", 2),
          ],
        },
        {
          evento: "usou:quadro-metas",
          faz: [
            { marca: "chicote.quadro", conta: "chicote.n" },
            { ler: "QUADRO DE METAS: sair às 17h. Almoçar sentado. Meta do ano: férias para todo mundo." },
            nota("quadro-metas", "Quadro de metas da Fábrica Feliz: sair às 17h, almoçar sentado, férias para todos."),
            avancaCom("chicote.n", 2),
          ],
        },
      ],
    },
    {
      id: "selaria",
      objetivo: "Busque o chicote na Selaria do Zeca. O Zeca sempre tem um comentário sobre a ordem.",
      alvo: { predio: "fl-ind-selaria", label: "Selaria do Zeca" },
      regras: [
        brechaZeca,
        {
          evento: "usou:pegar-chicote",
          se: [nenhum],
          faz: [{ pegar: "chicote" }, { ler: "Chicote embrulhado em papel pardo, com laço verde e amarelo. Dá para levar de moto." }, nota("chicote", "Peguei o chicote encomendado pelo Ministério."), { avancar: true }],
        },
      ],
    },
    {
      id: "entregar",
      objetivo: "Leve o chicote ao Seu Durval, na porta da Fábrica Feliz, e decida como entregar.",
      alvo: DURVAL,
      exige: [com("chicote")],
      volta: "selaria",
      regras: [
        brechaZeca,
        {
          evento: "usou:entregar-chicote",
          se: [com("chicote")],
          faz: [
            {
              escolha: {
                titulo: "O chicote está na sua mão. Como entregar ao Seu Durval?",
                quem: "Seu Durval",
                opcoes: [
                  {
                    id: "entregar",
                    rotulo: "Cumprir a ordem: entregar o chicote de couro",
                    faz: [decide("chicote", "entregou"), { soltar: true }, { ler: "Seu Durval pendurou o chicote no quadro de metas. Virou ponteiro de reunião, e a reunião não acaba nunca." }, nota("chicote-fim", "Entreguei o chicote de couro, como mandou o Ministério."), { concluir: true }],
                  },
                  {
                    id: "vale",
                    rotulo: "Trocar o chicote por vale-refeição para a turma toda",
                    faz: [decide("chicote", "vale"), { soltar: true }, { ler: "O chicote voltou para a selaria e a turma ganhou vale-refeição. O Ministério ainda procura o recibo." }, nota("chicote-fim", "Troquei o chicote por vale-refeição para a fábrica."), { concluir: true }],
                  },
                  {
                    id: "alcacuz",
                    rotulo: "Cumprir a letra da ordem: um chicote de alcaçuz",
                    se: [tem("chicote.brecha")],
                    faz: [decide("chicote", "alcacuz"), { soltar: true }, { ler: "Chicote entregue, como manda a ordem. É de alcaçuz, e a reunião de metas acabou em lanche." }, nota("chicote-fim", "Entreguei um chicote de alcaçuz: a ordem não dizia de quê."), { concluir: true }],
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
  pontos: [
    { id: "quadro-metas", etapas: ["fabrica"] },
    { id: "pegar-chicote", etapas: ["selaria"], se: [nenhum] },
    { id: "entregar-chicote", etapas: ["entregar"], se: [com("chicote")], fora: { x: 770, y: 2930, label: "Decidir como entregar o chicote" } },
  ],
  conclusao: ["Chicote Expresso entregue. A Fábrica Feliz segue feliz, do jeito que deu.", "@PatriotaRaiz: “Já subi o vídeo. Comenta ORDEM!”"],
  selo: { id: "chicote-expresso", nome: "Chicote Expresso", cor: "#7a3e1d", icone: "🪢" },
};

// ------------------------------------------------------------------ 2 · Dezembro Realocado

/** Relógio de ponto do RH: gira por estas posições; a placa lá fora manda "terça, 3h". */
const RELOGIO = ["SEGUNDA, 9H", "SEXTA, 18H", "TERÇA, 15H", "TERÇA, 3H", "DOMINGO, 0H"];
const RELOGIO_CERTO = 3;

const rosangela = (avanca: boolean): Regra => ({
  evento: "falou:fl-rosangela",
  faz: [
    { marca: "dezembro.rosangela", conta: "dezembro.n" },
    {
      dialogo: [
        "O décimo terceiro sai em dezembro, querido. E dezembro foi realocado para o ano que vem, por produtividade.",
        "O sistema só abre o guichê na terça, às 3h. Quem manda no sistema é o relógio de ponto, e ninguém mexe no relógio. Ninguém costuma, pelo menos.",
      ],
      quem: "Dona Rosângela",
    },
    nota("rosangela", "Dona Rosângela: o guichê do 13º só abre na terça, às 3h, e quem manda é o relógio de ponto."),
    ...(avanca ? [avancaCom("dezembro.n", 2)] : []),
  ],
});

const TONHAO = { x: 1790, y: 2940, label: "Tonhão, na fila do RH" };

const DEZEMBRO: MissaoDef = {
  id: "dezembro",
  numero: 2,
  titulo: "Dezembro Realocado",
  local: "Recursos Humanos, no Distrito do Chicote",
  inicio: {
    npc: "fl-tonhao",
    quem: "Tonhão, na fila do RH",
    alvo: TONHAO,
    dialogo: [
      "Tonhão: Fui buscar o décimo terceiro e me deram um calendário sem dezembro.",
      "A placa do RH manda voltar em dezembro, terça, às 3h. Que dezembro?",
      "Fala com a Dona Rosângela lá dentro. Ela é gente boa, só cumpre o que mandam.",
    ],
  },
  etapas: [
    {
      id: "falar",
      objetivo: "Fale com o Tonhão, na fila do RH.",
      alvo: TONHAO,
      regras: [{ evento: "falou:fl-tonhao", faz: [{ avancar: true }] }],
    },
    {
      id: "rh",
      objetivo: "Entenda o sumiço de dezembro: fale com a Dona Rosângela e leia o calendário oficial, no RH ({dezembro.n}/2).",
      alvo: { predio: "fl-ind-rh", label: "Recursos Humanos" },
      lista: [
        { rotulo: "Dona Rosângela, no RH", feito: [tem("dezembro.rosangela")] },
        { rotulo: "Calendário oficial, na parede do RH", feito: [tem("dezembro.cal")] },
      ],
      regras: [
        rosangela(true),
        {
          evento: "usou:ler-calendario",
          faz: [
            { marca: "dezembro.cal", conta: "dezembro.n" },
            { ler: "CALENDÁRIO OFICIAL: de janeiro a novembro. Novembro tem 61 dias. Dezembro: em análise." },
            nota("calendario", "Calendário oficial: de janeiro a novembro, e novembro tem 61 dias. Dezembro está em análise."),
            avancaCom("dezembro.n", 2),
          ],
        },
      ],
    },
    {
      id: "relogio",
      objetivo: "Acerte o relógio de ponto do RH no dia e na hora que a placa lá fora manda, e bata o ponto.",
      alvo: { predio: "fl-ind-rh", label: "Relógio de ponto do RH" },
      regras: [
        {
          evento: "falou:fl-rosangela",
          faz: [{ dialogo: ["A placa lá fora diz quando o guichê abre. Eu não posso mexer no relógio.", "Você pode, presidente. Você pode tudo, dizem."], quem: "Dona Rosângela" }],
        },
        {
          evento: "usou:girar-relogio",
          faz: [{ cicla: "dezembro.hora", max: RELOGIO.length }, ...RELOGIO.map((h, i): Efeito => ({ se: [vale("dezembro.hora", i)], entao: [{ ler: `Relógio de ponto: ${h}.` }] }))],
        },
        {
          evento: "usou:bater-ponto-rh",
          faz: [
            {
              se: [vale("dezembro.hora", RELOGIO_CERTO)],
              entao: [
                { som: "acerto" },
                { marca: "dezembro.ok" },
                { dialogo: ["Bip! TERÇA, 3H. O sistema acordou assustado e abriu o guichê do décimo terceiro.", "Agora é com você: o que fazemos com o décimo terceiro do Tonhão?"], quem: "Dona Rosângela" },
                nota("relogio", "Relógio de ponto em TERÇA, 3H: o guichê do décimo terceiro abriu."),
                { avancar: true },
              ],
              senao: [{ som: "erro" }, { soma: "dezembro.erros" }, { ler: "Bip! O sistema recusou: “fora do horário do décimo terceiro”. A placa lá fora diz quando." }],
            },
          ],
        },
      ],
    },
    {
      id: "decidir",
      objetivo: "Decida o décimo terceiro no guichê do RH.",
      alvo: { predio: "fl-ind-rh", label: "Guichê do décimo terceiro" },
      exige: [tem("dezembro.ok")],
      volta: "relogio",
      regras: [
        {
          evento: "usou:decidir-dezembro",
          faz: [
            {
              escolha: {
                titulo: "O guichê do décimo terceiro abriu. E dezembro?",
                quem: "Dona Rosângela",
                opcoes: [
                  {
                    id: "aceitar",
                    rotulo: "Aceitar o calendário sem dezembro (o 13º vira gratidão)",
                    faz: [decide("dezembro", "aceitou"), { ler: "Calendário homologado: o ano tem onze meses e o décimo terceiro virou um aperto de mão." }, nota("dezembro-fim", "Aceitei o calendário sem dezembro."), { concluir: true }],
                  },
                  {
                    id: "devolver",
                    rotulo: "Escrever DEZEMBRO à caneta e pagar o 13º",
                    faz: [decide("dezembro", "devolveu"), { ler: "Escrevi DEZEMBRO à caneta na última página. O sistema aceitou: estava escrito." }, nota("dezembro-fim", "Devolvi dezembro ao calendário, à caneta, e o 13º saiu."), { concluir: true }],
                  },
                  {
                    id: "parcelar",
                    rotulo: "Pagar o 13º em doze parcelas de novembro",
                    faz: [decide("dezembro", "parcelou"), { ler: "Décimo terceiro parcelado em doze novembros. O Tonhão recebe todo novembro até 2040." }, nota("dezembro-fim", "Parcelei o 13º em doze novembros."), { concluir: true }],
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
  pontos: [
    { id: "ler-calendario", etapas: ["rh"] },
    { id: "girar-relogio", etapas: ["relogio"] },
    { id: "bater-ponto-rh", etapas: ["relogio"] },
    { id: "decidir-dezembro", etapas: ["decidir"] },
  ],
  conclusao: ["Dezembro resolvido: o RH já trocou o calendário da parede.", "Tonhão: “Terça, 3h. Nunca mais esqueço.”"],
  selo: { id: "dezembro-realocado", nome: "Dezembro Realocado", cor: "#b5452b", icone: "📅" },
};

// ------------------------------------------------------------------ 3 · SUS com Catraca

const RECEPCIONISTA = "int-fl-com-posto-recepcionista";
const ZULEICA = { x: 2620, y: 1690, label: "Vó Zuleica, na porta do posto" };

const CATRACA: MissaoDef = {
  id: "catraca",
  numero: 3,
  titulo: "SUS com Catraca",
  local: "Posto de Saúde Premium, no Livre Mercado",
  inicio: {
    npc: "fl-zuleica",
    quem: "Vó Zuleica, na porta do posto",
    alvo: ZULEICA,
    dialogo: [
      "Vó Zuleica: Vim medir a pressão e a catraca do posto me pediu cinco reais. Para entrar!",
      "Lá dentro tem fila comum, fila VIP e um camarote com um pombo. O pombo entrou de graça.",
      "Presidente, descobre como funciona essa catraca. Eu espero sentada. Na fila comum, claro.",
    ],
  },
  etapas: [
    {
      id: "falar",
      objetivo: "Fale com a Vó Zuleica, na porta do posto.",
      alvo: ZULEICA,
      regras: [{ evento: "falou:fl-zuleica", faz: [{ avancar: true }] }],
    },
    {
      id: "investigar",
      objetivo: "Descubra as regras do posto: fale com a Recepcionista Premium e leia o regulamento, no consultório ({catraca.n}/2).",
      alvo: { predio: "fl-com-posto", label: "Posto de Saúde Premium" },
      lista: [
        { rotulo: "Recepcionista Premium, no guichê VIP", feito: [tem("catraca.recepcao")] },
        { rotulo: "Regulamento do posto, no consultório", feito: [tem("catraca.regulamento")] },
      ],
      regras: [
        {
          evento: `falou:${RECEPCIONISTA}`,
          faz: [
            { marca: "catraca.recepcao", conta: "catraca.n" },
            { dialogo: ["A catraca cobra de todo mundo, menos do pombo. O pombo é sócio-fundador.", "Tem uma alavanca no fundo que desliga a cobrança. Mexer nela é com quem manda, e quem manda é o senhor."], quem: "Recepcionista Premium" },
            nota("recepcao", "Recepcionista Premium: a alavanca do fundo desliga a cobrança da catraca."),
            avancaCom("catraca.n", 2),
          ],
        },
        {
          evento: "usou:ler-regulamento",
          faz: [
            { marca: "catraca.regulamento", conta: "catraca.n" },
            { ler: "REGULAMENTO DO POSTO, ART. 2º: idoso não paga a catraca. Parágrafo único: o artigo 2º fica no fundo da gaveta." },
            nota("regulamento", "Regulamento do posto, art. 2º: idoso não paga a catraca (só que ninguém abre a gaveta)."),
            avancaCom("catraca.n", 2),
          ],
        },
      ],
    },
    {
      id: "decidir",
      objetivo: "Decida o que fazer com a catraca, na recepção do posto.",
      alvo: { predio: "fl-com-posto", label: "Catraca do posto" },
      regras: [
        {
          evento: "usou:decidir-catraca",
          faz: [
            {
              escolha: {
                titulo: "A Vó Zuleica chegou à catraca. O que fazer?",
                quem: "Recepcionista Premium",
                opcoes: [
                  {
                    id: "cobrar",
                    rotulo: "Cumprir a regra: cobrar os cinco reais da Vó Zuleica",
                    faz: [
                      decide("catraca", "cobrou"),
                      { se: [no("fl-catraca-posto", "liberada")], entao: [{ lugar: ["fl-catraca-posto", "cobrando"] }] },
                      { ler: "Bip! Cinco reais. A Vó Zuleica pagou em moedas e pediu recibo em letra grande." },
                      nota("catraca-fim", "Cobrei a catraca da Vó Zuleica, como manda a regra."),
                      { concluir: true },
                    ],
                  },
                  {
                    id: "liberar",
                    rotulo: "Desligar a cobrança: catraca liberada para todo mundo",
                    faz: [
                      decide("catraca", "liberou"),
                      { se: [no("fl-catraca-posto", "cobrando")], entao: [{ lugar: ["fl-catraca-posto", "liberada"] }] },
                      { ler: "Clique! Catraca liberada. A fila comum entrou junto e o pombo perdeu a exclusividade." },
                      nota("catraca-fim", "Desliguei a cobrança: a catraca do posto ficou liberada."),
                      { concluir: true },
                    ],
                  },
                  {
                    id: "artigo",
                    rotulo: "Usar o artigo 2º: idosa entra de graça, o resto paga",
                    faz: [decide("catraca", "artigo"), { ler: "Artigo 2º aplicado: a Vó Zuleica entrou de graça e mediu a pressão. 12 por 8, e muito orgulho." }, nota("catraca-fim", "Apliquei o artigo 2º: idoso não paga a catraca."), { concluir: true }],
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
  pontos: [
    { id: "ler-regulamento", etapas: ["investigar"] },
    { id: "decidir-catraca", etapas: ["decidir"] },
  ],
  conclusao: ["A catraca do posto já mostra o que foi decidido.", "Vó Zuleica: “Pressão medida. A minha e a do posto.”"],
  selo: { id: "sus-com-catraca", nome: "SUS com Catraca", cor: "#2f9e5a", icone: "🎫" },
};

// ------------------------------------------------------------------ 4 · Leilão da Petrobras

const LEILA = { x: 2780, y: 2930, label: "Leila Farah, na porta da Casa de Leilões" };

const LEILAO: MissaoDef = {
  id: "leilao",
  numero: 4,
  titulo: "Leilão da Petrobras",
  local: "Casa de Leilões da Pátria, no Porto",
  inicio: {
    npc: "fl-leila",
    quem: "Leila Farah, na porta da Casa de Leilões",
    alvo: LEILA,
    dialogo: [
      "Leila Farah: Vim para um leilão de refinaria. O lote 1 é um barril. Usado.",
      "O único arrematante é um pinguim, na primeira fila, com plaquinha própria. O leiloeiro quer vender tudo hoje.",
      "Presidente, confere o lote e a papelada antes de bater o martelo. Eu só queria um contrato com cláusulas.",
    ],
  },
  etapas: [
    {
      id: "falar",
      objetivo: "Fale com a Leila Farah, na porta da Casa de Leilões.",
      alvo: LEILA,
      regras: [{ evento: "falou:fl-leila", faz: [{ avancar: true }] }],
    },
    {
      id: "conferir",
      objetivo: "Confira o leilão: o lote 1, a planilha de arremates e o leiloeiro (pelo menos {leilao.n}/2).",
      alvo: { predio: "fl-ter-leilao", label: "Casa de Leilões da Pátria" },
      lista: [
        { rotulo: "Lote 1, no palco", feito: [tem("leilao.lote")] },
        { rotulo: "Planilha de arremates, no escritório", feito: [tem("leilao.planilha")] },
        { rotulo: "Leiloeiro Dr. Martelo, no púlpito", feito: [tem("leilao.leiloeiro")] },
      ],
      regras: [
        {
          evento: "usou:conferir-lote",
          faz: [
            { marca: "leilao.lote", conta: "leilao.n" },
            { ler: "LOTE 1: um barril, usado. Etiqueta: “Petrobras (uma parte) · no estado em que se encontra · lance mínimo: tudo”." },
            nota("lote", "Lote 1: um barril usado, com a etiqueta da Petrobras inteira."),
            avancaCom("leilao.n", 2),
          ],
        },
        {
          evento: "usou:planilha-leilao",
          faz: [
            { marca: "leilao.planilha", conta: "leilao.n" },
            { marca: "leilao.regra" },
            { ler: "PLANILHA: arrematante, pinguim. Pagamento, um peixe. Rodapé: “lote sem lance volta ao patrimônio”." },
            nota("planilha", "Planilha do leilão: o pinguim paga com um peixe, e lote sem lance volta ao patrimônio."),
            avancaCom("leilao.n", 2),
          ],
        },
        {
          evento: "falou:fl-leiloeiro",
          faz: [
            { marca: "leilao.leiloeiro", conta: "leilao.n" },
            { marca: "leilao.regra" },
            { dialogo: ["Dou-lhe uma! O senhor veio dar lance? O pinguim está ganhando.", "Se ninguém der lance, o barril volta para o patrimônio. Nunca aconteceu: sempre aparece um pinguim."], quem: "Leiloeiro Dr. Martelo" },
            nota("leiloeiro", "Leiloeiro: se ninguém der lance, o lote volta para o patrimônio."),
            avancaCom("leilao.n", 2),
          ],
        },
      ],
    },
    {
      id: "pregao",
      objetivo: "Suba ao púlpito do pregão e decida o destino do lote 1.",
      alvo: { predio: "fl-ter-leilao", label: "Púlpito do pregão" },
      regras: [
        {
          evento: "usou:decidir-leilao",
          faz: [
            {
              escolha: {
                titulo: "O pinguim levantou a plaquinha: um peixe. E o lote 1?",
                quem: "Leiloeiro Dr. Martelo",
                opcoes: [
                  {
                    id: "vender",
                    rotulo: "Bater o martelo: vendido ao pinguim por um peixe",
                    faz: [decide("leilao", "vendeu"), { som: "acerto" }, { ler: "Toc, toc, toc! Vendido. O pinguim pagou com um peixe e pediu nota fiscal." }, nota("leilao-fim", "Vendi o lote 1 ao pinguim, por um peixe."), { concluir: true }],
                  },
                  {
                    id: "cancelar",
                    rotulo: "Cancelar o leilão e devolver o barril à refinaria",
                    faz: [decide("leilao", "cancelou"), { ler: "Leilão cancelado. O barril voltou para a refinaria de táxi, e o pinguim ganhou um cafezinho." }, nota("leilao-fim", "Cancelei o leilão e devolvi o barril."), { concluir: true }],
                  },
                  {
                    id: "sem-lance",
                    rotulo: "Não dar lance: lote sem lance volta ao patrimônio",
                    se: [tem("leilao.regra")],
                    faz: [decide("leilao", "sem-lance"), { ler: "Ninguém deu lance, nem o pinguim, que ficou confuso. Pela planilha, o barril voltou ao patrimônio." }, nota("leilao-fim", "Deixei o lote sem lance: voltou ao patrimônio."), { concluir: true }],
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
  pontos: [
    { id: "conferir-lote", etapas: ["conferir"] },
    { id: "planilha-leilao", etapas: ["conferir"] },
    { id: "decidir-leilao", etapas: ["pregao"] },
  ],
  conclusao: ["Leilão encerrado: o salão já mostra o resultado.", "Leila Farah: “Pelo menos agora tem ata. Ata é quase cláusula.”"],
  selo: { id: "martelo-da-patria", nome: "Martelo da Pátria", cor: "#2a3a6b", icone: "🔨" },
};

// ------------------------------------------------------------------ 5 · Urna com Autorização

const ATENDENTE_CARTORIO = "int-fl-civ-cartorio-atendente";
const KELLY = { x: 2000, y: 1950, label: "Prima Kelly, na Praça do Desfile" };

const URNA: MissaoDef = {
  id: "urna",
  numero: 5,
  titulo: "Urna com Autorização",
  local: "Cartório das Autorizações, na Esplanada",
  inicio: {
    npc: "fl-kelly",
    quem: "Prima Kelly, na Praça do Desfile",
    alvo: KELLY,
    dialogo: [
      "Prima Kelly: Fui votar e me pediram uma autorização para votar. De quem? Do Cartório das Autorizações.",
      "No cartório, pedem a certidão de que eu já votei. Só que eu ainda não votei, porque não tenho autorização.",
      "Perguntei a fonte da regra e me tiraram de mais um grupo. Presidente, resolve isso no cartório?",
    ],
  },
  etapas: [
    {
      id: "falar",
      objetivo: "Fale com a Prima Kelly, na Praça do Desfile.",
      alvo: KELLY,
      regras: [{ evento: "falou:fl-kelly", faz: [{ avancar: true }] }],
    },
    {
      id: "cartorio",
      objetivo: "Entenda a regra no Cartório das Autorizações: fale com a atendente e com o Mesário Anderson ({urna.n}/2).",
      alvo: { predio: "fl-civ-cartorio", label: "Cartório das Autorizações" },
      lista: [
        { rotulo: "Atendente do cartório, no guichê", feito: [tem("urna.atendente")] },
        { rotulo: "Mesário Anderson, no arquivo", feito: [tem("urna.mesario")] },
      ],
      regras: [
        {
          evento: `falou:${ATENDENTE_CARTORIO}`,
          faz: [
            { marca: "urna.atendente", conta: "urna.n" },
            { dialogo: ["Autorização para votar só com a certidão de quem já votou.", "E a certidão de quem já votou só sai depois da autorização. É um círculo perfeito, foi até premiado."], quem: "Atendente do Cartório" },
            nota("circulo", "Cartório: a autorização pede a certidão de voto, e a certidão pede a autorização."),
            avancaCom("urna.n", 2),
          ],
        },
        {
          evento: "falou:fl-mesario",
          faz: [
            { marca: "urna.mesario", conta: "urna.n" },
            { dialogo: ["Nunca li as regras novas. Ninguém leu.", "Mas o regimento antigo está aqui na gaveta: o título de eleitor já vale como autorização. Ninguém revogou, porque ninguém achou."], quem: "Mesário Anderson" },
            nota("regimento", "Mesário Anderson: pelo regimento antigo, o título de eleitor já vale como autorização."),
            avancaCom("urna.n", 2),
          ],
        },
      ],
    },
    {
      id: "guiche",
      objetivo: "Decida a autorização da Prima Kelly no guichê do cartório.",
      alvo: { predio: "fl-civ-cartorio", label: "Guichê das autorizações" },
      regras: [
        {
          evento: "usou:decidir-urna",
          faz: [
            {
              escolha: {
                titulo: "A Prima Kelly quer votar. E a autorização?",
                quem: "Atendente do Cartório",
                opcoes: [
                  {
                    id: "autorizar",
                    rotulo: "Emitir a autorização em três vias, com firma reconhecida",
                    faz: [decide("urna", "autorizou"), { ler: "Autorização emitida em três vias. A Kelly pode votar, desde que leve as três e um café." }, nota("urna-fim", "Emiti a autorização de voto em três vias."), { concluir: true }],
                  },
                  {
                    id: "rasgar",
                    rotulo: "Rasgar a exigência: para votar, basta ser eleitor",
                    faz: [decide("urna", "rasgou"), { ler: "Exigência rasgada em quatro pedaços. O cartório ficou com um guichê a menos para cuidar." }, nota("urna-fim", "Rasguei a exigência de autorização para votar."), { concluir: true }],
                  },
                  {
                    id: "titulo",
                    rotulo: "Usar o regimento antigo: o título de eleitor já basta",
                    faz: [decide("urna", "titulo"), { ler: "Regimento antigo na mesa: o título vale. A Kelly votou, e o cartório arquivou o próprio regimento." }, nota("urna-fim", "Usei o regimento antigo: o título de eleitor basta."), { concluir: true }],
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
  pontos: [{ id: "decidir-urna", etapas: ["guiche"] }],
  conclusao: ["A regra da urna está resolvida, pelo menos no cartório.", "Prima Kelly: “Agora me diz a fonte disso tudo? Brincadeira. Obrigada, presidente.”"],
  selo: { id: "urna-autorizada", nome: "Urna com Autorização", cor: "#7b4bd1", icone: "🗳️" },
};

// ------------------------------------------------------------------ 6 · Brasil, Destino EUA

const ROBSON = { x: 2740, y: 3340, label: "Robson do Despacho" };
const ESTEIRA = { x: 3830, y: 3350, label: "Esteira do cais" };

const EUA: MissaoDef = {
  id: "eua",
  numero: 6,
  titulo: "Brasil, Destino EUA",
  local: "Porto Brasil–EUA",
  inicio: {
    npc: "fl-robson",
    quem: "Robson do Despacho, no porto",
    alvo: ROBSON,
    dialogo: [
      "Robson do Despacho: Chegou a ordem: despachar o Brasil para os EUA. Frete pago em milhas, com laço de presente.",
      "A caixa do Brasil está no Armazém 1. Depois tem a declaração na Alfândega e o manifesto no Controle de Embarque.",
      "A esteira do cais faz o resto. Ou não faz. Quem decide é o senhor.",
    ],
  },
  etapas: [
    {
      id: "falar",
      objetivo: "Fale com o Robson do Despacho, no porto.",
      alvo: ROBSON,
      regras: [{ evento: "falou:fl-robson", faz: [{ avancar: true }] }],
    },
    {
      id: "retirar",
      objetivo: "Retire a caixa do Brasil no Armazém Brasil→EUA 1.",
      alvo: { predio: "fl-ter-armazem-1", label: "Armazém Brasil→EUA 1" },
      regras: [
        {
          evento: "usou:retirar-eua",
          se: [nenhum],
          faz: [{ pegar: "caixa-eua" }, { ler: "A caixa tem laço verde e amarelo e um cartão: “de presente”. O Brasil ali dentro é de papelão." }, nota("caixa-eua", "Retirei a caixa do Brasil, com laço de presente."), { avancar: true }],
        },
      ],
    },
    {
      id: "declarar",
      objetivo: "Declare a carga na Alfândega do Made In (a caixa vai junto, e de moto cabe).",
      alvo: { predio: "fl-ter-alfandega", label: "Alfândega do Made In" },
      exige: [com("caixa-eua")],
      volta: "retirar",
      regras: [
        {
          evento: "usou:declarar-eua",
          se: [com("caixa-eua")],
          faz: [
            { marca: "eua.declarada" },
            { dialogo: ["Declaração: conteúdo, “o próprio Brasil”. Valor, “de presente”. Frete, “em milhas”.", "Saída autorizada. Observação do fiscal: “o país pode ficar, se a esteira parar”."], quem: "Fiscal do Made In" },
            nota("declaracao", "Alfândega: o Brasil sai de presente, e o país pode ficar se a esteira parar."),
            { avancar: true },
          ],
        },
      ],
    },
    {
      id: "manifesto",
      objetivo: "Confira o manifesto no Controle de Embarque antes de ir ao cais.",
      alvo: { predio: "fl-ter-despacho", label: "Controle de Embarque" },
      exige: [com("caixa-eua")],
      volta: "retirar",
      regras: [
        {
          evento: "usou:manifesto-eua",
          faz: [
            { marca: "eua.manifesto" },
            { dialogo: ["MANIFESTO: 1 volume, “o próprio Brasil”, destino EUA, com laço.", "Nota na margem: “caixa pode embarcar vazia, se o conteúdo for declarado ausente”."], quem: "Painel do embarque" },
            nota("manifesto-eua", "Manifesto: a caixa pode embarcar vazia, se o conteúdo for declarado ausente."),
            { avancar: true },
          ],
        },
      ],
    },
    {
      id: "esteira",
      objetivo: "Leve a caixa à esteira do cais e decida o destino do Brasil (o terminal precisa estar em operação).",
      alvo: ESTEIRA,
      exige: [com("caixa-eua")],
      volta: "retirar",
      lista: [{ rotulo: "Terminal em operação (alavanca do Controle de Embarque)", feito: [no("fl-terminal-eua", "em-operacao")] }],
      regras: [
        { evento: "usou:esteira-eua", se: [no("fl-terminal-eua", "parado")], faz: [{ som: "erro" }, { ler: "Terminal parado! Religue a alavanca no Controle de Embarque." }] },
        {
          evento: "usou:esteira-eua",
          se: [com("caixa-eua")],
          faz: [
            {
              escolha: {
                titulo: "O Brasil está na esteira, com laço. O que fazer com a ordem?",
                quem: "Robson do Despacho",
                opcoes: [
                  {
                    id: "embarcar",
                    rotulo: "Obedecer: embarcar o Brasil para os EUA, com laço",
                    faz: [decide("eua", "embarcou"), { soltar: true }, { som: "acerto" }, { ler: "A esteira levou o Brasil, com laço e cartão. O navio apitou em dois idiomas." }, nota("eua-fim", "Embarquei o Brasil para os EUA, com laço."), { concluir: true }],
                  },
                  {
                    id: "devolver",
                    rotulo: "Devolver o Brasil ao armazém: não está à venda",
                    faz: [decide("eua", "devolveu"), { soltar: true }, { ler: "O Brasil voltou ao armazém com etiqueta de “não está à venda”. O laço ficou de enfeite." }, nota("eua-fim", "Devolvi o Brasil ao armazém: não está à venda."), { concluir: true }],
                  },
                  {
                    id: "vazia",
                    rotulo: "Embarcar só a caixa vazia: o laço vai, o Brasil fica",
                    faz: [decide("eua", "caixa-vazia"), { soltar: true }, { ler: "Embarcou a caixa vazia, com laço e tudo. O Brasil ficou no cais, olhando o mar." }, nota("eua-fim", "Embarquei só a caixa vazia: o Brasil ficou."), { concluir: true }],
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
  pontos: [
    { id: "retirar-eua", etapas: ["retirar"], se: [nenhum] },
    { id: "declarar-eua", etapas: ["declarar"], se: [com("caixa-eua")] },
    { id: "manifesto-eua", etapas: ["manifesto"] },
    { id: "esteira-eua", etapas: ["esteira"], se: [com("caixa-eua")], fora: { x: ESTEIRA.x, y: ESTEIRA.y, label: "Decidir o destino do Brasil na esteira" } },
  ],
  conclusao: ["Brasil resolvido: o cais mostra o que aconteceu, de um jeito ou de outro.", "Passaporte da Ordem completo: os seis selos são seus. @PatriotaRaiz quer falar com você na Praça do Desfile."],
  selo: { id: "brasil-eua", nome: "Brasil, Destino EUA", cor: "#2f6fd6", icone: "🚢" },
};

// ------------------------------------------------------------------ Epílogo: Eleição no Cofre

/** Atrás do palanque da Praça do Desfile, de frente para a praça. */
export const PALANQUE_FLAVIO = { x: 1760, y: 1800 };

const ELEICAO: MissaoDef = {
  id: "eleicao",
  numero: 7,
  titulo: "Eleição no Cofre",
  local: "Esplanada da Ordem",
  inicio: {
    npc: "fl-patriota",
    quem: "@PatriotaRaiz.Oficial, na Praça do Desfile",
    alvo: PATRIOTA,
    dialogo: [
      "@PatriotaRaiz: Presidente, o Passaporte da Ordem está completo! Seis selos, todos ao vivo.",
      "O Tribunal leu os selos como autorização para uma coisa maior: guardar a eleição num lugar seguríssimo.",
      "Passa no Tribunal Eleitoral do Cofre e depois sobe ao palanque. A praça já está enchendo.",
    ],
  },
  etapas: [
    {
      id: "convite",
      objetivo: "Fale com @PatriotaRaiz.Oficial, na Praça do Desfile.",
      alvo: PATRIOTA,
      regras: [{ evento: "falou:fl-patriota", faz: [{ avancar: true }] }],
    },
    {
      id: "tribunal",
      objetivo: "Confira a urna oficial, na Sala do Cofre do Tribunal Eleitoral.",
      alvo: { predio: "fl-civ-tribunal", label: "Tribunal Eleitoral do Cofre" },
      regras: [
        {
          evento: "usou:conferir-cofre",
          faz: [
            { dialogo: ["A urna oficial está no cofre, dentro de outro cofre. Seguríssima.", "A senha? Ficou com o senhor, presidente. Está no discurso de hoje."], quem: "Juiz Eleitoral" },
            nota("cofre", "Tribunal: a urna oficial está no cofre dentro do cofre, e a senha está no discurso do presidente."),
            { avancar: true },
          ],
        },
      ],
    },
    {
      id: "palanque",
      objetivo: "A cerimônia vai começar: suba ao palanque da Praça do Desfile.",
      alvo: { ...PALANQUE_FLAVIO, label: "Palanque da Praça do Desfile" },
      regras: [
        { evento: "usou:palanque", faz: [{ cerimonia: true }] },
        { evento: "cerimonia:fim", faz: [{ concluir: true }] },
      ],
    },
  ],
  pontos: [
    { id: "conferir-cofre", etapas: ["tribunal"] },
    { id: "palanque", etapas: ["palanque"], fora: { ...PALANQUE_FLAVIO, label: "Subir ao palanque" } },
  ],
  conclusao: ["A eleição está guardada no cofre. Em aço, em senha e em eco.", "A cidade segue explorável: veja como cada canto recebeu a notícia."],
  selo: { id: "eleicao-no-cofre", nome: "Eleição no Cofre", cor: "#1f6f43", icone: "🔐" },
};

// ------------------------------------------------------------------ falas por estado

const f = (npc: string, quando: Cond[], linhas: string[]): FalaPorEstado => ({ npc, quando, linhas });
const fez = (id: string): Cond => ({ concluida: id });
const d = (m: string, v: string): Cond => vale(`d.${m}`, v);
const tom = (v: string): Cond => vale("final.tom", v);

const FALAS: FalaPorEstado[] = [
  // depois da cerimônia (a cidade reage ao tom)
  f("fl-patriota", [tom("obediencia")], ["A live da eleição bateu recorde. Ninguém votou, mas todo mundo comentou ORDEM.", "O cofre virou ponto turístico. Selfie com o cofre é R$ 5, na catraca."]),
  f("fl-patriota", [tom("ignorado")], ["Fiz live do cofre e só o pinguim assistiu. Engajamento baixo, cofre alto.", "A cidade foi pra feira no meio do anúncio. O algoritmo não perdoa."]),
  f("fl-patriota", [tom("misto")], ["Metade da praça aplaudiu, a outra metade pediu a senha. Deu ótimo vídeo de reação.", "Dizem que o cofre abre às terças, às 3h. Já marquei a live."]),
  f("fl-kelly", [tom("obediencia")], ["Pedi a fonte da senha do cofre. Me deram um formulário para pedir a fonte."]),
  f("fl-kelly", [tom("ignorado")], ["Cofre? A gente já votou no grupo do condomínio. Deu empate com o pinguim."]),
  f("fl-wanderley", [tom("obediencia")], ["Desmenti que o cofre tem senha. Depois desmenti o desmentido. Está tudo em ordem."]),
  f("fl-wanderley", [tom("ignorado")], ["Ninguém pediu desmentido hoje. Fiquei ofendido e desmenti isso também."]),
  f("fl-robson", [tom("obediencia")], ["Agora até carta precisa de autorização para sair do porto. Pesei a autorização: zero quilo, três carimbos."]),
  // decisões da campanha
  f("fl-patriota", [fez("eua"), d("eua", "embarcou")], ["O Brasil embarcou com laço! Já postei o unboxing antes de chegar.", "Comenta ORDEM se você também sentiu o cais mais vazio."]),
  f("fl-patriota", [fez("eua"), d("eua", "devolveu")], ["O Brasil voltou pro armazém com etiqueta de “não está à venda”. Virou meme, e meme não se exporta."]),
  f("fl-patriota", [fez("eua"), d("eua", "caixa-vazia")], ["Embarcou a caixa vazia, com laço. O unboxing do outro lado vai ser rápido."]),
  f("fl-patriota", [fez("chicote"), d("chicote", "alcacuz")], ["Chicote de alcaçuz! O vídeo bombou na categoria receitas.", "O Ministério da Produtividade pediu a receita. Por escrito."]),
  f("fl-patriota", [fez("chicote"), d("chicote", "vale")], ["Trocou o chicote por vale-refeição? O vídeo virou propaganda de restaurante.", "O Ministério ainda procura o recibo. Eu ainda procuro o patrocínio."]),
  f("fl-patriota", [fez("chicote")], ["O chicote chegou à Fábrica Feliz, e ninguém soube o que fazer com ele.", "Comenta ORDEM que o próximo vídeo é sobre o décimo terceiro."]),
  f("fl-durval", [fez("chicote"), d("chicote", "entregou")], ["O chicote está pendurado no quadro de metas. Uso de ponteiro, e a reunião não acaba.", "Se o Ministério perguntar, ele está em uso. Decorativo, mas em uso."]),
  f("fl-durval", [fez("chicote"), d("chicote", "vale")], ["Vale-refeição para todo mundo! A fábrica nunca foi tão feliz, e o Ministério nunca foi tão confuso."]),
  f("fl-durval", [fez("chicote"), d("chicote", "alcacuz")], ["Chicote de alcaçuz: a reunião de metas acabou em lanche. Meta cumprida."]),
  f("fl-zeca", [fez("chicote"), d("chicote", "vale")], ["O chicote voltou pra loja com cheiro de marmita. Vendi pra um carnavalesco."]),
  f("fl-zeca", [fez("chicote")], ["Agora todo mundo quer chicote de alcaçuz. Abri uma filial na padaria."]),
  f("fl-tonhao", [fez("dezembro"), d("dezembro", "aceitou")], ["Fiquei sem dezembro e sem décimo terceiro. Ganhei um aperto de mão e um novembro de 61 dias.", "No Natal, que agora é em novembro, vou pedir dezembro de presente."]),
  f("fl-tonhao", [fez("dezembro"), d("dezembro", "devolveu")], ["Dezembro voltou, escrito à caneta! Recebi o décimo terceiro e emoldurei a página."]),
  f("fl-tonhao", [fez("dezembro"), d("dezembro", "parcelou")], ["Décimo terceiro em doze novembros. Recebo uma parcela por ano, e já sei de cor: terça, às 3h."]),
  f("fl-rosangela", [fez("dezembro")], ["O relógio de ponto ficou em terça, 3h. O sistema nunca esteve tão acordado.", "Agora tem fila no RH, mas é fila de quem vai receber."]),
  f("fl-zuleica", [fez("catraca"), d("catraca", "cobrou"), no("fl-catraca-posto", "cobrando")], ["Paguei a catraca em moedas e medi a pressão. Subiu, de tanto pagar.", "Já guardei os cinco reais da próxima vez numa latinha."]),
  f("fl-zuleica", [fez("catraca"), d("catraca", "artigo")], ["Entrei pelo artigo 2º, de cabeça erguida. Agora leio regulamento como quem lê novela."]),
  f("fl-zuleica", [fez("catraca"), no("fl-catraca-posto", "liberada")], ["Catraca liberada! A fila comum entrou junto, e o pombo do camarote ficou emburrado.", "Medi a pressão de graça: 12 por 8, e muita alegria."]),
  f("fl-zuleica", [fez("catraca")], ["A catraca voltou a cobrar, mas eu já sei de cor o artigo 2º. Por precaução."]),
  f(RECEPCIONISTA, [fez("catraca"), no("fl-catraca-posto", "liberada")], ["Catraca liberada: a fila VIP e a comum agora são a mesma fila. O pombo pediu reembolso."]),
  f(RECEPCIONISTA, [fez("catraca")], ["Plano ouro, prata ou artigo 2º? Agora tem as três opções no cardápio."]),
  f("fl-leila", [fez("leilao"), d("leilao", "vendeu")], ["O pinguim arrematou o barril. Eu fiquei com a ata. Ata é quase cláusula."]),
  f("fl-leila", [fez("leilao"), d("leilao", "cancelou")], ["Leilão cancelado! Pela primeira vez saio de um leilão com tudo o que eu não comprei."]),
  f("fl-leila", [fez("leilao"), d("leilao", "sem-lance")], ["Sem lance, o barril voltou ao patrimônio. Foi o leilão mais organizado da minha carreira."]),
  f("fl-leiloeiro", [fez("leilao"), d("leilao", "vendeu")], ["Vendido ao pinguim! Já marquei o lote 2: uma praça com pombo."]),
  f("fl-leiloeiro", [fez("leilao")], ["Sem venda hoje. Vou leiloar o martelo para pagar o cafezinho."]),
  f("fl-kelly", [fez("urna"), d("urna", "autorizou")], ["Votei! Levei três vias, um café e a paciência. Perguntei a fonte das três vias, claro."]),
  f("fl-kelly", [fez("urna"), d("urna", "rasgou")], ["Rasgaram a exigência! Votei sem autorização, só com o título. Como era antes de inventarem."]),
  f("fl-kelly", [fez("urna"), d("urna", "titulo")], ["O regimento antigo salvou o voto. Agora eu cito o artigo nos grupos, e me removem com mais respeito."]),
  f("fl-mesario", [fez("urna")], ["Li as regras novas, finalmente. Eram três: “autorização”, “certidão” e “boa sorte”."]),
  f("fl-robson", [fez("eua"), d("eua", "embarcou")], ["Pesei o Brasil antes de embarcar: deu um país e um laço. O navio já apitou.", "Rastreio: em alto-mar, com cartão de presente."]),
  f("fl-robson", [fez("eua"), d("eua", "devolveu")], ["O Brasil voltou pro Armazém 1, com etiqueta de “não está à venda”. Pesei a etiqueta: pesa mais que o país."]),
  f("fl-robson", [fez("eua"), d("eua", "caixa-vazia")], ["Embarcou a caixa vazia, com laço. Pesei: zero quilo de Brasil, três de laço."]),
  f("controlador", [fez("eua")], ["O manifesto voltou do outro lado com um carimbo: “recebido, com dúvidas”."]),
];

export const ITENS_FLAVIO: Record<string, string> = {
  chicote: "Chicote embrulhado",
  "caixa-eua": "Caixa do Brasil (com laço)",
};

export const CAMPANHA_FLAVIO: Campanha = {
  missoes: [CHICOTE, DEZEMBRO, CATRACA, LEILAO, URNA, EUA],
  epilogo: ELEICAO,
  falas: FALAS,
  itens: ITENS_FLAVIO,
};

export const SELO_FINAL_FLAVIO: SeloDef = ELEICAO.selo;

/** O relógio de ponto do RH, para o quadro do interior e os testes. */
export { RELOGIO as RELOGIO_RH, RELOGIO_CERTO };

/** Quem decidiu o quê: o texto curto que o Passaporte e a cerimônia final usam. */
export const DECISOES_FLAVIO: Record<string, Record<string, Decisao>> = {
  chicote: {
    entregou: { lado: "obediente", texto: "entregou o chicote de couro ao Seu Durval" },
    vale: { lado: "rebelde", texto: "trocou o chicote por vale-refeição" },
    alcacuz: { lado: "meio", texto: "entregou um chicote de alcaçuz" },
  },
  dezembro: {
    aceitou: { lado: "obediente", texto: "aceitou o calendário sem dezembro" },
    devolveu: { lado: "rebelde", texto: "devolveu dezembro ao calendário, à caneta" },
    parcelou: { lado: "meio", texto: "parcelou o 13º em doze novembros" },
  },
  catraca: {
    cobrou: { lado: "obediente", texto: "cobrou a catraca da Vó Zuleica" },
    liberou: { lado: "rebelde", texto: "liberou a catraca do posto para todos" },
    artigo: { lado: "meio", texto: "usou o artigo 2º: idosa entra de graça" },
  },
  leilao: {
    vendeu: { lado: "obediente", texto: "vendeu o barril ao pinguim por um peixe" },
    cancelou: { lado: "rebelde", texto: "cancelou o leilão e devolveu o barril" },
    "sem-lance": { lado: "meio", texto: "deixou o lote voltar ao patrimônio sem lance" },
  },
  urna: {
    autorizou: { lado: "obediente", texto: "emitiu a autorização de voto em três vias" },
    rasgou: { lado: "rebelde", texto: "rasgou a exigência de autorização para votar" },
    titulo: { lado: "meio", texto: "usou o regimento antigo: o título basta" },
  },
  eua: {
    embarcou: { lado: "obediente", texto: "embarcou o Brasil para os EUA, com laço" },
    devolveu: { lado: "rebelde", texto: "devolveu o Brasil ao armazém" },
    "caixa-vazia": { lado: "meio", texto: "embarcou só a caixa vazia" },
  },
};
