import type { ArticleBlockV2 } from "@/features/articles/types";

type Block = Extract<ArticleBlockV2, { type: "table" }>;

function cellLabel(headers: string[] | undefined, index: number): string {
  return headers?.[index] ?? `Колонка ${index + 1}`;
}

export function TableBlock({ block }: { block: Block }) {
  const { caption, headers, rows, first_column_header: firstColumnHeader } = block.data;

  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  const columnCount = Math.max(
    Array.isArray(headers) ? headers.length : 0,
    ...rows.map((row) => row.length),
  );
  const useCards = columnCount >= 3;

  return (
    <figure className="my-2 w-full max-w-full min-w-0 scroll-mt-24">
      {caption ? (
        <figcaption className="text-ink mb-2 text-sm font-medium">{caption}</figcaption>
      ) : null}

      {useCards ? (
        <div className="grid gap-2 sm:hidden">
          {rows.map((row, rowIndex) => (
            <div
              key={`card-${rowIndex}`}
              className="border-line-strong bg-surface rounded-lg border p-3 shadow-sm"
            >
              <dl className="m-0 grid gap-1.5">
                {row.map((cell, cellIndex) => (
                  <div
                    key={`card-${rowIndex}-${cellIndex}`}
                    className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-2"
                  >
                    <dt className="text-ink-faint text-xs font-medium">
                      {cellLabel(headers, cellIndex)}
                    </dt>
                    <dd className="text-ink m-0 min-w-0 text-sm break-words">{cell}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      ) : null}

      <div
        className={`border-line-strong bg-surface w-full max-w-full overflow-x-auto rounded-lg border shadow-sm ${
          useCards ? "hidden sm:block" : ""
        }`}
      >
        <table className="text-ink w-full table-auto border-collapse text-left text-sm">
          {Array.isArray(headers) && headers.length > 0 ? (
            <thead className="bg-ink/5">
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={`${header}-${index}`}
                    scope="col"
                    className="border-line-strong text-ink border-b px-2 py-2 text-xs font-semibold break-words sm:px-4 sm:py-3 sm:text-sm"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
          ) : null}
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={`row-${rowIndex}`}
                className="border-line-strong odd:bg-surface even:bg-ink/5 border-b last:border-b-0"
              >
                {row.map((cell, cellIndex) => {
                  const isRowHeader = firstColumnHeader && cellIndex === 0;
                  if (isRowHeader) {
                    return (
                      <th
                        key={`cell-${rowIndex}-${cellIndex}`}
                        scope="row"
                        className="border-line-strong text-ink border-r px-2 py-2 text-left text-xs font-semibold break-words sm:px-4 sm:py-3 sm:text-sm"
                      >
                        {cell}
                      </th>
                    );
                  }
                  return (
                    <td
                      key={`cell-${rowIndex}-${cellIndex}`}
                      className="border-line-strong text-ink px-2 py-2 align-top text-xs break-words sm:px-4 sm:py-3 sm:text-sm"
                    >
                      {cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
