import React, { useContext } from 'react';
import './Cell.css'
import { EngineCtx } from './Board';

type OwnProps = {
  id: number;
  isLocked?: boolean;
}

const Cell: React.FC<OwnProps> = ({ isLocked, id }) => {
  const {EngineInstance} = useContext(EngineCtx);

  const handlePasteFigure = () => {
    if (isLocked || !EngineInstance) return;
    if (
      typeof EngineInstance.board[id] !== "number" ||
      EngineInstance.gameStatus !== "running"
    ) return;
    
    EngineInstance.setNewStep(id);
  };

  return (
    <div
      style={
        EngineInstance?.currentTurn === EngineInstance?.secondPlayerSymbol
        || isLocked ? {pointerEvents: 'none'} : {}}
      onMouseEnter={() => EngineInstance!.handleCellHover(id)}
      onMouseLeave={() => EngineInstance!.handleCellLeave(id)}
      className="cell"
      onClick={handlePasteFigure}
    ></div>
  );
}

export default Cell;
