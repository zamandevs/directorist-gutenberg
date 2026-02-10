<?php

namespace DirectoristGutenberg\App\Providers;

defined( "ABSPATH" ) || exit;

use DirectoristGutenberg\WpMVC\Contracts\Provider;

class BlockTemplateServiceProvider implements Provider {
    public function boot() {
        add_filter( 'directorist_listings_deferred_props', [ $this, 'add_deferred_props' ], 10, 1 );
        add_action( 'directorist_after_init_listings_shortcode', [ $this, 'maybe_set_listing_item_template_id' ], 10, 1 );
        add_filter( 'pre_get_block_file_template', [ $this, 'maybe_resolve_directory_single_template' ], 20, 3 );
        add_action( 'save_post_wp_template', [ $this, 'sync_directory_single_template_meta' ], 10, 3 );
        
        // Render Listing Archive Template
        add_filter( 'directorist_should_render_listings_custom_archive_template', [ $this, 'should_render_listings_custom_archive_template' ], 10, 2 );
        add_action( 'directorist_render_listings_custom_archive_template', [ $this, 'render_listings_custom_archive_template' ], 10, 1 );
        
        // Render Listing Archive Item Template
        add_filter( 'directorist_should_render_listings_custom_archive_item_template', [ $this, 'should_render_listings_custom_archive_item_template' ], 10, 3 );
        add_action( 'directorist_render_listings_custom_archive_item_template', [ $this, 'render_listings_custom_archive_item_template' ], 10, 2 );

        // Listings Archive Scripts
        add_action( 'directorist_before_load_listings_archive', [ $this, 'load_listings_archive_scripts' ], 10 );
    }

    public function load_listings_archive_scripts() {
        $asset_path = directorist_gutenberg_dir( 'assets/build/js/blocks-frontend.asset.php' );
        $asset      = file_exists( $asset_path ) ? include $asset_path : null;
        $deps       = is_array( $asset ) && isset( $asset['dependencies'] ) ? $asset['dependencies'] : [];
        $version    = is_array( $asset ) && isset( $asset['version'] ) ? $asset['version'] : directorist_gutenberg_version();

        if ( function_exists( 'wp_enqueue_script_module' ) ) {
            wp_enqueue_script_module(
                'directorist-gutenberg/blocks-frontend',
                directorist_gutenberg_url( 'assets/build/js/blocks-frontend.js' ),
                $deps,
                $version
            );
        } else {
            wp_enqueue_script( 'directorist-gutenberg/blocks-frontend' );
        }
        wp_enqueue_style( 'directorist-gutenberg/blocks-frontend', directorist_gutenberg_url( 'assets/build/css/blocks-frontend.css' ) );
    }

    public function add_deferred_props( array $deferred_props ): array {
        $deferred_props[] = 'gbt_archive_template_id';
        $deferred_props[] = 'gbt_archive_grid_item_template_id';
        $deferred_props[] = 'gbt_archive_list_item_template_id';
        
        return $deferred_props;
    }

    public function maybe_set_listing_item_template_id( $listings_controller ) {
        if ( empty( $listings_controller->current_listing_type ) ) {
            return;
        }

        $with_private = current_user_can( 'edit_post', $listings_controller->current_listing_type );
        $templates    = directorist_gutenberg_templates( $listings_controller->current_listing_type,  $with_private );

        foreach ( $templates as $template ) {
            if ( $template['template_type'] === 'listings-archive' ) {
                $listings_controller->gbt_archive_template_id = $template['id'];
                continue;
            }

            if ( $template['template_type'] === 'listings-archive-grid-view' ) {
                $listings_controller->gbt_archive_grid_item_template_id = $template['id'];
                continue;
            }

            if ( $template['template_type'] === 'listings-archive-list-view' ) {
                $listings_controller->gbt_archive_list_item_template_id = $template['id'];
                continue;
            }
        }
    }

    public function should_render_listings_custom_archive_template( $should_render, $listings_controller ) {
        if  ( $listings_controller->gbt_archive_template_id ) {
            return true;
        }

        return $should_render;
    }

    public function render_listings_custom_archive_template( $listings_controller ) {
        $template_id = $listings_controller->gbt_archive_template_id;

        directorist_gutenberg_render_view( 'listings-archive-template', [ 'template_id' => $template_id, 'listings_controller' => $listings_controller ] );
    }

    public function should_render_listings_custom_archive_item_template( $should_render, $listings_controller, array $args ) {
        if  ( $args['view_type'] === 'grid' && $listings_controller->gbt_archive_grid_item_template_id ) {
            return true;
        }

        if ( $args['view_type'] === 'list' && $listings_controller->gbt_archive_list_item_template_id ) {
            return true;
        }

        return $should_render;
    }

    public function render_listings_custom_archive_item_template( $listings_controller, array $args ) {
        $template_id = $args['view_type'] === 'grid' ? $listings_controller->gbt_archive_grid_item_template_id : $listings_controller->gbt_archive_list_item_template_id;

        directorist_gutenberg_render_view( 'listings-card-template', [ 'template_id' => $template_id ] );
    }

