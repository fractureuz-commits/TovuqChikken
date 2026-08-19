import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./tileGrid.css";
import {
    GRID_COLS,
    GRID_GAP,
    LAYOUT_STORAGE_KEY,
    MAX_H,
    MIN_H,
    MIN_W,
    buildDefaultLayout,
    clearStoredLayout,
    compactLayout,
    layoutRows,
    layoutsEqual,
    loadStoredLayout,
    placeTile,
    reconcileLayout,
    saveStoredLayout,
} from "./tileLayout";

// Tugmani nechchi millisekund ushlab tursa tahrirlash rejimi ochiladi
const HOLD_MS = 4000;
// Touch'dan keyin brauzer "compatibility" sichqoncha hodisalarini ham yuboradi.
// Shu sabab bitta bosish ikki marta ishlab ketardi - shu oraliqda mouse e'tiborsiz.
const GHOST_MOUSE_MS = 900;
// Bitta tugma shu oraliqda faqat bir marta ishga tushadi
const ACTIVATE_GAP_MS = 400;
// Shu masofadan ko'p surilsa - bu bosish emas, scroll (ushlab turish bekor bo'ladi)
const MOVE_TOLERANCE = 12;
const EDGE_SCROLL_ZONE = 76;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const vibrate = (pattern) => {
    try {
        navigator.vibrate?.(pattern);
    } catch {
        /* qurilma qo'llab-quvvatlamasa e'tiborsiz */
    }
};

const defaultSizeForViewport = () => {
    const wide = typeof window !== "undefined" && window.innerWidth >= 768;
    return { defaultW: wide ? 2 : 3, defaultH: 3 };
};

// Touch bilan bosilgach brauzer ~300ms dan keyin "compatibility" sichqoncha
// hodisalarini (mousedown/mouseup/click) ham yuboradi. Tugma pointerup da
// ishlagani uchun bu soxta bosish endigina ochilgan Swal modalning ustiga
// tushib, uni darrov yopib qo'yardi. Shuning uchun touch bosilishidan keyin
// qisqa vaqt davomida soxta sichqoncha hodisalari to'sib qo'yiladi.
const GHOST_EVENT_TYPES = ["mousedown", "mouseup", "click", "dblclick"];

const blockGhostMouseEvents = () => {
    if (typeof document === "undefined") return;

    let timer = 0;

    const swallow = (event) => {
        // Haqiqiy sichqoncha (touch'dan kelib chiqmagan) - tegmaymiz
        if (event.sourceCapabilities?.firesTouchEvents === false) return;
        event.stopPropagation();
        event.preventDefault();
    };

    const release = () => {
        clearTimeout(timer);
        for (const type of GHOST_EVENT_TYPES) document.removeEventListener(type, swallow, true);
        document.removeEventListener("touchstart", release, true);
        document.removeEventListener("pointerdown", handlePointerDown, true);
    };

    // Foydalanuvchi yangidan tegsa - bu soxta emas, darrov qo'yib yuboramiz
    const handlePointerDown = (event) => {
        if (event.pointerType !== "mouse") release();
    };

    for (const type of GHOST_EVENT_TYPES) document.addEventListener(type, swallow, true);
    document.addEventListener("touchstart", release, true);
    document.addEventListener("pointerdown", handlePointerDown, true);
    timer = setTimeout(release, GHOST_MOUSE_MS);
};

