import React, { useState } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

const ScanHistoryTableRow = ({ fileName, scanUrl, hash, scanTime, results, removeFile, status, getStatusIcon, useCore, useDLP, sanitizedFileURL, dlpInfo}) => {
    const [isTrashDisplayed, setIsTrashDisplayed] = useState(false);
    const [isDownloadDisplayed, setIsDownloadDisplayed] = useState(false);
    let sum_hits = 0;

    const trashClassName = classNames({
        'invisible': !isTrashDisplayed
    }, 'mcl-icon icon-trash');

    const cleanClassName = classNames({
        'noThreatsFound': results === 'No threats found',
    });

    const downloadSanitizedFile = () => {
        window.location.href = sanitizedFileURL;
    }

    const handleSumHits = () => {
        if(dlpInfo?.hits && Object.keys(dlpInfo?.hits)) {
            Object.keys(dlpInfo.hits).forEach((key) => {
                sum_hits += dlpInfo.hits[key].hits.length;
            })
        }
        return sum_hits;
    }


    const tableDataDLP = (useDLP, dlpInfo, sanitizedFileURL, downloadSanitizedFile, status) => {
        if (dlpInfo) {
            if (dlpInfo.verdict) {
              if (dlpInfo.hits) {
                return (
                  <div className="sensitiveData">
                    {sanitizedFileURL ? (
                      <div>
                        <button onClick={downloadSanitizedFile} className="downloadSanitizedButton">
                          <span dangerouslySetInnerHTML={{ __html: chrome.i18n.getMessage('sanitizedVersion') }}></span>
                          <span className="icon-down"></span>
                        </button>
                      </div>
                    ) : (
                      <div>
                        <span className="downloadExpired" dangerouslySetInnerHTML={{ __html: chrome.i18n.getMessage('sanitizedVersionExpired') }}></span>
                      </div>
                    )}
                  </div>
                );
              } else {
                return (
                  <span className="sensitiveData" dangerouslySetInnerHTML={{
                    __html: chrome.i18n.getMessage("dlpOk"),
                  }}></span>
                );
              }
            } else {
              return (
                <span className="sensitiveData" dangerouslySetInnerHTML={{
                  __html: chrome.i18n.getMessage("dlpOk"),
                }}></span>
              );
            }
          } else if (getStatusIcon(status, dlpInfo?.verdict).includes("icon-spin") && useDLP) {
            return (
              <span className="sensitiveData" dangerouslySetInnerHTML={{
                __html: chrome.i18n.getMessage("scanDLP"),
              }}></span>
            );
          } else if (getStatusIcon(status, dlpInfo?.verdict).includes("icon-spin") || !useDLP) {
            return (
              <span className="sensitiveData" dangerouslySetInnerHTML={{
                __html: chrome.i18n.getMessage("noDLP"),
              }}></span>
            );
          } else {
            return (
              <span className="sensitiveData" dangerouslySetInnerHTML={{
                __html: chrome.i18n.getMessage("noDLP"),
              }}></span>
            );
          }
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
            {dlpInfo?.hits ? (
                <div>
                    <span className="dataFound" dangerouslySetInnerHTML={{__html: chrome.i18n.getMessage("dlpDetections")}}></span>
                    <span className="dataFound">{handleSumHits()}</span>
                </div>
            ): (
                <a href={scanUrl} className={cleanClassName}>{results}</a>
            )}
        </td>
        <td className="p-0">
            {tableDataDLP(useDLP, dlpInfo, sanitizedFileURL, downloadSanitizedFile, status)}
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
    sanitizedFileURL: PropTypes.string,
    dlpInfo: PropTypes.object
};

export default ScanHistoryTableRow;