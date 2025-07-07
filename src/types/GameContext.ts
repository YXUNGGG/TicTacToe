import { GameController } from "../engine";

export type symbolType = "X" | "O";
export type cellType = symbolType | null;

export type selectedCells = {"X": number[], "O": number[]}

// export type GameCtxType = {
//   EngineInstance: GameController | null;
// }

export type EngineCtxType = {
  EngineInstance: GameController | null;
}