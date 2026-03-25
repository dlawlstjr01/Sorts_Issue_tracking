import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function GlossaryText({ text = "", glossary = [] }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipStyle, setTooltipStyle] = useState({
    top: 0,
    left: 0,
    visibility: "hidden",
  });

  const tooltipRef = useRef(null);

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

    const pattern = uniqueCandidates
      .map((item) => escapeRegExp(item.trigger))
      .join("|");

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
        uniqueCandidates.find(
          (item) => item.triggerLower === matchedText.toLowerCase()
        ) || null;

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

    return parts.length
      ? parts
      : [{ type: "text", value: sourceText, key: "text-0" }];
  }, [text, glossary]);

  const openTooltip = (event, item) => {
    const rect = event.currentTarget.getBoundingClientRect();

    setHoveredItem({
      ...item,
      rect,
    });

    setTooltipStyle({
      top: rect.bottom + 10,
      left: rect.left,
      visibility: "hidden",
    });
  };

  const closeTooltip = () => {
    setTimeout(() => {
      setHoveredItem(null);
    }, 60);
  };
  useEffect(() => {
    if (!hoveredItem || !tooltipRef.current) return;

    const tooltipEl = tooltipRef.current;
    const tooltipRect = tooltipEl.getBoundingClientRect();
    const margin = 12;

    let top = hoveredItem.rect.bottom + 10;
    let left = hoveredItem.rect.left;

    if (left + tooltipRect.width > window.innerWidth - margin) {
      left = window.innerWidth - tooltipRect.width - margin;
    }

    if (left < margin) {
      left = margin;
    }

    if (top + tooltipRect.height > window.innerHeight - margin) {
      top = hoveredItem.rect.top - tooltipRect.height - 10;
    }

    if (top < margin) {
      top = margin;
    }

    setTooltipStyle({
      top,
      left,
      visibility: "visible",
    });
  }, [hoveredItem]);

  useEffect(() => {
    if (!hoveredItem) return;

    const handleScrollOrResize = () => {
      setHoveredItem(null);
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [hoveredItem]);

  return (
    <>
      <span className="glossary-text">
        {parsedParts.map((item) => {
          if (item.type === "term") {
            return (
              <span
                key={item.key}
                className="glossary-term"
                title=""
                onMouseEnter={(event) => openTooltip(event, item)}
                onMouseLeave={closeTooltip}
              >
                {item.value}
              </span>
            );
          }

          return <React.Fragment key={item.key}>{item.value}</React.Fragment>;
        })}
      </span>

      {hoveredItem &&
        createPortal(
          <div
            ref={tooltipRef}
            className="glossary-tooltip glossary-tooltip-fixed"
            style={{
              position: "fixed",
              top: `${tooltipStyle.top}px`,
              left: `${tooltipStyle.left}px`,
              visibility: tooltipStyle.visibility,
              zIndex: 999999,
              pointerEvents: "none",
            }}
          >
            <strong className="glossary-tooltip-alias">
              {hoveredItem.alias || hoveredItem.value}
            </strong>
            <span className="glossary-tooltip-meaning">
              {hoveredItem.meaning}
            </span>
          </div>,
          document.body
        )}
    </>
  );
}

export default memo(GlossaryText);
