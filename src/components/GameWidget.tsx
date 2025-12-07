import "./GameWidget.css";

type OwnProps = {
  isGameWithBot: boolean;
  isVisible: boolean
}

const GameWidget = ({ isGameWithBot, isVisible }: OwnProps) => {
  return (
    <div
      className={`game-widget-block${!isVisible ? " hidden" : ""}`}
    >
      <div className="first-player-score">
        <div style={{color: "#0C8EED"}}>P1</div>
        <div style={{ height: "50%"}}>{0}</div>
      </div>

      <div className="action-widget"></div>

      <div className="second-player-score">
        <div style={{color: "#F35244"}}>{isGameWithBot ? "Bot" : "P2"}</div>
        <div style={{ height: "50%"}}>{0}</div>
      </div>
    </div>
  );
}

export default GameWidget;