<?php

namespace DirectoristGutenberg\App\Providers;

defined( "ABSPATH" ) || exit;

use DirectoristGutenberg\WpMVC\Contracts\Provider;
use WP_Block_Editor_Context;
use DirectoristGutenberg\App\Repositories\TemplateRepository;
use DirectoristGutenberg\App\DTO\TemplateReadDTO;
use DirectoristGutenberg\App\Services\Context\DirectoristTemplateContextResolver;

class BlockServiceProvider implements Provider {
    private array $editor_preview_post_stack = [];
    private array $editor_preview_listing_cache = [];

    public function boot() {
        add_action( 'init', [ $this, 'register_blocks' ] );
        add_filter( 'block_categories_all', [ $this, 'register_block_categories' ], 10, 2 );
        add_action( 'enqueue_block_editor_assets', [ $this, 'localize_block_editor_scripts' ] );
        add_filter( 'pre_render_block', [ $this, 'maybe_setup_listing_card_preview_context' ], 10, 3 );
        add_filter( 'render_block', [ $this, 'maybe_restore_listing_card_preview_context' ], 9, 2 );
        add_filter( 'render_block', [ $this, 'maybe_enqueue_frontend_assets' ], 10, 2 );
    }

    public function register_blocks() {
        foreach ( directorist_gutenberg_config( 'blocks' ) as $block_name => $block_data ) {
            $name = ltrim( $block_name, 'directorist-gutenberg' );

            wp_enqueue_block_style(
                $block_name, [
                    'handle' => 'directorist-gutenberg/blocks-frontend',
                    'src'    => directorist_gutenberg_url( 'assets/build/css/blocks-frontend.css' )
                ]
            );

            register_block_type( $block_data['dir'] . $name );

            add_action( 'wp_enqueue_scripts', function() use ( $block_name ) {
                // Check if we're on a page that uses listings
                if (
                    is_post_type_archive( 'at_biz_dir' ) ||
                    has_shortcode( get_post_field('post_content', get_the_ID()), 'directorist_all_listing' ) ||
                    has_shortcode( get_post_field('post_content', get_the_ID()), 'directorist_search_listing' ) ||
                    has_shortcode( get_post_field('post_content', get_the_ID()), 'directorist_search_result' )
                ) {
                    // Force enqueue the block's frontend styles
                    $style_handle = generate_block_asset_handle( $block_name, 'style' );
                    wp_enqueue_style( $style_handle );
                }
            } );
        }
    }

    public function localize_block_editor_scripts() {
        // Get current screen
        $screen = get_current_screen();

        if ( ! $screen ) {
            return;
        }

        $allowed_post_types = [
            directorist_gutenberg_post_type(),
            'page',
            'wp_template',
            'wp_template_part',
        ];

        if ( empty( $screen->post_type ) || ! in_array( $screen->post_type, $allowed_post_types, true ) ) {
            return;
        }

        // Get the first block to localize data for all blocks
        $blocks = directorist_gutenberg_config( 'blocks' );

        if ( empty( $blocks ) ) {
            return;
        }

        // Get the first block name to attach the localized data
        $first_block = array_key_first( $blocks );

        // Generate the editor script handle for the first block
        $script_handle = generate_block_asset_handle( $first_block, 'editorScript' );

        $post = get_post();
        if ( ! $post ) {
            return;
        }

        /**
         * @var DirectoristTemplateContextResolver
         */
        $context_resolver = directorist_gutenberg_singleton( DirectoristTemplateContextResolver::class );
        $template_context = $context_resolver->resolve_editor_context( $post, $screen );
        $directory_type_id = $template_context->get_directory_type_id();
        /**
         * @var TemplateRepository
         */
        $template_repository = directorist_gutenberg_singleton( TemplateRepository::class );

        $templates = [
            'items' => [],
        ];

        if ( directorist_gutenberg_post_type() === $screen->post_type ) {
            $templates = $template_repository->get(
                ( new TemplateReadDTO )
                    ->set_directory_type( $directory_type_id )
                    ->set_page( 1 )
                    ->set_per_page( 100 )
            );
        }

        $template_links = array_map( function( $template ) {
            return [
                'id'         => $template->ID,
                'title'      => $template->post_title,
                'is_current' => (int) $template->ID === (int) $post->ID,
                'status'     => $template->post_status,
                'url'        => get_edit_post_link( $template->ID, 'raw' ),
            ];
        }, $templates['items'] );

        // Prepare localized data
        $localized_data = [
            'template_type'     => $this->resolve_legacy_template_type( $post, $template_context->get_template_kind() ),
            'directory_type_id' => $directory_type_id,
            'directory_options' => $this->get_directory_options(),
            'template_context'  => $template_context->to_array(),
            'all_templates_url' => admin_url( 'edit.php?post_type=at_biz_dir&page=directorist-template-builder' ),
            'wax_intelligent'   => [
                'api_base_url' => directorist_gutenberg_config( 'wax-intelligent.api_base_url' ),
            ],
            'submission_form_fields'              => ! empty( $directory_type_id ) ? get_term_meta( $directory_type_id, "submission_form_fields", true ) : null,
            'submission_form_fields_by_directory' => $this->get_submission_form_fields_by_directory(),
            'template_links'                      => $template_links,
        ];

        // Localize the script
        wp_localize_script(
            $script_handle,
            'directorist_gutenberg_block_data',
            $localized_data
        );
    }

