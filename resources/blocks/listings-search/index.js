/**
 * Internal dependencies
 */
import registerBlock from '@directorist-gutenberg/gutenberg/register-block';
import './style.scss';
import Edit from './edit';
import metadata from './block.json';
import archiveSearchIcon from '@block-icon/archive-search.svg';

/**
 * External dependencies
 */
import ReactSVG from 'react-inlinesvg';

// Define fields for this block
// This block only uses useArchiveBlockCommonTask hook, no visible controls
const fields = {
	useArchiveBlockCommonTask: true, // Enable the hook
};

registerBlock( {
	metadata,
	Edit,
	fields,
	templateTypes: [ 'listings-archive' ],
	showWidthControls: false,
	icon: <ReactSVG src={ archiveSearchIcon } />,
} );
