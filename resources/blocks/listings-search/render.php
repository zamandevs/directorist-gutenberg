<?php

defined( 'ABSPATH' ) || exit;

use Directorist\Directorist_Listings;

$listings = new Directorist_Listings();
$context_directory_type_id = ! empty( $block->context['directorist-gutenberg/directoryTypeId'] ) ? (int) $block->context['directorist-gutenberg/directoryTypeId'] : 0;
$directory_type_id = ! empty( $attributes['directory_type_id'] ) ? (int) $attributes['directory_type_id'] : $context_directory_type_id;

if ( $directory_type_id > 0 ) {
    $listings->directory_type_id = $directory_type_id;
}

// Get block width class
$block_width_class = directorist_gutenberg_get_block_width_class( $attributes );
?>
<div <?php echo get_block_wrapper_attributes(['class' => $block_width_class]); $listings->data_atts() ?>>
    <div class="directorist-gutenberg-listings-search-nav directorist-gutenberg-listings-archive-search-nav">
        <?php $listings->directory_type_nav_template(); ?>
    </div>

    <div class="directorist-gutenberg-listings-search-form directorist-gutenberg-listings-archive-search-form">
        <?php
            $listings->basic_search_form_template();
        ?>
    </div>
</div>
