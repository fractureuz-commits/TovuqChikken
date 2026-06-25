import { useEffect } from "react";
import "./modal.css";
import { useBackHandler } from "../../utils/backButtonStack";

export default function Modal({ open, onClose, title, children }) {
    useBackHandler(onClose, open);

    // Body scroll lock
    useEffect(() => {
        if (open) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    if (!open) return null;

    return (
        <div className="m-overlay" onClick={onClose}>
            <div
                className="m-sheet"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Handle */}
                {/* <div className="m-handle" /> */}

                {/* Header */}
                {title && (
                    <div className="m-header">
                        <h2 className="m-title">{title}</h2>
                        <button className="m-close" onClick={onClose}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="m-body">
                    {children}
                </div>
            </div>
        </div>
    );
}
