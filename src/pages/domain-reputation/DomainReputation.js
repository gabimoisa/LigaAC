import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap';

import SidebarLayout from '../../components/common/sidebar-layout/SidebarLayout';
import ScanHistoryTable from '../../components/scan-history-table/ScanHistoryTable';
import ScanFile from '../../services/common/scan-file';

import ConfigContext from '../../providers/ConfigProvider';
import GAContext from '../../providers/GAProvider';

import './DomainReputation.scss';
import DomainHistoryContext from '../../providers/DomainHistoryProvider';


const DomainReputation = () => {
    const { domains, clearDomainHistory, removeDomainHistoryDomain } = useContext(DomainHistoryContext);
    const [ totalAccessedDomains, setTotalAccessedDomains ] = useState(domains.length);
    const { gaTrackEvent } = useContext(GAContext);

    useEffect(() => {
        (async () => {
            gaTrackEvent(['_trackPageview', '/extension/domain']);
            setTotalAccessedDomains(domains.length);
        })();
    }, [domains]);

    const content = domains.length === 0 ?
        <Row>
            <Col className='mt-4 text-center font-weight-bold'>
                <span dangerouslySetInnerHTML={{ __html: chrome.i18n.getMessage('noDomainsNotification') }} />
            </Col>
        </Row>
    :
        <div>{domains}, {domains.length}</div>
    
  return <SidebarLayout
        className='domain'
        currentPage='domain'
        content={content}
    />;
}

export default DomainReputation