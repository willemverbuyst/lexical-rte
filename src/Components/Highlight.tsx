interface Props {
  color: string;
  handleClick: () => void;
}

export default function Highlight({ color, handleClick }: Props) {
  console.log("color :>> ", color);
  return (
    <div className="highlight">
      <button
        type="button"
        aria-label="highlight selection"
        title="highlight selection"
        onClick={handleClick}
      >
        highlight &nbsp;
        <span className="highlight__dot" style={{ backgroundColor: color }} />
      </button>
    </div>
  );
}
