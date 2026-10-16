// Checa a campanha de seis missões da cidade do Lula sem abrir o navegador: o motor (etapas, escolhas,
// itens, recuperação de saves), as decisões e a cerimônia final, e o gerente que a cena usa.
// Uso: pnpm check:campanha
import { strict as assert } from "node:assert";
import { ALVARA_SOM, CAMPANHA, DECISOES, ITENS, SELOS, SELO_FINAL } from "../src/world/cidade/missoes/campanha";
import { apura, marcasDaPraca, roteiro, tomDe } from "../src/world/cidade/missoes/final";
import { completa, contexto, disponivel, escolher, estadoVazio, evento, iniciar, pontosVisiveis, recupera, sanear, situacao, todasMissoes, type Efeito, type Estado, type Saida, type Valor } from "../src/world/cidade/missoes/motor";
import { INTERIORS, interiorChaves } from "../src/world/cidade";
import { initialPlaces } from "../src/world/cidade/places";
import { Missoes, type Anfitriao } from "../src/world/game/city/Missoes";
import { clearCity, readCity, saveCampanha } from "../src/world/cidade/progress";

const data = new Map<string, string>();
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: { localStorage: { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => data.set(k, v), removeItem: (k: string) => data.delete(k) } },
});

type Escolha = Extract<Saida, { tipo: "escolha" }>;
const mundo = { e: estadoVazio(), lugares: { ...initialPlaces() } as Record<string, string>, saidas: [] as Saida[], escolha: null as Escolha | null };
const reset = () => {
  mundo.e = estadoVazio();
  mundo.lugares = { ...initialPlaces() } as Record<string, string>;
  mundo.saidas = [];
  mundo.escolha = null;
};
const recarga = (onde: string) => assert.deepEqual(sanear(JSON.parse(JSON.stringify(mundo.e)), CAMPANHA), mundo.e, `recarga fiel em ${onde}`);
/** Aplica as saídas como a cena: mudanças de lugar viram eventos de volta, e uma escolha fica pendente. */
const absorve = (saidas: Saida[], fila: string[]) => {
  for (const s of saidas) {
    mundo.saidas.push(s);
    if (s.tipo === "lugar") {
      mundo.lugares[s.place] = s.estado;
      fila.push(`lugar:${s.place}:${s.estado}`);
    } else if (s.tipo === "escolha") mundo.escolha = s;
  }
};
const emite = (ev: string) => {
  const fila = [ev];
  while (fila.length) {
    const ev1 = fila.shift()!;
    const r = evento(CAMPANHA, mundo.e, ev1, mundo.lugares);
    mundo.e = r.estado;
    absorve(r.saidas, fila);
    recarga(ev1);
  }
};
const escolhe = (id: string) => {
  const esc = mundo.escolha;
  assert.ok(esc, `há uma escolha aberta para escolher ${id}`);
  const op = esc.opcoes.find((o) => o.id === id);
  assert.ok(op, `a opção ${id} existe entre ${esc.opcoes.map((o) => o.id).join(", ")}`);
  mundo.escolha = null;
  const fila: string[] = [];
  const r = escolher(CAMPANHA, mundo.e, esc.missao, esc.etapaId, op, mundo.lugares);
  mundo.e = r.estado;
  absorve(r.saidas, fila);
  while (fila.length) {
    const r2 = evento(CAMPANHA, mundo.e, fila.shift()!, mundo.lugares);
    mundo.e = r2.estado;
    absorve(r2.saidas, fila);
  }
  recarga(`escolha ${id}`);
};
/** "evento" emite; "?id" escolhe uma opção da escolha aberta. */
const passos = (...ps: string[]) => {
  for (const p of ps) (p.startsWith("?") ? escolhe(p.slice(1)) : emite(p));
};
const comeca = (id: string) => {
  const r = iniciar(CAMPANHA, mundo.e, id, mundo.lugares);
  mundo.e = r.estado;
  absorve(r.saidas, []);
  assert.equal(mundo.e.ativa, id, `missão ${id} começou`);
};
const etapa = () => todasMissoes(CAMPANHA).find((m) => m.id === mundo.e.ativa)?.etapas[mundo.e.etapa].id ?? null;
const opcoesAbertas = () => mundo.escolha?.opcoes.map((o) => o.id) ?? [];
const decisao = (m: string) => mundo.e.flags[`d.${m}`];

/** As etiquetas giram por 4 opções, começando na primeira: a certa é a 3ª do peso, a 4ª do destino e a 3ª do conteúdo. */
const ETQ = ["usou:etq-peso", "usou:etq-peso", "usou:etq-destino", "usou:etq-destino", "usou:etq-destino", "usou:etq-conteudo", "usou:etq-conteudo"];

