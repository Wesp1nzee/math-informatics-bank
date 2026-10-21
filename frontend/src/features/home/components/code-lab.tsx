"use client";

import { useState } from "react";

import { BitTape } from "@/features/home/components/bit-tape";
import { CodeDemo, type CodeStage } from "@/features/home/components/code-demo";

const INITIAL: CodeStage = { status: "idle", result: null };

export function CodeLab() {
  const [stage, setStage] = useState<CodeStage>(INITIAL);

  return (
    <div className="grid gap-4">
      <CodeDemo onStage={setStage} />
      <BitTape stage={stage} />
    </div>
  );
}
