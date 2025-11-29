import React, { useState, useEffect } from "react";
import styles from "./LeaveManagement.module.css";
import LeaveRequestModal from "../LeaveRequest/LeaveRequest";
import {
  getLeaveTable,
  postLeaveRequest,
  monthCalculation,
} from "../api/serviceapi";
import { useParams } from "react-router-dom";
import Pagination from "@mui/material/Pagination";
import { FaEye } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../loader/Loader"
import noDataImg from "../assets/AloLogo/nodatasearch.png"

const LeaveManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveTable, setLeaveTable] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useParams();
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [leaveStats, setLeaveStats] = useState({
    sickLeaveTaken: 0,
    casualLeaveTaken: 0,
  });

  const [remarkPopup, setRemarkPopup] = useState({
    isOpen: false,
    text: "",
  });

  const fetchTable = async () => {
    try {
      setLoading(true);
      const res = await getLeaveTable(userId);
      setLeaveTable(res.data?.data?.result || []);
    } catch (err) {
      console.error("Error fetching leave table:", err.message);
      toast.error("Failed to fetch leave table", { position: "top-right" });
      setLeaveTable([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTable();
  }, [userId]);

  const leaveData = leaveTable.map((data) => {
    let leaveType = data.leaveType;
    let period = "";
    let days = data.noOfDays;

    let requestedOn = data.date
      ? new Date(data.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        })
      : "";
    const from = data.fromDate
      ? new Date(data.fromDate).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        })
      : "";
    const to = data.toDate
      ? new Date(data.toDate).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        })
      : "";
    period = from && to ? `${from} - ${to}` : from || to;

    if (data.leaveType === "permission") {
      leaveType = "Permission";
      const permissionDate = data.permissionDate
        ? new Date(data.permissionDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "UTC",
          })
        : "N/A";
      const startTime = data.startTime ? new Date(data.startTime) : null;
      const endTime = data.endTime ? new Date(data.endTime) : null;
      let timePeriod = "";
      if (startTime && endTime) {
        const options = {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "UTC",
        };
        timePeriod = `${startTime.toLocaleTimeString("en-Us", options)}-${endTime.toLocaleTimeString(
          "en-Us",
          options
        )}`;
      }
      let permissionHrs = data.permissionTime;
      const hours = Math.floor(permissionHrs);
      const mins = Math.round((permissionHrs - hours) * 60);
      const formattedHrs = `${hours}h ${mins}m`;

      requestedOn = permissionDate;
      period = timePeriod;
      days = formattedHrs;
    }
    if (data.leaveType === "earlyPermission") {
      leaveType = "Early Permission"; 
      const permissionDate = data.permissionDate
        ? new Date(data.permissionDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "UTC",
          })
        : "N/A";
      const startTime = data.startTime ? new Date(data.startTime) : null;
      const endTime = data.endTime ? new Date(data.endTime) : null;
      let timePeriod = "";
      if (startTime && endTime) {
        const options = {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "UTC",
        };
        timePeriod = `${startTime.toLocaleTimeString(
          "en-Us",
          options
        )}-${endTime.toLocaleTimeString("en-Us", options)}`;
      }
      let permissionHrs = data.permissionTime;
      const hours = Math.floor(permissionHrs);
      const mins = Math.round((permissionHrs - hours) * 60);
      const formattedHrs = `${hours}h ${mins}m`;

      requestedOn = permissionDate;
      period = timePeriod;
      days = formattedHrs; // only hours & mins, not days
    }

    return {
      id: data._id,
      name: data.userDetails?.name || "Unknown",
      type: leaveType,
      remarks: data.discription,
      requestedOn,
      period,
      days,
      status: data.status === "Created" ? "Pending" : data.status,
      respondedBy: data.approvedBy?.name || "-",
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
    let payload = {
      userId,
      status: "Created",
      discription: formData.reason,
    };

    if (formData.leaveType === "Sick Leave") {
      payload.leaveType = "Sick";
      payload.fromDate = formData.fromDate.format("YYYY-MM-DD") || null;
      payload.toDate = formData.toDate.format("YYYY-MM-DD") || null;
    } else if (formData.leaveType === "Casual Leave") {
      payload.leaveType = "Casual";
      payload.fromDate = formData.fromDate.format("YYYY-MM-DD") || null;
      payload.toDate = formData.toDate.format("YYYY-MM-DD") || null;
    } else if (formData.leaveType === "Permission") {
      payload.leaveType = "permission";
      payload.permissionDate = formData.permissionDate.format("YYYY-MM-DD") || null;
      payload.startTime = formData.fromTime.format("hh:mm A") || null;
      payload.endTime = formData.toTime.format("hh:mm A") || null;
    }else if (formData.leaveType === "Early Permission") {
      payload.leaveType = "earlyPermission";
      payload.permissionDate =
        formData.permissionDate.format("YYYY-MM-DD") || null;
      payload.startTime = formData.fromTime.format("hh:mm A") || null;
      payload.endTime = formData.toTime.format("hh:mm A") || null;
    }
    

    await postLeaveRequest(payload);

    // Show success toast at center
    toast.success(" Leave request submitted successfully!", {
      position: "top-right",
      autoClose: 2000, // close automatically after 2 seconds
    });

    fetchTable();

    // Close request form automatically after toast
   setIsModalOpen(false)

  } catch (err) {
    console.error(err.message, err.response?.data);
    const errorMsg =
      err.response?.data?.message ||
      err.response?.data ||
      err.message ||
      "Something went wrong";

    toast.error(`${errorMsg}`, {
      position: "top-right",
      autoClose: 2000, // close automatically after 2 seconds
    });

    // Close request form automatically after toast
    setTimeout(() => setIsModalOpen(false), 1000);
    setIsModalOpen(false)
  }
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
      console.error("Error fetching month calculation:", err.message);
      toast.error("Failed to fetch leave summary", { position: "top-right" });
    }
  };

  useEffect(() => {
    if (userId) monthCalc();
  }, [userId]);

  return (
    <div className={styles.req}>
      {loading && <Loader />}
     <ToastContainer
  position="top-right"
  autoClose={2000}
  hideProgressBar={false}
  newestOnTop={true}
  closeOnClick
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover
  theme="colored"
    style={{ marginTop: "80px" }} 
/>

      {/* Leave summary cards */}
      <div className={styles.row}>
        <div className={styles.col}>
          <div className={styles.card}>
            <button className={styles.circle}>SL</button>
            <h4>Sick Leave</h4>
            <p>Total Sick Leave: {leaveStats.sickLeaveTaken}</p>
          </div>
        </div>
        <div className={styles.col}>
          <div className={styles.card}>
            <button className={styles.circle1}>CL</button>
            <h4>Casual Leave</h4>
            <p>Total Casual Leave: {leaveStats.casualLeaveTaken}</p>
          </div>
        </div>
        <div className={styles.col}>
          <div className={styles.card}>
            <button className={styles.circle}>SL</button>
            <h4>Requested Leave Status</h4>
            <p>
              Recent requested Leave:{" "}
              <b>{leaveData.length > 0 ? leaveData[0]?.status || "Pending" : "Nill"}</b>
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
              <th>Name</th>
              <th>Type</th>
              <th>Requested On</th>
              <th>Period</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Responded By</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((data) => (
                <tr key={data.id}>
                 <td className={styles.capitalize}>{data.name}</td>

                  <td>{data.type}</td>
                  <td>{data.requestedOn}</td>
                  <td>{data.period}</td>
                  <td>
                    {data.type === "Permission" ||
                    data.type === "Early Permission"
                      ? data.days
                      : `${data.days} days`}
                  </td>
                  <td>
                    <span className={getStatusClass(data.status)}>{data.status}</span>
                  </td>
                  <td>
                    {data.remarks ? (
                      <FaEye
                        style={{ cursor: "pointer" }}
                        onClick={() => setRemarkPopup({ isOpen: true, text: data.remarks })}
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{data.respondedBy}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "1rem" }}>
                  <img
                    src={noDataImg}
                    alt="No Data Found"
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "contain",
                    }}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {/* Pagination - show only if data exists */}
        {leaveData.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "15px",
            }}
          >
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
        )}
      </div>

      {/* Remark Popup */}
      {remarkPopup.isOpen && (
        <div
          className={styles.popupOverlay}
          onClick={() => setRemarkPopup({ isOpen: false, text: "" })}
        >
          <div
            className={styles.popupContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Remarks</h3>
            <p>{remarkPopup.text}</p>
            <button onClick={() => setRemarkPopup({ isOpen: false, text: "" })}>Close</button>
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