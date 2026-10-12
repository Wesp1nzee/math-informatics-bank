/** Loading state for the catalogue: mirrors the card grid to avoid layout shift. */
export function TaskListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Загрузка задач…</span>
      <ul
        className="desk:grid-cols-3 m-0 grid list-none gap-4 p-0 sm:grid-cols-2 md:gap-6"
        aria-hidden="true"
      >
        {Array.from({ length: count }, (_, index) => (
          <li
            key={index}
            className="border-line bg-surface flex h-[236px] animate-pulse flex-col gap-3.5 rounded-lg border p-7"
          >
            <span className="bg-surface-subtle h-4 w-16 rounded" />
            <span className="bg-surface-subtle h-6 w-2/3 rounded" />
            <span className="bg-surface-subtle h-5 w-28 rounded-full" />
            <span className="bg-surface-subtle h-4 w-full rounded" />
          </li>
        ))}
      </ul>
    </div>
  );
}
