import React, { useContext, useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import SidebarLayout from '../../components/common/sidebar-layout/SidebarLayout';
import { ScanHistoryContext } from '../../providers/ScanHistoryProvider';
import * as UrlConfig from './urlConfig';
import * as FileConfig from './fileConfig';
import useTodayFileStats from '../../hooks/hooks-for-chart/useTodayFileStats';
import useLastWeekFileStats from '../../hooks/hooks-for-chart/useLastWeekFileStats';
import useLastMonthFileStats from '../../hooks/hooks-for-chart/useLastMonthFileStats';
import useLastSixMonthsFileStats from '../../hooks/hooks-for-chart/useLastSixMonthsFileStats';
import useAllTimeFileStats from '../../hooks/hooks-for-chart/useAllTimeFileStats';

import "./Stats.scss";
import "../../assets/style/colors.scss";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Stats = () => {
    const { files } = useContext(ScanHistoryContext);
    const { filesCleanToday, filesBlockedToday, filesUnknownToday } = useTodayFileStats();
    const lastWeekStats = useLastWeekFileStats();
    const lastMonthStats = useLastMonthFileStats();
    const lastSixMonthsStats = useLastSixMonthsFileStats();
    const { allTimeCleanFiles, allTimeInfectedFiles, allTimeUnknownFiles } = useAllTimeFileStats();

    const [timeFrame, setTimeFrame] = useState('today');
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });
    const [urlData, setUrlData] = useState({
        labels: [],
        datasets: []
    });

    useEffect(() => {
        let labels = [];
        let cleanData = [];
        let infectedData = [];
        let unknownData = [];
        let visitedUrlData = [];
        let blockedUrlData = [];

        switch (timeFrame) {
            case 'today':
                labels = ["Today"];
                cleanData = [filesCleanToday];
                infectedData = [filesBlockedToday];
                unknownData = [filesUnknownToday];
                visitedUrlData = UrlConfig.numbers({ count: 1, min: 22, max: 50 });
                blockedUrlData = UrlConfig.numbers({ count: 1, min: 0, max: 19 });
                break;
            case 'lastWeek':
                labels = lastWeekStats.map(day => day.date);
                cleanData = lastWeekStats.map(day => day.clean);
                infectedData = lastWeekStats.map(day => day.blocked);
                unknownData = lastWeekStats.map(day => day.unknown);
                visitedUrlData = UrlConfig.numbers({ count: lastWeekStats.length, min: 20, max: 100 });
                blockedUrlData = UrlConfig.numbers({ count: lastWeekStats.length, min: 0, max: 20 });
                break;
            case 'lastMonth':
                labels = lastMonthStats.map(week => week.week);
                cleanData = lastMonthStats.map(week => week.clean);
                infectedData = lastMonthStats.map(week => week.blocked);
                unknownData = lastMonthStats.map(week => week.unknown);
                visitedUrlData = UrlConfig.numbers({ count: lastMonthStats.length, min: 100, max: 300 });
                blockedUrlData = UrlConfig.numbers({ count: lastMonthStats.length, min: 14, max: 100 });
                break;
            case 'lastSixMonths':
                labels = lastSixMonthsStats.map(month => month.month);
                cleanData = lastSixMonthsStats.map(month => month.clean);
                infectedData = lastSixMonthsStats.map(month => month.blocked);
                unknownData = lastSixMonthsStats.map(month => month.unknown);
                visitedUrlData = UrlConfig.numbers({ count: lastSixMonthsStats.length, min: 100, max: 400 });
                blockedUrlData = UrlConfig.numbers({ count: lastSixMonthsStats.length, min: 33, max: 100 });
                break;
            case 'allTime':
                labels = ["All Time"];
                cleanData = [allTimeCleanFiles];
                infectedData = [allTimeInfectedFiles];
                unknownData = [allTimeUnknownFiles];
                visitedUrlData = UrlConfig.numbers({ count: 1, min: 400, max: 800 });
                blockedUrlData = UrlConfig.numbers({ count: 1, min: 34, max: 400 });
                break;
            default:
                break;
        }

        setChartData({
            labels,
            datasets: [
                { label: 'Clean Files', data: cleanData, ...FileConfig.fileChartColors.cleanFiles, borderWidth: FileConfig.borderWidth, barThickness: FileConfig.barThickness },
                { label: 'Infected Files', data: infectedData, ...FileConfig.fileChartColors.infectedFiles, borderWidth: FileConfig.borderWidth, barThickness: FileConfig.barThickness },
                { label: 'Unknown Files', data: unknownData, ...FileConfig.fileChartColors.unknownFiles, borderWidth: FileConfig.borderWidth, barThickness: FileConfig.barThickness }
            ]
        });

        setUrlData({
            labels,
            datasets: [
                {
                    label: 'Visited URLs',
                    data: visitedUrlData,
                    backgroundColor: UrlConfig.urlChartColors.visitedUrls.backgroundColor,
                    borderColor: UrlConfig.urlChartColors.visitedUrls.borderColor,
                    borderWidth: UrlConfig.borderWidth,
                    borderRadius: Number.MAX_VALUE,
                    borderSkipped: false,
                    barThickness: FileConfig.barThickness
                },
                {
                    label: 'Blocked URLs',
                    data: blockedUrlData,
                    backgroundColor: UrlConfig.urlChartColors.blockedUrls.backgroundColor,
                    borderColor: UrlConfig.urlChartColors.blockedUrls.borderColor,
                    borderWidth: UrlConfig.borderWidth,
                    borderRadius: Number.MAX_VALUE,
                    borderSkipped: false,
                    barThickness: FileConfig.barThickness
                }
            ]
        });
    }, [timeFrame, filesCleanToday, filesBlockedToday, filesUnknownToday, lastWeekStats, lastMonthStats, lastSixMonthsStats, allTimeCleanFiles, allTimeInfectedFiles, allTimeUnknownFiles]);

    const getChartOptions = (showLegend) => ({
        indexAxis: 'x',
        plugins: {
            legend: {
                display: showLegend,
                position: 'top'
            }
        }
    });

    const content = (
        <div className="stats">
            <h2>Scan Statistics</h2>
            <div className="timeframe-selector">
                <label htmlFor="timeframe">Select Time Frame:</label>
                <select id="timeframe" onChange={(e) => setTimeFrame(e.target.value)} value={timeFrame}>
                    <option value="today">Today</option>
                    <option value="lastWeek">Last Week</option>
                    <option value="lastMonth">Last Month</option>
                    <option value="lastSixMonths">Last Six Months</option>
                    <option value="allTime">All Time</option>
                </select>
            </div>
            <div className="chart">
                {files.length === 0 ? (
                    <p>No scan data available. Start scanning files to see stats here.</p>
                ) : (
                    <>
                        <h3>
                            {timeFrame === 'today' ? "Today's File Data" :
                                timeFrame === 'lastWeek' ? "Last Week's File Data" :
                                    timeFrame === 'lastMonth' ? "Last Month's File Data" :
                                        timeFrame === 'lastSixMonths' ? "Last Six Months' File Data" :
                                            "All Time File Data"}
                        </h3>
                        <Bar data={chartData} options={getChartOptions(true)} />
                    </>
                )}
            </div>
            <div className="chart">
                {files.length === 0 ? (
                    <p>No URL data available. Start visiting URLs to see stats here.</p>
                ) : (
                    <>
                        <h3>
                            {timeFrame === 'today' ? "Today's URL Data" :
                                timeFrame === 'lastWeek' ? "Last Week's URL Data" :
                                    timeFrame === 'lastMonth' ? "Last Month's URL Data" :
                                        timeFrame === 'lastSixMonths' ? "Last Six Months' URL Data" :
                                            "All Time URL Data"}
                        </h3>
                        <Bar data={urlData} options={getChartOptions(true)} />
                    </>
                )}
            </div>
        </div>
    );

    return <SidebarLayout className='stats' currentPage='stats' content={content} />;
};

export default Stats;
