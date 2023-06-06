interface Props {
  handleClick: () => void;
}

export default function Export({ handleClick }: Props) {
  return (
    <div className="highlight">
      <button
        type="button"
        aria-label="highlight selection"
        title="highlight selection"
        onClick={handleClick}
      >
        export
      </button>
    </div>
  );
}
