<?php

defined( 'ABSPATH' ) || exit;

use Directorist\Directorist_Listings;
use DirectoristGutenberg\App\Services\Context\DirectoristTemplateContextResolver;

$context_mode = ! empty( $attributes['context_mode'] ) ? sanitize_text_field( $attributes['context_mode'] ) : 'manual';
$directory_type_id = ! empty( $attributes['directory_type_id'] ) ? (int) $attributes['directory_type_id'] : 0;

if ( $context_mode === 'inferred' && $directory_type_id <= 0 ) {
    $context_resolver = directorist_gutenberg_singleton( DirectoristTemplateContextResolver::class );
    $template_context = $context_resolver->resolve_editor_context( get_post(), null );
    $directory_type_id = (int) $template_context->get_directory_type_id();
}

if ( $context_mode === 'inferred' && $directory_type_id <= 0 && function_exists( 'directorist_get_default_directory' ) ) {
    $directory_type_id = (int) directorist_get_default_directory();
}

if ( $context_mode === 'manual' && $directory_type_id <= 0 ) {
    ?>
    <div <?php echo get_block_wrapper_attributes( [ 'class' => 'directorist-gutenberg-listings-loop directorist-gutenberg-listings-loop-empty' ] ); ?>>
        <p><?php esc_html_e( 'Select a directory type in Listings Loop settings.', 'directorist-gutenberg' ); ?></p>
    </div>
    <?php
    return;
}

$listings = new Directorist_Listings();
$listings->directory_type_id = $directory_type_id;
$listings->view              = $attributes['default_view'];
$listings->columns           = round( 12 / (int) $attributes['listings_columns'] );
$listings->options['pagination_type'] = $attributes['pagination_type'];
$listings->atts['listings_columns']   = (int) $attributes['listings_columns'];

$instance_id = ! empty( $attributes['instance_id'] )
    ? sanitize_html_class( (string) $attributes['instance_id'] )
    : 'directorist-loop-' . wp_unique_id();

$listings->atts['instance_id'] = $instance_id;

$block_width_class    = directorist_gutenberg_get_block_width_class( $attributes );
$infinite_scroll_class = $listings->pagination_infinite_scroll_class();
$has_inner_content     = ! empty( trim( $content ) );
?>
<div <?php echo get_block_wrapper_attributes( [ 'class' => 'directorist-gutenberg-listings-loop ' . $block_width_class . ' ' . $infinite_scroll_class, 'data-instance-id' => $instance_id ] ); $listings->data_atts(); ?>>
    <?php if ( $has_inner_content ) : ?>
        <div class="directorist-gutenberg-listings-loop-inner">
            <?php directorist_gutenberg_echo( $content ); ?>
        </div>
    <?php else : ?>
        <div class="directorist-gutenberg-listings-loop-contents">
            <?php $listings->archive_view_template(); ?>
        </div>
    <?php endif; ?>
</div>
