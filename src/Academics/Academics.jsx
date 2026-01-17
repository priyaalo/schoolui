import React, { useEffect, useState } from "react";
import styles from "./Academics.module.css";
import { getPerformance, getLeaderboard } from "../api/serviceapi";

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
  const [toppers, setToppers] = useState([]);


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
        (item) => String(item.Academic).trim() === String(term).trim()
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

      /* ================= TOPPER LIST ================= */
      const topperRes = await getLeaderboard(term);

      // ✅ FRONTEND FILTER (VERY IMPORTANT)
      const filteredToppers = (topperRes?.data?.data || [])
        .filter(
          (t) => String(t.Academic).trim() === String(term).trim()
        )
        .sort((a, b) => b.average - a.average)
        .slice(0, 3);

      setToppers(filteredToppers);
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

        <select value={semester} onChange={(e) => setSemester(e.target.value)}>
          <option value="Semester 1">Semester 1</option>
          <option value="Semester 2">Semester 2</option>
        </select>

        <select value={term} onChange={(e) => setTerm(e.target.value)}>
          {semesterOptions[semester].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
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

        <div className={styles.card}>
          <p>Result</p>
          {subjects.length === 0 ? (
            <h3 className={styles.nil}>Nil</h3>
          ) : (
            <h3 className={summary.average >= 40 ? styles.pass : styles.fail}>
              {summary.average >= 40 ? "PASS" : "FAIL"}
            </h3>
          )}
        </div>
      </div>

      <div className={styles.topperSection}>
        <h4>{term} Topper List</h4>

        {toppers.length === 0 ? (
          <p className={styles.noData}>No topper data</p>
        ) : (
          <div className={styles.topperList}>
            {toppers.map((t, index) => (
              <div key={t.studentId} className={styles.topperCard}>
                <span className={styles.rank}>#{index + 1}</span>
                <p className={styles.name}>{t.name}</p>
                <p className={styles.percent}>{t.average}%</p>
              </div>
            ))}
          </div>
        )}
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

                  return (
                    <tr key={i}>
                      <td>{student.id}</td>
                      <td>{student.name}</td>
                      <td>{s.subject}</td>
                      <td>{mark}</td>
                      <td>100</td>
                      <td>{percentage}%</td>
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
