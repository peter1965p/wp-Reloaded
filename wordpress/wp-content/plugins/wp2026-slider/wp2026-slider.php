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

// WP Auth-Cookies für eingebettete Plugin-Seiten generieren
add_action('rest_api_init', function () {
    register_rest_route('wp2026/v1', '/admin-cookie', [
        'methods'             => 'GET',
        'permission_callback' => fn() => current_user_can('manage_options'),
        'callback'            => function () {
            $user_id = get_current_user_id();
            $expiry  = time() + 2 * HOUR_IN_SECONDS;
            return rest_ensure_response([
                ['name' => AUTH_COOKIE,        'value' => wp_generate_auth_cookie($user_id, $expiry, 'auth')],
                ['name' => SECURE_AUTH_COOKIE, 'value' => wp_generate_auth_cookie($user_id, $expiry, 'secure_auth')],
                ['name' => LOGGED_IN_COOKIE,   'value' => wp_generate_auth_cookie($user_id, $expiry, 'logged_in')],
            ]);
        },
    ]);
});

// Bei ?pit_embed=1: X-Frame-Options entfernen + WP-Admin-Chrome ausblenden
add_action('admin_init', function () {
    if (!isset($_GET['pit_embed'])) return;
    // WP setzt X-Frame-Options: SAMEORIGIN via send_frame_options_header() — das blockt
    // unseren iframe (localhost:3000 ≠ localhost:80 = unterschiedliche Origins)
    remove_action('admin_init', 'send_frame_options_header');
    header_remove('X-Frame-Options');
    header('Content-Security-Policy: frame-ancestors *');
}, 0);

