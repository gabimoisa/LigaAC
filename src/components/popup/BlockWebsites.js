import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import './BlockWebsites.scss';

function BlockWebsites() {
    const navigate = useNavigate();
    const [website, setWebsite] = useState('');
    const [blockedWebsites, setBlockedWebsites] = useState([]);
    const [isValidWebsite, setIsValidWebsite] = useState(true);
    const [currentDomain, setCurrentDomain] = useState('');

    useEffect(() => {
        let isSubscribed = true;

        chrome.storage.local.get(['blockedWebsites'], (result) => {
            if (isSubscribed) {
                const initialWebsites = result.blockedWebsites || [];
                setBlockedWebsites(initialWebsites);
            }
        });

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (isSubscribed && tabs[0] && tabs[0].url && !tabs[0].url.startsWith('chrome://')) {
                try {
                    const currentUrl = new URL(tabs[0].url).hostname;
                    setCurrentDomain(currentUrl);
                } catch (error) {
                    console.error("Failed to parse the URL:", error);
                }
            }
        });

        return () => {
            isSubscribed = false; 
        };
    }, []);


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
            <button className="back1-btn" onClick={() => navigate(-1)}>
                <span className="icon-left text-16"></span>
            </button>
            
            <h2>Block Websites</h2>

            {blockedWebsites.includes(currentDomain) && (
            <button className="remove-current-btn" onClick={handleRemoveCurrentDomain}>
                <span className="icon-ok text-14"></span>
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
