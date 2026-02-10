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
import TextAlignControl from "@directorist-gutenberg/components/TextAlignControl";
import previewImg from "@image/blocks-preview/pricing.png";
import { getIconUrl } from "@directorist-gutenberg/gutenberg/utils/icon-url";
import "./editor.scss";

export default function Edit({ attributes, setAttributes }) {
  // Show block preview image
  if (attributes.is_preview) {
    return <BlockPreview image={previewImg} />;
  }

  const iconUrl = getIconUrl(attributes.icon);

  return (
    <>
      <TextAlignControl attributes={attributes} setAttributes={setAttributes} />
      <div className="directorist-gutenberg-listing-card-element directorist-gutenberg-listing-card-element-pricing">
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
          <span>$1233.00</span>
        </div>
      </div>
    </>
  );
}
