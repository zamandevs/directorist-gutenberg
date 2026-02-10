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
import titleIcon from '@block-icon/title.svg';

/**
 * External dependencies
 */
import ReactSVG from 'react-inlinesvg';

const fields = {
	cardTemplateSettings: {
		title: __( 'Listing Card Template Settings', 'directorist-gutenberg' ),
		initialOpen: true,
		fields: {
			view: {
				type: 'select',
				label: __( 'View', 'directorist-gutenberg' ),
				attrKey: 'view',
				options: [
					{
						label: __( 'Grid', 'directorist-gutenberg' ),
						value: 'grid',
					},
					{
						label: __( 'List', 'directorist-gutenberg' ),
						value: 'list',
					},
				],
			},
		},
	},
};

registerBlock( {
	metadata,
	Edit,
	fields,
	showWidthControls: false,
	icon: <ReactSVG src={ titleIcon } />,
} );
