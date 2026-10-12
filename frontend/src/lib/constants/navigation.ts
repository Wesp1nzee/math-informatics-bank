export type NavItem = {
  readonly href: string;
  readonly label: string;
};

/** Primary header navigation (matches the original prototype's three links). */
export const mainNav = [
  { href: "/zadachi", label: "Задачи" },
  { href: "/articles", label: "Статьи" },
  { href: "/podgotovka", label: "Репетиторство" },
] as const satisfies readonly NavItem[];

/** Subject hubs used in the footer and on subject pages. */
export const subjectNav = [
  { href: "/matematika", label: "Математика" },
  { href: "/informatika", label: "Информатика" },
] as const satisfies readonly NavItem[];

export const footerNav = [
  ...subjectNav,
  ...mainNav,
] as const satisfies readonly NavItem[];
