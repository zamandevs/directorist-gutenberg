<?php

namespace DirectoristGutenberg\App\Providers;

defined( "ABSPATH" ) || exit;

use DirectoristGutenberg\WpMVC\Contracts\Provider;
use WP_Block_Editor_Context;
use DirectoristGutenberg\App\Repositories\TemplateRepository;
use DirectoristGutenberg\App\DTO\TemplateReadDTO;
use DirectoristGutenberg\App\Services\Context\DirectoristTemplateContextResolver;

class BlockServiceProvider implements Provider {
    public function boot() {
        add_action( 'init', [ $this, 'register_blocks' ] );
        add_filter( 'block_categories_all', [ $this, 'register_block_categories' ], 10, 2 );
        add_action( 'enqueue_block_editor_assets', [ $this, 'localize_block_editor_scripts' ] );
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
            'template_context'  => $template_context->to_array(),
            'all_templates_url' => admin_url( 'edit.php?post_type=at_biz_dir&page=directorist-template-builder' ),
            'wax_intelligent'   => [
                'api_base_url' => directorist_gutenberg_config( 'wax-intelligent.api_base_url' ),
            ],
            'submission_form_fields' => ! empty( $directory_type_id ) ? get_term_meta( $directory_type_id, "submission_form_fields", true ) : null,
            'template_links'         => $template_links,
        ];

        // Localize the script
        wp_localize_script(
            $script_handle,
            'directorist_gutenberg_block_data',
            $localized_data
        );
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
}