add_action('admin_head', function () {
    if (!isset($_GET['pit_embed'])) return;
    // phpcs:disable
    echo <<<'HTML'
    <style>
        /* ── WP-Chrome vollständig entfernen ── */
        #wpadminbar, #adminmenuwrap, #adminmenuback, #wpfooter,
        #screen-meta, #screen-meta-links,
        #contextual-help-wrap, #contextual-help-link-wrap,
        #screen-options-link-wrap,
        .update-nag, .notice, .notice-warning, .notice-info,
        .notice-error, .notice-success, .updated.notice,
        #wpcf7-welcome-panel, .wpcf7-welcome-panel,
        .welcome-panel-column-container, .welcome-panel-column,
        .rank-math-notice, .rank-math-banner,
        .rank-math-review-banner { display:none!important }

        /* ── Layout ── */
        html, body  { background:#1b2333!important; margin:0; padding:0; overflow-x:hidden }
        #wpcontent  { margin-left:0!important; padding-left:0!important }
        #wpbody     { padding-top:0!important }
        #wpbody-content { padding-bottom:16px!important }
        .wrap       { padding:20px 24px!important }

        /* ── Seitentitel ── */
        h1.wp-heading-inline {
            color:#f1f5f9!important; font-size:1.2rem!important;
            font-weight:600!important; line-height:1.4!important;
        }
        .page-title-action {
            background:#3b82f6!important; color:#fff!important;
            border-color:#2563eb!important; border-radius:6px!important;
            text-decoration:none!important; padding:4px 10px!important; font-size:13px!important;
        }

        /* ── Tabellen ── */
        .wp-list-table, .widefat { border-collapse:collapse!important; border:none!important }
        .wp-list-table th, .widefat th {
            background:#1e2d3d!important; color:#64748b!important;
            border-bottom:1px solid #263044!important; font-weight:500!important;
            text-transform:uppercase!important; font-size:11px!important; letter-spacing:.04em!important;
        }
        .wp-list-table td, .widefat td {
            background:#1e2841!important; color:#cbd5e1!important;
            border-bottom:1px solid #1e2d3d!important;
        }
        .wp-list-table tr:hover td { background:#243350!important }
        .column-primary strong a { color:#e2e8f0!important; font-weight:500!important }

        /* ── Buttons ── */
        .tablenav, .tablenav-pages { color:#64748b!important; background:transparent!important }
        .tablenav .button, .button, .button-secondary {
            background:#1e2d3d!important; color:#94a3b8!important;
            border:1px solid #334155!important; border-radius:5px!important; box-shadow:none!important;
        }
        .tablenav .button:hover { background:#263044!important; color:#e2e8f0!important }
        input[type=checkbox] { accent-color:#3b82f6 }

        /* ── Formularelemente ── */
        input[type=text], input[type=search], select, textarea {
            background:#1e2d3d!important; color:#f1f5f9!important;
            border:1px solid #334155!important; border-radius:5px!important; box-shadow:none!important;
        }
        input[type=text]:focus, input[type=search]:focus, select:focus {
            border-color:#3b82f6!important; outline:none!important;
            box-shadow:0 0 0 2px rgba(59,130,246,.25)!important;
        }

        /* ── Links ── */
        a { color:#60a5fa!important }
        a:hover { color:#93c5fd!important }
        .row-actions span a { color:#475569!important }
        .row-actions span a:hover { color:#60a5fa!important }
        .search-box input[type=search] { width:200px!important }
    </style>
    <script>
    (function () {
        function addEmbed(url) {
            if (!url || url.startsWith('#') || url.startsWith('javascript')) return url;
            try {
                var u = new URL(url, location.href);
                if (u.hostname === location.hostname) {
                    u.searchParams.set('pit_embed', '1');
                    return u.toString();
                }
            } catch (e) {}
            return url;
        }
        function patchLinks() {
            document.querySelectorAll('a[href]').forEach(function (a) {
                a.href = addEmbed(a.href);
            });
            document.querySelectorAll('form').forEach(function (f) {
                if (!f.querySelector('[name=pit_embed]')) {
                    var h = document.createElement('input');
                    h.type = 'hidden'; h.name = 'pit_embed'; h.value = '1';
                    f.appendChild(h);
                }
            });
        }
        document.addEventListener('DOMContentLoaded', patchLinks);
        new MutationObserver(patchLinks).observe(document.documentElement, { childList: true, subtree: true });
    })();
    </script>
HTML;
    // phpcs:enable
});

// Öffentlicher REST-Endpunkt: Slider-Status ohne Auth abrufbar
add_action('rest_api_init', function () {
    register_rest_route('wp2026/v1', '/slider-status', [
        'methods'             => 'GET',
        'callback'            => fn() => rest_ensure_response(['enabled' => get_option('pit_slider_enabled', '1') !== '0']),
        'permission_callback' => '__return_true',
    ]);
});

// Plugin-Updates: gibt verfügbare Updates aus dem WP-Transient zurück + triggert Upgrades
add_action('rest_api_init', function () {

    // GET: Liste der verfügbaren Updates
    register_rest_route('wp2026/v1', '/plugin-updates', [
        'methods'             => 'GET',
        'permission_callback' => fn() => current_user_can('update_plugins'),
        'callback'            => function () {
            $updates = get_site_transient('update_plugins');
            $result  = [];
            if (!empty($updates->response) && is_array($updates->response)) {
                foreach ($updates->response as $file => $data) {
                    $result[$file] = [
                        'new_version' => $data->new_version ?? '',
                        'url'         => $data->url         ?? '',
                        'slug'        => $data->slug        ?? '',
                    ];
                }
            }
            return rest_ensure_response($result);
        },
    ]);

    // POST: Update-Check erzwingen (löscht Transient + ruft wp.org ab)
    register_rest_route('wp2026/v1', '/check-plugin-updates', [
        'methods'             => 'POST',
        'permission_callback' => fn() => current_user_can('update_plugins'),
        'callback'            => function () {
            delete_site_transient('update_plugins');
            wp_update_plugins();

            $updates = get_site_transient('update_plugins');
            $result  = [];
            if (!empty($updates->response) && is_array($updates->response)) {
                foreach ($updates->response as $file => $data) {
                    $result[$file] = [
                        'new_version' => $data->new_version ?? '',
                        'url'         => $data->url         ?? '',
                        'slug'        => $data->slug        ?? '',
                    ];
                }
            }
            return rest_ensure_response($result);
        },
    ]);

    // POST: Plugin aktualisieren
    register_rest_route('wp2026/v1', '/plugin-updates', [
        'methods'             => 'POST',
        'permission_callback' => fn() => current_user_can('update_plugins'),
        'callback'            => function (WP_REST_Request $request) {
            $plugin = sanitize_text_field($request->get_param('plugin'));
            if (!$plugin) {
                return new WP_Error('missing_plugin', 'Plugin-Pfad fehlt', ['status' => 400]);
            }

            require_once ABSPATH . 'wp-admin/includes/file.php';
            require_once ABSPATH . 'wp-admin/includes/misc.php';
            require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';

            WP_Filesystem();

            $upgrader = new Plugin_Upgrader(new Automatic_Upgrader_Skin());
            $result   = $upgrader->upgrade($plugin);

            if (is_wp_error($result)) {
                return $result;
            }
            if ($result === false) {
                return new WP_Error('upgrade_failed', 'Update fehlgeschlagen', ['status' => 500]);
            }

            return rest_ensure_response(['success' => true, 'plugin' => $plugin]);
        },
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
