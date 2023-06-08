interface Props {
  handleClick: () => void;
}

export default function Print({ handleClick }: Props) {
  return (
    <div className="toolbar-item">
      <button
        type="button"
        aria-label="export file"
        title="export file"
        onClick={handleClick}
      >
        <span className="icon print-button" />
      </button>
    </div>
  );
}
