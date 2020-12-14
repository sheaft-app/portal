export function max(val, args) {
  const maxValue = parseFloat(args[0]);
  const value = val != null ? parseFloat(val) : null;

  return !isNaN(value) ? value <= maxValue : true;
}