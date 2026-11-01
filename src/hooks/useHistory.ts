import { useAtom } from "jotai";
import { historyAtom } from "../atoms/history";

const useHistory = () => {
    const [history, setHistory] = useAtom(historyAtom);

    const upsertHistory = (newData: Media.MediaHistory) => {
        setHistory((prev) => {
            const exists = prev.some(
                (item) => item.id === newData.id
            );

            if (exists) {
                return prev.map((item) =>
                    item.id === newData.id
                        ? { ...item, ...newData }
                        : item
                );
            }

            return [...prev, newData];
        });
    };

    const fetchHistory = (id: string | number) => {
        return history.filter((i) => i.id === id)[0];
    }

    const removeHistory = (id: string | number) => {
        setHistory((prev) => prev.filter((item) => item.id !== id));
    };

    const clearHistory = () => {
        setHistory([]);
    };

    return {
        history: history.sort((a, b) => Number(new Date(b.timestamp)) - Number(new Date(a.timestamp))),
        upsertHistory,
        fetchHistory,
        removeHistory,
        clearHistory,
    };
};

export default useHistory;