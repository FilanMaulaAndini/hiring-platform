"use client";

import styles from "./InputPhone.module.css";
import { useState, useRef, useEffect } from "react";
import { RiArrowDownSLine } from "react-icons/ri";
import ErrorMessage from "../toast/ErrorMessage";

export default function InputPhone({
  label,
  errorMessage,
  formData,
  classError,
  name,
  handleBlur,
  handleChange,
  isRequired,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [phoneField, setPhoneField] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState({
    name: "Indonesia",
    code: "+62",
    flag: "🇮🇩",
  });
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const countries = [
    { name: "Indonesia", code: "+62", flag: "🇮🇩" },
    { name: "United States", code: "+1", flag: "🇺🇸" },
    { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
    { name: "Australia", code: "+61", flag: "🇦🇺" },
    { name: "Singapore", code: "+65", flag: "🇸🇬" },
    { name: "Malaysia", code: "+60", flag: "🇲🇾" },
    { name: "Japan", code: "+81", flag: "🇯🇵" },
    { name: "South Korea", code: "+82", flag: "🇰🇷" },
    { name: "Thailand", code: "+66", flag: "🇹🇭" },
    { name: "Philippines", code: "+63", flag: "🇵🇭" },
  ];

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.includes(searchTerm)
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCountry = (country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchTerm("");
    handleChange(name, country.code + phoneField);
  };

  const handleInput = (phone) => {
    handleChange(name, selectedCountry.code + phone);
    setPhoneField(phone);
  };

  return (
    <div className={styles.formField}>
      <label className={styles.fieldLabel}>
        {label}
        {isRequired && <span className={styles.required}>*</span>}
      </label>
      <div
        className={`${styles.phoneField}  ${classError ? styles.error : ""}`}
      >
        <div className={styles.countryCode} onClick={() => setIsOpen(!isOpen)}>
          <div className={styles.flagIcon}>{selectedCountry.flag}</div>
          <RiArrowDownSLine size={20} />
          <div className={styles.divider}></div>
        </div>
        <span className={styles.codeText}>{selectedCountry.code}</span>
        <input
          required={isRequired}
          type="tel"
          name="phoneNumber"
          className={styles.phoneInput}
          placeholder="823765437438"
          value={formData.phoneNumber}
          onBlur={handleBlur}
          onChange={(e) => handleInput(e.target.value)}
        />

        {isOpen && (
          <div className={styles.dropdownSearch} ref={dropdownRef}>
            <div className={styles.searchInputContainer}>
              <div style={{ position: "relative", width: "100%" }}>
                <svg
                  className={styles.searchIcon}
                  style={{ position: "absolute", left: "12px", top: "12px" }}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  className={styles.searchInputField}
                  placeholder="Search country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: "40px" }}
                  autoFocus
                />
              </div>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.countryList}>
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country, index) => (
                  <button
                    key={index}
                    className={styles.searchItem}
                    onClick={() => handleSelectCountry(country)}
                  >
                    <span className={styles.searchItemFlag}>
                      {country.flag}
                    </span>
                    <span className={styles.countryName}>{country.name}</span>
                    <span className={styles.countryCode}>{country.code}</span>
                  </button>
                ))
              ) : (
                <div className={styles.noResults}>No countries found</div>
              )}
            </div>
          </div>
        )}
      </div>
      {classError && <ErrorMessage message={errorMessage} />}
    </div>
  );
}
