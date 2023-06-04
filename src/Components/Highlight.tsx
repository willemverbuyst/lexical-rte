interface Props {
  color: string;
  handleClick: () => void;
}

export default function Highlight({ color, handleClick }: Props) {
  return (
    <div className="highlight">
      <button
        type="button"
        aria-label="highlight selection"
        title="highlight selection"
        onClick={handleClick}
      >
        highlight {color}
      </button>
    </div>
  );
}
