interface Props {
  show: boolean;
  handleClick: (show: boolean) => void;
}

export default function Debug({ handleClick, show }: Props) {
  return (
    <button
      type="button"
      aria-label="debug editor"
      title="debug editor"
      onClick={() => handleClick(!show)}
      className="sidebar-item"
    >
      <span className="icon bug-button" />
    </button>
  );
}
