
import React, { useMemo } from "react";
import './dropSearch.css';
function SearchAndSelect({
    selectitem,
    formDataHududname,
    formData,
    setFormData,
    items, selectname,
    width, marginTop,
    formdataName, OnModal,
    search,
    setSearch,
    OnSelect,
    color
}) {
    const [open, setOpen] = React.useState(false);
    const matchesSearch = (item, query) => {
        const haystack = [
            item?.name,
            item?.tel_1,
            item?.tel_2,
            item?.viloyat,
            item?.shahar,
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .replace(/\s+/g, " ");
        const tokens = query.toLowerCase().trim().split(/\s+/);
        return tokens.every(token => haystack.includes(token));
    };

    const filtered = useMemo(() => {
        if (!search?.trim()) return items;
        return items?.filter(v => matchesSearch(v, search));
    }, [search, items]);

    // const filtered = search
    //     ? items?.filter((v) =>
    //         (v?.name || "").toLowerCase().includes(search.toLowerCase())
    //     )
    //     : [];
    const handleSelect = (v) => {
        setSearch(v.name);
        setFormData(prev => ({
            ...prev,
            [formdataName]: v.id,
            [selectitem]: v,
        }));
        setOpen(false);
    };
    React.useEffect(() => {
        if (!search) {   // faqat search bo‘sh bo‘lganda
            setSearch(formDataHududname || "");
        }
    }, [formDataHududname]);
    const highlightText = (text, search) => {
        if (!search?.trim() || typeof text !== "string") return text;

        // Tokenlarni regex uchun escape qilib, bitta pattern qil
        const tokens = search
            .trim()
            .split(/\s+/)
            .map(token => token.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'))
            .filter(Boolean);

        if (!tokens.length) return text;

        // "falo|9166|mar" — har birini alohida qidiradi
        const regex = new RegExp(`(${tokens.join("|")})`, "gi");
        const parts = text.split(regex);

        return parts.map((part, i) =>
            regex.test(part) ? (
                <mark key={i}>{part}</mark>
            ) : (
                part
            )
        );
    };
    return (
        <>
            <div style={{
                position: "relative",
                width: `${width}`,
                marginTop: `${marginTop}`,
                zIndex: open ? 100 : 1,  // ✅ shu bir qator yetarli
            }}>

                <div className={`input-group create ${open ? "dropdown-open" : ""}`}
                    style={{ position: "relative", zIndex: 2 }}>
                    <input
                        type="text"
                        name="text"
                        placeholder=""
                        value={search}
                        autoComplete="off"
                        className="input"
                        style={{ width: "100%" }}
                        onFocus={() => setOpen(true)}
                        onBlur={() => setTimeout(() => setOpen(false), 150)}  // ✅ onMouseDown ishlasin deb timeout
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <svg
                        style={{
                            transform: open ? "rotate(0deg)" : "rotate(90deg)",
                            transition: "transform 0.3s ease"
                        }}
                        width="12"
                        height="10"
                        viewBox="0 0 10 6"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M9 1L5 5"
                            stroke="#224594"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M1 1L5 5"
                            stroke="#224594"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <label
                        style={color && { top: '-20px', backgroundColor: 'transparent' }}
                        className="user-label">{selectname}</label>
                    {OnModal &&
                        <button className="add" type="button" onClick={OnModal}>
                            <svg viewBox="64 64 896 896" focusable="false" data-icon="plus" width="1em" height="1em" fill="currentColor"><path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"></path><path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z"></path></svg>
                        </button>
                    }
                    {OnSelect &&
                        <button className="add" type="button" onClick={() => OnSelect()}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /></svg>
                        </button>
                    }
                </div>
                {open && (
                    <div className="kaf-dropdown">
                        {filtered?.length ? (
                            filtered.map((v) => (
                                <div
                                    key={v.id}
                                    className="kaf-dropdown-item"
                                    onMouseDown={() => handleSelect(v)}
                                >
                                    {[v.name, v.tel_1, v.tel_2]
                                        .filter(Boolean)
                                        .map((item, index) => (
                                            <span key={index}>
                                                {index > 0 && " || "}
                                                {highlightText(item, search)}
                                            </span>
                                        ))
                                    }
                                </div>
                            ))
                        ) : (
                            <div className="kaf-dropdown-empty">Biror nima yozing</div>
                        )}
                    </div>
                )}

            </div>
        </>
    );
}
export default SearchAndSelect;
