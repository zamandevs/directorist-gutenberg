/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";

/**
 * External dependencies
 */
import ReactSVG from "react-inlinesvg";

/**
 * Internal dependencies
 */
import BlockPreview from "@directorist-gutenberg/gutenberg/components/block-preview";
import previewImg from "@image/blocks-preview/number.webp";
import { getIconUrl } from "@directorist-gutenberg/gutenberg/utils/icon-url";
import { useSubmissionFields } from "@directorist-gutenberg/gutenberg/hooks/useSubmissionFields";
import "./editor.scss";
import TextAlignControl from "@directorist-gutenberg/components/TextAlignControl";
export default function Edit({ attributes, setAttributes }) {
  // Show block preview image
  if (attributes.is_preview) {
    return <BlockPreview image={previewImg} />;
  }

  const iconUrl = getIconUrl(attributes.icon);
  const { getField } = useSubmissionFields();
  const field = getField("custom", "number", attributes.meta_key);
  const fieldExist = field !== null;

  return (
    <>
      <TextAlignControl attributes={attributes} setAttributes={setAttributes} />
      <div
        style={{ opacity: fieldExist ? 1 : 0.2 }}
        className="directorist-gutenberg-listing-card-element directorist-gutenberg-listing-card-element-custom-text"
      >
        <div className="directorist-gutenberg-listing-card-element-content">
          {iconUrl && (
            <span
              className="directorist-gutenberg-listing-card-element-icon"
              style={{
                "--directorist-gutenberg-icon-color": attributes.icon_color,
              }}
            >
              <ReactSVG
                src={iconUrl}
                width={attributes.icon_size}
                height={attributes.icon_size}
              />
            </span>
          )}
          <div className="directorist-gutenberg-listing-card-element-details">
            <span className="directorist-gutenberg-listing-card-element-value">
              {fieldExist
                ? field.label
                : __("1234567890", "directorist-gutenberg")}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
