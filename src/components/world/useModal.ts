"use client";

import { useEffect, type RefObject } from "react";

const FOCAVEL = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Foco de um painel modal (mapa, passaporte, diálogo, escolha): ao abrir, o foco vai para o primeiro
 * controle (ou para o que tiver `data-autofoco`), Tab fica dentro do painel e, ao fechar, o foco volta
 * para quem o tinha antes. Assim teclado e leitor de tela nunca ficam presos atrás do painel.
 */
export function useModalFoco(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const raiz = ref.current;
    if (!raiz) return;
    const anterior = document.activeElement as HTMLElement | null;
    const alvo = raiz.querySelector<HTMLElement>("[data-autofoco]") ?? raiz.querySelector<HTMLElement>(FOCAVEL);
    alvo?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const itens = [...raiz.querySelectorAll<HTMLElement>(FOCAVEL)].filter((x) => x.offsetParent !== null || x === document.activeElement);
      if (!itens.length) return;
      const primeiro = itens[0];
      const ultimo = itens[itens.length - 1];
      const ativo = document.activeElement;
      if (!raiz.contains(ativo)) {
        e.preventDefault();
        primeiro.focus();
      } else if (e.shiftKey && ativo === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && ativo === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    };
    raiz.addEventListener("keydown", onKey);
    return () => {
      raiz.removeEventListener("keydown", onKey);
      // o foco volta para o botão que abriu o painel (se ele ainda existe)
      if (anterior && document.contains(anterior)) anterior.focus({ preventScroll: true });
    };
  }, [ref]);
}
