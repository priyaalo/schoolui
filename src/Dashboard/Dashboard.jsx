import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import Pagination from "@mui/material/Pagination";
import moment from "moment";

import CheckoutModal from "./CheckoutModal";
import CheckInModal from "./CheckInModal";
import BreakModal from "./BreakModal";
import EventCard from "../EventCard/EventCard";
import Loader from "../loader/Loader";
import noDataImg from "../assets/AloLogo/nodatasearch.png";
import EndBreakModal from "./EndBreakModal";

import {
  getUserId,
  getAttendance,
  checkIn,
  checkOut,
  getEvent,
  attCardCalculation,
  updateAttendance,
  startBreak,
  getAttendanceRate,
} from "../api/serviceapi";

const Dashboard = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [user, setUser] = useState(null);

  // fullAttendance = ALL records fetched from server (formatted)
  const [fullAttendance, setFullAttendance] = useState([]);

  // attendanceTable = filtered list shown in table (thisMonth / pastMonth)
  const [attendanceTable, setAttendanceTable] = useState([]);

  // attendanceId used for actions (we keep it pointing to today's attendance when exists)
  const [attendanceId, setAttendanceId] = useState(null);

  const [checkInStatus, setCheckInStatus] = useState(false);
  const [breakStatus, setBreakStatus] = useState(false);

  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [isCheckInModalOpen, setCheckInModalOpen] = useState(false);
  const [isBreakModalOpen, setBreakModalOpen] = useState(false);
  const [isEndBreakModalOpen, setEndBreakModalOpen] = useState(false);
  const [attendanceRate, setAttendanceRate] = useState(null);

  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("thisMonth");
  const [event, setEvent] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const [timeElapsed, setTimeElapsed] = useState("00:00:00");
  const [checkInTime, setCheckInTime] = useState(null);

  const [permissionHours, setPermissionHours] = useState(null);
  const [lateLogins, setLateLogins] = useState([]);
  const [onPermission, setOnPermission] = useState(false);
  const [onEarlyPermission, setOnEarlyPermission] = useState(false);
  const [per, setPer] = useState("");
  const [earlyPer, setEarlyPer] = useState("");

  const [selectedRemark, setSelectedRemark] = useState(null);

  // Today record (single source of truth for button state)
  const [todayRecord, setTodayRecord] = useState(null);

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  /* -------------------------
     Fetch user
  ------------------------- */
  const fetchUser = async () => {
    try {
      const res = await getUserId(userId);
      const userData = res.data.data.data[0];
      setUser(userData);
      setCheckInStatus(userData.checkInStatus);
      setBreakStatus(userData.breakStatus);
    } catch (err) {
      console.error("Error fetching user:", err.message);
    }
  };

  /* -------------------------
     Late / Permission counts
  ------------------------- */
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

  /* -------------------------
     Fetch attendance (IMPORTANT)
     - Always fetch ALL attendance (no server-side month filter)
     - Format, set fullAttendance
     - Client-side filter to set attendanceTable (thisMonth / pastMonth)
     - Find today's record and set todayRecord
  ------------------------- */
  const fetchAttendance = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      // Always fetch all months from server (pass false for monthFlag)
      const response = await getAttendance(userId, false);
      const allData = response.data.data.data || [];

      // 1) Format data and keep rawDate
      const formattedAll = allData.map((att) => {
        let formatted = { ...att };
        if (att.date) {
          const d = new Date(att.date);
          if (!isNaN(d)) {
            const day = String(d.getDate()).padStart(2, "0");
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const year = d.getFullYear();
            formatted.date = `${day}-${month}-${year}`;
            formatted.rawDate = att.date;
          }
        }
        return formatted;
      });

      // store full attendance (formatted) - used to compute today/others
      setFullAttendance(formattedAll);

      // 2) Client-side filter for table view based on `filter`
      const now = new Date();
      const filtered = formattedAll.filter((att) => {
        if (!att.rawDate) return false;
        const d = new Date(att.rawDate);
        if (filter === "thisMonth") {
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        } else {
          // pastMonth -> last month
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
        }
      });

      setAttendanceTable(filtered);

      // 3) Find today's record from full data (raw)
      const todayStr = new Date().toISOString().split("T")[0];
      const todayRec = formattedAll.find((a) => {
        if (!a.rawDate) return false;
        const recDateStr = new Date(a.rawDate).toISOString().split("T")[0];
        return recDateStr === todayStr;
      }) || null;

      setTodayRecord(todayRec);

      // set attendanceId to today's record id (if exists) so actions act on today's record
      if (todayRec && todayRec._id) {
        setAttendanceId(todayRec._id);
        setOnPermission(todayRec.onPermission === true);
        setOnEarlyPermission(todayRec.onEarlyPermission === true);
      } else {
        setAttendanceId(null);
        setOnPermission(false);
        setOnEarlyPermission(false);
      }

      // 4) Keep your per/earlyPer logic (first formatted row if any)
      if (formattedAll.length > 0) {
        setPer(formattedAll[0]._id);
        setEarlyPer(formattedAll[0]._id);
      }

      // 5) Attendance rate (unchanged)
      try {
        function formatDate(date) {
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const dd = String(date.getDate()).padStart(2, "0");
          return `${yyyy}-${mm}-${dd}`;
        }

        const nowDate = new Date();

        const startOfMonth = formatDate(new Date(nowDate.getFullYear(), nowDate.getMonth(), 1));
        const endOfMonth = formatDate(new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, 0));

        const fromDate = startOfMonth;
        const toDate = endOfMonth;

        const rateRes = await getAttendanceRate(userId, fromDate, toDate);
        const rate = rateRes.data.data?.attendanceRate || 0;
        setAttendanceRate(rate);
      } catch (error) {
        console.error("Error fetching attendance rate:", error);
      }
    } catch (err) {
      console.error("Error fetching attendance:", err.message);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  /* -------------------------
     Events
  ------------------------- */
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

  /* -------------------------
     Effects
  ------------------------- */
  useEffect(() => {
    if (!userId) navigate("/");
    else {
      fetchUser();
      fetchAttendance(true);
      fetchLateCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, userId]);

  // When filter changes, we already fetch all attendance on mount,
  // but fetchAttendance will re-run and apply client-side filter again.
  useEffect(() => {
    if (userId) fetchAttendance(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, userId]);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Use todayRecord for timer instead of attendanceTable[0]
  useEffect(() => {
    if (!todayRecord?.inTime) {
      setTimeElapsed("00:00:00");
      setCheckInTime(null);
      return;
    }

    const inTime = todayRecord.inTime;
    const startTime = inTime ? new Date(inTime) : null;
    setCheckInTime(startTime);

    const timer = setInterval(() => {
      if (!startTime) return;
      // convert to IST offset handling - original used +5:30
      const currentTime = new Date(new Date().getTime() + (5 * 60 + 30) * 60000);
      let timeDifference = currentTime - startTime;

      if (timeDifference < 0) {
        setTimeElapsed("00:00:00");
        return;
      }

      const hours = Math.floor(timeDifference / (1000 * 60 * 60));
      const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

      setTimeElapsed(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [todayRecord]);

  /* -------------------------
     Actions
  ------------------------- */
  const handleCheckIn = async () => {
    if (isCheckingIn) return;
    setIsCheckingIn(true);

    try {
      if (onPermission && per) {
        await updateAttendance(per, new Date().toISOString(), userId);
        await fetchAttendance(false);
        await fetchUser();
        toast.success("Permission check-in Updated!", { autoClose: 1000 });
      } else if (onEarlyPermission && earlyPer) {
        await updateAttendance(earlyPer, new Date().toISOString(), userId);
        await fetchAttendance(false);
        await fetchUser();
        toast.success("Permission check-in Updated!", { autoClose: 1000 });
      } else {
        const response = await checkIn(userId);
        const newAttendanceId = response.data.data._id;
        setAttendanceId(newAttendanceId);

        await fetchLateCount();
        await fetchAttendance(false);
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

  // Start break — now allow only one break per day
  const handleStartBreak = async () => {
    if (!attendanceId) {
      toast.error("No active attendance record found!", { autoClose: 1000 });
      return;
    }

    try {
      // compute break count from todayRecord
      const breakCount = todayRecord?.breakTime?.length || 0;

      if (breakCount >= 1) {
        toast.error("You have already taken a break today!", { autoClose: 1000 });
        return;
      }

      const response = await startBreak(attendanceId, new Date().toISOString());
      const updatedBreakStatus = response.data.data?.breakStatus;
      setBreakStatus(updatedBreakStatus);

      await fetchAttendance(false);
      await fetchUser();

      toast.success("Break started successfully!", { autoClose: 1000 });
      setBreakModalOpen(false);
    } catch (err) {
      console.error("Error starting break:", err);
      toast.error("Failed to start break", { autoClose: 1000 });
    }
  };

  // End break — using same API (your code used startBreak for end as well)
  const handleEndBreak = async () => {
    if (!attendanceId) {
      toast.error("No active attendance record found!", { autoClose: 1000 });
      return;
    }

    try {
      // call same startBreak function (server toggles break status)
      const response = await startBreak(attendanceId, new Date().toISOString());
      const updatedBreakStatus = response.data.data?.breakStatus;
      setBreakStatus(updatedBreakStatus);

      await fetchAttendance(false);
      await fetchUser();

      toast.success("Break ended successfully!", { autoClose: 1000 });
    } catch (err) {
      console.error("Error ending break:", err);
      toast.error("Failed to end break", { autoClose: 1000 });
    }
  };

  const handleCheckoutConfirm = async (remarks) => {
    if (isCheckingOut) return;
    setIsCheckingOut(true);

    try {
      const checkoutTime = new Date().toISOString();
      await checkOut(attendanceId, remarks, userId, checkoutTime);

      await fetchAttendance(false);
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

  /* -------------------------
     Derived booleans from todayRecord (SINGLE SOURCE OF TRUTH)
     - isCheckedIn: true when todayRecord has inTime
     - isOnBreak: true when todayRecord.breakStatus === true (or breakTime active)
     - isCheckedOut: true when todayRecord.outTime present
     - breakCount: todayRecord.breakTime?.length
  ------------------------- */
  const isCheckedIn = Boolean(todayRecord?.inTime);
  const isCheckedOut = Boolean(todayRecord?.outTime);
  // breakStatus may also come from user... prefer today's record value if available
  const isOnBreak = Boolean(todayRecord?.breakStatus) || breakStatus === true;
  const breakCount = todayRecord?.breakTime?.length || 0;

  /* -------------------------
     hasCheckedInToday - used to disable the check-in button when user already checked in today
     (checks todayRecord)
  ------------------------- */
  const hasCheckedInToday = !!(todayRecord && todayRecord.inTime && !todayRecord.deleted);

  /* -------------------------
     Helpers for table formatting
  ------------------------- */
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

  const rows = attendanceTable.map((ele) => {
    if (ele.onLeave === true) {
      return {
        id: ele._id,
        isLeave: true,
        date: ele.date || "N/A",
        leaveText: "Leave",
      };
    }

    return {
      id: ele._id,
      isLeave: false,
      date: ele.date || "N/A",
      login: tableFormatTime(ele.inTime) || "N/A",
      logout: tableFormatTime(ele.outTime) || "N/A",
      remarks: ele.remarks || "-",
      breakTime: ele.breakHours || "N/A",
      classHours: ele.totalWorkHours || "-",
      permission: formatPermissionHours(ele.permissionHours) || "-",
    };
  });

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

  const loopedEvents = Array(20).fill(events).flat();
  const handlePageChange = (e, value) => setPage(value);
  const paginatedRows = rows.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const pageCount = Math.ceil(rows.length / rowsPerPage);

  /* -------------------------
     Render
  ------------------------- */
  return (
    <div className={styles.container}>
      {loading && <Loader />}
      <ToastContainer />

      <div className={styles.top}>
        <div className={styles.text}>
          <h1 className={styles.welcome}>Welcome Back, {user?.name}</h1>
        </div>
        <div className={styles.second}>
          <p className={styles.subtitle}>Your future starts with today’s attendance</p>
          <div className={styles.check}>
            {/* ---------- BUTTON AREA using todayRecord ONLY ---------- */}
            {!isCheckedIn && !isCheckedOut ? (
              // Not checked in → show Check-in button
              <button
                disabled={hasCheckedInToday}
                onClick={() => {
                  if (!hasCheckedInToday) setCheckInModalOpen(true);
                }}
                className={hasCheckedInToday ? styles.disabledCheckIn : styles.checkIn}
              >
                {hasCheckedInToday ? "" : "Check-in"}
              </button>
            ) : isOnBreak && !isCheckedOut ? (
              // Currently on break → show End Break
              <button className={styles.break} onClick={() => setEndBreakModalOpen(true)}>
                End Break
              </button>
            ) : (
              <>
                {/* Take Break (only if checked in, not on break, not checked out, and haven't taken break today) */}
                {isCheckedIn && !isOnBreak && !isCheckedOut && breakCount < 1 && (
                  <button className={styles.break} onClick={() => setBreakModalOpen(true)}>
                    Take Break
                  </button>
                )}

                {/* Checkout (show when checked in and not checked out) */}
                {isCheckedIn && !isCheckedOut && (
                  <button className={styles.checkOut} onClick={() => setCheckoutOpen(true)}>
                    Check-out
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {loadingEvents ? (
        <div className={styles.loadingText}>Loading events...</div>
      ) : events.length === 0 ? (
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
                  subtitle={ev.subtitle.charAt(0).toUpperCase() + ev.subtitle.slice(1)}
                  date={ev.date}
                  type={ev.icon}
                />
              ))
            )}
          </div>
        </div>
      )}

      <div className={styles.cardRow}>
        <div className={styles.col}>
          <div className={styles.card}>
            <button className={styles.circle}>P</button>
            <h4>Permission Hours</h4>
            <p>Total Permission hour: {permissionHours !== null ? permissionHours : "Loading..."}</p>
          </div>
        </div>
        <div className={styles.col}>
          <div className={styles.card}>
            <button className={styles.circle1}>L</button>
            <h4>Late Logins</h4>
            <p>Total Late Logins: {lateLogins !== null ? lateLogins : "Loading..."}</p>
          </div>
        </div>
        <div className={styles.col}>
          <div className={styles.card}>
            <button className={styles.circle1}>AR</button>
            <h4>Attendance Rate</h4>
            <p>
              Percentage :
              {attendanceRate !== null ? (attendanceRate.toString().includes("%") ? attendanceRate : `${attendanceRate}%`) : "Loading..."}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.topBar}>
          <div>Class Hours: {timeElapsed}</div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className={styles.dropdown}>
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
              <th>Break Hours</th>
              <th>Class Hours</th>
              <th>Permission Hours</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "15px" }}>
                  <img src={noDataImg} alt="No Data Found" style={{ width: "120px", height: "120px", objectFit: "contain" }} />
                </td>
              </tr>
            ) : (
              paginatedRows.map((row) =>
                row.isLeave ? (
                  <tr key={row.id} style={{ backgroundColor: "#f8d7da", color: "#721c24", fontWeight: "bold" }}>
                    <td>{row.date}</td>
                    <td></td>
                    <td></td>
                    <td style={{ textAlign: "center" }}>Leave</td>
                    <td></td>
                    <td></td>
                    <td></td>
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
                    <td>{row.breakTime}</td>
                    <td>{row.classHours}</td>
                    <td>{row.permission}</td>
                    <td></td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>

        {paginatedRows.length > 0 && (
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
        )}
      </div>

      {selectedRemark && (
        <div className={styles.popupOverlay} onClick={() => setSelectedRemark(null)}>
          <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.popupHeader}>Remark</h3>
            <p className={styles.popupText}>{selectedRemark ? selectedRemark.charAt(0).toUpperCase() + selectedRemark.slice(1) : "-"}</p>
            <button className={styles.popupCloseBtn} onClick={() => setSelectedRemark(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <BreakModal
        user={user}
        setBreakStatus={setBreakStatus}
        isOpen={isBreakModalOpen}
        onClose={() => setBreakModalOpen(false)}
        attendanceId={attendanceId}
        refreshAttendance={fetchAttendance}
        refreshUser={fetchUser}
        handleStartBreak={handleStartBreak}
      />
      <EndBreakModal isOpen={isEndBreakModalOpen} onClose={() => setEndBreakModalOpen(false)} handleEndBreak={handleEndBreak} />

      <CheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setCheckInModalOpen(false)}
        onConfirm={async () => {
          await handleCheckIn();
          setCheckInModalOpen(false);
        }}
      />

      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setCheckoutOpen(false)} onCheckout={handleCheckoutConfirm} />
    </div>
  );
};

export default Dashboard;
