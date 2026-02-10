<?php

defined( 'ABSPATH' ) || exit;

$block_width_class = directorist_gutenberg_get_block_width_class( $attributes );
?>
<div <?php echo get_block_wrapper_attributes( [ 'class' => 'directorist-gutenberg-single-listing-template ' . $block_width_class ] ); ?>>
    <?php directorist_gutenberg_echo( $content ); ?>
</div>
