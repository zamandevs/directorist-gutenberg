/**
 * WordPress dependencies
 */
import { useBlockProps } from "@wordpress/block-editor";
import { useEffect } from "@wordpress/element";
import clsx from "clsx";

/**
 * Internal dependencies
 */
import Controls from "./components/controls";
import BlockServerRender from "./components/block-server-render";
import useResolvedDirectoryTypeId from "./hooks/useResolvedDirectoryTypeId";
import { getResponsiveTextAlignClassNames } from "./text-align-utils";
import { getResponsiveWidthClassNames } from "./width-utils";

/**
 * Set custom class names to the block
 *
 * @param {string|string[]|undefined} classNames - Class names as string, array, or undefined
 * @returns {string} Custom class names string
 */

const setCustomClassNames = (classNames) => {
  if (!classNames) {
    return "";
  }
  return Array.isArray(classNames)
    ? classNames.filter(Boolean).join(" ")
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
export default function Block({
  Edit,
  attributes,
  setAttributes,
  Controls: ControlsComponent, // Can be a component or fields definition
  fields, // Fields definition object (alternative to Controls)
  StylesControls,
  classNames = "",
  name,
  clientId,
  ...rest
}) {
  // Determine which Controls to use: fields definition or Controls component
  // Priority: fields > ControlsComponent
  const controlsToUse = fields || ControlsComponent;
  const customClasses = setCustomClassNames(classNames);
  const responsiveTextAlignClasses =
    getResponsiveTextAlignClassNames(attributes);
  const responsiveWidthClasses = getResponsiveWidthClassNames(attributes);

  const isListingCardFieldBlock =
    name?.startsWith("directorist-gutenberg/listing-card-") &&
    name !== "directorist-gutenberg/listing-card-template" &&
    name !== "directorist-gutenberg/listing-card-thumbnail";
  const resolvedDirectoryTypeId = useResolvedDirectoryTypeId(clientId);
  const shouldUseServerRenderedFieldPreview =
    isListingCardFieldBlock && !attributes?.is_preview;

  useEffect(() => {
    if (
      !shouldUseServerRenderedFieldPreview ||
      !resolvedDirectoryTypeId ||
      attributes?.directory_type_id === undefined
    ) {
      return;
    }

    const currentDirectoryTypeId =
      parseInt(attributes.directory_type_id, 10) || 0;
    if (currentDirectoryTypeId === resolvedDirectoryTypeId) {
      return;
    }

    setAttributes({ directory_type_id: resolvedDirectoryTypeId });
  }, [
    attributes?.directory_type_id,
    resolvedDirectoryTypeId,
    setAttributes,
    shouldUseServerRenderedFieldPreview,
  ]);

  // For thumbnail block, don't use useBlockProps on outer wrapper (Edit component handles it)
  const isThumbnailBlock =
    name === "directorist-gutenberg/listing-card-thumbnail";

  if (isThumbnailBlock) {
    return (
      <div
        className={`directorist-gutenberg-listing-card-block ${customClasses} ${responsiveWidthClasses}`}
      >
        {controlsToUse && (
          <Controls
            fields={controlsToUse}
            attributes={attributes}
            setAttributes={setAttributes}
            clientId={clientId}
          />
        )}
        {StylesControls && (
          <StylesControls
            attributes={attributes}
            setAttributes={setAttributes}
          />
        )}
        <Edit
          attributes={attributes}
          setAttributes={setAttributes}
          name={name}
          clientId={clientId}
          {...rest}
        />
      </div>
    );
  }

  // Apply drop shadow to parent for listings-archive-header block
  const isArchiveHeaderBlock =
    name === "directorist-gutenberg/listings-archive-header";
  const shadowStyle =
    isArchiveHeaderBlock && attributes.drop_shadow
      ? { boxShadow: attributes.drop_shadow }
      : {};

  const blockProps = useBlockProps({
    className: clsx(
      "directorist-gutenberg-listing-card-block",
      customClasses,
      responsiveTextAlignClasses,
      responsiveWidthClasses,
    ),
    style: shadowStyle,
  });

  return (
    <div {...blockProps}>
      {controlsToUse && (
        <Controls
          fields={controlsToUse}
          attributes={attributes}
          setAttributes={setAttributes}
          clientId={clientId}
        />
      )}
      {StylesControls && (
        <StylesControls attributes={attributes} setAttributes={setAttributes} />
      )}
      {shouldUseServerRenderedFieldPreview ? (
        <>
          <div style={{ display: "none" }}>
            <Edit
              attributes={attributes}
              setAttributes={setAttributes}
              name={name}
              clientId={clientId}
              {...rest}
            />
          </div>
          <BlockServerRender
            block={name}
            attributes={attributes}
            urlQueryArgs={
              resolvedDirectoryTypeId
                ? { directory_type: resolvedDirectoryTypeId }
                : {}
            }
          />
        </>
      ) : (
        <Edit
          attributes={attributes}
          setAttributes={setAttributes}
          name={name}
          clientId={clientId}
          {...rest}
        />
      )}
    </div>
  );
}
