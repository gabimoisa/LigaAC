import React, { useState } from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import DLPTableScanResult from "./DLPTableScanResult";

const ScanHistoryTableRow = ({
  fileName,
  scanUrl,
  hash,
  scanTime,
  results,
  removeFile,
  status,
  getStatusIcon,
  useCore,
  useDLP,
  sanitizedFileURL,
  dlpInfo,
  sanitized
}) => {
  const [isTrashDisplayed, setIsTrashDisplayed] = useState(false);
  const [isDownloadDisplayed, setIsDownloadDisplayed] = useState(false);
  let sum_hits = 0;

  const trashClassName = classNames(
    {
      invisible: !isTrashDisplayed,
    },
    "mcl-icon icon-trash"
  );

  const cleanClassName = classNames({
    noThreatsFound: results === "No threats found",
  });

  const downloadSanitizedFile = () => {
    window.location.href = sanitizedFileURL;
  };

  const handleSumHits = () => {
    if (dlpInfo?.hits && Object.keys(dlpInfo?.hits)) {
      Object.keys(dlpInfo.hits).forEach((key) => {
        sum_hits += dlpInfo.hits[key].hits.length;
      });
    }
    return sum_hits;
  };

  const getDlpInfoErrors = (dlp_info) => {
    if (dlp_info) {
      if (dlp_info.verdict != 0 || dlp_info != 1) {
        if (dlp_info?.errors && Object.keys(dlp_info?.errors)) {
          let message = '';

          Object.keys(dlp_info.errors).forEach((key) => {
            message += dlp_info.errors[key] + '. ';
          })

          return message;

        } else {
          return "Failed to get dlp errors.";
        }

      } else {
        return "No DLP Errors found.";
      }
    } else {
      console.warn('dlp_info is undefined');

      return "dlp_info is undefined."
    }
  }

  return (
    <tr
      onMouseEnter={() => {
        setIsTrashDisplayed(true);
        setIsDownloadDisplayed(true);
      }}
      onMouseLeave={() => {
        setIsTrashDisplayed(false);
        setIsDownloadDisplayed(false);
      }}
    >
      <td>
        <span className={`${useCore ? "icon-server" : "icon-cloud"} mr-2`} />
        <div>
          <a
            className={`scanNameHash ${cleanClassName}`}
            href={scanUrl}
            target="_blank"
            rel="noreferrer"
          >
            {fileName}
          </a>
          <small className="d-block">{hash}</small>
        </div>
      </td>
      <td>{scanTime}</td>
      <td>
        {dlpInfo?.hits ? (
          <div>
            <span
              className="dataFound"
              dangerouslySetInnerHTML={{
                __html: chrome.i18n.getMessage("dlpDetections"),
              }}
            ></span>
            <span className="dataFound">{handleSumHits()}</span>
          </div>
        ) : (
          <a href={scanUrl} className={cleanClassName}>
            {results}
          </a>
        )}
      </td>
      <td className="p-0">
        <DLPTableScanResult
          dlpInfo={dlpInfo}
          getStatusIcon={getStatusIcon}
          status={status}
          useDLP={useDLP}
          downloadSanitizedFile={downloadSanitizedFile}
          sanitizedFileURL={sanitizedFileURL}
          sanitized={sanitized}
          getDlpInfoErrors={getDlpInfoErrors}
        />
      </td>
      <td className="p-0">
        <a
          href="#"
          onClick={removeFile}
          title={chrome.i18n.getMessage("deleteTooltip")}
          className="trash"
        >
          <span className={trashClassName} />
        </a>
      </td>
    </tr>
  );
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
  dlpInfo: PropTypes.object,
  sanitized: PropTypes.object
};

export default ScanHistoryTableRow;
