import Button from "./Button";

import "./Board.css";
import "./BoardMenu.css";
import { botDifficultsType } from "./Board";

type OwnProps = {
  gamesCount: number;
  botDifficult: botDifficultsType;
  setGameStarted: () => void;
  setGamesCount: React.Dispatch<React.SetStateAction<number>>;
  setSecondPlayer: React.Dispatch<React.SetStateAction<"bot" | "P2">>;
  setBotDifficult: React.Dispatch<React.SetStateAction<botDifficultsType>>;
}

const BoardMenu = ({ 
  gamesCount,
  botDifficult,
  setGameStarted,
  setSecondPlayer,
  setGamesCount,
  setBotDifficult
}: OwnProps) => {
  return (
  <div id="board" className="menu">
      <h2>Select a game mode</h2>
      <div className="button-group" style={{marginTop: "2rem"}}>
        <Button 
          color="red" 
          onClick={() => {
            setSecondPlayer("bot");
            setGameStarted();
          }}
        >
          You vs Bot from Zoo
        </Button>

        <div className="button-row">
          {["easy", "medium", "hard"].map((preset, idx) =>
            <Button 
              key={idx}
              size="small"
              color="green"
              isSelected={botDifficult === preset}
              onClick={() => setBotDifficult(preset as botDifficultsType)}
            >
              {preset}
            </Button>
          )}
        </div>
      </div>

      <div className="button-group" style={{marginTop: "2.5rem"}}>
        <Button 
          color="blue"
          onClick={() => {
            setSecondPlayer("P2");
            setGameStarted();
          }}
        >
          Player vs Player
        </Button>

        <div className="button-row">
          <Button 
            color="green" 
            size="small" 
            isSelected={gamesCount === 3}
            onClick={() => setGamesCount(3)}
          >
            bo3
          </Button>

          <Button 
            size="small"
            color="green"
            isSelected={gamesCount === 5}
            onClick={() => setGamesCount(5)}
          >
            bo5
          </Button>

          <Button 
            size="small"
            color="green"
            isSelected={gamesCount === 7}
            onClick={() => setGamesCount(7)}
          >
            bo7
          </Button>

          <Button 
            size="small"
            color="green"
            isSelected={gamesCount === 9}
            onClick={() => setGamesCount(9)}
          >
            bo9
          </Button>
        </div>
      </div>
  </div>
  );
}

export default BoardMenu;