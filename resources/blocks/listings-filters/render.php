<?php

defined( 'ABSPATH' ) || exit;

use Directorist\Helper;
use Directorist\Directorist_Listings;
use Directorist\Directorist_Listing_Search_Form;

$listings = new Directorist_Listings();

$listings->directory_type_id              = $attributes['directory_type_id'];
$listings->options['sidebar_filter_text'] = $attributes['filters_text'];

$search_field_atts = $listings->get_search_field_atts();

$searchform = new Directorist_Listing_Search_Form( 'search_result', $listings->current_listing_type, $search_field_atts );

$searchform->options['reset_sidebar_filters_text'] = $attributes['reset_text'];

$args = [
    'listings'   => $listings,
    'searchform' => $searchform,
];

// Get block width class
$block_width_class = directorist_gutenberg_get_block_width_class( $attributes );
?>
<div <?php echo get_block_wrapper_attributes(['class' => 'directorist-gutenberg-listings-archive-filters ' . $block_width_class]); $listings->data_atts() ?>>
    <?php
        Helper::get_template( 'archive/advance-search-form', $args );
    ?>
</div>