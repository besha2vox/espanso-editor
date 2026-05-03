use std::fs;
use std::path::PathBuf;
use std::process::Command;
use tauri::command;
use tauri::Manager;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct EspansoSnippet {
    trigger: String,
    replace: String,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct AppSettings {
    window_width: u32,
    window_height: u32,
    language: String,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            window_width: 800,
            window_height: 600,
            language: "uk".to_string(),
        }
    }
}

fn settings_path() -> Option<std::path::PathBuf> {
    dirs::config_dir().map(|d| d.join("espanso-editor").join("settings.json"))
}

fn load_settings() -> AppSettings {
    let path = match settings_path() {
        Some(p) => p,
        None => return AppSettings::default(),
    };
    if let Ok(contents) = fs::read_to_string(&path) {
        serde_json::from_str(&contents).unwrap_or_default()
    } else {
        AppSettings::default()
    }
}

fn match_dir() -> Result<PathBuf, String> {
    let output = Command::new("espanso")
        .arg("path")
        .output()
        .map_err(|_| "espanso not found — make sure it is installed and on PATH".to_string())?;

    let stdout = String::from_utf8_lossy(&output.stdout);

    let config_path = stdout
        .lines()
        .find(|line| line.trim_start().starts_with("Config:"))
        .and_then(|line| line.splitn(2, ':').nth(1))
        .map(|s| s.trim().to_string())
        .ok_or_else(|| {
            "Could not find 'Config:' line in `espanso path` output".to_string()
        })?;

    let match_path = PathBuf::from(config_path).join("match");

    fs::create_dir_all(&match_path)
        .map_err(|e| format!("Failed to create match directory: {}", e))?;

    let base_yml = match_path.join("base.yml");
    if !base_yml.exists() {
        fs::write(&base_yml, "matches: []\n")
            .map_err(|e| format!("Failed to create base.yml: {}", e))?;
    }

    Ok(match_path)
}

fn file_path(file_name: &str) -> Result<PathBuf, String> {
    if file_name.contains('/') || file_name.contains('\\') || file_name.contains("..") {
        return Err("Invalid file name".to_string());
    }
    Ok(match_dir()?.join(format!("{}.yml", file_name)))
}

#[command]
fn list_match_files() -> Result<Vec<String>, String> {
    let dir = match_dir()?;
    let entries = fs::read_dir(&dir)
        .map_err(|e| format!("Failed to read match directory: {}", e))?;

    let mut files: Vec<String> = entries
        .filter_map(|e| e.ok())
        .filter(|e| e.path().extension().map(|ext| ext == "yml").unwrap_or(false))
        .filter_map(|e| e.path().file_stem().map(|s| s.to_string_lossy().to_string()))
        .collect();

    files.sort();
    Ok(files)
}

#[command]
fn load_snippets(file_name: String) -> Result<Vec<EspansoSnippet>, String> {
    let path = file_path(&file_name)?;
    let contents = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    let yaml: serde_yaml::Value = serde_yaml::from_str(&contents)
        .map_err(|e| format!("YAML parsing error: {}", e))?;

    if let Some(matches) = yaml["matches"].as_sequence() {
        Ok(matches
            .iter()
            .map(|entry| EspansoSnippet {
                trigger: entry["trigger"].as_str().unwrap_or("").to_string(),
                replace: entry["replace"].as_str().unwrap_or("").to_string(),
            })
            .collect())
    } else {
        Ok(vec![])
    }
}

#[command]
fn save_snippets(file_name: String, snippets: Vec<EspansoSnippet>) -> Result<(), String> {
    let path = file_path(&file_name)?;

    fs::create_dir_all(path.parent().unwrap())
        .map_err(|e| format!("Failed to create directories: {}", e))?;

    // Create .bak before overwriting
    if path.exists() {
        let bak_path = path.with_extension("yml.bak");
        fs::copy(&path, &bak_path)
            .map_err(|e| format!("Failed to create backup: {}", e))?;
    }

    let matches = snippets
        .into_iter()
        .map(|s| {
            let mut m = serde_yaml::Mapping::new();
            m.insert(
                serde_yaml::Value::String("trigger".to_string()),
                serde_yaml::Value::String(s.trigger),
            );
            m.insert(
                serde_yaml::Value::String("replace".to_string()),
                serde_yaml::Value::String(s.replace),
            );
            serde_yaml::Value::Mapping(m)
        })
        .collect::<Vec<_>>();

    let mut root = serde_yaml::Mapping::new();
    root.insert(
        serde_yaml::Value::String("matches".to_string()),
        serde_yaml::Value::Sequence(matches),
    );

    let yaml = serde_yaml::to_string(&serde_yaml::Value::Mapping(root))
        .map_err(|e| format!("YAML serialization error: {}", e))?;

    let tmp_path = path.with_file_name(
        format!("{}.tmp", path.file_name().unwrap_or_default().to_string_lossy()),
    );

    fs::write(&tmp_path, &yaml)
        .map_err(|e| format!("Failed to write temp file: {}", e))?;

    fs::rename(&tmp_path, &path).map_err(|e| {
        let _ = fs::remove_file(&tmp_path);
        format!("Failed to replace config file: {}", e)
    })?;

    Ok(())
}

#[command]
fn get_service_status() -> String {
    match std::process::Command::new("espanso")
        .args(["service", "status"])
        .output()
    {
        Ok(o) if o.status.success() => "running".to_string(),
        Ok(_) => "not running".to_string(),
        Err(_) => "espanso not found".to_string(),
    }
}

#[command]
fn get_settings() -> AppSettings {
    load_settings()
}

#[command]
fn save_settings(settings: AppSettings) -> Result<(), String> {
    let path = settings_path()
        .ok_or_else(|| "Could not determine config directory".to_string())?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }
    let json = serde_json::to_string_pretty(&settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;
    fs::write(&path, json)
        .map_err(|e| format!("Failed to write settings: {}", e))
}

#[command]
fn apply_window_size(app: tauri::AppHandle, width: u32, height: u32) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or_else(|| "Main window not found".to_string())?;
    window
        .set_size(tauri::Size::Logical(tauri::LogicalSize {
            width: width as f64,
            height: height as f64,
        }))
        .map_err(|e| e.to_string())
}

#[command]
fn get_match_dir_path() -> Result<String, String> {
    match_dir().map(|p| p.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let settings = load_settings();
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_size(tauri::Size::Logical(tauri::LogicalSize {
                    width: settings.window_width as f64,
                    height: settings.window_height as f64,
                }));
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            list_match_files,
            load_snippets,
            save_snippets,
            get_service_status,
            get_settings,
            save_settings,
            apply_window_size,
            get_match_dir_path,
        ])
        .run(tauri::generate_context!())
        .expect("failed to run app");
}
