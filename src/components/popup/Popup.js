import classNames from "classnames";
import moment from "moment";
import React, { useEffect, useMemo, useContext, useState } from "react";
import GAContext from "../../providers/GAProvider";
import ConfigContext from "../../providers/ConfigProvider";
import { goToTab } from "../../services/background/navigation";
import ScanFile from "../../services/common/scan-file";
import ScanHistoryContext from "../../providers/ScanHistoryProvider";

import "./Popup.scss";

const Popup = () => {
  const config = useContext(ConfigContext);
  const { gaTrackEvent } = useContext(GAContext);
  const { files } = useContext(ScanHistoryContext);
  const scanUrl = config.mclDomain;
  const [dropOverlayActive, setDropOverlayActive] = useState(false);

  /**
   * Send google analytics data on click event
   */
  const handleGaTrack = () => {
    gaTrackEvent([
      "_trackEvent",
      config.gaEventCategory.name,
      config.gaEventCategory.action.linkClicked,
      config.gaEventCategory.label.scanHistory,
      config.gaEventCategory.label.scanHistory,
    ]);
  };

  /**
   * Get the icon for the file's current status (clean / infected / scanning / unknown)
   * @param {number} fileStatus (0 / 1 / 2 / 3) <-> (scanning / clean / infected / unknown)
   * @param {number} verdict DLP (0 / 1) <-> (no sensitive data found / sensitive data found)  
   * @returns {string} The icon class
   */
  const getStatusIcon = (fileStatus, verdict) => {
    if (verdict !== undefined) {
      if (verdict == 1) {
        return "icon-attention";

      } else {
        return "icon-ok";
      }

    } else {
      if (fileStatus == ScanFile.STATUS.CLEAN) {
        return "icon-ok";
      }
  
      if (fileStatus == ScanFile.STATUS.INFECTED) {
        return "icon-attention";
      }
  
      if (fileStatus == ScanFile.STATUS.SCANNING) {
        return "icon-spin animate-spin";
      }
    }

    return "icon-help";
  };

  const goToHistory = () => {
    handleGaTrack();
    goToTab("history");
    window.close();
  };

  const goToSettings = () => {
    handleGaTrack();
    goToTab("settings");
    window.close();
  };

  const handleDragAndDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.type === "dragover") {
      setDropOverlayActive(true);
    
    } else if (event.type === "drop") {
      const file = event.dataTransfer.files[0];

      if (file) {
        setDropOverlayActive(false);

        const reader = new FileReader();
        
        reader.onload = (e) => {
          const fileContent = e.target.result;
          let fileUrl;
        
          try {
            fileUrl = URL.createObjectURL(
              new Blob([fileContent], { type: fileContent.type })
            );

            fileUrl = (fileUrl + "/").concat(file.name);
        
          } catch (e) {
            console.warn(e);
          }

          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: "fileUploaded",
              fileUrl: fileUrl,
            });
          }
        };

        reader.readAsArrayBuffer(file);
      }
    }
  };

  useEffect(() => {
    gaTrackEvent(["_trackPageview", "/extension/popup"]);
  }, []);

  const viewScanHistoryClassName = classNames(
    { "d-none": files.length === 0 },
    "popup--scan__footer"
  );

  const getScanUrl = (file) => {
    if (file.dataId) {
      return `${scanUrl}/results/file/${file.dataId}/regular/peinfo`;
    }

    return `${scanUrl}/results/file/${file.md5}/hash/peinfo`;
  };

  const scanResultsDom = useMemo(() => {
    if (files.length === 0) {
      return;
    }

    const tableDataDLP = (scannedFile) => {
      scannedFile.sum_hits = 0;

      if (scannedFile?.dlp_info?.hits && Object.keys(scannedFile.dlp_info.hits)) {
        Object.keys(scannedFile.dlp_info.hits).forEach((key) => {
          scannedFile.sum_hits += scannedFile.dlp_info.hits[key].hits.length;
        })
      } 

      if (scannedFile.dlp_info) {
        if (scannedFile.dlp_info.verdict) {
          if (scannedFile.dlp_info.hits) {
            return (
              <div className="dataFound">
                <a onClick={goToHistory}>
                  <span dangerouslySetInnerHTML={{
                    __html: chrome.i18n.getMessage("dlpDetections"),
                  }}></span> <span>{scannedFile.sum_hits}</span> 
                </a>
              </div>
            );
          } else {
            return (
              <span dangerouslySetInnerHTML={{
                __html: chrome.i18n.getMessage("noDLP"),
              }}></span>
            );
          }
        } else {
          return (
            <span dangerouslySetInnerHTML={{
              __html: chrome.i18n.getMessage("dlpOk"),
            }}></span>
          );
        }
      } else if (getStatusIcon(scannedFile.status, scannedFile?.dlp_info?.verdict).includes("icon-spin") && scannedFile.useDLP) {
        return (
          <span dangerouslySetInnerHTML={{
            __html: chrome.i18n.getMessage("scanDLP"),
          }}></span>
        );
      } else if (getStatusIcon(scannedFile.status, scannedFile?.dlp_info?.verdict).includes("icon-spin") || !scannedFile.useDLP) {
        return (
          <span dangerouslySetInnerHTML={{
            __html: chrome.i18n.getMessage("noDLP"),
          }}></span>
        );
      } else {
        return (
          <span dangerouslySetInnerHTML={{
            __html: chrome.i18n.getMessage("noDLP"),
          }}></span>
        );
      }
    };
  
    const tableRows = files.slice(0, 3).map((scannedFile, index) => {
      return (
        <tr
          key={index}
          className="list-group-item d-flex align-items-center justify-content-between"
        >
          <td>
            <a
              href={scannedFile.scanResults || getScanUrl(scannedFile)}
              target="_blank"
              rel="noreferrer noopener"
            >
              {scannedFile.fileName}
            </a>
            <span>{scannedFile.dataId}</span>
          </td>
          <td>{moment.unix(scannedFile.scanTime).fromNow()}</td>
          <td>
            <span
              className={`mcl-icon ${getStatusIcon(scannedFile.status, scannedFile?.dlp_info?.verdict)}`}
            ></span>
          </td>
          <td>
            {tableDataDLP(scannedFile)}
          </td>
        </tr>
      );
    });

    return <tbody>{tableRows}</tbody>;
  }, [files]);

  const scanResults = useMemo(() => {
    if (files.length === 0) {
      return (
        <ul className="list-group">
          <li className="list-group-item">
            <span
              dangerouslySetInnerHTML={{
                __html: chrome.i18n.getMessage("noScansNotification"),
              }}
            />
          </li>
        </ul>
      );
    }

    return (
      <table className="list-group row">
        <thead>
          <tr>
            <td>FILE NAME</td>
            <td>SCAN TIME</td>
            <td>RESULT</td>
            <td>DLP</td>
          </tr>
        </thead>

        {scanResultsDom}
      </table>
    );
  }, [files, scanResultsDom]);

  const dropFile = () => {
    return (
      <div className="dnd-bar">
        <i className="icon-drop"></i>
        <span
          className="text"
          dangerouslySetInnerHTML={{
            __html: chrome.i18n.getMessage("dropFile"),
          }}
        />
      </div>
    );
  };

  return (
    <div
      className="popup--wrapper"
      onDrop={handleDragAndDrop}
      onDragOver={handleDragAndDrop}
    >
      <div
        className={`drop-overlay ${dropOverlayActive ? "active" : ""}`}
      ></div>
      <div className="popup--header">
        <div className="popup--header__logo"></div>
        <div className="popup--header__buttons">
          <a
            href="#"
            className={classNames(
              "popup--header__btn",
              viewScanHistoryClassName
            )}
            onClick={goToHistory}
          >
            <span className="icon-history text-14"></span>
          </a>
          <a href="#" className="popup--header__btn" onClick={goToSettings}>
            <span className="icon-cog text-14"></span>
          </a>
        </div>
      </div>

      <div className="popup--scan__history">{scanResults}</div>

      <div className="popup--drop__file text-right">{dropFile}</div>
    </div>
  );
};

export default Popup;
