import { useSignal } from "@preact/signals";
import { generate } from "../lib/filter_queries/docs.tsx";
import { Input } from "../components/Input.tsx";

const filterQueries = generate();

function slug(str: string) {
  return str.replace(":", "-").replace("_", "-");
}

const list = (q: string) =>
  filterQueries
    .filter(({ query }) => query.includes(q.toLowerCase()))
    .map(({ query, doc }) => {
      return (
        <details key={query} className="my-2 py-1">
          <summary className="mb-2 cursor-pointer select-none">
            <a href={`#${slug(query)}`}></a>
            <h3 className="inline-block font-mono" id={`${slug(query)}`}>
              {q == "" ? query : (
                <>
                  {query.slice(0, query.indexOf(q))}
                  <span className="text-grammy">{q}</span>
                  {query.slice(query.indexOf(q) + q.length)}
                </>
              )}
            </h3>
          </summary>
          <div className="border-l border-border my-2 p-4">{doc}</div>
        </details>
      );
    });

export function FilterQueryBrowser() {
  const q = useSignal("");

  return (
    <>
      <Input
        type="text"
        autoComplete="off"
        id="query"
        value={q}
        onInput={(e) => q.value = e.currentTarget.value}
        placeholder={`Browse ${filterQueries.length} filter queries...`}
      />
      <div className="py-4">{list(q.value)}</div>
    </>
  );
}
