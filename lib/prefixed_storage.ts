export function prefixedLocalStorage(prefix: string) {
  if (!prefix.endsWith("_")) {
    prefix += "_";
  }
  return {
    getItem(key: string) {
      return localStorage.getItem(prefix + key);
    },
    removeItem(key: string) {
      return localStorage.removeItem(prefix + key);
    },
    setItem(key: string, value: string) {
      return localStorage.setItem(prefix + key, value);
    },
  };
}

export function prefixedSessionStorage(prefix: string) {
  if (!prefix.endsWith("_")) {
    prefix += "_";
  }
  return {
    getItem(key: string) {
      return sessionStorage.getItem(prefix + key);
    },
    removeItem(key: string) {
      return sessionStorage.removeItem(prefix + key);
    },
    setItem(key: string, value: string) {
      return sessionStorage.setItem(prefix + key, value);
    },
  };
}
