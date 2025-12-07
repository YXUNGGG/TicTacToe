import Button from "./Button";

import "./Board.css";
import "./BoardMenu.css";
import { useState } from "react";

type OwnProps = {
  setSecondPlayer: React.Dispatch<React.SetStateAction<"bot" | "player">>;
  setGameStarted: () => void;
}

const BoardMenu = ({ setGameStarted, setSecondPlayer }: OwnProps) => {
  const [botDifficult, setBotDifficult] = useState({
    easy: true,
    mid: false,
    hard: false
  });

  const [gamesCount, setGamesCount] = useState({
    bo3: false,
    bo5: true,
    bo7: false,
    bo9: false,
  });

  return (
    <div id="board" className="menu">
      <h2>Select a game mode</h2>
      <div className="button-group" style={{marginTop: "2rem"}}>
        <Button 
          color="red" 
          onClick={() => {
            setSecondPlayer("bot");
            setGameStarted();
          }}>
            Player vs Bot
          </Button>
        <div className="button-row">
          <Button 
            color="green"
            size="small" 
            isSelected={botDifficult.easy}
            onClick={() => setBotDifficult({
              easy: true,
              mid: false,
              hard: false
            })}
          >
            easy
          </Button>

          <Button 
            color="green" 
            size="small"
            isSelected={botDifficult.mid}
            onClick={() => setBotDifficult({
              easy: false,
              mid: true,
              hard: false
            })}
          >
            medium
          </Button>

          <Button
            color="green" 
            size="small"
            isSelected={botDifficult.hard}
            onClick={() => setBotDifficult({
              easy: false,
              mid: false,
              hard: true
            })}
          >
            hard
          </Button>
        </div>
      </div>

      <div className="button-group" style={{marginTop: "2.5rem"}}>
        <Button 
          color="blue"
          onClick={() => {
          setSecondPlayer("player");
          setGameStarted();
          }}
        >
          Player vs Player
        </Button>

        <div className="button-row">
          <Button 
            color="green" 
            size="small" 
            isSelected={gamesCount.bo3}
            onClick={() => setGamesCount({
              bo3: true,
              bo5: false,
              bo7: false,
              bo9: false
            })}
          >
            bo3
          </Button>

          <Button 
            size="small"
            color="green"
            isSelected={gamesCount.bo5}
            onClick={() => setGamesCount({
              bo3: false,
              bo5: true,
              bo7: false,
              bo9: false
            })}
          >
            bo5
          </Button>

          <Button 
            size="small"
            color="green"
            isSelected={gamesCount.bo7}
            onClick={() => setGamesCount({
              bo3: false,
              bo5: false,
              bo7: true,
              bo9: false
            })}
          >
            bo7
          </Button>

          <Button 
            size="small"
            color="green"
            isSelected={gamesCount.bo9}
            onClick={() => setGamesCount({
              bo3: false,
              bo5: false,
              bo7: false,
              bo9: true
            })}
          >
            bo9
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BoardMenu;