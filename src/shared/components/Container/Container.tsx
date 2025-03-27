import styles from "./styles.module.scss";

interface ContainerProps {
    children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({ children, ...props }) => {
    return (
        <div className={styles.container} {...props}>
            {children}
        </div>
    );
};

export default Container;
