/**
 * Internal dependencies
 */
import './editor.scss';
import BlockPreview from '@directorist-gutenberg/gutenberg/components/block-preview';
import BlockServerRender from '@directorist-gutenberg/gutenberg/components/block-server-render';
import previewImg from '@image/blocks-preview/archive-header.png';

export default function Edit( { attributes } ) {
	// Show block preview image
	if ( attributes.is_preview ) {
		return <BlockPreview image={ previewImg } />;
	}

	return (
		<BlockServerRender
			block="directorist-gutenberg/listings-archive-header"
			attributes={ attributes }
		/>
	);
}