function TileGrid({ tiles, storageKey = LAYOUT_STORAGE_KEY }) {
    const containerRef = useRef(null);
    const scrollerRef = useRef(null);
    const nodeRefs = useRef(new Map());
    const dragRef = useRef(null);
    const holdRef = useRef(null);
    const pressRef = useRef(null);
    const autoScrollRef = useRef(0);
    const editingRef = useRef(false);
    const lastTouchAtRef = useRef(0);
    const lastActivateRef = useRef({ id: null, at: 0 });

    const ids = useMemo(() => tiles.map((tile) => tile.id), [tiles]);
    const idsKey = ids.join("|");

    const [size, setSize] = useState({ width: 0 });
    const [editing, setEditing] = useState(false);
    const [drag, setDrag] = useState(null);
    const [layout, setLayout] = useState(() =>
        reconcileLayout(loadStoredLayout(storageKey), ids, {
            cols: GRID_COLS,
            ...defaultSizeForViewport(),
        })
    );

    const layoutRef = useRef(layout);
    layoutRef.current = layout;
    editingRef.current = editing;

    // Ruxsatlar o'zgarsa (tugmalar qo'shilsa/olib tashlansa) layout moslanadi
    const knownIdsRef = useRef(idsKey);
    useEffect(() => {
        if (knownIdsRef.current === idsKey) return;
        knownIdsRef.current = idsKey;
        setLayout((prev) =>
            reconcileLayout(prev, idsKey ? idsKey.split("|") : [], {
                cols: GRID_COLS,
                ...defaultSizeForViewport(),
            })
        );
    }, [idsKey]);

    // Konteyner kengligini kuzatib turamiz - katakcha o'lchami shundan chiqadi
    useLayoutEffect(() => {
        const node = containerRef.current;
        if (!node) return undefined;

        scrollerRef.current = node.closest(".home-body") || null;

        const measure = (value) => {
            const width = value ?? node.clientWidth;
            setSize((prev) => (Math.abs(prev.width - width) < 0.5 ? prev : { width }));
        };

        measure();

        // Ekran burilishi / klaviatura ochilishi - ResizeObserver bo'lmagan
        // eski WebView'larda ham ishlashi uchun zaxira yo'l
        const handleResize = () => measure();
        window.addEventListener("resize", handleResize);
        window.addEventListener("orientationchange", handleResize);

        let observer = null;
        if (typeof ResizeObserver !== "undefined") {
            observer = new ResizeObserver((entries) => measure(entries[0]?.contentRect?.width));
            observer.observe(node);
        }

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("orientationchange", handleResize);
            observer?.disconnect();
        };
    }, []);

    const geom = useMemo(() => {
        const cols = GRID_COLS;
        const gap = GRID_GAP;
        const cellW = size.width > 0 ? (size.width - gap * (cols - 1)) / cols : 0;
        const rowH = cellW > 0 ? clamp(cellW * 0.6, 26, 56) : 0;

        return { cols, gap, cellW, rowH };
    }, [size.width]);

    const geomRef = useRef(geom);
    geomRef.current = geom;

    const rectToPx = useCallback((item) => {
        const { cellW, rowH, gap } = geomRef.current;
        return {
            left: item.x * (cellW + gap),
            top: item.y * (rowH + gap),
            width: item.w * cellW + (item.w - 1) * gap,
            height: item.h * rowH + (item.h - 1) * gap,
        };
    }, []);

    const commitLayout = useCallback(
        (next) => {
            setLayout((prev) => (layoutsEqual(prev, next) ? prev : next));
            saveStoredLayout(next, storageKey);
        },
        [storageKey]
    );

    /* ---------------- ushlab turish (long press) ---------------- */

    const cancelHold = useCallback(() => {
        const hold = holdRef.current;
        if (!hold) return;

        holdRef.current = null;
        if (hold.frame) cancelAnimationFrame(hold.frame);
        if (hold.timer) clearTimeout(hold.timer);
        hold.node?.classList.remove("is-holding");
        hold.node?.style.removeProperty("--hold");
    }, []);

    /* ---------------- surish / o'lcham o'zgartirish ---------------- */

    const writeVisual = useCallback(() => {
        const session = dragRef.current;
        if (!session) return;

        const { node, visual } = session;
        if (!node) return;

        node.style.transform = `translate3d(${visual.left}px, ${visual.top}px, 0)`;
        node.style.width = `${visual.width}px`;
        node.style.height = `${visual.height}px`;
        node.style.setProperty("--tile-min", `${Math.min(visual.width, visual.height)}px`);
    }, []);

    const applyTarget = useCallback((next) => {
        const session = dragRef.current;
        if (!session) return;

        const prev = session.target;
        if (prev.x === next.x && prev.y === next.y && prev.w === next.w && prev.h === next.h) return;

        session.target = next;
        const preview = placeTile(session.base, session.id, next, geomRef.current.cols);
        session.preview = preview;
        setDrag((current) => (current ? { ...current, preview } : current));
    }, []);

    const updateDrag = useCallback(
        (point) => {
            const session = dragRef.current;
            const container = containerRef.current;
            if (!session || !container) return;

            session.point = point;
            const { cellW, rowH, gap, cols } = geomRef.current;
            const containerRect = container.getBoundingClientRect();

            if (session.mode === "move") {
                const left = point.x - session.grab.dx - containerRect.left;
                const top = point.y - session.grab.dy - containerRect.top;

                session.visual = { ...session.visual, left, top };
                applyTarget({
                    ...session.target,
                    x: clamp(Math.round(left / (cellW + gap)), 0, cols - session.target.w),
                    y: Math.max(0, Math.round(top / (rowH + gap))),
                });
            } else {
                const freeCols = cols - session.target.x;
                const maxWidth = freeCols * cellW + (freeCols - 1) * gap;
                const width = clamp(
                    session.origin.width + (point.x - session.start.x),
                    MIN_W * cellW,
                    maxWidth
                );
                const height = clamp(
                    session.origin.height + (point.y - session.start.y),
                    MIN_H * rowH + (MIN_H - 1) * gap,
                    MAX_H * rowH + (MAX_H - 1) * gap
                );

                session.visual = { ...session.visual, width, height };
                applyTarget({
                    ...session.target,
                    w: clamp(Math.round((width + gap) / (cellW + gap)), MIN_W, freeCols),
                    h: clamp(Math.round((height + gap) / (rowH + gap)), MIN_H, MAX_H),
                });
            }

            writeVisual();
        },
        [applyTarget, writeVisual]
    );

    const stopAutoScroll = useCallback(() => {
        if (!autoScrollRef.current) return;
        cancelAnimationFrame(autoScrollRef.current);
        autoScrollRef.current = 0;
    }, []);

    const autoScrollStep = useCallback(() => {
        const session = dragRef.current;
        const scroller = scrollerRef.current;

        if (!session || !scroller) {
            autoScrollRef.current = 0;
            return;
        }

        const rect = scroller.getBoundingClientRect();
        const top = rect.top + EDGE_SCROLL_ZONE;
        const bottom = rect.bottom - EDGE_SCROLL_ZONE;
        let delta = 0;

        if (session.point.y < top) delta = -Math.ceil((top - session.point.y) / 5);
        else if (session.point.y > bottom) delta = Math.ceil((session.point.y - bottom) / 5);

        if (delta) {
            const before = scroller.scrollTop;
            scroller.scrollTop = clamp(before + delta, 0, scroller.scrollHeight - scroller.clientHeight);
            if (scroller.scrollTop !== before) updateDrag(session.point);
        }

        autoScrollRef.current = requestAnimationFrame(autoScrollStep);
    }, [updateDrag]);

    const beginDrag = useCallback(
        (mode, id, point) => {
            const node = nodeRefs.current.get(id);
            const item = layoutRef.current.find((entry) => entry.id === id);
            if (!node || !item || geomRef.current.cellW <= 0) return;

            const nodeRect = node.getBoundingClientRect();
            const base = layoutRef.current;
            const origin = rectToPx(item);

            dragRef.current = {
                id,
                mode,
                node,
                base,
                preview: base,
                target: { x: item.x, y: item.y, w: item.w, h: item.h },
                origin,
                visual: { ...origin },
                grab: { dx: point.x - nodeRect.left, dy: point.y - nodeRect.top },
                start: point,
                point,
            };

            setDrag({ id, mode, preview: base });
            writeVisual();

            stopAutoScroll();
            autoScrollRef.current = requestAnimationFrame(autoScrollStep);
        },
        [autoScrollStep, rectToPx, stopAutoScroll, writeVisual]
    );

    const endDrag = useCallback(
        (commit) => {
            const session = dragRef.current;
            if (!session) return;

            dragRef.current = null;
            stopAutoScroll();

            const next = commit
                ? placeTile(session.base, session.id, session.target, geomRef.current.cols)
                : session.base;

            // Barmoq uzilgan joydan o'z katagiga silliq uchib borishi uchun
            // avval transition qaytariladi, keyin yakuniy joylashuv yoziladi.
            const node = session.node;
            const landing = next.find((entry) => entry.id === session.id);
            if (node && landing) {
                const box = rectToPx(landing);
                node.classList.remove("is-dragging", "is-move", "is-resize");
                node.style.transform = `translate3d(${box.left}px, ${box.top}px, 0)`;
                node.style.width = `${box.width}px`;
                node.style.height = `${box.height}px`;
                node.style.setProperty("--tile-min", `${Math.min(box.width, box.height)}px`);
            }

            setDrag(null);
            commitLayout(next);
            if (commit) vibrate(12);
        },
        [commitLayout, rectToPx, stopAutoScroll]
    );

    // Drag paytida barmoq bilan sahifa scroll bo'lib ketmasligi uchun
    useEffect(() => {
        const preventTouchScroll = (event) => {
            if (dragRef.current && event.cancelable) event.preventDefault();
        };

        window.addEventListener("touchmove", preventTouchScroll, { passive: false });
        return () => window.removeEventListener("touchmove", preventTouchScroll);
    }, []);

    useEffect(() => () => {
        stopAutoScroll();
        cancelHold();
    }, [cancelHold, stopAutoScroll]);

    // Scroll qilinsa ushlab turish bekor qilinadi
    useEffect(() => {
        const scroller = scrollerRef.current;
        if (!scroller) return undefined;

        const handleScroll = () => {
            if (!dragRef.current) cancelHold();
        };

        scroller.addEventListener("scroll", handleScroll, { passive: true });
        return () => scroller.removeEventListener("scroll", handleScroll);
    }, [cancelHold]);

    const exitEditing = useCallback(() => {
        endDrag(false);
        cancelHold();
        setEditing(false);
    }, [cancelHold, endDrag]);

    useEffect(() => {
        if (!editing) return undefined;

        const handleKey = (event) => {
            if (event.key === "Escape") exitEditing();
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [editing, exitEditing]);

    const startHold = useCallback(
        (id, point) => {
            const node = nodeRefs.current.get(id);
            if (!node) return;

            cancelHold();
            node.classList.add("is-holding");
            node.style.setProperty("--hold", "0");

            const startedAt = performance.now();

            // Progress - faqat vizual. Rejimni ochish esa taymerga bog'liq,
            // shuning uchun rAF sekinlashsa ham 4 soniyada aniq ishlaydi.
            const step = (now) => {
                const hold = holdRef.current;
                if (!hold) return;

                node.style.setProperty("--hold", Math.min(1, (now - startedAt) / HOLD_MS).toFixed(3));
                hold.frame = requestAnimationFrame(step);
            };

            const complete = () => {
                const hold = holdRef.current;
                if (!hold) return;

                cancelHold();
                setEditing(true);
                vibrate([18, 40, 18]);
                beginDrag("move", id, hold.point);
            };

            holdRef.current = {
                id,
                node,
                point,
                frame: requestAnimationFrame(step),
                timer: setTimeout(complete, HOLD_MS),
            };
        },
        [beginDrag, cancelHold]
    );

    /* ---------------- pointer hodisalari ---------------- */

    // Bitta bosish - bitta ishga tushirish (ikki marta bosilib ketmasligi uchun)
    const activateTile = useCallback((tile) => {
        const now = Date.now();
        const last = lastActivateRef.current;
        if (last.id === tile.id && now - last.at < ACTIVATE_GAP_MS) return;

        lastActivateRef.current = { id: tile.id, at: now };
        tile.onClick?.();
    }, []);

    const handlePointerDown = useCallback(
        (event, tile) => {
            if (event.pointerType === "mouse" && event.button !== 0) return;
            // Touch'dan keyingi soxta (ghost) sichqoncha hodisasi - o'tkazib yuboriladi
            if (event.pointerType === "mouse" && Date.now() - lastTouchAtRef.current < GHOST_MOUSE_MS) return;
            if (event.pointerType !== "mouse") lastTouchAtRef.current = Date.now();
            if (tile.disabled) return;
            // Ikkinchi barmoq birinchi jarayonni buzmasligi uchun
            if (pressRef.current || dragRef.current) return;

            const node = nodeRefs.current.get(tile.id);
            if (!node) return;

            try {
                node.setPointerCapture(event.pointerId);
            } catch {
                /* capture bo'lmasa ham window listenerlar ishlaydi */
            }

            const point = { x: event.clientX, y: event.clientY };
            pressRef.current = { id: tile.id, pointerId: event.pointerId, start: point, moved: false };

            if (editingRef.current) beginDrag("move", tile.id, point);
            else startHold(tile.id, point);
        },
        [beginDrag, startHold]
    );

    const handleResizeDown = useCallback(
        (event, tile) => {
            event.stopPropagation();
            event.preventDefault();
            if (pressRef.current || dragRef.current) return;

            const node = nodeRefs.current.get(tile.id);
            if (!node) return;

            try {
                node.setPointerCapture(event.pointerId);
            } catch {
                /* e'tiborsiz */
            }

            const point = { x: event.clientX, y: event.clientY };
            pressRef.current = { id: tile.id, pointerId: event.pointerId, start: point, moved: true };
            beginDrag("resize", tile.id, point);
        },
        [beginDrag]
    );

    const handlePointerMove = useCallback(
        (event) => {
            const press = pressRef.current;
            if (!press || press.pointerId !== event.pointerId) return;

            const point = { x: event.clientX, y: event.clientY };
            const distance = Math.hypot(point.x - press.start.x, point.y - press.start.y);

            if (distance > MOVE_TOLERANCE) {
                press.moved = true;
                if (!dragRef.current) cancelHold();
            } else if (holdRef.current) {
                // barmoq bir oz siljisa ham drag aynan shu nuqtadan boshlanadi
                holdRef.current.point = point;
            }

            if (dragRef.current) updateDrag(point);
        },
        [cancelHold, updateDrag]
    );

    const handlePointerUp = useCallback(
        (event, tile) => {
            const press = pressRef.current;
            if (!press || press.pointerId !== event.pointerId) return;

            if (event.pointerType !== "mouse") lastTouchAtRef.current = Date.now();

            pressRef.current = null;
            const wasDragging = Boolean(dragRef.current);

            cancelHold();

            if (wasDragging) {
                endDrag(true);
                return;
            }

            if (!editingRef.current && !press.moved && !tile.disabled) {
                // Modal ochilgach soxta sichqoncha bosishi uni yopib
                // yubormasligi uchun oldindan to'sib qo'yamiz
                if (event.pointerType !== "mouse") blockGhostMouseEvents();
                activateTile(tile);
            }
        },
        [activateTile, cancelHold, endDrag]
    );

    const handlePointerCancel = useCallback(
        (event) => {
            const press = pressRef.current;
            if (press && press.pointerId !== event.pointerId) return;

            pressRef.current = null;
            cancelHold();
            if (dragRef.current) endDrag(false);
        },
        [cancelHold, endDrag]
    );

    /* ---------------- tahrirlash paneli ---------------- */

    const handleCompact = useCallback(() => {
        commitLayout(compactLayout(layoutRef.current));
        vibrate(10);
    }, [commitLayout]);

    const handleReset = useCallback(() => {
        clearStoredLayout(storageKey);
        const next = buildDefaultLayout(ids, { cols: GRID_COLS, ...defaultSizeForViewport() });
        commitLayout(next);
        vibrate(10);
    }, [commitLayout, ids, storageKey]);

    /* ---------------- render ---------------- */

    const activeLayout = drag?.preview || layout;
    const positions = useMemo(() => new Map(activeLayout.map((item) => [item.id, item])), [activeLayout]);
    const { cellW, rowH, gap } = geom;

    // Ekran o'lchami o'zgarganda (mount, aylantirish, klaviatura) tugmalar
    // animatsiyasiz darrov joyiga tushishi kerak - faqat foydalanuvchi
    // surganda animatsiya bo'ladi.
    const lastCellWRef = useRef(0);
    const geometryShifted = lastCellWRef.current !== cellW;
    lastCellWRef.current = cellW;

    const rows = layoutRows(activeLayout);
    const gridHeight = rows > 0 && rowH > 0 ? rows * rowH + (rows - 1) * gap : 0;
    const ready = cellW > 0;

    return (
        <>
            <div
                ref={containerRef}
                className={`tile-grid${editing ? " is-editing" : ""}${drag ? " is-dragging-any" : ""}${geometryShifted ? " is-static" : ""}`}
                style={{ height: gridHeight ? `${gridHeight}px` : undefined }}
                onPointerDown={(event) => {
                    if (editingRef.current && event.target === containerRef.current) exitEditing();
                }}
            >
                {ready &&
                    tiles.map((tile) => {
                        const item = positions.get(tile.id);
                        if (!item) return null;

                        const isDragging = drag?.id === tile.id;
                        const box = isDragging && dragRef.current ? dragRef.current.visual : rectToPx(item);

                        return (
                            <div
                                key={tile.id}
                                ref={(node) => {
                                    if (node) nodeRefs.current.set(tile.id, node);
                                    else nodeRefs.current.delete(tile.id);
                                }}
                                className={`tile${isDragging ? ` is-dragging is-${drag.mode}` : ""}`}
                                style={{
                                    transform: `translate3d(${box.left}px, ${box.top}px, 0)`,
                                    width: `${box.width}px`,
                                    height: `${box.height}px`,
                                    "--tile-min": `${Math.min(box.width, box.height)}px`,
                                    animationDelay: `${(tile.id.length % 5) * 60}ms`,
                                }}
                                onPointerDown={(event) => handlePointerDown(event, tile)}
                                onPointerMove={handlePointerMove}
                                onPointerUp={(event) => handlePointerUp(event, tile)}
                                onPointerCancel={handlePointerCancel}
                                onContextMenu={(event) => event.preventDefault()}
                            >
                                <button
                                    type="button"
                                    className="tile-inner"
                                    tabIndex={editing ? -1 : 0}
                                    aria-label={tile.label}
                                    onClick={(event) => event.preventDefault()}
                                    onKeyDown={(event) => {
                                        if (editing) return;
                                        if (event.key === "Enter" || event.key === " ") {
                                            event.preventDefault();
                                            activateTile(tile);
                                        }
                                    }}
                                >
                                    <span className="tile-icon">{tile.icon}</span>
                                    <span className="tile-label">{tile.label}</span>
                                    <span className="tile-hold" aria-hidden="true" />
                                </button>

                                {editing && (
                                    <span
                                        className="tile-resize"
                                        role="presentation"
                                        onPointerDown={(event) => handleResizeDown(event, tile)}
                                    >
                                        <svg viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M21 21H15M21 21V15M21 21L14 14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M9 21H3M3 21V15" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
                                        </svg>
                                    </span>
                                )}
                            </div>
                        );
                    })}
            </div>

            {editing && (
                <div className="tile-editbar" role="toolbar">
                    <p className="tile-editbar-hint">Tugmani suring yoki burchagidan cho&apos;zing</p>
                    <div className="tile-editbar-actions">
                        <button type="button" className="tile-editbar-btn ghost" onClick={handleReset}>
                            Standart
                        </button>
                        <button type="button" className="tile-editbar-btn ghost" onClick={handleCompact}>
                            Tartiblash
                        </button>
                        <button type="button" className="tile-editbar-btn primary" onClick={exitEditing}>
                            Tayyor
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default TileGrid;
