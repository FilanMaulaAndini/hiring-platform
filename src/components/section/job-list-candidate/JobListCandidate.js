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
      const { data, error } = await supabase.from("job_list").select("*");

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

  const jobs = [
    {
      id: 1,
      title: "UX Designer",
      company: "Rakamin",
      location: "Jakarta Selatan",
      salary: "Rp7.000.000 - Rp15.000.000",
      type: "Full-Time",
      logo: "💼",
      description: [
        "Develop, test, and maintain responsive, high-performance web applications using modern front-end technologies.",
        "Collaborate with UI/UX designers to translate wireframes and prototypes into functional code.",
        "Integrate front-end components with APIs and backend services.",
        "Ensure cross-browser compatibility and optimize applications for maximum speed and scalability.",
        "Write clean, reusable, and maintainable code following best practices and coding standards.",
        "Participate in code reviews, contributing to continuous improvement and knowledge sharing.",
        "Troubleshoot and debug issues to improve usability and overall application quality.",
        "Stay updated with emerging front-end technologies and propose innovative solutions.",
        "Collaborate in Agile/Scrum ceremonies, contributing to sprint planning, estimation, and retrospectives.",
      ],
    },
    {
      id: 3,
      title: "Frontend Developer",
      company: "Tech Corp",
      location: "Jakarta Pusat",
      salary: "Rp8.000.000 - Rp18.000.000",
      type: "Full-Time",
      logo: "💻",
      description: [
        "Build and maintain scalable web applications using React and Next.js.",
        "Work closely with backend developers to integrate RESTful APIs.",
        "Implement responsive designs and ensure mobile compatibility.",
        "Optimize application performance and loading times.",
        "Write unit tests and participate in QA processes.",
      ],
    },
    {
      id: 4,
      title: "Frontend Developer",
      company: "Tech Corp",
      location: "Jakarta Pusat",
      salary: "Rp8.000.000 - Rp18.000.000",
      type: "Full-Time",
      logo: "💻",
      description: [
        "Build and maintain scalable web applications using React and Next.js.",
        "Work closely with backend developers to integrate RESTful APIs.",
        "Implement responsive designs and ensure mobile compatibility.",
        "Optimize application performance and loading times.",
        "Write unit tests and participate in QA processes.",
      ],
    },
  ];

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
              {/* {selectedJob.description.map((item, index) => (
                <li key={index} className={styles.descriptionItem}>
                  <span className={styles.bullet}>•</span>
                  <span>{item}</span>
                </li>
              ))} */}
              {selectedJob?.description}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