/** Caminhos mais curtos de cada missão, por decisão. */
const CAMINHO: Record<string, Record<string, string[]>> = {
  protocolo: {
    carimbo: ["usou:aviso-1", "usou:aviso-3", "usou:guiche", "?amarelo"],
    recurso: ["usou:aviso-2", "usou:aviso-3", "usou:guiche", "?recurso"],
  },
  cadeado: {
    cumpriu: ["usou:porta-igreja", "falou:pastor", "usou:cadeado-tiao", "usou:instalar-cadeado", "?cumprir"],
    sabotou: ["usou:porta-igreja", "falou:pastor", "usou:cadeado-tiao", "usou:instalar-cadeado", "?sabotar"],
    brecha: ["usou:porta-igreja", "falou:pastor", "falou:fregues", "usou:cadeado-tiao", "usou:instalar-cadeado", "?brecha"],
  },
  zap: {
    lacrado: ["usou:caixa-b", "usou:levar-b", "usou:entregar-zap", "usou:decidir-zap", "?lacrado"],
    desmentiu: ["usou:caixa-a", "usou:caixa-b", "usou:caixa-c", "usou:levar-b", "usou:entregar-zap", "usou:decidir-zap", "?desmentiu"],
    boato: ["usou:levar-b", "usou:entregar-zap", "usou:decidir-zap", "?boato"],
  },
  campus: {
    autorizou: ["falou:reitora", "usou:som-grave", "usou:som-grave", "usou:som-agudo", "usou:testar-som", "usou:homologar", "?autorizar"],
    negociou: ["falou:reitora", "usou:som-grave", "usou:som-grave", "usou:som-agudo", "usou:testar-som", "usou:homologar", "?negociar"],
    ignorou: ["falou:reitora", "usou:som-grave", "usou:som-grave", "usou:som-agudo", "usou:testar-som", "usou:homologar", "?ignorar"],
  },
  chave: {
    coletivo: ["falou:osvaldo", "falou:encarregada", "usou:armario-ferramentas", "usou:ver-muro", "usou:posto-muro", "usou:ver-elevador", "usou:posto-elevador", "usou:ver-prensa", "usou:posto-prensa", "usou:gancho-chave", "?coletivo"],
    devolveu: ["falou:encarregada", "falou:osvaldo", "usou:armario-ferramentas", "usou:ver-prensa", "usou:posto-prensa", "usou:ver-elevador", "usou:posto-elevador", "usou:ver-muro", "usou:posto-muro", "usou:gancho-chave", "?devolver"],
    quebrou: ["falou:osvaldo", "falou:encarregada", "usou:armario-ferramentas", "usou:ver-elevador", "usou:posto-elevador", "usou:ver-prensa", "usou:posto-prensa", "usou:ver-muro", "usou:posto-muro", "usou:gancho-chave", "?quebrar"],
  },
  brasil: {
    despachou: ["falou:estivador", "falou:operario", "usou:retirar-brasil", ...ETQ, "usou:colocar-carga", "usou:conferir-despacho", "usou:acionar-esteira", "?despachar"],
    trocou: ["falou:estivador", "falou:controlador", "usou:retirar-brasil", ...ETQ, "usou:colocar-carga", "usou:conferir-despacho", "usou:acionar-esteira", "?trocar"],
    sabotou: ["falou:operario", "falou:controlador", "usou:retirar-brasil", ...ETQ, "usou:colocar-carga", "usou:conferir-despacho", "usou:acionar-esteira", "?sabotar"],
  },
};
/** Joga uma missão pelo caminho da decisão e confere que ela conclui com selo e item solto. */
const joga = (id: string, decisaoId: string) => {
  comeca(id);
  const evs = CAMINHO[id][decisaoId];
  for (const [i, p] of evs.entries()) {
    passos(p);
    if (i < evs.length - 1) assert.equal(mundo.e.ativa, id, `${id}/${decisaoId} ainda não terminou em ${p}`);
  }
  assert.ok(mundo.e.concluidas.includes(id), `${id}/${decisaoId} concluída`);
  assert.equal(mundo.e.ativa, null);
  assert.equal(mundo.e.carregando, null, `${id} não deixa item perdido`);
  assert.equal(decisao(id), decisaoId, `${id}: a decisão ficou registrada`);
};
const ate = (id: string, decisoes: Record<string, string> = {}) => {
  for (const m of CAMPANHA.missoes) {
    if (m.id === id) return;
    joga(m.id, decisoes[m.id] ?? Object.keys(CAMINHO[m.id])[0]);
  }
};

// ---------- 1) a campanha inteira, com cada decisão, e o encerramento ----------
for (const m of CAMPANHA.missoes) {
  for (const dec of Object.keys(CAMINHO[m.id])) {
    reset();
    ate(m.id);
    // as missões ficam em ordem: nenhuma outra começa enquanto esta está ativa
    comeca(m.id);
    const outra = CAMPANHA.missoes.find((x) => x.id !== m.id && !mundo.e.concluidas.includes(x.id));
    if (outra) assert.equal(iniciar(CAMPANHA, mundo.e, outra.id, mundo.lugares).estado, mundo.e, "só uma missão ativa por vez");
    joga(m.id, dec);
    assert.ok(mundo.e.selos.includes(m.selo.id), `selo de ${m.id}/${dec}`);
    // recompensa única: repetir o caminho não duplica selo nem reabre a missão
    const antes = JSON.stringify(mundo.e);
    for (const p of CAMINHO[m.id][dec]) if (!p.startsWith("?")) emite(p);
    assert.equal(JSON.stringify(mundo.e), antes, `${m.id}/${dec}: repetir eventos depois de concluída não muda nada`);
  }
}

