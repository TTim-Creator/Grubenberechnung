mod commands;
mod db;

use commands::{check_license_background, get_fingerprint, validate_license_online};
use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(
                    "sqlite:grubenberechnung.db",
                    vec![
                        Migration {
                            version: 1,
                            description: "initial schema",
                            sql: db::MIGRATION_V1,
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 2,
                            description: "add akzent_farbe and firmen_name",
                            sql: db::MIGRATION_V2,
                            kind: MigrationKind::Up,
                        },
                    ],
                )
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            get_fingerprint,
            validate_license_online,
            check_license_background,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
