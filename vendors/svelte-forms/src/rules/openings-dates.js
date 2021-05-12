export function openingsDates(val, args) {
  if (val == null) {
    return false;
  }

  if (val.start && !Array.isArray(val)) {
    return false;
  }

  const openingsLength = val.length;

  for (let i = 0; i <= openingsLength - 1; i++) {
    const startDate = new Date(null, null, null, val[i].start.hours, val[i].start.minutes);
    const endDate = new Date(null, null, null, val[i].end.hours, val[i].end.minutes);
    
    if (startDate >= endDate)
      return false;
  }

  return true;
}