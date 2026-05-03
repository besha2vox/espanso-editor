import { useState, useEffect, FormEvent } from "react";
import { useParams } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import { SnippetSchema, Snippet, sanitizeSnippet } from "../../types/snippet";
import styles from "./styles.module.scss";

type FieldErrors = { trigger?: string; replace?: string };

const EditSnipets: React.FC = () => {
    const { t } = useTranslation();
    const { fileName } = useParams<{ fileName: string }>();
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [newTrigger, setNewTrigger] = useState("");
    const [newReplace, setNewReplace] = useState("");
    const [errors, setErrors] = useState<FieldErrors>({});
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editDraft, setEditDraft] = useState<Snippet>({ trigger: "", replace: "" });
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!fileName) return;
        invoke<Snippet[]>("load_snippets", { fileName })
            .then(setSnippets)
            .catch((error) => {
                console.error("Error loading snippets", error);
            });
    }, [fileName]);

    const persistSnippets = (updated: Snippet[]) => {
        if (!fileName) return;
        invoke("save_snippets", { fileName, snippets: updated }).catch((error) => {
            console.error("Error saving snippets", error);
        });
    };

    const addSnippet = (e: FormEvent) => {
        e.preventDefault();
        const sanitized = sanitizeSnippet({ trigger: newTrigger, replace: newReplace });
        const result = SnippetSchema.safeParse(sanitized);

        if (!result.success) {
            setErrors({
                trigger: result.error.issues.find((i) => i.path[0] === "trigger")?.message,
                replace: result.error.issues.find((i) => i.path[0] === "replace")?.message,
            });
            return;
        }

        setErrors({});
        const updated = [...snippets, result.data];
        setSnippets(updated);
        setNewTrigger("");
        setNewReplace("");
        persistSnippets(updated);
    };

    const deleteSnippet = (index: number) => {
        const updated = snippets.filter((_, i) => i !== index);
        setSnippets(updated);
        persistSnippets(updated);
    };

    const startEdit = (index: number) => {
        setEditingIndex(index);
        setEditDraft({ ...snippets[index] });
    };

    const cancelEdit = () => {
        setEditingIndex(null);
    };

    const confirmEdit = () => {
        if (editingIndex === null) return;
        const sanitized = sanitizeSnippet(editDraft);
        const result = SnippetSchema.safeParse(sanitized);
        if (!result.success) return;
        const updated = snippets.map((s, i) => (i === editingIndex ? result.data : s));
        setSnippets(updated);
        setEditingIndex(null);
        persistSnippets(updated);
    };

    const query = search.trim().toLowerCase();
    const filteredSnippets = snippets
        .map((s, i) => ({ s, i }))
        .filter(
            ({ s }) =>
                query === "" ||
                s.trigger.toLowerCase().includes(query) ||
                s.replace.toLowerCase().includes(query),
        );

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.title}>
                    <span className={styles.titleIcon}>◆</span>
                    {fileName}
                </h1>
            </header>

            <form className={styles.form} onSubmit={addSnippet}>
                <div className={styles.formField}>
                    <label className={styles.fieldLabel}>{t("editor.trigger")}</label>
                    <input
                        className={[styles.input, errors.trigger ? styles.inputError : ""].join(
                            " ",
                        )}
                        type="text"
                        placeholder={t("editor.triggerPlaceholder")}
                        value={newTrigger}
                        onChange={(e) => setNewTrigger(e.target.value)}
                    />
                    {errors.trigger && <span className={styles.errorMsg}>{errors.trigger}</span>}
                </div>
                <div className={[styles.formField, styles.formFieldGrow].join(" ")}>
                    <label className={styles.fieldLabel}>{t("editor.replacementText")}</label>
                    <textarea
                        className={[styles.textarea, errors.replace ? styles.inputError : ""].join(
                            " ",
                        )}
                        placeholder={t("editor.replacementPlaceholder")}
                        value={newReplace}
                        onChange={(e) => setNewReplace(e.target.value)}
                        rows={3}
                    />
                    {errors.replace && <span className={styles.errorMsg}>{errors.replace}</span>}
                </div>
                <button type="submit" className={styles.addBtn}>
                    {t("editor.add")}
                </button>
            </form>

            <div className={styles.searchBar}>
                <span className={styles.searchIcon} aria-hidden="true" />
                <input
                    className={styles.searchInput}
                    type="search"
                    placeholder={t("editor.searchPlaceholder")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label={t("editor.searchLabel")}
                />
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>{t("editor.trigger")}</th>
                            <th className={styles.th}>{t("editor.replacementText")}</th>
                            <th className={[styles.th, styles.thAction].join(" ")} />
                        </tr>
                    </thead>
                    <tbody>
                        {snippets.length === 0 && (
                            <tr>
                                <td className={styles.empty} colSpan={3}>
                                    {t("editor.emptyState")}
                                </td>
                            </tr>
                        )}
                        {snippets.length > 0 && filteredSnippets.length === 0 && (
                            <tr>
                                <td className={styles.empty} colSpan={3}>
                                    {t("editor.noResults", { search })}
                                </td>
                            </tr>
                        )}
                        {filteredSnippets.map(({ s, i }) => {
                            const isEditing = editingIndex === i;
                            return (
                                <tr
                                    key={i}
                                    className={[
                                        styles.row,
                                        isEditing ? styles.rowEditing : "",
                                    ].join(" ")}
                                >
                                    <td className={styles.td}>
                                        {isEditing ? (
                                            <input
                                                className={styles.input}
                                                value={editDraft.trigger}
                                                onChange={(e) =>
                                                    setEditDraft({
                                                        ...editDraft,
                                                        trigger: e.target.value,
                                                    })
                                                }
                                            />
                                        ) : (
                                            <span className={styles.cellTrigger}>{s.trigger}</span>
                                        )}
                                    </td>
                                    <td className={styles.td}>
                                        {isEditing ? (
                                            <textarea
                                                className={styles.textarea}
                                                value={editDraft.replace}
                                                rows={3}
                                                onChange={(e) =>
                                                    setEditDraft({
                                                        ...editDraft,
                                                        replace: e.target.value,
                                                    })
                                                }
                                            />
                                        ) : (
                                            <span className={styles.cellReplace}>{s.replace}</span>
                                        )}
                                    </td>
                                    <td className={[styles.td, styles.tdAction].join(" ")}>
                                        {isEditing ? (
                                            <>
                                                <button
                                                    className={styles.confirmBtn}
                                                    onClick={confirmEdit}
                                                    title={t("editor.confirm")}
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    className={styles.cancelBtn}
                                                    onClick={cancelEdit}
                                                    title={t("editor.cancel")}
                                                >
                                                    ✕
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    className={styles.editBtn}
                                                    onClick={() => startEdit(i)}
                                                    title={t("editor.editSnippet")}
                                                >
                                                    ✎
                                                </button>
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => deleteSnippet(i)}
                                                    title={t("editor.deleteSnippet")}
                                                >
                                                    ✕
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EditSnipets;
