/**
 * WordPress dependencies
 */
import { useInnerBlocksProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { getLocalizedBlockDataByKey } from '@directorist-gutenberg/utils/localized-data';

/**
 * Internal dependencies
 */
import './editor.scss';

export default function Edit( { attributes, setAttributes } ) {
	const localizedDirectoryTypeId = parseInt(
		getLocalizedBlockDataByKey( 'directory_type_id', 0 ),
		10
	);

	useEffect( () => {
		if ( attributes.context_mode !== 'manual' ) {
			return;
		}

		if ( attributes.directory_type_id ) {
			return;
		}

		if ( ! localizedDirectoryTypeId ) {
			return;
		}

		setAttributes( {
			directory_type_id: localizedDirectoryTypeId,
		} );
	}, [
		attributes.context_mode,
		attributes.directory_type_id,
		localizedDirectoryTypeId,
		setAttributes,
	] );

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
