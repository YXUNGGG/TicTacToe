import { Wins_positins } from "../engine";
import { BoardType } from "../models/Player";
import { symbolType } from "../types/GameContext";

let randomId = 1;
export const createUniqueId = () => ++randomId;

export const chance = (float: number) => Math.random() <= float;
export const getRandom = (min: number, max: number) => Math.trunc(Math.random() * (max - min) + min);
/**
 * Returns a random element from an array
 * @param arr
 */
export const getRandomElement = (arr: any[]) => arr[getRandom(0, arr.length)];

export const getImage = (img: string) => {
  const image = new Image();
  image.src = img;
  
  return image;
}

export const checkBoardState = (board: BoardType, player: symbolType) => {
  let winPosition: number[] = [];
  Wins_positins.forEach(pos => {
    if ( winPosition
      && board[pos[0]] === player 
      && board[pos[1]] === player 
      && board[pos[2]] === player
    ) winPosition = pos;
  });
  
  return winPosition;
}