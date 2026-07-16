import FemaleRoundedIcon from "@mui/icons-material/FemaleRounded";
import MaleRoundedIcon from "@mui/icons-material/MaleRounded";
import { Box, Tooltip, Typography, type TypographyProps } from "@mui/material";
import type { PatientGender } from "../types/patient";

export function PatientName({
  name,
  gender,
  variant = "body1",
  fontWeight = 700,
}: {
  name: string;
  gender: PatientGender;
  variant?: TypographyProps["variant"];
  fontWeight?: number;
}) {
  const isMale = gender === "male";
  const label = isMale ? "Male patient" : "Female patient";

  return (
    <Box component="span" display="inline-flex" alignItems="center" gap={0.75}>
      <Typography component="span" variant={variant} fontWeight={fontWeight}>
        {name}
      </Typography>
      <Tooltip title={label}>
        <Box
          component="span"
          aria-label={label}
          display="inline-grid"
          width={24}
          height={24}
          borderRadius="50%"
          sx={{
            placeItems: "center",
            bgcolor: isMale ? "#e3f2fd" : "#fce7f3",
            color: isMale ? "#1565c0" : "#db2777",
          }}
        >
          {isMale ? <MaleRoundedIcon fontSize="small" /> : <FemaleRoundedIcon fontSize="small" />}
        </Box>
      </Tooltip>
    </Box>
  );
}
