import MetascanClient from "../../../services/common/metascan-client";
import { apikeyInfo } from "../../../services/common/persistent/apikey-info";
import { domainHistory } from "../../../services/common/persistent/domain-history";

export const sendDomainToApi = async () => {
    function getTrustworthySources(apiResponse) {
        if (apiResponse && apiResponse.lookup_results && apiResponse.lookup_results.sources) {
          const knownStatus = apiResponse.lookup_results.sources.filter(source => source.assessment !== '');
          if(knownStatus.length !== 0) {
            return knownStatus;
          } else {
                return 'Unknown';
            }
        }
    };

    return new Promise(async (resolve, reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
            const tab = tabs[0];
            const domain = new URL(tab.url).hostname;
            console.log(domain);

            await apikeyInfo.load();
            if (!apikeyInfo.data.apikey) {
                BrowserNotification.create(chrome.i18n.getMessage('undefinedApiKey'));
                reject(new Error('Undefined API key'));
                return;
            }
            try {
                const response = await MetascanClient.setAuth(apikeyInfo.data.apikey)?.domain?.lookup(domain);
                console.log(response.lookup_results.sources);
                await domainHistory.addDomain(domain);
                const trustworthySources = getTrustworthySources(response);
                resolve(trustworthySources);
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


