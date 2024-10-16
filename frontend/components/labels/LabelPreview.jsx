// frontend/components/labels/LabelPreview.jsx
import React, { useEffect, useCallback } from 'react';

const LabelPreview = ({ labelConfig, zoomLevel, textStyle, textOptionsVisible }) => {
  const updateLabel = useCallback(() => {
    const labelCanvas = document.getElementById('labelCanvas');
    const { labelWidth, labelHeight } = labelConfig;
    if (labelCanvas) {
      labelCanvas.style.width = `${labelWidth}mm`;
      labelCanvas.style.height = `${labelHeight}mm`;
      const scale = zoomLevel / 100;
      labelCanvas.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }
  }, [labelConfig, zoomLevel]);

  useEffect(() => {
    updateLabel();
  }, [updateLabel]);

  return (
    <div className="relative mb-4 h-96 w-full overflow-hidden border border-gray-300">
      <div
        id="labelCanvas"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-gray-500"
      >
        {textOptionsVisible && (
          <div
            contentEditable="true"
            className="absolute min-h-[20px] min-w-[50px] cursor-move border bg-white p-2"
            style={{
              fontFamily: textStyle.fontFamily,
              fontSize: textStyle.fontSize,
              color: textStyle.color,
              textAlign: textStyle.textAlign
            }}
          >
            Texte
          </div>
        )}
      </div>
    </div>
  );
};

export default LabelPreview;
