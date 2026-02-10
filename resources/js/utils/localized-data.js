// Generic helper function to get data by key from any window object
const getDataByKey = ( data, key, defaultValue = null ) => {
	return data[ key ] !== undefined ? data[ key ] : defaultValue;
};

const normalizeDirectoryTypeId = ( value ) => {
	const parsed = parseInt( value, 10 );
	return Number.isNaN( parsed ) || parsed <= 0 ? 0 : parsed;
};

const resolveFieldsPayload = ( payload ) => {
	if ( ! payload || typeof payload !== 'object' ) {
		return {};
	}

	if ( payload.fields && typeof payload.fields === 'object' ) {
		return payload.fields;
	}

	return payload;
};

// Gutenberg Block Editor Data
export const getLocalizedBlockData = () => {
	return window.directorist_gutenberg_block_data || {};
};

export const getLocalizedBlockDataByKey = ( key, defaultValue = null ) => {
	const data = getLocalizedBlockData();
	return getDataByKey( data, key, defaultValue );
};

export const getSubmissionFormFields = () => {
	const data = getLocalizedBlockData();
	return resolveFieldsPayload( data?.submission_form_fields );
};

export const getSubmissionFormFieldsByDirectory = ( directoryTypeId ) => {
	const normalizedDirectoryTypeId =
		normalizeDirectoryTypeId( directoryTypeId );
	if ( ! normalizedDirectoryTypeId ) {
		return {};
	}

	const data = getLocalizedBlockData();
	const fieldsByDirectory = data?.submission_form_fields_by_directory;
	if ( ! fieldsByDirectory || typeof fieldsByDirectory !== 'object' ) {
		return {};
	}

	const directoryFields =
		fieldsByDirectory[ normalizedDirectoryTypeId ] ||
		fieldsByDirectory[ String( normalizedDirectoryTypeId ) ];

	return resolveFieldsPayload( directoryFields );
};

// Admin Page Data
export const getLocalizedAdminData = () => {
	return window.directorist_gutenberg_data || {};
};

export const getLocalizedAdminDataByKey = ( key, defaultValue = null ) => {
	const data = getLocalizedAdminData();
	return getDataByKey( data, key, defaultValue );
};

export const getDirectories = () => {
	const data = getLocalizedAdminData();
	return getDataByKey( data, 'directories', [] );
};

export default {
	getLocalizedBlockData,
	getLocalizedBlockDataByKey,
	getSubmissionFormFields,
	getSubmissionFormFieldsByDirectory,
	getLocalizedAdminData,
	getLocalizedAdminDataByKey,
	getDirectories,
};
