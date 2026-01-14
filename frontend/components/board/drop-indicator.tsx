"use client";

import { Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/types";

interface DropIndicatorProps {
  edge: Edge | null;
  gap?: number; // Gap in pixels (e.g., 12 for mb-3)
  className?: string;
}

export const DropIndicator = ({
  edge,
  gap = 12,
  className,
}: DropIndicatorProps) => {
  if (!edge) return null;

  const isVertical = edge === "top" || edge === "bottom";

  // Blue color matching Jira/Trello style
  const indicatorColor = "#0052CC";

  // Offset logic:
  // If gap is 12px, center is at 6px.
  // Line is 2px height.
  // To center a 2px line at 6px, its edges should be [5, 7].
  // So offset from element edge should be 7px.
  const offset = -Math.round(gap / 2 + 1);

  const positionStyles: React.CSSProperties = {
    position: "absolute",
    backgroundColor: indicatorColor,
    zIndex: 100,
    pointerEvents: "none",
    height: isVertical ? "2px" : "auto",
    width: !isVertical ? "2px" : "auto",
  };

  if (isVertical) {
    // To prevent the 8px dot (which hangs -4px off the line) from being clipped
    // by overflow: hidden/auto containers, we offset the whole line box by 4px.
    positionStyles.left = "4px";
    positionStyles.right = "4px";
    if (edge === "top") {
      positionStyles.top = `${offset}px`;
    } else {
      positionStyles.bottom = `${offset}px`;
    }
  } else {
    positionStyles.top = "0px";
    positionStyles.bottom = "0px";
    if (edge === "left") {
      positionStyles.left = `${offset}px`;
    } else {
      positionStyles.right = `${offset}px`;
    }
  }

  const dotStyles: React.CSSProperties = {
    position: "absolute",
    width: "8px",
    height: "8px",
    backgroundColor: indicatorColor,
    borderRadius: "50%",
    zIndex: 101,
  };

  if (isVertical) {
    dotStyles.top = "50%";
    dotStyles.left = "-4px";
    dotStyles.transform = "translateY(-50%)";
  } else {
    dotStyles.left = "50%";
    dotStyles.top = "50%";
    dotStyles.transform = "translate(-50%, -50%)";
  }

  return (
    <div
      style={positionStyles}
      className={className}
      data-drop-indicator="true"
    >
      <div style={dotStyles} />
    </div>
  );
};
