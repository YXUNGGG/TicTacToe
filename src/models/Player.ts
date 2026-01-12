import { GameController } from "../engine";
import { symbolType } from "../types/GameContext";
import { chance, checkBoardState, getRandom, getRandomElement } from "../utils/utils";

const BotNames = [
  "Rat", "Rabbit", "Camel", "Donkey",
  "Ferret", "Badger", "Walrus", "Tiger",
  "Hippo", "Frog", "Zebra", "Cow", "Crab"
];

const BotLevelChances = {
  hard: 0.9,
  medium: 0.60,
  easy: 0.35
}

export type BotPresets = "hard" | "medium" | "easy";

export type BoardType = (symbolType | number)[];
type MoveType = {index: number | symbolType, score: number}

export class Player {
  public name: string;
  public isBot;
  public score = 0;                                 // for more than 1 games

  constructor(name: string, isBot = false) {
    this.isBot = isBot
    this.name = name;
  }
}

export class Ai extends Player {
  private AiSymbol: symbolType;
  private HuSymbol: symbolType;                      // player symbol

  public preset: BotPresets;
  private aiChance;

  private funcCalls = 0;                             // for logging

  constructor(aiSymol: symbolType, preset: BotPresets) {
    super(getRandomElement(BotNames), true);

    this.preset = preset;
    this.AiSymbol = aiSymol;
    this.HuSymbol = this.AiSymbol === "X" ? "O" : "X";

    switch (preset) {
      case "hard": 
        this.aiChance = BotLevelChances.hard;
        break;
      case "medium": 
        this.aiChance = BotLevelChances.medium;
        break;
      case "easy": 
        this.aiChance = BotLevelChances.easy;
        break;
    }
  }

  public AiTurnByLevel(board: BoardType) {
    const optimalMoves = this.getOptimalMoves(board) as number[];
    return optimalMoves[getRandom(0, optimalMoves.length)];
  }

  private getOptimalMoves(board: BoardType) {
    const movesArray = this.minimax(board) as MoveType[];
    const allOptions = movesArray.sort((a, b) => b.score - a.score);

    const optimalMoves = allOptions.filter((move, _, arr) => move.score === arr[0].score).map(({index}) => index);
    const suboptimal = allOptions.slice(optimalMoves.length).map(({index}) => index);

    const isChanceProc = chance(this.aiChance);

    if (isChanceProc || !suboptimal.length) return optimalMoves;
    else return suboptimal;
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
    
    const availableSpots = GameController.emptyIndices(newBoard);
    
    if (checkBoardState(newBoard, this.HuSymbol).length) {
      return { score: -10 + depth };
    } else if (checkBoardState(newBoard, this.AiSymbol).length) {
      return { score: 10 - depth };
    } else if (availableSpots.length === 0) {
      return { score: 0 };
    }
  
    const moves: MoveType[] = [];
  
    availableSpots.forEach((cell) => {
      const move: MoveType = {index: 0, score: 0};
      
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

    const currentBestMove = this.bestMove(moves, player);
    return moves[currentBestMove];
  }  
}