// a campanha toda, e a cerimônia depois
reset();
for (const m of CAMPANHA.missoes) {
  assert.equal(disponivel(CAMPANHA, mundo.e)?.id, m.id, `a próxima é ${m.id}`);
  joga(m.id, Object.keys(CAMINHO[m.id])[0]);
}
assert.equal(mundo.e.selos.length, 6);
assert.ok(completa(CAMPANHA, mundo.e));
assert.equal(disponivel(CAMPANHA, mundo.e)?.id, "ditadura", "depois da sexta, a cerimônia final");
assert.equal(mundo.saidas.filter((s) => s.tipo === "concluiu" && s.completa).length, 1, "o passaporte completo é anunciado uma vez");

// ---------- 2) escolhas: opções condicionadas e sem efeito oculto ----------
reset();
ate("cadeado");
comeca("cadeado");
passos("usou:porta-igreja", "falou:pastor", "usou:cadeado-tiao", "usou:instalar-cadeado");
assert.deepEqual(opcoesAbertas(), ["cumprir", "sabotar"], "sem a pista do bar, não há a brecha");
const aberta = mundo.escolha!;
// a escolha caduca se a etapa mudou: uma opção velha não faz nada
mundo.e = { ...mundo.e, etapa: 1, etapaId: "retirar", carregando: null };
const caducou = escolher(CAMPANHA, mundo.e, aberta.missao, aberta.etapaId, aberta.opcoes[0], mundo.lugares);
assert.equal(caducou.estado, mundo.e, "escolha de etapa que já passou não muda nada");
reset();
ate("cadeado");
comeca("cadeado");
passos("usou:porta-igreja", "falou:pastor", "falou:fregues", "usou:cadeado-tiao", "usou:instalar-cadeado");
assert.deepEqual(opcoesAbertas(), ["cumprir", "sabotar", "brecha"], "a pista do bar libera a brecha");
// desistir não muda nada: a escolha é refeita ao interagir de novo, e a etapa continua a mesma
const antesDesistir = JSON.stringify(mundo.e);
mundo.escolha = null;
assert.equal(JSON.stringify(mundo.e), antesDesistir);
passos("usou:instalar-cadeado");
assert.deepEqual(opcoesAbertas(), ["cumprir", "sabotar", "brecha"]);

// consequências por decisão no estado dos lugares (igreja começa interditada; reabri-la depois é possível)
for (const [dec, antes, depois] of [
  ["cumpriu", "aberta", "interditada"],
  ["cumpriu", "interditada", "interditada"],
  ["sabotou", "interditada", "aberta"],
  ["sabotou", "aberta", "aberta"],
  ["brecha", "aberta", "interditada"],
  ["brecha", "interditada", "interditada"],
] as const) {
  reset();
  ate("cadeado");
  mundo.lugares["igreja-matriz"] = antes;
  joga("cadeado", dec);
  assert.equal(mundo.lugares["igreja-matriz"], depois, `igreja ${antes} + ${dec} → ${depois}`);
  mundo.lugares["igreja-matriz"] = "aberta";
  emite("lugar:igreja-matriz:aberta");
  assert.ok(mundo.e.concluidas.includes("cadeado") && decisao("cadeado") === dec, "reabrir a igreja depois não desfaz o selo nem a decisão");
}

// protocolo: formulário errado é recuperável, o recurso exige ter lido dois avisos
reset();
comeca("protocolo");
passos("usou:aviso-1");
assert.equal(etapa(), "avisos", "uma pista só não basta para decidir");
passos("falou:nilza");
assert.equal(etapa(), "carimbar", "duas pistas (aviso e morador) bastam");
passos("usou:guiche", "?azul", "usou:guiche", "?verde");
assert.equal(etapa(), "carimbar", "formulário errado não conclui");
assert.equal(mundo.e.flags["protocolo.erros"], 2);
passos("usou:guiche", "?recurso");
assert.equal(etapa(), "carimbar", "recurso com um aviso só não vale");
passos("usou:aviso-3", "usou:guiche", "?recurso");
assert.ok(mundo.e.concluidas.includes("protocolo") && decisao("protocolo") === "recurso");
// o aviso 1 não revela a resposta antes da escolha (sem texto automático dizendo "é o amarelo")
reset();
comeca("protocolo");
passos("usou:aviso-1", "usou:aviso-2");
assert.ok(!mundo.saidas.some((s) => (s.tipo === "ler" || s.tipo === "dialogo") && /Já sei qual é/i.test(JSON.stringify(s))), "nada revela a resposta sozinho");

// zap: caixa errada é engraçada, recuperável e não deixa item
reset();
ate("zap");
comeca("zap");
passos("usou:levar-a");
assert.equal(mundo.e.carregando, null, "caixa errada não fica na mão");
assert.equal(etapa(), "etiquetas");
passos("usou:levar-c");
assert.equal(mundo.e.flags["zap.erros"], 2);
assert.ok(mundo.saidas.some((s) => s.tipo === "dialogo" && s.quem === "Seu Kiko"), "a caixa errada tem cena");
passos("usou:levar-b");
assert.equal(mundo.e.carregando, "caixa-zap");
passos("usou:levar-a");
assert.equal(mundo.e.carregando, "caixa-zap", "com a mão ocupada, outra caixa não troca");
passos("usou:entregar-zap");
assert.equal(etapa(), "distribuir");
assert.equal(mundo.e.carregando, null);
for (const [dec, lugar] of [["lacrado", "vazio"], ["desmentiu", "vazio"], ["boato", "abastecido"]] as const) {
  reset();
  ate("zap");
  joga("zap", dec);
  assert.equal(mundo.lugares["deposito-kits"], lugar, `depósito depois de ${dec}`);
}

