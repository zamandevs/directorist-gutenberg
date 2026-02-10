<?php

defined( 'ABSPATH' ) || exit;

$view              = ! empty( $attributes['view'] ) ? sanitize_text_field( $attributes['view'] ) : 'grid';
$block_width_class = directorist_gutenberg_get_block_width_class( $attributes );
?>
<div <?php echo get_block_wrapper_attributes( [ 'class' => 'directorist-gutenberg-listing-card-template ' . $block_width_class, 'data-view' => $view ] ); ?>>
    <?php directorist_gutenberg_echo( $content ); ?>
</div>
