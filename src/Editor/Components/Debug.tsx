interface Props {
  show: boolean;
  handleClick: (show: boolean) => void;
}

export default function Debug({ handleClick, show }: Props) {
  return (
    <div className="toolbar-item">
      <button
        type="button"
        aria-label="debug editor"
        title="debug editor"
        onClick={() => handleClick(!show)}
      >
        <span className="icon bug-button" />
      </button>
    </div>
  );
}