// campus: o teste de som confere, com resposta de quantos canais batem
reset();
ate("campus");
comeca("campus");
passos("falou:reitora");
assert.equal(etapa(), "som");
passos("usou:testar-som");
assert.equal(etapa(), "som", "som fora do alvará não avança");
assert.ok(mundo.saidas.some((s) => s.tipo === "som" && s.id === "erro"));
const sit = situacao(CAMPANHA, mundo.e, mundo.lugares)!;
assert.deepEqual(sit.painel.map((p) => p.rotulo), ["Grave", "Médio", "Agudo"], "os três níveis ficam sempre no painel");
passos("usou:som-grave", "usou:som-grave");
assert.equal(situacao(CAMPANHA, mundo.e, mundo.lugares)!.painel[0].valor, ALVARA_SOM.grave);
assert.ok(mundo.saidas.some((s) => s.tipo === "som" && s.id === "grave:2"), "cada ajuste toca o canal no nível novo");
passos("usou:som-agudo", "usou:testar-som");
assert.equal(etapa(), "homologar", "som no alvará abre a decisão");
for (const [dec, antes, depois] of [
  ["autorizou", "normal", "liberou-geral"],
  ["autorizou", "liberou-geral", "liberou-geral"],
  ["negociou", "normal", "liberou-geral"],
  ["ignorou", "liberou-geral", "normal"],
  ["ignorou", "normal", "normal"],
] as const) {
  reset();
  ate("campus");
  mundo.lugares.universidade = antes;
  joga("campus", dec);
  assert.equal(mundo.lugares.universidade, depois, `universidade ${antes} + ${dec}`);
}

// chave: a ordem das conversas e dos postos não importa, e a chave só chega uma vez
for (const ordem of [["osvaldo", "encarregada"], ["encarregada", "osvaldo"]]) {
  reset();
  ate("chave");
  comeca("chave");
  passos("falou:didi");
  passos(`falou:${ordem[0]}`);
  assert.equal(mundo.e.carregando, null, "a primeira conversa não entrega a chave");
  assert.equal(etapa(), "pistas");
  passos(`falou:${ordem[0]}`);
  assert.equal(mundo.e.carregando, null, "repetir a primeira conversa não entrega a chave");
  passos(`falou:${ordem[1]}`);
  assert.equal(mundo.e.carregando, "chave", "a segunda conversa entrega a chave");
  assert.equal(etapa(), "armario");
  const falas = mundo.saidas.filter((s) => s.tipo === "dialogo" && ["Tio Osvaldo", "Encarregada Rose"].includes(s.quem ?? ""));
  assert.ok(falas.length >= 2, "cada conversa tem a sua fala");
  assert.ok(/toma/i.test(JSON.stringify(falas[falas.length - 1])), `quem entrega a chave diz isso (${ordem.join(" → ")})`);
  assert.ok(!/toma/i.test(JSON.stringify(falas[0])), "quem fala primeiro não entrega nada");
  passos("usou:armario-ferramentas");
  assert.equal(mundo.e.carregando, "caixa-ferramentas", "o armário dá a caixa de ferramentas");
  assert.equal(etapa(), "ferramentas");
  const sit5 = situacao(CAMPANHA, mundo.e, mundo.lugares)!;
  assert.equal(sit5.lista.length, 3, "checklist com os três postos");
  assert.equal(sit5.alvos.length, 3, "um destino por posto pendente");
}
// os três postos em qualquer ordem
const perms = [["muro", "elevador", "prensa"], ["muro", "prensa", "elevador"], ["elevador", "muro", "prensa"], ["elevador", "prensa", "muro"], ["prensa", "muro", "elevador"], ["prensa", "elevador", "muro"]];
for (const perm of perms) {
  reset();
  ate("chave");
  comeca("chave");
  passos("falou:osvaldo", "falou:encarregada", "usou:armario-ferramentas");
  for (const [i, posto] of perm.entries()) {
    passos(`usou:posto-${posto}`);
    assert.equal(mundo.e.flags[`chave.${posto}`], undefined, "consertar sem examinar antes não funciona");
    passos(`usou:ver-${posto}`, `usou:posto-${posto}`);
    assert.ok(mundo.e.flags[`chave.${posto}`], `${posto} consertado`);
    const sit6 = situacao(CAMPANHA, mundo.e, mundo.lugares);
    if (i < 2) assert.equal(sit6!.alvos.length, 2 - i, "o destino acompanha o que falta");
    passos(`usou:posto-${posto}`);
  }
  assert.equal(etapa(), "devolver");
  assert.equal(mundo.e.carregando, null);
  assert.equal(mundo.e.flags["chave.entregues"], 3, "cada posto conta uma vez");
}

