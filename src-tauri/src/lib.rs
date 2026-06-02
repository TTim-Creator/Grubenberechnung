mod commands;
mod db;

use commands::{get_fingerprint, startup_lizenz_check, validate_license_online};
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
                        Migration {
                            version: 3,
                            description: "add bezeichnung to berechnungen",
                            sql: db::MIGRATION_V3,
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 4,
                            description: "add auth_token to lizenz",
                            sql: db::MIGRATION_V4,
                            kind: MigrationKind::Up,
                        },
                    ],
                )
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            get_fingerprint,
            validate_license_online,
            startup_lizenz_check,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
