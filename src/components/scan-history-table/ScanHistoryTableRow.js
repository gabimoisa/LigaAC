import React, { useState } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

const ScanHistoryTableRow = ({ fileName, scanUrl, hash, scanTime, results, removeFile, status, getStatusIcon, useCore, sandboxVerdict }) => {
    const [isTrashDisplayed, setIsTrashDisplayed] = useState(false);
    let scanUrlSand = scanUrl;
    const trashClassName = classNames({
        'invisible': !isTrashDisplayed
    }, 'mcl-icon icon-trash');

    const cleanClassName = classNames({
        'noThreatsFound': results === 'No threats found'
    });

    const Sandbox = classNames({
        'sandboxInformational': sandboxVerdict === 'Informational',
        'sandboxSuspicious': sandboxVerdict === 'Suspicious',
        'sandboxMalicious': sandboxVerdict === 'Malicious',
        'sandboxLikelyMalicious': sandboxVerdict === 'Likely Malicious',
        'sandboxBenign': sandboxVerdict === 'Benign',
        'sandboxUnknown': sandboxVerdict === 'Unknown'

    });

    if (results !== 'No threats found' && results !== 'Threats detected') {
        sandboxVerdict = results;
    }

    if(sandboxVerdict === 'Informational')
        sandboxVerdict = 'No Threat';

    if(sandboxVerdict !== 'No dynamic analysis performed')
    {

        let parts = scanUrlSand?.split('/');

        if (parts.length > 1) {
            parts.pop();
        }

        let newUrl = parts?.join('/') + '/sandbox/summary';
        scanUrlSand = newUrl;
    }

    

    return (
        <tr
            onMouseEnter={() => setIsTrashDisplayed(true)}
            onMouseLeave={() => setIsTrashDisplayed(false)}
        >
            <td>
                <span className={`${useCore ? 'icon-server' : 'icon-cloud'} mr-2`} />
                <div>
                    <a className={`scanNameHash ${cleanClassName}`} href={scanUrl} target='_blank' rel='noreferrer'>{fileName}</a>
                    <small className="d-block">{hash}</small>
                </div>
            </td>
            <td><div className='td-data'>{scanTime}</div></td>
            <td>
                <div className='td-data'>
                    <a href={scanUrl} className={cleanClassName}>{results}</a>
                </div>
            </td>
            <td className="p-0">
                <div className='td-data'>
                    <span className={`${getStatusIcon(status)} ${cleanClassName}`} />
                </div>
            </td>
            <td>
                <div className='td-data'>
                    <a href={scanUrlSand} className={Sandbox}>{sandboxVerdict}</a>
                </div>
            </td>
            <td className="p-0">
                <div className='td-data'>
                    <a href="#" onClick={removeFile} title={chrome.i18n.getMessage('deleteTooltip')} className='trash'>
                        <span className={trashClassName} />
                    </a>
                </div>
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
    sandboxVerdict: PropTypes.string
};

export default ScanHistoryTableRow;