import React from 'react';

const DLPTableScanResult = ({ dlpInfo, getStatusIcon, status, useDLP, downloadSanitizedFile, sanitizedFileURL }) => {
  return (
    <>
      {dlpInfo ? (
        dlpInfo.verdict ? (
          dlpInfo.hits ? (
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
          ) : (
            <span className="sensitiveData" dangerouslySetInnerHTML={{
              __html: chrome.i18n.getMessage("dlpOk"),
            }}></span>
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
