"use client";
import Header from "@/components/layout/header/Header";
import JobListCards from "./job-list-card/JobListCard";
import JobOpeningModal from "./job-opening-modal/JobOpeningModal";
import styles from "./JobList.module.css";
import React, { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import { supabase } from "../../../../lib/supabase-client";

export default function JobListPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [jobList, setJobList] = useState(false);
  const [isUpdated, setUpdated] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
      }
    };

    fetchJobs();
  }, [isUpdated]);

  const updateJobStatus = async (jobId, newStatus) => {
    try {
      const { data, error } = await supabase
        .from("job_list")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("uuid_id", jobId)
        .select();

      if (error) {
        console.error("Error updating status:", error);
        return null;
      } else {
        setJobList((prev) =>
          prev.map((j) =>
            j.uuid_id === jobId ? { ...j, status: newStatus } : j
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (term) => {
    const { data, error } = await supabase
      .from("job_list")
      .select("*")
      .ilike("name", `%${term}%`);

    // if (error) {
    //   console.error("Search error:", error);
    // } else {
    const formatted = data.map((job) => ({
      ...job,
      salary: {
        min_salary: job.min_salary,
        max_salary: job.max_salary,
      },
    }));
    console.log(formatted);
    // setJobList(formatted);
    // }
  };

  const jobs = [
    {
      id: 1,
      status: "active",
      title: "Front End Developer",
      startDate: "1 Oct 2025",
      salaryRange: "Rp7.000.000 - Rp8.000.000",
    },
    {
      id: 2,
      status: "inactive",
      title: "Data Scientist",
      startDate: "2 Oct 2025",
      salaryRange: "Rp7.000.000 - Rp12.500.000",
    },
    {
      id: 3,
      status: "draft",
      title: "Data Scientist",
      startDate: "3 Sep 2025",
      salaryRange: "Rp7.000.000 - Rp12.500.000",
    },
  ];

  return (
    <div>
      <Header />
      <main className={styles.content}>
        <div className={styles.leftSide}>
          <div className={styles.searchContainer}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Search by job details"
                value={searchTerm}
                onChange={(e) => {
                  const term = e.target.value;
                  setSearchTerm(term);
                  handleSearch(term);
                }}
              />
            </div>
            <button className={styles.searchIcon}>
              <IoIosSearch />
            </button>
          </div>
          {jobList.length > 0 ? (
            <JobListCards jobs={jobList} updateJobStatus={updateJobStatus} />
          ) : (
            <div className={styles.emptyState}>
              <img
                src="/emptystate.svg"
                alt="No job openings"
                className={styles.emptyImg}
              />
              <h3 className={styles.emptyTitle}>No job openings available</h3>
              <p className={styles.emptySubtitle}>
                Create a job opening now and start the candidate process.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setIsOpen(true)}
              >
                Create a new job
              </button>
            </div>
          )}
        </div>
        <div className={styles.sideCard}>
          <div className={styles.overlay}></div>
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>Recruit the best candidates</h3>
            <p className={styles.cardDesc}>
              Create jobs, invite, and hire with ease
            </p>
            <button
              className="btn btn-tertiary"
              onClick={() => setIsOpen(true)}
            >
              Create a new job
            </button>
          </div>
        </div>
        <JobOpeningModal
          isOpen={isOpen}
          closeModal={() => setIsOpen(false)}
          refetch={(prev) => setUpdated(!prev)}
        />
      </main>
    </div>
  );
}
