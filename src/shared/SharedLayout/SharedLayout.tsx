import { Suspense } from "react";
import { Outlet } from "react-router-dom";

import styles from "./styles.module.scss";
import { Sidebar } from "../components/Sidebar";
import { Navigation } from "../components/Navigation";
import { Container } from "../components/Container";

interface SharedLayoutProps {}

const SharedLayout: React.FC<SharedLayoutProps> = () => {
    return (
        <div className={styles.layout}>
            <Sidebar>
                <Navigation fileNames={["base"]} />
            </Sidebar>
            <div>
                <Container>
                    <Suspense fallback={null}>
                        <Outlet />
                    </Suspense>
                </Container>
            </div>
        </div>
    );
};

export default SharedLayout;
