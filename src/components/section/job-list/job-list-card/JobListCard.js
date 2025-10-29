"use client";
import React, { useState } from "react";
import styles from "./JobListCard.module.css";
import { useRouter } from "next/navigation";
import moment from "moment";

export default function JobListCards({ jobs, updateJobStatus }) {
  const router = useRouter();
  const [selectedJob, setSelectedJob] = useState(null);

  const getStatusStyles = (status) => {
    switch (status) {
      case "Active":
        return { background: "#dcfce7", color: "#16a34a", border: "#16a34a" };
      case "Inactive":
        return { background: "#fee2e2", color: "#dc2626", border: "#dc2626" };
      case "Draft":
        return { background: "#fef3c7", color: "#d97706", border: "#d97706" };
      default:
        return {};
    }
  };

  const handleDetailClick = (uuid_id) => {
    router.push(`/admin/manage-candidate?job_id=${uuid_id}`);
  };

  return (
    <div>
      <div className={styles.jobList}>
        {jobs.map((job) => {
          const statusStyle = getStatusStyles(job.status);
          const [isActive, setIsActive] = useState(job.status);
          const newStatus = isActive ? "Inactive" : "Active";
          const toggleStatus = () => {
            setIsActive(!isActive);
            updateJobStatus(job.uuid_id, newStatus);
          };

          return (
            <div key={job.uuid_id} className={styles.jobCard}>
              <div className={styles.jobHeader}>
                <div className={styles.statusWrapper}>
                  <div
                    className={styles.statusBadge}
                    style={{
                      background: statusStyle.background,
                      color: statusStyle.color,
                      borderColor: statusStyle.border,
                    }}
                  >
                    {job.status}
                  </div>
                  <div className={styles.dateBadge}>
                    started on {moment(job.created_at).format("DD MMMM YYYY")}
                  </div>
                </div>

                <div className={styles.toggleContainer}>
                  <label className={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      checked={job.status === "Inactive"}
                      onChange={toggleStatus}
                      className={styles.toggleInput}
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                  <span className={styles.toggleText}>Inactive</span>
                </div>
              </div>

              <div className={styles.jobContent}>
                <div className={styles.jobInfo}>
                  <h3 className={styles.jobTitle}>{job.name}</h3>
                  <p className={styles.jobSalary}>
                    {"Rp" +
                      job.salary.min_salary +
                      " - " +
                      "Rp" +
                      job.salary.max_salary}
                  </p>
                </div>
                <button
                  className="btn btn-tertiary"
                  onClick={() => handleDetailClick(job.uuid_id)}
                >
                  Manage Job
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
