interface Props {
  handleClick: () => void;
}

export default function Print({ handleClick }: Props) {
  return (
    <button
      type="button"
      aria-label="export file"
      title="export file"
      onClick={handleClick}
      className="sidebar-item"
    >
      <span className="icon print-button" />
    </button>
  );
}
