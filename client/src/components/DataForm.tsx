import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import type { FormValues } from "../types/onboarding";

export function DataForm({
  title,
  description,
  fields,
  values,
  setValues,
  show,
}: {
  title: string;
  description: string;
  fields: Array<[string, string]>;
  values: FormValues;
  setValues: (value: FormValues) => void;
  show: boolean;
}) {
  if (!show) return null;
  return (
    <Card variant="outlined" sx={{ mt: 3 }}>
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
          {fields.map(([label, key]) => (
            <Grid
              key={key}
              size={{
                xs: 12,
                sm: key === "fullName" || key === "provider" ? 12 : 6,
              }}
            >
              <TextField
                label={label}
                value={values[key]}
                onChange={(event) =>
                  setValues({ ...values, [key]: event.target.value })
                }
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
