import { Fragment, JSX } from "preact";
import { L1_SHORTCUTS, L2_SHORTCUTS, UPDATE_KEYS } from "./filter.ts";
import FILTER_QUERIES from "./mod.ts";

const CONTEXT_SHORTCUTS: Record<string, string> = UPDATE_KEYS.reduce(
  (prev, current) => {
    return { ...prev, [current]: camelCase(current, "_") };
  },
  {},
);

function camelCase(str: string, separator: string) {
  return (
    str[0] +
    str
      .split(separator)
      .map((w) => w![0]?.toUpperCase() + w.substring(1))
      .join("")
      .substring(1)
  );
}

const codeClasses = "bg-border text-sm px-2 py-1 rounded-lg";

const PREFIX_DOCS = {
  chat_member: (
    <>
      Note: You need to explicitly specify this update type in{" "}
      <code class={codeClasses}>allowed_updates</code> to receive them.
    </>
  ),
};

export function generate() {
  const queryDocs: { query: string; doc: JSX.Element }[] = [];

  for (const query of FILTER_QUERIES) {
    const [l1, l2, L3] = query.split(":");
    const L1 = L1_SHORTCUTS[l1 as keyof typeof L1_SHORTCUTS] ?? [l1];
    const L2 = L2_SHORTCUTS[l2 as keyof typeof L2_SHORTCUTS] ?? [l2];

    const prefix = PREFIX_DOCS?.[query as keyof typeof PREFIX_DOCS];

    // L1T means L1Text or textual representation of L1.
    const L1T = (
      <span>
        {L1.map((k1, i) => (
          <Fragment key={String(i)}>
            {!i ? "" : " / "}
            <code class={codeClasses}>{k1}</code>
          </Fragment>
        ))}
      </span>
    );
    const L2T = (
      <span>
        {L2.map((k2, i) => (
          <Fragment key={String(i)}>
            {!i ? "" : " / "}
            <code class={codeClasses}>{k2}</code>
          </Fragment>
        ))}
      </span>
    );
    const L3T = <code class={codeClasses}>{L3}</code>;

    let doc: JSX.Element;

    if (L1[0] && !L2[0] && !L3) {
      doc = (
        <div>
          <p>Query for filtering {L1T} updates.</p>
          <pre className="rounded-lg mt-3 w-full bg-border p-3">
            <code>{L1.map((k1) => `ctx.${CONTEXT_SHORTCUTS[k1]}`).join("\n")}</code>
          </pre>
        </div>
      );
    } else if (L1[0] && L2[0] && !L3) {
      doc = (
        <div>
          <p>
            Query for filtering {L1T} updates with the field {L2T}.
          </p>
          <pre className="rounded-lg bg-border mt-3 w-full p-3">
            <code>{L1.map((k1) => L2.map((k2) => `ctx.${CONTEXT_SHORTCUTS[k1]}.${k2}`).join("\n")).join("\n")}</code>
          </pre>
        </div>
      );
    } else if (L1[0] && L2[0] && L3) {
      const isEntity = L2.includes("entities") ||
        L2.includes("caption_entities");
      const info0 = isEntity
        ? <span>that contains at least one entity of the type {L3T}</span>
        : <span>with {L3T} property</span>;
      const accessInfo = L2.join().includes("entities")
        ? `ctx.entities("${L3}")`
        : L1.map((k1) =>
          L2.map((k2) => {
            return `ctx.${CONTEXT_SHORTCUTS[k1]}.${k2}.${L3}`;
          }).join("\n")
        ).join("\n");

      doc = (
        <div>
          <p>
            Query for filtering {L1T} updates with an existent {L2T} field{" "}
            {info0}.
          </p>
          <pre className="bg-border rounded-lg mt-3 w-full p-3">
            <code>{accessInfo}</code>
          </pre>
        </div>
      );
    } else {
      throw new Error(`There is some issue with the "${query}" filter query.`);
    }

    queryDocs.push({
      query,
      doc: prefix
        ? (
          <>
            {doc}
            <br />
            <p>{prefix}</p>
          </>
        )
        : doc,
    });
  }

  return queryDocs;
}
