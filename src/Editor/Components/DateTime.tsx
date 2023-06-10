interface Props {
  handleClick: () => void;
}

export default function DateTime({ handleClick }: Props) {
  return (
    <button
      type="button"
      aria-label="insert date and time"
      title="insert date and time"
      onClick={handleClick}
      className="sidebar-item"
    >
      <span className="sidebar-item icon clock-button" />
    </button>
  );
}
