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
    >
      <span className="sidebar__icon icon__print" />
    </button>
  );
}
