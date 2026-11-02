// BoxTrack only runs for CrossFit LAB (Toulouse), so "today" and "now" must
// follow Europe/Paris wall-clock time, not UTC or the server's local time -
// otherwise /wods/today, the TV "current session" logic and announcement
// expiry drift by 1-2h.
const TODAY_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Paris',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const TIME_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Paris',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function todayIsoDate() {
  return TODAY_FORMATTER.format(new Date());
}

function nowHoursMinutes() {
  return TIME_FORMATTER.format(new Date());
}

module.exports = { todayIsoDate, nowHoursMinutes };
