import React from 'react';

const DLPTableScanResult = ({ dlpInfo, getStatusIcon, status, useDLP, downloadSanitizedFile, sanitizedFileURL, sanitized, getDlpInfoErrors }) => {
  return (
    <>
      {dlpInfo ? (
        dlpInfo.verdict ? (
          dlpInfo.hits ? (
            <div className="sensitiveData">
              {sanitized?.result == 'Allowed' ? (
                sanitizedFileURL ? (
                  <div>
                    <button onClick={downloadSanitizedFile} className="downloadSanitizedButton">
                      <span dangerouslySetInnerHTML={{ __html: chrome.i18n.getMessage('sanitizedVersion') }}></span>
                      <span className="icon-down"></span>
                    </button>
                  </div>
                ) : (
                  <div>
                    <span className="downloadDlpInfo" dangerouslySetInnerHTML={{ __html: chrome.i18n.getMessage('sanitizedVersionExpired') }}></span>
                  </div>
                )
              ) : (
                sanitized?.result == 'Error' ? (
                  <div>
                    <span className="downloadDlpInfo" dangerouslySetInnerHTML={{ __html: sanitized.reason}}></span>
                  </div>
              ) : (
                <div>
                    <span className="downloadDlpInfo" dangerouslySetInnerHTML={{ __html: chrome.i18n.getMessage('sanitizedError') }}></span>
                </div>
              )
              )}
            </div>
          ) : (
            <div className='sensitiveData'>
              <span className="downloadDlpInfo">{getDlpInfoErrors(dlpInfo)}</span>
            </div>
          )
        ) : (
          <span className="sensitiveData" dangerouslySetInnerHTML={{
            __html: chrome.i18n.getMessage("dlpOk"),
          }}></span>
        )
      ) : getStatusIcon(status, dlpInfo?.verdict).includes("icon-spin") && useDLP ? (
        <span className="sensitiveData" dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage("scanDLP"),
        }}></span>
      ) : getStatusIcon(status, dlpInfo?.verdict).includes("icon-spin") || !useDLP ? (
        <span className="sensitiveData" dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage("noDLP"),
        }}></span>
      ) : (
        <span className="sensitiveData" dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage("noDLP"),
        }}></span>
      )}
    </>
  );
};

export default DLPTableScanResult;
