<?php
/**
 * Plugin Name: WP-2026 Slider
 * Description: Headless Slider — Custom Post Type mit REST API für WP-2026 | V7.8
 * Version: 1.0.0
 * Author: Peter Päffgen
 */

defined('ABSPATH') || exit;

add_action('init', function () {
    register_post_type('pit_slide', [
        'labels' => [
            'name'          => 'Slides',
            'singular_name' => 'Slide',
            'add_new_item'  => 'Neuer Slide',
            'edit_item'     => 'Slide bearbeiten',
        ],
        'public'             => false,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_rest'       => true,
        'rest_base'    => 'slides',
        'supports'     => ['title', 'thumbnail', 'page-attributes'],
        'menu_icon'    => 'dashicons-images-alt2',
        'menu_position'=> 25,
    ]);

    // Custom meta fields
    $fields = [
        'pit_subtitle'    => 'Untertitel / Beschreibung',
        'pit_button_text' => 'Button-Text',
        'pit_button_link' => 'Button-Link (URL)',
        'pit_image_url'   => 'Bild-URL (alternativ zu Featured Image)',
    ];

    foreach ($fields as $key => $label) {
        register_post_meta('pit_slide', $key, [
            'show_in_rest'  => true,
            'single'        => true,
            'type'          => 'string',
            'auth_callback' => fn() => current_user_can('edit_posts'),
        ]);
    }
});

// Meta Box im WP Admin (Fallback, falls jemand doch WP-Admin nutzt)
add_action('add_meta_boxes', function () {
    add_meta_box(
        'pit_slide_meta',
        'Slide-Details',
        function ($post) {
            $fields = [
                'pit_subtitle'    => 'Untertitel',
                'pit_button_text' => 'Button-Text',
                'pit_button_link' => 'Button-Link',
                'pit_image_url'   => 'Bild-URL',
            ];
            wp_nonce_field('pit_slide_save', 'pit_slide_nonce');
            echo '<table style="width:100%;border-collapse:collapse">';
            foreach ($fields as $key => $label) {
                $val = esc_attr(get_post_meta($post->ID, $key, true));
                echo "<tr><th style='text-align:left;padding:6px 0;width:120px'>{$label}</th>";
                echo "<td><input type='text' name='{$key}' value='{$val}' style='width:100%' /></td></tr>";
            }
            echo '</table>';
        },
        'pit_slide',
        'normal',
        'high'
    );
});

add_action('save_post_pit_slide', function ($post_id) {
    if (!isset($_POST['pit_slide_nonce']) || !wp_verify_nonce($_POST['pit_slide_nonce'], 'pit_slide_save')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    foreach (['pit_subtitle', 'pit_button_text', 'pit_button_link', 'pit_image_url'] as $key) {
        if (isset($_POST[$key])) {
            update_post_meta($post_id, $key, sanitize_text_field($_POST[$key]));
        }
    }
});

// Design-Einstellungen als WP-Optionen registrieren
add_action('init', function () {
    $design_options = [
        'pit_primary_color'  => ['default' => '#3b82f6', 'sanitize' => 'sanitize_hex_color'],
        'pit_accent_color'   => ['default' => '#8b5cf6', 'sanitize' => 'sanitize_hex_color'],
        'pit_font_family'    => ['default' => 'Inter',   'sanitize' => 'sanitize_text_field'],
        'pit_border_radius'  => ['default' => '8',       'sanitize' => 'absint'],
        'pit_header_style'   => ['default' => 'transparent', 'sanitize' => 'sanitize_text_field'],
    ];
    foreach ($design_options as $key => $cfg) {
        register_setting('general', $key, [
            'type'              => 'string',
            'default'           => $cfg['default'],
            'show_in_rest'      => true,
            'sanitize_callback' => $cfg['sanitize'],
        ]);
    }
});

// REST API: Alle Felder öffentlich zugänglich im Response
add_filter('rest_prepare_pit_slide', function ($response, $post) {
    $thumb = get_the_post_thumbnail_url($post->ID, 'full');
    $response->data['featured_image_url'] = $thumb ?: null;
    $response->data['slide_data'] = [
        'subtitle'    => get_post_meta($post->ID, 'pit_subtitle',    true) ?: '',
        'button_text' => get_post_meta($post->ID, 'pit_button_text', true) ?: '',
        'button_link' => get_post_meta($post->ID, 'pit_button_link', true) ?: '',
        'image_url'   => get_post_meta($post->ID, 'pit_image_url',   true) ?: '',
    ];
    return $response;
}, 10, 2);
