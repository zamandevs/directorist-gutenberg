/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";

/**
 * Internal dependencies
 */
import BlockPreview from "@directorist-gutenberg/gutenberg/components/block-preview";
import TextAlignControl from "@directorist-gutenberg/components/TextAlignControl";
import previewImg from "@image/blocks-preview/listing-title.webp";
import "./editor.scss";

export default function Edit({ attributes, setAttributes }) {
  // Show block preview image
  if (attributes.is_preview) {
    return <BlockPreview image={previewImg} />;
  }

  return (
    <>
      <TextAlignControl attributes={attributes} setAttributes={setAttributes} />
      <span>{__("Listing Title", "directorist-gutenberg")}</span>
    </>
  );
}
