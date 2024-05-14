import React, { useState, useEffect } from 'react';
import SidebarLayout from '../../components/common/sidebar-layout/SidebarLayout';

const BlockedWebsitesPage = () => {
    const [website, setWebsite] = useState('');
    const [blockedWebsites, setBlockedWebsites] = useState([]);

    useEffect(() => {
        chrome.storage.local.get(['blockedWebsites'], (result) => {
            setBlockedWebsites(result.blockedWebsites || []);
        });
    }, []);

    const handleAddWebsite = () => {
        if (website.trim() !== '') {
            try {
                const currentUrl = new URL(website.includes('://') ? website : `http://${website}`).hostname;

                const isValidDomain = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(currentUrl);

                if (isValidDomain && !blockedWebsites.includes(currentUrl)) {
                    const updatedList = [...blockedWebsites, currentUrl];
                    setBlockedWebsites(updatedList);
                    setWebsite('');
                    chrome.storage.local.set({ blockedWebsites: updatedList });
                }
            } catch (error) {
                console.log("Invalid URL!");
            }
        }
    };

    const handleRemoveWebsite = (site) => {
        const updatedList = blockedWebsites.filter((s) => s !== site);
        setBlockedWebsites(updatedList);
        chrome.storage.local.set({ blockedWebsites: updatedList });
    };


    const content = (
        <div style={{ padding: '20px', backgroundColor: '#fff' }}>
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Enter website URL"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    style={{ border: '1px solid #ccc', padding: '8px', marginRight: '10px', width: 'calc(30%)' }}
                />
                <button
                    onClick={handleAddWebsite}
                    style={{ border: 'none', backgroundColor: '#141E2F', color: 'white', padding: '8px 15px', cursor: 'pointer' }}
                >
                    Add
                </button>
            </div>
            <div style={{ maxHeight: '100%', overflowY: 'auto' }}>
                {blockedWebsites.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#888' }}>No websites blocked</p>
                ) : (
                    blockedWebsites.map((site, index) => (
                        <div key={index} style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', marginBottom: '8px', padding: '10px 10px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                            <span style={{ alignItems: 'center', color: '#333', maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{site}</span>
                            <button
                                onClick={() => handleRemoveWebsite(site)}
                                style={{ alignItems: 'center', border: 'none', backgroundColor: '#db4b3d', color: 'white', padding: '5px 10px', cursor: 'pointer' }}
                            >
                                Remove
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return <SidebarLayout
        className='blocked-websites-page'
        currentPage='blocked-websites'
        content={content}
    />;
};

export default BlockedWebsitesPage;
