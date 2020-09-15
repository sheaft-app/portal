export function required(val, args) {
  if (val == null) {
    return false;
  }

  if (Array.isArray(val) && val.length < 1) {
    return false;
  }

  if (typeof val === 'string') {
    const tmp = val.replace(/\s/g, "");

    return tmp.length > 0;
  }

  return true;
}