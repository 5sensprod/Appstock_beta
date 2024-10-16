// frontend/components/labels/LayoutGrid.jsx
import React, { useEffect, useCallback } from 'react';

const LayoutGrid = ({ labelConfig }) => {
  const updateGrid = useCallback(() => {
    const {
      labelWidth,
      labelHeight,
      offsetTop,
      offsetLeft,
      spacingVertical,
      spacingHorizontal
    } = labelConfig;
    const pageWidth = 210;
    const pageHeight = 297;
    const availableWidth = pageWidth - offsetLeft;
    const availableHeight = pageHeight - offsetTop;

    const labelsPerRow = Math.floor(
      (availableWidth + spacingHorizontal) /
        (labelWidth + spacingHorizontal)
    );
    const labelsPerColumn = Math.floor(
      (availableHeight + spacingVertical) /
        (labelHeight + spacingVertical)
    );

    const gridContainer = document.getElementById('gridContainer');
    if (gridContainer) {
      gridContainer.innerHTML = '';

      for (let row = 0; row < labelsPerColumn; row++) {
        for (let col = 0; col < labelsPerRow; col++) {
          const label = document.createElement('div');
          label.className = 'absolute border border-gray-300 bg-gray-400';
          label.style.width = `${(labelWidth / pageWidth) * 100}%`;
          label.style.height = `${(labelHeight / pageHeight) * 100}%`;
          label.style.left = `${((offsetLeft + col * (labelWidth + spacingHorizontal)) / pageWidth) * 100}%`;
          label.style.top = `${((offsetTop + row * (labelHeight + spacingVertical)) / pageHeight) * 100}%`;
          gridContainer.appendChild(label);
        }
      }
    }
  }, [labelConfig]);

  useEffect(() => {
    updateGrid();
  }, [updateGrid]);

  return (
    <div className="relative w-full border-2 border-gray-300 bg-light-background pb-[141.4%] shadow-xl dark:bg-dark-background">
      <div
        id="gridContainer"
        className="absolute left-0 top-0 size-full"
      ></div>
    </div>
  );
};

export default LayoutGrid;
