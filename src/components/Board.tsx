import { useEffect, useState } from "react";
import BoardMenu from "./BoardMenu";
import BoardField from "./BoardField";

import "./Board.css";

type gameStageType = "" | "started" | "ended";
export type secondPlayerType = "bot" | "player";

const Board = () => {
  const [gameStage, setGameStage] = useState<gameStageType>("");
  const [isInterfaceBlocked, setIsInterfaceBlocked] = useState(false);
  const [secondPlayer, setSecondPlayer] = useState<secondPlayerType>("bot");

  useEffect(() => {
    let timer: number;
    if (gameStage === "started") {
      timer = setTimeout(() => setIsInterfaceBlocked(true), 1000);
    }

    return () => {
      clearInterval(timer);
    }
  }, [gameStage]);

  return (
    <div className="userfield">
      <div className="scene">
        <div
          className={`cube${" " + gameStage}`}
        >
          <div className="face front">
            <BoardMenu
              setSecondPlayer={setSecondPlayer}
              setGameStarted={() => setGameStage("started")}
            />
          </div>
          <div className="face back">
            <BoardField 
              secondPlayer={secondPlayer}
              isGameStarted={isInterfaceBlocked}
              setGameStarted={() => setGameStage("ended")}
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
