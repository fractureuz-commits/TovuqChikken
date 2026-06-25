import { useState } from "react";
import writeXlsxFile from "write-excel-file";
import Modal from "../modal/madal";
import './exel.css'
export default function UniversalExport({fetchHududfolder,fetchhudud_param, setSelect, setOpen, data, columnsitem }) {
    const [selectedCols, setSelectedCols] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [exporting, setExporting] = useState(false);

    // Ustunni tanlash
    const toggleColumn = (key) => {
        setSelectedCols(prev =>
            prev.includes(key)
                ? prev.filter(col => col !== key)
                : [...prev, key]
        );
    };

    // Qatorni tanlash
    const toggleRow = (id) => {
        setSelectedRows(prev =>
            prev.includes(id)
                ? prev.filter(row => row !== id)
                : [...prev, id]
        );
    };

    const normalizeCellValue = (value) => {
        if (value === null || value === undefined) return "";
        if (value instanceof Date) return value;
        if (typeof value === "object") return JSON.stringify(value);
        return value;
    };

    // Excelga export
    const handleExport = async () => {
        if (exporting) return;

        const exportCols = selectedCols.length > 0
            ? selectedCols
            : columnsitem.map(c => c.key);
        const exportColumnItems = columnsitem.filter(col => exportCols.includes(col.key));

        const exportRows = selectedRows.length > 0
            ? data.filter(row => selectedRows.includes(row.id))
            : data;

        const rows = [
            exportColumnItems.map(col => ({
                value: col.label || col.key,
                fontWeight: "bold",
            })),
            ...exportRows.map(row => exportColumnItems.map(col => {
                const value = col.key === "name" && row.G_type === 1
                    ? `[Papka] ${row[col.key] || ""}`
                    : row[col.key];

                return { value: normalizeCellValue(value) };
            })),
        ];

        try {
            setExporting(true);
            await writeXlsxFile(rows, {
                fileName: "export.xlsx",
                sheet: "Sheet1",
            });
        } catch (err) {
            console.error("Excel export xatosi:", err);
            window.alert("Excel fayl yaratishda xato yuz berdi");
        } finally {
            setExporting(false);
        }
    };


    return (
        <Modal handleModal={() => setOpen(false)} modalSize="bigModal" title="Excelga yuklash" positionX={'20%'}
            positionY={'20%'}>
            <div className="table-wrapper">
                <table className="table" style={{ width: '100%' }}>
                    <thead>
                        <tr className="exel">
                            <th style={{ width: '20px' }}></th>
                            {columnsitem.map(col => (
                                <th
                                    key={col.key}
                                    style={{
                                        cursor: "pointer",
                                        background: selectedCols.includes(col.key) ? "#00115fff" : ""
                                    }}
                                    onClick={() => toggleColumn(col.key)}
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody >
                        {data.map(row => (
                            <tr
                                key={row.id}
                                className={selectedRows.includes(row.id) ? "selected-row exel" : "exel"}
                                onClick={() => toggleRow(row.id)}
                                onDoubleClick={row.G_type === 0 ? '' : () => {
                                    setSelect('')
                                    fetchhudud_param(row)
                                    fetchHududfolder()
                                    setSelectedRows('')

                                }}
                            >

                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.includes(row.id)}
                                        onChange={() => toggleRow(row.id)}

                                    />
                                </td>
                                {columnsitem.map(col => (
                                    <td key={col.key}>
                                        {col.key === "name" && row.G_type === 1 ? '📁 ' : ''}
                                        {row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}

                    </tbody>
                </table>
            </div>
            <div className="modal-form">
                <div className="buttons" style={{ marginTop: "15px", display: "flex", justifyContent: "center" }}>
                    <button className="button close" onClick={() => setOpen(false)} >Orqaga</button>
                    <button className="button" onClick={handleExport} disabled={exporting}>
                        {exporting ? "Yuklanmoqda..." : "Yuklash"}
                    </button>
                </div>
            </div>

        </Modal>
    );
}
