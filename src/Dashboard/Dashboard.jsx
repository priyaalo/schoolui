import styles from "./Dashboard.module.css";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useParams } from "react-router-dom";
import CheckoutModal from "./CheckoutModal";
import { ToastContainer, toast } from "react-toastify";
import {
  getUserId,
  getAttendance,
  checkIn,
  checkOut,
  getEvent,
  attCardCalculation,updateAttendance
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

  const [remarkPopup, setRemarkPopup] = useState({ isOpen: false, text: "" });
  const [selectedRemark, setSelectedRemark] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState("00:00:00");
  const [checkInTime, setCheckInTime] = useState(null);
  const [permissionHours, setPermissionHours] = useState(null);
  const [lateLogins, setLateLogins] = useState([]);
  const [onPermission, setOnPermission] = useState(false);
  const [per,setPer]=useState("");



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
    //att card
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
   useEffect(() => {
     fetchLateCount();
   }, [userId]);
   


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
      setPer(formattedData[0]._id);

      const today = new Date().toISOString().split("T")[0];
      const todayAttendance = allData.find(
        (att) => att.date?.startsWith(today) && !att.outTime
      );

     if (todayAttendance) {
        setAttendanceId(todayAttendance._id);
        setOnPermission(todayAttendance.onPermission === true);
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

  // const handleCheckIn = async () => {
  //   if (isCheckingIn) return;
  //   setIsCheckingIn(true);

  //   try {
  //     const response = await checkIn(userId);
  //     const newAttendanceId = response.data.data._id;
  //     setAttendanceId(newAttendanceId);

  //     await fetchAttendance();
  //     await fetchUser();

      // setCheckInStatus(true);

  //     toast.success("Check-in successful!", { position: "top-center", autoClose: 3000 });
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Check-in failed. Please try again.", { position: "top-center", autoClose: 3000 });
  //   } finally {
  //     setIsCheckingIn(false);
  //   }
  // };
const handleCheckIn = async () => {
  if (isCheckingIn) return; // prevent multiple rapid clicks
  setIsCheckingIn(true);

  try {
    if (onPermission && per) {
      await updateAttendance(per, new Date().toISOString(), userId);
      await fetchAttendance();
      await fetchUser();

      toast.success("Permission check-in Updated!", {
        position: "top-center",
        autoClose: 3000,
      });
    } else {
      const response = await checkIn(userId);
      const newAttendanceId = response.data.data._id;
      setAttendanceId(newAttendanceId);
      await fetchLateCount();
      await fetchAttendance();
      await fetchUser();

      toast.success("Check-in successful!", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  } catch (err) {
    // always get the message
    let errMsg =
      err.response?.data?.message || // API { message: "" }
      err.response?.data || // raw response
      err.message || // JS error
      "Something went wrong, please try again.";

    // ✅ show toast every time, even if user clicks multiple times
    toast.error(errMsg, { position: "top-center", autoClose: 3000 });
  } finally {
    setIsCheckingIn(false); // reset flag so user can click again
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
    }  catch (err) {
       let errMsg =
         err.response?.data?.message || // if API sends { message: "..." }
         err.response?.data || // fallback to raw response data
         err.message || // generic JS error message
         "Something went wrong, please try again.";
      toast.error(errMsg, { position: "top-center", autoClose: 3000 });
    }
     finally {
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

   const formatPermissionHours = (hoursDecimal) => {
    if (hoursDecimal == null || hoursDecimal === "-") return "-";

    const hours = Math.floor(hoursDecimal);
    const minutes = Math.round((hoursDecimal - hours) * 60);

    return `${hours} hr ${minutes} min`;
  };

  const rows = attendanceTable.map((ele) => ({
    id: ele._id,
    date: ele.date || "N/A",
    login: tableFormatTime(ele.inTime) || "N/A",
    logout: tableFormatTime(ele.outTime) || "N/A",
    remarks: ele.remarks || "-",
    classHours: ele.totalWorkHours || "-",
    permission: formatPermissionHours(ele.permissionHours) || "-"
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


     //timer
  useEffect(() => {
   if (!user?.checkInStatus) return;
  const inTime = attendanceTable?.[0]?.inTime;
  const startTime = inTime ? new Date(inTime) : null;
   setCheckInTime(startTime);  
   const timer=setInterval(()=>{
    const currentDateTime = new Date();
     const currentTime = new Date(
       currentDateTime.getTime() + (5 * 60 + 30) * 60000 // ✅ keep your IST offset
     );
     let timeDifference = currentTime - startTime;
      if (timeDifference < 0) {
        setTimeElapsed("00:00:00");
        return;
      }
       const hours = Math.floor(timeDifference / (1000 * 60 * 60));
       const minutes = Math.floor(
         (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
       );
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
        setTimeElapsed(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );

   },1000)
   return () => clearInterval(timer);
  }, [user?.checkInStatus, attendanceTable]);
  

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
          <p className={styles.subtitle}>Your future starts with today’s attendance</p>
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
      <p>Available for This Month: {permissionHours !== null ?` ${permissionHours}` : "Loading..."}</p>
    </div>
  </div>
  <div className={styles.col}>
    <div className={styles.card}>
      <button className={styles.circle1}>L</button>
      <h4>Total Late Logins</h4>
      <p>Total LateLogins this Month: {lateLogins !== null ? `${lateLogins} Days` : "Loading..."}</p>
    </div>
  </div>
</div>


      {/* Attendance Table */}
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
       <td
  style={{
    cursor: "pointer",
    maxWidth: "150px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "blue",
  }}
  onClick={() => setSelectedRemark(row.remarks)}  // open popup with remark
  title="Click to view full remark"
>
  {row.remarks}
</td>

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
      {/* ✅ Remark Popup */}
     {selectedRemark && (
  <div
    className={styles.popupOverlay}
    onClick={() => setSelectedRemark(null)} // close on outside click
  >
    <div
      className={styles.popupContent}
      onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
    >
      <h3 className={styles.popupHeader}>Remark</h3>
      <p className={styles.popupText}>{selectedRemark}</p>
      <button
        className={styles.popupCloseBtn}
        onClick={() => setSelectedRemark(null)} // close button
      >
        Close
      </button>
    </div>
  </div>
)}



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