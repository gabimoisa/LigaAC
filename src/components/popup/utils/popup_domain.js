import MetascanClient from "../../../services/common/metascan-client";
import { apikeyInfo } from "../../../services/common/persistent/apikey-info";
import { domainHistory } from "../../../services/common/persistent/domain-history";
import ScanDomain from "../../../services/common/scan-domain"

export const sendDomainToApi = async () => {
    function getTrustworthySources(apiResponse) {
        if (apiResponse && apiResponse.lookup_results && apiResponse.lookup_results.sources) {
          const knownStatus = apiResponse.lookup_results.sources.filter(source => source.assessment !== '');
          if(knownStatus.length !== 0) {
            return knownStatus;
          } else {
                return 'Not Available';
            }
        }
    };

    return new Promise(async (resolve, reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
            const tab = tabs[0];
            const domain = new ScanDomain();
            domain.domainName = new URL(tab.url).hostname;

            await apikeyInfo.load();
            if (!apikeyInfo.data.apikey) {
                BrowserNotification.create(chrome.i18n.getMessage('undefinedApiKey'));
                reject(new Error('Undefined API key'));
                return;
            }
            try {
                const response = await MetascanClient.setAuth(apikeyInfo.data.apikey)?.domain?.lookup(domain.domainName);

                
                const trustworthySources = getTrustworthySources(response);
                if(trustworthySources !== 'Not Available')
                    domain.reputation = trustworthySources[0].assessment.charAt(0).toUpperCase() + trustworthySources[0].assessment.slice(1);
                else domain.reputation = trustworthySources;

                await domainHistory.init();
                await domainHistory.addDomain(domain);

                resolve(domain.reputation);
            } catch (error) {
                console.log('err', error);
                reject(error);
            }
        });
    });
};

export const getColorByRiskLevel = (riskLevel) => {
    switch (riskLevel.toLowerCase()) {
        case 'high risk' || 'malicious':
            return '#d00400';
        case 'suspicious':
            return '#fdbd0e';
        case 'moderate risk' || 'likely malicious':
            return '#ed6707';
        case 'low risk' || 'no threat':
            return '#008a00';
        case 'trustworthy' || 'benign':
            return '#1c6bfc';
        case 'unknown':
            return '#313c4d';
        default:
            return '#000000'; // Default color
    }
};


