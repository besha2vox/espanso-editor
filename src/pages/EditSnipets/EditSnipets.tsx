import { useState, useEffect, FormEvent } from "react";
import { invoke } from "@tauri-apps/api/core";

const EditSnipets: React.FC = () => {
    const [snippets, setSnippets] = useState<
        { trigger: string; replace: string }[]
    >([]);
    const [newTrigger, setNewTrigger] = useState("");
    const [newReplace, setNewReplace] = useState("");

    useEffect(() => {
        invoke("load_snippets")
            .then((data: unknown) => setSnippets(data as any))
            .catch((error) => {
                console.error("Ошибка загрузки сниппетов", error);
            });
    }, []);

    const saveSnippets = () => {
        invoke("save_snippets", { snippets })
            .then(() => {
                alert("Сниппеты успешно сохранены!");
            })
            .catch((error) => {
                console.error("Ошибка сохранения сниппетов", error);
                alert("Не удалось сохранить сниппеты!");
            });
    };

    const addSnippet = (e: FormEvent) => {
        e.preventDefault();
        if (newTrigger && newReplace) {
            setSnippets([
                ...snippets,
                { trigger: newTrigger, replace: newReplace },
            ]);
            setNewTrigger("");
            setNewReplace("");
        }
    };

    return (
        <div className="app">
            <h1>Snippet Editor Espanso</h1>

            <form className="snippet-form" onSubmit={addSnippet}>
                <input
                    type="text"
                    placeholder="Новый триггер"
                    value={newTrigger}
                    onChange={(e) => setNewTrigger(e.target.value)}
                />
                <textarea
                    placeholder="Новый текст"
                    value={newReplace}
                    onChange={(e) => setNewReplace(e.target.value)}
                />
                <button type="submit" onClick={addSnippet}>
                    Добавить
                </button>
            </form>

            <table>
                <thead>
                    <tr>
                        <th>Триггер</th>
                        <th>Текст</th>
                    </tr>
                </thead>
                <tbody>
                    {snippets.map((s, i) => (
                        <tr key={i}>
                            <td>
                                <input
                                    value={s.trigger}
                                    onChange={(e) => {
                                        const newSnippets = [...snippets];
                                        newSnippets[i].trigger = e.target.value;
                                        setSnippets(newSnippets);
                                    }}
                                />
                            </td>
                            <td>
                                <textarea
                                    value={s.replace}
                                    onChange={(e) => {
                                        const newSnippets = [...snippets];
                                        newSnippets[i].replace = e.target.value;
                                        setSnippets(newSnippets);
                                    }}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button onClick={saveSnippets}>Сохранить</button>
        </div>
    );
};

export default EditSnipets;
