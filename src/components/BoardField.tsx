import { createContext, useEffect, useRef, useState } from 'react';
import Cell from './Cell';
import { GameController } from '../engine';
import { EngineCtxType } from '../types/GameContext';
import { drawWinLine, renderSymbol } from '../utils/drawFunctions';
import { checkBoardState } from '../utils/utils';
import { BoardType, BotPresets } from '../models/Player';

import './Board.css';
import './BoardField.css';
import GameWidget from './GameWidget';

export const EngineCtx = createContext<EngineCtxType>({
  EngineInstance: null
});

type OwnProps = {
  maxGames: number;
  isGameStarted: boolean;
  botDifficult?: BotPresets;
  finishGame: () => void;
}

const BoardField: React.FC<OwnProps> = ({ isGameStarted, maxGames, botDifficult, finishGame }) => {
  const EngineRef = useRef<GameController>(null);

  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [cells, setCells] = useState<BoardType>([]);
  const [isLocked, setIsLocked] = useState(false);

  const [playersPoints, setPlayerPoints] = useState({
    P1: 0,
    P2: 0
  });

  const secondPlayer = botDifficult ? "bot" : "P2";

  useEffect(() => {
    if (!isGameStarted) return;
    if (!canvasRef.current || !boardRef.current || EngineRef.current) return;

    EngineRef.current = new GameController(canvasRef.current, boardRef.current, botDifficult);

    const EngineInstance = EngineRef.current;
    if (!EngineInstance) return;

    const updateCells = () => setCells([...EngineInstance.board]);
    
    const renderVictoryLine = async () => {
      const winPos = checkBoardState(EngineInstance.board, EngineInstance.currentTurn);
      await new Promise(resolve => setTimeout(() => resolve(drawWinLine(EngineInstance.context!, winPos)), 200));
    }
    
    const handleDrawFigure = async () => {
      if (GameController.emptyIndices(EngineInstance!.board).length > 8) return;

      setIsLocked(true);
      await renderSymbol(
        EngineInstance.context!, 
        EngineInstance.playingCell!, 
        EngineInstance.currentTurn,
        "", false,
        EngineInstance.secondPlayerSymbol === EngineInstance.currentTurn
        && secondPlayer === "bot"
      );
      setIsLocked(false);
    }
    
    EngineInstance.onEvent("updateCells", updateCells);
    EngineInstance.onEvent("victory", renderVictoryLine);
    EngineInstance.onEvent("drawFigure", handleDrawFigure);
    
    EngineInstance.init();
    
    return () => {
      setTimeout(() => {
        EngineInstance.offEvent("updateCells", "updateCells");
        EngineInstance.offEvent("victory", "renderVictoryLine");
        EngineInstance.offEvent("drawFigure", "handleDrawFigure");
        EngineInstance.reset();
        EngineInstance.currentTurn = "X";

        setPlayerPoints({
          P1: 0,
          P2: 0
        });
      }, 1250);
    }
  }, [isGameStarted]);

  return (
    <EngineCtx.Provider value={
      { EngineInstance: EngineRef.current }
    }>
      <GameWidget 
        maxGames={maxGames}
        finishGame={finishGame}
        isVisible={isGameStarted}
        playerPoints={playersPoints}
        setPlayerPoints={setPlayerPoints}
      />

      <div id="board" ref={boardRef}>
        <canvas ref={canvasRef}/>

        <div 
          className="separation-line" 
          style={{right: "33%"}}
        />
        <div 
          className="separation-line" 
          style={{left: "33%"}}
        />

        <div 
          className="separation-line horizontal" 
          style={{top: "33%"}}
        />
        <div 
          className="separation-line horizontal" 
          style={{bottom: "33%"}}
        />

        <div className="cells">
          {cells.map((_, idx) => <Cell
            id={idx}
            key={idx}
            isLocked={isLocked}
            secondPlayer={secondPlayer}
          />)}
        </div>
      </div>
    </EngineCtx.Provider>
  );
}

export default BoardField;
