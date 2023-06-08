interface Props {
  handleClick: () => void;
}

export default function DateTime({ handleClick }: Props) {
  return (
    <div className="toolbar-item">
      <button
        type="button"
        aria-label="insert date and time"
        title="insert date and time"
        onClick={handleClick}
      >
        <span className="icon clock-button" />
      </button>
    </div>
  );
}
