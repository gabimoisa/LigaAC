import { useContext, useMemo } from 'react';
import { ScanHistoryContext } from '../../providers/ScanHistoryProvider';
import { SCAN_STATUS } from '../../services/constants/file';

const useLastMonthFileStats = () => {
    const { files } = useContext(ScanHistoryContext);

    // start and end dates for each of the past 4 weeks
    const getWeeksOfLastMonth = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return [...Array(4)].map((_, i) => {
            const endOfWeek = new Date(today);
            endOfWeek.setDate(today.getDate() - (i * 7));
            endOfWeek.setHours(23, 59, 59, 999);
            
            const startOfWeek = new Date(endOfWeek);
            startOfWeek.setDate(endOfWeek.getDate() - 6);
            startOfWeek.setHours(0, 0, 0, 0);

            return { startOfWeek, endOfWeek };
        }).reverse();
    };

    const weeklyStats = useMemo(() => {
        const weeks = getWeeksOfLastMonth();
        return weeks.map((week, index) => {
            const { startOfWeek, endOfWeek } = week;
            const startDateLabel = `${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1}`;
            const endDateLabel = `${endOfWeek.getDate()}/${endOfWeek.getMonth() + 1}`;

            // weekly stats
            return {
                week: `Week ${index + 1} (${startDateLabel} - ${endDateLabel})`,
                scanned: files.filter(file => new Date(file.scanTime * 1000) >= startOfWeek && new Date(file.scanTime * 1000) <= endOfWeek).length,
                blocked: files.filter(file => new Date(file.scanTime * 1000) >= startOfWeek && new Date(file.scanTime * 1000) <= endOfWeek && file.status === SCAN_STATUS.VALUES.INFECTED).length,
                unknown: files.filter(file => new Date(file.scanTime * 1000) >= startOfWeek && new Date(file.scanTime * 1000) <= endOfWeek && file.status === SCAN_STATUS.VALUES.UNKNOWN).length,
                clean: files.filter(file => new Date(file.scanTime * 1000) >= startOfWeek && new Date(file.scanTime * 1000) <= endOfWeek && file.status === SCAN_STATUS.VALUES.CLEAN).length
            };
        });
    }, [files]);

    return weeklyStats;
};

export default useLastMonthFileStats;
