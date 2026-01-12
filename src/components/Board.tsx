import { useEffect, useState } from "react";
import BoardMenu from "./BoardMenu";
import BoardField from "./BoardField";

import "./Board.css";

type gameStageType = "" | "started" | "ended";

export type secondPlayerType = "bot" | "P2";
export type botDifficultsType = "easy" | "medium" | "hard";

const Board = () => {
  const [gameStage, setGameStage] = useState<gameStageType>("");
  const [isInterfaceBlocked, setIsInterfaceBlocked] = useState(false);
  const [secondPlayer, setSecondPlayer] = useState<secondPlayerType>("bot");

  const [gamesCount, setGamesCount] = useState(5);
  const [botDifficult, setBotDifficult] = useState<botDifficultsType>("easy");

  useEffect(() => {
    let timer: number;
    if (gameStage === "started") {
      timer = setTimeout(() => setIsInterfaceBlocked(true), 1000);
    }

    return () => clearInterval(timer);
  }, [gameStage]);

  const finishGame = () => setTimeout(() => {
    setIsInterfaceBlocked(false);
    setTimeout(() => setGameStage("ended"), 250);
  }, 1000);

  return (
    <div className="userfield">
      <div className="scene">
        <div
          className={`cube${" " + gameStage}`}
        >
          <div className="face front">
            <BoardMenu
              gamesCount={gamesCount}
              botDifficult={botDifficult}
              setGamesCount={setGamesCount}
              setBotDifficult={setBotDifficult}
              setSecondPlayer={setSecondPlayer}
              setGameStarted={() => setGameStage("started")}
            />
          </div>
          <div className="face back">
            <BoardField 
              finishGame={finishGame}
              isGameStarted={isInterfaceBlocked}
              botDifficult={secondPlayer === "bot" ? botDifficult : undefined}
              maxGames={secondPlayer === "bot" ? 5 : gamesCount}
            />
          </div>

          <div className="face side front" style={{transform: "translateZ(17px)"}} />
          <div className="face side back" style={{transform: "translateZ(-17px)"}} />
          <div className="face side center-left" style={{ width: "36px"}} />
          <div className="face side center-right" style={{ width: "36px" }} />
          <div className="face side left" style={{ width: "36px"}} />
          <div className="face side right" style={{width: "36px"}} />
        </div>
      </div>
    </div>
  );
}

export default Board;
