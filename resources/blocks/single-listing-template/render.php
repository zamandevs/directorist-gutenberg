<?php

defined( 'ABSPATH' ) || exit;

$context_mode = ! empty( $attributes['context_mode'] ) ? sanitize_text_field( $attributes['context_mode'] ) : 'inferred';
$context_directory_type_id = ! empty( $block->context['directorist-gutenberg/directoryTypeId'] ) ? (int) $block->context['directorist-gutenberg/directoryTypeId'] : 0;
$directory_type_id = ! empty( $attributes['directory_type_id'] ) ? (int) $attributes['directory_type_id'] : $context_directory_type_id;

if ( $context_mode === 'inferred' && $directory_type_id <= 0 && defined( 'ATBDP_POST_TYPE' ) && is_singular( ATBDP_POST_TYPE ) ) {
    $queried_listing_id = (int) get_queried_object_id();
    if ( $queried_listing_id > 0 ) {
        $directory_type_id = (int) get_post_meta( $queried_listing_id, '_directory_type', true );
    }
}

if ( $context_mode === 'manual' && $directory_type_id <= 0 ) {
    ?>
    <div <?php echo get_block_wrapper_attributes( [ 'class' => 'directorist-gutenberg-single-listing-template directorist-gutenberg-single-listing-template-empty' ] ); ?>>
        <p><?php esc_html_e( 'Select a directory type in Single Listing Template settings.', 'directorist-gutenberg' ); ?></p>
    </div>
    <?php
    return;
}

$block_width_class = directorist_gutenberg_get_block_width_class( $attributes );
?>
<div <?php echo get_block_wrapper_attributes( [ 'class' => 'directorist-gutenberg-single-listing-template ' . $block_width_class ] ); ?>>
    <?php directorist_gutenberg_echo( $content ); ?>
</div>
