import React from "react";
import "./loading.css";

const Loading = () => {
    return (
        <div className="h-screen w-full fixed inset-0 flex items-center justify-center">
            <div className="loader"></div>
        </div>
    );
};

export default Loading;
