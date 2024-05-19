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
   * @returns {string} The icon class
   */
  const getStatusIcon = (fileStatus) => {
    if (fileStatus == ScanFile.STATUS.CLEAN) {
      return "icon-ok";
    }

    if (fileStatus == ScanFile.STATUS.INFECTED) {
      return "icon-cancel";
    }

    if (fileStatus == ScanFile.STATUS.SCANNING) {
      return "icon-spin animate-spin";
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
            console.log('handleDragAndDrop file ', file);

            const reader = new FileReader();
            reader.onload = (e) => {
                const fileContent = e.target.result;
                let fileUrl;
                try {
                  fileUrl = URL.createObjectURL(new Blob([fileContent], { type: fileContent.type }));

                  fileUrl = (fileUrl + '/').concat(file.name);
                }
                catch (e) {
                    console.log(e);
                }
                
                if (navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage({
                        type: 'fileUploaded',
                        fileUrl: fileUrl
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
              className={`mcl-icon ${getStatusIcon(scannedFile.status)}`}
            ></span>
          </td>
          <td>
            {scannedFile.useDLP && scannedFile.sanitizedFileURL ? (
              <span className="downloadSanitizedButtonBox">
                <a
                  href={scannedFile.sanitizedFileURL}
                  className="downloadSanitizedButton"
                >
                  <span className="icon-down"></span>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: chrome.i18n.getMessage("sanitizedVersion"),
                    }}
                  ></span>
                </a>
              </span>
            ) : getStatusIcon(scannedFile.status).includes("icon-spin") &&
              scannedFile.useDLP ? (
              <span
                dangerouslySetInnerHTML={{
                  __html: chrome.i18n.getMessage("scanDLP"),
                }}
              ></span>
            ) : getStatusIcon(scannedFile.status).includes("icon-spin") ||
              !scannedFile.useDLP ? (
              <span
                dangerouslySetInnerHTML={{
                  __html: chrome.i18n.getMessage("noDLP"),
                }}
              ></span>
            ) : null}
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

  const dropFile = useMemo(() => {
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
  });

  console.log(files);
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
