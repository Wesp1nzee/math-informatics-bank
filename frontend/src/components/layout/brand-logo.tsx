import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";

export function BrandLogo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="Основа — на главную"
      className="inline-flex shrink-0 items-center"
    >
      <Image
        src="/images/logo.png"
        alt=""
        width={900}
        height={463}
        priority={priority}
        sizes="110px"
        className={cn("brand-logo w-auto", className)}
      />
    </Link>
  );
}
