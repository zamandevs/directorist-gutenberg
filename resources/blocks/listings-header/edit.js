/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './editor.scss';
import { getLocalizedBlockDataByKey } from '@directorist-gutenberg/utils/localized-data';
import useBlocksPreview from '@directorist-gutenberg/gutenberg/hooks/useBlocksPreview';
import BlockPreview from '@directorist-gutenberg/gutenberg/components/block-preview';
import previewImg from '@image/blocks-preview/archive-header.png';
import Skeleton from '@directorist-gutenberg/gutenberg/components/skeleton';

export default function Edit( { attributes, setAttributes } ) {
	// Show block preview image
	if ( attributes.is_preview ) {
		return <BlockPreview image={ previewImg } />;
	}

	const directoryId = getLocalizedBlockDataByKey( 'directory_type_id', 0 );
	const { template, isLoading, refreshTemplate } = useBlocksPreview( {
		directoryId,
		blockType: 'listings-archive/header',
		blockAttributes: attributes,
	} );

	useEffect( () => {
		refreshTemplate( attributes );
	}, [
		attributes.show_listings_count,
		attributes.listings_count_text,
		attributes.view_type,
		attributes.enable_sorting,
		attributes.sort_by_label,
	] );

	if ( isLoading ) {
		return (
			<div style={ { pointerEvents: 'none', padding: '20px' } }>
				<Skeleton variant="card" count={ 3 } width="100%" />
			</div>
		);
	}

	return (
		<div
			style={ {
				pointerEvents: 'none',
			} }
			dangerouslySetInnerHTML={ { __html: template } }
		/>
	);
}
