import { BlockControls, AlignmentControl } from "@wordpress/block-editor";
import { useState } from "@wordpress/element";
import DeviceToggleControl from "@directorist-gutenberg/gutenberg/components/controls/device-toggle-control";
import {
  normalizeResponsiveTextAlignValues,
  normalizeTextAlignValue,
} from "@directorist-gutenberg/gutenberg/text-align-utils";

export default function TextAlignControl({ attributes, setAttributes }) {
  const [selectedDevice, setSelectedDevice] = useState("desktop");
  const desktopAlign = normalizeTextAlignValue(attributes?.textAlign, "");
  const responsiveAlignValues = normalizeResponsiveTextAlignValues(
    attributes?.textAlign_responsive,
    desktopAlign,
  );

  const selectedDeviceAlign =
    selectedDevice === "desktop"
      ? desktopAlign
      : normalizeTextAlignValue(
          responsiveAlignValues[selectedDevice],
          desktopAlign,
        );

  const updateAlignmentForDevice = (nextAlign) => {
    const normalizedAlign = normalizeTextAlignValue(nextAlign, "");
    const nextResponsiveAlignValues = {
      ...responsiveAlignValues,
      [selectedDevice]: normalizedAlign,
    };

    if (selectedDevice === "desktop") {
      nextResponsiveAlignValues.desktop = normalizedAlign;
    }

    setAttributes({
      textAlign: selectedDevice === "desktop" ? normalizedAlign : desktopAlign,
      textAlign_responsive: nextResponsiveAlignValues,
    });
  };

  return (
    <>
      <BlockControls>
        <DeviceToggleControl
          selectedDevice={selectedDevice}
          onChange={setSelectedDevice}
        />
      </BlockControls>
      <BlockControls group="block">
        <AlignmentControl
          value={selectedDeviceAlign}
          onChange={updateAlignmentForDevice}
        />
      </BlockControls>
    </>
  );
}
