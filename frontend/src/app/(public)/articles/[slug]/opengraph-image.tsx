import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { getArticleBySlug } from "@/features/articles/api";

export const alt = "Статья с разбором по математике или информатике";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const regular = await readFile(
  join(process.cwd(), "src/assets/fonts/noto-sans-regular.ttf"),
);
const bold = await readFile(
  join(process.cwd(), "src/assets/fonts/noto-sans-bold.ttf"),
);

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  const title = article?.title ?? "Статья";
  const exam = article?.exam ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f7f7f5",
          padding: "72px 80px",
          fontFamily: "Noto Sans",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            fontSize: 24,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#686865",
          }}
        >
          <span>Разбор</span>
          {exam ? <span style={{ color: "#3157d5" }}>· {exam}</span> : null}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 60,
            lineHeight: 1.1,
            fontWeight: 700,
            letterSpacing: "-1.2px",
            color: "#111111",
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 26,
            color: "#989895",
          }}
        >
          <span>Как думать, а не заучивать</span>
          <span>Математика · Информатика</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Noto Sans", data: regular, weight: 400, style: "normal" },
        { name: "Noto Sans", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