    private function get_directory_options(): array {
        $options = [
            [
                'label' => __( 'Select Directory Type', 'directorist-gutenberg' ),
                'value' => 0,
            ],
        ];

        if ( ! function_exists( 'directorist_get_directories' ) ) {
            return $options;
        }

        $directories = directorist_get_directories( [ 'hide_empty' => false ] );
        if ( is_wp_error( $directories ) || empty( $directories ) ) {
            return $options;
        }

        foreach ( $directories as $directory ) {
            $options[] = [
                'label' => $directory->name,
                'value' => (int) $directory->term_id,
            ];
        }

        return $options;
    }

    private function get_submission_form_fields_by_directory(): array {
        if ( ! function_exists( 'directorist_get_directories' ) ) {
            return [];
        }

        $directories = directorist_get_directories( [ 'hide_empty' => false ] );
        if ( is_wp_error( $directories ) || empty( $directories ) ) {
            return [];
        }

        $submission_fields_map = [];

        foreach ( $directories as $directory ) {
            $directory_type_id = isset( $directory->term_id ) ? (int) $directory->term_id : 0;

            if ( $directory_type_id <= 0 ) {
                continue;
            }

            $submission_fields_map[ $directory_type_id ] = get_term_meta( $directory_type_id, "submission_form_fields", true );
        }

        return $submission_fields_map;
    }

    private function resolve_legacy_template_type( \WP_Post $post, string $template_kind ): string {
        $template_type = get_post_meta( $post->ID, "template_type", true );

        if ( ! empty( $template_type ) ) {
            return (string) $template_type;
        }

        if ( $template_kind === 'archive' ) {
            return 'listings-archive';
        }

        if ( $template_kind === 'single' ) {
            return 'single-listing';
        }

        return '';
    }

    public function register_block_categories( array $categories, WP_Block_Editor_Context $block_editor_context ) {
        $post_type = '';
        if ( ! empty( $block_editor_context->post ) && ! empty( $block_editor_context->post->post_type ) ) {
            $post_type = $block_editor_context->post->post_type;
        }

        $allowed_post_types = [
            directorist_gutenberg_post_type(),
            'page',
            'wp_template',
            'wp_template_part',
        ];

        if ( $post_type && ! in_array( $post_type, $allowed_post_types, true ) ) {
            return $categories;
        }

        $custom_categories = [
            [
                'slug'  => 'directorist-listings-archive',
                'title' => __( 'Directorist Listings Archive', 'directorist-gutenberg' ),
            ],
            [
                'slug'  => 'directorist-listing-card-preset-fields',
                'title' => __( 'Directorist Preset Fields', 'directorist-gutenberg' ),
            ],
            [
                'slug'  => 'directorist-listing-card-custom-fields',
                'title' => __( 'Directorist Custom Fields', 'directorist-gutenberg' ),
            ],
        ];

        return array_merge( $custom_categories, $categories );
    }

