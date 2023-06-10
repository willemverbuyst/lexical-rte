interface Props {
  handleClick: () => void;
}

export default function Highlight({ handleClick }: Props) {
  return (
    <button
      type="button"
      aria-label="highlight selection"
      title="highlight selection"
      onClick={handleClick}
      className="sidebar-item"
    >
      <span className="icon highlight-button" />
    </button>
  );
}
