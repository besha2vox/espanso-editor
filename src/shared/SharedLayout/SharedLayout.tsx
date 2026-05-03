import { Suspense, useEffect, useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";

import styles from "./styles.module.scss";
import { Sidebar } from "../components/Sidebar";
import { Navigation } from "../components/Navigation";
import { Container } from "../components/Container";

const GearIcon: React.FC = () => (
    <svg
        viewBox="0 0 16 16"
        width="15"
        height="15"
        fill="currentColor"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
    </svg>
);

const SharedLayout: React.FC = () => {
    const { t } = useTranslation();
    const [fileNames, setFileNames] = useState<string[]>([]);
    const [serviceStatus, setServiceStatus] = useState<string>("");

    useEffect(() => {
        invoke<string[]>("list_match_files")
            .then(setFileNames)
            .catch(() => setFileNames(["base"]));
        invoke<string>("get_service_status")
            .then(setServiceStatus)
            .catch(() => setServiceStatus("unknown"));
    }, []);

    return (
        <div className={styles.layout}>
            <Sidebar>
                <Navigation fileNames={fileNames} />
                <div className={styles.bottomBar}>
                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            [styles.settingsBtn, isActive ? styles.settingsBtnActive : ""].join(" ")
                        }
                        title={t("settings.title")}
                        aria-label={t("settings.title")}
                    >
                        <GearIcon />
                    </NavLink>
                    <div className={styles.status}>
                        <span
                            className={[
                                styles.statusDot,
                                serviceStatus === "running" ? styles.running : styles.stopped,
                            ].join(" ")}
                        />
                        {t("layout.serviceStatus", { status: serviceStatus || "…" })}
                    </div>
                </div>
            </Sidebar>
            <main className={styles.main}>
                <Container>
                    <Suspense
                        fallback={<div className={styles.loading}>{t("layout.loading")}</div>}
                    >
                        <Outlet />
                    </Suspense>
                </Container>
            </main>
        </div>
    );
};

export default SharedLayout;
