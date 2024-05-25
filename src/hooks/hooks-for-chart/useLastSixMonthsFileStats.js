import { useContext, useMemo } from 'react';
import { ScanHistoryContext } from '../../providers/ScanHistoryProvider';
import { SCAN_STATUS } from '../../services/constants/file';

const useLastSixMonthsFileStats = () => {
    const { files } = useContext(ScanHistoryContext);

    const getMonthsOfLastSixMonths = () => {
        const months = [];
        let date = new Date();

        for (let i = 0; i < 6; i++) {
            const startOfMonth = new Date(date.getFullYear(), date.getMonth() - i, 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() - i + 1, 0, 23, 59, 59, 999);

            months.push({ startOfMonth, endOfMonth });
        }

        return months.reverse();
    };

    const monthlyStats = useMemo(() => {
        const months = getMonthsOfLastSixMonths();
        return months.map((month, index) => {
            const { startOfMonth, endOfMonth } = month;
            const monthLabel = startOfMonth.toLocaleString('default', { month: 'long' });
            const yearLabel = startOfMonth.getFullYear();

            return {
                month: `${monthLabel} ${yearLabel}`,
                scanned: files.filter(file => {
                    const scanDate = new Date(file.scanTime * 1000);
                    return scanDate >= startOfMonth && scanDate <= endOfMonth;
                }).length,
                blocked: files.filter(file => {
                    const scanDate = new Date(file.scanTime * 1000);
                    return scanDate >= startOfMonth && scanDate <= endOfMonth && file.status === SCAN_STATUS.VALUES.INFECTED;
                }).length,
                unknown: files.filter(file => {
                    const scanDate = new Date(file.scanTime * 1000);
                    return scanDate >= startOfMonth && scanDate <= endOfMonth && file.status === SCAN_STATUS.VALUES.UNKNOWN;
                }).length,
                clean: files.filter(file => {
                    const scanDate = new Date(file.scanTime * 1000);
                    return scanDate >= startOfMonth && scanDate <= endOfMonth && file.status === SCAN_STATUS.VALUES.CLEAN;
                }).length
            };
        });
    }, [files]);

    return monthlyStats;
};

export default useLastSixMonthsFileStats;
