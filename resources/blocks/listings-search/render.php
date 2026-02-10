<?php

defined( 'ABSPATH' ) || exit;

use Directorist\Directorist_Listings;

$listings = new Directorist_Listings();

// Get block width class
$block_width_class = directorist_gutenberg_get_block_width_class( $attributes );
?>
<div <?php echo get_block_wrapper_attributes(['class' => $block_width_class]); $listings->data_atts() ?>>
    <div class="directorist-gutenberg-listings-archive-search-nav">
        <?php $listings->directory_type_nav_template(); ?>
    </div>

    <div class="directorist-gutenberg-listings-archive-search-form">
        <?php
            $listings->basic_search_form_template();
        ?>
    </div>
</div>
