import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { openUrl } from "@tauri-apps/plugin-opener";
import styles from "./styles.module.scss";

interface NavigationProps {
    fileNames: string[];
}

const GitHubIcon: React.FC = () => (
    <svg
        viewBox="0 0 16 16"
        width="16"
        height="16"
        fill="currentColor"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
);

const Navigation: React.FC<NavigationProps> = ({ fileNames }) => {
    const { t } = useTranslation();

    const addNewFile = () => {
        alert(t("navigation.comingSoon"));
    };

    const openGitHub = () => {
        openUrl("https://github.com/");
    };

    return (
        <nav className={styles.nav}>
            <div className={styles.header}>
                <img src="/logo.png" alt="logo" className={styles.logo} />
                <span className={styles.appName}>Espanso Editor</span>
                <button
                    className={styles.githubBtn}
                    onClick={openGitHub}
                    title="GitHub"
                    aria-label="GitHub"
                >
                    <GitHubIcon />
                </button>
            </div>

            <div className={styles.section}>
                <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                        [styles.link, isActive ? styles.active : ""].join(" ")
                    }
                >
                    {t("navigation.home")}
                </NavLink>
            </div>

            <div className={styles.section}>
                <span className={styles.sectionLabel}>{t("navigation.files")}</span>
                <ul className={styles.fileList}>
                    {fileNames.map((fileName) => (
                        <li key={fileName}>
                            <NavLink
                                to={`/snippets/${fileName}`}
                                className={({ isActive }) =>
                                    [styles.fileLink, isActive ? styles.active : ""].join(" ")
                                }
                            >
                                <span className={styles.fileIcon}>◆</span>
                                {fileName}
                            </NavLink>
                        </li>
                    ))}
                    <li>
                        <button className={styles.addBtn} onClick={addNewFile}>
                            <span className={styles.addIcon}>+</span>
                            {t("navigation.addNewFile")}
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navigation;
