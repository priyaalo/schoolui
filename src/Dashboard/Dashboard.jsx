import { useNavigate, useParams } from "react-router-dom";
import styles from "./Dashboard.module.css";
import "react-toastify/dist/ReactToastify.css";
import CheckoutModal from "./CheckoutModal";
import { ToastContainer, toast } from "react-toastify";
import {
  getUserId,
  getAttendance,
  checkIn,
  checkOut,
  getEvent,
} from "../api/serviceapi";
import React, { useState, useEffect } from "react";
import Pagination from "@mui/material/Pagination";
import EventCard from "../EventCard/EventCard";
import moment from "moment";
import CheckInModal from "./CheckInModal";


const Dashboard = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [attendanceTable, setAttendanceTable] = useState([]);
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [filter, setFilter] = useState("thisMonth");
  const [attendanceId, setAttendanceId] = useState("");
  const [event, setEvent] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [isCheckInModalOpen, setCheckInModalOpen] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

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

  const fetchAttendance = async () => {
    try {
      const monthFlag=filter==="pastMonth";

      const response = await getAttendance(userId,monthFlag);
      const allData = response.data.data.data || [];

      const formattedData = allData.map((att) => {
        if (att.date) {
          const d = new Date(att.date);
          const day = String(d.getDate()).padStart(2, "0");
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const year = d.getFullYear();
          return { ...att, date: `${day}-${month}-${year}` };
        }
        return att;
      });

      setAttendanceTable(formattedData);

      const today = new Date().toISOString().split("T")[0];
      const todayAttendance = allData.find(
        (att) => att.date?.startsWith(today) && !att.outTime
      );

      if (todayAttendance) {
        setAttendanceId(todayAttendance._id);
      }
    } catch (err) {
      console.error("Error fetching attendance:", err.message);
    }
  };

  useEffect(() => {
    if (!userId) {
      navigate("/");
    } else {
      fetchUser();
      fetchAttendance();
    }
  }, [navigate, userId,filter]);

  const handleCheckIn = async () => {
    if (isCheckingIn) return;
    setIsCheckingIn(true);

    try {
      const response = await checkIn(userId);
      const newAttendanceId = response.data.data._id;
      setAttendanceId(newAttendanceId);

      await fetchAttendance();
      await fetchUser();

      setCheckInStatus(true);

      toast.success("Check-in successful!", { position: "top-center", autoClose: 3000 });
    } catch (err) {
      console.error(err);
      toast.error("Check-in failed. Please try again.", { position: "top-center", autoClose: 3000 });
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

      toast.success("Checkout successful!", { position: "top-center", autoClose: 3000 });
    } catch (err) {
      console.error("Checkout failed:", err);
      toast.error("Checkout failed. Please try again.", { position: "top-center", autoClose: 3000 });
    } finally {
      setIsCheckingOut(false);
      setCheckoutOpen(false);
    }
  };

  const handleCheckOut = () => {
    setCheckoutOpen(true);
  };

  const tableFormatTime = (timestamp) => {
    if (!timestamp) return "-";
    const adjustedTime = moment.utc(timestamp);
    if (!adjustedTime.isValid()) return "-";
    return adjustedTime.format("hh:mm A");
  };

  const rows = attendanceTable.map((ele) => ({
    id: ele._id,
    date: ele.date || "N/A",
    login: tableFormatTime(ele.inTime) || "N/A",
    logout: tableFormatTime(ele.outTime) || "N/A",
    remarks: ele.remarks || "Remarks",
    classHours: ele.totalWorkHours || "0 hr 0 min",
    permission: "0 hr 0 min",
  }));

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

  useEffect(() => {
    fetchEvents();
  }, []);

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

  // ✅ Infinite marquee: duplicate items for smooth scrolling
  // const loopedEvents = [...events, ...events];

  const handlePageChange = (event, value) => setPage(value);
  const paginatedRows = rows.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const pageCount = Math.ceil(rows.length / rowsPerPage);

  return (
    <div className={styles.container}>
      <ToastContainer />

      {/* Top section */}
      <div className={styles.top}>
        <div className={styles.text}>
          <h1 className={styles.welcome}>
            Welcome Back, {user?.name}
          </h1>
        </div>
        <div className={styles.second}>
          <p className={styles.subtitle}>Opportunities don’t happen. You create them.</p>
          <div className={styles.check}>
            {!checkInStatus && (
              <button onClick={() => setCheckInModalOpen(true)} className={styles.checkIn}>Check-in</button>
            )}
            {checkInStatus && (
              <button onClick={handleCheckOut} className={styles.checkOut}>Check-out</button>
            )}
          </div>
        </div>
      </div>

      {/* Events marquee */}
      {/* Events marquee */}
<div className={styles.marqueeWrapper}>
  <div className={styles.marqueeContent}>
    {events.map((ev, index) => (
      <EventCard
        key={`first-${index}`}
        title={ev.title.charAt(0).toUpperCase() + ev.title.slice(1)}
        subtitle={ev.subtitle.charAt(0).toUpperCase() + ev.subtitle.slice(1)}
        date={ev.date}
        type={ev.icon}
      />
    ))}
    {events.map((ev, index) => (
      <EventCard
        key={`second-${index}`}
        title={ev.title.charAt(0).toUpperCase() + ev.title.slice(1)}
        subtitle={ev.subtitle.charAt(0).toUpperCase() + ev.subtitle.slice(1)}
        date={ev.date}
        type={ev.icon}
      />
    ))}
  </div>
</div>

      
 <div className={styles.cardRow}>
        <div className={styles.col}>
          <div className={styles.card}>
            <button className={styles.circle}>P</button>
            <h4>Remaining Permission Hours</h4>
            <p>Available for This Month: 1.5 hrs</p>
          </div>
        </div>
        <div className={styles.col}>
          <div className={styles.card}>
            <button className={styles.circle1}>L</button>
            <h4>Total Late Logins</h4>
            <p>Total LateLogins this Month: 2 Days</p>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className={styles.tableContainer}>
        <div className={styles.topBar}>
          <div>Class Hours: -- : --</div>
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
    paginatedRows.map((row) => (
      <tr key={row.id}>
        <td>{row.date}</td>
        <td>{row.login}</td>
        <td>{row.logout}</td>
        <td>{row.remarks}</td>
        <td>{row.classHours}</td>
        <td>{row.permission}</td>
      </tr>
    ))
  )}
</tbody>

        </table>

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

      {/* Checkout Modal */}
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setCheckoutOpen(false)} onCheckout={handleCheckoutConfirm} />

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
