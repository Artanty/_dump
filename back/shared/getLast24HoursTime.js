export default function getLast24HoursTime() {
  // Get the current date and time
  const now = new Date();
  // Get the date and time 24 hours ago
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Helper function to format date to YYYY-MM-DDTHH:MM:SSZ
  function formatDate(date) {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      const seconds = String(date.getUTCSeconds()).padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
  }

  // Return the formatted times
  // return {
  //     now: formatDate(now),
  //     yesterday: formatDate(yesterday)
  // };
  return formatDate(yesterday)
}