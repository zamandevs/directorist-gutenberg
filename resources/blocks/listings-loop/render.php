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
$before_loop_markup    = '';
$card_template_block   = null;

if ( $has_inner_content ) {
    $parsed_inner_blocks = parse_blocks( $content );
    $utility_block_names = [
        'directorist-gutenberg/listings-header',
        'directorist-gutenberg/listings-search',
        'directorist-gutenberg/listings-filters',
        'directorist-gutenberg/listings-archive-header',
        'directorist-gutenberg/listings-archive-search',
        'directorist-gutenberg/listings-archive-filters',
    ];

    foreach ( $parsed_inner_blocks as $inner_block ) {
        $block_name = ! empty( $inner_block['blockName'] ) ? $inner_block['blockName'] : '';

        if ( $block_name === 'directorist-gutenberg/listing-card-template' ) {
            $card_template_block = $inner_block;
            continue;
        }

        if ( in_array( $block_name, $utility_block_names, true ) ) {
            $before_loop_markup .= render_block( $inner_block );
            continue;
        }

        // Keep any additional helper/layout blocks visible above the loop.
        $before_loop_markup .= render_block( $inner_block );
    }
}

$inject_directory_type_into_card_blocks = static function( array $block, int $resolved_directory_type_id ) use ( &$inject_directory_type_into_card_blocks ) {
    $block_name = ! empty( $block['blockName'] ) ? $block['blockName'] : '';
    $is_listing_card_child = strpos( $block_name, 'directorist-gutenberg/listing-card-' ) === 0
        && $block_name !== 'directorist-gutenberg/listing-card-template';

    if ( $is_listing_card_child ) {
        if ( empty( $block['attrs'] ) || ! is_array( $block['attrs'] ) ) {
            $block['attrs'] = [];
        }

        if ( empty( $block['attrs']['directory_type_id'] ) ) {
            $block['attrs']['directory_type_id'] = $resolved_directory_type_id;
        }
    }

    if ( ! empty( $block['innerBlocks'] ) ) {
        foreach ( $block['innerBlocks'] as $index => $inner_block ) {
            $block['innerBlocks'][ $index ] = $inject_directory_type_into_card_blocks( $inner_block, $resolved_directory_type_id );
        }
    }

    return $block;
};

$prepared_card_template_block = null;
if ( ! empty( $card_template_block ) ) {
    $prepared_card_template_block = $inject_directory_type_into_card_blocks( $card_template_block, $directory_type_id );
}

$should_render_custom_item_template = null;
$render_custom_item_template = null;

if ( ! empty( $prepared_card_template_block ) ) {
    $should_render_custom_item_template = static function( $should_render, $listings_controller, array $args ) use ( $instance_id ) {
        $current_instance_id = ! empty( $listings_controller->atts['instance_id'] ) ? sanitize_html_class( (string) $listings_controller->atts['instance_id'] ) : '';
        if ( $current_instance_id !== $instance_id ) {
            return $should_render;
        }

        return true;
    };

    $render_custom_item_template = static function( $listings_controller, array $args ) use ( $instance_id, $prepared_card_template_block ) {
        $current_instance_id = ! empty( $listings_controller->atts['instance_id'] ) ? sanitize_html_class( (string) $listings_controller->atts['instance_id'] ) : '';
        if ( $current_instance_id !== $instance_id ) {
            return;
        }

        directorist_gutenberg_echo( render_block( $prepared_card_template_block ) );
    };

    add_filter( 'directorist_should_render_listings_custom_archive_item_template', $should_render_custom_item_template, 20, 3 );
    add_action( 'directorist_render_listings_custom_archive_item_template', $render_custom_item_template, 20, 2 );
}
?>
<div <?php echo get_block_wrapper_attributes( [ 'class' => 'directorist-gutenberg-listings-loop ' . $block_width_class . ' ' . $infinite_scroll_class, 'data-instance-id' => $instance_id ] ); $listings->data_atts(); ?>>
    <?php if ( ! empty( $before_loop_markup ) ) : ?>
        <div class="directorist-gutenberg-listings-loop-inner">
            <?php directorist_gutenberg_echo( $before_loop_markup ); ?>
        </div>
    <?php endif; ?>

    <div class="directorist-gutenberg-listings-loop-contents">
        <?php $listings->archive_view_template(); ?>
    </div>
</div>
<?php
if ( ! empty( $prepared_card_template_block ) ) {
    remove_filter( 'directorist_should_render_listings_custom_archive_item_template', $should_render_custom_item_template, 20 );
    remove_action( 'directorist_render_listings_custom_archive_item_template', $render_custom_item_template, 20 );
}
?>
