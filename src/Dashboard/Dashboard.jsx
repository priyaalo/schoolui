import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import Pagination from "@mui/material/Pagination";
import moment from "moment";

import CheckoutModal from "./CheckoutModal";
import CheckInModal from "./CheckInModal";
import EventCard from "../EventCard/EventCard";

import {
  getUserId,
  getAttendance,
  checkIn,
  checkOut,
  getEvent,
  attCardCalculation,
  updateAttendance,
} from "../api/serviceapi";

const Dashboard = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [user, setUser] = useState(null);
  const [attendanceTable, setAttendanceTable] = useState([]);
  const [attendanceId, setAttendanceId] = useState("");
  const [checkInStatus, setCheckInStatus] = useState(null);

  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [isCheckInModalOpen, setCheckInModalOpen] = useState(false);

  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const [filter, setFilter] = useState("thisMonth");
  const [event, setEvent] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [timeElapsed, setTimeElapsed] = useState("00:00:00");
  const [checkInTime, setCheckInTime] = useState(null);

  const [permissionHours, setPermissionHours] = useState(null);
  const [lateLogins, setLateLogins] = useState([]);
  const [onPermission, setOnPermission] = useState(false);
  const [onEarlyPermission, setOnEarlyPermission] = useState(false);
  const [per, setPer] = useState("");
  const [earlyPer, setEarlyPer] = useState("");

  const [selectedRemark, setSelectedRemark] = useState(null);

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  // ==================== API CALLS ====================

  const fetchUser = async () => {
    try {
      const res = await getUserId(userId);
      const userData = res.data.data.data[0];
      setUser(userData);
      setCheckInStatus(userData.checkInStatus);
    } catch (err) {
      console.error("Error fetching user:", err.message);
    }
  };

  const fetchLateCount = async () => {
    try {
      const response = await attCardCalculation(userId);
      const data = response.data.data;
      setPermissionHours(data.totalPermissionTimePerMonth);
      setLateLogins(data.lateLoginCount);
    } catch (error) {
      console.error("Error fetching late count:", error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const monthFlag = filter === "pastMonth";
      const response = await getAttendance(userId, monthFlag);
      const allData = response.data.data.data || [];

      const formattedData = allData.map((att) => {
        if (att.date) {
          const d = new Date(att.date);
          if (!isNaN(d)) {
            const day = String(d.getDate()).padStart(2, "0");
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const year = d.getFullYear();
            return { ...att, date: `${day}-${month}-${year}` };
          }
        }
        return att;
      });

      setAttendanceTable(formattedData);

      if (formattedData.length > 0) {
        setPer(formattedData[0]._id);
        setEarlyPer(formattedData[0]._id);
      }

      const pendingAttendance = [...allData]
        .filter((att) => !att.outTime)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      if (pendingAttendance.length > 0) {
        const lastPending = pendingAttendance[0];
        setAttendanceId(lastPending._id);
        setOnPermission(lastPending.onPermission === true);
        setOnEarlyPermission(lastPending.onEarlyPermission === true);
      }
    } catch (err) {
      console.error("Error fetching attendance:", err.message);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      const res = await getEvent();
      setEvent(res.data.data.data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  // ==================== HOOKS ====================
  useEffect(() => {
    if (!userId) {
      navigate("/");
    } else {
      fetchUser();
      fetchAttendance();
      fetchLateCount();
    }
  }, [navigate, userId, filter]);

  useEffect(() => {
    fetchEvents();
  }, []);

  // Timer
  useEffect(() => {
    if (!user?.checkInStatus || attendanceTable.length === 0) return;

    const inTime = attendanceTable?.[0]?.inTime;
    const startTime = inTime ? new Date(inTime) : null;
    setCheckInTime(startTime);

    const timer = setInterval(() => {
      if (!startTime) return;

      const currentTime = new Date(
        new Date().getTime() + (5 * 60 + 30) * 60000 // IST offset
      );
      let timeDifference = currentTime - startTime;

      if (timeDifference < 0) {
        setTimeElapsed("00:00:00");
        return;
      }

      const hours = Math.floor(timeDifference / (1000 * 60 * 60));
      const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

      setTimeElapsed(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [user?.checkInStatus, attendanceTable]);

  // ==================== ACTIONS ====================

  const handleCheckIn = async () => {
    if (isCheckingIn) return;
    setIsCheckingIn(true);

    try {
      if (onPermission && per) {
        await updateAttendance(per, new Date().toISOString(), userId);
        await fetchAttendance();
        await fetchUser();
        toast.success("Permission check-in Updated!", { autoClose: 1000 });
      } else if (onEarlyPermission && earlyPer) {
        await updateAttendance(earlyPer, new Date().toISOString(), userId);
        await fetchAttendance();
        await fetchUser();
        toast.success("Permission check-in Updated!", { autoClose: 1000 });
      } else {
        const response = await checkIn(userId);
        const newAttendanceId = response.data.data._id;
        setAttendanceId(newAttendanceId);
        await fetchLateCount();
        await fetchAttendance();
        await fetchUser();
        toast.success("Check-in successful!", { autoClose: 1000 });
      }
    } catch (err) {
      let errMsg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Something went wrong, please try again.";
      toast.error(errMsg, { autoClose: 1000 });
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckoutConfirm = async (remarks) => {
    if (isCheckingOut) return;
    setIsCheckingOut(true);

    try {
      const checkoutTime = new Date().toISOString();
      await checkOut(attendanceId, remarks, userId, checkoutTime);
      await fetchAttendance();
      await fetchUser();
      toast.success("Checkout successful!", { autoClose: 1000 });
    } catch (err) {
      let errMsg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Something went wrong, please try again.";
      toast.error(errMsg, { autoClose: 1000 });
    } finally {
      setIsCheckingOut(false);
      setCheckoutOpen(false);
    }
  };

  const handleCheckOut = () => setCheckoutOpen(true);

  // ==================== HELPERS ====================

  const tableFormatTime = (timestamp) => {
    if (!timestamp) return "-";
    const adjustedTime = moment.utc(timestamp);
    return adjustedTime.isValid() ? adjustedTime.format("hh:mm A") : "-";
  };

  const formatPermissionHours = (hoursDecimal) => {
    if (hoursDecimal == null || hoursDecimal === "-") return "-";
    const hours = Math.floor(hoursDecimal);
    const minutes = Math.round((hoursDecimal - hours) * 60);
    return `${hours} hr ${minutes} min`;
  };

  const rows = attendanceTable.map((ele) =>
    ele.onLeave
      ? {
          id: ele._id,
          isLeave: true,
          date: ele.date || "N/A",
          leaveText: "Leave",
        }
      : {
          id: ele._id,
          isLeave: false,
          date: ele.date || "N/A",
          login: tableFormatTime(ele.inTime),
          logout: tableFormatTime(ele.outTime),
          remarks: ele.remarks || "-",
          classHours: ele.totalWorkHours || "-",
          permission: formatPermissionHours(ele.permissionHours) || "-",
        }
  );

  const events = event.map((ev) => {
    const d = new Date(ev.date);
    return {
      id: ev._id,
      title: ev.title,
      subtitle: ev.description,
      date: moment(d).format("DD MMM YYYY"),
      icon: ev.eventType,
    };
  });

  const handlePageChange = (e, value) => setPage(value);
  const paginatedRows = rows.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const pageCount = Math.ceil(rows.length / rowsPerPage);

  // ==================== RENDER ====================

  return (
    <div className={styles.container}>
      <ToastContainer />

      {/* Top section */}
      <div className={styles.top}>
        <div className={styles.text}>
          <h1 className={styles.welcome}>Welcome Back, {user?.name}</h1>
        </div>
        <div className={styles.second}>
          <p className={styles.subtitle}>
            Your future starts with today’s attendance
          </p>
          <div className={styles.check}>
            {checkInStatus === false && (
              <button
                onClick={() => setCheckInModalOpen(true)}
                className={styles.checkIn}
              >
                Check-in
              </button>
            )}
            {checkInStatus === true && (
              <button onClick={handleCheckOut} className={styles.checkOut}>
                Check-out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Events Marquee */}
      {events.length === 0 ? (
        <div className={styles.noEventsWrapper}>
          <span className={styles.noEvents}>No events found</span>
        </div>
      ) : (
        <div className={styles.marqueeWrapper}>
          <div className={styles.marqueeTrack}>
            {[...Array(5)].flatMap(() =>
              events.map((ev, index) => (
                <EventCard
                  key={`${ev.id}-${index}`}
                  title={ev.title.charAt(0).toUpperCase() + ev.title.slice(1)}
                  subtitle={
                    ev.subtitle.charAt(0).toUpperCase() + ev.subtitle.slice(1)
                  }
                  date={ev.date}
                  type={ev.icon}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Permission + Late Login Cards */}
      <div className={styles.cardRow}>
        <div className={styles.col}>
          <div className={styles.card}>
            <button className={styles.circle}>P</button>
            <h4>Permission Hours</h4>
            <p>
              Total Permission hour:{" "}
              {permissionHours !== null ? permissionHours : "Loading..."}
            </p>
          </div>
        </div>
        <div className={styles.col}>
          <div className={styles.card}>
            <button className={styles.circle1}>L</button>
            <h4>Late Logins</h4>
            <p>
              Total Late Logins:{" "}
              {lateLogins !== null ? lateLogins : "Loading..."}
            </p>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className={styles.tableContainer}>
        <div className={styles.topBar}>
          <div>Class Hours: {timeElapsed}</div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={styles.dropdown}
          >
            <option value="thisMonth">This Month</option>
            <option value="pastMonth">Last Month</option>
          </select>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Login Time</th>
              <th>Logout Time</th>
              <th>Logout Remarks</th>
              <th>Class Hours</th>
              <th>Permission Hours</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "15px" }}>
                  No records found
                </td>
              </tr>
            ) : (
              paginatedRows.map((row) =>
                row.isLeave ? (
                  <tr
                    key={row.id}
                    style={{ backgroundColor: "#f8d7da", color: "#721c24" }}
                  >
                    <td>{row.date}</td>
                    <td
                      colSpan={6}
                      style={{ textAlign: "center", fontWeight: "bold" }}
                    >
                      {row.leaveText}
                    </td>
                  </tr>
                ) : (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td>{row.login}</td>
                    <td>{row.logout}</td>
                    <td
                      style={{
                        cursor: row.remarks ? "pointer" : "default",
                        maxWidth: "150px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: row.remarks ? "blue" : "black",
                      }}
                      onClick={() => {
                        if (row.remarks && row.remarks.trim() !== "-") {
                          setSelectedRemark(row.remarks);
                        }
                      }}
                      title={row.remarks ? "Click to view full remark" : ""}
                    >
                      {row.remarks ? row.remarks.split(".")[0] : "-"}
                    </td>
                    <td>{row.classHours}</td>
                    <td>{row.permission}</td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: "15px" }}
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
      </div>

      {/* Remark Popup */}
      {selectedRemark && (
        <div
          className={styles.popupOverlay}
          onClick={() => setSelectedRemark(null)}
        >
          <div
            className={styles.popupContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.popupHeader}>Remark</h3>
            <p className={styles.popupText}>
              {selectedRemark
                ? selectedRemark.charAt(0).toUpperCase() +
                  selectedRemark.slice(1)
                : "-"}
            </p>
            <button
              className={styles.popupCloseBtn}
              onClick={() => setSelectedRemark(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onCheckout={handleCheckoutConfirm}
      />

      {/* Check-in Modal */}
      <CheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setCheckInModalOpen(false)}
        onConfirm={async () => {
          await handleCheckIn();
          setCheckInModalOpen(false);
        }}
      />
    </div>
  );
};

export default Dashboard;
