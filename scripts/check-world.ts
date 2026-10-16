import { strict as assert } from "node:assert";
import { advance, BRASIL_PARA_CHINA, CAMPUS_LIBERADO, CHICOTE_EXPRESSO, KIT_DO_ZAP, OPERACAO_CADEADO } from "../src/world/mission";
import { clearSave, isDone, markDone, readSave, saveProgress } from "../src/world/save";
import { drainStamina, RUN_DRAIN } from "../src/world/stamina";
import { CAMPANHA, ITENS } from "../src/world/cidade/missoes/campanha";
import { completa, contexto, disponivel, estadoVazio, evento, iniciar, pontosVisiveis, sanear, type Saida } from "../src/world/cidade/missoes/motor";
import { initialPlaces } from "../src/world/cidade/places";
import { clearCity, readCity, saveCampanha, saveHora } from "../src/world/cidade/progress";

// Exercita ações fora de ordem, conclusão única e os eventos necessários em cada boato.
const paths = [
  { mission: OPERACAO_CADEADO, events: [{ type: "talk", npc: "boato" }, { type: "pickup", item: "cadeado" }, { type: "interact", place: "igreja" }] },
  { mission: KIT_DO_ZAP, events: [{ type: "pickup", item: "kits" }, { type: "deliver", npc: "diretora", item: "kits" }] },
  { mission: CAMPUS_LIBERADO, events: [{ type: "talk", npc: "reitora" }, { type: "interact", place: "campus" }] },
  { mission: BRASIL_PARA_CHINA, events: [{ type: "pickup", item: "brasil-caixa" }, { type: "interact", place: "terminal" }] },
  { mission: CHICOTE_EXPRESSO, events: [{ type: "talk", npc: "boato" }, { type: "pickup", item: "chicote" }, { type: "deliver", npc: "patrao", item: "chicote" }] },
] satisfies { mission: typeof OPERACAO_CADEADO; events: Parameters<typeof advance>[2][] }[];

for (const { mission, events } of paths) {
  let step = mission.steps[0].id;
  assert.equal(advance(mission, step, events[events.length - 1]), null, `${mission.id}: não pode pular ao fim`);
  for (const event of events) {
    assert.equal(advance(mission, step, { type: "pickup", item: "item-do-outro-universo" }), null);
    const result = advance(mission, step, event);
    assert.ok(result, `${mission.id}: evento válido deve avançar`);
    step = result.to;
    assert.equal(advance(mission, step, event), null, `${mission.id}: repetir ação não pode avançar`);
  }
  assert.equal(step, mission.finalStep);
}

