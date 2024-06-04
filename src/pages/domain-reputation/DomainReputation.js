import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap';

import SidebarLayout from '../../components/common/sidebar-layout/SidebarLayout';
import DomainHistoryTable from '../../components/domain-history-table/DomainHistoryTable';

import GAContext from '../../providers/GAProvider';

import './DomainReputation.scss';
import DomainHistoryContext from '../../providers/DomainHistoryProvider';
import ConfigContext from '../../providers/ConfigProvider';


const DomainReputation = () => {

    const config = useContext(ConfigContext);
    const { domains, clearDomainHistory, removeDomainHistoryDomain } = useContext(DomainHistoryContext);
    const [ searchValue, setSearchValue ] = useState('');
    const [ totalAccessedDomains, setTotalAccessedDomains ] = useState(domains.length);
    const { gaTrackEvent } = useContext(GAContext);

    useEffect(() => {
        (async () => {
            gaTrackEvent(['_trackPageview', '/extension/domain']);
            setTotalAccessedDomains(domains.length);
        })();
    }, [domains]);

    const clearrDomainHistory = async () => {
        if (confirm(chrome.i18n.getMessage('deleteDomainHistoryConfirmation'))) {
            await clearDomainHistory();
            gaTrackEvent(['_trackEvent', config.gaEventCategory.name, config.gaEventCategory.action.buttonClickd, config.gaEventCategory.label.clearHistoryButton, config.gaEventCategory.value.clearHistoryButton]);
        }
    };

    const removeDomain = async (event, domain) => {
        event.preventDefault();
        await removeDomainHistoryDomain(domain);
        gaTrackEvent(['_trackEvent', config.gaEventCategory.name, config.gaEventCategory.action.buttonClickd, config.gaEventCategory.label.clearHistoryButton, config.gaEventCategory.value.deleteItemButton]);
    };

    const domainHistoryTableData = useMemo(() => {
        return domains?.map((item) => ({
            domainName: item.domainName,
            domainURL: item.domainURL,
            reputation: item.reputation,
            scanTime: item.scanTime,
            id: item.id, 
        }));
    }, [domains]);

    const handleSearch = (e) => setSearchValue(e.target?.value);

    const domainsPlaceholder = useMemo(() => totalAccessedDomains !== 1 ? 'domains' : 'domain', [totalAccessedDomains]);

    const content = totalAccessedDomains === 0 
        ?
        <Row>
            <Col className='mt-4 text-center font-weight-bold'>
                <span dangerouslySetInnerHTML={{ __html: chrome.i18n.getMessage('noDomainsNotification') }} />
            </Col>
        </Row>
        :
        <React.Fragment>
            <Row>
                <Col sm={6} xs={12}>
                    <InputGroup className="mb-4 history--search__input">
                        <Form.Control
                            placeholder="Search history"
                            aria-label="Search history"
                            onChange={handleSearch}
                        />
                        <InputGroup.Append>
                            <Button variant="outline-primary" disabled>
                                <span className="icon-search"></span>
                            </Button>
                        </InputGroup.Append>
                    </InputGroup>
                </Col>
            </Row>

            <Row className="align-items-center history--scan__info">
                <Col xs={6}>
                    <strong className="history--scanned__files">{`${totalAccessedDomains} ${domainsPlaceholder} scanned`}</strong>
                </Col>
                <Col xs={6} className="text-right">
                    <Button variant="outline-primary" className="small" onClick={() => (async() => await clearrDomainHistory())()}>Clear Domain History</Button>
                </Col>
            </Row>

            <DomainHistoryTable data={domainHistoryTableData} filterBy={searchValue} removeDomain={removeDomain} />
        </React.Fragment>;
    
  return <SidebarLayout
        className='domain'
        currentPage='domain'
        content={content}
    />;
}

export default DomainReputation