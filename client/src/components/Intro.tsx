import { Chip, Stack, Typography } from "@mui/material";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";

export function Intro({
  badge,
  title,
  body,
  icon,
}: {
  badge: string;
  title: string;
  body: string;
  icon: "id" | "shield";
}) {
  const Icon = icon === "id" ? BadgeOutlinedIcon : HealthAndSafetyOutlinedIcon;
  return (
    <Stack alignItems="center" textAlign="center" spacing={1.5} mb={4}>
      <Chip icon={<Icon />} label={badge} color="primary" variant="outlined" />
      <Typography variant="h4">{title}</Typography>
      <Typography color="text.secondary" maxWidth={510}>
        {body}
      </Typography>
    </Stack>
  );
}
