// frontend/components/labels/ZoomControls.jsx
import React from 'react';

const ZoomControls = ({ zoomLevel, setZoomLevel }) => {
  const changeZoom = (delta) => {
    setZoomLevel((prevZoom) => Math.max(10, Math.min(500, prevZoom + delta)));
  };

  return (
    <div className="flex items-center justify-center space-x-4">
      <button
        className="rounded border bg-gray-200 px-3 py-1 dark:bg-gray-700"
        onClick={() => changeZoom(-10)}
      >
        -
      </button>
      <input
        type="number"
        id="zoomLevel"
        className="w-16 border border-gray-300 text-center dark:bg-dark-background dark:text-dark-text"
        value={zoomLevel}
        onChange={(e) => setZoomLevel(Math.max(10, Math.min(500, parseInt(e.target.value))))}
      />
      <span>%</span>
      <button
        className="rounded border bg-gray-200 px-3 py-1 dark:bg-gray-700"
        onClick={() => changeZoom(10)}
      >
        +
      </button>
    </div>
  );
};

export default ZoomControls;
