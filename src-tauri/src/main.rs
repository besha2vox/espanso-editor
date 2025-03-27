use std::fs::{self, OpenOptions};
use std::path::Path;
use tauri::command;
use serde::{Deserialize, Serialize};
use serde_yaml;
use dirs; // For getting the home directory

#[derive(Serialize, Deserialize)]
struct EspansoSnippet {
    trigger: String,
    replace: String,
}

// Function to get the file path
fn get_file_path() -> String {
    // Get the home directory
    let home_dir = dirs::home_dir().expect("Failed to get home directory");
    home_dir.join(".config/espanso/match/base.yml").to_str().unwrap().to_string()
}

// 📌 Function to load snippets
#[command]
fn load_snippets() -> Result<Vec<EspansoSnippet>, String> {
    let file_path = get_file_path();
    let contents = fs::read_to_string(&file_path).map_err(|e| format!("Failed to read file: {}", e))?;
    
    let yaml: serde_yaml::Value = serde_yaml::from_str(&contents).map_err(|e| format!("YAML parsing error: {}", e))?;
    
    if let Some(matches) = yaml["matches"].as_sequence() {
        Ok(matches.iter().map(|entry| EspansoSnippet {
            trigger: entry["trigger"].as_str().unwrap_or("").to_string(),
            replace: entry["replace"].as_str().unwrap_or("").to_string(),
        }).collect())
    } else {
        Ok(vec![])
    }
}

// 📌 Function to save snippets
#[command]
fn save_snippets(snippets: Vec<EspansoSnippet>) -> Result<(), String> {
    let file_path = get_file_path();

    // Create all necessary directories if they do not exist
    let dir_path = Path::new(&file_path).parent().unwrap(); // Get the parent directory
    fs::create_dir_all(dir_path).map_err(|e| format!("Failed to create directories: {}", e))?;

    // Create a list for snippets
    let matches = snippets.into_iter().map(|s| {
        let mut snippet_map = serde_yaml::Mapping::new();
        snippet_map.insert(
            serde_yaml::Value::String("trigger".to_string()),
            serde_yaml::Value::String(s.trigger),
        );
        snippet_map.insert(
            serde_yaml::Value::String("replace".to_string()),
            serde_yaml::Value::String(s.replace),
        );
        serde_yaml::Value::Mapping(snippet_map)
    }).collect::<Vec<serde_yaml::Value>>();

    // Create the main object with the key "matches"
    let mut root_map = serde_yaml::Mapping::new();
    root_map.insert(
        serde_yaml::Value::String("matches".to_string()),
        serde_yaml::Value::Sequence(matches),
    );

    // Serialize the structure to YAML
    let yaml = serde_yaml::to_string(&serde_yaml::Value::Mapping(root_map))
        .map_err(|e| format!("YAML serialization error: {}", e))?;

    // Create the file if it does not exist and write to it
    OpenOptions::new()
        .create(true) // Create the file if it does not exist
        .write(true)  // Open for writing
        .truncate(true) // Clear the file before writing
        .open(&file_path)
        .map_err(|e| format!("File opening error: {}", e))?;

    // Write to the file
    fs::write(&file_path, yaml).map_err(|e| format!("File writing error: {}", e))?;
    Ok(())
}

// 📌 Launch Tauri and connect functions
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![load_snippets, save_snippets])
        .run(tauri::generate_context!())
        .expect("failed to run app");
}
