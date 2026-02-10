/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';
import clsx from 'clsx';

/**
 * Internal dependencies
 */
import Controls from './components/controls';

/**
 * Set custom class names to the block
 *
 * @param {string|string[]|undefined} classNames - Class names as string, array, or undefined
 * @returns {string} Custom class names string
 */

const setCustomClassNames = ( classNames ) => {
	if ( ! classNames ) {
		return '';
	}
	return Array.isArray( classNames )
		? classNames.filter( Boolean ).join( ' ' )
		: classNames;
};

/**
 * Block wrapper component that centralizes useBlockProps
 *
 * @param {Object} props - Component props
 * @param {Function} props.Edit - The Edit component to wrap
 * @param {Object} props.attributes - Block attributes
 * @param {Function} props.setAttributes - Function to set block attributes
 * @param {string|string[]} props.classNames - Additional custom class names to add
 * @param {string} props.name - Block name
 * @param {Object} props.rest - Additional props to pass to Edit component
 */
export default function Block( {
	Edit,
	attributes,
	setAttributes,
	Controls: ControlsComponent, // Can be a component or fields definition
	fields, // Fields definition object (alternative to Controls)
	StylesControls,
	classNames = '',
	name,
	clientId,
	...rest
} ) {
	// Determine which Controls to use: fields definition or Controls component
	// Priority: fields > ControlsComponent
	const controlsToUse = fields || ControlsComponent;
	const customClasses = setCustomClassNames( classNames );

	// For thumbnail block, don't use useBlockProps on outer wrapper (Edit component handles it)
	const isThumbnailBlock =
		name === 'directorist-gutenberg/listing-card-thumbnail';

	if ( isThumbnailBlock ) {
		return (
			<div
				className={ `directorist-gutenberg-listing-card-block ${ customClasses } directorist-gutenberg-block-width-${ Math.trunc(
					attributes.block_width
				) }` }
			>
				{ controlsToUse && (
					<Controls
						fields={ controlsToUse }
						attributes={ attributes }
						setAttributes={ setAttributes }
						clientId={ clientId }
					/>
				) }
				{ StylesControls && (
					<StylesControls
						attributes={ attributes }
						setAttributes={ setAttributes }
					/>
				) }
				<Edit
					attributes={ attributes }
					setAttributes={ setAttributes }
					name={ name }
					clientId={ clientId }
					{ ...rest }
				/>
			</div>
		);
	}

	// Block props with textAlign support
	const { textAlign } = attributes || {};

	// Apply drop shadow to parent for listings-archive-header block
	const isArchiveHeaderBlock =
		name === 'directorist-gutenberg/listings-archive-header';
	const shadowStyle =
		isArchiveHeaderBlock && attributes.drop_shadow
			? { boxShadow: attributes.drop_shadow }
			: {};

	const blockProps = useBlockProps( {
		className: clsx(
			'directorist-gutenberg-listing-card-block',
			customClasses,
			`directorist-gutenberg-block-width-${ Math.trunc(
				attributes.block_width || 100
			) }`,
			{
				[ `has-text-align-${ textAlign }` ]: textAlign,
			}
		),
		style: shadowStyle,
	} );

	return (
		<div { ...blockProps }>
			{ controlsToUse && (
				<Controls
					fields={ controlsToUse }
					attributes={ attributes }
					setAttributes={ setAttributes }
					clientId={ clientId }
				/>
			) }
			{ StylesControls && (
				<StylesControls
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			) }
			<Edit
				attributes={ attributes }
				setAttributes={ setAttributes }
				name={ name }
				clientId={ clientId }
				{ ...rest }
			/>
		</div>
	);
}
