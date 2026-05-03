import styles from "./styles.module.scss";

interface SidebarProps {
    children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
    return <aside className={styles.sidebar}>{children}</aside>;
};

export default Sidebar;
