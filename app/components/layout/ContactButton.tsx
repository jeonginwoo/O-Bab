"use client";

import { Fab, Tooltip } from "@mui/material";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";

export default function ContactButton() {
  const handleClick = () => {
    window.open("https://forms.gle/Hq8LCa7foUcZig8f7", "_blank", "noopener,noreferrer");
  };

  return (
    <Tooltip title="문의하기" placement="left">
      <Fab
        color="primary"
        aria-label="문의하기"
        onClick={handleClick}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <QuestionAnswerIcon />
      </Fab>
    </Tooltip>
  );
}
