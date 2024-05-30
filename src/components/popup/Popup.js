import classNames from 'classnames';
import React, { useEffect, useMemo, useContext, useState } from 'react';
import GAContext from '../../providers/GAProvider';
import ConfigContext from '../../providers/ConfigProvider';
import { goToTab } from '../../services/background/navigation';
import ScanFile from '../../services/common/scan-file';
import ScanHistoryContext from '../../providers/ScanHistoryProvider';

import './Popup.scss';
import { getAssessmentStyle, sendDomainToApi } from './utils/popup_domain';


const Popup = () => {
    
    const [apiResponse, setApiResponse] = useState('')
    const config = useContext(ConfigContext);
    const { gaTrackEvent } = useContext(GAContext);
    const { files } = useContext(ScanHistoryContext);
    const scanUrl = config.mclDomain;

    /**
     * Send google analytics data on click event
     */
    const handleGaTrack = () => {
        gaTrackEvent(['_trackEvent', config.gaEventCategory.name, config.gaEventCategory.action.linkClicked, config.gaEventCategory.label.scanHistory, config.gaEventCategory.label.scanHistory]);
    };

    /**  
     * Get the icon for the file's current status (clean / infected / scanning / unknown)
     * @param {number} fileStatus (0 / 1 / 2 / 3) <-> (scanning / clean / infected / unknown)
     * @returns {string} The icon class
    */
    const getStatusIcon = (fileStatus) => {
        if (fileStatus == ScanFile.STATUS.CLEAN) {
            return 'icon-ok';
        }

        if (fileStatus == ScanFile.STATUS.INFECTED) {
            return 'icon-cancel';
        }

        if (fileStatus == ScanFile.STATUS.SCANNING) {
            return 'icon-spin animate-spin';
        }

        return 'icon-help';
    };

    /** Open a new tab with the settings */
    const goToSettings = () => {
        handleGaTrack();
        goToTab('settings');
        window.close();
    };

    useEffect(() => {
        gaTrackEvent(['_trackPageview', '/extension/popup']);
    }, []);

    const scanResultsDom = useMemo(() => {
        if (files.length === 0) {
            return <p className="history-item">No scans available.</p>;
        }
        return files.slice(0, 3).map((scannedFile, index) => (
            <p key={index} className="history-item">
                <span>{scannedFile.fileName}</span>
                <span className={`mcl-icon ${getStatusIcon(scannedFile.status)}`}></span>
            </p>
        ));
    }, [files]);

    useEffect(() => {
        gaTrackEvent(['_trackPageview', '/extension/popup']);
        const fetchData = async () => {
            try {
                const response = await sendDomainToApi();
                setApiResponse(response);
            } catch (error) {
                console.error("Error fetching data from API:", error);
            }
        };

        fetchData();
    
    }, []);

    return (
        <div>
            <div className="popup-header">
                <div className="popup-header__logo"></div>
                <button className="popup-header__btn" onClick={goToSettings}>
                    <span className="icon-cog text-14"></span>
                </button>
            </div>
            <div className="popup-wrapper">
                <div className="popup-section">
                    <div className="popup-section__header">Scan History</div>
                    <div className="popup-box history-list">
                        {scanResultsDom}
                    </div>
                </div>

                <div className="popup-section">
                    <div className="popup-section__header">Website Reputation</div>
                    <div className="popup-box history-list">
                        <p className='history-item'>{apiResponse ? (
                            <span style={getAssessmentStyle(apiResponse)}>
                                {apiResponse}
                            </span>
                        ) : (
                            'Loading...'
                        )}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Popup;