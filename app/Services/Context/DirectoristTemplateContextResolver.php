<?php

namespace DirectoristGutenberg\App\Services\Context;

defined( "ABSPATH" ) || exit;

use DirectoristGutenberg\App\DTO\Context\DirectoristTemplateContextDTO;

class DirectoristTemplateContextResolver {
    /**
     * Resolve editor context from current post and screen.
     *
     * @param \WP_Post|null $post
     * @param \WP_Screen|null $screen
     * @return DirectoristTemplateContextDTO
     */
    public function resolve_editor_context( $post = null, $screen = null ): DirectoristTemplateContextDTO {
        $post_type     = $this->get_post_type( $post, $screen );
        $template_type = $this->get_template_type( $post );

        $template_kind = $this->resolve_template_kind( $post_type, $template_type, $post );
        $surface       = $this->resolve_surface( $post_type, $template_kind );
        $context_mode  = $this->resolve_context_mode( $surface, $template_kind );

        return ( new DirectoristTemplateContextDTO() )
            ->set_surface( $surface )
            ->set_template_kind( $template_kind )
            ->set_context_mode( $context_mode )
            ->set_directory_type_id( $this->resolve_directory_type_id( $post ) )
            ->set_listing_id( $this->resolve_listing_id( $post ) )
            ->set_view( $this->resolve_view() )
            ->set_instance_id( $this->resolve_instance_id( $post ) );
    }

    private function get_post_type( $post, $screen ): string {
        if ( ! empty( $screen->post_type ) ) {
            return (string) $screen->post_type;
        }

        if ( ! empty( $post->post_type ) ) {
            return (string) $post->post_type;
        }

        return '';
    }

    private function get_template_type( $post ): ?string {
        if ( empty( $post ) || empty( $post->ID ) ) {
            return null;
        }

        $template_type = get_post_meta( $post->ID, 'template_type', true );
        return ! empty( $template_type ) ? (string) $template_type : null;
    }

    private function resolve_surface( string $post_type, string $template_kind ): string {
        if ( in_array( $post_type, [ 'wp_template', 'wp_template_part' ], true ) ) {
            if ( in_array( $template_kind, [ 'archive', 'single' ], true ) ) {
                return 'site_template';
            }

            return 'custom_template';
        }

        if ( $post_type === 'page' ) {
            return 'page';
        }

        return 'page';
    }

    private function resolve_template_kind( string $post_type, ?string $template_type, $post ): string {
        if ( $post_type === 'wp_template' ) {
            $slug = ! empty( $post->post_name ) ? (string) $post->post_name : '';
            return $this->resolve_wp_template_kind_by_slug( $slug );
        }

        if ( ! empty( $template_type ) ) {
            if ( $template_type === 'listings-archive' ) {
                return 'archive';
            }

            if ( strpos( $template_type, 'single' ) !== false ) {
                return 'single';
            }
        }

        return 'custom';
    }

    private function resolve_wp_template_kind_by_slug( string $slug ): string {
        if ( strpos( $slug, 'single-at_biz_dir' ) === 0 ) {
            return 'single';
        }

        if ( strpos( $slug, 'taxonomy-at_biz_dir-' ) === 0 || strpos( $slug, 'archive-at_biz_dir' ) === 0 ) {
            return 'archive';
        }

        return 'custom';
    }

    private function resolve_context_mode( string $surface, string $template_kind ): string {
        if ( $surface === 'site_template' && in_array( $template_kind, [ 'archive', 'single' ], true ) ) {
            return 'inferred';
        }

        return 'manual';
    }

    private function resolve_directory_type_id( $post ): ?int {
        if ( ! empty( $post ) && ! empty( $post->ID ) ) {
            $directory_type_id = get_post_meta( $post->ID, 'directory_type_id', true );

            if ( is_numeric( $directory_type_id ) && (int) $directory_type_id > 0 ) {
                return (int) $directory_type_id;
            }
        }

        if ( ! empty( $_REQUEST['directory_type'] ) ) {
            $directory_type = sanitize_text_field( wp_unslash( $_REQUEST['directory_type'] ) );
            return $this->normalize_directory_type( $directory_type );
        }

        if ( function_exists( 'directorist_get_default_directory' ) ) {
            $default_directory = directorist_get_default_directory();
            if ( is_numeric( $default_directory ) && (int) $default_directory > 0 ) {
                return (int) $default_directory;
            }
        }

        return null;
    }

    private function normalize_directory_type( string $directory_type ): ?int {
        if ( is_numeric( $directory_type ) ) {
            $directory_id = (int) $directory_type;
            return $directory_id > 0 ? $directory_id : null;
        }

        if ( empty( $directory_type ) || ! defined( 'ATBDP_DIRECTORY_TYPE' ) ) {
            return null;
        }

        $directory_term = get_term_by( 'slug', $directory_type, ATBDP_DIRECTORY_TYPE );
        if ( empty( $directory_term ) || empty( $directory_term->term_id ) ) {
            return null;
        }

        return (int) $directory_term->term_id;
    }

    private function resolve_listing_id( $post ): ?int {
        if ( empty( $post ) || empty( $post->ID ) || ! defined( 'ATBDP_POST_TYPE' ) ) {
            return null;
        }

        if ( ! empty( $post->post_type ) && $post->post_type === ATBDP_POST_TYPE ) {
            return (int) $post->ID;
        }

        return null;
    }

    private function resolve_view(): ?string {
        if ( empty( $_REQUEST['view'] ) ) {
            return null;
        }

        $view = sanitize_text_field( wp_unslash( $_REQUEST['view'] ) );
        return in_array( $view, [ 'grid', 'list', 'map' ], true ) ? $view : null;
    }

    private function resolve_instance_id( $post ): string {
        if ( ! empty( $post ) && ! empty( $post->ID ) ) {
            return 'editor-post-' . (int) $post->ID;
        }

        return 'editor-' . wp_generate_uuid4();
    }
}
