/**
 * Formats a date string to YYYY-MM-DD
 * @param {string|Date} dateStr 
 * @returns {string|null}
 */
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  if (typeof dateStr === 'string' && dateStr.includes('T')) {
    return dateStr.split('T')[0];
  }
  if (dateStr instanceof Date) {
    return dateStr.toISOString().split('T')[0];
  }
  return dateStr;
};

/**
 * Normalizes a value to null if it's undefined
 * @param {*} v 
 * @returns {*}
 */
const val = (v) => (v === undefined || v === "" || v === null) ? null : v;


module.exports = { formatDate, val };
