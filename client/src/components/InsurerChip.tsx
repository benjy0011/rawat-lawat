import { Avatar, Box, Chip } from "@mui/material";
import type { ChipProps } from "@mui/material";
import aiaLogo from "../assets/aia.png";
import allianzLogo from "../assets/alianz.png";
import greatEasternLogo from "../assets/great-eastern.jpeg";
import prudentialLogo from "../assets/prudential.jpeg";

const insurerLogos = [
  { match: "aia", logo: aiaLogo },
  { match: "allianz", logo: allianzLogo },
  { match: "great eastern", logo: greatEasternLogo },
  { match: "prudential", logo: prudentialLogo },
];

type InsurerChipProps = {
  insurer: string;
  size?: ChipProps["size"];
};

export function getInsurerLogo(insurer: string) {
  return insurerLogos.find(({ match }) =>
    insurer.toLowerCase().includes(match),
  )?.logo;
}

export function InsurerLabel({ insurer }: { insurer: string }) {
  const logo = getInsurerLogo(insurer);

  return (
    <Box component="span" display="inline-flex" alignItems="center" gap={0.75}>
      {logo && (
        <Box
          component="img"
          src={logo}
          alt=""
          width={20}
          height={20}
          sx={{ borderRadius: "50%", objectFit: "contain" }}
        />
      )}
      <Box component="span">{insurer}</Box>
    </Box>
  );
}

export function InsurerChip({ insurer, size = "small" }: InsurerChipProps) {
  const logo = getInsurerLogo(insurer);

  return (
    <Chip
      avatar={
        logo ? (
          <Avatar
            alt=""
            src={logo}
            sx={{
              bgcolor: "common.white",
              "& img": { objectFit: "contain", p: 0.35 },
            }}
          />
        ) : undefined
      }
      className="insurer-chip"
      label={insurer}
      size={size}
      variant="outlined"
      sx={{
        bgcolor: "rgba(255, 255, 255, 0.72)",
        borderColor: "rgba(0, 61, 155, 0.2)",
        fontWeight: 700,
      }}
    />
  );
}
