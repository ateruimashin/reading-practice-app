// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use tauri_plugin_sql::{Migration, MigrationKind};

mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "initial schema",
            sql: include_str!("../migrations/001_initial_schema.sql"),
            kind: MigrationKind::Up,
        }
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:reading_practice.db", migrations)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            commands::get_database_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
