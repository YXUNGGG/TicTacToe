import "./Preview.css";

type OwnProps = {
  isReversed: boolean;
}

const Preview: React.FC<OwnProps> = ({ isReversed }) => {
  return (
    <div className="preview-container">
      <img 
        alt="TicTacToe animation logo"
        src={ isReversed 
          ? "/tictactoe-preview-reverse.gif" 
          : "/tictactoe-preview.gif"
        }
      />
    </div>
  );
}

export default Preview;