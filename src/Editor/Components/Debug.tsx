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
    >
      <span className="sidebar__icon sidebar__icon--bug" />
    </button>
  );
}
