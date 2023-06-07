interface Props {
  handleClick: () => void;
}

export default function Export({ handleClick }: Props) {
  return (
    <div className="export">
      <button
        type="button"
        aria-label="export file"
        title="export file"
        onClick={handleClick}
      >
        export
      </button>
    </div>
  );
}
