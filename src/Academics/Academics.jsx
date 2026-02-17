import React, { useEffect, useState } from "react";
import styles from "./Academics.module.css";
import { getPerformance } from "../api/serviceapi";

const examOptions = {
  "Semester 1": [
    { label: "Term 1", value: "Term1" },
    { label: "Term 2", value: "Term2" },
    { label: "Semester 1", value: "Semester" },
  ],
  "Semester 2": [
    { label: "Term 1", value: "Term1" },
    { label: "Term 2", value: "Term2" },
    { label: "Semester 2", value: "Semester" },
  ],
};

const Academics = () => {
  const [semester, setSemester] = useState("sem1");
  const [exam, setExam] = useState("Term1");

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   setExam(examOptions[semester][0].value);
  // }, [semester]);

  useEffect(() => {
    fetchAcademics();
  }, [exam,semester]);

  const fetchAcademics = async () => {
    try {
      setLoading(true);

      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const res = await getPerformance({
        userId,
        academic: exam,
        exam: semester,
      });

      const records = res?.data?.data?.data || [];
      console.log(res.data.data.data[0].Academic)
      setSubjects(records);
    } catch (error) {
      console.error("Failed to fetch academics", error);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Academics</h2>

        <div className={styles.selectGroup}>
          <label className={styles.label}>
            Choose Semester
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            >
              <option value="sem1">Semester 1</option>
              <option value="sem2">Semester 2</option>
            </select>
          </label>

          {/* Exam */}
          <label className={styles.label}>
            Choose Exam
            <select value={exam} onChange={(e) => setExam(e.target.value)}>
              {/* {examOptions[semester].map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))} */}
              <option value="Term1">Term 1</option>
              <option value="Term2">Term 2</option>
              <option value="Semester">Semester</option>
            </select>
          </label>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className={styles.cards}>
        {subjects.length > 0 && (
          <>
            <div className={styles.card}>
              <p>Total Marks</p>
              <p>{subjects[0].total}</p>
            </div>

            <div className={styles.card}>
              <p>Average</p>
              <p>{subjects[0].average}%</p>
            </div>
          </>
        )}
      </div>

      {/* TABLE */}
      <div className={styles.tableWrapper}>
        {loading ? (
          <p className={styles.loading}>Loading...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Subject Code</th>
                <th>Subject Name</th>
                <th>Mark</th>
                <th>Status</th>
                  <th>Revaluation</th>
              </tr>
            </thead>

            <tbody>
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan="4" className={styles.noData}>
                    No records found
                  </td>
                </tr>
              ) : (
                subjects[0].Marks.map((mark, index) => (
                  <tr key={index}>
                    <td>{mark.subjectCode}</td>
                    <td>{mark.subjectName}</td>
                    <td>{mark.mark}</td>
                    {/* <td className={mark.mark < 40 ? styles.fail : styles.pass}>
                      {mark.mark < 40 ? "RA" : "P"}
                    </td> */}
                    <td
  className={
    mark.mark === "AA"
      ? styles.absent
      : mark.mark < 40
      ? styles.fail
      : styles.pass
  }
>
  {mark.mark === "AA"
    ? "AA"
    : mark.mark < 40
    ? "RA"
    : "P"}
</td>
 <td>
          {mark.revaluationUrl ? (
            <>
          
              <a
                href={mark.revaluationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.viewBtn}
              >
                View
              </a>

         
              <a
                href={mark.revaluationUrl}
                download
                className={styles.downloadBtn}
              >
                Download
              </a>
            </>
          ) : (
            <span>-</span>
          )}
        </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Academics;
