/**
 * WordPress dependencies
 */
import { useInnerBlocksProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './editor.scss';
import BlockPreview from '@directorist-gutenberg/gutenberg/components/block-preview';
import previewImg from '@image/blocks-preview/archive.png';

const ALLOWED_BLOCKS = [
	'directorist-gutenberg/listings-search',
	'directorist-gutenberg/listings-header',
	'directorist-gutenberg/listings-filters',
	'directorist-gutenberg/listing-card-template',
];

const TEMPLATE = [
	[ 'directorist-gutenberg/listings-search', {} ],
	[ 'directorist-gutenberg/listings-header', {} ],
	[ 'directorist-gutenberg/listings-filters', {} ],
	[ 'directorist-gutenberg/listing-card-template', {} ],
];

export default function Edit( { attributes, setAttributes, clientId } ) {
	useEffect( () => {
		if ( attributes.instance_id ) {
			return;
		}

		setAttributes( {
			instance_id: `loop-${ clientId }`,
		} );
	}, [ attributes.instance_id, clientId, setAttributes ] );

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: 'directorist-gutenberg-listings-loop-editor__inner',
		},
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
			templateLock: false,
		}
	);

	if ( attributes.is_preview ) {
		return <BlockPreview image={ previewImg } />;
	}

	return (
		<div className="directorist-gutenberg-listings-loop-editor">
			<p className="directorist-gutenberg-listings-loop-editor__notice">
				{ __(
					'Compose your listings loop with search, header, filters, and card template blocks.',
					'directorist-gutenberg'
				) }
			</p>
			<div { ...innerBlocksProps } />
		</div>
	);
}
