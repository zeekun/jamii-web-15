import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";
import moment from "moment";
// Extend dayjs with relativeTime and duration plugins
dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(relativeTime);

export const dateFormat = "DD MMM YYYY";
export function formattedDate(date: string, format?: string) {
  const f = format ? format : dateFormat;
  return dayjs(date).format(f);
}

export const timeRemaining = (otpUpdatedAt: string) => {
  const otpValidityDuration = 5 * 60; // 5 minutes in seconds
  const otpIssuedAt = new Date(otpUpdatedAt).getTime();
  const currentTime = Date.now();
  const timeRemaining = Math.max(
    0,
    otpValidityDuration - Math.floor((currentTime - otpIssuedAt) / 1000)
  );

  return timeRemaining;
};

export function daysBetweenDates(date1: string, date2: string): number {
  // Create moment object for the start date.
  const startMoment = moment(date1);

  // Create moment object for the end date.
  const endMoment = moment(date2);

  const daysDifference = endMoment.diff(startMoment, "days");
  return daysDifference;
}

export const formatDuration = (milliseconds: number) => {
  const duration = dayjs.duration(milliseconds);

  if (duration.asDays() >= 1) {
    return `${Math.floor(duration.asDays())} day(s)`;
  }
  if (duration.asHours() >= 1) {
    return `${Math.floor(duration.asHours())} hour(s)`;
  }
  if (duration.asMinutes() >= 1) {
    return `${Math.floor(duration.asMinutes())} min(s)`;
  }
  return `${Math.floor(duration.asSeconds())} sec(s)`;
};
