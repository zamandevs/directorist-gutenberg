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

const CORE_LAYOUT_BLOCKS = [
	'core/group',
	'core/columns',
	'core/column',
	'core/row',
	'core/stack',
	'core/spacer',
	'core/separator',
	'core/heading',
	'core/paragraph',
	'core/image',
	'core/buttons',
	'core/button',
];

export default function Edit() {
	const listingFieldBlocks = getBlockTypes()
		.filter( ( block ) => {
			return (
				block.name.startsWith(
					'directorist-gutenberg/listing-card-'
				) &&
				block.name !== 'directorist-gutenberg/listing-card-template'
			);
		} )
		.map( ( block ) => block.name );

	const allowedBlocks = Array.from(
		new Set( [ ...listingFieldBlocks, ...CORE_LAYOUT_BLOCKS ] )
	);

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
					'Edit one card blueprint here. It will be reused for every listing in the loop.',
					'directorist-gutenberg'
				) }
			</p>
			<div { ...innerBlocksProps } />
		</div>
	);
}
