import React, { useContext, useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import SidebarLayout from '../../components/common/sidebar-layout/SidebarLayout';
import { ScanHistoryContext } from '../../providers/ScanHistoryProvider';

import useTodayFileStats from '../../hooks/hooks-for-chart/useTodayFileStats';
import useLastWeekFileStats from '../../hooks/hooks-for-chart/useLastWeekFileStats';
import useLastMonthFileStats from '../../hooks/hooks-for-chart/useLastMonthFileStats';
import useAllTimeFileStats from '../../hooks/hooks-for-chart/useAllTimeFileStats';

import "./Stats.scss"
import "../../assets/style/colors.scss"

// register chart.js components
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Stats = () => {
    const { files } = useContext(ScanHistoryContext);
    const { filesScannedToday, filesBlockedToday, filesUnknownToday, filesCleanToday } = useTodayFileStats();
    const lastWeekStats = useLastWeekFileStats();
    const lastMonthStats = useLastMonthFileStats();
    const { allTimeCleanFiles, allTimeInfectedFiles, allTimeUnknownFiles } = useAllTimeFileStats();

    const [timeFrame, setTimeFrame] = useState('today');
    const [chartData, setChartData] = useState({});

    const datasetsTemplate = [
        { 
            label: 'Clean Files', 
            backgroundColor: 'rgba(29,107,252,0.5)', // transparency
            borderColor: '#1d6bfc', 
            borderWidth: 1,
            barPercentage: 0.5,
            barThickness: 27,
            maxBarThickness: 35,
            minBarLength: 4,
        },
        { 
            label: 'Infected Files', 
            backgroundColor: 'rgba(208,3,0,0.5)', // transparency
            borderColor: '#d00300', 
            borderWidth: 1,
            barPercentage: 0.5,
            barThickness: 27,
            maxBarThickness: 35,
            minBarLength: 4,
        },
        { 
            label: 'Unknown Files', 
            backgroundColor: 'rgba(237,103,6,0.5)', // transparency
            borderColor: '#ed6706', 
            borderWidth: 1,
            barPercentage: 0.5,
            barThickness: 27,
            maxBarThickness: 35,
            minBarLength: 4,
        }
    ];

    // update chart data based on timeframe
    useEffect(() => {
        let labels = [];
        let cleanData = [];
        let infectedData = [];
        let unknownData = [];

        if (timeFrame === 'today') {
            labels.push("Today's Data");
            cleanData.push(filesCleanToday);
            infectedData.push(filesBlockedToday);
            unknownData.push(filesUnknownToday);

        } else if (timeFrame === 'lastWeek') {
            labels = lastWeekStats.map(day => day.date);
            cleanData = lastWeekStats.map(day => day.clean);
            infectedData = lastWeekStats.map(day => day.blocked);
            unknownData = lastWeekStats.map(day => day.unknown);

        } else if (timeFrame === 'lastMonth') {
            labels = lastMonthStats.map(week => week.week);
            cleanData = lastMonthStats.map(week => week.clean);
            infectedData = lastMonthStats.map(week => week.blocked);
            unknownData = lastMonthStats.map(week => week.unknown);
        }
        else if (timeFrame === 'allTime') {
            labels.push("All Time Data");
            cleanData.push(allTimeCleanFiles);
            infectedData.push(allTimeInfectedFiles);
            unknownData.push(allTimeUnknownFiles);
        }

        setChartData({
            labels: labels,
            datasets: [
                { ...datasetsTemplate[0], data: cleanData },
                { ...datasetsTemplate[1], data: infectedData },
                { ...datasetsTemplate[2], data: unknownData }
            ]
        });
    }, [timeFrame, filesScannedToday, filesBlockedToday, filesUnknownToday, filesCleanToday, lastWeekStats, lastMonthStats, allTimeCleanFiles, allTimeInfectedFiles, allTimeUnknownFiles]);

    const noDataAvailable = files.length === 0;

    const getChartOptions = (showLegend) => ({
        indexAxis: 'x',
        plugins: {
            legend: {
                display: showLegend,
                position: 'top'
            }
        }
    });

    const handleTimeFrameChange = (event) => {
        setTimeFrame(event.target.value);
    };

    const content = (
        <div className="stats">
            <h2>File Scan Statistics</h2>
            <div className="timeframe-selector">
                <label htmlFor="timeframe">Select Time Frame:</label>
                <select id="timeframe" onChange={handleTimeFrameChange} value={timeFrame}>
                    <option value="today">Today</option>
                    <option value="lastWeek">Last Week</option>
                    <option value="lastMonth">Last Month</option>
                    <option value="allTime">All Time</option>
                </select>
            </div>
            <div className="chart">
                {noDataAvailable ? (
                    <p>No scan data available. Start scanning files to see stats here.</p>
                ) : (
                    <>
                        <h3>
                            {timeFrame === 'today' ? "Today's Data" :
                            timeFrame === 'lastWeek' ? "Last Week's Data" :
                            timeFrame === 'lastMonth' ? "Last Month's Data" :
                            "All Time Data"}
                        </h3>
                        <Bar data={chartData} options={getChartOptions(true)} />
                    </>
                )}
            </div>
        </div>
    );

    return <SidebarLayout className='stats' currentPage='stats' content={content} />;
};

export default Stats;
