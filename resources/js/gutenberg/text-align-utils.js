const TEXT_ALIGN_VALUES = ["left", "center", "right", "justify"];

export const normalizeTextAlignValue = (value, fallback = "") => {
  if (value === undefined || value === null) {
    return fallback || "";
  }

  const normalized = String(value).trim().toLowerCase();
  if (TEXT_ALIGN_VALUES.includes(normalized)) {
    return normalized;
  }

  return fallback || "";
};

export const normalizeResponsiveTextAlignValues = (
  responsiveValues = {},
  desktopFallback = "",
) => {
  const safeResponsiveValues =
    responsiveValues && typeof responsiveValues === "object"
      ? responsiveValues
      : {};

  return {
    desktop: normalizeTextAlignValue(
      safeResponsiveValues.desktop,
      desktopFallback,
    ),
    tablet: normalizeTextAlignValue(safeResponsiveValues.tablet, ""),
    mobile: normalizeTextAlignValue(safeResponsiveValues.mobile, ""),
  };
};

export const getResponsiveTextAlignClassNames = (attributes = {}) => {
  const desktopAlign = normalizeTextAlignValue(attributes.textAlign, "");
  const responsiveValues = normalizeResponsiveTextAlignValues(
    attributes.textAlign_responsive,
    desktopAlign,
  );

  const classNames = [];
  if (responsiveValues.desktop) {
    classNames.push(`has-text-align-${responsiveValues.desktop}`);
  }

  if (responsiveValues.tablet) {
    classNames.push(
      `directorist-gutenberg-has-text-align-tablet-${responsiveValues.tablet}`,
    );
  }

  if (responsiveValues.mobile) {
    classNames.push(
      `directorist-gutenberg-has-text-align-mobile-${responsiveValues.mobile}`,
    );
  }

  return classNames.join(" ");
};
