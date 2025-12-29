import React, { useEffect, useState } from "react";
import styles from "./Academics.module.css";
import { getPerformance } from "../api/serviceapi"; 

const Academics = () => {
  const [term, setTerm] = useState("term1");
  const [subjects, setSubjects] = useState([]);
  const [summary, setSummary] = useState({ total: 0, average: 0 });
  const [student, setStudent] = useState({ id: "", name: "" });
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    fetchAcademics();
  }, [term]);

  const fetchAcademics = async () => {
  try {
    setLoading(true);

    const studentId = localStorage.getItem("studentId");

    console.log("STUDENT ID:", studentId);

    if (!studentId) {
      console.error("studentId missing in localStorage");
      return;
    }

    const res = await getPerformance({
      studentId,
      academic: term,
    });

    const records = res?.data?.data?.data || [];

    const selected = records.find(
      (item) =>
        item.Academic?.toLowerCase() === term.toLowerCase() &&
        item.userDetails?.studentId === studentId
    );

    if (!selected) {
      setSubjects([]);
      setSummary({ total: 0, average: 0 });
      setStudent({ id: "", name: "" });
      return;
    }

    setSubjects(selected.Marks || []);
    setSummary({
      total: selected.total || 0,
      average: selected.average || 0,
    });

    setStudent({
      id: selected.userDetails?.studentId ?? "",
      name: selected.userDetails?.name ?? "",
    });

  } catch (error) {
    console.error("Failed to fetch academics", error);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className={styles.container}>
     
      <div className={styles.header}>
        <h2>Academics</h2>
        <select value={term} onChange={(e) => setTerm(e.target.value)}>
          <option value="term1">Term 1</option>
          <option value="term2">Term 2</option>
          <option value="sem1">Semester1</option>
          <option value="sem1">Semester1</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className={styles.cards}>
        <div className={styles.card}>
          <p>Total Marks</p>
          <h3>{summary.total}</h3>
        </div>

        <div className={styles.card}>
          <p>Average</p>
          <h3>{summary.average}%</h3>
        </div>

        <div className={styles.card}>
          <p>Result</p>
          <h3
            className={
              summary.average >= 40 ? styles.pass : styles.fail
            }
          >
            {summary.average >= 40 ? "PASS" : "FAIL"}
          </h3>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        {loading ? (
          <p className={styles.loading}>Loading...</p>
        ) : subjects.length === 0 ? (
          <p className={styles.noData}>No records found</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Subject</th>
                <th>Mark</th>
                <th>Total</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s, i) => {
                const total = s.total || 100;
                const percentage = s.mark
                  ? ((s.mark / total) * 100).toFixed(1)
                  : "0.0";

                return (
                  <tr key={i}>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    <td>{s.subject}</td>
                    <td>{s.mark}</td>
                    <td>{total}</td>
                    <td>{percentage}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Academics;
