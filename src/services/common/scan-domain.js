import moment from 'moment'
import uniqid from 'uniqid'

function ScanDomain() {
    
    return {
        id: uniqid(),
        domainName: null,
        domainURL: null,
        scanTime: moment().unix(),
        reputation: null,

        //methods
        // getReputation: getReputation
    };
}

export default ScanDomain;

