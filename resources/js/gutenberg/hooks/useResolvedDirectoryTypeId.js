/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { getLocalizedBlockDataByKey } from '@directorist-gutenberg/utils/localized-data';

const DIRECTORY_CONTEXT_BLOCKS = [
	'directorist-gutenberg/listings-loop',
	'directorist-gutenberg/listings-archive',
	'directorist-gutenberg/single-listing-template',
];

const normalizeDirectoryTypeId = ( value ) => {
	const parsed = parseInt( value, 10 );
	return Number.isNaN( parsed ) || parsed <= 0 ? 0 : parsed;
};

export default function useResolvedDirectoryTypeId( clientId ) {
	const localizedDirectoryTypeId = normalizeDirectoryTypeId(
		getLocalizedBlockDataByKey( 'directory_type_id', 0 )
	);

	return useSelect(
		( select ) => {
			if ( ! clientId ) {
				return localizedDirectoryTypeId;
			}

			const blockEditorStore = select( 'core/block-editor' );
			if ( ! blockEditorStore ) {
				return localizedDirectoryTypeId;
			}

			const ancestorIds = blockEditorStore.getBlockParents( clientId );
			const candidateIds = [ clientId, ...ancestorIds ];

			for ( const candidateId of candidateIds ) {
				const block = blockEditorStore.getBlock( candidateId );
				if (
					! block ||
					! DIRECTORY_CONTEXT_BLOCKS.includes( block.name )
				) {
					continue;
				}

				const directoryTypeId = normalizeDirectoryTypeId(
					block.attributes?.directory_type_id
				);

				if ( directoryTypeId > 0 ) {
					return directoryTypeId;
				}
			}

			return localizedDirectoryTypeId;
		},
		[ clientId, localizedDirectoryTypeId ]
	);
}
