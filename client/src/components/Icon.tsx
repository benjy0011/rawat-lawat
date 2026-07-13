type IconName =
  | "arrow"
  | "back"
  | "camera"
  | "upload"
  | "shield"
  | "check"
  | "refresh"
  | "close"
  | "lock"
  | "edit"
  | "id"
  | "user"
  | "mail"
  | "eye"
  | "eyeOff";

const paths: Record<IconName, string> = {
  arrow: "m14 5 7 7-7 7M21 12H3",
  back: "m15 18-6-6 6-6",
  camera:
    "M4 7h3l1.5-2h7L17 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm8 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  upload: "M12 16V3m0 0L7 8m5-5 5 5M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Zm-3-10 2 2 4-4",
  check: "m5 12 4 4L19 6",
  refresh:
    "M21 12a9 9 0 0 1-15.5 6.2M3 12a9 9 0 0 1 15.5-6.2M3 18v-5h5m10-7v5h-5",
  close: "M6 6l12 12M18 6 6 18",
  lock: "M6 10V8a6 6 0 0 1 12 0v2m-13 0h14v10H5V10Z",
  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z",
  id: "M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Zm4 4h5m-5 4h8m2-4h.01M16 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  user: "M20 21a8 8 0 0 0-16 0m12-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  mail: "M4 5h16v14H4V5Zm0 1 8 6 8-6",
  eye: "M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  eyeOff:
    "m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a18.5 18.5 0 0 1-3 3.8M6.6 6.6C3.7 8.5 2 12 2 12s3.5 7 10 7c1 0 1.9-.2 2.8-.5",
};

export function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={paths[name]} />
    </svg>
  );
}
