/**
 * Internal dependencies
 */
import registerBlock from '@directorist-gutenberg/gutenberg/register-block';
import './style.scss';
import Edit from './edit';
import metadata from './block.json';
import archiveHeaderIcon from '@block-icon/archive-header.svg';

/**
 * WordPress dependencies
 */
import { InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

/**
 * External dependencies
 */
import ReactSVG from 'react-inlinesvg';

/**
 * Internal dependencies
 */
import ShadowControl from '@directorist-gutenberg/gutenberg/components/controls/shadow-control';

// View Type mappings
const VIEW_TYPE_MAP = {
	grid: __( 'Grid', 'directorist-gutenberg' ),
	list: __( 'List', 'directorist-gutenberg' ),
	map: __( 'Map', 'directorist-gutenberg' ),
};

const VIEW_TYPE_VALUES = Object.keys( VIEW_TYPE_MAP );
const VIEW_TYPE_SUGGESTIONS = Object.values( VIEW_TYPE_MAP );

// Sort By mappings
const SORT_BY_MAP = {
	a_z: __( 'A to Z (title)', 'directorist-gutenberg' ),
	z_a: __( 'Z to A (title)', 'directorist-gutenberg' ),
	latest: __( 'Latest Listings', 'directorist-gutenberg' ),
	oldest: __( 'Oldest Listings', 'directorist-gutenberg' ),
	popular: __( 'Popular Listings', 'directorist-gutenberg' ),
	price_low_high: __( 'Price: Low to High', 'directorist-gutenberg' ),
	price_high_low: __( 'Price: High to Low', 'directorist-gutenberg' ),
	random: __( 'Random Listings', 'directorist-gutenberg' ),
};

const SORT_BY_VALUES = Object.keys( SORT_BY_MAP );
const SORT_BY_SUGGESTIONS = Object.values( SORT_BY_MAP );

// Define fields for this block
const fields = {
	useArchiveBlockCommonTask: true, // Enable the hook
	handleTemplateId: true, // Handle template_id from post ID
	headerSettings: {
		title: __( 'Listings Header Settings', 'directorist-gutenberg' ),
		initialOpen: true,
		fields: {
			show_listings_count: {
				type: 'toggle',
				label: __( 'Show Listings Count', 'directorist-gutenberg' ),
				attrKey: 'show_listings_count',
				onChange: ( checked, setAttributes ) => {
					setAttributes( { show_listings_count: checked ? 1 : 0 } );
				},
			},
			listings_count_text: {
				type: 'text',
				label: __( 'Listings Count Text', 'directorist-gutenberg' ),
				attrKey: 'listings_count_text',
			},
			view_type: {
				type: 'formTokenField',
				label: __( 'View Type', 'directorist-gutenberg' ),
				attrKey: 'view_type',
				valueToLabelMap: VIEW_TYPE_MAP,
				validValues: VIEW_TYPE_VALUES,
				suggestions: VIEW_TYPE_SUGGESTIONS,
			},
			enable_sorting: {
				type: 'toggle',
				label: __( 'Enable Sorting', 'directorist-gutenberg' ),
				attrKey: 'enable_sorting',
				onChange: ( checked, setAttributes ) => {
					setAttributes( { enable_sorting: checked ? 1 : 0 } );
				},
			},
			sort_by_label: {
				type: 'text',
				label: __( 'Sort By Label', 'directorist-gutenberg' ),
				attrKey: 'sort_by_label',
			},
			sort_by: {
				type: 'formTokenField',
				label: __( 'Sort By', 'directorist-gutenberg' ),
				attrKey: 'sort_by',
				valueToLabelMap: SORT_BY_MAP,
				validValues: SORT_BY_VALUES,
				suggestions: SORT_BY_SUGGESTIONS,
			},
		},
	},
};

// StylesControls component for shadow control
const StylesControls = ( { attributes, setAttributes } ) => {
	return (
		<InspectorControls group="styles">
			<ShadowControl
				attributes={ attributes }
				setAttributes={ setAttributes }
				attrName="drop_shadow"
				label={ __( 'Drop Shadow', 'directorist-gutenberg' ) }
				initialOpen={ false }
			/>
		</InspectorControls>
	);
};

registerBlock( {
	metadata,
	Edit,
	fields,
	StylesControls,
	templateTypes: [ 'listings-archive' ],
	showWidthControls: false,
	icon: <ReactSVG src={ archiveHeaderIcon } />,
} );
