import React, { useState } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

const ScanHistoryTableRow = ({ fileName, scanUrl, hash, scanTime, results, removeFile, status, getStatusIcon, useCore, useDLP, sanitizedFileURL}) => {
    const [isTrashDisplayed, setIsTrashDisplayed] = useState(false);
    const [isDownloadDisplayed, setIsDownloadDisplayed] = useState(false);

    const trashClassName = classNames({
        'invisible': !isTrashDisplayed
    }, 'mcl-icon icon-trash');

    const cleanClassName = classNames({
        'noThreatsFound': results === 'No threats found'
    });

    const downloadSanitizedFile = () => {
        window.location.href = sanitizedFileURL;
    }

    return <tr
        onMouseEnter={() => {setIsTrashDisplayed(true); setIsDownloadDisplayed(true)}}
        onMouseLeave={() => {setIsTrashDisplayed(false); setIsDownloadDisplayed(false)}}
    >
        <td>
            <span className={`${useCore ? 'icon-server' : 'icon-cloud'} mr-2`} />
            <div>
                <a className={`scanNameHash ${cleanClassName}`} href={scanUrl} target='_blank' rel='noreferrer'>{fileName}</a>
                <small className="d-block">{hash}</small>
            </div>
        </td>
        <td>{scanTime}</td>
        <td>
            <a href={scanUrl} className={cleanClassName}>{results}</a>
        </td>
        <td className="p-0">
            {useDLP && sanitizedFileURL ? (
                    <span className="downloadSanitizedButtonBox">
                        <button onClick={downloadSanitizedFile} className="downloadSanitizedButton">
                            <span className="icon-down"></span>
                            <span dangerouslySetInnerHTML={{ __html: chrome.i18n.getMessage('sanitizedVersion') }}></span>
                        </button>
                    </span>
            ) : (getStatusIcon(status).includes("icon-spin") && useDLP) ? (
                <span dangerouslySetInnerHTML={{ __html: chrome.i18n.getMessage('scanDLP') }}></span>
            ) : (getStatusIcon(status).includes("icon-spin") || !useDLP) ? (
                <span dangerouslySetInnerHTML={{ __html: chrome.i18n.getMessage('noDLP') }}></span>
            ) : null}
        </td>
        <td className="p-0">
            <a href="#" onClick={removeFile} title={chrome.i18n.getMessage('deleteTooltip')} className='trash'>
                <span className={trashClassName} />
            </a>
        </td>
    </tr>;
};

ScanHistoryTableRow.propTypes = {
    fileName: PropTypes.string,
    scanUrl: PropTypes.string,
    hash: PropTypes.string,
    scanTime: PropTypes.string,
    results: PropTypes.string,
    removeFile: PropTypes.func,
    status: PropTypes.number,
    getStatusIcon: PropTypes.func,
    useCore: PropTypes.bool,
    useDLP: PropTypes.bool,
    sanitizedFileURL: PropTypes.string
};

export default ScanHistoryTableRow;