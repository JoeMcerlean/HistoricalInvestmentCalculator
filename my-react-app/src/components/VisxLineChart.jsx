import React from 'react';
import { LinePath } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows, GridColumns } from '@visx/grid';
import { scaleLinear, scaleTime } from '@visx/scale';
import { extent, max } from 'd3-array';
import { curveMonotoneX } from '@visx/curve';
import { TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { timeFormat } from 'd3-time-format';

const VisxLineChart = ({ width, height, data }) => {
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = scaleTime({
    range: [0, innerWidth],
    domain: extent(data, (d) => new Date(d.date)),
  });

  const yScale = scaleLinear({
    range: [innerHeight, 0],
    domain: [0, max(data, (d) => d.value)],
    nice: true,
  });

  const formatDate = timeFormat('%b %d');

  const [tooltipData, setTooltipData] = React.useState(null);

  return (
    <div>
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          <GridRows scale={yScale} width={innerWidth} height={innerHeight} stroke="#e0e0e0" />
          <GridColumns scale={xScale} width={innerWidth} height={innerHeight} stroke="#e0e0e0" />
          <AxisBottom top={innerHeight} scale={xScale} tickFormat={formatDate} />
          <AxisLeft scale={yScale} />
          <LinePath
            data={data}
            x={(d) => xScale(new Date(d.date))}
            y={(d) => yScale(d.value)}
            stroke="#8884d8"
            strokeWidth={2}
            curve={curveMonotoneX}
            onMouseOver={(event) => {
              const point = localPoint(event);
              setTooltipData({ x: point.x, y: point.y, value: data[0].value, date: data[0].date });
            }}
            onMouseMove={(event) => {
              const point = localPoint(event);
              setTooltipData({ x: point.x, y: point.y, value: data[0].value, date: data[0].date });
            }}
            onMouseLeave={() => setTooltipData(null)}
          />
        </Group>
      </svg>
      {tooltipData && (
        <TooltipWithBounds
          key={Math.random()}
          top={tooltipData.y}
          left={tooltipData.x}
          style={{ ...defaultStyles, backgroundColor: 'white', color: 'black' }}
        >
          {`${formatDate(new Date(tooltipData.date))}: ${tooltipData.value}`}
        </TooltipWithBounds>
      )}
    </div>
  );
};

export default VisxLineChart;