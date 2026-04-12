/**
 * Formats a date string or Date object to "DD/MM/YYYY" (Vietnamese standard)
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '---';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '---';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Formats a date string or Date object to "HH:mm DD/MM/YYYY"
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '---';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '---';
  
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${hours}:${minutes} ${day}/${month}/${year}`;
};

/**
 * Formats a date string or Date object to "DD/MM" (Short format)
 */
export const formatDateShort = (date: string | Date | null | undefined): string => {
  if (!date) return '---';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '---';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  
  return `${day}/${month}`;
};
