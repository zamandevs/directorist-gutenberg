<?php

defined( 'ABSPATH' ) || exit;

use Directorist\Directorist_Listings;
use Directorist\Helper;

$listings = new Directorist_Listings();

$listings->directory_type_id = $attributes['directory_type_id'];

$default_view = get_post_meta( $attributes['template_id'], 'default_view', true );

$listings->view = ! empty( $default_view ) ? $default_view : 'grid';

$listings->header_title = $attributes['listings_count_text'];

if ( strval( $attributes['show_listings_count'] ) !== '1' ) {
    $listings->header_title = '';
}

$listings->views = [];

foreach ( $attributes['view_type'] as $view ) {
    $listings->views[ $view ] = ucfirst( $view );
}

$listings->display_viewas_dropdown = ! empty( $listings->views ) ? 1 : 0;
$listings->display_sortby_dropdown = strval( $attributes['enable_sorting'] ) === '1' ? true : false;
$listings->sort_by_text            = $attributes['sort_by_label'];
$listings->sort_by_items           = $attributes['sort_by'];

// Get block width class
$block_width_class = directorist_gutenberg_get_block_width_class( $attributes );

// Get wrapper attributes
$wrapper_attributes = get_block_wrapper_attributes(['class' => $block_width_class]);

// Add drop shadow style if set
if ( ! empty( $attributes['drop_shadow'] ) ) {
	$box_shadow = 'box-shadow: ' . esc_attr( $attributes['drop_shadow'] ) . ';';

	// Check if style attribute already exists in wrapper attributes
	if ( preg_match( '/style="([^"]*)"/', $wrapper_attributes, $matches ) ) {
		// Merge with existing style
		$existing_style = $matches[1];
		$new_style = $existing_style . ' ' . $box_shadow;
		$wrapper_attributes = str_replace( $matches[0], 'style="' . esc_attr( $new_style ) . '"', $wrapper_attributes );
	} else {
		// Add new style attribute before the closing >
		$wrapper_attributes = rtrim( $wrapper_attributes, '>' ) . ' style="' . esc_attr( $box_shadow ) . '">';
	}
}
?>
<div <?php echo $wrapper_attributes; $listings->data_atts() ?>>
    <?php
        echo '<div class="directorist-gutenberg-listings-archive-header">';
		Helper::get_template( 'archive/header-bar', [ 'listings' => $listings ] );
		echo '</div>';
    ?>
</div>
