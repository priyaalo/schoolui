import apiService from "./apiService";


//login
export const LoginUser = (email, password) => {
  return apiService.post(`/user/login`, { email, password });
};
 
// //get particular user
// export const getUser=(userId)=>{
//   return apiService.get(`/user/${userId}`);
// }

export const getUserId = (userId) => {
  return apiService.get(`/user?id=${userId}`);
};

export const attCardCalculation = (userId) => {
  return apiService.get(`/attendance/lateCount?userId=${userId}`);
};

//get attendance for the particular user 
// export const getAttendance = (userId) => {
//   return apiService.get(`/attendance?userId=${userId}`);
// };
export const getAttendance = (userId, month = false) => {
  const url = month
    ? `/attendance?userId=${userId}&month=true`
    : `/attendance?userId=${userId}`;
  return apiService.get(url);
};
//checkin
export const checkIn=(userId)=>{
  return apiService.post(`/attendance/create`,{userId});
}

//checkout
export const checkOut = (attendanceId, remarks, userId, checkoutTime) => {
  return apiService.put(`attendance/${attendanceId}`, {
    remarks,
    userId,
    outTime: checkoutTime,
  });
};

//get events
export const getEvent = () => {
  return apiService.get(`/event?status=ongoing,upcoming`);
};


//get leave for particular user
 export const getLeaveTable = (userId) => {
  return apiService.get(`/leave?userId=${userId}`);
};

//add leave request to the table 
export const postLeaveRequest = (leaveData) => {
  return apiService.post(`leave/create`, leaveData);
};

//month calculation
export const monthCalculation=(userId)=>{
   return apiService.get(`/leave/month?userId=${userId}`) 
}
//geT NOTIFICATION

// https://alosodt.com/api/notification/?userId=68c3fa78232eb7c9bb806737&notificationType=user
export const getNotification=(userId)=>{
  return apiService.get(`notification?userId=${userId}&notificationType=user`);
}

// https://alosodt.com/api/notification/68c3fb30232eb7c9bb806847

//update notification
export const updateNotification = (notificationId,read) => {
  return apiService.put(`notification/${notificationId}`, {
    isRead: read,
  });
}


//update Attendance
export const updateAttendance=(id,time,userId)=>{
  return apiService.put(`/attendance/${id}`, {
    inTime: time,
    userId,
  });
}


export const startBreak = (attendanceId, breakTime) =>{
  return apiService.put(`/attendance/break/${attendanceId}`, { breakTime });
}


