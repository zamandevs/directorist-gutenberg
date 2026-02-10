/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';

/**
 * External dependencies
 */
import ReactSVG from 'react-inlinesvg';

/**
 * Internal dependencies
 */
import directoristLogo from '@block-icon/directorist-logo.svg';
import Block from './block';
import { getLocalizedBlockDataByKey } from '@directorist-gutenberg/utils/localized-data';
import WidthControls from './width-control';
export default function registerBlock( {
	metadata,
	Edit,
	Controls: ControlsComponent, // Can be a component or fields definition
	fields, // Fields definition object (alternative to Controls)
	StylesControls,
	icon = '',
	exampleAttributes = {},
	props = {},
	templateTypes = false,
	classNames = '',
	showWidthControls = true,
} ) {
	if ( Array.isArray( templateTypes ) && templateTypes.length > 0 ) {
		const templateContext = getLocalizedBlockDataByKey(
			'template_context',
			{}
		);
		const localizedTemplateType =
			getLocalizedBlockDataByKey( 'template_type', '' ) || '';
		let effectiveTemplateType = localizedTemplateType;

		if ( ! effectiveTemplateType ) {
			if ( templateContext?.template_kind === 'archive' ) {
				effectiveTemplateType = 'listings-archive';
			} else if ( templateContext?.template_kind === 'single' ) {
				effectiveTemplateType = 'single-listing';
			}
		}

		// Only gate registration when we can infer a template type.
		if (
			effectiveTemplateType &&
			! templateTypes.includes( effectiveTemplateType )
		) {
			return;
		}
	}

	if ( ! icon ) {
		// Ensure directoristLogo is a valid URL string for ReactSVG
		// webpack asset/resource returns a URL string, but sometimes it's wrapped
		const logoUrl =
			typeof directoristLogo === 'string'
				? directoristLogo
				: directoristLogo?.default || directoristLogo;

		if ( logoUrl ) {
			icon = <ReactSVG src={ logoUrl } />;
		} else {
			// Fallback to a dashicon if SVG fails to load
			icon = 'star-filled';
		}
	}

	// Determine which Controls to use: fields definition or Controls component
	// Priority: fields > ControlsComponent
	const controlsToUse = fields || ControlsComponent;

	// Wrap Edit component with Block wrapper that handles useBlockProps
	const WrappedEdit = ( editProps ) => (
		<>
			{ showWidthControls && (
				<WidthControls
					attributes={ editProps.attributes }
					setAttributes={ editProps.setAttributes }
				/>
			) }
			<Block
				Edit={ Edit }
				Controls={ controlsToUse }
				fields={ fields }
				StylesControls={ StylesControls }
				classNames={ classNames }
				{ ...editProps }
			/>
		</>
	);

	registerBlockType( metadata.name, {
		icon,
		example: {
			attributes: exampleAttributes,
		},
		edit: WrappedEdit,
		...props,
	} );
}
