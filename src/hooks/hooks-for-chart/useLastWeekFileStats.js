import { useContext, useMemo } from 'react';
import { ScanHistoryContext } from '../../providers/ScanHistoryProvider';
import { SCAN_STATUS } from '../../services/constants/file';

const useLastWeekFileStats = () => {
  const { files } = useContext(ScanHistoryContext);

  // date labels for the last 7 days
  const getDatesOfLastWeek = () => {
      return [...Array(7)].map((_, i) => {
          let date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          return date;
      }).reverse();
  };

  const dailyStats = useMemo(() => {
      const dates = getDatesOfLastWeek();
      return dates.map(date => {
          const startOfDay = date;
          const endOfDay = new Date(date);
          endOfDay.setHours(23, 59, 59, 999);

          // calculate daily stats
          return {
              date: `${date.getDate()}/${date.getMonth() + 1}`,
              scanned: files.filter(file => new Date(file.scanTime * 1000) >= startOfDay && new Date(file.scanTime * 1000) <= endOfDay).length,
              blocked: files.filter(file => new Date(file.scanTime * 1000) >= startOfDay && new Date(file.scanTime * 1000) <= endOfDay && file.status === SCAN_STATUS.VALUES.INFECTED).length,
              unknown: files.filter(file => new Date(file.scanTime * 1000) >= startOfDay && new Date(file.scanTime * 1000) <= endOfDay && file.status === SCAN_STATUS.VALUES.UNKNOWN).length,
              clean: files.filter(file => new Date(file.scanTime * 1000) >= startOfDay && new Date(file.scanTime * 1000) <= endOfDay && file.status === SCAN_STATUS.VALUES.CLEAN).length
          };
      });
  }, [files]);

  return dailyStats;
};

export default useLastWeekFileStats;
