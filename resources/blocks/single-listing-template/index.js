/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { getLocalizedBlockDataByKey } from '@directorist-gutenberg/utils/localized-data';

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
			directory_type_id: {
				type: 'select',
				label: __( 'Directory Type', 'directorist-gutenberg' ),
				attrKey: 'directory_type_id',
				options: () =>
					getLocalizedBlockDataByKey( 'directory_options', [
						{
							label: __(
								'Select Directory Type',
								'directorist-gutenberg'
							),
							value: 0,
						},
					] ),
				parseAsInt: true,
				condition: ( currentAttributes ) =>
					currentAttributes.context_mode === 'manual',
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
