/**
 * WordPress dependencies
 */
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import renderField from './render-field';
import CustomFieldSelect from './custom-field-select';
import useArchiveBlockCommonTask from '@directorist-gutenberg/gutenberg/hooks/useArchiveBlockCommonTask';
import TemplateIdHandler from './template-id-handler';

/**
 * Controls component that renders fields from a definition object
 * Similar to formgent's approach but simpler and tailored for directorist-gutenberg
 *
 * @param {Object} props - Component props
 * @param {Object} props.fields - Fields definition object
 * @param {Object} props.attributes - Block attributes
 * @param {Function} props.setAttributes - Function to set block attributes
 * @param {string} props.clientId - Current block client id
 */
export default function Controls( { fields, attributes, setAttributes, clientId } ) {
	// Call useArchiveBlockCommonTask hook if useHook is true in fields
	if ( fields && typeof fields === 'object' && fields.useArchiveBlockCommonTask ) {
		useArchiveBlockCommonTask( { setAttributes } );
	}

	// Handle template_id if needed
	const needsTemplateId = fields && typeof fields === 'object' && fields.handleTemplateId;

	if ( ! fields || isEmpty( fields ) ) {
		return null;
	}

	// If fields is already a React component (backward compatibility)
	if ( typeof fields === 'function' ) {
		return <fields attributes={ attributes } setAttributes={ setAttributes } />;
	}

	// Render fields from definition object
	// Filter out special flags that are not panels
	const specialFlags = [ 'useArchiveBlockCommonTask', 'handleTemplateId' ];
	const panelKeys = Object.keys( fields ).filter( ( key ) => ! specialFlags.includes( key ) );

	// If no actual panels exist, return null (only hooks/flags)
	if ( panelKeys.length === 0 ) {
		return (
			<InspectorControls>
				{ needsTemplateId && <TemplateIdHandler setAttributes={ setAttributes } /> }
			</InspectorControls>
		);
	}

	const panels = panelKeys.map( ( panelKey ) => {
		const panel = fields[ panelKey ];

		// Support both panel structure and direct fields
		const panelFields = panel.fields || panel;
		const panelTitle = panel.title || panel.label || __( 'Settings', 'directorist-gutenberg' );
		const initialOpen = panel.initialOpen !== undefined ? panel.initialOpen : true;

		// Get field keys and filter out null/undefined fields
		const fieldKeys = Object.keys( panelFields );
		const renderedFields = fieldKeys.map( ( fieldKey ) => {
			const field = panelFields[ fieldKey ];

			// Skip field if condition is false
			if ( field.condition && ! field.condition( attributes ) ) {
				return null;
			}

			// Handle custom field select with hooks
			if ( field.type === 'customFieldSelect' && field.fieldType ) {
				return (
					<div key={ fieldKey }>
						<CustomFieldSelect
							fieldKey={ fieldKey }
							field={ field }
							attributes={ attributes }
							setAttributes={ setAttributes }
							clientId={ clientId }
						/>
					</div>
				);
			}

			return (
				<div key={ fieldKey }>
					{ renderField( fieldKey, field, attributes, setAttributes ) }
				</div>
			);
		} ).filter( Boolean ); // Remove null entries

		// Don't render panel if no fields are rendered
		if ( renderedFields.length === 0 ) {
			return null;
		}

		return (
			<PanelBody
				key={ panelKey }
				title={ panelTitle }
				initialOpen={ initialOpen }
			>
				{ renderedFields }
			</PanelBody>
		);
	} ).filter( Boolean ); // Remove null entries

	return (
		<InspectorControls>
			{ needsTemplateId && <TemplateIdHandler setAttributes={ setAttributes } /> }
			{ panels }
		</InspectorControls>
	);
}
