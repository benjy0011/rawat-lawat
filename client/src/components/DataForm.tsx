import {
  Box,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ManRoundedIcon from "@mui/icons-material/ManRounded";
import WomanRoundedIcon from "@mui/icons-material/WomanRounded";
import type { FormValues } from "../types/onboarding";
import { inferPatientGenderFromNric } from "../types/patient";
import { InsurerLabel } from "./InsurerChip";

export function DataForm({
  title,
  description,
  fields,
  values,
  setValues,
  show,
  selectOptions = {},
}: {
  title: string;
  description: string;
  fields: Array<[string, string]>;
  values: FormValues;
  setValues: (value: FormValues) => void;
  show: boolean;
  selectOptions?: Partial<Record<string, readonly string[]>>;
}) {
  if (!show) return null;
  return (
    <Card className="motion-card motion-enter motion-enter-delay-2" variant="outlined" sx={{ mt: 3 }}>
      <CardContent>
        <Box display="flex" gap={1.5} alignItems="flex-start">
          <EditOutlinedIcon color="primary" />
          <Box>
            <Typography fontWeight={700}>{title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Box>
        <Grid container spacing={2} mt={1}>
          {fields.map(([label, key]) => {
            const options = selectOptions[key];

            if (key === "gender") {
              return (
                <Grid key={key} size={{ xs: 12, sm: 6 }}>
                  <GenderPicker
                    value={values.gender}
                    onChange={(gender) =>
                      setValues({ ...values, gender })
                    }
                  />
                </Grid>
              );
            }

            return (
              <Grid
                key={key}
                size={{
                  xs: 12,
                  sm: key === "fullName" || key === "provider" ? 12 : 6,
                }}
              >
                <TextField
                  select={Boolean(options)}
                  label={label}
                  value={values[key]}
                  helperText={
                    key === "provider"
                        ? "Choose your medical insurance provider."
                        : undefined
                  }
                  onChange={(event) => {
                    const nextValues = { ...values, [key]: event.target.value };

                    if (key === "nric") {
                      const suggestedGender = inferPatientGenderFromNric(
                        event.target.value,
                      );

                      if (suggestedGender) {
                        nextValues.gender = suggestedGender;
                      }
                    }

                    setValues(nextValues);
                  }}
                >
                  {options?.map(option => (
                    <MenuItem key={option} value={option}>
                      {key === "provider" ? (
                        <InsurerLabel insurer={option} />
                      ) : (
                        option
                      )}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
}

function GenderPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (gender: "male" | "female") => void;
}) {
  const options = [
    {
      value: "male" as const,
      label: "Male",
      icon: <ManRoundedIcon />,
      color: "#1565c0",
      backgroundColor: "#e3f2fd",
    },
    {
      value: "female" as const,
      label: "Female",
      icon: <WomanRoundedIcon />,
      color: "#db2777",
      backgroundColor: "#fce7f3",
    },
  ];

  return (
    <FormControl fullWidth>
      <Typography variant="body2" fontWeight={700} mb={1}>
        Gender
      </Typography>
      <RadioGroup
        aria-label="Gender"
        row
        value={value}
        onChange={(event) => onChange(event.target.value as "male" | "female")}
      >
        <Stack direction="row" spacing={1.25} width="100%">
          {options.map((option) => {
            const isSelected = value === option.value;

            return (
              <Box
                key={option.value}
                component="label"
                flex={1}
                p={1}
                border={1}
                borderRadius={1.5}
                sx={{
                  cursor: "pointer",
                  borderColor: isSelected ? option.color : "divider",
                  bgcolor: isSelected ? option.backgroundColor : "background.paper",
                  transition: "border-color 180ms ease, background-color 180ms ease, transform 180ms ease",
                  "&:hover": {
                    borderColor: option.color,
                    transform: "translateY(-2px)",
                  },
                  "&:focus-within": {
                    outline: `2px solid ${option.backgroundColor}`,
                    outlineOffset: 2,
                  },
                }}
              >
                <Radio
                  value={option.value}
                  sx={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
                />
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.75}>
                  <Box
                    display="grid"
                    width={28}
                    height={28}
                    borderRadius={1}
                    color={option.color}
                    sx={{ placeItems: "center" }}
                  >
                    {option.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={800} color={isSelected ? option.color : "text.primary"}>
                      {option.label}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </RadioGroup>
      <FormHelperText sx={{ ml: 0 }}>
        Suggested from the IC number. You can change this.
      </FormHelperText>
    </FormControl>
  );
}
