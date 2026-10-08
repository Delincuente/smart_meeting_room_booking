import moment from 'moment-timezone';
// import dotenv from 'dotenv';
// dotenv.config();

const timeZone = process.env.TIME_ZONE || 'Asia/Kolkata';

export const formatDateTime = (dateStr) => {
  return moment(dateStr).tz(timeZone).format('DD-MM-YYYY h:mm A');
};
