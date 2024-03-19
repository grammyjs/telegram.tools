import { useEffect, useState } from "preact/hooks";

export function Dots() {
  const [dots, setDots] = useState("");
  useEffect(() => {
    const i = setInterval(() =>
      requestAnimationFrame(() => {
        setDots((v) => v.length === 3 ? "" : v + ".");
      }), 500);
    return () => clearInterval(i);
  }, []);
  return <>{dots}</>;
}
