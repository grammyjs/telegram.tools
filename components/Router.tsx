import { ComponentChildren, createContext } from "preact";
import { useContext, useEffect } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { setHash } from "../lib/utils.ts";

const hash = createContext("");
const HashProvider = hash.Provider;

export function useHash() {
  return useContext(hash);
}

export function Router(
  { routes, fallbackRoute }: {
    routes: Record<string, ComponentChildren>;
    fallbackRoute: ComponentChildren;
  },
) {
  const hash = useSignal(IS_BROWSER ? location.hash : "");

  useEffect(() => {
    const onHashChange = () => {
      hash.value = location.hash;
    };
    const onPopState = () => {
      hash.value = location.hash;
    };
    addEventListener("hashchange", onHashChange);
    addEventListener("popstate", onPopState);

    const onClick = (e: Event) => {
      if (e.target instanceof HTMLElement) {
        if (e.target.dataset["route"]) {
          e.preventDefault();
          setHash(e.target.dataset["route"]);
          hash.value = e.target.dataset["route"];
        }
      }
    };
    document.addEventListener("click", onClick);

    return () =>
      void document.removeEventListener("hashchange", onHashChange) &&
      void document.removeEventListener("popstate", onPopState) &&
      document.removeEventListener("click", onClick);
  }, []);

  return (
    <HashProvider value={hash.value}>
      {routes[["", "#/"].includes(hash.value) ? "#" : hash.value] ??
        fallbackRoute}
    </HashProvider>
  );
}
