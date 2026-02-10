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
import archiveIcon from '@block-icon/archive.svg';

/**
 * External dependencies
 */
import ReactSVG from 'react-inlinesvg';

const fields = {
	singleTemplateSettings: {
		title: __(
			'Single Listing Template Settings',
			'directorist-gutenberg'
		),
		initialOpen: true,
		fields: {
			context_mode: {
				type: 'select',
				label: __( 'Context Mode', 'directorist-gutenberg' ),
				attrKey: 'context_mode',
				options: [
					{
						label: __( 'Inferred', 'directorist-gutenberg' ),
						value: 'inferred',
					},
					{
						label: __( 'Manual', 'directorist-gutenberg' ),
						value: 'manual',
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
	icon: <ReactSVG src={ archiveIcon } />,
} );
