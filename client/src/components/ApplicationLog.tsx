import { useState, type ReactNode } from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import Timeline from "@mui/lab/Timeline";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import type { WorkflowEvent } from "../workflow/AdmissionWorkflowContext";

const eventStyles: Record<
  WorkflowEvent["actor"],
  { color: string; backgroundColor: string; icon: ReactNode }
> = {
  Patient: {
    color: "#1565c0",
    backgroundColor: "#e3f2fd",
    icon: <PersonOutlineRoundedIcon fontSize="small" />,
  },
  "AI Assistant": {
    color: "#6a1b9a",
    backgroundColor: "#f3e5f5",
    icon: <SmartToyOutlinedIcon fontSize="small" />,
  },
  Doctor: {
    color: "#00796b",
    backgroundColor: "#e0f2f1",
    icon: <LocalHospitalOutlinedIcon fontSize="small" />,
  },
  Administrator: {
    color: "#003d9b",
    backgroundColor: "rgba(0, 61, 155, 0.1)",
    icon: <SupportAgentRoundedIcon fontSize="small" />,
  },
  Insurance: {
    color: "#b45309",
    backgroundColor: "#fff7ed",
    icon: <SendRoundedIcon fontSize="small" />,
  },
};

type Props = {
  timeline: WorkflowEvent[];
  // Number of most-recent updates to show before "Show earlier updates".
  collapsedCount?: number;
};

export function ApplicationLog({ timeline, collapsedCount = 3 }: Props) {
  const [expanded, setExpanded] = useState(false);

  const orderedEvents = [...timeline].reverse();
  const visibleEvents = expanded
    ? orderedEvents
    : orderedEvents.slice(0, collapsedCount);
  const hiddenCount = orderedEvents.length - collapsedCount;

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
      >
        <Typography
          variant="overline"
          color="primary"
          fontWeight={800}
          letterSpacing=".12em"
        >
          Application log
        </Typography>
        <Chip
          label={`${timeline.length} updates`}
          size="small"
          variant="outlined"
        />
      </Stack>

      <Timeline
        position="right"
        sx={{
          m: 0,
          mt: 2,
          p: 0,
          "& .MuiTimelineItem-root:before": { flex: 0, padding: 0 },
          "& .MuiTimelineItem-root:last-of-type": { minHeight: 0 },
        }}
      >
        {visibleEvents.map((item, index, events) => (
          <TimelineItem key={`${item.occurredAt}-${index}`}>
            <TimelineSeparator>
              <TimelineDot
                sx={{
                  m: 0,
                  p: 0.75,
                  color: eventStyles[item.actor].color,
                  bgcolor: eventStyles[item.actor].backgroundColor,
                  boxShadow: "none",
                }}
              >
                {eventStyles[item.actor].icon}
              </TimelineDot>
              {index < events.length - 1 && (
                <TimelineConnector
                  sx={{ bgcolor: "divider", width: 2, my: 0.5 }}
                />
              )}
            </TimelineSeparator>
            <TimelineContent
              sx={{
                pt: 0,
                pb: index === events.length - 1 ? 0 : 2.5,
                pl: 1.75,
              }}
            >
              <Box
                border={1}
                borderColor="divider"
                borderRadius={2}
                p={1.5}
                sx={{ bgcolor: "grey.50" }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ sm: "center" }}
                  justifyContent="space-between"
                  spacing={0.75}
                >
                  <Typography
                    variant="subtitle2"
                    color={eventStyles[item.actor].color}
                  >
                    {item.actor}
                  </Typography>
                  <Chip label={item.occurredAt} size="small" variant="outlined" />
                </Stack>
                <Typography variant="body2" color="text.secondary" mt={0.75}>
                  {item.message}
                </Typography>
              </Box>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>

      {hiddenCount > 0 && (
        <Button
          size="small"
          onClick={() => setExpanded(current => !current)}
          sx={{ mt: 2 }}
        >
          {expanded
            ? "Show recent updates only"
            : `Show ${hiddenCount} earlier update${hiddenCount > 1 ? "s" : ""}`}
        </Button>
      )}
    </>
  );
}
