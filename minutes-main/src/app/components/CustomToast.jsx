import { useState, useEffect } from "react";

const CustomToast = ({ message, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "red",
        color: "white",
        padding: "10px 20px",
        borderRadius: "5px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      {message}
      <button
        onClick={onClose}
        style={{
          background: "white",
          color: "red",
          border: "none",
          cursor: "pointer",
          padding: "5px",
          borderRadius: "3px",
        }}
      >
        ✖
      </button>
    </div>
  );
};

export default CustomToast;
