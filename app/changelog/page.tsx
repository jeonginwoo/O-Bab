"use client";

import { useState } from "react";
import {
  Box,
  Chip,
  Collapse,
  Container,
  Divider,
  IconButton,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import BuildIcon from "@mui/icons-material/Build";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import StarIcon from "@mui/icons-material/Star";

type ChangelogEntry = {
  version: string;
  date: string;
  label?: string;
  changes: { type: "feat" | "update" | "fix" | "style"; text: string }[];
};

const changelog: ChangelogEntry[] = [
  {
    version: "3.8.0",
    date: "2026-03-09",
    label: "최신",
    changes: [
      { type: "feat", text: "업데이트 기록 페이지 추가" },
      { type: "feat", text: "앱바에 업데이트 기록 버튼 추가" },
    ],
  },
  {
    version: "3.7.14",
    date: "2026-03-09",
    changes: [
      { type: "style", text: "룰렛 구분선 두께 일정하게 수정" },
    ],
  },
  {
    version: "3.7.13",
    date: "2026-03-09",
    changes: [
      { type: "style", text: "룰렛/사다리타기/마블 룰렛 참가자 목록 UI 통일" },
    ],
  },
  {
    version: "3.7.12",
    date: "2026-03-09",
    changes: [
      { type: "update", text: "맛집 이미지 동적으로 가져오도록 수정" },
      { type: "style", text: "메인페이지 이미지 호버 효과 변경" },
    ],
  },
  {
    version: "3.7.10",
    date: "2026-03-09",
    changes: [
      { type: "update", text: "돈토 저녁상차림 메뉴판 제거" },
    ],
  },
  {
    version: "3.7.9",
    date: "2026-03-06",
    changes: [
      { type: "style", text: "전반적인 UI 디자인 개선" },
    ],
  },
  {
    version: "3.7.8",
    date: "2026-02-27",
    changes: [
      { type: "update", text: "맛집 음식점 사진 추가" },
    ],
  },
  {
    version: "3.7.7",
    date: "2026-02-25",
    changes: [
      { type: "style", text: "마블 룰렛 참가자 추가 UI/UX 개선" },
    ],
  },
  {
    version: "3.7.6",
    date: "2026-02-12",
    changes: [
      { type: "fix", text: "마블 룰렛 배속 고정되는 문제 수정" },
      { type: "style", text: "공 색상 랜덤 지정" },
    ],
  },
  {
    version: "3.7.4",
    date: "2026-02-12",
    changes: [
      { type: "style", text: "사다리타기 커피잔 연기효과 추가" },
    ],
  },
  {
    version: "3.7.3",
    date: "2026-02-12",
    changes: [
      { type: "update", text: "마블 룰렛 카메라 줌 효과 조절" },
    ],
  },
  {
    version: "3.7.2",
    date: "2026-02-12",
    changes: [
      { type: "update", text: "마블 룰렛 테마 적용" },
    ],
  },
  {
    version: "3.7.1",
    date: "2026-02-11",
    changes: [
      { type: "style", text: "마블 룰렛 미니맵이 화면 가리지 않도록 너비 조정" },
    ],
  },
  {
    version: "3.7.0",
    date: "2026-02-11",
    changes: [
      { type: "feat", text: "마블 룰렛 추가" },
    ],
  },
  {
    version: "3.6.9",
    date: "2026-02-11",
    changes: [
      { type: "update", text: "음식 랜덤 추천 → 랜덤뽑기 페이지로 통합" },
    ],
  },
  {
    version: "3.6.8",
    date: "2026-02-11",
    changes: [
      { type: "update", text: "룰렛 돌리기 게이지 추가" },
      { type: "style", text: "사다리타기 디자인 수정" },
    ],
  },
  {
    version: "3.6.7",
    date: "2026-02-11",
    changes: [
      { type: "update", text: "페이지명 변경 (사다리타기 → 랜덤뽑기)" },
    ],
  },
  {
    version: "3.6.6",
    date: "2026-02-06",
    changes: [
      { type: "style", text: "룰렛 디자인 개선" },
    ],
  },
  {
    version: "3.6.5",
    date: "2026-02-06",
    changes: [
      { type: "update", text: "맛집 페이지에서 푸터 제거" },
    ],
  },
  {
    version: "3.6.4",
    date: "2026-02-06",
    changes: [
      { type: "feat", text: "oliveMeadow 테마 추가" },
    ],
  },
  {
    version: "3.6.3",
    date: "2026-01-28",
    changes: [
      { type: "update", text: "윤스 메뉴 이미지 메인 등록 자동 판단 로직 적용" },
    ],
  },
  {
    version: "3.6.2",
    date: "2026-01-28",
    changes: [
      { type: "update", text: "메뉴판 이미지 로직 리팩토링" },
    ],
  },
  {
    version: "3.6.1",
    date: "2026-01-28",
    changes: [
      { type: "style", text: "테마 버튼 정렬 수정" },
    ],
  },
  {
    version: "3.6.0",
    date: "2026-01-28",
    changes: [
      { type: "feat", text: "문의하기 구글폼 추가" },
    ],
  },
  {
    version: "3.5.6",
    date: "2026-01-26",
    changes: [
      { type: "update", text: "지도 핀 겹치지 않도록 개선" },
    ],
  },
  {
    version: "3.5.5",
    date: "2026-01-26",
    changes: [
      { type: "fix", text: "지도 핀 안 생기는 문제 수정" },
    ],
  },
  {
    version: "3.5.4",
    date: "2026-01-23",
    changes: [
      { type: "update", text: "지도 핀 설명 닫기 버튼 추가" },
      { type: "update", text: "모바일 UI 최적화" },
    ],
  },
  {
    version: "3.5.1",
    date: "2026-01-21",
    changes: [
      { type: "feat", text: "맛집 지도 페이지 추가" },
    ],
  },
  {
    version: "3.4.3",
    date: "2026-01-18",
    changes: [
      { type: "style", text: "음식 추천 그림자 효과 애니메이션 추가" },
    ],
  },
  {
    version: "3.4.0",
    date: "2026-01-14",
    changes: [
      { type: "feat", text: "음식 랜덤 추천 기능 추가" },
      { type: "style", text: "돈토 메뉴 구분선 배경색상 설정" },
      { type: "style", text: "사다리타기 버튼 색상 수정" },
    ],
  },
  {
    version: "3.3.0",
    date: "2026-01-14",
    changes: [
      { type: "feat", text: "테마 변경 기능 추가" },
      { type: "style", text: "각 섹션 제목 Bold 처리" },
    ],
  },
  {
    version: "3.2.4",
    date: "2026-01-13",
    changes: [
      { type: "feat", text: "로고 추가" },
      { type: "update", text: "시간 표시 필드 변경 (created_at → updated_at)" },
    ],
  },
  {
    version: "3.2.0",
    date: "2026-01-11",
    changes: [
      { type: "feat", text: "Swiper API 적용 (이미지 슬라이드)" },
      { type: "style", text: "이미지 슬라이드 가운데 정렬" },
      { type: "update", text: "컴포넌트 구조화" },
      { type: "fix", text: "모바일 브라우저 UI 잘리는 문제 수정" },
    ],
  },
  {
    version: "3.1.8",
    date: "2026-01-09",
    changes: [
      { type: "style", text: "돈토·윤스 게시글 작성일시 표시" },
      { type: "style", text: "모달창 이미지 넘김 버튼 위치 수정" },
    ],
  },
  {
    version: "3.1.5",
    date: "2026-01-09",
    changes: [
      { type: "update", text: "돈토 메뉴 컴포넌트 분리" },
      { type: "fix", text: "돈토 메뉴 모달창 크기 수정" },
      { type: "update", text: "이미지 모달창 넘김 버튼 추가" },
    ],
  },
  {
    version: "3.1.3",
    date: "2026-01-08",
    changes: [
      { type: "update", text: "사다리타기 Enter키로 시작 가능" },
      { type: "update", text: "돈토 메뉴 이미지 2개 → 1개로 합침" },
    ],
  },
  {
    version: "3.1.0",
    date: "2026-01-07",
    changes: [
      { type: "update", text: "사다리타기 결과 당첨자 표시" },
      { type: "update", text: "사다리타기 시작 전 캔버스 숨김" },
    ],
  },
  {
    version: "3.0.0",
    date: "2026-01-07",
    changes: [
      { type: "feat", text: "Next.js 앱으로 리뉴얼" },
      { type: "feat", text: "룰렛 기능 추가" },
      { type: "feat", text: "사다리타기 기능 추가 (커피빵, Enter키 지원, 결과 표시)" },
      { type: "feat", text: "돈토 메뉴판 기능 추가" },
      { type: "feat", text: "Vercel Analytics 적용" },
      { type: "fix", text: "모바일 브라우저 UI 잘리는 문제 수정" },
    ],
  },
  {
    version: "2.1.0",
    date: "2025-09-22",
    changes: [
      { type: "feat", text: "초기 서비스 출시" },
      { type: "feat", text: "점심 메뉴 추천 기능" },
    ],
  },
];

const typeConfig = {
  feat: { label: "기능 추가", color: "success" as const, Icon: StarIcon },
  update: { label: "개선", color: "info" as const, Icon: BuildIcon },
  fix: { label: "버그 수정", color: "error" as const, Icon: AutoFixHighIcon },
  style: { label: "디자인", color: "secondary" as const, Icon: NewReleasesIcon },
};

export default function ChangelogPage() {
  const theme = useTheme();
  const sec = theme.palette.secondary.main;

  // Group entries by major.minor (e.g. "3.7", "3.6", ...)
  const groups: { groupKey: string; entries: ChangelogEntry[] }[] = [];
  for (const entry of changelog) {
    const key = entry.version.split(".").slice(0, 2).join(".");
    const existing = groups.find((g) => g.groupKey === key);
    if (existing) {
      existing.entries.push(entry);
    } else {
      groups.push({ groupKey: key, entries: [entry] });
    }
  }

  // First group open by default, rest closed
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(groups.map((g, i) => [g.groupKey, i === 0]))
  );

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{ color: theme.palette.text.primary, letterSpacing: "-0.02em" }}
        >
          업데이트 기록
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
          밥밥밥의 변경 이력을 확인할 수 있습니다.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {groups.map(({ groupKey, entries }) => {
          const isOpen = openGroups[groupKey] ?? false;
          const hasLatest = entries.some((e) => e.label);
          const latestVer = entries[0].version;
          const oldestVer = entries[entries.length - 1].version;
          const dateRange =
            entries[0].date === entries[entries.length - 1].date
              ? entries[0].date
              : `${entries[entries.length - 1].date} ~ ${entries[0].date}`;

          return (
            <Paper
              key={groupKey}
              elevation={0}
              sx={{
                border: `1px solid ${hasLatest ? `${sec}90` : theme.palette.divider}`,
                borderRadius: 2,
                background: theme.palette.background.paper,
                position: "relative",
                overflow: "hidden",
                ...(hasLatest && {
                  boxShadow: `0 0 0 1px ${sec}40, 0 0 16px 2px ${sec}28`,
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background: `linear-gradient(90deg, transparent, ${sec}, transparent)`,
                  },
                }),
              }}
            >
              {/* Group Header (toggle) */}
              <Box
                onClick={() => toggleGroup(groupKey)}
                sx={{
                  px: 3,
                  py: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  cursor: "pointer",
                  userSelect: "none",
                  "&:hover": { bgcolor: `${sec}08` },
                  transition: "background-color 0.15s",
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ color: theme.palette.text.primary, letterSpacing: "0.02em" }}
                >
                  v{groupKey}.x
                </Typography>
                {hasLatest && (
                  <Chip label="최신" size="small" color="secondary" sx={{ fontWeight: 700, fontSize: "0.7rem" }} />
                )}
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  {latestVer !== oldestVer ? `${oldestVer} ~ ${latestVer}` : `${latestVer}`}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, ml: "auto", mr: 0.5 }}>
                  {dateRange}
                </Typography>
                <IconButton
                  size="small"
                  sx={{
                    color: theme.palette.text.secondary,
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.25s",
                    flexShrink: 0,
                  }}
                >
                  <ExpandMoreIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Collapsible entries */}
              <Collapse in={isOpen}>
                <Divider />
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {entries.map((entry, entryIdx) => (
                    <Box key={entry.version}>
                      {entryIdx > 0 && <Divider sx={{ mx: 3, opacity: 0.5 }} />}
                      <Box sx={{ px: 3, py: 2 }}>
                        {/* Entry header */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                          <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            sx={{ color: theme.palette.text.primary }}
                          >
                            v{entry.version}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, ml: "auto" }}>
                            {entry.date}
                          </Typography>
                        </Box>
                        {/* Changes */}
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                          {entry.changes.map((change, i) => {
                            const { label, color } = typeConfig[change.type];
                            return (
                              <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                                <Chip
                                  label={label}
                                  size="small"
                                  color={color}
                                  variant="outlined"
                                  sx={{ fontSize: "0.65rem", height: 20, minWidth: 56, flexShrink: 0, mt: "1px" }}
                                />
                                <Typography
                                  variant="body2"
                                  sx={{ color: theme.palette.text.primary, lineHeight: 1.6 }}
                                >
                                  {change.text}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </Paper>
          );
        })}
      </Box>
    </Container>
  );
}
