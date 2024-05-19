import { useContext, useMemo } from 'react';
import { ScanHistoryContext } from '../../providers/ScanHistoryProvider';
import { SCAN_STATUS } from '../../services/constants/file';

const useAllTimeFileStats = () => {
    const { files } = useContext(ScanHistoryContext);

    const countAllTimeCleanFiles = () => {
        return files.filter(file => file.status === SCAN_STATUS.VALUES.CLEAN).length;
    };

    const countAllTimeInfectedFiles = () => {
        return files.filter(file => file.status === SCAN_STATUS.VALUES.INFECTED).length;
    };

    const countAllTimeUnknownFiles = () => {
        return files.filter(file => file.status === SCAN_STATUS.VALUES.UNKNOWN).length;
    };

    const allTimeCleanFiles = useMemo(countAllTimeCleanFiles, [files]);
    const allTimeInfectedFiles = useMemo(countAllTimeInfectedFiles, [files]);
    const allTimeUnknownFiles = useMemo(countAllTimeUnknownFiles, [files]);

    return { allTimeCleanFiles, allTimeInfectedFiles, allTimeUnknownFiles };
};

export default useAllTimeFileStats;