// O save v1 existente deve sobreviver à campanha nova e ao reset de só um protagonista.
const data = new Map<string, string>();
Object.defineProperty(globalThis, "window", { configurable: true, value: {
  localStorage: { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value), removeItem: (key: string) => data.delete(key) },
} });
const key = "panico-de-estado:mundo:v1";
data.set(key, JSON.stringify({ done: ["flavio:chicote-expresso"] }));
assert.equal(isDone("flavio", CHICOTE_EXPRESSO.id), true);
assert.deepEqual(readSave().progress, {});
saveProgress("lula", OPERACAO_CADEADO.id, "fechar", "cadeado");
assert.equal(readSave().progress.lula?.holding, "cadeado");
assert.equal(isDone("flavio", CHICOTE_EXPRESSO.id), true);
markDone("lula", OPERACAO_CADEADO.id);
markDone("lula", OPERACAO_CADEADO.id);
assert.equal(readSave().done.filter((id) => id === "lula:operacao-cadeado").length, 1);
clearSave("lula");
assert.equal(isDone("lula", OPERACAO_CADEADO.id), false);
assert.equal(isDone("flavio", CHICOTE_EXPRESSO.id), true);
assert.equal(readSave().progress.lula, undefined);
// ---------- campanha de missões da cidade do Lula: progressão, eventos fora de ordem, recarga e recompensa única ----------
{
  const lugares0 = () => ({ ...initialPlaces() }) as Record<string, string>;
  const mundo = { e: estadoVazio(), lugares: lugares0(), saidas: [] as Saida[] };
  const reset = () => {
    mundo.e = estadoVazio();
    mundo.lugares = lugares0();
    mundo.saidas = [];
  };
  /** Dispara um evento como a cena faz: aplica mudanças de lugar e emite o evento de volta. */
  const emite = (ev: string) => {
    const fila = [ev];
    while (fila.length) {
      const r = evento(CAMPANHA, mundo.e, fila.shift()!, mundo.lugares);
      mundo.e = r.estado;
      mundo.saidas.push(...r.saidas);
      for (const s of r.saidas) {
        if (s.tipo === "lugar") {
          mundo.lugares[s.place] = s.estado;
          fila.push(`lugar:${s.place}:${s.estado}`);
        }
      }
      // recarregar a página no meio de qualquer etapa retoma o mesmo estado
      assert.deepEqual(sanear(JSON.parse(JSON.stringify(mundo.e)), CAMPANHA), mundo.e, `recarga fiel após ${ev}`);
    }
  };
  const comeca = (id: string) => {
    const r = iniciar(CAMPANHA, mundo.e, id, mundo.lugares);
    mundo.e = r.estado;
    mundo.saidas.push(...r.saidas);
    assert.equal(mundo.e.ativa, id, `missão ${id} começou`);
  };
  const etapaAtual = () => CAMPANHA.missoes.find((m) => m.id === mundo.e.ativa)?.etapas[mundo.e.etapa].id ?? null;

  const CAMINHOS: Record<string, string[]> = {
    protocolo: ["usou:aviso-1", "usou:aviso-1", "usou:aviso-2", "usou:aviso-3", "usou:form-azul", "usou:carimbo-1", "usou:form-amarelo", "usou:carimbo-1"],
    cadeado: ["usou:porta-igreja", "falou:pastor", "usou:cadeado-tiao", "usou:instalar-cadeado"],
    zap: ["usou:caixa-a", "usou:caixa-b", "usou:caixa-c", "usou:levar-a", "usou:levar-b", "usou:entregar-zap", "usou:entregar-zap", "lugar:deposito-kits:vazio"],
    campus: ["usou:som-grave", "usou:som-grave", "usou:som-agudo", "usou:homologar"],
    chave: ["falou:osvaldo", "falou:encarregada", "usou:armario-ferramentas", "usou:pegar-martelo", "usou:posto-muro", "usou:posto-elevador", "usou:pegar-pincel", "usou:posto-muro", "usou:pegar-chave-inglesa", "usou:posto-prensa"],
    brasil: ["usou:retirar-brasil", "usou:etq-peso", "usou:etq-destino", "usou:etq-conteudo", "usou:colocar-carga", "usou:acionar-esteira", "usou:conferir-despacho", "usou:acionar-esteira"],
  };
  // eventos de outras missões e etapas que nunca podem atrapalhar uma missão em andamento
  const RUIDO = ["usou:caixa-b", "usou:levar-b", "usou:entregar-zap", "usou:posto-prensa", "usou:acionar-esteira", "usou:homologar", "usou:instalar-cadeado", "falou:pastor", "usou:etq-peso", "lugar:terminal-china:parado", "usou:som-medio", "falou:reitora"];

  // 1) a campanha inteira, na ordem, com erros e ruído no meio
  reset();
  assert.equal(disponivel(CAMPANHA, mundo.e)?.id, "protocolo", "a campanha começa pelo Protocolo do Boato");
  for (const m of CAMPANHA.missoes) {
    assert.equal(disponivel(CAMPANHA, mundo.e)?.id, m.id, `a próxima é ${m.id}`);
    // não dá para iniciar duas missões, nem pular uma
    const outra = CAMPANHA.missoes.find((x) => x.id !== m.id && !mundo.e.concluidas.includes(x.id));
    comeca(m.id);
    if (outra) assert.equal(iniciar(CAMPANHA, mundo.e, outra.id, mundo.lugares).estado, mundo.e, "só uma missão ativa por vez");
    const evs = CAMINHOS[m.id];
    for (const [i, ev] of evs.entries()) {
      // ruído antes de cada passo: não muda nada, exceto o que a etapa de fato aceita
      for (const r of RUIDO) {
        const antes = JSON.stringify(mundo.e);
        const aceita = m.etapas[mundo.e.etapa]?.regras.some((x) => x.evento === r);
        if (!aceita) {
          emite(r);
          assert.equal(JSON.stringify(mundo.e), antes, `${r} fora de ordem é ignorado em ${m.id}`);
        }
      }
      emite(ev);
      if (i < evs.length - 1) assert.equal(mundo.e.ativa, m.id, `${m.id} ainda não terminou no passo ${ev}`);
    }
    assert.ok(mundo.e.concluidas.includes(m.id), `${m.id} concluída`);
    assert.equal(mundo.e.ativa, null);
    assert.ok(mundo.e.selos.includes(m.selo.id), `selo de ${m.id}`);
    assert.equal(mundo.e.carregando, null, `${m.id} não deixa item perdido`);
    // recompensa única: repetir o caminho não duplica selo nem reabre a missão
    const antes = JSON.stringify(mundo.e);
    for (const ev of evs) emite(ev);
    assert.equal(JSON.stringify(mundo.e), antes, `${m.id}: repetir eventos depois de concluída não muda nada`);
  }
  assert.equal(mundo.e.selos.length, 6, "seis selos no fim");
  assert.equal(new Set(mundo.e.selos).size, 6);
  assert.ok(completa(CAMPANHA, mundo.e) && disponivel(CAMPANHA, mundo.e) === null);
  assert.equal(mundo.saidas.filter((s) => s.tipo === "concluiu").length, 6, "um sinal de conclusão por missão");
  assert.equal(mundo.saidas.filter((s) => s.tipo === "concluiu" && s.completa).length, 1, "o passaporte completo é anunciado uma vez");

  // 2) lugares que já estavam alterados antes da missão: respeitados, sem recompensa automática
  reset();
  mundo.lugares["igreja-matriz"] = "interditada";
  for (const id of ["protocolo"]) { comeca(id); for (const ev of CAMINHOS[id]) emite(ev); }
  comeca("cadeado");
  for (const ev of CAMINHOS.cadeado) emite(ev);
  assert.equal(mundo.e.flags["cadeado.segunda"], true, "igreja já interditada: vira segunda via");
  assert.equal(mundo.lugares["igreja-matriz"], "interditada");
  assert.ok(!mundo.saidas.some((s) => s.tipo === "lugar" && s.place === "igreja-matriz"), "a segunda via não reescreve o estado do prédio");
  reset();
  mundo.lugares["igreja-matriz"] = "aberta";
  for (const id of ["protocolo", "cadeado"]) { comeca(id); for (const ev of CAMINHOS[id]) emite(ev); }
  assert.equal(mundo.lugares["igreja-matriz"], "interditada", "igreja aberta: a operação interdita pelo sistema normal");
  assert.equal(mundo.e.flags["cadeado.segunda"], false);
  // reabrir a igreja depois não desfaz a missão
  mundo.lugares["igreja-matriz"] = "aberta";
  emite("lugar:igreja-matriz:aberta");
  assert.ok(mundo.e.concluidas.includes("cadeado"), "missão concluída continua concluída");

  // depósito já vazio: a entrega repõe, a alavanca distribui
  reset();
  mundo.lugares["deposito-kits"] = "vazio";
  for (const id of ["protocolo", "cadeado"]) { comeca(id); for (const ev of CAMINHOS[id]) emite(ev); }
  comeca("zap");
  for (const ev of ["usou:caixa-a", "usou:caixa-b", "usou:caixa-c", "usou:levar-b", "usou:entregar-zap"]) emite(ev);
  assert.equal(mundo.lugares["deposito-kits"], "abastecido", "depósito vazio é reposto pela entrega");
  assert.equal(mundo.e.ativa, "zap", "a distribuição ainda é preciso acionar");
  emite("lugar:deposito-kits:vazio");
  assert.ok(mundo.e.concluidas.includes("zap"));
  // depósito já abastecido: a entrega não mexe no estoque
  reset();
  for (const id of ["protocolo", "cadeado"]) { comeca(id); for (const ev of CAMINHOS[id]) emite(ev); }
  comeca("zap");
  for (const ev of ["usou:caixa-a", "usou:caixa-b", "usou:caixa-c", "usou:levar-b", "usou:entregar-zap"]) emite(ev);
  assert.equal(mundo.lugares["deposito-kits"], "abastecido");

  // universidade em expediente normal: a homologação liga a festa; com festa funcionando, só regulariza
  for (const [antes, depois] of [["normal", "liberou-geral"], ["liberou-geral", "liberou-geral"]] as const) {
    reset();
    mundo.lugares.universidade = antes;
    for (const id of ["protocolo", "cadeado", "zap"]) { comeca(id); for (const ev of CAMINHOS[id]) emite(ev); }
    mundo.lugares.universidade = antes;
    comeca("campus");
    for (const ev of CAMINHOS.campus) emite(ev);
    assert.equal(mundo.lugares.universidade, depois, `universidade ${antes} → ${depois}`);
    assert.ok(mundo.e.concluidas.includes("campus"));
  }
  // alvará errado não conclui e dá para corrigir
  reset();
  for (const id of ["protocolo", "cadeado", "zap"]) { comeca(id); for (const ev of CAMINHOS[id]) emite(ev); }
  comeca("campus");
  for (const ev of ["usou:som-medio", "usou:som-grave", "usou:som-agudo"]) emite(ev);
  assert.equal(etapaAtual(), "som", "combinação errada não avança");
  for (const ev of ["usou:som-medio", "usou:som-medio", "usou:som-grave", "usou:som-agudo", "usou:som-agudo", "usou:som-agudo", "usou:som-grave", "usou:som-grave"]) emite(ev);
  assert.ok(["som", "homologar"].includes(etapaAtual() ?? ""));

  // terminal parado: a esteira só aciona depois de religar pelo controle existente
  reset();
  for (const id of ["protocolo", "cadeado", "zap", "campus", "chave"]) { comeca(id); for (const ev of CAMINHOS[id]) emite(ev); }
  comeca("brasil");
  mundo.lugares["terminal-china"] = "parado";
  for (const ev of ["usou:retirar-brasil", "usou:etq-peso", "usou:etq-destino", "usou:etq-conteudo", "usou:colocar-carga", "usou:conferir-despacho", "usou:acionar-esteira"]) emite(ev);
  assert.equal(etapaAtual(), "esteira", "terminal parado: não despacha");
  mundo.lugares["terminal-china"] = "em-operacao";
  emite("usou:acionar-esteira");
  assert.ok(mundo.e.concluidas.includes("brasil"), "religado, a esteira conclui");

  // 3) item: carregar não some, não entrega duas vezes, não pega outro com a mão ocupada
  reset();
  for (const id of ["protocolo"]) { comeca(id); for (const ev of CAMINHOS[id]) emite(ev); }
  comeca("cadeado");
  for (const ev of ["usou:porta-igreja", "falou:pastor", "usou:cadeado-tiao"]) emite(ev);
  assert.equal(mundo.e.carregando, "cadeado");
  assert.equal(sanear(JSON.parse(JSON.stringify(mundo.e)), CAMPANHA).carregando, "cadeado", "o item sobrevive à recarga");
  emite("usou:cadeado-tiao");
  assert.equal(mundo.e.carregando, "cadeado", "pegar de novo não duplica");
  emite("usou:instalar-cadeado");
  assert.equal(mundo.e.carregando, null);
  assert.equal(mundo.e.selos.filter((s) => s === "cadeado-presidencial").length, 1);
  reset();
  for (const id of ["protocolo", "cadeado", "zap", "campus"]) { comeca(id); for (const ev of CAMINHOS[id]) emite(ev); }
  comeca("chave");
  for (const ev of ["falou:osvaldo", "falou:encarregada", "usou:armario-ferramentas", "usou:pegar-martelo", "usou:pegar-pincel"]) emite(ev);
  assert.equal(mundo.e.carregando, "martelo", "com a mão ocupada não dá para pegar outra ferramenta");
  emite("usou:posto-muro");
  assert.equal(mundo.e.carregando, "martelo", "ferramenta errada no posto não é consumida");
  assert.equal(Number(mundo.e.flags["chave.entregues"] ?? 0), 0);

  // 4) pontos e contexto: o que aparece em cada etapa
  reset();
  assert.equal(pontosVisiveis(CAMPANHA, mundo.e, mundo.lugares).size, 0, "sem missão ativa não há pontos de missão");
  comeca("protocolo");
  assert.equal(etapaAtual(), "avisos", "falar com Seu Boato (o início) já conta como a primeira etapa");
  assert.ok(pontosVisiveis(CAMPANHA, mundo.e, mundo.lugares).has("aviso-1"));
  assert.equal(contexto(CAMPANHA, mundo.e, mundo.lugares)["etapa:protocolo"], "avisos");
  assert.equal(contexto(CAMPANHA, mundo.e, mundo.lugares)["missao:protocolo"], "ativa");

  // 5) saves antigos e corrompidos
  assert.deepEqual(sanear(undefined, CAMPANHA), estadoVazio());
  assert.deepEqual(sanear("lixo", CAMPANHA), estadoVazio());
  const sujo = sanear({ ativa: "nao-existe", etapa: 99, concluidas: ["protocolo", "x", 3], selos: [], carregando: "nada", flags: { a: 1, b: { c: 1 } } }, CAMPANHA);
  assert.deepEqual(sujo.concluidas, ["protocolo"]);
  assert.equal(sujo.ativa, null);
  assert.equal(sujo.carregando, null);
  assert.deepEqual(sujo.selos, ["credencial"], "missão concluída sempre tem o selo");
  assert.deepEqual(sujo.flags, { a: 1 });
  assert.equal(sanear({ ativa: "zap", etapa: 99, concluidas: [] }, CAMPANHA).etapa, 0, "etapa fora do intervalo volta ao começo da missão");

  // 6) salvamento da cidade: a campanha vive no progresso da cidade, separada do Flávio, e o reinício limpa só ela
  data.set("panico-de-estado:mundo:v1", JSON.stringify({ done: ["flavio:chicote-expresso"] }));
  clearCity();
  assert.deepEqual(readCity().campanha, estadoVazio(), "save antigo sem campanha começa vazio");
  const parcial = { ...estadoVazio(), ativa: "cadeado", etapa: 1, concluidas: ["protocolo"], selos: ["credencial"], carregando: null };
  saveCampanha(parcial);
  saveHora(600);
  assert.deepEqual(readCity().campanha, parcial, "a campanha salva é a que volta");
  assert.equal(readCity().hora, 600, "salvar a campanha não perde a hora");
  data.set("panico-de-estado:cidade-lula:v1", JSON.stringify({ places: {}, discovered: [], visited: [], waypoint: null }));
  assert.deepEqual(readCity().campanha, estadoVazio(), "progresso antigo sem campanha continua válido");
  saveCampanha(parcial);
  clearCity();
  assert.deepEqual(readCity().campanha, estadoVazio(), "reiniciar este Brasil limpa a campanha");
  assert.equal(isDone("flavio", CHICOTE_EXPRESSO.id), true, "o progresso do Flávio não é tocado");
  // armazenamento bloqueado não quebra
  assert.doesNotThrow(() => readCity());

  // 7) toda etapa tem regras, destino e texto curto; todo selo é único
  for (const m of CAMPANHA.missoes) {
    assert.ok(m.etapas.length >= 3, `${m.id}: pelo menos 3 etapas`);
    assert.ok(m.inicio.dialogo.length <= 3, `${m.id}: apresentação curta`);
    for (const et of m.etapas) {
      assert.ok(et.regras.length > 0, `${m.id}/${et.id}: sem regras`);
      assert.ok(et.objetivo.length <= 120, `${m.id}/${et.id}: objetivo longo demais`);
      assert.ok(et.alvo, `${m.id}/${et.id}: sem destino no mapa`);
    }
  }
  assert.equal(new Set(CAMPANHA.missoes.map((m) => m.selo.id)).size, 6, "seis selos distintos");
  assert.ok(Object.keys(ITENS).every((k) => typeof ITENS[k] === "string"));
}

for (const corrupt of ["null", "{", "[]", '{"done":17,"progress":{"lula":{"step":3}}}']) {
  data.set(key, corrupt);
  assert.deepEqual(readSave(), { done: [], progress: {} });
}
Object.defineProperty(window, "localStorage", { get: () => { throw new Error("armazenamento bloqueado"); } });
assert.deepEqual(readSave(), { done: [], progress: {} });
assert.doesNotThrow(() => { markDone("lula", OPERACAO_CADEADO.id); saveProgress("lula", "x", "y", null); clearSave("lula"); });

assert.equal(drainStamina(100, 60, true), 0, "energia não fica negativa");
assert.ok(100 / RUN_DRAIN >= 12, "a barra cheia permite pelo menos 12 s de corrida");
assert.equal(drainStamina(0, 10, false), 0, "caminhada continua disponível sem energia");
assert.equal(drainStamina(80, 10, false), 80, "andar e dirigir não gastam energia");
assert.equal(drainStamina(100, 1, true), drainStamina(drainStamina(100, 0.5, true), 0.5, true), "dreno independente da taxa de quadros");
console.log("Mundo OK: cinco missões, ações fora de ordem, progresso, saves separados e energia; campanha de seis missões com recarga, eventos fora de ordem e recompensa única.");