    /**
     * Ensure frontend assets load whenever a Directorist block is rendered (pages, templates, or site editor).
     *
     * @param string $block_content
     * @param array  $block
     * @return string
     */
    public function maybe_enqueue_frontend_assets( string $block_content, array $block ): string {
        if ( is_admin() ) {
            return $block_content;
        }

        if ( empty( $block['blockName'] ) || strpos( $block['blockName'], 'directorist-gutenberg/' ) !== 0 ) {
            return $block_content;
        }

        static $enqueued = false;

        if ( ! $enqueued ) {
            // Blocks were registered on init; their handles exist here. Enqueue the shared frontend bundle.
            if ( function_exists( 'wp_enqueue_script_module' ) ) {
                wp_enqueue_script_module( 'directorist-gutenberg/blocks-frontend' );
            } else {
                wp_enqueue_script( 'directorist-gutenberg/blocks-frontend' );
            }

            wp_enqueue_style( 'directorist-gutenberg/blocks-frontend', directorist_gutenberg_url( 'assets/build/css/blocks-frontend.css' ) );
            $enqueued = true;
        }

        return $block_content;
    }

    /**
     * Set a preview listing post as global context for listing-card field blocks during editor SSR requests.
     *
     * @param mixed $pre_render
     * @param array $parsed_block
     * @param mixed $parent_block
     * @return mixed
     */
    public function maybe_setup_listing_card_preview_context( $pre_render, array $parsed_block, $parent_block ) {
        if ( ! $this->is_editor_listing_card_preview_request( $parsed_block ) ) {
            return $pre_render;
        }

        $preview_listing = $this->resolve_preview_listing_post( $parsed_block, $parent_block );
        if ( ! $preview_listing instanceof \WP_Post ) {
            return $pre_render;
        }

        $current_post = get_post();
        $this->editor_preview_post_stack[] = ( $current_post instanceof \WP_Post ) ? (int) $current_post->ID : 0;

        $GLOBALS['post'] = $preview_listing;
        setup_postdata( $preview_listing );

        return $pre_render;
    }

    /**
     * Restore editor preview post context after rendering listing-card field blocks.
     *
     * @param string $block_content
     * @param array  $block
     * @return string
     */
    public function maybe_restore_listing_card_preview_context( string $block_content, array $block ): string {
        if ( ! $this->is_editor_ssr_request() ) {
            return $block_content;
        }

        $block_name = ! empty( $block['blockName'] ) ? (string) $block['blockName'] : '';
        if ( ! $this->is_listing_card_field_block_name( $block_name ) ) {
            return $block_content;
        }

        if ( empty( $this->editor_preview_post_stack ) ) {
            return $block_content;
        }

        $previous_post_id = (int) array_pop( $this->editor_preview_post_stack );
        if ( $previous_post_id > 0 ) {
            $previous_post = get_post( $previous_post_id );
            if ( $previous_post instanceof \WP_Post ) {
                $GLOBALS['post'] = $previous_post;
                setup_postdata( $previous_post );
                return $block_content;
            }
        }

        wp_reset_postdata();
        return $block_content;
    }

    private function is_editor_listing_card_preview_request( array $parsed_block ): bool {
        if ( ! $this->is_editor_ssr_request() ) {
            return false;
        }

        $block_name = ! empty( $parsed_block['blockName'] ) ? (string) $parsed_block['blockName'] : '';
        return $this->is_listing_card_field_block_name( $block_name );
    }

    private function is_editor_ssr_request(): bool {
        if ( ! defined( 'REST_REQUEST' ) || ! REST_REQUEST ) {
            return false;
        }

        $context = ! empty( $_REQUEST['context'] )
            ? sanitize_text_field( wp_unslash( $_REQUEST['context'] ) )
            : '';

        return $context === 'edit';
    }

    private function is_listing_card_field_block_name( string $block_name ): bool {
        if ( strpos( $block_name, 'directorist-gutenberg/listing-card-' ) !== 0 ) {
            return false;
        }

        return ! in_array(
            $block_name,
            [
                'directorist-gutenberg/listing-card-template',
                'directorist-gutenberg/listing-card-thumbnail',
            ],
            true
        );
    }

