import React, { useState, useEffect } from 'react';
import SidebarLayout from '../../components/common/sidebar-layout/SidebarLayout';

import './BlockWebsites-page.scss';

const BlockedWebsitesPage = () => {
    const [website, setWebsite] = useState('');
    const [blockedWebsites, setBlockedWebsites] = useState([]);
    const [isValidWebsite, setIsValidWebsite] = useState(true);

    useEffect(() => {
        chrome.storage.local.get(['blockedWebsites'], (result) => {
            setBlockedWebsites(result.blockedWebsites || []);
        });
    }, []);

    const handleAddWebsite = () => {
        try {
            const currentUrl = new URL(website.includes('://') ? website : `http://${website}`).hostname;
            const isValidDomain = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(currentUrl);
            if (isValidDomain && !blockedWebsites.includes(currentUrl)) {
                const updatedList = [...blockedWebsites, currentUrl];
                setBlockedWebsites(updatedList);
                setWebsite('');
                chrome.storage.local.set({ blockedWebsites: updatedList });
                console.log('Blocked site added:', blockedWebsites);
                setIsValidWebsite(true); 
            } else {
                setIsValidWebsite(false);
            }
        } catch (error) {
            console.log("Invalid URL!");
            setIsValidWebsite(false);
        }
    };

    const handleRemoveWebsite = (site) => {
        const updatedList = blockedWebsites.filter((s) => s !== site);
        setBlockedWebsites(updatedList);
        chrome.storage.local.set({ blockedWebsites: updatedList });
    };

    const content = (
        <div className="content">

            <div className={`website-input ${!isValidWebsite ? "invalid-input" : ""}`}>
                <input
                    type="text"
                    placeholder="Enter website URL"
                    value={website}
                    onChange={(e) => { 
                        setWebsite(e.target.value); 
                        setIsValidWebsite(true); 
                    }}  
                />
                <button onClick={handleAddWebsite}>Add</button>
            </div>
            <div className="blocked-count">
                <strong className="history--scanned__files">
                    {blockedWebsites.length} websites blocked
                </strong></div>
            <div className="website-list">
                {
                    <table className="blocked-websites-table">
                        <thead>
                            <tr>
                                <th>WEBSITE</th>
                                <th>DELETE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blockedWebsites.map((site, index) => (
                                <tr key={index}>
                                    <td>{site}</td>
                                    <td>
                                        <button className="remove-button" onClick={() => handleRemoveWebsite(site)}>
                                        <i class="icon-trash text-14"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                }
            </div>
        </div>
    );
    return (
        <SidebarLayout
            className='blocked-websites-page'
            currentPage='blocked-websites'
            content={content}
        />
    );
};

export default BlockedWebsitesPage;
