"use client";
import React, { useState, useRef, useEffect } from "react";
import styles from "./ApplyJob.module.css";
import HandPose from "./hand-pose/HandPose";
import { FaArrowLeft } from "react-icons/fa6";
import { FiUpload } from "react-icons/fi";
import { forbidden, useRouter } from "next/navigation";
import Dropdown from "@/components/ui/dropdown-custom/Dropdown";
import InputPhone from "@/components/ui/input-phone/InputPhone";
import DatePicker from "@/components/ui/date-picker-custom/DatePicker";
import { useToast } from "@/context/ToastContext";
import { supabase } from "../../../../lib/supabase-client";
import ErrorMessage from "@/components/ui/toast/ErrorMessage";
import { useSearchParams } from "next/navigation";

export default function ApplyJob() {
  const router = useRouter();
  const jobId = useSearchParams().get("job_id");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const initial = {
    profilePicture: null,
    fullName: "",
    email: "",
    dateOfBirth: "",
    pronoun: "",
    phoneNumber: "",
    linkedin: "",
  };
  const [formData, setFormData] = useState(initial);
  const { toast, showToast } = useToast();
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const refs = {
    fullName: useRef(null),
    email: useRef(null),
    dateOfBirth: useRef(null),
    pronoun: useRef(null),
    domicile: useRef(null),
    phoneNumber: useRef(null),
    linkedin: useRef(null),
  };

  const fieldRulesFromDB = [
    { key: "fullName", validation: "mandatory" },
    { key: "photoProfile", validation: "mandatory" },
    { key: "pronoun", validation: "mandatory" },
    { key: "domicile", validation: "mandatory" },
    { key: "email", validation: "mandatory" },
    { key: "phoneNumber", validation: "mandatory" },
    { key: "linkedin", validation: "mandatory" },
    { key: "dateOfBirth", validation: "mandatory" },
  ];

  const fieldSettings = fieldRulesFromDB.reduce((acc, { key, validation }) => {
    acc[key] = validation;
    return acc;
  }, {});

  const getFieldRules = (fieldSettings) => ({
    isVisible: (key) => fieldSettings[key] !== "off",
    isRequired: (key) => fieldSettings[key] === "mandatory",
  });
  const { isVisible, isRequired } = getFieldRules(fieldSettings);

  const validate = (values) => {
    const e = {};

    for (const key in fieldSettings) {
      const rule = fieldSettings[key];
      const value = values[key]?.trim?.() || "";

      if (rule === "off") continue;

      if (rule === "mandatory" && !value) {
        e[key] = "Required";
      }

      if (rule !== "off" && key === "email" && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          e.email = "Please enter your email in the format: name@example.com";
        }
      }

      if (rule !== "off" && key === "linkedin" && value) {
        const linkedinRegex =
          /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_]+\/?$/;
        if (!linkedinRegex.test(value)) {
          e.linkedin =
            "Please copy paste your LinkedIn URL, e.g., https://www.linkedin.com/in/username";
        }
      }
    }

    return e;
  };

  const handleChange = (name, value) => {
    console.log(name, value);
    setFormData((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    // setTouched((t) => ({ ...t, [name]: true }));
    setErrors(validate(formData));
  };

  const focusFirstError = (errObj) => {
    const keys = [
      "fullName",
      "email",
      "dateOfBirth",
      "pronoun",
      "domicile",
      "phoneNumber",
      "linkedin",
    ];
    for (const k of keys) {
      if (errObj[k] && refs[k]?.current?.focus) {
        refs[k].current.focus();
        break;
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleSubmitData = async (e) => {
    setIsLoading(true);

    e.preventDefault();
    const eObj = validate(formData);
    setErrors(eObj);
    setTouched({
      fullName: true,
      email: true,
      dateOfBirth: true,
      pronoun: true,
      domicile: true,
      phoneNumber: true,
      linkedin: true,
    });

    if (Object.keys(eObj).length === 0) {
      let imageUrl = null;

      const file = new File(
        [formData.profilePicture],
        `photo_${Date.now()}.png`,
        {
          type: "image/png",
          lastModified: Date.now(),
        }
      );

      if (file) {
        const fileName = `/uploads/${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from("images")
          .upload(fileName, file);

        if (error) {
          console.error("Upload failed:", uploadError.message);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("images")
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
      }

      const { data, error } = await supabase.from("candidate").insert({
        job_id: jobId,
        photo_profile: imageUrl,
        name: formData.fullName,
        birth_date: formData.dateOfBirth,
        pronoun: formData.pronoun,
        email: formData.email,
        phone_numbers: formData.phoneNumber,
        domicile: formData.domicile,
        linkedin: formData.linkedin,
      });

      if (error) {
        console.error(error);
        showToast(error.message, "error");
      } else {
        router.push("/candidate/success-apply");
      }
    } else {
      console.log("Error");
      focusFirstError(eObj);
    }

    setIsLoading(false);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.formSection}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={handleBack}>
            <FaArrowLeft />
          </button>
          <div className={styles.titleSection}>
            <h1 className={styles.mainTitle}>Apply Front End at Rakamin</h1>
            <p className={styles.subtitle}>ℹ️ This field required to fill</p>
          </div>
        </div>

        <div className={styles.formBody}>
          <span className={styles.requiredText}>* Required</span>
          <div
            className={`${styles.formField} ${styles.profilePictureSection}`}
          >
            <label className={styles.fieldLabelBold}>Photo Profile</label>
            <div className={styles.avatarDisplay}>
              <img
                src={
                  formData.profilePicture
                    ? formData.profilePicture
                    : "/images/avatar.png"
                }
                className={`${styles.avatar} ${formData.profilePicture ? styles.active : ""}`}
              />
            </div>
            <div>
              <button
                className="btn btn-secondary"
                onClick={() => setIsOpen(true)}
              >
                <FiUpload /> Take a Picture
              </button>
            </div>
          </div>

          {isVisible("fullName") && (
            <div className="input-group">
              <label>
                Full Name
                {isRequired("fullName") && (
                  <span className={styles.required}>*</span>
                )}
              </label>
              <input
                ref={refs.fullName}
                required={isRequired("fullName")}
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                className={errors.fullName && touched.fullName ? "error" : ""}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
                onBlur={handleBlur}
              />
              {errors.fullName && touched.fullName && (
                <ErrorMessage message={errors.fullName} />
              )}
            </div>
          )}
          {isVisible("dateOfBirth") && (
            <DatePicker
              ref={refs.dateOfBirth}
              errorMessage={errors.dateOfBirth}
              classError={errors.dateOfBirth && touched.dateOfBirth}
              label={"Date of Birth"}
              formData={formData.dateOfBirth}
              name={"dateOfBirth"}
              handleBlur={handleBlur}
              handleChange={handleChange}
              isRequired={isRequired("dateOfBirth")}
            />
          )}
          {isVisible("pronoun") && (
            <div className={styles.pronounWrapper}>
              <label>
                Pronoun (gender){" "}
                {isRequired("pronoun") && (
                  <span className={styles.required}>*</span>
                )}
              </label>
              <div className={styles.radioGroup}>
                <div className="radio-option">
                  <input
                    required={isRequired("pronoun")}
                    type="radio"
                    id="Female"
                    name="pronoun"
                    value="Female"
                    checked={formData.pronoun === "Female"}
                    onChange={(e) =>
                      handleChange(e.target.name, e.target.value)
                    }
                    onBlur={handleBlur}
                  />
                  <label htmlFor="Female">She/her (Female)</label>
                </div>
                <div className="radio-option">
                  <input
                    type="radio"
                    id="Male"
                    name="pronoun"
                    value="Male"
                    checked={formData.pronoun === "Male"}
                    onChange={(e) =>
                      handleChange(e.target.name, e.target.value)
                    }
                    onBlur={handleBlur}
                  />
                  <label htmlFor="Male" className={styles.radioLabel}>
                    He/him (Male)
                  </label>
                </div>
              </div>
              {errors.pronoun && touched.pronoun && (
                <ErrorMessage message={errors.pronoun} />
              )}
            </div>
          )}
          {isVisible("domicile") && (
            <Dropdown
              label={"Choose Your Domicile"}
              options={["Jakarta", "Bandung", "Surabaya", "Yogyakarta"]}
              ref={refs.domicile}
              errorMessage={errors.domicile}
              classError={errors.domicile && touched.domicile}
              formData={formData.domicile}
              name={"domicile"}
              handleBlur={handleBlur}
              handleChange={handleChange}
              isRequired={isRequired("domicile")}
            />
          )}
          {isVisible("phoneNumber") && (
            <InputPhone
              label={"Phone Number"}
              ref={refs.phoneNumber}
              errorMessage={errors.phoneNumber}
              formData={formData.phoneNumber}
              classError={errors.phoneNumber && touched.phoneNumber}
              name={"phoneNumber"}
              handleBlur={handleBlur}
              handleChange={handleChange}
              isRequired={isRequired("phoneNumber")}
            />
          )}
          {isVisible("email") && (
            <div className="input-group">
              <label>
                Email
                {isRequired("email") && (
                  <span className={styles.required}>*</span>
                )}
              </label>
              <input
                required={isRequired("email")}
                ref={refs.email}
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                className={errors.email && touched.email ? "error" : ""}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
                onBlur={handleBlur}
              />
              {errors.email && touched.email && (
                <ErrorMessage message={errors.email} />
              )}
            </div>
          )}
          {isVisible("linkedin") && (
            <div className="input-group">
              <label>
                Link LinkedIn
                {isRequired("linkedin") && (
                  <span className={styles.required}>*</span>
                )}
              </label>
              <input
                required={isRequired("linkedin")}
                ref={refs.linkedin}
                type="url"
                name="linkedin"
                placeholder="https://linkedin.com/in/username"
                value={formData.linkedin}
                className={errors.linkedin && touched.linkedin ? "error" : ""}
                onBlur={handleBlur}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
              />
              {errors.linkedin && touched.linkedin && (
                <ErrorMessage message={errors.linkedin} />
              )}
            </div>
          )}
        </div>
        <div className={styles.footerActions}>
          <div className={styles.submitBtn}>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-tertiary"
              style={{ width: "100%" }}
              onClick={handleSubmitData}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
      <HandPose
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
        handleChange={handleChange}
      />
    </div>
  );
}
