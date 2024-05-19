import { useContext, useMemo } from 'react';
import { ScanHistoryContext } from '../providers/ScanHistoryProvider';
import { SCAN_STATUS } from '../services/constants/file';

const useDaysSinceLastThreat = () => {
    const { files } = useContext(ScanHistoryContext);

    const calculateDaysSinceLastThreat = () => {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);


        const threatDates = files
            .filter(file => file.status === SCAN_STATUS.VALUES.INFECTED)
            .map(file => new Date(file.scanTime * 1000))
            .sort((a, b) => b - a); // to get the most recent date first

        if (threatDates.length === 0) {
            return null;
        }

        const lastThreatDate = threatDates[0];
        if (lastThreatDate >= startOfToday) {
            return 0; // if threat was found today
        }

        const timeDifference = today - lastThreatDate;
        const daysSinceLastThreat = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

        return daysSinceLastThreat;
    }

    const daysSinceLastThreat = useMemo(calculateDaysSinceLastThreat, [files]);

    return { daysSinceLastThreat };
};

export default useDaysSinceLastThreat;
