"use client";

import {useEffect, useState, type ReactNode} from "react";

export function Transition({activeKey, children, }: { activeKey: string; children: ReactNode; }) {
    const [visible, setVisible] = useState(true);
    const [displayKey, setDisplayKey] = useState(activeKey);
    const [content, setContent] = useState(children);

    useEffect(() => {
        if (activeKey !== displayKey) {
            setVisible(false);
            const t = setTimeout(() => {
                setDisplayKey(activeKey);
                setContent(children);
                setVisible(true);
            }, 180);
            return () => clearTimeout(t);
        }
        setContent(children);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeKey, children]);

    return (
        <div
            className={`transition-all duration-200 ease-out ${
                visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
            }`}
        >
            {content}
        </div>
    );
}
