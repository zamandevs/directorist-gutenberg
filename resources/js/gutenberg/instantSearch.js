import debounce from '@utils/debounce';
import initSearchCategoryCustomFields from '@utils/category-custom-fields';

jQuery( document ).ready( function ( $ ) {
	/**
		Global Variables
	*/

	const createInstantSearchState = () => ( {
		form_data: {},
		scrollingPage: 1,
		infinitePaginationIsLoading: false,
		infinitePaginationCompleted: false,
	} );

	const instantSearchStateByInstance = new Map();

	function getContextRoot( element ) {
		const $element = $( element );
		if ( ! $element.length ) {
			return $( [] );
		}

		const contextRoot = $element
			.first()
			.closest(
				'[data-instance-id], .directorist-gutenberg-listings-loop, .directorist-gutenberg-listings-archive, .directorist-contents-wrap'
			);

		return contextRoot.length ? contextRoot : $( [] );
	}

	function getInstanceKey( element ) {
		const contextRoot = getContextRoot( element );
		if ( contextRoot.length ) {
			const instanceId = contextRoot.attr( 'data-instance-id' );
			if ( instanceId ) {
				return instanceId;
			}
		}

		const atts = getDataAtts( element );
		if ( atts && atts.instance_id ) {
			return String( atts.instance_id );
		}

		return '__global__';
	}

	function getState( element ) {
		const instanceKey = getInstanceKey( element );
		if ( ! instantSearchStateByInstance.has( instanceKey ) ) {
			instantSearchStateByInstance.set(
				instanceKey,
				createInstantSearchState()
			);
		}

		return instantSearchStateByInstance.get( instanceKey );
	}

	/**
		Main Functions
	*/

	// Perform Instant Search
	function performInstantSearch( searchElement ) {
		const state = getState( searchElement );
		const contextRoot = getContextRoot( searchElement );
		const scopedRoot = contextRoot.length ? contextRoot : $( document );
		// Get archive container - works for both old and new structure
		const archiveContainer = getArchiveContainer( searchElement );

		// Instant Search Data
		const instant_search_data = prepareInstantSearchData( searchElement );

		$.ajax( {
			url: directorist.ajaxurl,
			type: 'POST',
			data: instant_search_data,
			beforeSend: function () {
				// Disable buttons in advanced filter form
				scopedRoot
					.find( '.directorist-advanced-filter__form .directorist-btn-sm' )
					.attr( 'disabled', true );

				// Add fade class to archive items
				scopedRoot
					.find(
						'.directorist-archive-items, .directorist-gutenberg-listings-archive-contents'
					)
					.addClass( 'atbdp-form-fade' );

				// Hide advanced filter
				scopedRoot
					.find( '.directorist-header-bar .directorist-advanced-filter' )
					.removeClass( 'directorist-advanced-filter--show' )
					.hide();

				// Scroll to archive if it exists
				if (
					archiveContainer.length &&
					archiveContainer.offset()?.top > 0
				) {
					$( document ).scrollTop( archiveContainer.offset().top );
				}

				closeAllSearchModal();
			},
			success: function ( html ) {
				if ( html.search_result ) {
					// Remove existing header titles
					scopedRoot
						.find(
							'.directorist-header-found-title, .dsa-save-search-container'
						)
						.remove();

					if ( html.header_title ) {
						scopedRoot
							.find( '.directorist-listings-header__left' )
							.append( html.header_title );
						scopedRoot
							.find( '.directorist-header-found-title span' )
							.text( html.count );
					}

					// Replace archive items
					scopedRoot
						.find(
							'.directorist-archive-items, .directorist-gutenberg-listings-archive-contents'
						)
						.replaceWith( html.search_result )
						.removeClass( 'atbdp-form-fade' );

					// Re-enable buttons
					scopedRoot
						.find( '.directorist-advanced-filter__form .directorist-btn-sm' )
						.attr( 'disabled', false );

					window.dispatchEvent(
						new CustomEvent( 'directorist-instant-search-reloaded' )
					);
					window.dispatchEvent(
						new CustomEvent(
							'directorist-reload-listings-map-archive'
						)
					);

					// Optional: Update meta title
					let new_meta_title = '';
					if ( html.category_name )
						new_meta_title += html.category_name;
					if ( html.location_name )
						new_meta_title +=
							( new_meta_title ? ' within ' : '' ) +
							html.location_name;
					if ( state.form_data.address )
						new_meta_title +=
							( state.form_data.in_cat || state.form_data.in_loc
								? ' near '
								: '' ) + state.form_data.address;
					document.title = new_meta_title
						? `${ new_meta_title } | ${ directorist.site_name }`
						: directorist.site_name;
				}

				// Initialize scrolling status
				state.scrollingPage = 1;
				state.infinitePaginationCompleted = false;
			},
		} );
	}

	// Perform Instant Search for directory type change
	function onDirectoryChange( searchElement ) {
		// Get archive container - get fresh reference each time
		const mainContainer = getMainContainer( searchElement );

		if ( ! mainContainer.length ) {
			return;
		}

		const mainContainerElm = mainContainer[ 0 ];
		const mainContainerWrap = mainContainerElm.querySelector(
			'.directorist-gutenberg-listings-archive-wrap'
		);

		if ( ! mainContainerWrap ) {
			return;
		}

		const state = getState( searchElement );

		// Instant Search Data
		const instant_search_data = prepareInstantSearchData( searchElement );

		$.ajax( {
			url: directorist.ajaxurl,
			type: 'POST',
			data: instant_search_data,
			beforeSend: function () {
				// Get fresh reference before adding fade class
				mainContainer.addClass( 'atbdp-form-fade' );
			},
			success: function ( html ) {
				// Handle both response types: directory_type and search_result
				const responseHtml = html.directory_type || html.search_result;

				if ( ! responseHtml ) {
					mainContainer.removeClass( 'atbdp-form-fade' );
					return;
				}

				mainContainer[ 0 ].innerHTML = responseHtml;

				// Remove fade class from all archive containers
				mainContainer.removeClass( 'atbdp-form-fade' );

				window.dispatchEvent(
					new CustomEvent( 'directorist-instant-search-reloaded' )
				);
				window.dispatchEvent(
					new CustomEvent( 'directorist-reload-listings-map-archive' )
				);

				// Initialize scrolling status
				state.scrollingPage = 1;
				state.infinitePaginationCompleted = false;
			},
			error: function () {
				// Get fresh reference on error
				mainContainer.removeClass( 'atbdp-form-fade' );
			},
		} );
	}

	// Update filters for a specific directory type
	function updateFiltersForDirectoryType( directoryType, searchElement ) {
		const contextRoot = getContextRoot( searchElement );
		const scopedRoot = contextRoot.length ? contextRoot : $( document );

		// Find the filters block
		const filtersBlock = scopedRoot
			.find( '.directorist-gutenberg-listings-archive-filters[data-atts]' )
			.first();

		if ( !filtersBlock.length ) {
			return;
		}

		// Get the current data-atts from filters block
		let filtersDataAtts = filtersBlock.data( 'atts' );

		if ( !filtersDataAtts ) {
			try {
				const attsString = filtersBlock.attr( 'data-atts' );
				if ( attsString ) {
					filtersDataAtts = JSON.parse( attsString );
				}
			} catch ( e ) {
				return;
			}
		}

		if ( !filtersDataAtts ) {
			return;
		}

		// Update directory_type_id in data-atts
		const originalDirectoryTypeId = filtersDataAtts.directory_type_id;
		filtersDataAtts.directory_type_id = directoryType;

		// Check if directory type actually changed
		if ( originalDirectoryTypeId == directoryType ) {
			return;
		}

		// Update the filters block's data-atts attribute
		filtersBlock.attr( 'data-atts', JSON.stringify( filtersDataAtts ) );

		// Since filters are server-rendered and not in AJAX response,
		// we need to fetch the page HTML with the new directory type and extract filters
		const basePathname = window.location.pathname.includes( 'admin-ajax.php' )
			? ( document.referrer ? new URL( document.referrer ).pathname : '/all-listings/' )
			: window.location.pathname;
		const currentUrl = new URL( window.location.protocol + '//' + window.location.host + basePathname );

		// Preserve existing search params (except type/directory_type)
		const existingParams = new URLSearchParams( window.location.search );
		existingParams.forEach( ( value, key ) => {
			if ( key !== 'type' && key !== 'directory_type' ) {
				currentUrl.searchParams.set( key, value );
			}
		} );

		// Remove existing type parameter if present
		currentUrl.searchParams.delete( 'type' );
		currentUrl.searchParams.delete( 'directory_type' );

		// Add new directory type
		currentUrl.searchParams.set( 'type', directoryType );

		// Store the original URL before making the request
		const originalUrl = window.location.href;

		$.ajax( {
			url: currentUrl.toString(),
			type: 'GET',
			dataType: 'html',
			success: function( pageHtml ) {
				// Restore URL if needed
				if ( window.location.pathname.includes( 'admin-ajax.php' ) ) {
					window.history.replaceState( null, '', originalUrl );
				}

				// Parse the page HTML to extract filters
				const tempDiv = $( '<div>' ).html( pageHtml );

				// Find filters in the HTML
				let newFilters = tempDiv.find( '.directorist-gutenberg-listings-archive-filters' ).first();

				// If not found, try parsing as full document
				if ( !newFilters.length ) {
					try {
						const parser = new DOMParser();
						const doc = parser.parseFromString( pageHtml, 'text/html' );
						const docBody = $( doc.body || doc.documentElement );
						newFilters = docBody.find( '.directorist-gutenberg-listings-archive-filters' ).first();
					} catch( e ) {
						// Continue with tempDiv search
					}
				}

				// Also try finding by data-atts that matches the directory type
				if ( !newFilters.length ) {
					tempDiv.find( '[data-atts]' ).each( function() {
						try {
							const attsString = $( this ).attr( 'data-atts' );
							if ( attsString ) {
								const atts = JSON.parse( attsString );
								if ( atts.directory_type_id == directoryType &&
									 $( this ).hasClass( 'directorist-gutenberg-listings-archive-filters' ) ) {
									newFilters = $( this );
									return false; // break
								}
							}
						} catch ( e ) {
							// Continue searching
						}
					} );
				}

				if ( newFilters.length ) {
					// Get the outer HTML directly
					const filtersOuterHTML = newFilters[0].outerHTML;

					if ( !filtersOuterHTML ) {
						return;
					}

					// Store the parent and next sibling to maintain position
					const filtersParent = filtersBlock.parent();
					const filtersNext = filtersBlock.next();

					// Remove the old filters block completely
					filtersBlock.remove();

					// Create new filters element from HTML string
					const newFiltersElement = $( filtersOuterHTML );

					// Ensure data-atts is set correctly
					newFiltersElement.attr( 'data-atts', JSON.stringify( filtersDataAtts ) );

					// Insert the new filters in the same position
					if ( filtersNext.length ) {
						filtersNext.before( newFiltersElement );
					} else {
						filtersParent.append( newFiltersElement );
					}

					// Trigger re-initialization
						setTimeout( function() {
						window.dispatchEvent( new CustomEvent( 'directorist-filters-replaced', {
							detail: {
								directory_type: directoryType,
								filters_element: newFiltersElement[0]
							}
						} ) );
						window.dispatchEvent( new CustomEvent( 'directorist-instant-search-reloaded' ) );

						// Re-initialize category custom fields
				initSearchCategoryCustomFields( $ );

						// Re-initialize any form-related plugins (select2, etc.)
						if ( typeof jQuery !== 'undefined' && jQuery.fn.select2 ) {
							scopedRoot.find( '.directorist-advanced-filter select' ).each( function() {
								if ( $( this ).data( 'select2' ) ) {
									$( this ).select2( 'destroy' );
								}
							} );
					}
				}, 150 );

					// Restore original URL after filter update completes
					setTimeout( function() {
						if ( window.location.pathname.includes( 'admin-ajax.php' ) ) {
							window.history.replaceState( null, '', originalUrl );
						}
					}, 500 );
				}
			},
			error: function( xhr, status, error ) {
				// Restore URL on error
				if ( window.location.pathname.includes( 'admin-ajax.php' ) ) {
					window.history.replaceState( null, '', originalUrl );
				}
			}
		} );
	}

	// AJAX call to load more listings
	function loadMoreListings( searchElement ) {
		const state = getState( searchElement );
		const contextRoot = getContextRoot( searchElement );
		let loadingDiv;
		const scopedRoot = contextRoot.length ? contextRoot : $( document );
		const container = scopedRoot
			.find( '.directorist-infinite-scroll .directorist-container-fluid .directorist-row' )
			.first();

		// Instant Search Data
		const preparedData = prepareInstantSearchData( searchElement );

		// make ajax data
		const instant_search_data = {
			...preparedData,
			paged: state.scrollingPage,
		};

		$.ajax( {
			url: directorist.ajaxurl,
			type: 'POST',
			data: instant_search_data,
			beforeSend: function () {
				loadingDiv = $( '<div>', {
					class: 'directorist-on-scroll-loading',
				} ).append(
					$( '<div>', { class: 'directorist-spinner' } ),
					$( '<span>' ).text( directorist.loading_more_text )
				);
				container.append( loadingDiv );
			},
			success: function ( html ) {
				if ( loadingDiv ) loadingDiv.remove();

				if ( html.count > 0 ) {
					// Get listings_columns from block data-atts
					const archiveContainer = container.closest(
						'.directorist-archive-items, .directorist-gutenberg-listings-archive-contents'
					);

					let targetColumnClass = 'directorist-col-4'; // Default to col-4 for grid

					// Try to get listings_columns from block data-atts
					if ( archiveContainer.length ) {
						const blockElement = archiveContainer.closest( '[data-atts]' );

						if ( blockElement.length ) {
							try {
								const dataAtts = blockElement.data( 'atts' );
								if ( dataAtts && typeof dataAtts.listings_columns !== 'undefined' ) {
									const listingsColumns = parseInt( dataAtts.listings_columns, 10 );

									// Calculate column class: 12 / listings_columns
									const columnValue = Math.round( 12 / listingsColumns );
									const columnMap = {
										12: 'directorist-col-12',
										6: 'directorist-col-6',
										4: 'directorist-col-4',
										3: 'directorist-col-3',
										2: 'directorist-col-2'
									};

									targetColumnClass = columnMap[columnValue] || 'directorist-col-4';
								}
							} catch ( e ) {
								console.warn( 'Directorist: Failed to parse data-atts for listings_columns', e );
							}
						}

						// Fallback: detect from existing columns if data-atts not available
						if ( targetColumnClass === 'directorist-col-4' ) {
							const existingColumns = container.children(
								'.directorist-col-2, .directorist-col-3, .directorist-col-4, .directorist-col-6'
							).first();

							if ( existingColumns.length ) {
								// Get the column class from existing listings
								const colClasses = ['directorist-col-2', 'directorist-col-3', 'directorist-col-4', 'directorist-col-6'];
								for ( const colClass of colClasses ) {
									if ( existingColumns.hasClass( colClass ) ) {
										targetColumnClass = colClass;
										break;
									}
								}
							} else {
								// Check if we're in list view
								const isGridView = archiveContainer.hasClass( 'directorist-archive-grid-view' ) ||
									archiveContainer.find( '.directorist-archive-grid-view' ).length > 0 ||
									archiveContainer.closest( '.directorist-archive-grid-view' ).length > 0;
								if ( !isGridView ) {
									targetColumnClass = 'directorist-col-12'; // List view uses full width
								}
							}
						}
					}

					// Parse the new listings HTML - handle both string and object
					let newListingsHtml;
					let htmlString = '';

					if ( typeof html.render_listings === 'string' ) {
						htmlString = html.render_listings;
						newListingsHtml = $( html.render_listings );
					} else {
						htmlString = html.render_listings.toString() || '';
						newListingsHtml = $( html.render_listings );
					}

					// Method 1: Replace column classes in HTML string before parsing (most reliable)
					if ( htmlString && htmlString.match( /directorist-col-\d+/ ) ) {
						// Replace all column classes with the target class
						const fixedHtml = htmlString.replace(
							/directorist-col-\d+/g,
							targetColumnClass
						);
						newListingsHtml = $( fixedHtml );
					}

					// Method 2: Also fix columns in the parsed jQuery object (backup)
					const newColumns = newListingsHtml.find(
						'.directorist-col-2, .directorist-col-3, .directorist-col-4, .directorist-col-6, .directorist-col-12'
					).add( newListingsHtml.filter( '.directorist-col-2, .directorist-col-3, .directorist-col-4, .directorist-col-6, .directorist-col-12' ) );

					// Apply the correct column class to new listings
					if ( newColumns.length > 0 ) {
						newColumns.each( function() {
							const $col = $( this );
							// Remove all column classes
							$col.removeClass( 'directorist-col-2 directorist-col-3 directorist-col-4 directorist-col-6 directorist-col-12' );
							// Add the target column class
							$col.addClass( targetColumnClass );
						} );
					}

					// Append the fixed listings
					container.append( newListingsHtml );

					// Also trigger the column preservation utility to ensure consistency
					setTimeout( function() {
						if ( typeof window.directoristPreserveColumnStructure !== 'undefined' ) {
							const archiveContainer = container.closest(
								'.directorist-archive-items, .directorist-gutenberg-listings-archive-contents'
							);
							if ( archiveContainer.length ) {
								window.directoristPreserveColumnStructure.preserve( archiveContainer[0] );
							}
						}
					}, 50 );
				} else {
					state.infinitePaginationCompleted = true;
				}

				triggerCustomEvents();
			},
			complete: function () {
				state.infinitePaginationIsLoading = false;
				if ( loadingDiv ) loadingDiv.remove();
			},
		} );
	}

	/**
    	Helper Functions
  	**/

	// Find related Gutenberg block by searching for blocks with data-atts
	function findRelatedBlock( selector, element ) {
		const contextRoot = getContextRoot( element );
		const scopedRoot = contextRoot.length ? contextRoot : $( document );
		// Try to find in scoped context first
		const block = scopedRoot.find( selector ).first();
		if ( block.length ) {
			return block;
		}
		// Fallback: search all blocks with data-atts
		return $( '[data-atts]' ).first();
	}

	function getMainContainer( searchElement ) {
		const contextRoot = getContextRoot( searchElement );
		const scopedRoot = contextRoot.length ? contextRoot : $( document );

		return scopedRoot
			.find( '.directorist-gutenberg-listings-archive' )
			.first();
	}

	// Get the archive container (listings block) - works for both structures
	function getArchiveContainer( searchElement ) {
		const contextRoot = getContextRoot( searchElement );
		const scopedRoot = contextRoot.length ? contextRoot : $( document );

		let container = scopedRoot
			.find( '.directorist-gutenberg-listings-archive' )
			.first();

		if ( ! container.length ) {
			// Fallback: find any archive container with data-atts
			container = scopedRoot
				.find(
					'.directorist-archive-items, .directorist-gutenberg-listings-archive-contents'
				)
				.closest( '[data-atts]' )
				.first();
		}

		if ( ! container.length ) {
			// Final fallback: find archive items container
			container = scopedRoot
				.find( '.directorist-archive-items' )
				.closest( '[data-atts]' )
				.first();
		}

		return container;
	}

	// Get data-atts from any related block
	function getDataAtts( element ) {
		// Try to find data-atts in the element or its closest block
		const $el = $( element );
		let atts =
			$el.data( 'atts' ) || $el.closest( '[data-atts]' ).data( 'atts' );

		// If still not found, try finding any related block
		if ( ! atts ) {
			const relatedBlock = findRelatedBlock( '[data-atts]', element );
			atts = relatedBlock.data( 'atts' );
		}

		return atts;
	}

	// Build a unified form scope for the current loop instance/context.
	function getSearchScope( searchElm ) {
		const $searchElm = $( searchElm );
		const contextRoot = getContextRoot( searchElm );
		const scopedRoot = contextRoot.length ? contextRoot : $( document );

		const basicForm = scopedRoot
			.find( '.directorist-basic-search, .directorist-search-form' )
			.first();
		const advancedForm = scopedRoot
			.find(
				'.directorist-advanced-search, .directorist-advanced-filter__form'
			)
			.first();

		if ( basicForm.length && advancedForm.length ) {
			return basicForm.add( advancedForm );
		}

		if ( basicForm.length ) {
			return basicForm;
		}

		if ( advancedForm.length ) {
			return advancedForm;
		}

		if ( $searchElm.is( 'form' ) ) {
			return $searchElm.first();
		}

		const closestForm = $searchElm.closest( 'form' );
		return closestForm.length ? closestForm : $searchElm;
	}

	// Prepare Instant Search Data
	function prepareInstantSearchData( searchElm ) {
		const state = getState( searchElm );
		// Get data-atts from the element or related blocks
		const instant_search_atts = getDataAtts( searchElm );

		// Make ajax data - ensure form_data is properly included
		const instant_search_data = {
			...state.form_data,
			action: 'directorist_instant_search',
			_nonce: directorist.ajax_nonce,
			current_page_id: directorist.current_page_id,
			data_atts: instant_search_atts,
		};

		// Debug: log the query being sent
		if ( instant_search_data.q !== undefined ) {
			console.log( 'Search query being sent:', instant_search_data.q );
		}

		return instant_search_data;
	}

	// Update or retain existing keys in form_data
	function updateFormData( searchElm, newData ) {
		const state = getState( searchElm );
		Object.entries( newData ).forEach( ( [ key, value ] ) => {
			if (
				value === undefined ||
				value === null ||
				value === '' ||
				( Array.isArray( value ) && value.length === 0 ) ||
				( typeof value === 'object' &&
					! Array.isArray( value ) &&
					Object.keys( value ).length === 0 )
			) {
				delete state.form_data[ key ];
			} else {
				state.form_data[ key ] = value;
			}
		} );
	}

	// Reset form_data
	function resetFormData( searchElm ) {
		const state = getState( searchElm );
		Object.entries( state.form_data ).forEach( ( [ key ] ) => {
			delete state.form_data[ key ];
		} );
	}

	// Update search URL with form data
	function update_instant_search_url( form_data ) {
		if ( ! history.pushState ) return;

		let newurl =
			window.location.protocol +
			'//' +
			window.location.host +
			window.location.pathname;
		let query = '';

		const appendQuery = ( key, value ) => {
			if (
				value !== undefined &&
				value !== null &&
				value !== '' &&
				( ! Array.isArray( value ) || value.length )
			) {
				if ( Array.isArray( value ) && value.length ) {
					query +=
						( query.length ? '&' : '?' ) + `${ key }=${ value }`;
				} else {
					query +=
						( query.length ? '&' : '?' ) +
						`${ key }=${ encodeURIComponent( value ) }`;
				}
			}
		};

		// These keys will be ignored
		// and will not be appended to the URL
		// when updating the URL
		const ignoreKeys = [
			'data_atts',
			'custom_field',
			'current_page_id',
			'action',
			'_nonce',
		];

		// Handle all form_data keys dynamically
		Object.entries( form_data ).forEach( ( [ key, value ] ) => {
			if ( ignoreKeys.includes( key ) ) return;

			// Handle default page
			if ( key === 'paged' && Number( value ) === 1 ) {
				return; // ❌ Skip default page 1
			}

			// Handle price & address fields specifically
			if ( key === 'price' && Array.isArray( value ) ) {
				appendQuery( 'price[0]', value[ 0 ] > 0 ? value[ 0 ] : '' );
				appendQuery( 'price[1]', value[ 1 ] > 0 ? value[ 1 ] : '' );
			} else if (
				( key === 'cityLat' || key === 'cityLng' ) &&
				! form_data.address
			) {
				return; // ❌ Skip lat/lng if no address
			} else {
				appendQuery( key, value );
			}
		} );

		// Handle custom_field
		if (
			form_data.custom_field &&
			typeof form_data.custom_field === 'object'
		) {
			Object.entries( form_data.custom_field ).forEach(
				( [ key, val ] ) => {
					// Skip if value is "0-0" (empty range slider)
					if ( val === '0-0' ) {
						return;
					}

					// Skip empty values
					if (
						! val ||
						( typeof val === 'string' && val.trim() === '' )
					) {
						return;
					}

					// Handle multiple values (arrays or comma-separated strings)
					const values = Array.isArray( val )
						? val
						: typeof val === 'string' && val.includes( ',' )
						? val.split( ',' )
						: [ val ];

					values.forEach( ( singleVal ) => {
						const formattedKey = key.startsWith( 'custom-checkbox' )
							? `custom_field%5B${ key }%5D%5B%5D`
							: `custom_field%5B${ key }%5D`;
						appendQuery( formattedKey, singleVal );
					} );
				}
			);
		}

		const finalUrl = query ? newurl + query : newurl;
		window.history.pushState( { path: finalUrl }, '', finalUrl );
	}

	// Check required fields are valid or not
	// Checks across all related forms (basic search + advanced filter)
	function checkRequiredFields( searchElm ) {
		const searchScope = getSearchScope( searchElm );

		// Select all required inputs and selects inside searchScope
		const requiredInputs = searchScope.find(
			'input[required], select[required], textarea[required]'
		);

		let requiredFieldsAreValid = true;

		requiredInputs.each( function () {
			const $el = $( this );
			const tagName = $el.prop( 'tagName' ).toLowerCase();
			const type = $el.attr( 'type' );

			if ( tagName === 'input' ) {
				if ( type === 'checkbox' || type === 'radio' ) {
					// For checkboxes/radios, at least one with this name must be checked
					const name = $el.attr( 'name' );
					const checked =
						searchScope.find( `input[name="${ name }"]:checked` )
							.length > 0;
					if ( ! checked ) {
						requiredFieldsAreValid = false;
						return false; // break .each loop early
					}
				} else {
					// For other input types, value must not be empty
					if ( ! $el.val() ) {
						requiredFieldsAreValid = false;
						return false;
					}
				}
			} else if ( tagName === 'select' || tagName === 'textarea' ) {
				// Select or textarea must have a value
				if ( ! $el.val() ) {
					requiredFieldsAreValid = false;
					return false;
				}
			}
		} );

		return requiredFieldsAreValid;
	}

	//  Build form_data from searchElm inputs.
	// Collects from all related forms (basic search + advanced filter)
	function buildFormData( searchElm ) {
		const state = getState( searchElm );
		const $searchElm = $( searchElm );
		const searchScope = getSearchScope( searchElm );
		const primaryForm = $searchElm.is( 'form' )
			? $searchElm.first()
			: $searchElm.closest( 'form' );

		let tag = [];
		let price = [];
		let custom_field = {};
		let search_by_rating = [];

		// Collect selected tags
		searchScope
			.find( 'input[name^="in_tag["]:checked' )
			.each( ( _, el ) => {
				tag.push( $( el ).val() );
			} );

		// Collect selected ratings
		searchScope
			.find( 'input[name^="search_by_rating["]:checked' )
			.each( ( _, el ) => {
				search_by_rating.push( $( el ).val() );
			} );

		// Collect price values
		searchScope.find( 'input[name^="price["]' ).each( ( _, el ) => {
			price.push( $( el ).val() );
		} );

		// Check if **any** price is greater than 0
		const hasValidPrice = price.some( ( val ) => val > 0 );

		if ( ! hasValidPrice ) {
			price = []; // Reset price if no valid price found
		}

		// Collect custom field values
		searchScope.find( '[name^="custom_field"]' ).each( function ( _, el ) {
			const $el = $( el );
			const name = $el.attr( 'name' );
			const type = $el.attr( 'type' );
			const match = name.match( /^custom_field\[(.+?)\]/ );
			const post_id = match ? match[ 1 ] : '';

			if ( ! post_id ) return;

			if ( type === 'radio' ) {
				const checked = searchScope
					.find( `input[name="custom_field[${ post_id }]"]:checked` )
					.val();
				if ( checked ) custom_field[ post_id ] = checked;
			} else if ( type === 'checkbox' ) {
				const values = [];
				searchScope
					.find(
						`input[name="custom_field[${ post_id }][]"]:checked`
					)
					.each( function () {
						const val = $( this ).val();
						if ( val ) values.push( val );
					} );
				if ( values.length ) custom_field[ post_id ] = values;
			} else {
				const value = $el.val();
				if ( value && value !== '0-0' ) custom_field[ post_id ] = value;
			}
		} );

		// Collect custom range slider min/max values
		let range_slider_values = {};
		searchScope
			.find(
				'.directorist-custom-range-slider__text.directorist-custom-range-slider__value__min'
			)
			.each( function () {
				const minVal = $( this ).val();
				if ( minVal && minVal !== '0' ) {
					range_slider_values[
						'directorist-custom-range-slider__value__min'
					] = minVal;
				}
			} );
		searchScope
			.find(
				'.directorist-custom-range-slider__text.directorist-custom-range-slider__value__max'
			)
			.each( function () {
				const maxVal = $( this ).val();
				if ( maxVal && maxVal !== '0' ) {
					range_slider_values[
						'directorist-custom-range-slider__value__max'
					] = maxVal;
				}
			} );

		// Collect basic form values - search across all forms
		// For query, prioritize getting from the triggering form, then search all forms
		let q = primaryForm.find( 'input[name="q"]' ).val();
		// jQuery .val() returns empty string if input is empty, so check for empty string
		if ( ! q || q === '' ) {
			q = searchScope.find( 'input[name="q"]' ).first().val();
		}
		// Normalize empty string to undefined so it gets deleted from form_data
		if ( ! q || q === '' ) {
			q = undefined;
		}
		const in_cat = searchScope.find( '.directorist-category-select' ).val();
		const in_loc = searchScope.find( '.directorist-location-select' ).val();
		const price_range = searchScope
			.find( "input[name='price_range']:checked" )
			.val();
		const address = searchScope.find( 'input[name="address"]' ).val();
		const zip = searchScope.find( 'input[name="zip"]' ).val();
		const fax = searchScope.find( 'input[name="fax"]' ).val();
		const email = searchScope.find( 'input[name="email"]' ).val();
		const website = searchScope.find( 'input[name="website"]' ).val();
		const phone = searchScope.find( 'input[name="phone"]' ).val();
		const phone2 = searchScope.find( 'input[name="phone2"]' ).val();
		const view = state.form_data.view;
		const paged = state.form_data.paged;

		// Get directory type - prioritize triggering form, then fallback to scoped forms
		const directory_type =
			primaryForm.find( 'input[name="directory_type"]' ).val() ||
			searchScope.find( 'input[name="directory_type"]' ).first().val();

		// Update form_data
		updateFormData( searchElm, {
			q,
			in_cat,
			in_loc,
			in_tag: tag,
			price,
			price_range,
			search_by_rating,
			address,
			zip,
			fax,
			email,
			website,
			phone,
			phone2,
			custom_field,
			view,
			paged,
			directory_type,
			...range_slider_values,
		} );

		// open_now checkbox
		const open_now_val = searchScope
			.find( 'input[name="open_now"]' )
			.is( ':checked' )
			? searchScope.find( 'input[name="open_now"]' ).val()
			: undefined;
		updateFormData( searchElm, { open_now: open_now_val } );

		const radius_search_based_on = searchScope
			.find( '.directorist-radius_search_based_on' )
			.val();

		// Check if the address or zip code is present to update miles, lat, and lng
		if ( radius_search_based_on === 'address' && address ) {
			updateFormData( searchElm, {
				cityLat: searchScope.find( '#cityLat' ).val(),
				cityLng: searchScope.find( '#cityLng' ).val(),
				miles: searchScope.find( 'input[name="miles"]' ).val(),
			} );
		} else if ( radius_search_based_on === 'zip' && zip ) {
			updateFormData( searchElm, {
				zip_cityLat: searchScope.find( '.zip-cityLat' ).val(),
				zip_cityLng: searchScope.find( '.zip-cityLng' ).val(),
				miles: searchScope.find( 'input[name="miles"]' ).val(),
			} );
		} else {
			updateFormData( searchElm, {
				cityLat: undefined,
				cityLng: undefined,
				zip_cityLat: undefined,
				zip_cityLng: undefined,
				miles: undefined,
			} );
		}

		// Paging: get current page number, default 1 if not found
		let page = parseInt( state.form_data.paged, 10 ) || 1;
		updateFormData( searchElm, {
			paged: page > 1 ? page : undefined,
		} );

		// Update URL with form data
		update_instant_search_url( state.form_data );
	}

	// Build form data without required value
	function buildFormDataWithoutRequired( searchElm ) {
		const state = getState( searchElm );
		const notRequiredFields = [ 'view', 'sort', 'paged' ];

		Object.entries( state.form_data ).forEach( ( [ key ] ) => {
			if ( ! notRequiredFields.includes( key ) ) {
				delete state.form_data[ key ];
			}
		} );

		// Update URL with form data
		update_instant_search_url( state.form_data );
	}

	// Perform Instant Search with required value
	function performInstantSearchWithRequiredValue( searchElm ) {
		// Build form data
		buildFormData( searchElm );

		// Check required fields
		const allRequiredFieldsAreValid = checkRequiredFields( searchElm );

		// If required fields are valid, proceed with filtering
		if ( allRequiredFieldsAreValid ) {
			performInstantSearch( searchElm );
		}
	}

	// Perform Instant Search without required value
	function performInstantSearchWithoutRequiredValue( searchElm ) {
		// Check required fields
		const allRequiredFieldsAreValid = checkRequiredFields( searchElm );

		// If required fields are valid, proceed with filtering
		if ( allRequiredFieldsAreValid ) {
			// Build form data
			buildFormData( searchElm );

			performInstantSearch( searchElm );
		} else {
			// Build form data without required value
			buildFormDataWithoutRequired( searchElm );

			// Filter Listing
			performInstantSearch( searchElm );
		}
	}

	// Handle Infinite Scroll
	function handleScroll() {
		const containers = $(
			'.directorist-infinite-scroll .directorist-container-fluid .directorist-row'
		);

		if ( ! containers.length ) {
			return;
		}

		const scrollBottom = window.scrollY + window.innerHeight;

		containers.each( function () {
			const container = $( this );
			const state = getState( container );

			if (
				state.infinitePaginationIsLoading ||
				state.infinitePaginationCompleted
			) {
				return;
			}

			const containerBottom =
				container.offset().top + container.outerHeight();

			if ( scrollBottom < containerBottom ) {
				return;
			}

			const activeForm = getActiveForm( container );
			const searchContext = activeForm.length ? activeForm : container;

			state.infinitePaginationIsLoading = true;
			state.scrollingPage++;

			// build form_data
			buildFormData( searchContext );

			// Load more listings
			loadMoreListings( searchContext );
		} );
	}

	// Close all search modal
	function closeAllSearchModal() {
		var searchModalElement = document.querySelectorAll(
			'.directorist-search-modal'
		);

		searchModalElement.forEach( ( modal ) => {
			var modalOverlay = modal.querySelector(
				'.directorist-search-modal__overlay'
			);
			var modalContent = modal.querySelector(
				'.directorist-search-modal__contents'
			);
			var modalBodyOverlay = document.querySelector(
				'.directorist-content-active'
			);

			// Overlay Style
			if ( modalOverlay ) {
				modalOverlay.style.cssText =
					'opacity: 0; visibility: hidden; transition: 0.5s ease';
				// remove overlay class on body
				modalBodyOverlay.classList.remove(
					'directorist-overlay-active'
				);
			}

			// Modal Content Style
			if ( modalContent ) {
				modalContent.style.cssText =
					'opacity: 0; visibility: hidden; bottom: -200px;';
			}
		} );
	}

	// Determine the active form with intelligent fallback strategy
	function getActiveForm( contextSource ) {
		const contextRoot = getContextRoot( contextSource );
		const scopedRoot = contextRoot.length ? contextRoot : $( document );

		const advancedForm = scopedRoot
			.find(
				'.directorist-advanced-search, .directorist-advanced-filter__form'
			)
			.first();
		const searchForm = scopedRoot
			.find( '.directorist-basic-search, .directorist-search-form' )
			.first();

		// Create form candidates with metadata
		const candidates = [
			{
				form: advancedForm,
				hasDirectoryType:
					advancedForm.find( 'input[name="directory_type"]' ).length >
					0,
			},
			{
				form: searchForm,
				hasDirectoryType:
					searchForm.find( 'input[name="directory_type"]' ).length >
					0,
			},
		].filter( ( candidate ) => candidate.form.length > 0 );

		// Smart selection: prioritize forms with directory_type, fallback to responsive behavior
		const formWithDirectoryType = candidates.find(
			( c ) => c.hasDirectoryType
		);
		if ( formWithDirectoryType ) {
			return formWithDirectoryType.form;
		}

		// Fallback: use responsive selection if no directory_type found
		if ( screen.width > 575 && advancedForm.length ) {
			return advancedForm;
		}

		if ( searchForm.length ) {
			return searchForm;
		}

		return advancedForm;
	}

	// Get directory type
	function getDirectoryType( directoryTypeLink ) {
		const typeMatch = directoryTypeLink
			.attr( 'href' )
			?.match( /type=([^&]+)/ );
		return typeMatch ? typeMatch[ 1 ] : '';
	}

	// Get view as
	function getViewAs( viewAsLink ) {
		const viewMatch = viewAsLink.attr( 'href' )?.match( /view=([^&]+)/ );
		return viewMatch ? viewMatch[ 1 ] : '';
	}

	// Get sort value
	function getSortValue( sortByLink ) {
		let sort_href = sortByLink.attr( 'data-link' );
		let sort_by =
			sort_href && sort_href.length ? sort_href.match( /sort=.+/ ) : '';
		return sort_by && sort_by.length
			? sort_by[ 0 ].replace( /sort=/, '' )
			: '';
	}

	// Trigger custom events
	function triggerCustomEvents() {
		window.dispatchEvent(
			new Event( 'directorist-instant-search-reloaded' )
		);
		window.dispatchEvent(
			new Event( 'directorist-reload-listings-map-archive' )
		);
	}

	// Range Slider searching observer
	function initObserver() {
		// Find all range slider inputs in both old and new structures
		let targetNodes = document.querySelectorAll(
			'.directorist-custom-range-slider__value input'
		);

		targetNodes.forEach( ( targetNode ) => {
			let searchElm = $( targetNode.closest( 'form' ) );

			if ( targetNode && searchElm.length ) {
				let timeout;
				const observerCallback = ( mutationList, observer ) => {
					for ( const mutation of mutationList ) {
						if ( mutation.attributeName == 'value' ) {
							clearTimeout( timeout );
							timeout = setTimeout( () => {
								// Instant search with required value
								performInstantSearchWithRequiredValue(
									searchElm
								);
							}, 250 );
						}
					}
				};

				const observer = new MutationObserver( observerCallback );
				observer.observe( targetNode, {
					attributes: true,
					childList: true,
					subtree: true,
				} );
			}
		} );
	}

	// Single Location Category Page Search Form Item Disable
	function singleCategoryLocationInit() {
		// Try to find data-atts in any block (old or new structure)
		const directoristArchiveContents = document.querySelector(
			'.directorist-archive-contents, [data-atts]'
		);
		if ( ! directoristArchiveContents ) {
			return;
		}

		const directoristDataAttributes =
			directoristArchiveContents.getAttribute( 'data-atts' );
		if ( ! directoristDataAttributes ) {
			return;
		}

		let shortcode, location, category;
		try {
			const parsed = JSON.parse( directoristDataAttributes );
			shortcode = parsed.shortcode || parsed._current_page;
			location = parsed.location || '';
			category = parsed.category || '';
		} catch ( e ) {
			return;
		}

		if ( shortcode === 'directorist_category' && category.trim() !== '' ) {
			const categorySelect = document.querySelector(
				'.directorist-search-form .directorist-category-select'
			);
			if ( categorySelect ) {
				categorySelect
					.closest( '.directorist-search-category' )
					.classList.add(
						'directorist-search-form__single-category'
					);
			}
		}

		if ( shortcode === 'directorist_location' && location.trim() !== '' ) {
			const locationSelect = document.querySelector(
				'.directorist-search-form .directorist-location-select'
			);
			if ( locationSelect ) {
				locationSelect
					.closest( '.directorist-search-location' )
					.classList.add(
						'directorist-search-form__single-location'
					);
			}
		}
	}

	/**
		Event Listeners
	*/

	// sidebar on keyup searching - listen on input fields directly
	$( 'body' ).on(
		'keyup',
		'.directorist-search-form input, .directorist-basic-search input, .directorist-advanced-search input',
		debounce( function ( e ) {
			if (
				$( e.target ).closest(
					'.directorist-custom-range-slider__value'
				).length > 0 ||
				( e.key === 'Enter' && e.target.value === '' )
			) {
				return; // Skip search for this element
			}

			e.preventDefault();
			// Get the form containing this input
			var searchElm = $( this ).closest( 'form' );

			// Only proceed if we have a valid form
			if ( ! searchElm.length ) {
				searchElm = $( this ).closest(
					'.directorist-search-form, .directorist-basic-search, .directorist-advanced-search'
				);
			}

			// Instant search with required value
			performInstantSearchWithRequiredValue( searchElm );
		}, 250 )
	);

	// sidebar on change searching - radio/checkbox/location/range
	$( 'body' ).on(
		'change',
		".directorist-search-form input[type='checkbox'], .directorist-search-form input[type='radio'], .directorist-search-form input[type='time'], .directorist-search-form input[type='date'], .directorist-search-form .directorist-custom-range-slider__wrap .directorist-custom-range-slider__range, .directorist-search-form .directorist-search-location .location-name, .directorist-basic-search input[type='checkbox'], .directorist-basic-search input[type='radio'], .directorist-basic-search input[type='time'], .directorist-basic-search input[type='date'], .directorist-advanced-search input[type='checkbox'], .directorist-advanced-search input[type='radio'], .directorist-advanced-search input[type='time'], .directorist-advanced-search input[type='date'], .directorist-basic-search .directorist-custom-range-slider__wrap .directorist-custom-range-slider__range, .directorist-advanced-search .directorist-custom-range-slider__wrap .directorist-custom-range-slider__range, .directorist-basic-search .directorist-search-location .location-name, .directorist-advanced-search .directorist-search-location .location-name",
		debounce( function ( e ) {
			e.preventDefault();
			var searchElm = $( this ).closest( 'form' );

			// Instant search with required value
			performInstantSearchWithRequiredValue( searchElm );
		}, 250 )
	);

	// sidebar on change searching - zipcode/location
	$( 'body' ).on(
		'change',
		'.directorist-search-form .directorist-search-location, .directorist-search-form .directorist-zipcode-search, .directorist-basic-search .directorist-search-location, .directorist-basic-search .directorist-zipcode-search, .directorist-advanced-search .directorist-search-location, .directorist-advanced-search .directorist-zipcode-search',
		debounce( function ( e ) {
			e.preventDefault();
			const searchElm = $( this ).closest( 'form' );

			// If it's a location field, ensure it has a value before triggering the filter
			if ( $( this ).hasClass( 'directorist-search-location' ) ) {
				const locationField = $( this ).find( 'input[name="address"]' );
				if ( ! locationField.val() ) {
					return;
				}
			}

			// Instant search with required value
			performInstantSearchWithRequiredValue( searchElm );
		}, 250 )
	);

	// sidebar on change searching - select
	$( 'body' ).on(
		'change',
		'.directorist-search-form select, .directorist-basic-search select, .directorist-advanced-search select',
		debounce( function ( e ) {
			e.preventDefault();
			if ( ! $( this ).val() ) {
				return; // Skip search if the value is empty
			}

			var searchElm = $( this ).closest( 'form' );

			// Instant search with required value
			performInstantSearchWithRequiredValue( searchElm );
		}, 250 )
	);

	// sidebar on change searching - color
	window.addEventListener(
		'directorist-color-changed',
		debounce( function ( e ) {
			const { input } = e.detail;
			const searchElm = $( input );

			if ( ! searchElm.length ) return;

			// Instant search with required value
			performInstantSearchWithRequiredValue( searchElm );
		}, 250 )
	);

	// sidebar on click searching - location icon
	$( 'body' ).on(
		'click',
		'.directorist-search-form .directorist-filter-location-icon, .directorist-basic-search .directorist-filter-location-icon, .directorist-advanced-search .directorist-filter-location-icon',
		debounce( function ( e ) {
			e.preventDefault();
			var searchElm = $( this ).closest( 'form' );

			// Instant search with required value
			performInstantSearchWithRequiredValue( searchElm );
		}, 1000 )
	);

	// Clear Input Value
	$( 'body' ).on(
		'click',
		'.directorist-search-form .directorist-search-field__btn--clear, .directorist-basic-search .directorist-search-field__btn--clear, .directorist-advanced-search .directorist-search-field__btn--clear',
		function ( e ) {
			// Clear Color Field Value
			let irisPicker = $( this )
				.closest( '.directorist-search-field.directorist-color' )
				.find( 'input.wp-picker-clear' );

			if ( irisPicker !== null && irisPicker.length ) {
				irisPicker.click();
			}

			let $searchField = $( this ).closest( '.directorist-search-field' );

			var searchElm = $( this ).closest( 'form' );

			// Clear text, email, number, select fields etc
			$searchField
				.find(
					'input:not([type="checkbox"]):not([type="radio"]):not(.wp-picker-clear), select'
				)
				.val( '' );

			// Clear checkboxes
			$searchField
				.find( 'input[type="checkbox"]' )
				.prop( 'checked', false );

			// Clear radio buttons
			$searchField.find( 'input[type="radio"]' ).prop( 'checked', false );

			// Proceed if form exists
			if ( searchElm.length ) {
				performInstantSearchWithRequiredValue( searchElm );
			}
		}
	);

	// Directorist instant search reset
	// Note: The actual form field reset is handled by search-form-reset.js
	// This listener handles the instant search data reset and triggers the search after form reset
	window.addEventListener( 'directorist-form-reset-complete', function ( e ) {
		const resetForms = Array.isArray( e.detail?.forms ) ? e.detail.forms : [];
		const contextSource = resetForms.length ? resetForms[ 0 ] : document;

		// Get active form
		const activeForm = getActiveForm( contextSource );
		const searchContext = activeForm.length ? activeForm : $( contextSource );

		// Reset form_data - clear all search parameters
		resetFormData( searchContext );

		// ✅ only update `page` to 1
		updateFormData( searchContext, { paged: 1 } );

		// Build form data and perform search after form reset
		setTimeout( function () {
			buildFormData( searchContext );
			performInstantSearch( searchContext );
		}, 150 );
	} );

	// Directorist instant search submit
	$( 'body' ).on(
		'submit',
		'.directorist-search-form, .directorist-basic-search, .directorist-advanced-search',
		function ( e ) {
			e.preventDefault();
			let _this = $( this );

			// Instant search with required value
			performInstantSearchWithRequiredValue( _this );
		}
	);

	// Directorist instant search submit - for advanced filter
	$( 'body' ).on(
		'submit',
		'.widget .default-ad-search:not(.directorist_single) .directorist-advanced-filter__form',
		function ( e ) {
			// Check if instant search forms are available
			if (
				$(
					'.directorist-search-form, .directorist-basic-search, .directorist-advanced-search'
				).length
			) {
				e.preventDefault();
				let _this = $( this );

				// Instant search with required value
				performInstantSearchWithRequiredValue( _this );
			}
		}
	);

	// Directorist type changes
	$( 'body' ).on(
		'click',
		'.directorist-gutenberg-listings-archive-search-nav .directorist-type-nav__link, .directorist-type-nav__link',
		function ( e ) {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();

			const $clickedLink = $( this );
			const $clickedLi = $clickedLink.closest( '.directorist-type-nav__list li' );

			// Check if the clicked item is already active
			if ( $clickedLi.hasClass( 'directorist-type-nav__list__current' ) || $clickedLink.hasClass( 'active' ) ) {
				return; // Skip if already active
			}

			// Update active state IMMEDIATELY (before AJAX call) for better UX
			const contextRoot = getContextRoot( $clickedLink );
			const scopedRoot = contextRoot.length ? contextRoot : $( document );
			const allNavbars = scopedRoot.find(
				'.directorist-gutenberg-listings-archive-search-nav, .directorist-type-nav'
			);
			allNavbars.each( function() {
				const $nav = $( this );
				// Remove active class from all items in this navbar
				$nav.find( '.directorist-type-nav__list li' ).removeClass( 'directorist-type-nav__list__current' );
				$nav.find( '.directorist-type-nav__link' ).removeClass( 'active' );
			} );

			// Set the clicked item as active
			$clickedLi.addClass( 'directorist-type-nav__list__current' );
			$clickedLink.addClass( 'active' );

			// reset form data
			resetFormData( $clickedLink );

			// Get directory_type
			const directory_type = getDirectoryType( $clickedLink );

			// Validate directory_type before proceeding
			if ( !directory_type || directory_type.trim() === '' ) {
				$clickedLi.removeClass( 'directorist-type-nav__list__current' );
				$clickedLink.removeClass( 'active' );
				return;
			}

			// ✅ only update `directory_type`, preserve others
			updateFormData( $clickedLink, { directory_type } );

			// Update URL with form data
			update_instant_search_url( getState( $clickedLink ).form_data );

			// Set the directory_type value in all inputs
			scopedRoot.find( 'input[name="directory_type"]' ).val( directory_type );

			// Get active form
			const activeForm = getActiveForm( $clickedLink );
			const searchContext = activeForm.length ? activeForm : $clickedLink;

			// Instant search for directory type change
			onDirectoryChange( searchContext );
		}
	);

	// Directorist view as changes
	$( 'body' ).on(
		'click',
		'.directorist-viewas .directorist-viewas__item',
		function ( e ) {
			e.preventDefault();

			// Check if the clicked item is already active
			if ( $( this ).hasClass( 'active' ) ) {
				return; // Skip if already active
			}

			// get view as value
			const view = getViewAs( $( this ) );
			const activeForm = getActiveForm( $( this ) );
			const searchContext = activeForm.length ? activeForm : $( this );

			// ✅ only update `view`, preserve others
			updateFormData( searchContext, { view } );

			// Instant search without required value
			performInstantSearchWithoutRequiredValue( searchContext );
		}
	);

	// Directorist sort by changes
	$( 'body' ).on(
		'click',
		'.directorist-sortby-dropdown .directorist-dropdown__links__single-js',
		function ( e ) {
			e.preventDefault();

			// toggle active class
			$( this )
				.addClass( 'active' )
				.siblings( '.directorist-dropdown__links__single-js' )
				.removeClass( 'active' );

			// get sort value
			const sort = getSortValue( $( this ) );
			const activeForm = getActiveForm( $( this ) );
			const searchContext = activeForm.length ? activeForm : $( this );

			// ✅ only update `sort`, preserve others
			updateFormData( searchContext, { sort } );

			// Instant search without required value
			performInstantSearchWithoutRequiredValue( searchContext );
		}
	);

	// Directorist pagination changes
	$( 'body' ).on(
		'click',
		'.directorist-pagination .page-numbers',
		function ( e ) {
			e.preventDefault();
			const activeForm = getActiveForm( $( this ) );
			const searchContext = activeForm.length ? activeForm : $( this );
			const state = getState( searchContext );
			let page = state.form_data.paged || 1;
			const currentPage = $( this ).text();
			if ( currentPage ) {
				page = parseInt( currentPage, 10 );
			} else if ( $( this ).hasClass( 'next' ) ) {
				page = parseInt( page, 10 ) + 1;
			} else if ( $( this ).hasClass( 'prev' ) ) {
				page = parseInt( page, 10 ) - 1;
			}
			// ✅ only update `paged`, preserve others
			updateFormData( searchContext, { paged: page } );

			// Instant search without required value
			performInstantSearchWithoutRequiredValue( searchContext );
		}
	);

	// Submit on sidebar form - fallback for non-instant search
	if (
		$(
			'.directorist-search-form, .directorist-basic-search, .directorist-advanced-search'
		).length === 0
	) {
		$( 'body' ).on(
			'submit',
			'.directorist-basic-search, .directorist-advanced-search',
			function ( e ) {
				e.preventDefault();
				let basic_data = $( '.directorist-basic-search' ).serialize();
				let advanced_data = $(
					'.directorist-advanced-search'
				).serialize();
				let action_value = $( '.directorist-advanced-search' ).attr(
					'action'
				);
				let url = action_value + '?' + basic_data + '&' + advanced_data;

				window.location.href = url;
			}
		);
	}

	// Prevent disabled links from being clicked
	$( 'body' ).on( 'click', '.disabled-link', function ( e ) {
		e.preventDefault();
	} );

	// Prevent default action for dropdown links
	$( '.directorist-dropdown__links__single-js' ).off( 'click' );

	// Initialize Infinite Scroll
	window.addEventListener( 'scroll', function () {
		handleScroll();
	} );

	// Initialize the observer for single category location
	window.addEventListener( 'load', function () {
		debounce( initObserver(), 250 );

		singleCategoryLocationInit();
	} );
} );
