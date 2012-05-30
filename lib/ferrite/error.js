function MagnetError(msg, offset, scope) {
  e = new Error(msg);
  e.offset = offset;
  e.scope = scope;
  return e;
};