import React, { useState } from "react";
import * as XLSX from "xlsx";
import Modal from "../modal/madal";
import './exel.css'
export default function UniversalExport({fetchHududfolder,fetchhudud_param, setSelect, setOpen, data, columnsitem, onClose }) {
    const [selectedCols, setSelectedCols] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);

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

    // Excelga export
    const handleExport = () => {
        const exportCols = selectedCols.length > 0
            ? selectedCols
            : columnsitem.map(c => c.key);

        const exportRows = selectedRows.length > 0
            ? data.filter(row => selectedRows.includes(row.id))
            : data;

        const finalData = exportRows.map(row => {
            const obj = {};
            exportCols.forEach(col => {
                // Agar col "name" bo'lsa va row.G_type === 1 bo'lsa → papka icon qo'shish
                if (col === "name" && row.G_type === 1) {
                    obj[col] = ` ${row[col]}`;
                } else {
                    obj[col] = row[col];
                }
            });
            return obj;
        });

        const ws = XLSX.utils.json_to_sheet(finalData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, "export.xlsx");
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
                    <button className="button" onClick={handleExport} >Yuklash</button>
                </div>
            </div>

        </Modal>
    );
}
