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
                return 'Unknown';
            }
        } else {
            return 'Not Available';
        }
    };

//     return new Promise(async (resolve, reject) => {
//         chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
//             const tab = tabs[0];
//             const domain = new ScanDomain();
//             domain.domainName = new URL(tab.url).hostname;

//             if(domain === undefined) {
//                 resolve("This is not a domain!");
//             } else {
//                 await apikeyInfo.load();
//                 if (!apikeyInfo.data.apikey) {
//                     BrowserNotification.create(chrome.i18n.getMessage('undefinedApiKey'));
//                     reject(new Error('Undefined API key'));
//                     return;
//                 }
//                 try {
//                     const response = await MetascanClient.setAuth(apikeyInfo.data.apikey)?.domain?.lookup(domain.domainName);

//                     const trustworthySources = getTrustworthySources(response);
//                     if(trustworthySources !== 'Unknown')
//                         domain.reputation = trustworthySources[0].assessment.charAt(0).toUpperCase() + trustworthySources[0].assessment.slice(1);
//                     else domain.reputation = trustworthySources;

//                     await domainHistory.init();
//                     await domainHistory.addDomain(domain);

//                     resolve(domain.reputation);
//                 } catch (error) {
//                     console.error(error);
//                     reject(error);
//                 }
//             }
//         });
//     });
// };

    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
            const tab = tabs[0];
            if (!tab || !tab.url) {
                resolve("No valid URL found in the current tab.");
                return;
            }

            let domainName;
            try {
                domainName = new URL(tab.url).hostname;
            } catch (error) {
                resolve("This is not a valid URL.");
                return;
            }

            if (!domainName) {
                resolve("This is not a domain!");
                return;
            }

            const domain = new ScanDomain();
            domain.domainName = domainName;

            await apikeyInfo.load();
            if (!apikeyInfo.data.apikey) {
                BrowserNotification.create(chrome.i18n.getMessage('undefinedApiKey'));
                reject(new Error('Undefined API key'));
                return;
            }
            try {
                const response = await MetascanClient.setAuth(apikeyInfo.data.apikey)?.domain?.lookup(domain.domainName);

                const trustworthySources = getTrustworthySources(response);
                if (trustworthySources === 'Unknown')
                    domain.reputation = trustworthySources[0].assessment.charAt(0).toUpperCase() + trustworthySources[0].assessment.slice(1);
                else
                    domain.reputation = trustworthySources;

                await domainHistory.init();
                await domainHistory.addDomain(domain);

                resolve(domain.reputation);
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    });
}


export const getAssessmentStyle = (assessment) => {
    switch (assessment.toLowerCase()) {
    case 'high risk' || 'malicious':
        return { color: '#d00400', fontWeight: 'bold', alignitems: 'center' };
    case 'suspicious':
        return { color: '#fdbd0e', fontWeight: 'bold', alignitems: 'center' };
    case 'moderate risk' || 'likely malicious':
        return { color: '#ed6707', fontWeight: 'bold', alignitems: 'center' };
    case 'low risk' || 'no threat':
        return { color: '#008a00', fontWeight: 'bold', alignitems: 'center' };
    case 'trustworthy' || 'benign':
        return { color: '#1c6bfc', fontWeight: 'bold', alignitems: 'center' };
    case 'unknown':
        return { color: '#313c4d', fontWeight: 'bold', alignitems: 'center' };
    case 'not available':
        return { color: '#000000', fontWeight: 'bold', alignitems: 'center' };
    default:
        return {};
    }
  };



