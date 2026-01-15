import React from 'react';
import Header from './Header';
import Tabs from './Tabs';

const Layout = ({ children, activeTab, onTabChange }) => {
    return (
        <div className="container">
            <Header />
            <Tabs activeTab={activeTab} onTabChange={onTabChange} />
            <div className="main-content">
                {children}
            </div>
        </div>
    );
};

export default Layout;