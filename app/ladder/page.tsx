"use client";

import React from "react";
import Ladder from "../components/ladder/Ladder";
import { Container, Card, CardContent, Box } from "@mui/material";

export default function LadderPage() {
  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Card>
        <CardContent>
          <Ladder />
        </CardContent>
      </Card>
    </Container>
  );
}
