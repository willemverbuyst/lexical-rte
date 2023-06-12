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
    >
      <span className="sidebar__icon icon__highlight" />
    </button>
  );
}
