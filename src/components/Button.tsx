
import "./Button.css";

type OwnProps = {
  color?: "red" | "blue" | "green";
  size?: "medium" | "small";
  children: string;
  onClick?: () => void;
  isSelected?: boolean;
}

const Button = ({
  onClick,
  children,
  color = "blue", 
  size = "medium", 
  isSelected = false
}: OwnProps) => {
  return (
    <button
      onClick={onClick} 
      disabled={isSelected}
      className={`button ${color} ${size}${isSelected ? " selected" : ""}`}
    >
      {children}
    </button>
  );
}

export default Button;