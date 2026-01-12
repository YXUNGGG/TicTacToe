import React, { useContext } from 'react';
import './Cell.css'
import { EngineCtx } from './BoardField';
import { secondPlayerType } from './Board';

type OwnProps = {
  id: number;
  isLocked?: boolean;
  secondPlayer: secondPlayerType;
}

const Cell: React.FC<OwnProps> = ({ isLocked, id, secondPlayer }) => {
  const { EngineInstance } = useContext(EngineCtx);

  const handlePasteFigure = () => {
    if (isLocked || !EngineInstance) return;
    if (
      typeof EngineInstance.board[id] !== "number" ||
      EngineInstance.gameStatus !== "running"
    ) return;
    
    EngineInstance.setNewStep(id);
  }

  return (
    <div
      className="cell"
      onClick={handlePasteFigure}
      onMouseEnter={() => EngineInstance!.handleCellHover(id)}
      onMouseLeave={() => EngineInstance!.handleCellLeave(id)}
      style={
        (EngineInstance?.currentTurn === EngineInstance?.secondPlayerSymbol 
        && secondPlayer === "bot") || isLocked || EngineInstance?.gameStatus !== "running"
        ? {pointerEvents: 'none'} 
        : {}
      }
    />
  );
}

export default Cell;
