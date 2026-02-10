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

const mergeUniqueArrayValues = ( first = [], second = [] ) => {
	return Array.from( new Set( [ ...first, ...second ].filter( Boolean ) ) );
};

const getDynamicCompositionConstraints = ( blockName, templateContext ) => {
	const surface = templateContext?.surface || '';
	const isContextualSiteTemplate = surface === 'site_template';

	if ( isContextualSiteTemplate ) {
		return {};
	}

	const loopParentBlocks = [ 'directorist-gutenberg/listings-loop' ];
	const constraints = {};

	const loopUtilityBlocks = [
		'directorist-gutenberg/listings-header',
		'directorist-gutenberg/listings-search',
		'directorist-gutenberg/listings-filters',
		'directorist-gutenberg/listings-archive-header',
		'directorist-gutenberg/listings-archive-search',
		'directorist-gutenberg/listings-archive-filters',
	];

	if ( loopUtilityBlocks.includes( blockName ) ) {
		constraints.parent = loopParentBlocks;
	}

	if ( blockName === 'directorist-gutenberg/listing-card-template' ) {
		constraints.parent = loopParentBlocks;
	}

	const isListingCardFieldBlock =
		blockName.startsWith( 'directorist-gutenberg/listing-card-' ) &&
		blockName !== 'directorist-gutenberg/listing-card-template';

	if ( isListingCardFieldBlock ) {
		constraints.ancestor = [
			'directorist-gutenberg/listing-card-template',
			'directorist-gutenberg/single-listing-template',
		];
	}

	return constraints;
};

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
	const templateContext = getLocalizedBlockDataByKey(
		'template_context',
		{}
	);
	const isContextualSiteTemplate =
		templateContext?.surface === 'site_template';

	if (
		! isContextualSiteTemplate &&
		Array.isArray( templateTypes ) &&
		templateTypes.length > 0
	) {
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

	const dynamicConstraints = getDynamicCompositionConstraints(
		metadata.name,
		templateContext
	);

	const resolvedProps = {
		...props,
		...dynamicConstraints,
	};

	if ( props.parent || dynamicConstraints.parent ) {
		resolvedProps.parent = mergeUniqueArrayValues(
			props.parent || [],
			dynamicConstraints.parent || []
		);
	}

	if ( props.ancestor || dynamicConstraints.ancestor ) {
		resolvedProps.ancestor = mergeUniqueArrayValues(
			props.ancestor || [],
			dynamicConstraints.ancestor || []
		);
	}

	registerBlockType( metadata.name, {
		icon,
		example: {
			attributes: exampleAttributes,
		},
		edit: WrappedEdit,
		...resolvedProps,
	} );
}
