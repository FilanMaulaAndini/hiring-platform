import React, { useState, useRef, useEffect } from "react";
import styles from "./DatePicker.module.css";
import { FaRegCalendarAlt } from "react-icons/fa";
import ErrorMessage from "../toast/ErrorMessage";
import moment from "moment";

export default function DatePicker({
  ref,
  classError,
  errorMessage,
  label,
  formData,
  name,
  handleBlur,
  handleChange,
  isRequired,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("days");
  const [inputValue, setInputValue] = useState("");

  const pickerRef = useRef(null);
  const inputRef = useRef(null);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthNamesFull = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (date) => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: daysInPrevMonth - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, daysInPrevMonth - i),
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        fullDate: new Date(year, month, i),
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        fullDate: new Date(year, month + 1, i),
      });
    }

    return days;
  };

  const getDecadeYears = (year) => {
    const startYear = Math.floor(year / 10) * 10;
    const years = [];

    years.push({ year: startYear - 1, isCurrentDecade: false });

    for (let i = 0; i < 10; i++) {
      years.push({ year: startYear + i, isCurrentDecade: true });
    }

    years.push({ year: startYear + 10, isCurrentDecade: false });

    return years;
  };

  const getDecades = (year) => {
    const startDecade = Math.floor(year / 100) * 100;
    const decades = [];

    for (let i = -10; i < 100; i += 10) {
      const decadeStart = startDecade + i;
      decades.push({
        start: decadeStart,
        end: decadeStart + 9,
        isCurrent: i >= 0 && i < 100,
      });
    }

    return decades;
  };

  const goToPrevious = () => {
    const newDate = new Date(currentDate);

    if (view === "days") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === "months") {
      newDate.setFullYear(newDate.getFullYear() - 1);
    } else if (view === "years") {
      newDate.setFullYear(newDate.getFullYear() - 10);
    } else if (view === "decades") {
      newDate.setFullYear(newDate.getFullYear() - 100);
    }

    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);

    if (view === "days") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === "months") {
      newDate.setFullYear(newDate.getFullYear() + 1);
    } else if (view === "years") {
      newDate.setFullYear(newDate.getFullYear() + 10);
    } else if (view === "decades") {
      newDate.setFullYear(newDate.getFullYear() + 100);
    }

    setCurrentDate(newDate);
  };

  const goToStart = () => {
    if (view === "days") {
      setView("months");
    } else if (view === "months") {
      setView("years");
    } else if (view === "years") {
      setView("decades");
    }
  };

  const goToEnd = () => {
    if (view === "decades") {
      setView("years");
    } else if (view === "years") {
      setView("months");
    } else if (view === "months") {
      setView("days");
    }
  };

  const selectDay = (day) => {
    setSelectedDate(day.fullDate);
    setInputValue(formatDate(day.fullDate));
    setIsOpen(false);
    setView("days");
    handleChange(name, moment(day.fullDate).format("YYYY/MM/DD"));
  };

  const selectMonth = (monthIndex) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    setCurrentDate(newDate);
    setView("days");
  };

  const selectYear = (year) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
    setView("months");
  };

  const selectDecade = (startYear) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(startYear);
    setCurrentDate(newDate);
    setView("years");
  };

  const isSelected = (date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getHeaderText = () => {
    const year = currentDate.getFullYear();
    const month = monthNamesFull[currentDate.getMonth()];

    if (view === "days") {
      return `${month} ${year}`;
    } else if (view === "months") {
      return year;
    } else if (view === "years") {
      const startYear = Math.floor(year / 10) * 10;
      return `${startYear} - ${startYear + 9}`;
    } else if (view === "decades") {
      const startDecade = Math.floor(year / 100) * 100;
      return `${startDecade} - ${startDecade + 99}`;
    }
  };

  return (
    <div className={styles.formWrapper}>
      <label className={styles.selectLabel}>
        {label}
        {isRequired && <span className={styles.required}>*</span>}
      </label>
      <div className={styles.inputWrapper}>
        <input
          required={isRequired}
          ref={inputRef}
          type="text"
          name={name}
          className={`${styles.dateInput} ${classError ? styles.error : ""} `}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onClick={() => setIsOpen(!isOpen)}
          onBlur={handleBlur}
          placeholder="DD/MM/YYYY"
        />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={styles.calendarIcon}
        >
          <FaRegCalendarAlt size={15} />
        </button>
      </div>
      {classError && <ErrorMessage message={errorMessage} />}
      {isOpen && (
        <div
          ref={pickerRef}
          className={`${styles.pickerDropdown} ${view !== "days" ? styles.wide : ""}`}
        >
          <div className={styles.pickerHeader}>
            <button
              onClick={goToStart}
              className={styles.navButton}
              title="Go to broader view"
            >
              <span style={{ fontWeight: "bold" }}>««</span>
            </button>
            <button onClick={goToPrevious} className={styles.navButton}>
              <svg
                className="chevron-icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              onClick={() => {
                if (view === "days") setView("months");
                else if (view === "months") setView("years");
                else if (view === "years") setView("decades");
              }}
              className={styles.headerText}
            >
              {getHeaderText()}
            </button>
            <button onClick={goToNext} className={styles.navButton}>
              <svg
                className="chevron-icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
            <button
              onClick={goToEnd}
              className={styles.navButton}
              title="Go to detailed view"
            >
              <span style={{ fontWeight: "bold" }}>»»</span>
            </button>
          </div>
          {view === "days" && (
            <>
              <div className={styles.dayNames}>
                {dayNames.map((day, i) => (
                  <div key={i} className={styles.dayName}>
                    {day}
                  </div>
                ))}
              </div>

              <div className={styles.daysGrid}>
                {getDaysInMonth(currentDate).map((day, i) => (
                  <button
                    key={i}
                    onClick={() => day.isCurrentMonth && selectDay(day)}
                    className={`${styles.dayButton} ${!day.isCurrentMonth ? "other-month" : styles.currentMonth} ${isSelected(day.fullDate) ? styles.selected : ""} ${isToday(day.fullDate) && !isSelected(day.fullDate) ? styles.today : ""}`}
                  >
                    {day.date}
                  </button>
                ))}
              </div>
            </>
          )}
          {view === "months" && (
            <div className={styles.monthsGrid}>
              {monthNames.map((month, i) => (
                <button
                  key={i}
                  onClick={() => selectMonth(i)}
                  className={styles.monthButton}
                >
                  {month}
                </button>
              ))}
            </div>
          )}
          {view === "years" && (
            <div className={styles.yearsGrid}>
              {getDecadeYears(currentDate.getFullYear()).map((item, i) => (
                <button
                  key={i}
                  onClick={() => item.isCurrentDecade && selectYear(item.year)}
                  className={`${styles.yearButton} ${item.isCurrentDecade ? styles.current : styles.other}`}
                >
                  {item.year}
                </button>
              ))}
            </div>
          )}
          {view === "decades" && (
            <div className={styles.decadesGrid}>
              {getDecades(currentDate.getFullYear()).map((decade, i) => (
                <button
                  key={i}
                  onClick={() => decade.isCurrent && selectDecade(decade.start)}
                  className={`${styles.decadeButton} ${decade.isCurrent ? styles.current : styles.other}`}
                >
                  {decade.start}-{decade.end}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
