export function maxLength(val, args) {
  const maxValue = parseFloat(args[0]);
  return val != null ? val.length <= maxValue : true;
}
