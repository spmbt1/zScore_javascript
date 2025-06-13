// компонент App.tsx для zScore-charts-with-areas (React 18ю3 на хуках)
import React from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Dot,
} from 'recharts';
import './styles.css';

// функции zScore
//const [chartData, setChartData] = React.useState([]);
const zCutoff = 1; // условие отсечки z-оценки; что больше по модулю - то красным
let sets = 'd1,d2,d3,d4'.split(','); // сколько кривых выводить (менять состав, чтобы отключить)

function deviation(values, valueof) {
  const v = variance(values, valueof);
  return v ? Math.sqrt(v) : v;
}

function variance(values, valueof) {
  let x = 0,
    mean = 0,
    sum = 0,
    delta;
  if (valueof === undefined) {
    for (let v of values)
      if (v != null && (v = +v) >= v) {
        delta = v - mean;
        mean += delta / ++x;
        sum += delta * (v - mean);
      }
  } else {
    let i = -1;
    for (let v of values)
      if ((v = valueof(v, ++i, values)) != null && (v = +v) >= v) {
        delta = v - mean;
        mean += delta / ++x;
        sum += delta * (v - mean);
      }
  } // here the n-1 : http://duramecho.com/Misc/WhyMinusOneInSd.html
  if (x > 1) return sum / (x - 1);
}

function mean(values, valueof) {
  let x = 0,
    sum = 0;
  if (valueof === undefined) {
    for (let v of values)
      if (v != null && (v = +v) >= v) {
        ++x, (sum += v);
      }
  } else {
    let i = -1;
    for (let v of values)
      if ((v = valueof(v, ++i, values)) != null && (v = +v) >= v) {
        ++x, (sum += v);
      }
  }
  if (x) return sum / x;
}

const zScore = (inputs, accessor) =>
  inputs.map((i) => (i - mean(inputs, accessor)) / deviation(inputs, accessor));
// конец функций zScore
let S = [
  // параметры множеств данных
  {
    set: 'd1',
  },
  {
    set: 'd2',
    colrStroke: '#f37c',
    colrRed: '#f37c',
    colrGreen: 'blue',
  },
  {
    set: 'd3',
    colrStroke: '#b3ac',
    colrRed: '#b3ac',
    colrGreen: '#047495',
  },
  {
    set: 'd4',
    colrStroke: '#b3ac',
    colrRed: '#b3ac',
    colrGreen: '#047495',
  },
].map((el) => ({
  ...{
    // параметры множества по умолчанию
    opacRed: 0.8,
    opacGreen: 0.1,
    colrRed: 'red',
    colrGreen: 'green',
    colrStroke: 'green',
    colrStrokeAlarm: 'red',
  },
  ...el,
}));
let data = [
    {
      name: 'Page A',
      d1: 4220,
      d2: 2370,
      d3: 6350,
      d4: -2820,
    },
    {
      name: 'Page B',
      d1: 2000,
      d2: 1398,
      d3: 6210,
      d4: -2600,
    },
    {
      name: 'Page C',
      d1: -1493,
      d2: 9800,
      d3: 6290,
      d4: -2800,
    },
    {
      name: 'Page D',
      d1: 500,
      d2: 3908,
      d3: 6000,
    },
    {
      name: 'Page E',
      d1: -2000,
      d2: 5900,
      //d3: 6181,
      d4: -3050,
    },
    {
      name: 'Page F',
      d1: -250,
      d2: 3800,
      d3: 6500,
      d4: -3100,
    },
    {
      name: 'Page G',
      d1: 4100,
      d2: 4500,
      d3: 6100,
    },
  ],
  dMaxGlob = -Infinity, // отступы сверху, снизу
  dMinGlob = Infinity;

