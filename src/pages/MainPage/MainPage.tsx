import { useTranslation } from "react-i18next";
import styles from "./styles.module.scss";

const features = ["home.feature1", "home.feature2", "home.feature3", "home.feature4"] as const;

const MainPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Espanso GUI</h1>
            <p className={styles.subtitle}>{t("home.subtitle")}</p>
            <p className={styles.description}>{t("home.description")}</p>
            <ul className={styles.features}>
                {features.map((key) => (
                    <li key={key} className={styles.feature}>
                        <span className={styles.featureDot}>◆</span>
                        {t(key)}
                    </li>
                ))}
            </ul>
            <div className={styles.palette}>
                <span className={styles.dot} style={{ background: "#bd93f9" }} />
                <span className={styles.dot} style={{ background: "#ff79c6" }} />
                <span className={styles.dot} style={{ background: "#8be9fd" }} />
                <span className={styles.dot} style={{ background: "#50fa7b" }} />
                <span className={styles.dot} style={{ background: "#ffb86c" }} />
                <span className={styles.dot} style={{ background: "#ff5555" }} />
            </div>
        </div>
    );
};

export default MainPage;
