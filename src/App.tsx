import "./App.css";

import { HashRouter as Router, Routes, Route } from "react-router-dom";

import { SharedLayout } from "./shared/SharedLayout";
import { MainPage } from "./pages/MainPage";
import EditSnipets from "./pages/EditSnipets/EditSnipets";

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<SharedLayout />}>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/snippets/:fileName" element={<EditSnipets />} />
                </Route>
            </Routes>
        </Router>
    );
}
