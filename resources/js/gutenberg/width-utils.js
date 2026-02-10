const WIDTH_NORMALIZATION_MAP = {
  100: "100",
  75: "75",
  67: "67",
  66.67: "67",
  66.6667: "67",
  50: "50",
  33: "33",
  33.33: "33",
  33.3333: "33",
  25: "25",
  inline: "inline",
};

const WIDTH_KEYS = ["desktop", "tablet", "mobile"];

const sanitizeWidthValue = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  const normalized = String(value).trim().toLowerCase();
  return WIDTH_NORMALIZATION_MAP[normalized] || "";
};

export const normalizeWidthValue = (value, fallback = "100") => {
  const normalized = sanitizeWidthValue(value);
  if (normalized) {
    return normalized;
  }

  const fallbackNormalized = sanitizeWidthValue(fallback);
  return fallbackNormalized || "100";
};

export const normalizeResponsiveWidthValues = (
  responsiveValues = {},
  desktopFallback = "100",
) => {
  const safeResponsiveValues =
    responsiveValues && typeof responsiveValues === "object"
      ? responsiveValues
      : {};

  const desktop = normalizeWidthValue(
    safeResponsiveValues.desktop,
    desktopFallback,
  );
  const normalized = {
    desktop,
    tablet: sanitizeWidthValue(safeResponsiveValues.tablet),
    mobile: sanitizeWidthValue(safeResponsiveValues.mobile),
  };

  WIDTH_KEYS.forEach((key) => {
    if (!normalized[key]) {
      normalized[key] = "";
    }
  });

  return normalized;
};

export const getResponsiveWidthClassNames = (attributes = {}) => {
  const desktopWidth = normalizeWidthValue(attributes.block_width, "100");
  const responsiveValues = normalizeResponsiveWidthValues(
    attributes.block_width_responsive,
    desktopWidth,
  );

  const classNames = [
    `directorist-gutenberg-block-width-${responsiveValues.desktop}`,
  ];

  if (responsiveValues.tablet) {
    classNames.push(
      `directorist-gutenberg-block-width-tablet-${responsiveValues.tablet}`,
    );
  }

  if (responsiveValues.mobile) {
    classNames.push(
      `directorist-gutenberg-block-width-mobile-${responsiveValues.mobile}`,
    );
  }

  return classNames.join(" ");
};
