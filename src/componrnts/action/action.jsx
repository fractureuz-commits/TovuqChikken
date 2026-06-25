import './action.css';
import { getUser } from '../../leyout/login/auth';
import { useEffect } from 'react';

function ActionAndSearch({
    handleEdit,
    handleDelete,
    refresh, // ❗ bu prop
    handleHududFolderClick,
    handleHududFolderAdd,
    path,
    fetchhudud_param,
    goHome,
    handleCopy,
    Selects,
    handleSelects,
    handleFolders,
    setQuery,
    Query,
    setHududallTrue,
    exportToExcel,
    SearchInputRef,
    setSelect,
    setFocusEnabled
}) {
    return (<>
        <div className="action">
            <div className="buttons">
                <button className="button" onClick={handleHududFolderAdd}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-circle-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M9 12h6" /><path d="M12 9v6" /></svg>
                    <span>Qo'shish</span>
                </button>
                {handleHududFolderClick &&
                    <button className="button" onClick={handleHududFolderClick} >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-folder-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 19h-7a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v3.5" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>
                        <span>Papka yaratish</span>
                    </button>
                }
                <button className="button" onClick={handleDelete}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-trash"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                    <span >O'chirish</span>
                </button>
                <button
                    className="button"
                    onClick={handleSelects}
                >
                    <svg
                        style={{ fill: Selects ? '#5154ff' : '' }}
                        className="select-items-icon" width="15px" height="27px" viewBox="0 .4 22 23" fill="#fff" version="1.1"><g id="🔍-Product-Icons" stroke="none" strokeWidth="" fillRule="evenodd"><g id="ic_fluent_select_all_24_filled" fillRule="nonzero"><path d="M20.4961766,5.62668182 C21.3720675,5.93447702 22,6.76890777 22,7.75 L22,17.75 C22,20.0972102 20.0972102,22 17.75,22 L7.75,22 C6.76890777,22 5.93447702,21.3720675 5.62668182,20.4961766 L7.72396188,20.4995565 L17.75,20.5 C19.2687831,20.5 20.5,19.2687831 20.5,17.75 L20.5,7.75 L20.4960194,7.69901943 L20.4961766,5.62668182 Z M17.246813,2 C18.4894537,2 19.496813,3.00735931 19.496813,4.25 L19.496813,17.246813 C19.496813,18.4894537 18.4894537,19.496813 17.246813,19.496813 L4.25,19.496813 C3.00735931,19.496813 2,18.4894537 2,17.246813 L2,4.25 C2,3.00735931 3.00735931,2 4.25,2 L17.246813,2 Z M13.4696699,7.46966991 L9.58114564,11.3581942 L8.6,10.05 C8.35147186,9.71862915 7.88137085,9.65147186 7.55,9.9 C7.21862915,10.1485281 7.15147186,10.6186292 7.4,10.95 L8.9,12.95 C9.17384721,13.3151296 9.70759806,13.3530621 10.0303301,13.0303301 L14.5303301,8.53033009 C14.8232233,8.23743687 14.8232233,7.76256313 14.5303301,7.46966991 C14.2374369,7.1767767 13.7625631,7.1767767 13.4696699,7.46966991 Z" id="🎨-Color"></path></g></g></svg>
                    <span >Bir nechtasini tanlash</span>
                </button>
                <button className="button" onClick={handleEdit}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-edit"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" /><path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" /><path d="M16 5l3 3" /></svg>
                    <span >O'zgartirish</span>
                </button>
                <button className="button" onClick={handleCopy}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-copy"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" /><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" /></svg>
                    <span >Nusxa olish</span>
                </button>
                {handleFolders &&
                    <button className="button" onClick={handleFolders}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                            <path d="M1.42188 4.79102C1.04477 4.79102 0.683111 4.92271 0.416458 5.15713C0.149804 5.39155 0 5.7095 0 6.04102L0 13.541C0 14.231 0.637 14.791 1.42188 14.791H11.5781C11.9552 14.791 12.3169 14.6593 12.5835 14.4249C12.8502 14.1905 13 13.8725 13 13.541V7.46959C13 7.13807 12.8502 6.82012 12.5835 6.5857C12.3169 6.35128 11.9552 6.21959 11.5781 6.21959H6.09375C6.06222 6.21959 6.03111 6.21313 6.00291 6.20073C5.9747 6.18834 5.95017 6.17034 5.93125 6.14816L5.2 5.29102C4.93188 4.97673 4.50938 4.79102 4.0625 4.79102H1.42188Z" fill="white" />
                            <mask id="path-2-inside-1_133_3" fill="white">
                                <path d="M6.5 13L3.46891 8.5H9.53109L6.5 13Z" />
                            </mask>
                            <path d="M6.5 13L1.52362 16.352L6.5 23.74L11.4764 16.352L6.5 13ZM3.46891 8.5V2.5H-7.80672L-1.50747 11.852L3.46891 8.5ZM9.53109 8.5L14.5075 11.852L20.8067 2.5H9.53109V8.5ZM6.5 13L11.4764 9.64804L8.44529 5.14804L3.46891 8.5L-1.50747 11.852L1.52362 16.352L6.5 13ZM3.46891 8.5V14.5H9.53109V8.5V2.5H3.46891V8.5ZM9.53109 8.5L4.55471 5.14804L1.52362 9.64804L6.5 13L11.4764 16.352L14.5075 11.852L9.53109 8.5Z" fill="#A5A5A5" mask="url(#path-2-inside-1_133_3)" />
                            <path d="M17.5 20.3299C17.5 14.3299 17.7806 6.28484 15.5 3.29873C11.9727 -1.31966 7 1.2772 6.5 8.79102" stroke="#A5A5A5" strokeWidth="2" />
                            <rect x="6" y="18.791" width="16" height="3" rx="0.5" fill="white" />
                        </svg>
                    </button>
                }

                <button className="button" onClick={exportToExcel}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15px" height="20px" viewBox="0 0 20 20"><path fill="#fff" d="M15.5336935,1.36078656 L14.3091934,0 L4.66164861,0 C3.96587259,0 3.69745022,0.516240645 3.69745022,0.918940882 L3.69745022,4.54990495 L5.05022147,4.54990495 L5.05022147,1.65231191 C5.05022147,1.49764309 5.17972642,1.36831506 5.33012577,1.36831506 L12.2326992,1.36831506 C12.3848666,1.36831506 12.4607275,1.39536077 12.4607275,1.51951183 L12.4607275,6.33974935 L17.374336,6.33974935 C17.5674293,6.33974935 17.64219,6.43910559 17.64219,6.58649791 L17.64219,18.3551379 C17.64219,18.6018372 17.5427649,18.6391348 17.3923656,18.6391348 L5.33012577,18.6391348 C5.17841421,18.6391348 5.05022147,18.5071054 5.05022147,18.3551379 L5.05022147,17.2797529 L3.70585195,17.2797529 L3.70585195,18.9746512 C3.68830357,19.5740762 4.00829472,20 4.66164861,20 L18.0607964,20 C18.7607484,20 19,19.492895 19,19.031053 L19,6.44396558 L19,5.18667048 L18.6504957,4.80720067 L15.5336935,1.36078656 Z M13.8361266,1.51951183 L14.2226173,1.95352728 L16.8187437,4.80720067 L16.9617674,4.98003873 L14.3091934,4.98003873 C14.1088763,4.98003873 13.9821388,4.94696877 13.9289809,4.88082886 C13.8758231,4.81468894 13.8448716,4.71017086 13.8361266,4.56727461 L13.8361266,1.51951183 Z M12.745155,10.6673887 L17.3228723,10.6673887 L17.3228723,12.0008027 L12.745155,12.0008027 L12.745155,10.6673887 Z M12.745155,8.00053511 L17.3228723,8.00053511 L17.3228723,9.33394906 L12.745155,9.33394906 L12.745155,8.00053511 Z M12.745155,13.3342423 L17.3228723,13.3342423 L17.3228723,14.6676563 L12.745155,14.6676563 L12.745155,13.3342423 Z M1,5.6257308 L1,16.2931195 L11.4647417,16.2931195 L11.4647417,5.6257308 L1,5.6257308 Z M6.23301435,11.8301319 L5.59210113,12.8075142 L6.23301435,12.8075142 L6.23301435,13.9996373 L3.01552801,13.9996373 L5.35148739,10.4913668 L3.28236069,7.33382814 L5.01013637,7.33382814 L6.2343518,9.16996719 L7.45725501,7.33382814 L9.18369325,7.33382814 L7.11194213,10.4900547 L9.44921372,13.9996373 L7.6560547,13.9996373 L6.23301435,11.8301319 Z"></path></svg>
                    <span >Exelga kochirish</span>
                </button>
                <button className="button" onClick={refresh}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="#fff" version="1.1" id="Capa_1" x="0px" y="0px" width="15px" height="20px" viewBox="1 12 330 290" ><path d="M307.475,141.686c-6.893-4.598-16.207-2.736-20.802,4.157l-0.446,0.669c-5.426-74.107-67.45-132.745-142.918-132.745  C64.288,13.768,0,78.056,0,157.077s64.288,143.309,143.309,143.309c11.046,0,20-8.954,20-20s-8.954-20-20-20  C86.344,260.385,40,214.041,40,157.077S86.344,53.768,143.309,53.768c52.798,0,96.465,39.815,102.571,90.996  c-4.813-5.991-13.486-7.422-20-3.078c-6.893,4.596-8.754,13.91-4.158,20.802l29.702,44.541c3.505,5.256,9.208,8.394,15.255,8.394  c6.047,0,11.749-3.139,15.252-8.394l29.702-44.541C316.228,155.595,314.367,146.282,307.475,141.686z"></path></svg>
                    <span >Yangilash</span>
                </button>
                <div className="page-ssilka">
                    {path?.length > 0 && (
                        <div className="button" onClick={goHome}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-folder-open"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M5 19l2.757 -7.351a1 1 0 0 1 .936 -.649h12.307a1 1 0 0 1 .986 1.164l-.996 5.211a2 2 0 0 1 -1.964 1.625h-14.026a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v2" /></svg>
                        </div>
                    )}

                    {path?.map((item, index) => (
                        <p key={item.id} style={{ cursor: "pointer" }} onClick={() => fetchhudud_param(item)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M9.46967 5.46967C9.76256 5.17678 10.2374 5.17678 10.5303 5.46967L16.5303 11.4697C16.8232 11.7626 16.8232 12.2374 16.5303 12.5303L10.5303 18.5303C10.2374 18.8232 9.76256 18.8232 9.46967 18.5303C9.17678 18.2374 9.17678 17.7626 9.46967 17.4697L14.9393 12L9.46967 6.53033C9.17678 6.23744 9.17678 5.76256 9.46967 5.46967Z" fill="#4447e2"></path></svg>
                            {item.name}
                        </p>
                    ))}
                </div>
            </div>
            <div className="search" onClick={() => {
                console.log(1);
                
                setSelect([]);
                setFocusEnabled(true);
                if (setHududallTrue) {
                    setHududallTrue(true)
                }
            }}>
                <input type="text"
                    ref={SearchInputRef}
                    placeholder="Qidirish (ctrl + spase)"
                    onChange={(e) => {

                        if (goHome) {
                            goHome()
                        }
                        setQuery(e.target.value)
                    }
                    } />
                <button>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-search"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" /><path d="M21 21l-6 -6" /></svg>
                </button>
            </div>
        </div>


    </>);
}

export default ActionAndSearch;
