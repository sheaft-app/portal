export function min(val, args) {
  const minValue = parseFloat(args[0]);
  const value = val != null ? parseFloat(val) : null;

  return !isNaN(value) ? value >= minValue : true;
}