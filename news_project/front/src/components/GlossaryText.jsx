import React, { useMemo, useState } from "react";

function escapeRegExp(value) {
    return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function GlossaryText({ text = "", glossary = [] }) {
    const [hoveredKey, setHoveredKey] = useState(null);

    const parsedParts = useMemo(() => {
        const sourceText = String(text || "");
        if (!sourceText.trim() || !Array.isArray(glossary) || !glossary.length) {
            return [{ type: "text", value: sourceText, key: "text-0" }];
        }

        const lowerText = sourceText.toLowerCase();

        const candidates = glossary
            .flatMap((item) => {
                const result = [];
                const word = String(item?.word || "").trim();
                const alias = String(item?.alias || "").trim();
                const meaning = String(item?.meaning || "").trim();

                if (!meaning) return result;

                if (word && lowerText.includes(word.toLowerCase())) {
                    result.push({
                        trigger: word,
                        triggerLower: word.toLowerCase(),
                        meaning,
                        word,
                        alias,
                    });
                }

                if (alias && lowerText.includes(alias.toLowerCase())) {
                    result.push({
                        trigger: alias,
                        triggerLower: alias.toLowerCase(),
                        meaning,
                        word,
                        alias,
                    });
                }

                return result;
            })
            .filter((item) => item.trigger.length >= 2)
            .sort((a, b) => b.trigger.length - a.trigger.length);

        if (!candidates.length) {
            return [{ type: "text", value: sourceText, key: "text-0" }];
        }

        const uniqueMap = new Map();
        candidates.forEach((item) => {
            const key = item.triggerLower;
            if (!uniqueMap.has(key)) uniqueMap.set(key, item);
        });

        const uniqueCandidates = Array.from(uniqueMap.values());

        const pattern = uniqueCandidates.map((item) => escapeRegExp(item.trigger)).join("|");
        if (!pattern) {
            return [{ type: "text", value: sourceText, key: "text-0" }];
        }

        const regex = new RegExp(`(${pattern})`, "gi");
        const parts = [];
        let lastIndex = 0;
        let match;
        let termIndex = 0;

        while ((match = regex.exec(sourceText)) !== null) {
            const matchedText = match[0];
            const start = match.index;
            const end = start + matchedText.length;

            if (start > lastIndex) {
                parts.push({
                    type: "text",
                    value: sourceText.slice(lastIndex, start),
                    key: `text-${lastIndex}`,
                });
            }

            const matchedCandidate =
                uniqueCandidates.find((item) => item.triggerLower === matchedText.toLowerCase()) || null;

            if (matchedCandidate) {
                parts.push({
                    type: "term",
                    value: matchedText,
                    meaning: matchedCandidate.meaning,
                    word: matchedCandidate.word,
                    alias: matchedCandidate.alias,
                    key: `term-${termIndex}-${start}`,
                });
                termIndex += 1;
            } else {
                parts.push({
                    type: "text",
                    value: matchedText,
                    key: `text-${start}`,
                });
            }

            lastIndex = end;
        }

        if (lastIndex < sourceText.length) {
            parts.push({
                type: "text",
                value: sourceText.slice(lastIndex),
                key: `text-${lastIndex}`,
            });
        }

        return parts.length ? parts : [{ type: "text", value: sourceText, key: "text-0" }];
    }, [text, glossary]);

    return (
        <span className="glossary-text">
            {parsedParts.map((item) => {
                if (item.type === "term") {
                    return (
                        <span
                            key={item.key}
                            className="glossary-term"
                            title={`${item.word}${item.alias ? `\n${item.alias}` : ""}\n${item.meaning}`}
                            onMouseEnter={() => setHoveredKey(item.key)}
                            onMouseLeave={() => setHoveredKey(null)}
                        >
                            {item.value}
                            {hoveredKey === item.key && (
                                <span className="glossary-tooltip">
                                    <strong className="glossary-tooltip-alias">{item.alias || item.value}</strong>
                                    <span className="glossary-tooltip-meaning">{item.meaning}</span>
                                </span>
                            )}
                        </span>
                    );
                }

                return <React.Fragment key={item.key}>{item.value}</React.Fragment>;
            })}
        </span>
    );
}