import React, { useState } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { getAssessmentStyle } from '../popup/utils/popup_domain'

const DomainHistoryTableRow = ({ domainName, reputation, scanTime, removeDomain}) => {
    const [isTrashDisplayed, setIsTrashDisplayed] = useState(false);
    const trashClassName = classNames({
        'invisible': !isTrashDisplayed
    }, 'mcl-icon icon-trash');

    const domainUrl = `http://${domainName}`;

    return <tr
        onMouseEnter={() => setIsTrashDisplayed(true)}
        onMouseLeave={() => setIsTrashDisplayed(false)}
    >
        <td>
            <div>
                <a href={domainUrl}>{domainName}</a>
            </div>
        </td>
        <td>{scanTime}</td>
        <td>
            <a style={getAssessmentStyle(reputation)}>{reputation}</a>
        </td>
        <td className="p-0">
            <a href="#" onClick={removeDomain} title={chrome.i18n.getMessage('deleteTooltip')} className='trash'>
                <span className={trashClassName} />
            </a>
        </td>
    </tr>;
};

DomainHistoryTableRow.propTypes = {
    domainName: PropTypes.string,
    scanTime: PropTypes.string,
    reputation: PropTypes.string,
    removeDomain: PropTypes.func,
};

export default DomainHistoryTableRow;