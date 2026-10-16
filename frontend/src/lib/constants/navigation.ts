export type NavItem = {
  readonly href: string;
  readonly label: string;
};

export const mainNav = [
  { href: "/zadachi", label: "Задачи" },
  { href: "/articles", label: "Статьи" },
  { href: "/podgotovka", label: "Репетиторство" },
] as const satisfies readonly NavItem[];

export const subjectNav = [
  { href: "/matematika", label: "Математика" },
  { href: "/informatika", label: "Информатика" },
] as const satisfies readonly NavItem[];

export const footerNav = [
  ...subjectNav,
  ...mainNav,
] as const satisfies readonly NavItem[];
