<?php

defined( "ABSPATH" ) || exit;

$blocks_dir = directorist_gutenberg_dir( "assets/blocks" );

return apply_filters( 'directorist_gutenberg_template_blocks', [
    'directorist-gutenberg/listings-archive' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listings-archive',
        'types'      => ['listings-archive'],
    ],
    'directorist-gutenberg/listings-loop' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listings-loop',
        'types'      => ['listings-archive'],
    ],
    'directorist-gutenberg/listing-card-template' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-template',
        'types'      => ['listings-archive', 'listings-grid-view', 'listings-list-view'],
    ],
    'directorist-gutenberg/single-listing-template' => [
        'dir'        => $blocks_dir,
        'field_type' => 'single-listing-template',
        'types'      => ['single-listing'],
    ],
    'directorist-gutenberg/listings-header' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listings-header',
        'types'      => ['listings-archive'],
    ],
    'directorist-gutenberg/listings-search' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listings-search',
        'types'      => ['listings-archive'],
    ],
    'directorist-gutenberg/listings-filters' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listings-filters',
        'types'      => ['listings-archive'],
    ],
    'directorist-gutenberg/listing-card-title' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-title',
        'types'      => ['listings-grid-view', 'listings-list-view'],
    ],
    'directorist-gutenberg/listing-card-thumbnail' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-thumbnail',
        'types'      => ['listings-grid-view', 'listings-list-view'],
    ],
    'directorist-gutenberg/listing-card-address' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-address',
        'types'      => ['listings-grid-view', 'listings-list-view'],
    ],
    'directorist-gutenberg/listing-card-phone' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-phone',
        'types'      => ['listings-grid-view', 'listings-list-view'],
    ],
    'directorist-gutenberg/listing-card-phone-two' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-phone-two',
        'types'      => ['listings-grid-view', 'listings-list-view'],
    ],
    'directorist-gutenberg/listing-card-location' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-location',
        'types'      => ['listings-grid-view', 'listings-list-view'],
    ],
    'directorist-gutenberg/listing-card-email' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-email',
        'types'      => ['listings-grid-view', 'listings-list-view'],
    ],
    'directorist-gutenberg/listing-card-website' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-website',
        'types'      => ['listings-grid-view', 'listings-list-view'],
    ],
    'directorist-gutenberg/listing-card-posted-date' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-posted-date',
        'types'      => ['listings-grid-view', 'listings-list-view'],
    ],
    'directorist-gutenberg/listing-card-fax' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-fax',
        'types'      => ['listings-grid-view', 'listings-list-view'],
    ],
    'directorist-gutenberg/listing-card-zip-code' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-zip-code',
        'types'      => ['listings-grid-view', 'listings-list-view'],
    ],
    'directorist-gutenberg/listing-card-badge-popular' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-badge-popular',
        'types'      => ['listings-grid-view', 'listings-list-view'],
    ],
    'directorist-gutenberg/listing-card-badge-featured' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-badge-featured',
        'types'      => ['listings-grid-view', 'listings-list-view'],
    ],
    'directorist-gutenberg/listing-card-badge-new' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-badge-new',
        'types'      => ['listings-grid-view', 'listings-list-view'],
    ],
    'directorist-gutenberg/listing-card-badge-favorite' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-badge-favorite',
        'types'      => ['listings-grid-view', 'listings-list-view'],
    ],
    'directorist-gutenberg/listing-card-category' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-category',
        'types'      => ['listings-grid-view', 'listings-list-view'],
    ],
    'directorist-gutenberg/listing-card-pricing' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-pricing',
        'types'      => ['listings-grid-view', 'listings-list-view'],
    ],
    'directorist-gutenberg/listing-card-rating' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-rating',
        'types'      => ['listings-grid-view', 'listings-list-view'],
    ],
    'directorist-gutenberg/listing-card-user-avatar' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-user-avatar',
        'types'      => ['listings-grid-view', 'listings-list-view'],
    ],
    'directorist-gutenberg/listing-card-view-count' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-view-count',
        'types'      => ['listings-grid-view', 'listings-list-view'],
    ],
    'directorist-gutenberg/listing-card-custom-text' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-custom-text',
        'types'      => ['listings-grid-view', 'listings-list-view'],
    ],
    'directorist-gutenberg/listing-card-custom-textarea' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-custom-textarea',
        'types'      => ['listings-grid-view', 'listings-list-view'],
    ],
    'directorist-gutenberg/listing-card-custom-number' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-custom-number',
        'types'      => ['listings-grid-view', 'listings-list-view'],
    ],
    'directorist-gutenberg/listing-card-custom-url' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-custom-url',
        'types'      => ['listings-grid-view', 'listings-list-view'],
    ],
    'directorist-gutenberg/listing-card-custom-date' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-custom-date',
        'types'      => ['listings-grid-view', 'listings-list-view'],
    ],
    'directorist-gutenberg/listing-card-custom-time' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-custom-time',
        'types'      => ['listings-grid-view', 'listings-list-view'],
    ],
    'directorist-gutenberg/listing-card-custom-select' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-custom-select',
        'types'      => ['listings-grid-view', 'listings-list-view'],
    ],
    'directorist-gutenberg/listing-card-custom-checkbox' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-custom-checkbox',
        'types'      => ['listings-grid-view', 'listings-list-view'],
    ],
    'directorist-gutenberg/listing-card-custom-radio' => [
        'dir'        => $blocks_dir,
        'field_type' => 'listing-card-custom-radio',
        'types'      => ['listings-grid-view', 'listings-list-view'],
    ],
] );
