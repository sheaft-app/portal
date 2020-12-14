export function minLength(val, args) {
  const minValue = parseFloat(args[0]);
  return val != null ? val.length >= minValue : true;
}
