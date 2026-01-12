import { JSX, useContext, useEffect, useMemo, useRef } from "react";
import "./GameWidget.css";
import { EngineCtx } from "./BoardField";

type playerType = "P1" | "P2";
type playerPointsType = { P1: number, P2: number}
const switchTurnAnimation = "switch-turn 300ms forwards";

type OwnProps = {
  maxGames: number;
  isVisible: boolean;
  playerPoints: playerPointsType;
  finishGame: () => void;
  setPlayerPoints: React.Dispatch<React.SetStateAction<playerPointsType>>
}

const GameWidget = ({ 
  maxGames,
  isVisible,
  playerPoints,
  finishGame,
  setPlayerPoints 
}: OwnProps) => {
  const { EngineInstance } = useContext(EngineCtx);
  const rotationRef = useRef<HTMLDivElement>(null);
  const previousMoveRef = useRef<JSX.Element>(null);

  const player2Name = EngineInstance?.playerTwo.name;

  // step animation effect
  useEffect(() => {
    const element = rotationRef.current!;
    element.style.animation = "none";

    if (!EngineInstance?.currentTurn) return;
    if (!previousMoveRef.current) return;

    void(element.offsetWidth);  // reflow
    element.style.animation = switchTurnAnimation;
  }, [EngineInstance?.currentTurn, EngineInstance?.gameStatus]);

  // restart game effect
  useEffect(() => {
    if (!EngineInstance?.currentTurn) return;

    if (EngineInstance.gameStatus.includes("win")) {
      const winnedPlayer = EngineInstance.gameStatus.split(" ")[0];
      const player = winnedPlayer !== "P1" ? "P2" : "P1" as playerType;

      const pointsSum = playerPoints.P1 + playerPoints.P2 + 1;
      if (
        pointsSum === maxGames || playerPoints[player] + 1 > maxGames / 2
      ) {
        finishGame();
        previousMoveRef.current = null;
        return;
      }

      setTimeout(() => {
        setPlayerPoints(prev => ({ ...prev, [player]: prev[player] + 1 }));
        EngineInstance.reset();
        EngineInstance.init();
      }, 1000);
    }

    if (EngineInstance.gameStatus === "draw") {
      setTimeout(() => {
        EngineInstance.reset();
        EngineInstance.init();
      }, 1000);
    }
  }, [EngineInstance?.gameStatus]);

  const firstPlayerTurn = (isWin = false) => (
    <p>
      <span className="first-player-color">
        {"Player 1's"}
      </span> {isWin ? "win!" : "turn"}
    </p>
  );

  const secondPlayerTurn = (isWin = false) => (
    <p>
      <span className="second-player-color">
        {player2Name === "P2" ? "Player 2's" : player2Name + "'s"}
      </span> {isWin ? "win!" : "turn"}
    </p>
  );

  const draw = (
    <p style={{color: "#d6d6d6"}}>
      Draw!
    </p>
  );

  const actionConstructor = (disappearing: JSX.Element, appearing: JSX.Element) => {
    return (
      <>
        <div>
          {disappearing}
        </div>
        <div 
          style={{transform: `rotateX(-90deg) translateZ(20px)`}}
        >
          {appearing}
        </div>
      </>
    );
  }

  const currentTurn = useMemo(() => {
    let turn: JSX.Element;

    // draw
    if (EngineInstance?.gameStatus === "draw") turn = draw;

    // win
    if (EngineInstance?.gameStatus.includes("win")) {
      if (EngineInstance?.currentTurn !== EngineInstance?.secondPlayerSymbol) {
        turn = firstPlayerTurn(true);
      } else {
        turn = secondPlayerTurn(true);
      }
    }

    // turn
    if (EngineInstance?.currentTurn !== EngineInstance?.secondPlayerSymbol) {
      turn = firstPlayerTurn();
    } else {
      turn = secondPlayerTurn();
    }

    if (isVisible) setTimeout(() => previousMoveRef.current = turn, 300);

    if (!previousMoveRef.current) return <div>{turn}</div>;
    else return actionConstructor(previousMoveRef.current, turn);
  }, [EngineInstance?.currentTurn, EngineInstance?.gameStatus]);

  return (
    <div
      className={`game-widget-block${!isVisible ? " hidden" : ""}`}
    >
      <div className="first-player-score">
        <div className="first-player-color">P1</div>
        <div style={{ height: "50%"}}>{playerPoints.P1}</div>
      </div>

      <div 
        className="action-widget"
        ref={rotationRef}
      >
        {currentTurn}
      </div>

      <div className="second-player-score">
        <div className="second-player-color">{player2Name}</div>
        <div style={{ height: "50%"}}>{playerPoints.P2}</div>
      </div>
    </div>
  );
}

export default GameWidget;