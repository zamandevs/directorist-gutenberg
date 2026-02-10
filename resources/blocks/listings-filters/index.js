/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import registerBlock from '@directorist-gutenberg/gutenberg/register-block';
import './style.scss';
import Edit from './edit';
import metadata from './block.json';
import archiveFiltersIcon from '@block-icon/archive-filter.svg';

/**
 * External dependencies
 */
import ReactSVG from 'react-inlinesvg';

// Define fields for this block
const fields = {
	useArchiveBlockCommonTask: true, // Enable the hook
	filtersSettings: {
		title: __( 'Listings Filters Settings', 'directorist-gutenberg' ),
		initialOpen: true,
		fields: {
			filters_text: {
				type: 'debouncedText',
				label: __( 'Filters Text', 'directorist-gutenberg' ),
				attrKey: 'filters_text',
				debounceMs: 500,
			},
			reset_text: {
				type: 'debouncedText',
				label: __( 'Reset Text', 'directorist-gutenberg' ),
				attrKey: 'reset_text',
				debounceMs: 500,
			},
		},
	},
};

registerBlock( {
	metadata,
	Edit,
	fields,
	templateTypes: [ 'listings-archive' ],
	showWidthControls: false,
	icon: <ReactSVG src={ archiveFiltersIcon } />,
} );
