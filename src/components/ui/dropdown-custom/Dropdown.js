"use client";

import styles from "./Dropdown.module.css";
import { useState, useRef, useEffect } from "react";
import { RiArrowDownSLine } from "react-icons/ri";
import ErrorMessage from "../toast/ErrorMessage";

export default function Dropdown({
  ref,
  errorMessage,
  classError,
  label,
  options,
  name,
  formData,
  handleBlur,
  handleChange,
  isRequired,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClick = (item) => {
    handleChange(name, item);
    toggleDropdown();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={styles.formSelect}
      onClick={toggleDropdown}
    >
      <label className={styles.selectLabel}>
        {label}
        {isRequired && <span className={styles.required}>*</span>}
      </label>
      <div
        className={`${styles.selectField} ${classError ? styles.error : ""}`}
      >
        <div
          className={`${styles.selectInput} ${formData ===  "" ? styles.placehoder : "" }`}
          value={formData}
          onBlur={handleBlur}
        >
          {formData !== '' ? formData : "Select the job type"}
        </div>
        <RiArrowDownSLine size={20} />
        <div
          className={`${styles.dropdownMenu} ${isOpen ? styles.open : undefined}`}
        >
          {options.map((item, index) => (
            <div
              key={index}
              value={item}
              className={styles.dropdownOption}
              onClick={() => {
                handleClick(item);
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
      {classError && <ErrorMessage message={errorMessage} />}
    </div>
  );
}