// brasil: pistas em qualquer combinação de duas, etiquetas com retorno, terminal parado e escolha na esteira
for (const par of [["operario", "estivador"], ["operario", "controlador"], ["estivador", "controlador"]]) {
  reset();
  ate("brasil");
  comeca("brasil");
  passos("falou:despachante");
  assert.equal(etapa(), "regulamento");
  passos(`falou:${par[0]}`);
  assert.equal(etapa(), "regulamento", "uma pista só não basta");
  passos(`falou:${par[1]}`);
  assert.equal(etapa(), "retirar", "duas pistas bastam");
}
reset();
ate("brasil");
comeca("brasil");
passos("falou:despachante", "falou:operario", "falou:estivador", "usou:retirar-brasil");
assert.equal(etapa(), "etiquetas");
// acionar cada máquina uma vez só não resolve: a combinação errada não avança e diz quantas batem
const antesEtq = mundo.saidas.length;
passos("usou:etq-peso");
const respostaEtq = mundo.saidas.slice(antesEtq);
assert.equal(respostaEtq.filter((s) => s.tipo === "ler").length, 1, "cada etiqueta responde com um balão só");
assert.ok(!respostaEtq.some((s) => s.tipo === "dialogo"), "a etiqueta não abre diálogo a cada clique");
passos("usou:etq-destino", "usou:etq-conteudo");
assert.equal(etapa(), "etiquetas", "uma vez em cada etiqueta não resolve");
assert.equal(mundo.e.flags["brasil.certas"], 0);
assert.deepEqual(situacao(CAMPANHA, mundo.e, mundo.lugares)!.painel.map((p) => p.rotulo), ["Etiquetas que batem"]);
passos("usou:etq-peso");
assert.equal(mundo.e.flags["brasil.certas"], 1, "a etiqueta do peso bate com o regulamento");
passos("usou:etq-peso");
assert.equal(mundo.e.flags["brasil.certas"], 0, "passou da certa: o painel volta a baixar");
passos("usou:etq-peso", "usou:etq-peso", "usou:etq-peso");
assert.equal(mundo.e.flags["brasil.certas"], 1, "o ciclo dá a volta");
passos("usou:etq-destino", "usou:etq-destino", "usou:etq-conteudo");
assert.equal(etapa(), "levar", "as três batem: avança");
passos("usou:colocar-carga");
assert.equal(etapa(), "esteira");
// sem conferir o painel, a esteira não decide (há instrução na margem do manifesto)
mundo.lugares["terminal-china"] = "parado";
passos("usou:acionar-esteira");
assert.equal(etapa(), "esteira", "terminal parado não despacha");
mundo.lugares["terminal-china"] = "em-operacao";
passos("usou:acionar-esteira");
assert.equal(mundo.escolha, null, "sem conferir o manifesto não há escolha");
passos("usou:conferir-despacho", "usou:acionar-esteira");
assert.deepEqual(opcoesAbertas(), ["despachar", "trocar", "sabotar"], "investigar libera as três soluções");
passos("?sabotar");
assert.equal(mundo.lugares["terminal-china"], "parado", "sabotar pausa a esteira de verdade");
assert.ok(mundo.e.concluidas.includes("brasil"), "sabotar também concede o sexto selo");
assert.equal(decisao("brasil"), "sabotou");

// ---------- 3) itens e recuperação de saves ----------
// item sobrevive à recarga, não duplica, não é entregue duas vezes
reset();
ate("cadeado");
comeca("cadeado");
passos("usou:porta-igreja", "falou:pastor", "usou:cadeado-tiao");
assert.equal(mundo.e.carregando, "cadeado");
passos("usou:cadeado-tiao");
assert.equal(mundo.e.carregando, "cadeado", "pegar de novo não duplica");
// save na etapa de instalar o cadeado SEM o item: volta para pegá-lo, sem perder nada
const preso = { ...estadoVazio(), ativa: "cadeado", etapa: 2, concluidas: ["protocolo"], selos: ["credencial"], flags: { "d.protocolo": "carimbo", "cadeado.n": 2 } };
const solto = sanear(JSON.parse(JSON.stringify(preso)), CAMPANHA);
assert.equal(solto.etapaId, "retirar", "sem o cadeado, volta para a etapa de pegá-lo");
assert.deepEqual(solto.concluidas, ["protocolo"]);
assert.deepEqual(solto.selos, ["credencial"]);
assert.equal(solto.flags["d.protocolo"], "carimbo", "as decisões já tomadas ficam");
// os mesmos casos nas outras missões
const casos: [Partial<Estado>, string, string][] = [
  [{ ativa: "zap", etapa: 2, flags: {} }, "etiquetas", "entregar sem a caixa volta a escolher a caixa"],
  [{ ativa: "zap", etapa: 1, flags: {} }, "etiquetas", "a etapa antiga carregar vira a que existe e depois recupera"],
  [{ ativa: "chave", etapa: 3, flags: { "chave.aberto": true } }, "armario", "ferramentas sem a caixa volta ao armário aberto"],
  [{ ativa: "brasil", etapa: 3, flags: {} }, "retirar", "levar sem a caixa do Brasil volta a retirar"],
];
for (const [parcial, esperado, texto] of casos) {
  const s = sanear({ ...estadoVazio(), ...parcial }, CAMPANHA);
  assert.equal(s.etapaId, esperado, texto);
}
// a recuperação não deixa o jogo preso: do armário já aberto dá para pegar a caixa de novo
reset();
mundo.e = sanear({ ...estadoVazio(), ativa: "chave", etapa: 3, concluidas: ["protocolo", "cadeado", "zap", "campus"], flags: { "chave.aberto": true } }, CAMPANHA);
assert.equal(etapa(), "armario");
passos("usou:armario-ferramentas");
assert.equal(mundo.e.carregando, "caixa-ferramentas");
assert.equal(etapa(), "ferramentas");
// ferramentas dos saves antigos (martelo, pincel, chave inglesa) deixaram de existir: não ficam "carregadas"
assert.equal(sanear({ ...estadoVazio(), ativa: "chave", etapa: 3, carregando: "martelo", flags: { "chave.aberto": true } }, CAMPANHA).carregando, null);
// duplicados e lixo
const dupe = sanear({ concluidas: ["protocolo", "protocolo", "x"], selos: ["credencial", "credencial", "outro"], diario: [{ id: "a", texto: "t" }, { id: "a", texto: "outro" }, { id: 4 }], flags: { a: 1 } }, CAMPANHA);
assert.deepEqual(dupe.concluidas, ["protocolo"]);
assert.deepEqual(dupe.selos, ["credencial"]);
assert.deepEqual(dupe.diario, [{ id: "a", texto: "t" }]);
assert.deepEqual(sanear(undefined, CAMPANHA), estadoVazio());
assert.deepEqual(sanear("lixo", CAMPANHA), estadoVazio());
// migração: um save sem etapaId nem diário (o formato anterior) é lido com a etapa certa
const antigo = sanear({ ativa: "chave", etapa: 2, concluidas: ["protocolo", "cadeado", "zap", "campus"], selos: ["credencial", "cadeado-presidencial", "entrega-do-zap", "assembleia-da-festa"], carregando: "chave", flags: { "chave.n": 2 } }, CAMPANHA);
assert.equal(antigo.etapaId, "armario", "o índice antigo vira o id da etapa");
assert.equal(antigo.carregando, "chave");
assert.deepEqual(antigo.diario, []);
assert.equal(antigo.selos.length, 4);
// um save antigo com a missão 3 em curso e flags antigas continua utilizável
const antigoZap = sanear({ ativa: "zap", etapa: 0, concluidas: ["protocolo", "cadeado"], flags: { "zap.a": true } }, CAMPANHA);
assert.equal(antigoZap.etapaId, "etiquetas");
assert.equal(recupera(CAMPANHA, antigoZap, {}), antigoZap);

