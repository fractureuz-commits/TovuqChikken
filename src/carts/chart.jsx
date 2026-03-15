import { BarChart } from '@mui/x-charts/BarChart';

const SeriousBarChart = () => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <BarChart
        series={[
          {
            data: [20, 25, 30, 40, 15, 10, 11, 12, 30,40, 14, 10, 10, 10, 10, 10,12,32],
            label: 'Ulushi',
            color: '#1abc9c',
          },
        ]}
        xAxis={[
          {
            data: ['Petrol', 'Diesel', 'Electric', 'Hybrid','nimadur1','nimadur7','nimadur3','nimadur4','nimadur2','nimadur2','nimadur3','nimadur4','nimadur5','nimadur6','nimadur6','nimadur7','nimadur8', '1'],
            scaleType: 'band',
            label: 'Yonilg‘i turlari',
            tickLabelStyle: { fill: '#fff' },
          },
        ]}
        grid={{ horizontal: true }}
        sx={{
          backgroundColor: 'transparent',
          '.MuiChartsAxis-tickLabel': {
            fill: '#fff',
            fontSize: 13,
          },
          '.MuiChartsAxis-line': {
            stroke: '#fff',
          },
        }}
      />
    </div>
  );
};

export default SeriousBarChart;
