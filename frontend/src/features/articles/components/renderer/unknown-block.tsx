export function UnknownBlock({ label }: { label: string }) {
  return (
    <div
      role="note"
      className="border-line bg-surface-subtle text-ink-soft rounded-lg border border-dashed px-4 py-3 text-sm"
    >
      <p className="text-ink font-medium">{label}</p>
      <p className="mt-1">
        Этот блок не поддерживается текущей версией страницы. Остальная статья доступна.
      </p>
    </div>
  );
}
