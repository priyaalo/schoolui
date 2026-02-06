import React, { useEffect, useState } from "react";
import styles from "./Academics.module.css";
import { getPerformance } from "../api/serviceapi";

const semesterOptions = {
  "Semester 1": ["Term 1", "Term 2", "Semester 1"],
  "Semester 2": ["Term 3", "Term 4", "Semester 2"],
};

const Academics = () => {
  const [semester, setSemester] = useState("Semester 1");
  const [term, setTerm] = useState("Term 1");

  const [subjects, setSubjects] = useState([]);
  const [summary, setSummary] = useState({ total: 0, average: 0 });
  const [student, setStudent] = useState({ id: "", name: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTerm(semesterOptions[semester][0]);
  }, [semester]);

 
  useEffect(() => {
    fetchAcademics();
  }, [term]);

  const fetchAcademics = async () => {
    try {
      setLoading(true);

      const studentId = localStorage.getItem("studentId");
      if (!studentId) return;

      const perfRes = await getPerformance({
        studentId,          
        academic: term,
      });

      const records = perfRes?.data?.data?.data || [];

      const record = records.find(
        (item) =>
          String(item.userDetails?.studentId) === String(studentId) &&
          String(item.Academic).trim() === String(term).trim()
      );

      if (record) {
        setSubjects(record.Marks || []);
        setSummary({
          total: record.total || 0,
          average: record.average || 0,
        });
        setStudent({
          id: record.userDetails?.studentId || "",
          name: record.userDetails?.name || "",
        });
      } else {
        setSubjects([]);
        setSummary({ total: 0, average: 0 });
        setStudent({ id: "", name: "" });
      }
    } catch (err) {
      console.error("Failed to fetch academics", err);
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
        <option value="Semester 1">Semester 1</option>
        <option value="Semester 2">Semester 2</option>
      </select>
    </label>

    <label className={styles.label}>
      Choose Exam
      <select value={term} onChange={(e) => setTerm(e.target.value)}>
        {semesterOptions[semester].map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </label>
  </div>
</div>


      
      <div className={styles.cards}>
        <div className={styles.card}>
          <p>Total Marks</p>
          <h3>{summary.total}</h3>
        </div>

        <div className={styles.card}>
          <p>Average</p>
          <h3>{summary.average}%</h3>
        </div>

       
      </div>

     
      <div className={styles.tableWrapper}>
        {loading ? (
          <p className={styles.loading}>Loading...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Subject</th>
                <th>Mark</th>
                <th>Total</th>
                <th>Percentage</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan="6" className={styles.noData}>
                    No records found
                  </td>
                </tr>
              ) : (
        subjects.map((s, i) => {
  const mark = Number(s.mark) || 0;
  const percentage = ((mark / 100) * 100).toFixed(1);

  // ✅ STATUS per subject
  const status = percentage < 40 ? "RA" : "P";

  return (
    <tr key={i}>
      <td>{student.id}</td>
      <td>{student.name}</td>
      <td>{s.subject}</td>
      <td>{mark}</td>
      <td>100</td>
      <td>{percentage}%</td>
      <td className={status === "P" ? styles.pass : styles.fail}>
        {status}
      </td>
    </tr>
  );
})

              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Academics;

