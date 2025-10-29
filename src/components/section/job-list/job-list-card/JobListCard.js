"use client";
import React, { useState, useEffect } from "react";
import styles from "./JobListCard.module.css";
import { useRouter } from "next/navigation";
import moment from "moment";
import { supabase } from "../../../../../lib/supabase-client";
import { useToast } from "@/context/ToastContext";

export default function JobListCards({ jobs, refetch, updateJobStatus }) {
  const router = useRouter();
  const [jobStatuses, setJobStatuses] = useState({});
  const [isDeleting, setIsDeleting] = useState(null);
  const { toast, showToast } = useToast();

  useEffect(() => {
    if (jobs && jobs.length > 0) {
      const initialStatuses = {};
      jobs.forEach(job => {
        initialStatuses[job.uuid_id] = job.status;
      });
      setJobStatuses(initialStatuses);
    }
  }, [jobs]);

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

  const toggleStatus = (jobId, currentStatus) => {
    // Don't allow toggling draft jobs
    if (currentStatus === "Draft") {
      alert("Please publish the draft first");
      return;
    }

    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    
    // Optimistically update UI
    setJobStatuses(prev => ({
      ...prev,
      [jobId]: newStatus
    }));
    
    // Update in database
    updateJobStatus(jobId, newStatus);
  };

  const deleteJob = async (jobId, jobName) => {
    // Confirm deletion
    const confirmed = window.confirm(
      `Are you sure you want to delete "${jobName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setIsDeleting(jobId);

    try {
      const { error } = await supabase
        .from("job_list")
        .delete()
        .eq("uuid_id", jobId);

      if (error) {
        console.error("Error deleting job:", error);
        showToast?.("Failed to delete job", "error");
      } else {
        showToast?.("Job deleted successfully", "success");
        refetch(); // Refresh the job list
      }
    } catch (err) {
      console.error("Error:", err);
      showToast?.("Error deleting job", "error");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDetailClick = (uuid_id, isDraft, name) => {
    if(isDraft){
      deleteJob(uuid_id, name)
    } else {
      router.push(`/admin/manage-candidate?job_id=${uuid_id}`);
    }
  };

  return (
    <div>
      <div className={styles.jobList}>
        {jobs.map((job) => {
           const currentStatus = jobStatuses[job.uuid_id] || job.status;
           const statusStyle = getStatusStyles(currentStatus);
           const isDraft = currentStatus === "Draft";

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

                {!isDraft && (
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
                )}
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
                  className={`btn ${isDraft ? "btn-danger" : "btn-tertiary"}`}
                  onClick={() => handleDetailClick(job.uuid_id, isDraft, job.name)}
                >
                  {isDraft ? "Delete" : "Manage Job"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
