import { Link } from "react-router-dom";

import styles from "./styles.module.scss";

interface NavigationProps {
    fileNames: string[];
}

const Navigation: React.FC<NavigationProps> = ({ fileNames }) => {
    const addNewFile = () => {
        alert("Coming soon...");
    };

    return (
        <div className={styles.navigation}>
            <h2>Navigation</h2>
            <nav className={styles.navigation}>
                <Link to="/">Home</Link>
                <ul>
                    <p>Files:</p>
                    {fileNames.map((fileName) => (
                        <li key={fileName}>
                            <Link to={`/snippets/${fileName}`}>{fileName}</Link>
                        </li>
                    ))}
                    <li>
                        <button onClick={addNewFile}>+ add new</button>
                    </li>
                </ul>
                <Link to="/">About</Link>
            </nav>
        </div>
    );
};

export default Navigation;
