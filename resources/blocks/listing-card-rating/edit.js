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
import previewImg from "@image/blocks-preview/rating.webp";
import starSolid from "@icon/star-alt.svg";
import "./editor.scss";

export default function Edit({ attributes, setAttributes }) {
  // Show block preview image
  if (attributes.is_preview) {
    return <BlockPreview image={previewImg} />;
  }

  return (
    <>
      <TextAlignControl attributes={attributes} setAttributes={setAttributes} />
      <div className="directorist-gutenberg-listing-card-element directorist-gutenberg-listing-card-element-rating">
        <div className="directorist-gutenberg-listing-card-element-content">
          <div className="directorist-gutenberg-listing-card-rating-stars">
            <span className="directorist-gutenberg-listing-card-rating-star-active">
              <ReactSVG src={starSolid} />
            </span>
            <span className="directorist-gutenberg-listing-card-rating-star-active">
              <ReactSVG src={starSolid} />
            </span>
            <span className="directorist-gutenberg-listing-card-rating-star-active">
              <ReactSVG src={starSolid} />
            </span>
            <span className="directorist-gutenberg-listing-card-rating-star-inactive">
              <ReactSVG src={starSolid} />
            </span>
            <span className="directorist-gutenberg-listing-card-rating-star-inactive">
              <ReactSVG src={starSolid} />
            </span>
          </div>
          <div className="directorist-gutenberg-listing-card-rating-info">
            <span className="directorist-gutenberg-listing-card-rating-value">
              4.5
            </span>
            <span className="directorist-gutenberg-listing-card-rating-count">
              (2)
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
