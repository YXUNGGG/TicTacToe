import { createContext, useEffect, useRef, useState } from 'react';
import Cell from './Cell';
import { GameController } from '../engine';
import { EngineCtxType } from '../types/GameContext';
import { drawWinLine, renderSymbol } from '../utils/drawFunctions';
import { checkBoardState } from '../utils/utils';
import { BoardType } from '../models/Player';

import './Board.css';
import './BoardField.css';
import GameWidget from './GameWidget';
import { secondPlayerType } from './Board';

export const EngineCtx = createContext<EngineCtxType>({
  EngineInstance: null
});

type OwnProps = {
  secondPlayer: secondPlayerType;
  isGameStarted: boolean;
  setGameStarted: () => void;
}

//TODO: lock cells after game ends

const BoardField: React.FC<OwnProps> = ({ isGameStarted, secondPlayer }) => {
  const EngineRef = useRef<GameController>(null);

  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [cells, setCells] = useState<BoardType>([]);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (!isGameStarted) return;
    if (!canvasRef.current || !boardRef.current || EngineRef.current) return;

    EngineRef.current = new GameController(canvasRef.current, boardRef.current, "p1", secondPlayer);

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
      );
      setIsLocked(false);
    }
    
    EngineInstance.onEvent("updateCells", updateCells);
    EngineInstance.onEvent("victory", renderVictoryLine);
    EngineInstance.onEvent("drawFigure", handleDrawFigure);
    
    EngineInstance.init();
  }, [isGameStarted]);

  return (
    <EngineCtx.Provider value={
      { EngineInstance: EngineRef.current }
    }>
      <GameWidget 
        isVisible={isGameStarted} 
        isGameWithBot={secondPlayer === "bot"} 
      />
      <div id="board" ref={boardRef}>
        <canvas ref={canvasRef}/>

        <div 
          className="separation-line" 
          style={{right: "33%"}}
        ></div>
        <div 
          className="separation-line" 
          style={{left: "33%"}}
        ></div>

        <div 
          className="separation-line horizontal" 
          style={{top: "33%"}}
        ></div>
        <div 
          className="separation-line horizontal" 
          style={{bottom: "33%"}}
        ></div>

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
