import React, { useState, useEffect } from "react";
import styles from "./LeaveManagement.module.css";
import LeaveRequestModal from "../LeaveRequest/LeaveRequest";
import { getLeaveTable, postLeaveRequest, monthCalculation } from "../api/serviceapi";
import { useParams } from "react-router-dom";
import Pagination from "@mui/material/Pagination";
import { FaEye } from "react-icons/fa";

const LeaveManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveTable, setLeaveTable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successPopup, setSuccessPopup] = useState(false); // Inline success popup
  const { userId } = useParams();

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [leaveStats, setLeaveStats] = useState({
    sickLeaveTaken: 0,
    casualLeaveTaken: 0,
  });

  const [isRemarksModalOpen, setRemarksModalOpen] = useState(false);
  const [selectedRemark, setSelectedRemark] = useState("");

  const fetchTable = async () => {
    try {
      setLoading(true);
      const res = await getLeaveTable(userId);
      setLeaveTable(res.data?.data?.result || []);
    } catch (err) {
      console.error("Error fetching leave table:", err.message);
      setLeaveTable([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTable();
  }, [userId]);

  const leaveData = leaveTable.map((data) => {
    const from = data.fromDate
      ? new Date(data.fromDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
      : "";
    const to = data.toDate
      ? new Date(data.toDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
      : "";
    const requestedOn = data.date
      ? new Date(data.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : "";
    let period = from && to ? `${from} - ${to}` : from || to;
    let leaveType = data.leaveType;
    if (data.isPermission) {
      leaveType = "Permission";
      period = data.date
        ? new Date(data.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "N/A";
    }
    return {
      id: data._id,
      name: data.userDetails?.name || "Unknown",
      type: leaveType,
      remarks: data.discription || "No remarks",
      requestedOn,
      period,
      days: data.noOfDays,
      status: data.status === "Created" ? "Pending" : data.status,
      respondedBy: "dummy data",
    };
  });

  const pageCount = Math.ceil(leaveData.length / rowsPerPage);
  const paginatedRows = leaveData.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const handlePageChange = (event, value) => setPage(value);

  const getStatusClass = (status) => {
    if (status === "Pending") return styles.pending;
    if (status === "Approved") return styles.approved;
    if (status === "Rejected") return styles.rejected;
    return "";
  };

  const handleModalSubmit = async (formData) => {
    try {
      let payload = { userId, status: "Created", discription: formData.reason };
      if (formData.leaveType === "Sick Leave") {
        payload.leaveType = "Sick";
        payload.fromDate = formData.fromDate.format("YYYY-MM-DD") || null;
        payload.toDate = formData.toDate.format("YYYY-MM-DD") || null;
      } else if (formData.leaveType === "Casual Leave") {
        payload.leaveType = "Casual";
        payload.fromDate = formData.fromDate.format("YYYY-MM-DD") || null;
        payload.toDate = formData.toDate.format("YYYY-MM-DD") || null;
      } else if (formData.leaveType === "Permission") {
        payload.leaveType = "Permission";
        payload.permissionDate = formData.permissionDate.format("YYYY-MM-DD") || null;
        payload.startTime = formData.fromTime.format("hh:mm A") || null;
        payload.endTime = formData.toTime.format("hh:mm A") || null;
      }

      await postLeaveRequest(payload);
      fetchTable();
      setIsModalOpen(false);

      setSuccessPopup(true); // Show success
      setTimeout(() => setSuccessPopup(false), 3000);
    } catch (err) {
      console.error(err.message);
    }
  };

  const openRemarks = (remark) => {
    setSelectedRemark(remark || "No remarks");
    setRemarksModalOpen(true);
  };
  const closeRemarks = () => {
    setSelectedRemark("");
    setRemarksModalOpen(false);
  };

  const monthCalc = async () => {
    try {
      const response = await monthCalculation(userId);
      const data = response.data?.data;
      setLeaveStats({
        sickLeaveTaken: data?.sick?.currentYear || 0,
        casualLeaveTaken: data?.casual?.currentYear || 0,
      });
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    if (userId) monthCalc();
  }, [userId]);

  return (
    <div className={styles.req}>
      {/* Inline success popup */}
      {successPopup && (
        <div className={styles.successPopup}>
          Leave request submitted successfully!
        </div>
      )}

      {/* Leave summary cards */}
      <div className={styles.row}>
        <div className={styles.col}>
          <div className={styles.card}>
            <button className={styles.circle}>SL</button>
            <h4>Sick Leave</h4>
            <p>Available for the calendar year: {12 - leaveStats.sickLeaveTaken}</p>
          </div>
        </div>
        <div className={styles.col}>
          <div className={styles.card}>
            <button className={styles.circle1}>CL</button>
            <h4>Casual Leave</h4>
            <p>Available for the calendar year: {12 - leaveStats.casualLeaveTaken}</p>
          </div>
        </div>
        <div className={styles.col}>
          <div className={styles.card}>
            <button className={styles.circle}>SL</button>
            <h4>Requested Leave Status</h4>
            <p>
              Recent requested Leave: <b>{leaveData.length > 0 ? leaveData[0]?.status || "Pending" : "Nill"}</b>
            </p>
          </div>
        </div>
        <div className={styles.col}>
          <div className={styles.card1}>
            <button className={styles.button} onClick={() => setIsModalOpen(true)}>
              Request Leave
            </button>
          </div>
        </div>
      </div>

      {/* Leave table */}
      <div className={styles.container}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Remarks</th>
              <th>Name</th>
              <th>Type</th>
              <th>Requested On</th>
              <th>Period</th>
              <th>Days</th>
              <th>Status</th>
              <th>Responded By</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "1rem" }}>Loading...</td>
              </tr>
            ) : paginatedRows.length > 0 ? (
              paginatedRows.map((data) => (
                <tr key={data.id}>
                  <td
                    className={styles.remarksCell}
                    onClick={() => openRemarks(data.remarks)}
                    title="Click to view full remarks"
                    style={{ textAlign: "center", cursor: "pointer" }}
                  >
                    <FaEye className={styles.eyeIcon} />
                  </td>
                  <td>{data.name}</td>
                  <td>{data.type}</td>
                  <td>{data.requestedOn}</td>
                  <td>{data.period}</td>
                  <td>{data.days} days</td>
                  <td>
                    <span className={getStatusClass(data.status)}>{data.status}</span>
                  </td>
                  <td>{data.respondedBy}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "1rem" }}>No leave records found</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "15px" }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={handlePageChange}
            showFirstButton
            showLastButton
            sx={{
              "& .MuiPaginationItem-root": {
                borderRadius: "8px",
                marginX: "6px",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "linear-gradient(to right, #144196, #061530)",
                  color: "#fff",
                },
              },
              "& .Mui-selected": {
                background: "linear-gradient(to right, #144196, #061530)",
                color: "#fff",
                fontWeight: "bold",
                "&:hover": {
                  background: "linear-gradient(to right, #0b2d73, #061530)",
                },
              },
            }}
          />
        </div>
      </div>

      {/* Custom Remarks Modal */}
      {isRemarksModalOpen && (
        <div className={styles.modalOverlay} onClick={closeRemarks}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeRemarks} aria-label="Close">&times;</button>
            <h3 className={styles.modalTitle}>Remarks</h3>
            <div className={styles.modalContent}>
              <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{selectedRemark}</p>
            </div>
            <div style={{ marginTop: 16, textAlign: "right" }}>
              <button className={styles.modalOk} onClick={closeRemarks}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Request modal */}
      <LeaveRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};

export default LeaveManagement;
