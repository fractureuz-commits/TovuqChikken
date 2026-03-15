// components/PieActiveArc.jsx
import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { desktopOS } from './webUsageStats';

export default function PieActiveArc() {
  // Umumiy qiymatni hisoblaymiz (foiz uchun kerak)
  const total = desktopOS.reduce((acc, cur) => acc + cur.value, 0);

  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      className="sircle"
    >
      <PieChart
        series={[
          {
            data: desktopOS,
            highlightScope: { fade: 'global', highlight: 'item' },
            faded: {
              innerRadius: 30,
              additionalRadius: -30,
              color: 'gray',
            },
            innerRadius: 40,
            outerRadius: 100,
            paddingAngle: 2,
            cornerRadius: 4,
            label: {
              visible: true,
              formatter: ({ value }) => `${((value / total) * 100).toFixed(1)}%`,
            },
          },
        ]}
        height={250}
        width={250}
        slotProps={{
          legend: { hidden: false },
          tooltip: { trigger: 'item' },
        }}
      />
    </div>
  );
}
