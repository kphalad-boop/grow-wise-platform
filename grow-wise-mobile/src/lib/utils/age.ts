/**
 * Calculate child's age in years and months relative to a given date (defaults to today).
 */
export interface ChildAge {
  years: number;
  months: number;
  totalMonths: number;
  formattedText: string;
}

export function calculateChildAge(birthDateStr: string, relativeToDate: Date = new Date()): ChildAge {
  const birth = new Date(birthDateStr);
  const now = relativeToDate;

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();

  if (now.getDate() < birth.getDate()) {
    months--;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const totalMonths = Math.max(0, years * 12 + months);

  let formattedText = '';
  if (years > 0 && months > 0) {
    formattedText = `${years} ปี ${months} เดือน`;
  } else if (years > 0) {
    formattedText = `${years} ปี`;
  } else {
    formattedText = `${months} เดือน`;
  }

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    totalMonths,
    formattedText,
  };
}
