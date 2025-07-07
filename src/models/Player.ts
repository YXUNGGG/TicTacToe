import { GameController } from "../engine";
import { symbolType } from "../types/GameContext";
import { chance, checkBoardState, getRandom } from "../utils/utils";

const BotNames = ["Ken Kar$on", "Destroy Lonely", "OsamaSlon", "Kai Angel"];
type BotPresets = "master" | "advansed" | "middle";

export type BoardType = (symbolType | number)[];
type MoveType = {index: number | symbolType, score: number}

export class Player {
  public name: string;
  public isBot = false;
  public score = 0; // for more than 1 games

  constructor(name: string, isBot: boolean) {
    this.isBot = isBot
    this.name = name;
  }
}

export class Ai extends Player {
  private AiSymbol: symbolType;
  private HuSymbol: symbolType;                      // human symbol

  public preset: BotPresets;

  private advancedLvlChance = 0.65;
  private middleLvlChance = 0.35;

  private funcCalls = 0;                             // for logging

  constructor(aiSymol: symbolType, preset: BotPresets = "master") {
    super(`Bot ${getRandom(0, BotNames.length - 1)}`, true);
    this.AiSymbol = aiSymol;
    this.HuSymbol = this.AiSymbol === "X" ? "O" : "X";

    this.preset = preset;

    //this.Board = board.map((cell, idx) => cell.symbol === null ? idx : cell.symbol);
  }

  public AiTurnByLevel(board: BoardType, preset: BotPresets) {
    // console.log("board in aifunc:", board);
    const optimalMoves = this.getOptimalMoves(board, preset) as number[];
    return optimalMoves[getRandom(0, optimalMoves.length - 1)];
  }

  private getOptimalMoves(board: BoardType, preset: BotPresets) {
    const movesArray = this.minimax(board) as MoveType[];
    const allOptions = movesArray.sort((a, b) => b.score - a.score);
    
    const optimalMoves = allOptions.filter((move, _, arr) => move.score === arr[0].score).map(({index}) => index);
    const suboptimal = allOptions.slice(optimalMoves.length).map(({index}) => index);

    let isChanceProc;

    if (preset === "master") isChanceProc = chance(1);
    else if (preset === "advansed") isChanceProc = chance(this.advancedLvlChance);
    else if (preset === "middle") isChanceProc = chance(this.middleLvlChance);
    
    return isChanceProc ? optimalMoves : suboptimal;
    // .reduce((acc, move) => {
    //   if (move > acc) {
    //     optimalMoves.length = 0;
    //     optimalMoves.push(move);
    //   }

    //   if (move === acc) optimalMoves.push(move);

    //   return move;
    // }, -10);

    //return optimalMoves;
    // здесь возвращать либо ядерно оптимально либо рандом
  }

  private bestMove(moves: MoveType[], player: symbolType) {
    let bestMove: number;

    if (player === this.AiSymbol) {
      let bestScore = -100;
  
      moves.forEach((move, moveIdx) => {
        if (move.score > bestScore) {
          bestScore = move.score;
          bestMove = moveIdx;
        }
      });
    } else {
      let bestScore = 100;
      
      moves.forEach((move, moveIdx) => {
        if (move.score < bestScore) {
          bestScore = move.score;
          bestMove = moveIdx;
        }
      });
    }

    return bestMove!;
  }

  private minimax(newBoard: BoardType, player: symbolType = this.AiSymbol, depth = -2) {
    
    this.funcCalls++;
    depth++;
    
    let availableSpots = GameController.emptyIndices(newBoard);
    
    if (checkBoardState(newBoard, this.HuSymbol).length) {
      return { score: -10 + depth };
    } else if (checkBoardState(newBoard, this.AiSymbol).length) {
      return { score: 10 - depth };
    } else if (availableSpots.length === 0) {
      return { score: 0 };
    }
  
    const moves: MoveType[] = [];
  
    availableSpots.forEach((cell) => {
      let move: MoveType = {index: 0, score: 0};
      
      if (cell === undefined || cell === null) return;

      move.index = newBoard[cell];
      newBoard[cell] = player;
      
      if (player == this.AiSymbol) {
        const result = this.minimax(newBoard, this.HuSymbol, depth);
        if (result instanceof Array) return;
        move.score = result.score;
      } else {
        const result = this.minimax(newBoard, this.AiSymbol, depth);
        if (result instanceof Array) return;
        move.score = result.score;
      }
  
      newBoard[cell] = move.index;
  
      moves.push(move);
    });
  
    if (depth === -1) {
      console.log("function calls:", this.funcCalls);
      this.funcCalls = 0;
      
      return moves;
    }

    let currentBestMove = this.bestMove(moves, player);
    return moves[currentBestMove];
  }  
}