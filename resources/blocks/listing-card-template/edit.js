/**
 * WordPress dependencies
 */
import { useInnerBlocksProps } from '@wordpress/block-editor';
import { getBlockTypes } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './editor.scss';

export default function Edit() {
	const allowedBlocks = getBlockTypes()
		.filter( ( block ) => {
			return (
				block.name.startsWith(
					'directorist-gutenberg/listing-card-'
				) &&
				block.name !== 'directorist-gutenberg/listing-card-template'
			);
		} )
		.map( ( block ) => block.name );

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: 'directorist-gutenberg-listing-card-template__inner',
		},
		{
			allowedBlocks,
			template: [
				[ 'directorist-gutenberg/listing-card-thumbnail', {} ],
				[ 'directorist-gutenberg/listing-card-title', {} ],
			],
			templateLock: false,
		}
	);

	return (
		<div className="directorist-gutenberg-listing-card-template-editor">
			<p className="directorist-gutenberg-listing-card-template-editor__notice">
				{ __(
					'Compose card fields that represent a listing item.',
					'directorist-gutenberg'
				) }
			</p>
			<div { ...innerBlocksProps } />
		</div>
	);
}
