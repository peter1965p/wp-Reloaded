<?php
/**
 * WP-2026 Admin-Menu Collector
 * Nur von localhost aufrufbar – gibt Plugin-Admin-Menüs als JSON zurück.
 */

// Sicherheit: nur lokale Anfragen erlaubt
$allowed = ['127.0.0.1', '::1', 'localhost'];
if (!in_array($_SERVER['REMOTE_ADDR'] ?? '', $allowed, true)) {
    http_response_code(403);
    exit('Forbidden');
}

// WP_ADMIN MUSS vor dem WordPress-Laden gesetzt werden,
// damit Plugins wie CF7 und Rank Math ihren Admin-Code und ihre Hooks registrieren.
if (!defined('WP_ADMIN')) {
    define('WP_ADMIN', true);
}

// WordPress laden
require_once dirname(__DIR__, 3) . '/wp-load.php';

// Admin-Hilfsfunktionen laden (add_menu_page etc.)
require_once ABSPATH . 'wp-admin/includes/plugin.php';

// Admin als aktuellen Benutzer setzen für korrekte Capability-Prüfungen
$admin_users = get_users(['role' => 'administrator', 'number' => 1, 'fields' => 'ids']);
if (!empty($admin_users)) {
    wp_set_current_user($admin_users[0]);
}

// Menü-Globals initialisieren
global $menu, $submenu, $admin_page_hooks, $_registered_pages, $_parent_pages;
$menu              = [];
$submenu           = [];
$admin_page_hooks  = [];
$_registered_pages = [];
$_parent_pages     = [];

// Plugins ihre Menüs registrieren lassen
do_action('admin_menu', '');

// WP-Core-Seiten ausschließen
$core_slugs = [
    'index.php', 'edit.php', 'upload.php', 'link-manager.php',
    'edit-comments.php', 'themes.php', 'plugins.php', 'users.php',
    'tools.php', 'options-general.php',
];

$result = [];
foreach ((array) $menu as $item) {
    if (empty($item[0]) || empty($item[2])) continue;
    $slug = $item[2];

    if (str_starts_with($slug, 'separator')) continue;
    if (in_array($slug, $core_slugs, true)) continue;
    if (str_starts_with($slug, 'pit-') || str_starts_with($slug, 'wp2026') || str_starts_with($slug, 'paeffgen-it')) continue;

    $title = wp_strip_all_tags($item[0]);
    if (!$title) continue;

    $result[] = [
        'title' => $title,
        'page'  => $slug,
        'icon'  => $item[6] ?? '',
    ];
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($result, JSON_UNESCAPED_UNICODE);
