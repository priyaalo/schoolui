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

//get attendance for the particular user 
// export const getAttendance = (userId) => {
//   return apiService.get(`/attendance?userId=${userId}`);
// };
export const getAttendance = (_userId_, month = false) => {
  const url = month
    ? `/attendance?userId=${_userId_}&month=true`
    : `/attendance?userId=${_userId_}`;
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

