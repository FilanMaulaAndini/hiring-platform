"use client";
import React, { useState, useEffect, useRef } from "react";
import styles from "./JobOpeningModal.module.css";
import Dropdown from "@/components/ui/dropdown-custom/Dropdown";
import { supabase } from "../../../../../lib/supabase-client";
import { useToast } from "@/context/ToastContext";
import ErrorMessage from "@/components/ui/toast/ErrorMessage";

export default function JobOpeningModal({ isOpen, closeModal, refetch, editJob = null }) {
  const { toast, showToast } = useToast();
  const [requirements, setRequirements] = useState([
    { key: "fullName", validation: "mandatory" },
    { key: "photoProfile", validation: "mandatory" },
    { key: "pronoun", validation: "mandatory" },
    { key: "domicile", validation: "mandatory" },
    { key: "email", validation: "mandatory" },
    { key: "phoneNumber", validation: "mandatory" },
    { key: "linkedinLink", validation: "mandatory" },
    { key: "dateOfBirth", validation: "mandatory" },
  ]);
  const initial = {
    jobName: "",
    jobType: "",
    jobDescription: "",
    numberOfCandidates: "",
    minSalary: "",
    maxSalary: "",
    fields: requirements,
  };
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(initial);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const refs = {
    jobName: useRef(null),
    jobType: useRef(null),
    jobDescription: useRef(null),
    numberOfCandidates: useRef(null),
  };

  const validate = (values) => {
    const e = {};
    if (!values.jobName.trim()) e.jobName = "Job name is required.";
    if (!values.jobType.trim()) e.jobType = "Job type is required.";
    if (!values.jobDescription.trim())
      e.jobDescription = "Job description is required.";
    if (!values.numberOfCandidates.trim())
      e.numberOfCandidates = "Number of candidate is required.";

    return e;
  };

  const handleChange = (name, value) => {
    // console.log(e.target)
    // const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));

    // const { name, value, type, files, checked } = e.target;
    // setForm((prev) => ({
    //   ...prev,
    //   [name]: type === "file" ? files[0] : type === "checkbox" ? checked : value,
    // }));

    // // live-validate single field if user already touched it
    // if (touched[name]) {
    //   const newValues = { ...form, [name]: type === "file" ? files[0] : type === "checkbox" ? checked : value };
    //   setErrors(validate(newValues));
    // }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    // setTouched((t) => ({ ...t, [name]: true }));
    setErrors(validate(formData));
  };

  const focusFirstError = (errObj) => {
    const keys = ["jobName", "jobType", "jobDescription", "numberOfCandidates"];
    for (const k of keys) {
      if (errObj[k] && refs[k]?.current?.focus) {
        refs[k].current.focus();
        break;
      }
    }
  };

  const handleSubmitData = async (e) => {
    setIsLoading(true);

    e.preventDefault();
    const eObj = validate(formData);
    setErrors(eObj);
    setTouched({
      jobName: true,
      jobType: true,
      jobDescription: true,
      numberOfCandidates: true,
    });

    if (Object.keys(eObj).length === 0) {
      const { data, error } = await supabase.from("job_list").insert({
        name: formData.jobName,
        type: formData.jobType,
        description: formData.jobDescription,
        total_candidates: formData.numberOfCandidates,
        min_salary: formData.minSalary ? formData.minSalary : "0",
        max_salary: formData.maxSalary ? formData.maxSalary : "0",
        fields: requirements,
        status: "Active",
      });
      if (error) {
        console.error(error);
        showToast(error.message, "error");
      } else {
        showToast("Job vacancy successfully created!", "success");
        closeModal();
        setFormData(initial);
        setErrors({});
        setTouched({});
        refetch();
      }
    } else {
      focusFirstError(eObj);
    }

    setIsLoading(false);
  };


  const [isDraft, setIsDraft] = useState(false);

  // Load draft or edit data
  useEffect(() => {
    if (editJob) {
      setFormData({
        jobName: editJob.name || "",
        jobType: editJob.type || "",
        jobDescription: editJob.description || "",
        numberOfCandidates: editJob.total_candidates || "",
        minSalary: editJob.min_salary || "",
        maxSalary: editJob.max_salary || "",
        fields: editJob.fields || requirements,
      });
      setIsDraft(editJob.status === "Draft");
    }
  }, [editJob]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!isOpen) return;

    const autoSaveInterval = setInterval(() => {
      if (hasFormData()) {
        handleSaveAsDraft(true); // true = silent save
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [isOpen, formData]);

  // Check if form has any data
  const hasFormData = () => {
    return (
      formData.jobName.trim() ||
      formData.jobType.trim() ||
      formData.jobDescription.trim() ||
      formData.numberOfCandidates.trim() ||
      formData.minSalary.trim() ||
      formData.maxSalary.trim()
    );
  };

  // Save as Draft
  const handleSaveAsDraft = async (silent = false) => {
    if (!hasFormData()) {
      if (!silent) showToast("Please fill in at least one field", "error");
      return;
    }

    setIsLoading(true);

    try {
      const jobData = {
        name: formData.jobName || "Untitled Job",
        type: formData.jobType,
        description: formData.jobDescription,
        total_candidates: formData.numberOfCandidates || "0",
        min_salary: formData.minSalary || "0",
        max_salary: formData.maxSalary || "0",
        fields: requirements,
        status: "Draft",
        updated_at: new Date().toISOString(),
      };

      let result;

      if (editJob?.uuid_id) {
        // Update existing draft
        result = await supabase
          .from("job_list")
          .update(jobData)
          .eq("uuid_id", editJob.uuid_id)
          .select();
      } else {
        // Create new draft
        result = await supabase.from("job_list").insert({
          ...jobData,
          created_at: new Date().toISOString(),
        }).select();
      }

      const { data, error } = result;

      if (error) {
        console.error(error);
        if (!silent) showToast(error.message, "error");
      } else {
        if (!silent) {
          showToast("Draft saved successfully!", "success");
          closeModal();
          setFormData(initial);
          setErrors({});
          setTouched({});
        }
        refetch();
      }
    } catch (err) {
      console.error(err);
      if (!silent) showToast("Error saving draft", "error");
    }

    setIsLoading(false);
  };

  // Warn user before closing if form has data
  const handleClose = () => {
    if (hasFormData() && !editJob) {
      const confirmClose = window.confirm(
        "You have unsaved changes. Do you want to save as draft before closing?"
      );
      
      if (confirmClose) {
        handleSaveAsDraft();
        return;
      }
    }
    
    closeModal();
    setFormData(initial);
    setErrors({});
    setTouched({});
  };


  return (
    <div className={`${styles.modalOverlay} ${isOpen ? styles.show : ""}`}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Job Opening</h2>
          <button className={styles.closeBtn} onClick={handleClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className="input-group">
            <label>
              Job Name<span className={styles.required}>*</span>
            </label>
            <input
              ref={refs.jobName}
              required
              type="text"
              name="jobName"
              placeholder="Ex. Front End Engineer"
              value={formData.jobName}
              className={errors.jobName && touched.jobName ? "error" : ""}
              onBlur={handleBlur}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
            />
            {errors.jobName && touched.jobName && (
              <ErrorMessage message={errors.jobName} />
            )}
          </div>
          <Dropdown
            label={"Job Type"}
            options={[
              "Full Time",
              "Part Time",
              "Contract",
              "Freelance",
              "Internship",
            ]}
            ref={refs.jobType}
            errorMessage={errors.jobType}
            classError={errors.jobType && touched.jobType}
            formData={formData.jobType}
            handleBlur={handleBlur}
            handleChange={handleChange}
            isRequired={true}
          />

          <div className="input-group">
            <label>
              Job Description<span className={styles.required}>*</span>
            </label>
            <textarea
              ref={refs.jobDescription}
              required
              name="jobDescription"
              placeholder="Describe the position..."
              value={formData.jobDescription}
              className={
                errors.jobDescription && touched.jobDescription ? "error" : ""
              }
              onChange={(e) => handleChange(e.target.name, e.target.value)}
              style={{ height: 200 }}
            />
            {errors.jobDescription && touched.jobDescription && (
              <ErrorMessage message={errors.jobDescription} />
            )}
          </div>
          <div className="input-group">
            <label>
              Number of Candidates Needed
              <span className={styles.required}>*</span>
            </label>
            <input
              ref={refs.numberOfCandidates}
              required
              type="number"
              name="numberOfCandidates"
              className={
                errors.numberOfCandidates && touched.numberOfCandidates
                  ? "error"
                  : ""
              }
              placeholder="Ex. 2"
              value={formData.numberOfCandidates}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
            />
            {errors.numberOfCandidates && touched.numberOfCandidates && (
              <ErrorMessage message={errors.numberOfCandidates} />
            )}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Job Salary</label>
            <div className={styles.salaryGroup}>
              <div className="input-group">
                <label>Minimum Estimated Salary</label>
                <div className={styles.salaryInputWrapper}>
                  <span className={styles.salaryPrefix}>Rp</span>
                  <input
                    type="text"
                    name="minSalary"
                    className="custom-padding"
                    placeholder="7.000.000"
                    value={formData.minSalary}
                    onChange={(e) =>
                      handleChange(e.target.name, e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Maximum Estimated Salary</label>
                <div className={styles.salaryInputWrapper}>
                  <span className={styles.salaryPrefix}>Rp</span>
                  <input
                    type="text"
                    name="maxSalary"
                    className="custom-padding"
                    placeholder="8.000.000"
                    value={formData.maxSalary}
                    onChange={(e) =>
                      handleChange(e.target.name, e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <ProfileRequirements
            requirements={requirements}
            setRequirements={setRequirements}
          />
        </div>
        <div className={styles.modalFooter}>
          <button
            className="btn btn-tertiary"
            disabled={isLoading}
            onClick={handleSubmitData}
          >
            {isLoading ? "Publishing..." : "Publish Job"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileRequirements({ requirements, setRequirements }) {
  const fields = [
    { id: "fullName", label: "Full name", allowedOptions: ["mandatory"] },
    {
      id: "photoProfile",
      label: "Photo Profile",
      allowedOptions: ["mandatory", "optional", "off"],
    },
    {
      id: "pronoun",
      label: "Pronoun",
      allowedOptions: ["mandatory", "optional", "off"],
    },
    {
      id: "domicile",
      label: "Domicile",
      allowedOptions: ["mandatory", "optional", "off"],
    },
    { id: "email", label: "Email", allowedOptions: ["mandatory"] },
    {
      id: "phoneNumber",
      label: "Phone number",
      allowedOptions: ["mandatory", "optional", "off"],
    },
    {
      id: "linkedinLink",
      label: "Linkedin link",
      allowedOptions: ["mandatory", "optional", "off"],
    },
    {
      id: "dateOfBirth",
      label: "Date of birth",
      allowedOptions: ["mandatory", "optional", "off"],
    },
  ];

  const handleOptionChange = (fieldId, value, allowedOptions) => {
    if (!allowedOptions.includes(value)) return;

    setRequirements((prev) =>
      prev.map((item) =>
        item.key === fieldId ? { ...item, validation: value } : item
      )
    );
  };

  return (
    <div className={styles.wrapperRequired}>
      <div className={styles.formTitle}>
        Minimum Profile Information Required
      </div>
      <div className={styles.fieldsList}>
        {fields.map((field) => {
          const currentValidation = requirements.find(
            (item) => item.key === field.id
          )?.validation;
          return (
            <div key={field.id} className={styles.fieldRow}>
              <label className={styles.fieldLabel}>{field.label}</label>
              <div className={styles.optionsGroup}>
                <button
                  className={`${styles.optionBtn} ${
                    currentValidation === "mandatory" ? styles.active : ""
                  } ${
                    !field.allowedOptions.includes("mandatory")
                      ? styles.disabled
                      : ""
                  }`}
                  onClick={() =>
                    handleOptionChange(
                      field.id,
                      "mandatory",
                      field.allowedOptions
                    )
                  }
                  disabled={!field.allowedOptions.includes("mandatory")}
                >
                  Mandatory
                </button>
                <button
                  className={`${styles.optionBtn} ${
                    currentValidation === "optional" ? styles.active : ""
                  } ${
                    !field.allowedOptions.includes("optional")
                      ? styles.disabled
                      : ""
                  }`}
                  onClick={() =>
                    handleOptionChange(
                      field.id,
                      "optional",
                      field.allowedOptions
                    )
                  }
                  disabled={!field.allowedOptions.includes("optional")}
                >
                  Optional
                </button>
                <button
                  className={`${styles.optionBtn} ${
                    currentValidation === "off" ? styles.active : ""
                  } ${
                    !field.allowedOptions.includes("off") ? styles.disabled : ""
                  }`}
                  onClick={() =>
                    handleOptionChange(field.id, "off", field.allowedOptions)
                  }
                  disabled={!field.allowedOptions.includes("off")}
                >
                  Off
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
