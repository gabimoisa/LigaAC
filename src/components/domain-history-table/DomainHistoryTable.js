import React, { useMemo } from 'react';
import { Table } from 'react-bootstrap';
import moment from 'moment';
import DomainHistoryTableRow from './DomainHistoryTableRow';
import PropTypes from 'prop-types';

import './DomainHistoryTable.scss';

const DomainHistoryTable = ({ data, filterBy, removeDomain }) => {
    const processedData = useMemo(() => {
        if (!filterBy) {
            return data;
        }

        return data.filter((item) => {
            return item.domainName.includes(filterBy);
        });
    }, [data, filterBy]);

    const tableDom = useMemo(() => {
        if (!processedData?.length) {
            return <p className="mt-5 text-center" dangerouslySetInnerHTML={{ __html: chrome.i18n.getMessage('noDomainsFound') }} />;
        }

        return <Table bordered className="mt-4">
            <thead>
                <tr>
                    <th>Domain Name</th>
                    <th>Scan Time</th>
                    <th colSpan={3}>Results</th>
                </tr>
            </thead>

            <tbody>
                {processedData.map((item, key) => (
                   <DomainHistoryTableRow
                        key={key}
                        domainName={item.domainName}
                        reputation={item.reputation}
                        scanTime={moment.unix(item.scanTime).fromNow()}
                        removeDomain={(event) => removeDomain(event, item.id)}
                    />
                ))}
            </tbody>
        </Table>;
    }, [processedData]);


    return <>
        {tableDom}
    </>;
};

DomainHistoryTable.propTypes = {
    data: PropTypes.array,
    filterBy: PropTypes.string,
    removeFile: PropTypes.func,
    getStatusIcon: PropTypes.func
};

export default DomainHistoryTable;