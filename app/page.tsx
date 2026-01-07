"use client";

import GameContainer from "./components/GameContainer";
import Menu from "./components/Menu";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  useTheme,
} from "@mui/material";

export default function Home() {
  const dontoUrl =
    "https://pf.kakao.com/rocket-web/web/profiles/_xilxcBn/posts?includePinnedPost=true";
  const yunsUrl =
    "https://pf.kakao.com/rocket-web/web/profiles/_aKxdLs/posts?includePinnedPost=true";
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBar
        position="static"
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.secondary.main}`,
        }}
      >
        <Toolbar>
          <Typography
            variant="h4"
            component="h1"
            color="secondary"
            sx={{ flexGrow: 1, textAlign: "center" }}
          >
            점심 뭐 먹지?
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ my: 4, flexGrow: 1 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: theme.spacing(3),
          }}
        >
          <Box sx={{ flex: "1 1 300px" }}>
            <Menu title="돈토" apiUrl={dontoUrl} />
          </Box>
          <Box sx={{ flex: "1 1 300px" }}>
            <Menu title="윤스" apiUrl={yunsUrl} />
          </Box>
          <Box sx={{ flex: "1 1 300px" }}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ height: "100%" }}>
                <GameContainer />
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>

      <AppBar
        position="static"
        sx={{ backgroundColor: theme.palette.background.paper, mt: "auto" }}
      >
        <Toolbar>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ flexGrow: 1, textAlign: "center" }}
          >
            밥밥밥 ver 3.0.1
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
