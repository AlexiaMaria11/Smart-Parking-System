import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./DateTimePicker.css";

export function DateTimePicker({ value, onChange, minDate }) {
  return (
    <div className="sps-dtp-wrap">
      <DatePicker
        selected={value}
        onChange={onChange}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={30}
        dateFormat="dd MMM yyyy, HH:mm"
        minDate={minDate ?? new Date()}
        placeholderText="Choose date and time"
        calendarClassName="sps-calendar"
        wrapperClassName="sps-dtp-wrapper"
        popperClassName="sps-dtp-popper"
      />
    </div>
  );
}
