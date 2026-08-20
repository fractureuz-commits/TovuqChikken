import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./quantityInput.css";
import {
    caretPositionForDigits,
    countDigits,
    formatQtyText,
    parseQty,
    sanitizeQtyInput,
    selectAllOnFocus,
} from "../../utils/quantity";

const round3 = (num) => Math.round(num * 1000) / 1000;

const MinusIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path d="M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const PlusIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/**
 * Miqdor kiritish: −  [ 1 300 003 ]  +
 * - fokus tushganda butun qiymat belgilanadi (yangi son yozish uchun)
 * - katta sonlar bo'shliq bilan ajratiladi va inputga sig'adi
 * - max berilgan bo'lsa qiymat avtomatik cheklanadi
 */
export default function QuantityInput({
    value,
    onChange,
    onCommit,
    max = null,
    min = 0,
    step = 1,
    disabled = false,
    variant = "kd",
    onLimit,
    inputProps = {},
}) {
    const inputRef = useRef(null);
    const caretRef = useRef(null);
    const [focused, setFocused] = useState(false);
    const [text, setText] = useState(() => formatQtyText(value));

    // Fokus yo'q paytda qiymat doim tashqi propdan olinadi —
    // shu tufayli ota-komponent qiymatni rad etsa, eski son qaytadi
    useEffect(() => {
        if (focused) return;
        setText(formatQtyText(value));
    }, [value, focused]);

    // Formatlashdan keyin kursor o'z joyida qolishi uchun
    useLayoutEffect(() => {
        const position = caretRef.current;
        caretRef.current = null;

        const el = inputRef.current;
        if (position === null || !el || document.activeElement !== el) return;

        try {
            el.setSelectionRange(position, position);
        } catch {
            // setSelectionRange qo'llab-quvvatlanmasa e'tiborsiz qoldiramiz
        }
    });

    const clamp = (num) => {
        let next = num;
        if (typeof min === "number" && next < min) next = min;

        if (typeof max === "number" && next > max) {
            next = max;
            onLimit?.(max);
        }

        return round3(next);
    };

    const emit = (clean) => {
        onChange?.(clean);
    };

    const handleChange = (event) => {
        const el = event.target;
        const rawValue = el.value;
        const caret = el.selectionStart ?? rawValue.length;
        const digitsBefore = countDigits(rawValue.slice(0, caret));

        let clean = sanitizeQtyInput(rawValue);

        if (clean !== "" && typeof max === "number" && parseQty(clean) > max) {
            clean = String(round3(max));
            onLimit?.(max);
        }

        const formatted = formatQtyText(clean);
        setText(formatted);
        emit(clean);

        caretRef.current = caretPositionForDigits(formatted, digitsBefore);
    };

    const handleStep = (direction) => {
        const current = parseQty(text === "" ? value : text);
        const next = clamp(current + direction * step);

        setText(formatQtyText(String(next)));
        emit(String(next));
        onCommit?.(next);
    };

    const handleFocus = (event) => {
        setFocused(true);
        selectAllOnFocus(event);
    };

    const handleBlur = () => {
        setFocused(false);

        const clean = sanitizeQtyInput(text);
        const next = clean === "" ? clamp(0) : clamp(parseQty(clean));

        setText(formatQtyText(String(next)));
        if (String(next) !== clean) emit(String(next));

        onCommit?.(next);
    };

    const wrapClass = variant === "kd" ? "kd-counter qty-control" : "qty-control qty-control--cart";
    const btnClass = variant === "kd" ? "kd-counter-btn qty-btn" : "qty-btn";
    const inputClass = variant === "kd" ? "kd-counter-input qty-input" : "qty-input qty-input--cart";

    return (
        <div className={wrapClass}>
            <button
                type="button"
                className={btnClass}
                onClick={() => handleStep(-1)}
                disabled={disabled}
                aria-label="Kamaytirish"
            >
                <MinusIcon />
            </button>

            <input
                ref={inputRef}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                className={inputClass}
                value={text}
                disabled={disabled}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                {...inputProps}
            />

            <button
                type="button"
                className={btnClass}
                onClick={() => handleStep(1)}
                disabled={disabled}
                aria-label="Ko'paytirish"
            >
                <PlusIcon />
            </button>
        </div>
    );
}
