"use client";

import { Fab, Tooltip } from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import { useRouter } from "next/navigation";

export default function ChangelogButton() {
  const router = useRouter();

  return (
    <Tooltip title="업데이트 기록" placement="left">
      <Fab
        color="secondary"
        aria-label="업데이트 기록"
        onClick={() => router.push("/changelog")}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 90,
          zIndex: 1000,
        }}
      >
        <ArticleIcon />
      </Fab>
    </Tooltip>
  );
}
