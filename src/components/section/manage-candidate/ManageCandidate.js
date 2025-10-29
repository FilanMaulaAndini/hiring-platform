import React, { useState, useEffect } from "react";
import styles from "./ManageCandidate.module.css";
import Header from "@/components/layout/header/Header";
import { supabase } from "../../../../lib/supabase-client";
import moment from "moment";
import { useSearchParams } from "next/navigation";

export default function ManageJob() {
  const [listCandidates, setListCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const jobId = useSearchParams().get("job_id");

  useEffect(() => {
    const fetchCandidates = async () => {
      const { data, error } = await supabase
        .from("candidate")
        .select("*")
        .eq("job_id", jobId);

      if (error) {
        console.error(error);
      } else {
        setListCandidates(data);
      }
    };

    fetchCandidates();
  }, []);

  const candidates = [
    {
      id: 1,
      name: "Aurelie Yukiko",
      email: "aurelieyukiko.yahoo.com",
      phone: "082120908766",
      dob: "30 January 2001",
      domicile: "Jakarta",
      gender: "Female",
      linkedin: "https://www.linkedin.com/in/username",
    },
    {
      id: 2,
      name: "Dityo Hendyawan",
      email: "dityohendyawan@yaho...",
      phone: "081184180678",
      dob: "30 January 2001",
      domicile: "Jakarta",
      gender: "Female",
      linkedin: "https://www.linkedin.com/in/username",
    },
  ];

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCandidates(candidates.map((c) => c.id));
    } else {
      setSelectedCandidates([]);
    }
  };

  const toggleSelectCandidate = (id) => {
    if (selectedCandidates.includes(id)) {
      setSelectedCandidates(selectedCandidates.filter((cId) => cId !== id));
    } else {
      setSelectedCandidates([...selectedCandidates, id]);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <h1 className={styles.pageTitle}>Front End Developer</h1>
        <div className={styles.tableContainer}>
          {listCandidates.length > 0 ? (
            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th className={styles.checkboxCell}>
                      <label className={styles.customCheckbox}>
                        <input
                          type="checkbox"
                          onChange={toggleSelectAll}
                          checked={
                            selectedCandidates.length === candidates.length
                          }
                        />
                        <span className={styles.checkmark}></span>
                      </label>
                    </th>
                    <th>NAMA LENGKAP</th>
                    <th>EMAIL ADDRESS</th>
                    <th>PHONE NUMBERS</th>
                    <th>DATE OF BIRTH</th>
                    <th>DOMICILE</th>
                    <th>GENDER</th>
                    <th>LINK LINKEDIN</th>
                  </tr>
                </thead>
                <tbody>
                  {listCandidates.map((candidate) => (
                    <tr key={candidate.id}>
                      <td className={styles.checkboxCell}>
                        <label className={styles.customCheckbox}>
                          <input
                            type="checkbox"
                            checked={selectedCandidates.includes(candidate.id)}
                            onChange={() => toggleSelectCandidate(candidate.id)}
                          />
                          <span className={styles.checkmark}></span>
                        </label>
                      </td>
                      <td className={styles.nameCell}>{candidate.name}</td>
                      <td>{candidate.email}</td>
                      <td>{candidate.phone_numbers}</td>
                      <td>
                        {moment(candidate.birth_date).format("DD MMMM YYYY")}
                      </td>
                      <td>{candidate.domicile}</td>
                      <td>{candidate.gender}</td>
                      <td>
                        <a
                          href={candidate.linkedin}
                          className={styles.linkCell}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {candidate.linkedin}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>{" "}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <img
                src="/emptystate-candidate.svg"
                alt="No job openings"
                className={styles.emptyImg}
              />
              <h3 className={styles.emptyTitle}>No candidates found</h3>
              <p className={styles.emptySubtitle}>
                Share your job vacancies so that more candidates will apply
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
