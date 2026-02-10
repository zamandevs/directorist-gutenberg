/**
 * WordPress dependencies
 */
import { useInnerBlocksProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './editor.scss';

export default function Edit() {
	const innerBlocksProps = useInnerBlocksProps(
		{
			className: 'directorist-gutenberg-single-listing-template__inner',
		},
		{
			template: [
				[ 'directorist-gutenberg/listing-card-thumbnail', {} ],
				[ 'directorist-gutenberg/listing-card-title', {} ],
				[ 'directorist-gutenberg/listing-card-location', {} ],
			],
			templateLock: false,
		}
	);

	return (
		<div className="directorist-gutenberg-single-listing-template-editor">
			<p className="directorist-gutenberg-single-listing-template-editor__notice">
				{ __(
					'Compose single listing output using preset or custom listing field blocks.',
					'directorist-gutenberg'
				) }
			</p>
			<div { ...innerBlocksProps } />
		</div>
	);
}
