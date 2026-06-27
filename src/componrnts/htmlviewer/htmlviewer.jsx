import React from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useBackHandler } from "../../utils/backButtonStack";

export default function HtmlViewer({ HTMLdata, setHTMLdataModal , title}) {
    useBackHandler(() => setHTMLdataModal(false));

    return (
        <div
            style={{
                width: "100%",
                height: "100vh",
                overflow: "hidden",
                position: "fixed",
                top: 0,
                left: 0,
                zIndex: 10,
                backgroundColor: "#fff",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Header */}
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    padding: "10px",
                    borderBottom: "1px solid #ddd",
                    background: "#fff",
                    flexShrink: 0,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop:'30px',
                }}
            >
                <h3 style={{ margin: 0 }}>{title}</h3>
                <button style={{
                    backgroundColor:'#006CAC',
                    color:'#fff',
                    border:"none",
                    padding:'10px'
                }} onClick={() => setHTMLdataModal(false)}>✖ Yopish</button>
            </div>

            {/* HTML content area */}
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    flex: 1,
                    overflow: "hidden",
                    touchAction: "none", // MUHIM
                    background: "#fff",
                }}
            >
                <TransformWrapper
                    initialScale={1}
                    minScale={1}
                    maxScale={1}
                    doubleClick={{ disabled: true }}
                    pinch={{ disabled: true }}
                    wheel={{ disabled: true }}
                    panning={{ disabled: false }}
                    limitToBounds={false}
                    centerOnInit={false}
                >
                    <TransformComponent
                        wrapperStyle={{
                            width: "100%",
                            height: "100%",
                        }}
                        contentStyle={{
                            width: "max-content",
                            minWidth: "100%",
                        }}
                    >
                        <div
                            style={{
                                padding: "10px",
                                minWidth: "max-content",
                            }}
                            dangerouslySetInnerHTML={{ __html: HTMLdata }}
                        />
                    </TransformComponent>
                </TransformWrapper>
            </div>
        </div>
    );
}
