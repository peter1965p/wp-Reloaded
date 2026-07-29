<?php
/**
 * Plugin Name: WP-2026 Slider
 * Description: Headless Slider — Custom Post Type mit REST API für WP-2026 | V2.0
 * Version: 2.0.0
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
        'pit_primary_color'   => ['default' => '#3b82f6',     'sanitize' => 'sanitize_hex_color'],
        'pit_accent_color'    => ['default' => '#8b5cf6',     'sanitize' => 'sanitize_hex_color'],
        'pit_font_family'     => ['default' => 'Inter',       'sanitize' => 'sanitize_text_field'],
        'pit_border_radius'   => ['default' => '8',           'sanitize' => 'absint'],
        'pit_header_style'    => ['default' => 'transparent', 'sanitize' => 'sanitize_text_field'],
        'pit_slider_enabled'  => ['default' => '1',           'sanitize' => 'sanitize_text_field'],
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

// Öffentlicher REST-Endpunkt: Slider-Status ohne Auth abrufbar
add_action('rest_api_init', function () {
    register_rest_route('wp2026/v1', '/slider-status', [
        'methods'             => 'GET',
        'callback'            => fn() => rest_ensure_response(['enabled' => get_option('pit_slider_enabled', '1') !== '0']),
        'permission_callback' => '__return_true',
    ]);
});

// Dynamisches Plugin-Admin-Menü: gibt von Plugins registrierte WP-Admin-Seiten zurück
add_action('rest_api_init', function () {
    register_rest_route('wp2026/v1', '/admin-menu', [
        'methods'             => 'GET',
        'permission_callback' => fn() => current_user_can('manage_options'),
        'callback'            => function () {
            // Admin-Hilfsfunktionen laden, damit add_menu_page() verfügbar ist
            require_once ABSPATH . 'wp-admin/includes/plugin.php';

            global $menu, $submenu, $admin_page_hooks, $_registered_pages, $_parent_pages;
            $menu              = [];
            $submenu           = [];
            $admin_page_hooks  = [];
            $_registered_pages = [];
            $_parent_pages     = [];

            // Plugins ihre Menüs registrieren lassen
            do_action('admin_menu', '');

            // WP-Core-Seiten ausschließen
            $core = [
                'index.php', 'edit.php', 'upload.php', 'link-manager.php',
                'edit-comments.php', 'themes.php', 'plugins.php', 'users.php',
                'tools.php', 'options-general.php',
            ];

            $result = [];
            foreach ((array) $menu as $item) {
                if (empty($item[0]) || empty($item[2])) continue;
                $slug = $item[2];
                // Separatoren und Core-Seiten überspringen
                if (str_starts_with($slug, 'separator')) continue;
                if (in_array($slug, $core, true)) continue;
                // Eigene WP-2026 Seiten überspringen
                if (str_starts_with($slug, 'pit-') || str_starts_with($slug, 'wp2026')) continue;

                $title = wp_strip_all_tags($item[0]);
                if (!$title) continue;

                $result[] = [
                    'title' => $title,
                    'page'  => $slug,
                    'icon'  => $item[6] ?? '',
                ];
            }
            return rest_ensure_response($result);
        },
    ]);
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
