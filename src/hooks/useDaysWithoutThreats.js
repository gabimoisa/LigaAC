import { useContext, useMemo } from 'react';
import { ScanHistoryContext } from '../providers/ScanHistoryProvider';
import { SCAN_STATUS } from '../services/constants/file';

const useDaysSinceLastThreat = () => {
    const { files } = useContext(ScanHistoryContext);

    const calculateDaysSinceLastThreat = () => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());  // today at 00:00

        const threatDates = files
            .filter(file => file.status === SCAN_STATUS.VALUES.INFECTED)
            .map(file => new Date(file.scanTime * 1000))
            .sort((a, b) => b - a); //get most recent date first

        if (threatDates.length === 0) {
            return null;
        }

        const lastThreatDate = new Date(threatDates[0].getFullYear(), threatDates[0].getMonth(), threatDates[0].getDate()); // set to 00:00 on the day the last threat was detected

        const timeDifference = startOfToday - lastThreatDate; //in miliseconds
        const daysSinceLastThreat = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

        return daysSinceLastThreat;
    }

    const daysSinceLastThreat = useMemo(calculateDaysSinceLastThreat, [files]);

    return { daysSinceLastThreat };
};

export default useDaysSinceLastThreat;
