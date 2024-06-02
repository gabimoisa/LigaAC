import React from 'react';

const DLPScanResult = ({ scannedFile, sum_hits, goToHistory, getStatusIcon, getTitleDlp}) => {
  return (
    <>
      {scannedFile.dlp_info ? (
        scannedFile.dlp_info.verdict ? (
          scannedFile.dlp_info.hits ? (
            scannedFile.sanitized?.result == "Allowed" ? (
              <div 
                className="dataFound" 
                title={getTitleDlp(scannedFile?.dlp_info)}
              >
              <a onClick={goToHistory}>
                <span
                  dangerouslySetInnerHTML={{
                    __html: chrome.i18n.getMessage("dlpDetections"),
                  }}
                ></span> <span>{sum_hits}</span>
              </a>
            </div>
            ) : (
              scannedFile.sanitized?.result == "Error" ? (
                <span
                  dangerouslySetInnerHTML={{__html: chrome.i18n.getMessage("dlpError")}}
                ></span>
              ) : (
                <span
                  dangerouslySetInnerHTML={{__html: chrome.i18n.getMessage("sanitizedError")}}
                ></span>
              ))
          ) : (
            <span
              dangerouslySetInnerHTML={{
                __html: chrome.i18n.getMessage("dlpError")
              }}
            ></span>
          )
        ) : (
          <span
            dangerouslySetInnerHTML={{
              __html: chrome.i18n.getMessage("dlpOk"),
            }}
          ></span>
        )
      ) : getStatusIcon(scannedFile.status, scannedFile?.dlp_info?.verdict).includes("icon-spin") && scannedFile.useDLP ? (
        <span
          dangerouslySetInnerHTML={{
            __html: chrome.i18n.getMessage("scanDLP"),
          }}
        ></span>
      ) : getStatusIcon(scannedFile.status, scannedFile?.dlp_info?.verdict).includes("icon-spin") ||
        !scannedFile.useDLP ? (
        <span
          dangerouslySetInnerHTML={{
            __html: chrome.i18n.getMessage("noDLP"),
          }}
        ></span>
      ) : (
        <span
          dangerouslySetInnerHTML={{
            __html: chrome.i18n.getMessage("noDLP"),
          }}
        ></span>
      )}
    </>
  );
};

export default DLPScanResult;
