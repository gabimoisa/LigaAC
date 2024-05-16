import React, { useState, useEffect } from 'react';


const BlockWebsites = () => {
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

    const handleAddCurrentPage = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentUrl = new URL(tabs[0].url).hostname;
            if (currentUrl && !blockedWebsites.includes(currentUrl)) {
                const updatedList = [...blockedWebsites, currentUrl];
                setBlockedWebsites(updatedList);
                chrome.storage.local.set({ blockedWebsites: updatedList });
            }
        });
    };

    const generateSTYLES = () => {
        return `<style>@import url(https://fonts.googleapis.com/css?family=Roboto:500);
        body {
          background:#ffffff;
          color: #000a12;
          font-family: "Roboto", sans-serif;
          max-height: 700px;
          overflow: hidden;
        }
        .c {
          text-align: center;
          display: block;
          position: relative;
          width: 80%;
          margin: 100px auto;
        }
        ._1 {
          font-size: 100px;
          position: relative;
          display: inline-block;
          z-index: 2;
          height: 100px;
          letter-spacing: 15px;
        }
        ._2 {
          text-align: center;
          display: block;
          position: relative;
          letter-spacing: 12px;
          font-size: 4em;
          line-height: 80%;
        }
        ._3 {
          text-align: center;
          display: block;
          position: relative;
          font-size: 20px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
      }
         </style>`;
      };
      
    const generateHTML = (pageName) => {
        return `
        <div class='c'>
            <div class='_1'>Acces denied!</div>
            <br>
            <div class='_2'>For > ${pageName}</div>
            <br>
            <button class='_3' onclick="window.location.href='https://www.google.com'">GO BACK</button>    
            </div>
         `;
      };
  
        switch(window.location.hostname)
        {
            case website:
                document.head.innerHTML = generateSTYLES();
                document.body.innerHTML = generateHTML(website); 
                break;
            default:
                document.body.innerHTML = "<p style='text-align:center; font-size:20px; color:#333;'>This website is not blocked.</p>";
                break;
        }
            
    return (
        <div style={{ width: '380px', maxHeight: '300px', overflow: 'auto', padding: '20px', border: '1px solid #ddd', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#fff' }}>
            <h2 style={{ textAlign: 'center', color: '#313C4E', marginBottom: '20px', fontFamily: 'Arial, sans-serif' }}>Block Websites</h2>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '10px' }}>

                <input
                    type="text"
                    placeholder="Enter website URL"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    style={{ border: '1px solid #ccc', padding: '8px', width: '60%' }}
                />
                <button
                    onClick={handleAddWebsite}
                    style={{ border: 'none', backgroundColor: '#141E2F', color: 'white', padding: '8px 15px', cursor: 'pointer' }}
                >
                    Add
                </button>
                <button
                    onClick={handleAddCurrentPage}
                    style={{ border: 'none', backgroundColor: '#154FBA', color: 'white', padding: '8px 15px', cursor: 'pointer', width: '40%' }}
                >
                    Current Page
                </button>
            </div>

            <div style={{ width: '100%' }}>
                {blockedWebsites.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#888' }}>No websites blocked</p>
                ) : (
                    blockedWebsites.slice(-2).map((site, index) => (
                        <div key={index} style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', marginBottom: '8px', padding: '5px 10px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                            <span style={{ color: '#333', maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{site}</span>
                            <button
                                onClick={() => handleRemoveWebsite(site)}
                                style={{ border: 'none', backgroundColor: '#db4b3d', color: 'white', padding: '5px 10px', cursor: 'pointer' }}
                            >
                                Remove
                            </button>
                        </div>
                    ))
                )}
            </div>

        </div>
    );
};

export default BlockWebsites;