    private function resolve_preview_listing_post( array $parsed_block, $parent_block ): ?\WP_Post {
        $directory_type_id = $this->resolve_preview_directory_type_id( $parsed_block, $parent_block );
        $cache_key = $directory_type_id > 0 ? $directory_type_id : 0;

        if ( array_key_exists( $cache_key, $this->editor_preview_listing_cache ) ) {
            $cached_listing_id = (int) $this->editor_preview_listing_cache[ $cache_key ];
            if ( $cached_listing_id <= 0 ) {
                return null;
            }

            $cached_post = get_post( $cached_listing_id );
            return ( $cached_post instanceof \WP_Post ) ? $cached_post : null;
        }

        $listing_post_type = defined( 'ATBDP_POST_TYPE' ) ? ATBDP_POST_TYPE : 'at_biz_dir';
        $query_args = [
            'post_type'           => $listing_post_type,
            'post_status'         => 'publish',
            'posts_per_page'      => 1,
            'orderby'             => 'date',
            'order'               => 'DESC',
            'fields'              => 'ids',
            'ignore_sticky_posts' => true,
            'no_found_rows'       => true,
        ];

        if ( $directory_type_id > 0 ) {
            $query_args['meta_query'] = [
                [
                    'key'     => '_directory_type',
                    'value'   => (string) $directory_type_id,
                    'compare' => '=',
                ],
            ];
        }

        $query = new \WP_Query( $query_args );
        $listing_id = ! empty( $query->posts ) ? (int) $query->posts[0] : 0;
        wp_reset_postdata();

        if ( $listing_id <= 0 && $directory_type_id > 0 ) {
            unset( $query_args['meta_query'] );
            $fallback_query = new \WP_Query( $query_args );
            $listing_id = ! empty( $fallback_query->posts ) ? (int) $fallback_query->posts[0] : 0;
            wp_reset_postdata();
        }

        $this->editor_preview_listing_cache[ $cache_key ] = $listing_id;

        if ( $listing_id <= 0 ) {
            return null;
        }

        $listing_post = get_post( $listing_id );
        return ( $listing_post instanceof \WP_Post ) ? $listing_post : null;
    }

    private function resolve_preview_directory_type_id( array $parsed_block, $parent_block ): int {
        if ( ! empty( $_REQUEST['directory_type'] ) ) {
            $requested_directory = absint( wp_unslash( $_REQUEST['directory_type'] ) );
            if ( $requested_directory > 0 ) {
                return $requested_directory;
            }
        }

        if ( ! empty( $parsed_block['attrs']['directory_type_id'] ) ) {
            $attribute_directory = (int) $parsed_block['attrs']['directory_type_id'];
            if ( $attribute_directory > 0 ) {
                return $attribute_directory;
            }
        }

        if (
            is_object( $parent_block ) &&
            ! empty( $parent_block->context['directorist-gutenberg/directoryTypeId'] )
        ) {
            $context_directory = (int) $parent_block->context['directorist-gutenberg/directoryTypeId'];
            if ( $context_directory > 0 ) {
                return $context_directory;
            }
        }

        $post_id = ! empty( $_REQUEST['post_id'] ) ? absint( wp_unslash( $_REQUEST['post_id'] ) ) : 0;
        $post = $post_id > 0 ? get_post( $post_id ) : get_post();

        /**
         * @var DirectoristTemplateContextResolver
         */
        $context_resolver = directorist_gutenberg_singleton( DirectoristTemplateContextResolver::class );
        $template_context = $context_resolver->resolve_editor_context( $post, null );
        $resolved_directory = (int) $template_context->get_directory_type_id();
        if ( $resolved_directory > 0 ) {
            return $resolved_directory;
        }

        if ( function_exists( 'directorist_get_default_directory' ) ) {
            $default_directory = (int) directorist_get_default_directory();
            if ( $default_directory > 0 ) {
                return $default_directory;
            }
        }

        return 0;
    }
}