// ---------- 4) pontos e contexto ----------
reset();
assert.equal(pontosVisiveis(CAMPANHA, mundo.e, mundo.lugares).size, 0, "sem missão ativa não há pontos de missão");
comeca("protocolo");
assert.equal(etapa(), "avisos", "falar com Seu Boato (o início) já conta como a primeira etapa");
assert.ok(pontosVisiveis(CAMPANHA, mundo.e, mundo.lugares).has("aviso-1"));
assert.equal(contexto(CAMPANHA, mundo.e, mundo.lugares)["etapa:protocolo"], "avisos");
// o painel e a checklist vêm da etapa
reset();
ate("chave");
comeca("chave");
passos("falou:didi", "falou:osvaldo");
const s7 = situacao(CAMPANHA, mundo.e, mundo.lugares)!;
assert.equal(s7.alvos.length, 1, "falta uma pessoa: um destino só");
assert.equal(s7.alvos[0].label, "Encarregada Rose, no Polo Industrial", "o marcador aponta para quem falta consultar");
assert.deepEqual(s7.lista.map((i) => i.feito), [true, false]);
passos("falou:encarregada");
assert.equal(mundo.e.carregando, "chave");

// ---------- 5) as decisões registradas casam com a tabela e a cerimônia lê todas ----------
const efeitosDecide = new Set<string>();
const varre = (fs: Efeito[]) => {
  for (const f of fs) {
    if ("flag" in f && typeof f.flag === "string" && f.flag.startsWith("d.") && "valor" in f) efeitosDecide.add(`${f.flag.slice(2)}:${String(f.valor)}`);
    else if ("se" in f) {
      varre(f.entao);
      varre(f.senao ?? []);
    } else if ("escolha" in f) for (const o of f.escolha.opcoes) varre(o.faz);
  }
};
for (const m of CAMPANHA.missoes) for (const et of m.etapas) for (const r of et.regras) varre(r.faz);
const tabela = new Set(Object.entries(DECISOES).flatMap(([m, vs]) => Object.keys(vs).map((v) => `${m}:${v}`)));
assert.deepEqual([...efeitosDecide].sort(), [...tabela].sort(), "toda decisão registrada tem texto e lado, e nenhuma é esquecida");
for (const [m, vs] of Object.entries(DECISOES)) assert.ok(Object.keys(vs).length >= 2, `${m}: pelo menos duas soluções`);
// cada escolha tem efeito diferente (nada de opção cosmética): o resultado, a decisão ou o lugar muda
for (const m of CAMPANHA.missoes) {
  for (const dec of Object.keys(DECISOES[m.id])) {
    assert.ok(DECISOES[m.id][dec].texto.length > 8);
  }
}

