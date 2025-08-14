"use client"

import { Suspense } from "react";
import { CircularProgress, Box } from "@mui/material";
import RegistroContent from "./RegistroContent";

export default function CompletarRegistroPage() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress color="secondary" />
      </Box>
    }>
      <RegistroContent />
    </Suspense>
  );
}
