import { ToolbarGroup, ToolbarButton } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import clsx from "clsx";

const defaultOptions = [
  { label: __("Desktop", "directorist-gutenberg"), value: "desktop" },
  { label: __("Tablet", "directorist-gutenberg"), value: "tablet" },
  { label: __("Mobile", "directorist-gutenberg"), value: "mobile" },
];

export default function DeviceToggleControl({
  selectedDevice = "desktop",
  onChange = () => {},
  options = defaultOptions,
  groupClassName = "directorist-gutenberg-toolbar",
}) {
  return (
    <ToolbarGroup className={groupClassName}>
      {options.map(({ label, value }) => (
        <ToolbarButton
          key={value}
          variant="secondary"
          className={clsx({
            "is-selected": selectedDevice === value,
          })}
          onClick={() => onChange(value)}
        >
          <span>{label}</span>
        </ToolbarButton>
      ))}
    </ToolbarGroup>
  );
}
