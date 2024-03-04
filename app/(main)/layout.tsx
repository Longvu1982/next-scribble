import React, { ReactNode } from "react";

const MainLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div>
            side bar
            {children}
        </div>
    );
};

export default MainLayout;