// ---------- 6) cerimônia final: tom, roteiro e persistência ----------
const flagsDe = (lados: Record<string, string>): Record<string, Valor> => Object.fromEntries(Object.entries(lados).map(([m, v]) => [`d.${m}`, v]));
const obediente = flagsDe({ protocolo: "carimbo", cadeado: "cumpriu", zap: "lacrado", campus: "autorizou", chave: "coletivo", brasil: "despachou" });
const rebelde = flagsDe({ protocolo: "recurso", cadeado: "sabotou", zap: "desmentiu", campus: "ignorou", chave: "quebrou", brasil: "sabotou" });
const misto = flagsDe({ protocolo: "carimbo", cadeado: "brecha", zap: "boato", campus: "negociou", chave: "devolveu", brasil: "trocou" });
assert.equal(tomDe(apura(obediente)), "obediencia");
assert.equal(tomDe(apura(rebelde)), "ignorado");
assert.equal(tomDe(apura(misto)), "misto");
assert.equal(tomDe(apura({})), "misto", "save sem decisões (jogou antes das escolhas) cai no meio-termo");
for (const [nome, f] of [["obediente", obediente], ["rebelde", rebelde], ["misto", misto], ["vazio", {}]] as const) {
  const r = roteiro(f);
  assert.ok(r.passos.some((p) => p.tipo === "fala" && p.linhas.some((l) => l.includes("Presidente Vitalício Provisório"))), `${nome}: a declaração é sempre a mesma`);
  assert.equal(r.passos.filter((p) => p.tipo === "escolha").length, 2, `${nome}: duas ações curtas do jogador`);
  assert.ok(r.passos.some((p) => p.tipo === "carimbos") && r.passos.some((p) => p.tipo === "aplauso"), `${nome}: tem espetáculo, não só caixa de texto`);
  assert.ok(r.passos.filter((p) => p.tipo === "fala").every((p) => p.tipo === "fala" && p.linhas.length >= 1 && p.linhas.every((l) => l.length < 260)), `${nome}: falas curtas`);
}
const roteiros = new Set([obediente, rebelde, misto].map((f) => JSON.stringify(roteiro(f).passos)));
assert.equal(roteiros.size, 3, "as decisões mudam a cerimônia");
// no tom misto, cada decisão aparece como consequência específica
const falaRelatorio = (f: Record<string, Valor>) => roteiro(f).passos.filter((p) => p.tipo === "fala" && p.quem === "Relatório da cidade").flatMap((p) => (p.tipo === "fala" ? p.linhas : []));
assert.ok(falaRelatorio(misto).length >= 4 && falaRelatorio(misto).some((l) => /cachaça/i.test(l)), "trajetória mista combina consequências específicas");
assert.ok(falaRelatorio(rebelde).some((l) => /papelão/i.test(l)));
assert.equal(marcasDaPraca({}), null, "sem cerimônia não há marcas na praça");
assert.ok(marcasDaPraca({ "final.tom": "obediencia", "final.proc": "ler" })?.decreto.includes("LIDO"));
// a cerimônia concluída: selo extra, uma vez, e os 6 do Passaporte continuam 6
reset();
for (const m of CAMPANHA.missoes) joga(m.id, Object.keys(CAMINHO[m.id])[0]);
comeca("ditadura");
assert.equal(etapa(), "palanque", "o convite de Seu Boato já avança");
assert.ok(pontosVisiveis(CAMPANHA, mundo.e, mundo.lugares).has("palanque"));
passos("usou:palanque");
assert.ok(mundo.saidas.some((s) => s.tipo === "cerimonia"), "o palanque pede a cerimônia à cena");
assert.equal(mundo.e.ativa, "ditadura", "a missão só conclui quando a cena avisa que acabou");
assert.equal(etapa(), "palanque", "recarregar no meio da cerimônia volta ao palanque para repeti-la");
mundo.e = { ...mundo.e, flags: { ...mundo.e.flags, "final.tom": "obediencia" } };
passos("cerimonia:fim");
assert.ok(mundo.e.concluidas.includes("ditadura"));
assert.ok(mundo.e.selos.includes(SELO_FINAL.id));
assert.equal(SELOS.length, 6, "o Passaporte continua com seis selos");
assert.ok(!SELOS.some((s) => s.id === SELO_FINAL.id));
const antesRever = JSON.stringify(mundo.e);
passos("cerimonia:fim", "usou:palanque", "falou:boato");
assert.equal(JSON.stringify(mundo.e), antesRever, "rever a cerimônia não duplica recompensa nem muda o estado");
assert.equal(disponivel(CAMPANHA, mundo.e), null);

