interface Props {
  date: Date;
  handleClick: () => void;
}

export default function DateTime({ date, handleClick }: Props) {
  return (
    <div className="date-time">
      <button
        type="button"
        aria-label="insert date and time"
        title="insert date and time"
        onClick={handleClick}
      >
        <i className="fa fa-clock-o date-time__icon" />
        {date.toLocaleString()}
      </button>
    </div>
  );
}
