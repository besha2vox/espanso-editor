import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import i18n from "../../i18n";
import styles from "./styles.module.scss";

interface AppSettings {
    windowWidth: number;
    windowHeight: number;
    language: string;
}

const WINDOW_SIZES = [
    { width: 800, height: 600 },
    { width: 1024, height: 768 },
    { width: 1280, height: 800 },
    { width: 1440, height: 900 },
] as const;

const SettingsPage: React.FC = () => {
    const { t } = useTranslation();
    const [settings, setSettings] = useState<AppSettings>({
        windowWidth: 800,
        windowHeight: 600,
        language: "uk",
    });
    const [matchPath, setMatchPath] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            invoke<AppSettings>("get_settings"),
            invoke<string>("get_match_dir_path").catch(() => ""),
        ]).then(([s, path]) => {
            setSettings(s);
            setMatchPath(path);
            setLoading(false);
        });
    }, []);

    const handleLanguageChange = (lang: string) => {
        const updated = { ...settings, language: lang };
        setSettings(updated);
        i18n.changeLanguage(lang);
        invoke("save_settings", { settings: updated }).catch(console.error);
    };

    const handleWindowSizeChange = (width: number, height: number) => {
        const updated = { ...settings, windowWidth: width, windowHeight: height };
        setSettings(updated);
        invoke("save_settings", { settings: updated }).catch(console.error);
        invoke("apply_window_size", { width, height }).catch(console.error);
    };

    if (loading) return <div className={styles.loading}>{t("layout.loading")}</div>;

    const currentSizeKey = `${settings.windowWidth}x${settings.windowHeight}`;
    const sizeMatchesPreset = WINDOW_SIZES.some(
        (s) => s.width === settings.windowWidth && s.height === settings.windowHeight,
    );

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>{t("settings.title")}</h1>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{t("settings.general")}</h2>

                <div className={styles.row}>
                    <label className={styles.label}>{t("settings.language")}</label>
                    <select
                        className={styles.select}
                        value={settings.language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                    >
                        <option value="uk">{t("settings.languages.uk")}</option>
                        <option value="en">{t("settings.languages.en")}</option>
                    </select>
                </div>

                <div className={styles.row}>
                    <label className={styles.label}>{t("settings.windowSize")}</label>
                    <select
                        className={styles.select}
                        value={sizeMatchesPreset ? currentSizeKey : ""}
                        onChange={(e) => {
                            const [w, h] = e.target.value.split("x").map(Number);
                            handleWindowSizeChange(w, h);
                        }}
                    >
                        {!sizeMatchesPreset && (
                            <option value="" disabled>
                                {settings.windowWidth} × {settings.windowHeight}
                            </option>
                        )}
                        {WINDOW_SIZES.map(({ width, height }) => (
                            <option key={`${width}x${height}`} value={`${width}x${height}`}>
                                {width} × {height}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={[styles.row, styles.rowStack].join(" ")}>
                    <label className={styles.label}>{t("settings.matchPath")}</label>
                    <input
                        className={styles.pathInput}
                        type="text"
                        value={matchPath}
                        readOnly
                        spellCheck={false}
                    />
                    <p className={styles.hint}>{t("settings.matchPathHint")}</p>
                </div>
            </section>
        </div>
    );
};

export default SettingsPage;
