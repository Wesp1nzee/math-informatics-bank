import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { getTaskById } from "@/features/tasks/api";
import { SUBJECT_LABEL } from "@/features/tasks/labels";

export const alt = "Задача по математике или информатике с решением";
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
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = await getTaskById(id);
  const title = task?.title ?? "Задача";
  const subject = task ? SUBJECT_LABEL[task.subject] : "";
  const exam = task?.examLabel ?? "";

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
          <span>{subject}</span>
          {exam ? <span style={{ color: "#3157d5" }}>· {exam}</span> : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              lineHeight: 1.08,
              fontWeight: 700,
              letterSpacing: "-1.5px",
              color: "#111111",
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 30, color: "#3157d5" }}>
            Ответ и решение по шагам
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 26,
            color: "#989895",
          }}
        >
          <span>Задача #{id}</span>
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
