/**
 * WordPress dependencies
 */
import { SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { useSubmissionFields } from '@directorist-gutenberg/gutenberg/hooks/useSubmissionFields';
import useResolvedDirectoryTypeId from '@directorist-gutenberg/gutenberg/hooks/useResolvedDirectoryTypeId';

/**
 * Custom Field Select Component
 * Handles SelectControl for custom fields that require hooks
 *
 * @param {Object} props - Component props
 * @param {string} props.fieldKey - Field key
 * @param {Object} props.field - Field configuration
 * @param {Object} props.attributes - Block attributes
 * @param {Function} props.setAttributes - Function to set block attributes
 * @param {string} props.clientId - Current block client id
 */
export default function CustomFieldSelect( {
	fieldKey,
	field,
	attributes,
	setAttributes,
	clientId,
} ) {
	const resolvedDirectoryTypeId = useResolvedDirectoryTypeId( clientId );
	const { getFieldsOptions, directoryTypeId } = useSubmissionFields( {
		directoryTypeId: resolvedDirectoryTypeId,
	} );
	const { label, attrKey, fieldType, useDirectoryType } = field;

	const attributeKey = attrKey || fieldKey;
	const value = attributes[ attributeKey ] || '';

	// Get options based on field type
	const options = getFieldsOptions( 'custom', fieldType );

	// Handle directory_type_id update if needed
	useEffect( () => {
		const currentDirectoryTypeId = parseInt( attributes.directory_type_id, 10 ) || 0;
		if (
			useDirectoryType &&
			directoryTypeId &&
			currentDirectoryTypeId !== directoryTypeId
		) {
			setAttributes( { directory_type_id: directoryTypeId } );
		}
	}, [ attributes.directory_type_id, directoryTypeId, useDirectoryType, setAttributes ] );

	const onChange = ( newValue ) => {
		setAttributes( { [ attributeKey ]: newValue } );
	};

	return (
		<>
			{ field.spacer !== false && <div style={ { height: '16px' } }></div> }
			<SelectControl
				label={ label || __( 'Select Field', 'directorist-gutenberg' ) }
				value={ value }
				onChange={ onChange }
				options={ options }
			/>
		</>
	);
}