    /**
     * Resolve per-directory single listing templates from wp_template entities.
     *
     * This only overrides the generic single listing template request
     * (`single-at_biz_dir`) when a matching `directorist_directory_type_id`
     * template variation exists.
     *
     * @param \WP_Block_Template|null $template
     * @param string                  $id
     * @param string                  $template_type
     * @return \WP_Block_Template|null
     */
    public function maybe_resolve_directory_single_template( $template, string $id, string $template_type ) {
        if ( 'wp_template' !== $template_type ) {
            return $template;
        }

        if ( ! function_exists( 'get_block_template' ) ) {
            return $template;
        }

        [ $theme, $slug ] = $this->parse_block_template_identifier( $id );
        if ( empty( $theme ) || ! $this->is_single_listing_template_slug( $slug ) ) {
            return $template;
        }

        $directory_type_id = $this->resolve_current_listing_directory_type_id();
        if ( $directory_type_id <= 0 ) {
            return $template;
        }

        $directory_template = $this->get_directory_single_template_post( $directory_type_id, $slug );
        if ( ! $directory_template instanceof \WP_Post ) {
            return $template;
        }

        $resolved_template_id = $theme . '//' . $directory_template->post_name;
        if ( $resolved_template_id === $id ) {
            return $template;
        }

        remove_filter( 'pre_get_block_file_template', [ $this, 'maybe_resolve_directory_single_template' ], 20 );
        $resolved_template = get_block_template( $resolved_template_id, 'wp_template' );
        add_filter( 'pre_get_block_file_template', [ $this, 'maybe_resolve_directory_single_template' ], 20, 3 );

        return $resolved_template instanceof \WP_Block_Template ? $resolved_template : $template;
    }

    private function parse_block_template_identifier( string $id ): array {
        $parts = explode( '//', $id );
        if ( count( $parts ) !== 2 ) {
            return [ '', '' ];
        }

        return [
            sanitize_key( $parts[0] ),
            sanitize_title( $parts[1] ),
        ];
    }

    private function is_single_listing_template_slug( string $slug ): bool {
        if ( empty( $slug ) ) {
            return false;
        }

        return $slug === 'single-at_biz_dir' || strpos( $slug, 'single-at_biz_dir-' ) === 0;
    }

    private function resolve_current_listing_directory_type_id(): int {
        if ( defined( 'ATBDP_POST_TYPE' ) && is_singular( ATBDP_POST_TYPE ) ) {
            $listing_id = (int) get_queried_object_id();
            if ( $listing_id > 0 ) {
                $directory_type_id = (int) get_post_meta( $listing_id, '_directory_type', true );
                if ( $directory_type_id > 0 ) {
                    return $directory_type_id;
                }
            }
        }

        if ( class_exists( '\Directorist\Directorist_Listings' ) ) {
            $listings = new \Directorist\Directorist_Listings();
            $directory_type_id = (int) $listings->get_current_listing_type();
            if ( $directory_type_id > 0 ) {
                return $directory_type_id;
            }
        }

        if ( ! empty( $_REQUEST['directory_type'] ) ) {
            $requested_directory = sanitize_text_field( wp_unslash( $_REQUEST['directory_type'] ) );
            if ( is_numeric( $requested_directory ) ) {
                $directory_type_id = (int) $requested_directory;
                if ( $directory_type_id > 0 ) {
                    return $directory_type_id;
                }
            }

            if ( defined( 'ATBDP_DIRECTORY_TYPE' ) ) {
                $directory_term = get_term_by( 'slug', $requested_directory, ATBDP_DIRECTORY_TYPE );
                if ( ! empty( $directory_term->term_id ) ) {
                    return (int) $directory_term->term_id;
                }
            }
        }

        return 0;
    }

    private function get_directory_single_template_post( int $directory_type_id, string $requested_slug ): ?\WP_Post {
        $query = new \WP_Query(
            [
                'post_type'           => 'wp_template',
                'post_status'         => 'publish',
                'posts_per_page'      => 50,
                'orderby'             => 'modified',
                'order'               => 'DESC',
                'no_found_rows'       => true,
                'ignore_sticky_posts' => true,
                'tax_query'           => [
                    [
                        'taxonomy' => 'wp_theme',
                        'field'    => 'name',
                        'terms'    => get_stylesheet(),
                    ],
                ],
                'meta_query'          => [
                    [
                        'key'     => 'directorist_directory_type_id',
                        'value'   => $directory_type_id,
                        'compare' => '=',
                    ],
                ],
            ]
        );

        if ( empty( $query->posts ) ) {
            return null;
        }

        $matched = array_values(
            array_filter(
                $query->posts,
                function( $post ) {
                    return $post instanceof \WP_Post &&
                        $this->is_single_listing_template_slug( (string) $post->post_name );
                }
            )
        );

        if ( empty( $matched ) ) {
            return null;
        }

        foreach ( $matched as $post ) {
            if ( $post->post_name === $requested_slug ) {
                return $post;
            }
        }

        return $matched[0];
    }

    /**
     * Persist directory mapping meta for single listing wp_template variations.
     *
     * @param int      $post_id
     * @param \WP_Post $post
     * @param bool     $update
     * @return void
     */
    public function sync_directory_single_template_meta( int $post_id, \WP_Post $post, bool $update ): void {
        if ( wp_is_post_autosave( $post_id ) || wp_is_post_revision( $post_id ) ) {
            return;
        }

        if ( ! $this->is_single_listing_template_slug( (string) $post->post_name ) ) {
            return;
        }

        $directory_type_id = 0;
        $blocks = parse_blocks( (string) $post->post_content );

        foreach ( $blocks as $block ) {
            if ( empty( $block['blockName'] ) || $block['blockName'] !== 'directorist-gutenberg/single-listing-template' ) {
                continue;
            }

            $context_mode = ! empty( $block['attrs']['context_mode'] ) ? sanitize_text_field( (string) $block['attrs']['context_mode'] ) : 'inferred';
            if ( $context_mode !== 'manual' ) {
                continue;
            }

            $directory_type_id = ! empty( $block['attrs']['directory_type_id'] ) ? (int) $block['attrs']['directory_type_id'] : 0;
            break;
        }

        if ( $directory_type_id > 0 ) {
            update_post_meta( $post_id, 'directorist_directory_type_id', $directory_type_id );
            return;
        }

        delete_post_meta( $post_id, 'directorist_directory_type_id' );
    }
}
