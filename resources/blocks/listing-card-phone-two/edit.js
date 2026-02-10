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
import previewImg from "@image/blocks-preview/phone.webp";
import { getIconUrl } from "@directorist-gutenberg/gutenberg/utils/icon-url";
import "./editor.scss";
import TextAlignControl from "@directorist-gutenberg/components/TextAlignControl";

export default function Edit({ attributes, setAttributes }) {
  // Show block preview image
  if (attributes.is_preview) {
    return <BlockPreview image={previewImg} />;
  }

  const iconUrl = getIconUrl(attributes.icon);
  return (
    <>
      <TextAlignControl attributes={attributes} setAttributes={setAttributes} />
      <div className="directorist-gutenberg-listing-card-element directorist-gutenberg-listing-card-element-phone">
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
            {attributes?.show_label && (
              <span className="directorist-gutenberg-listing-card-element-label">
                Phone Two:
              </span>
            )}
            <span className="directorist-gutenberg-listing-card-element-value">
              (123) 456-7890
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
