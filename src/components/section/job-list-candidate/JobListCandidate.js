import React, { useState, useEffect } from "react";
import styles from "./JobListCandidate.module.css";
import Header from "@/components/layout/header/Header";
import { IoLocationOutline } from "react-icons/io5";
import { CiMoneyBill } from "react-icons/ci";
import { supabase } from "../../../../lib/supabase-client";

export default function JobListCandidate() {
  const [jobList, setJobList] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
      .from("job_list")
      .select("*")
      .eq("status", "Active");

      if (error) {
        console.error(error);
      } else {
        const formatted = data.map((job) => ({
          ...job,
          salary: {
            min_salary: job.min_salary,
            max_salary: job.max_salary,
          },
        }));
        setJobList(formatted);
        setSelectedJob(data[0]);
      }
    };

    fetchJobs();
  }, []);
  
  const items = selectedJob?.description
    .split(/\r?\n/)           
    .map((s) => s.trim())    
    .filter(Boolean);  

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <div className={styles.jobList}>
          {jobList?.map((job) => (
            <div
              key={job.uuid_id}
              className={`${styles.jobCard} ${selectedJob.uuid_id === job.uuid_id ? styles.active : ""}`}
              onClick={() => setSelectedJob(job)}
            >
              <div className={styles.jobCardHeader}>
                <div className={styles.jobLogo}>
                  <img src="/single-logo.svg" alt="Single Logo" />
                </div>
                <div className={styles.jobInfo}>
                  <h3 className={styles.jobTitle}>{job.name}</h3>
                  <p className={styles.jobCompany}>{job.company}</p>
                </div>
              </div>
              <div className={styles.jobMeta}>
                <div className={styles.jobMetaItem}>
                  <IoLocationOutline size={20} />
                  <span>{job.location}</span>
                </div>
                <div className={styles.jobMetaItem}>
                  <CiMoneyBill size={25} />
                  <span>
                    {"Rp" + job.min_salary + " - " + "Rp" + job.max_salary}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.jobDetail}>
          <div className={styles.jobDetailHeader}>
            <div className={styles.jobDetailInfo}>
              <div className={styles.jobDetailLogo}>
                <img src="/single-logo.svg" alt="Single Logo" />
              </div>
              <div className={styles.jobDetailText}>
                <div className={styles.jobTypeBadge}>{selectedJob?.type}</div>
                <h2 className={styles.jobDetailTitle}>{selectedJob?.name}</h2>
                <p className={styles.jobDetailCompany}>
                  {selectedJob?.company}
                </p>
              </div>
            </div>
            <button className="btn btn-primary">
              <a href={`/candidate/apply-job?job_id=${selectedJob?.uuid_id}`}>
                Apply
              </a>
            </button>
          </div>

          <div className={styles.jobDescription}>
            <ul className={styles.descriptionList}>
              {items?.map((item, index) => (
                <li key={index} className={styles.descriptionItem}>
                  <span className={styles.bullet}>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
