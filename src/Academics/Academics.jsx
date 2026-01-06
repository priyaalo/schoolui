import React, { useEffect, useState } from "react";
import styles from "./Academics.module.css";
import { getPerformance } from "../api/serviceapi";

const Academics = () => {
  const [term, setTerm] = useState("Term 1");
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
    if (!studentId) {
      console.error("studentId missing");
      return;
    }

    const res = await getPerformance(studentId, term);
    const records = res?.data?.data?.data || [];

    // ✅ FILTER CORRECT STUDENT + TERM
    const record = records.find(
      (item) =>
        item.userDetails?.studentId === studentId &&
        item.Academic === term
    );

    if (!record) {
      setSubjects([]);
      setSummary({ total: 0, average: 0 });
      setStudent({ id: "", name: "" });
      return;
    }

    setSubjects(record.Marks || []);
    setSummary({
      total: record.total || 0,
      average: record.average || 0,
    });

    setStudent({
      id: record.userDetails?.studentId || "",
      name: record.userDetails?.name || "",
    });
  } catch (error) {
    console.error("Failed to fetch academics", error);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h2>Academics</h2>
        <select value={term} onChange={(e) => setTerm(e.target.value)}>
          <option value="Term 1">Term 1</option>
          <option value="Term 2">Term 2</option>
          <option value="Sem 1">Semester 1</option>
          <option value="Sem 2">Semester 2</option>
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
          {subjects.length === 0 ? (
            <h3 className={styles.nil}>Nil</h3>
          ) : (
            <h3
              className={
                summary.average >= 40 ? styles.pass : styles.fail
              }
            >
              {summary.average >= 40 ? "PASS" : "FAIL"}
            </h3>
          )}
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
                const mark = Number(s.mark) || 0;
                const total = Number(s.total) || 100;
                const percentage = ((mark / total) * 100).toFixed(1);

                return (
                  <tr key={i}>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    <td>{s.subject}</td>
                    <td>{mark}</td>
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
