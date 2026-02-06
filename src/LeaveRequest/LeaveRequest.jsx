import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { DatePicker, TimePicker } from "antd";
import styles from "./LeaveRequest.module.css";

const LeaveRequestModal = ({ isOpen, onClose, onSubmit }) => {
  const checkInDate = localStorage.getItem("checkInDate"); 
  const [successMessage, setSuccessMessage] = useState("");

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    studentId: localStorage.getItem("studentId") || "",
    leaveType: "",
    fromDate: null,
    toDate: null,
    reason: "",
    permissionDate: null,
    fromTime: null,
    toTime: null,
  });
   
const [loading, setLoading] = useState(false); 

  useEffect(() => {
    if (isOpen) {
      setFormData({
        studentId: localStorage.getItem("studentId") || "",
        leaveType: "",
        fromDate: null,
        toDate: null,
        reason: "",
        permissionDate: null,
        fromTime: null,
        toTime: null,
      });
      setErrors({});
      setSuccessMessage("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedForm = { ...prev, [name]: value };
      validateField(name, value, updatedForm);
      return updatedForm;
    });
  };

  const handleDateChange = (date, _dateString, name) => {
    setFormData((prev) => {
      const updatedForm = { ...prev, [name]: date };
      validateField(name, date, updatedForm);
      return updatedForm;
    });
  };

  const handleTimeChange = (time, _timeString, name) => {
    setFormData((prev) => {
      const updatedForm = { ...prev, [name]: time };
      validateField(name, time, updatedForm);
      return updatedForm;
    });
  };

  const validateField = (name, value, updatedForm = formData) => {
    let newErrors = { ...errors };

    
    if (name === "studentId") {
      if (!value.trim()) newErrors.studentId = "Student ID is required";
      else if (!/^alosodt\s\d{4}$/.test(value))
        newErrors.studentId = "ID must be in format: alosodt 1234";
      else newErrors.studentId = "";
    }


    if (name === "leaveType") {
      newErrors.leaveType = value ? "" : "Please select a leave type";
    }

    if (
      (name === "fromDate" || name === "toDate") &&
      updatedForm.leaveType &&
      updatedForm.leaveType !== "Permission"
    ) {
      if (!updatedForm.fromDate || !updatedForm.toDate)
        newErrors.dates = "Both From and To dates are required";
      else if (updatedForm.toDate.isBefore(updatedForm.fromDate))
        newErrors.dates = "To Date cannot be earlier than From Date";
      else newErrors.dates = "";
    }

    if (
      updatedForm.leaveType === "Permission" ||
      updatedForm.leaveType === "Early Permission"
    ) {
      if (name === "permissionDate") {
        newErrors.permissionDate = value ? "" : "Permission date is required";
      }

      if (name === "fromTime" || name === "toTime") {
        if (!updatedForm.fromTime || !updatedForm.toTime) {
          newErrors.times = "Both From and To times are required";
        } else if (updatedForm.toTime.isBefore(updatedForm.fromTime)) {
          newErrors.times = "To Time must be later than From Time";
        } else {
          newErrors.times = "";
        }
      }
    }

   
    if (name === "reason") {
      if (!value.trim()) newErrors.reason = "Reason is required";
      else if (value.length < 5)
        newErrors.reason = "Reason must be at least 5 characters";
      else newErrors.reason = "";
    }

    setErrors(newErrors);
  };

  const validateAll = () => {
    let newErrors = {};

    if (!formData.studentId.trim())
      newErrors.studentId = "Student ID is required";
    else if (!/^alosodt\s\d{4}$/.test(formData.studentId))
      newErrors.studentId = "ID must be in format: alosodt 1234";

    if (!formData.leaveType)
      newErrors.leaveType = "Please select a leave type";

 if (
      formData.leaveType === "Permission" ||
      formData.leaveType === "Early Permission"
    ) {
      if (!formData.permissionDate)
        newErrors.permissionDate = "Permission date is required";

      if (!formData.fromTime || !formData.toTime)
        newErrors.times = "Both From and To times are required";
      else if (formData.toTime.isBefore(formData.fromTime))
        newErrors.times = "To Time must be later than From Time";
    } else {
      if (!formData.fromDate || !formData.toDate)
        newErrors.dates = "Both From and To dates are required";
      else if (formData.toDate.isBefore(formData.fromDate))
        newErrors.dates = "To Date cannot be earlier than From Date";
    }
    if (!formData.reason.trim())
      newErrors.reason = "Reason is required";
    else if (formData.reason.length < 5)
      newErrors.reason = "Reason must be at least 5 characters";

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalErrors = validateAll();
    const hasErrors = Object.values(finalErrors).some((err) => err !== "");

    if (!hasErrors) {
       setLoading(true); 
       if (onSubmit) await onSubmit(formData);
       setLoading(false);


     
      setFormData({
        studentId: localStorage.getItem("studentId") || "",
        leaveType: "",
        fromDate: null,
        toDate: null,
        reason: "",
        permissionDate: null,
        fromTime: null,
        toTime: null,
      });
      setErrors({});

      setSuccessMessage(
        formData.leaveType === "Permission"
          ? "Permission updated successfully!"
          : "Leave request submitted successfully!"
      );

      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <section className={styles.container}>
        <div className={styles.header}>
          <h1>
            Leave <span style={{ color: "rgb(30, 58, 138)" }}>Request</span>{" "}
            Form
          </h1>
          <div className={styles.headericon} onClick={onClose}>
            <FaTimes size={16} color="grey" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
         
          <div className={styles.inputBox}>
            <label>Student ID</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              readOnly
              className={styles.readonlyInput}
            />
            {errors.studentId && (
              <p className={styles.error}>{errors.studentId}</p>
            )}
          </div>

         
          <div className={styles.inputBox}>
            <label>Leave Type</label>
            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
            >
              <option value="" disabled hidden>
                Select Leave Type
              </option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Permission">Permission</option>
              <option value="Early Permission">Early Permission</option>
            </select>
            {errors.leaveType && (
              <p className={styles.error}>{errors.leaveType}</p>
            )}
          </div>

          {/* Leave Period */}
         {/* Leave Period */}
          {formData.leaveType &&
            formData.leaveType !== "Permission" &&
            formData.leaveType !== "Early Permission" && (
              <div className={styles.inputBox}>
                <label>Leave Period</label>
                <div className={styles.column}>
                     <DatePicker
                    value={formData.fromDate}
                    onChange={(date, dateString) =>
                      handleDateChange(date, dateString, "fromDate")
                    }
                    placeholder="From"
                    disabledDate={(current) => {
                      const todayCheckIn = checkInDate
                        ? new Date(checkInDate)
                        : null;
                      return (
                        (current &&
                          current < new Date().setHours(0, 0, 0, 0)) || // disable past
                        (todayCheckIn && current.isSame(todayCheckIn, "day")) // disable check-in date
                      );
                    }}
                  />
                  <DatePicker
                    value={formData.toDate}
                    onChange={(date, dateString) =>
                      handleDateChange(date, dateString, "toDate")
                    }
                    placeholder="To"
                    disabledDate={(current) => {
                      const todayCheckIn = checkInDate
                        ? new Date(checkInDate)
                        : null;
                      return (
                        (!formData.fromDate
                          ? current && current < new Date().setHours(0, 0, 0, 0)
                          : current &&
                            current < formData.fromDate.startOf("day")) ||
                        (todayCheckIn && current.isSame(todayCheckIn, "day"))
                      );
                    }}
                  />
                </div>
                {errors.dates && <p className={styles.error}>{errors.dates}</p>}
              </div>
            )}

          {/* Permission Time */}
          {(formData.leaveType === "Permission" ||
            formData.leaveType === "Early Permission") && (
            <div className={styles.inputBox}>
              <label>Permission Time</label>
              <div className={styles.formRow}>
                <DatePicker
                  value={formData.permissionDate}
                  onChange={(date, dateString) =>
                    handleDateChange(date, dateString, "permissionDate")
                  }
                  placeholder="Date"
                  disabledDate={(current) =>
                    current && current < new Date().setHours(0, 0, 0, 0)
                  }
                />
                {/* <TimePicker
                  use12Hours
                  format="hh:mm A"
                  value={formData.fromTime}
                  onChange={(time, timeString) =>
                    handleTimeChange(time, timeString, "fromTime")
                  }
                  placeholder="From"
                />
                <TimePicker
                  use12Hours
                  format="hh:mm A"
                  value={formData.toTime}
                  onChange={(time, timeString) =>
                    handleTimeChange(time, timeString, "toTime")
                  }
                  placeholder="To"
                /> */}
                <TimePicker
                  use12Hours
                  format="hh:mm A"
                  value={formData.fromTime}
                  onChange={(time, timeString) =>
                    handleTimeChange(time, timeString, "fromTime")
                  }
                  placeholder="From"
                  disabledHours={() => {
                    const currentHour = new Date().getHours();
                    return Array.from({ length: currentHour }, (_, i) => i); // disable all past hours
                  }}
                  disabledMinutes={(selectedHour) => {
                    const now = new Date();
                    if (selectedHour === now.getHours()) {
                      // disable past minutes if user is selecting current hour
                      return Array.from(
                        { length: now.getMinutes() },
                        (_, i) => i
                      );
                    }
                    return [];
                  }}
                />

                <TimePicker
                  use12Hours
                  format="hh:mm A"
                  value={formData.toTime}
                  onChange={(time, timeString) =>
                    handleTimeChange(time, timeString, "toTime")
                  }
                  placeholder="To"
                  disabledHours={() => {
                    const currentHour = new Date().getHours();
                    return Array.from({ length: currentHour }, (_, i) => i);
                  }}
                  disabledMinutes={(selectedHour) => {
                    const now = new Date();
                    if (selectedHour === now.getHours()) {
                      return Array.from(
                        { length: now.getMinutes() },
                        (_, i) => i
                      );
                    }
                    return [];
                  }}
                />
              </div>
              {errors.permissionDate && (
                <p className={styles.error}>{errors.permissionDate}</p>
              )}
              {errors.times && <p className={styles.error}>{errors.times}</p>}
            </div>
          )}
          
         <div className={styles.inputBox}>
  <label>Reason</label>
  <textarea
    name="reason"
    value={formData.reason}
    onChange={(e) => {
      let val = e.target.value;
      if (val.length > 0) {
        val = val.charAt(0).toUpperCase() + val.slice(1);
      }
      handleChange({ target: { name: "reason", value: val } });
    }}
  />
  {errors.reason && <p className={styles.error}>{errors.reason}</p>}
</div>



          <div className={styles.btn}>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? (
                            <div className={styles.loader} title="1">
                              <svg
                                version="1.1"
                                id="loader-1"
                                xmlns="http://www.w3.org/2000/svg"
                                x="0px"
                                y="0px"
                                width="24px"
                                height="24px"
                                viewBox="0 0 50 50"
                                xmlSpace="preserve"
                              >
                                <path
                                  fill="#fff"
                                  d="M25.251,6.461c-10.318,0-18.683,8.365-18.683,18.683h4.068
                           c0-8.071,6.543-14.615,14.615-14.615V6.461z"
                                >
                                  <animateTransform
                                    attributeType="xml"
                                    attributeName="transform"
                                    type="rotate"
                                    from="0 25 25"
                                    to="360 25 25"
                                    dur="0.6s"
                                    repeatCount="indefinite"
                                  />
                                </path>
                              </svg>
                            </div>
                          ) : (
                            "Request Leave"
                          )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default LeaveRequestModal;
