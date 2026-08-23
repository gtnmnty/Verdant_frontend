"use client";

import {useReveal} from "@/hooks/useReveal";
import React from "react";

interface RevealProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}

export function Reveal({children, delay = 0, className = ""}: RevealProps) {
    const {ref, visible} = useReveal<HTMLDivElement>();
    return (
        <div
            ref={ref}
            style={{transitionDelay: `${delay}ms`}}
            className={`transform transition-all duration-900 ease-out ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            } ${className}`}
        >
            {children}
        </div>
    );
}