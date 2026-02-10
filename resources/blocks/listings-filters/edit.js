/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './editor.scss';
import { getLocalizedBlockDataByKey } from '@directorist-gutenberg/utils/localized-data';
import useBlocksPreview from '@directorist-gutenberg/gutenberg/hooks/useBlocksPreview';
import BlockPreview from '@directorist-gutenberg/gutenberg/components/block-preview';
import previewImg from '@image/blocks-preview/archive-filters.png';
import Skeleton from '@directorist-gutenberg/gutenberg/components/skeleton';

export default function Edit( { attributes, setAttributes } ) {
	// Show block preview image
	if ( attributes.is_preview ) {
		return <BlockPreview image={ previewImg } />;
	}

	const directoryId = getLocalizedBlockDataByKey( 'directory_type_id', 0 );
	const { template, isLoading, refreshTemplate } = useBlocksPreview( {
		directoryId,
		blockType: 'listings-archive/filter',
		blockAttributes: attributes,
	} );

	const containerRef = useRef( null );

	// Refresh template when filters_text or reset_text changes
	useEffect( () => {
		refreshTemplate( attributes );
	}, [ attributes.filters_text, attributes.reset_text ] );

	// Add class to the element after template is loaded and DOM is updated
	useEffect( () => {
		if ( isLoading || ! template || ! containerRef.current ) {
			return;
		}

		// Wait for DOM to update after dangerouslySetInnerHTML
		const timeoutId = setTimeout( () => {
			const searchWrapper = containerRef.current?.querySelector(
				'.directorist-gutenberg-listings-archive-filter'
			);
			if ( searchWrapper ) {
				searchWrapper.classList.add(
					'directorist-gutenberg-listings-archive-filters'
				);
			}
		}, 0 );

		return () => clearTimeout( timeoutId );
	}, [ template, isLoading ] );

	if ( isLoading ) {
		return (
			<div style={ { pointerEvents: 'none', padding: '20px' } }>
				<Skeleton variant="card" count={ 3 } width="100%" />
			</div>
		);
	}

	return (
		<div
			ref={ containerRef }
			style={ { pointerEvents: 'none' } }
			dangerouslySetInnerHTML={ { __html: template } }
		/>
	);
}
