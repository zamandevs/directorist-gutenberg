/**
 * WordPress dependencies
 */
import { BlockControls } from "@wordpress/block-editor";
import { ToolbarGroup, ToolbarButton } from "@wordpress/components";
import { useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

/**
 * External dependencies
 */
import clsx from "clsx";
import DeviceToggleControl from "./components/controls/device-toggle-control";

import {
  normalizeResponsiveWidthValues,
  normalizeWidthValue,
} from "./width-utils";

const widthOptions = [
  { label: __("100%", "directorist-gutenberg"), value: "100" },
  { label: __("75%", "directorist-gutenberg"), value: "75" },
  { label: __("67%", "directorist-gutenberg"), value: "67" },
  { label: __("50%", "directorist-gutenberg"), value: "50" },
  { label: __("33%", "directorist-gutenberg"), value: "33" },
  { label: __("25%", "directorist-gutenberg"), value: "25" },
  { label: __("Inline", "directorist-gutenberg"), value: "inline" },
];

export default function WidthControls({ attributes, setAttributes }) {
  const [selectedDevice, setSelectedDevice] = useState("desktop");
  const desktopWidth = normalizeWidthValue(attributes.block_width, "100");
  const responsiveWidths = normalizeResponsiveWidthValues(
    attributes.block_width_responsive,
    desktopWidth,
  );

  const selectedDeviceWidth =
    selectedDevice === "desktop"
      ? desktopWidth
      : normalizeWidthValue(responsiveWidths[selectedDevice], desktopWidth);

  const updateWidthForDevice = (nextWidth) => {
    const normalizedWidth = normalizeWidthValue(nextWidth, desktopWidth);
    const nextResponsiveWidths = {
      ...responsiveWidths,
      [selectedDevice]: normalizedWidth,
    };

    if (selectedDevice === "desktop") {
      nextResponsiveWidths.desktop = normalizedWidth;
    }

    setAttributes({
      block_width:
        selectedDevice === "desktop" ? normalizedWidth : desktopWidth,
      block_width_responsive: nextResponsiveWidths,
    });
  };

  return (
    <BlockControls>
      <DeviceToggleControl
        selectedDevice={selectedDevice}
        onChange={setSelectedDevice}
      />
      <ToolbarGroup className="directorist-gutenberg-toolbar">
        {widthOptions.map(({ label, value }) => (
          <ToolbarButton
            key={value}
            variant="secondary"
            className={clsx({
              "is-selected": selectedDeviceWidth === value,
            })}
            onClick={() => updateWidthForDevice(value)}
          >
            <span>{label}</span>
          </ToolbarButton>
        ))}
      </ToolbarGroup>
    </BlockControls>
  );
}
