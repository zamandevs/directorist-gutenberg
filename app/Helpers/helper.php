<?php

defined( 'ABSPATH' ) || exit;

use DirectoristGutenberg\WpMVC\App;
use DirectoristGutenberg\DI\Container;
use DirectoristGutenberg\WpMVC\View\View;

function directorist_gutenberg():App {
    return App::$instance;
}

function directorist_gutenberg_config( string $config_key ) {
    return directorist_gutenberg()::$config->get( $config_key );
}

function directorist_gutenberg_app_config( string $config_key ) {
    return directorist_gutenberg_config( "app.{$config_key}" );
}

function directorist_gutenberg_version() {
    return directorist_gutenberg_app_config( 'version' );
}

function directorist_gutenberg_container():Container {
    return directorist_gutenberg()::$container;
}

function directorist_gutenberg_singleton( string $class ) {
    return directorist_gutenberg_container()->get( $class );
}

function directorist_gutenberg_url( string $url = '' ) {
    return directorist_gutenberg()->get_url( $url );
}

function directorist_gutenberg_dir( string $dir = '' ) {
    return directorist_gutenberg()->get_dir( $dir );
}

function directorist_gutenberg_post_type() {
    return directorist_gutenberg_app_config( 'post_type' );
}

function directorist_gutenberg_render_view( string $view, array $data = [] ) {
    View::render( $view, $data );
}

function directorist_gutenberg_get_view( string $view, array $data = [] ) {
    return View::get( $view, $data );
}

function directorist_gutenberg_templates( int $directory_type_id, bool $with_private = false ) {
    $query = new \WP_Query(
        [
            'post_type'      => directorist_gutenberg_post_type(),
            'post_status'    => $with_private ? ['publish', 'private'] : ['publish'],
            'posts_per_page' => -1,
            'meta_query'     => [
                'relation' => 'AND',
                [
                    'key'   => 'directory_type_id',
                    'value' => $directory_type_id,
                ],
            ],
        ]
    );

    $templates = [];

    foreach ( $query->posts as $post ) {
        $templates[] = [
            'id'            => $post->ID,
            'title'         => $post->post_title,
            'status'        => $post->post_status,
            'template_type' => get_post_meta( $post->ID, 'template_type', true ),
        ];
    }

    return $templates;
}

function directorist_gutenberg_get_icon( string $icon ) {
    $svg = directorist_gutenberg_dir( "resources/svg/$icon" );

    if ( ! is_file( $svg ) ) {
        return '';
    }

    //phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped, WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
    return file_get_contents( $svg );
}

function directorist_gutenberg_get_block_post_meta( string $meta_key, int $post_id ) {
    if ( empty( $meta_key ) ) {
        return null;
    }

    $meta_value = get_post_meta( $post_id, $meta_key, true );
    
    if ( empty( $meta_value ) ) {
        $meta_value = get_post_meta( $post_id, '_' . $meta_key, true );
    }

    if ( empty( $meta_value ) ) {
        return null;
    }

    return $meta_value;
}

function directorist_gutenberg_get_directory_submission_fields( int $directory_type_id ) {
    if ( empty( $directory_type_id ) ) {
        return null;
    }

    $fields = get_term_meta( $directory_type_id, "submission_form_fields", true );

    if ( empty( $fields ) ) {
        return null;
    }

    return $fields['fields'];
}

function directorist_gutenberg_get_directory_submission_field( int $directory_type_id, string $field_type, string $field_name_or_key ) {
    $fields = directorist_gutenberg_get_directory_submission_fields( $directory_type_id );

    if ( empty( $fields ) ) {
        return null;
    }

    foreach ( $fields as $field ) {
        if ( $field['widget_group'] !== $field_type ) {
            continue;
        }

        if ( $field_type === 'preset' && $field['widget_name'] === $field_name_or_key ) {
            return $field;
        }

        if ( $field_type === 'custom' && $field['field_key'] === $field_name_or_key ) {
            return $field;
        }
    }

    return null;
}

function directorist_gutenberg_get_directory_submission_field_option( int $directory_type_id, string $field_type, string $field_name_or_key, ?string $field_value = null ) {
    if ( empty( $field_value ) ) {
        return null;
    }

    $field = directorist_gutenberg_get_directory_submission_field( $directory_type_id, $field_type, $field_name_or_key );

    if ( empty( $field ) ) {
        return null;
    }

    if ( empty( $field['options'] ) ) {
        return null;
    }

    foreach ( $field['options'] as $option ) {
        if ( strval( $option['option_value'] ) === $field_value ) {
            return $option;
        }
    }

    return null;
}

function directorist_gutenberg_get_directory_submission_field_options( int $directory_type_id, string $field_type, string $field_name_or_key, ?array $field_values ) {
	if ( empty( $field_values ) ) {
		return null;
	}

	$field = directorist_gutenberg_get_directory_submission_field( $directory_type_id, $field_type, $field_name_or_key );

	if ( empty( $field ) ) {
		return null;
	}

	if ( empty( $field['options'] ) ) {
		return null;
	}

	$selected_options = [];

	foreach ( $field['options'] as $option ) {
		if ( in_array( strval( $option['option_value'] ), $field_values ) ) {
			$selected_options[] = $option;
		}
	}

	return $selected_options;
}

