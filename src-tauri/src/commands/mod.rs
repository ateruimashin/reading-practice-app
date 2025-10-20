// データベース操作のヘルパー関数は tauri-plugin-sql を使って直接フロントエンドから実行するため、
// Rustコマンドは最小限にします

#[tauri::command]
pub async fn get_database_status() -> Result<String, String> {
    Ok("Database is ready".to_string())
}
