export function openingsDays(val, args) {
  if (val == null) {
    return false;
  }

  if (val.days && !Array.isArray(val)) {
    return false;
  }

  const openingsLength = val.length;

  for (var i = 0; i <= openingsLength - 1; i++) {
    if (!val[i].days.find((d) => {
      if (d) return d.checked
    })) {
      return false;
    }
  }

  return true;
}