/**
 * Build icon style string from block attributes
 *
 * @param array $attributes Block attributes array
 * @param string $color_key Attribute key for icon color (default: 'icon_color')
 * @param string $size_key Attribute key for icon size (default: 'icon_size')
 * @return string CSS custom properties string for icon styles
 */
function directorist_gutenberg_build_icon_style( array $attributes, string $color_key = 'icon_color', string $size_key = 'icon_size' ): string {
	$icon_style_parts = [];

	if ( ! empty( $attributes[ $color_key ] ) ) {
		$icon_style_parts[] = '--directorist-gutenberg-icon-color: ' . esc_attr( $attributes[ $color_key ] );
	}

	if ( ! empty( $attributes[ $size_key ] ) ) {
		$icon_style_parts[] = '--directorist-gutenberg-icon-size: ' . esc_attr( $attributes[ $size_key ] );
	}

	return ! empty( $icon_style_parts ) ? implode( '; ', $icon_style_parts ) . ';' : '';
}

/**
 * Normalize supported block width values to class-safe tokens.
 *
 * @param mixed  $width    Raw width value.
 * @param string $fallback Fallback width token.
 * @return string
 */
function directorist_gutenberg_normalize_block_width_value( $width, string $fallback = '100' ): string {
	$normalized = '';

	if ( $width !== null && $width !== '' ) {
		$normalized = strtolower( trim( (string) $width ) );
	}

	$map = [
		'100'     => '100',
		'75'      => '75',
		'67'      => '67',
		'66.67'   => '67',
		'66.6667' => '67',
		'50'      => '50',
		'33'      => '33',
		'33.33'   => '33',
		'33.3333' => '33',
		'25'      => '25',
		'inline'  => 'inline',
	];

	if ( isset( $map[ $normalized ] ) ) {
		return $map[ $normalized ];
	}

	if ( $fallback === '' ) {
		return '';
	}

	return directorist_gutenberg_normalize_block_width_value( $fallback, '' ) ?: '100';
}

/**
 * Resolve responsive block width values from block attributes.
 *
 * @param array  $attributes Block attributes array.
 * @param string $width_key Width attribute key.
 * @param string $responsive_width_key Responsive width attribute key.
 * @return array{desktop:string,tablet:string,mobile:string}
 */
function directorist_gutenberg_get_responsive_block_width_values(
	array $attributes,
	string $width_key = 'block_width',
	string $responsive_width_key = 'block_width_responsive'
): array {
	$desktop_width = directorist_gutenberg_normalize_block_width_value(
		$attributes[ $width_key ] ?? '',
		'100'
	);

	$responsive_widths = [];
	if ( ! empty( $attributes[ $responsive_width_key ] ) ) {
		$responsive_widths = $attributes[ $responsive_width_key ];
		if ( is_string( $responsive_widths ) ) {
			$decoded_widths = json_decode( $responsive_widths, true );
			$responsive_widths = is_array( $decoded_widths ) ? $decoded_widths : [];
		}
	}

	if ( ! is_array( $responsive_widths ) ) {
		$responsive_widths = [];
	}

	return [
		'desktop' => directorist_gutenberg_normalize_block_width_value(
			$responsive_widths['desktop'] ?? '',
			$desktop_width
		),
		'tablet' => directorist_gutenberg_normalize_block_width_value(
			$responsive_widths['tablet'] ?? '',
			''
		),
		'mobile' => directorist_gutenberg_normalize_block_width_value(
			$responsive_widths['mobile'] ?? '',
			''
		),
	];
}

/**
 * Get block width class name from block attributes
 *
 * @param array $attributes Block attributes array
 * @param string $width_key Attribute key for block width (default: 'block_width')
 * @return string Block width class name (e.g., 'directorist-gutenberg-block-width-100')
 */
function directorist_gutenberg_get_block_width_class( array $attributes, string $width_key = 'block_width' ): string {
	$responsive_width_values = directorist_gutenberg_get_responsive_block_width_values(
		$attributes,
		$width_key,
		$width_key . '_responsive'
	);

	$class_names = [
		'directorist-gutenberg-block-width-' . esc_attr( $responsive_width_values['desktop'] ),
	];

	if ( ! empty( $responsive_width_values['tablet'] ) ) {
		$class_names[] = 'directorist-gutenberg-block-width-tablet-' . esc_attr( $responsive_width_values['tablet'] );
	}

	if ( ! empty( $responsive_width_values['mobile'] ) ) {
		$class_names[] = 'directorist-gutenberg-block-width-mobile-' . esc_attr( $responsive_width_values['mobile'] );
	}

	return implode( ' ', array_filter( array_unique( $class_names ) ) );
}

/**
 * Get text alignment class name from block attributes
 *
 * @param array $attributes Block attributes array
 * @param string $align_key Attribute key for text alignment (default: 'textAlign')
 * @return string Text alignment class name (e.g., 'has-text-align-center') or empty string if not set
 */
function directorist_gutenberg_get_text_align_class( array $attributes, string $align_key = 'textAlign' ): string {
	if ( empty( $attributes[ $align_key ] ) ) {
		return '';
	}
	return 'has-text-align-' . esc_attr( $attributes[ $align_key ] );
}

function directorist_gutenberg_echo( string $content ) {
    // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	echo $content;
}
