import styles from "./styles.module.scss";
import { Container } from "../Container";

interface SidebarProps {
    children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
    return (
        <div className={styles.sidebar}>
            <Container>{children}</Container>
        </div>
    );
};

export default Sidebar;
