interface Props {
  handleClick: () => void;
}

export default function Highlight({ handleClick }: Props) {
  return (
    <div className="sidebar-item">
      <button
        type="button"
        aria-label="highlight selection"
        title="highlight selection"
        onClick={handleClick}
      >
        <span className="icon highlight-button" />
      </button>
    </div>
  );
}
