/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import {
	getLocalizedBlockData,
	getSubmissionFormFields,
	getSubmissionFormFieldsByDirectory,
} from '@directorist-gutenberg/utils/localized-data';

const normalizeDirectoryTypeId = ( value ) => {
	const parsed = parseInt( value, 10 );
	return Number.isNaN( parsed ) || parsed <= 0 ? 0 : parsed;
};

export const useSubmissionFields = ( options = {} ) => {
	const localizedData = getLocalizedBlockData();
	const localizedDirectoryTypeId = normalizeDirectoryTypeId(
		localizedData.directory_type_id
	);
	const preferredDirectoryTypeId = normalizeDirectoryTypeId(
		options.directoryTypeId
	);
	const directoryTypeId =
		preferredDirectoryTypeId || localizedDirectoryTypeId;

	const scopedFields = getSubmissionFormFieldsByDirectory( directoryTypeId );
	const fallbackFields = getSubmissionFormFields();
	const fields =
		scopedFields && Object.keys( scopedFields ).length
			? scopedFields
			: fallbackFields;

	function getFieldsOptions( type, name ) {
		const fieldOptions = [
			{
				value: '',
				label: __( 'Select…', 'directorist-gutenberg' ),
			},
		];

		for ( const field of Object.values( fields ) ) {
			if ( field.widget_group === type && field.widget_name === name ) {
				fieldOptions.push( {
					value: field.field_key,
					label: field.label,
				} );
			}
		}

		return fieldOptions;
	}

	function doesPresetFieldExist( name ) {
		const field = getField( 'preset', name );

		return field !== null;
	}

	function doesCustomFieldExist( name, fieldKey ) {
		const field = getField( 'custom', name, fieldKey );

		return field !== null;
	}

	function getCustomFields() {
		const customFields = [];

		for ( const field of Object.values( fields ) ) {
			if ( field.widget_group === 'custom' ) {
				customFields.push( field );
			}
		}

		return customFields;
	}

	function getField( type, name, fieldKey ) {
		for ( const field of Object.values( fields ) ) {
			if (
				field.widget_group === type &&
				field.widget_name === name &&
				( fieldKey === undefined || field.field_key === fieldKey )
			) {
				return field;
			}
		}

		return null;
	}

	return {
		directoryTypeId: directoryTypeId || null,
		fields,
		getField,
		getCustomFields,
		doesPresetFieldExist,
		doesCustomFieldExist,
		getFieldsOptions,
	};
};
