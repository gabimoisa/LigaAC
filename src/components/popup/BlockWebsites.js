import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import './BlockWebsites.scss';

function BlockWebsites() {
    const [website, setWebsite] = useState('');
    const [blockedWebsites, setBlockedWebsites] = useState([]);
    const [isValidWebsite, setIsValidWebsite] = useState(true);
    const [currentDomain, setCurrentDomain] = useState('');

    useEffect(() => {
        chrome.storage.local.get(['blockedWebsites'], (result) => {
            const initialWebsites = result.blockedWebsites || [];
            setBlockedWebsites(initialWebsites);
        });

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (tab && tab.url && !tab.url.startsWith('chrome://')) {
                try {
                    const currentUrl = new URL(tab.url).hostname;
                    setCurrentDomain(currentUrl);
                } catch (error) {
                }
            }
        });
        

    }, [blockedWebsites]);


    const handleAddWebsite = () => {
        try {
            const currentUrl = new URL(website.includes('://') ? website : `http://${website}`).hostname;
            const isValidDomain = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(currentUrl);
            if (isValidDomain && !blockedWebsites.includes(currentUrl)) {
                const updatedList = [...blockedWebsites, currentUrl];
                setBlockedWebsites(updatedList);
                chrome.storage.local.set({ blockedWebsites: updatedList });
                setWebsite('');
                setIsValidWebsite(true);
                checkAndReload(currentUrl);
            } else {
                setIsValidWebsite(false);
            }
        } catch (error) {
            setIsValidWebsite(false);
        }
    };

    const handleRemoveWebsite = (site) => {
        const updatedList = blockedWebsites.filter((s) => s !== site);
        setBlockedWebsites(updatedList);
        chrome.storage.local.set({ blockedWebsites: updatedList });
    };

    const handleRemoveCurrentDomain = () => {
        if (currentDomain && blockedWebsites.includes(currentDomain)) {
            handleRemoveWebsite(currentDomain);
            checkAndReload(currentDomain);
        }
    };

    const handleAddCurrentPage = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentUrl = new URL(tabs[0].url).hostname;
            if (currentUrl && !blockedWebsites.includes(currentUrl)) {
                const updatedList = [...blockedWebsites, currentUrl];
                setBlockedWebsites(updatedList);
                chrome.storage.local.set({ blockedWebsites: updatedList });
                checkAndReload(currentUrl);
            }
        });
    };

    function checkAndReload(url) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            if (currentTab.url.includes(url)) {
                chrome.tabs.reload(currentTab.id);
            }
        });
    }

    return (
        <div className="block-websites">
            <h2>Block Websites</h2>

            {blockedWebsites.includes(currentDomain) && (
            <button className="remove-current-btn" onClick={handleRemoveCurrentDomain}>
                Remove
            </button>
            )}

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
                <button onClick={handleAddCurrentPage}>Current Page</button>
            </div>
            <div className="website-list">
                {blockedWebsites.length === 0 ? (
                    <p>No websites blocked</p>
                ) : (
                    blockedWebsites.slice(-2).map((site, index) => (
                        <div key={index} className="website-entry">
                            <span>{site}</span>
                            <button onClick={() => handleRemoveWebsite(site)}>
                                <i className="icon-trash text-14"></i>
                            </button>
                        </div>
                    ))
                )}
                {blockedWebsites.length > 2 && (
                    <center><Link to="/block" target="_blank" className="block-link">see more</Link></center>
                )}
            </div>
        </div>
    );
};

export default BlockWebsites;