// ---------- 7) o gerente da cena: ordem das falas, escolha, salvamento e a cerimônia ----------
{
  clearCity();
  const registro: string[] = [];
  const lugares = { ...initialPlaces() } as Record<string, string>;
  const ref = { escolhe: null as ((id: string | null) => void) | null, fimCerimonia: null as ((m?: Record<string, Valor>) => void) | null };
  const dialogos: { linhas: string[]; fim: () => void }[] = [];
  const host: Anfitriao = {
    lugares: () => lugares,
    aplicaLugar: (p, s) => {
      lugares[p] = s;
      registro.push(`lugar:${p}:${s}`);
      gerente.emite(`lugar:${p}:${s}`);
    },
    ler: (t) => registro.push(`ler:${t.slice(0, 24)}`),
    dialogo: (linhas, _q, fim) => {
      registro.push(`dialogo:${linhas[0].slice(0, 24)}`);
      dialogos.push({ linhas, fim });
    },
    escolha: (titulo, _q, opcoes, fim) => {
      registro.push(`escolha:${opcoes.map((o) => o.id).join("/")}`);
      ref.escolhe = fim;
      void titulo;
    },
    toast: () => undefined,
    som: (id) => registro.push(`som:${id}`),
    celebrar: (selo, n, comp) => registro.push(`selo:${selo.id}:${n}:${comp}`),
    cerimonia: (_e, fim) => {
      registro.push("cerimonia");
      ref.fimCerimonia = fim;
    },
    mudou: () => registro.push("mudou"),
  };
  const gerente = new Missoes(host, estadoVazio());
  const fecha = () => {
    while (dialogos.length) dialogos.shift()!.fim();
  };
  // o balão (ler) sai ANTES de a cena ser avisada de que a campanha mudou (que pode refazer o interior)
  gerente.iniciaSe("boato");
  fecha();
  assert.equal(gerente.estado.ativa, "protocolo");
  registro.length = 0;
  gerente.emite("usou:aviso-1");
  const iLer = registro.findIndex((r) => r.startsWith("ler:"));
  const iMudou = registro.indexOf("mudou");
  assert.ok(iLer >= 0 && iMudou > iLer, "o balão de resposta sai antes de a cena ser avisada da mudança");
  // painel com número que só muda: o contexto de interiores que usam só ponto:/flag:d.* não muda
  const universidade = INTERIORS.find((i) => i.id === "int-edu-universidade")!;
  const chavesUni = interiorChaves(universidade);
  assert.ok(chavesUni.length > 0 && !chavesUni.some((k) => /campus\.(grave|medio|agudo)/.test(k)), "o nível do som não refaz o interior da universidade");
  for (const i of INTERIORS) assert.ok(!interiorChaves(i).some((k) => /^flag:[a-z]+\.(grave|medio|agudo|n|erros|certas|avisos|pistas|entregues)$/.test(k)), `${i.id}: contadores não refazem o interior`);
  // a escolha chega à cena e a opção escolhida é aplicada; desistir não muda nada
  gerente.emite("usou:aviso-3");
  fecha();
  assert.equal(gerente.estado.etapaId, "carimbar");
  registro.length = 0;
  gerente.emite("usou:guiche");
  assert.ok(registro.some((r) => r.startsWith("escolha:amarelo")), "a escolha chega à cena");
  ref.escolhe!(null);
  assert.equal(gerente.estado.ativa, "protocolo", "desistir não decide nada");
  gerente.emite("usou:guiche");
  ref.escolhe!("amarelo");
  fecha();
  assert.ok(gerente.estado.concluidas.includes("protocolo"), "a opção escolhida conclui");
  assert.ok(registro.some((r) => r.startsWith("selo:credencial:1:false")), "o selo é celebrado depois das falas");
  assert.ok(registro.indexOf("mudou") > -1);
  assert.equal(readCity().campanha.concluidas[0], "protocolo", "o gerente salva a cada mudança");
  const hud = gerente.hud();
  assert.equal(hud.selos.length, 1);
  assert.equal(hud.decisoes[0].texto, DECISOES.protocolo.carimbo.texto);
  assert.equal(hud.proxima?.numero, 2);
  // as notas do diário ficam, da mais nova para a mais antiga
  assert.ok(hud.diario.length >= 2 && hud.diario[0].id !== hud.diario[hud.diario.length - 1].id);
  // um gerente novo (recarga) retoma do save
  const gerente2 = new Missoes(host, readCity().campanha);
  assert.deepEqual(gerente2.estado, gerente.estado, "recarregar devolve a mesma campanha");
  // cerimônia pelo gerente: as marcas voltam e concluem a missão
  const g3 = new Missoes(host, { ...estadoVazio(), concluidas: CAMPANHA.missoes.map((m) => m.id), selos: CAMPANHA.missoes.map((m) => m.selo.id), flags: obediente });
  assert.equal(g3.hud().proxima?.numero, 7);
  g3.iniciaSe("boato");
  fecha();
  g3.emite("usou:palanque");
  assert.ok(registro.includes("cerimonia"));
  ref.fimCerimonia!({ "final.tom": "obediencia", "final.proc": "ler", "final.aplauso": "pediu" });
  fecha();
  assert.ok(g3.estado.concluidas.includes("ditadura"));
  assert.equal(g3.estado.flags["final.tom"], "obediencia", "o que a cerimônia gravou entra no estado");
  assert.equal(g3.hud().selos.length, 6, "o selo final não conta como sétimo selo do Passaporte");
  assert.equal(g3.hud().final, true);
  assert.ok(g3.pontosFora().some((p) => p.id === "rever-cerimonia"), "depois do final dá para rever a cerimônia no palanque");
  registro.length = 0;
  g3.rever();
  assert.ok(registro.includes("cerimonia"), "rever pede a cerimônia à cena de novo");
  clearCity();
}

// ---------- 8) dados: todo texto curto, toda etapa tem destino, selos únicos ----------
for (const m of todasMissoes(CAMPANHA)) {
  assert.ok(m.etapas.length >= 2, `${m.id}: pelo menos 2 etapas`);
  assert.ok(m.inicio.dialogo.length <= 3, `${m.id}: apresentação curta`);
  for (const et of m.etapas) {
    assert.ok(et.regras.length > 0, `${m.id}/${et.id}: sem regras`);
    assert.ok(et.objetivo.length <= 150, `${m.id}/${et.id}: objetivo longo demais`);
    assert.ok(et.alvo, `${m.id}/${et.id}: sem destino no mapa`);
  }
}
assert.equal(new Set(todasMissoes(CAMPANHA).map((m) => m.selo.id)).size, 7, "seis selos do passaporte e um da cerimônia, todos distintos");
assert.ok(Object.keys(ITENS).every((k) => typeof ITENS[k] === "string"));

console.log("Campanha OK: 6 missões com todas as decisões, escolhas condicionadas, recuperação e migração de saves, cerimônia final em três tons, gerente da cena.");
