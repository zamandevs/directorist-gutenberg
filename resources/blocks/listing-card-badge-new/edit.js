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
import previewImg from "@image/blocks-preview/badge-new.webp";
import newIcon from "@icon/bolt-solid.svg";
import "./editor.scss";

export default function Edit({ attributes, setAttributes }) {
  // Show block preview image
  if (attributes.is_preview) {
    return <BlockPreview image={previewImg} />;
  }

  return (
    <>
      <TextAlignControl attributes={attributes} setAttributes={setAttributes} />
      <div className="directorist-gutenberg-listing-card-element directorist-gutenberg-listing-card-element-badge">
        <div
          className="directorist-gutenberg-listing-badge directorist-gutenberg-listing-badge-new"
          style={{
            backgroundColor: attributes.background_color,
            color: attributes.text_color,
          }}
        >
          <ReactSVG src={newIcon} />
          {attributes.text && <span>{attributes.text}</span>}
        </div>
      </div>
    </>
  );
}
