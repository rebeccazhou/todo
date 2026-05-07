#[cfg(all(
    not(debug_assertions),
    not(any(target_os = "android", target_os = "ios"))
))]
use tauri_plugin_updater::UpdaterExt;

#[cfg(all(
    not(debug_assertions),
    not(any(target_os = "android", target_os = "ios"))
))]
async fn install_update_if_available<R: tauri::Runtime>(app: tauri::AppHandle<R>) {
    let updater = match app.updater() {
        Ok(updater) => updater,
        Err(error) => {
            log::info!("update check skipped: {error}");
            return;
        }
    };

    let update = match updater.check().await {
        Ok(Some(update)) => update,
        Ok(None) => return,
        Err(error) => {
            log::info!("update check skipped: {error}");
            return;
        }
    };

    let version = update.version.clone();
    match update.download_and_install(|_, _| {}, || {}).await {
        Ok(()) => {
            log::info!("installed update {version}; restarting");
            app.request_restart();
        }
        Err(error) => {
            log::warn!("failed to install update {version}: {error}");
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            #[cfg(all(
                not(debug_assertions),
                not(any(target_os = "android", target_os = "ios"))
            ))]
            {
                let handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    install_update_if_available(handle).await;
                });
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