const gradientOffset = (z) => {
  const zz = 'z' + z,
    dG = data
      .filter((i) => i[z] && Math.abs(i[zz]) <= zCutoff)
      .map((i) => i[z][1]),
    greenMax = Math.max(...dG),
    greenMin = Math.min(...dG),
    dZ = data.filter((i) => i[zz]).map((i) => i[z][1]),
    dataMax = Math.max(...dZ),
    dataMin = Math.min(...dZ);
  //console.log('=='+z,dZ, dataMax,greenMax, data.filter((x) => x), dataMax !== dataMin ? (dataMax - zCutoff) / (dataMax - dataMin) : 0.5);
  return dataMax === dataMin
    ? [0.5, 0.5]
    : [
      ((dataMax - greenMax) * 0.8) / (dataMax - dataMin),
      ((greenMin - dataMin) * 0.8) / (dataMax - dataMin),
    ];
};

for (let y of sets) {
  const dZ = data.filter((i) => i[y]).map((i) => i[y]),
    dataMax = Math.max(...dZ),
    dataMin = Math.min(...dZ); // пределы красных полос
  dMaxGlob = Math.max(dMaxGlob, dataMax);
  dMinGlob = Math.min(dMinGlob, dataMin);
  //console.log('=='+y, dataMin);
  data = data.map((x, i) => ({
    // добавили z-оценки
    ...x,
    ['z' + y]: zScore(data.map((x) => x[y]))[i],
    [y]: [dataMin, data.map((x) => x[y])[i]],
  }));
  S.map((el, i) => {
    S[i]['G'] = gradientOffset(el.set);
  });
}

const redGreenDot = (x) => (
    <Dot
      cx={x.cx}
      cy={x.cy}
      r={3}
      stroke={Math.abs(x.payload['z' + x.dataKey]) > zCutoff ? 'red' : '#3d3'}
      strokeWidth={Math.abs(x.payload['z' + x.dataKey]) > zCutoff ? 6 : 2}
    />
  ),
  chgGroupsList = (ev, x) => {
    const A = structuredClone(sets);
    //console.log('--3', A, x, sets);
    if (A.indexOf(x) >= 0) A.splice(A.indexOf(x), 1);
    else A.push(x);
    debugger;
    //this.setState({ sets: A });
  };

export default function App() {
  return (
    <div>
      <div style={{ textAlign: 'center' }}>
        {S.map((s, i) => (
          <span className="chbGroups" key={'c_' + s.set + "_" + i}>
            <input
              type="checkbox"
              id={'i_' + s.set}
              checked={sets.indexOf(s.set) >= 0}
              disabled={sets.indexOf(s.set) < 0}
              onClick={(ev) => chgGroupsList(ev, s.set)}
              onChange={x=>x}
            />
            <label
              htmlFor={'i_' + s.set}
              style={{
                cursor: sets.indexOf(s.set) < 0 ? 'no-drop' : 'pointer',
              }}
            >
              &nbsp;группа <b>{s.set}</b>;{' '}
            </label>
          </span>
        ))}
        <i>(показать группы данных)</i>
      </div>
      <AreaChart
        width={500}
        height={400}
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis
          type="number"
          domain={[
            (x) => x - (dMaxGlob - x) * 0.01,
            (x) => x + (x - dMinGlob) * 0.01,
          ]}
        />
        <Tooltip />
        <defs>
          {S.map((s, i) => (
            <linearGradient key={s.set + "_" + i} id={s.set} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset={s['G'][0]}
                stopColor={s.colrRed}
                stopOpacity={s.opacRed}
              />
              <stop
                offset={s['G'][0]}
                stopColor={s.colrGreen}
                stopOpacity={s.opacGreen}
              />
              <stop
                offset={1 - s['G'][1]}
                stopColor={s.colrGreen}
                stopOpacity={s.opacGreen}
              />
              <stop
                offset={1 - s['G'][1]}
                stopColor={s.colrRed}
                stopOpacity={s.opacRed}
              />
            </linearGradient>
          ))}
        </defs>
        {S.map((s, i) =>
          sets.indexOf(s.set) >= 0 &&
          document.querySelector(`.chbGroups #i_${s.set}`)?.['checked'] !==
            'checked' ? <React.Fragment key={"F_" + s.set + "_" + i}>
            <Area
              type="monotone"
              dataKey={s.set}
              fill={`url(#${s.set})`}
              dot={redGreenDot}
              stroke={s.colrStroke}
            />
          </React.Fragment> : null
        )}
      </AreaChart>
    </div>
  );
}
