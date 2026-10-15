import type { Metadata } from "next";
import Game from "@/components/Game";

export const metadata: Metadata = {
  title: "Pânico de Estado — episódios",
};

/** Versão anterior do jogo, em episódios encenados. */
export default function Episodios() {
  return <Game />;
}
