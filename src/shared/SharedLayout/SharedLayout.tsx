import { Suspense, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";

import styles from "./styles.module.scss";
import { Sidebar } from "../components/Sidebar";
import { Navigation } from "../components/Navigation";
import { Container } from "../components/Container";

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
                <div className={styles.status}>
                    <span
                        className={[
                            styles.statusDot,
                            serviceStatus === "running" ? styles.running : styles.stopped,
                        ].join(" ")}
                    />
                    {t("layout.serviceStatus", { status: serviceStatus || "…" })}
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
