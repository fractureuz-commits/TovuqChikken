import SearchAndSelect from '../../componrnts/drop_serach/dropSearch';
import { useEffect, useState } from 'react';
import './kafolat.css';
import QrScanner from '../../componrnts/qr/qr';
import { useRef } from "react";
import { NavLink } from 'react-router';
import MijozModal from './MijozCreate';
import { BaseUrl } from '../../baseUrl';

function Kafolat() {
    const [formDataKafolat, setformDataKafolat] = useState({
        id: '',
        mijoz: '',
        filial_id: '',
    });
    const [mijozOpen, setMijozOpen] = useState(false);

    const [searchMijoz, setsearchMijoz] = useState("");
    const [Mijoz, setMijoz] = useState("");
    const fetchMijoz = () => {
        fetch(`${BaseUrl}/mijoz/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP xato! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                setMijoz(data);
            })
            .catch((error) => {
                alert(`Xato:qaefeq ${error.message}\n\nURL: ${BaseUrl}/mijoz/`);
            });
    };

    useEffect(() => {
        fetchMijoz();
    }, []);
    return (
        <>
            <div className="kaf-page">
                <div className="kaf-card">
                    <h1 className="kaf-title">Kafolat</h1>
                    <div className="kaf-search-wrap">
                        <SearchAndSelect
                            setFormData={setformDataKafolat}
                            items={Mijoz}
                            selectname={'Mijoz nomi yoki nomeri'}
                            formData={formDataKafolat}
                            width="85%"
                            marginTop={'10px'}
                            formDataHududname={formDataKafolat.mijoz}
                            formdataName='filial_id'
                            selctitem='mijoz'
                            search={searchMijoz}
                            setSearch={setsearchMijoz}
                            color={"#DDE1EC"}
                        // OnModal={() => {}}
                        // OnSelect={() => {}}
                        />
                        <button className='kaf-add' onClick={() => setMijozOpen(true)}>
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clip-path="url(#clip0_180_1104)">
                                    <path d="M3.33887 15.5C3.33887 16.8789 3.61046 18.2443 4.13813 19.5182C4.66581 20.7921 5.43923 21.9496 6.41425 22.9246C7.38926 23.8996 8.54677 24.6731 9.82069 25.2007C11.0946 25.7284 12.46 26 13.8389 26C15.2177 26 16.5831 25.7284 17.857 25.2007C19.131 24.6731 20.2885 23.8996 21.2635 22.9246C22.2385 21.9496 23.0119 20.7921 23.5396 19.5182C24.0673 18.2443 24.3389 16.8789 24.3389 15.5C24.3389 12.7152 23.2326 10.0445 21.2635 8.07538C19.2944 6.10625 16.6236 5 13.8389 5C11.0541 5 8.38338 6.10625 6.41425 8.07538C4.44511 10.0445 3.33887 12.7152 3.33887 15.5Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M10.3389 15.5H17.3389" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M13.8389 12V19" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_180_1104">
                                        <rect width="28" height="28" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>

                        </button>
                    </div>
                    <QrScanner
                        onScan={(data) => {
                            setformDataKafolat(prev => ({ ...prev, qr_data: data }));
                        }}
                    />
                    {formDataKafolat.qr_data &&
                        <>
                            <div className="kaf-product-name">
                                <span>{formDataKafolat.qr_data}</span>
                            </div>
                            <div className="kaf-table-wrap">
                                <span className="kaf-table-label">Kafolat</span>
                                <table className="kaf-table">
                                    <thead>
                                        <tr>
                                            <th>BOK</th>
                                            <th>UMUMIY</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>08.01.2024</td>
                                            <td>08.01.2024</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <button className="kaf-btn-pdf">PDF</button>
                            <div className="kaf-bottom-btns">
                                <NavLink to={'/'} className="kaf-btn-cancel">BEKOR QILISH</NavLink>
                                <button className="kaf-btn-ok">OK</button>
                            </div>
                        </>
                    }
                </div>
            </div>
            <MijozModal
                open={mijozOpen}
                onClose={() => setMijozOpen(false)}
                fetchMijoz={fetchMijoz}
            />
        </>
    );
}

export default Kafolat;
