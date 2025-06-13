/** Компонент zScore (z-оценки) для демо в Recharts __на хуках__. Использовать: (React 18.3-19.1)
 * 0) Просто собираем проект локально по README: (npm i; npm run dev) или билд. Или:
 * 1) Копируем всё в страницу https://codesandbox.io/p/devbox/line-chart-width-xaxis-padding-forked-cj8cfy?file=%2Fsrc%2FApp.tsx (впрочем, уже там есть)
 * 2) Переключаем чекбоксы над графиками или меняем let sets =... Смотрим результат. (Версия 2025-06-12)
 * Результат - участки функции с |zScore| > 1 заполняются красным фоном (с оттенками)
 */
import * as React from 'react';
import {AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Dot} from 'recharts';
import './styles.css';

const zCutoff = 1; // условие отсечки z-оценки; что больше по модулю - то красным
let sets = 'd1,d2,d3,d4,-d5'.split(','); // сколько кривых выводить (менять состав, чтобы отключить)

// функции zScore
function deviation(values: any, valueof?: any) {
  const v = variance(values, valueof);
  return v ? Math.sqrt(v) : v;
}

function variance(values: any, valueof?: ((arg0: any, arg1: number, arg2: any) => any) | undefined) {
  let x = 0,
    mean = 0,
    sum = 0,
    delta;
  if (valueof === undefined) {
    for (let v of values)
      if (v != null && +v >= v) {
        delta = +v - mean;
        mean += delta / ++x;
        sum += delta * (+v - mean);
      }
  } else {
    let i = -1;
    for (let v of values)
      if ((v = valueof(v, ++i, values)) != null && +v >= v) {
        delta = +v - mean;
        mean += delta / ++x;
        sum += delta * (+v - mean);
      }
  } // here the n-1 : http://duramecho.com/Misc/WhyMinusOneInSd.html
  if (x > 1) return sum / (x - 1);
}

function mean(values: any, valueof?: ((arg0: any, arg1: number, arg2: any) => any) | undefined) {
  let x = 0,
    sum = 0;
  if (valueof === undefined) {
    for (let v of values)
      if (v != null && +v >= v) {
        ++x, (sum += v);
      }
  } else {
    let i = -1;
    for (let v of values)
      if ((v = valueof(v, ++i, values)) != null && +v >= v) {
        ++x, (sum += v);
      }
  }
  if (x) return sum / x;
}

const zScore = (inputs: any, accessor?: ((arg0: any, arg1: number, arg2: any) => any) | undefined) =>
  inputs.map((i: number) => (i - (mean(inputs, accessor) ?? 0)) / (deviation(inputs, accessor) ?? 1));
// конец функций zScore
let S:any = [ // параметры множеств данных
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
  {
    set: 'd5',
    opacGreen: 0,
  },
].map((el) => ({
  ...{ // параметры множества по умолчанию
    opacRed: 0.8,
    opacGreen: 0.1,
    colrRed: 'red',
    colrGreen: 'green',
    colrStroke: 'green',
    colrStrokeAlarm: 'red',
  },
  ...el,
}));
let data = [ // точки
    {
      name: 'Page A',
      d1: 4220,
      d2: 2370,
      d3: 6350,
      d4: -2820,
      d5: 9900,
    },
    {
      name: 'Page B',
      d1: 2000,
      d2: 1398,
      d3: 6210,
      d4: -2600,
      d5: 7800,
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
      d5: -2500,
    },
    {
      name: 'Page G',
      d1: 4100,
      d2: 4500,
      d3: 6100,
      d5: -3300,
    },
  ],
  dMaxGlob = -Infinity, // отступы сверху, снизу
  dMinGlob = Infinity;

const gradientOffset = (z: string) => {
  const zz = 'z' + z,
    dG = data
      .filter((i: any) => i[z] && Math.abs(i[zz]) <= zCutoff)
      .map((i: any) => i[z][1]),
    greenMax = Math.max(...dG),
    greenMin = Math.min(...dG),
    dZ = data.filter((i: any) => i[zz]).map((i: any) => i[z]?.[1]),
    dataMax = Math.max(...dZ),
    dataMin = Math.min(...dZ);
  //console.log('=='+z,dZ, dataMax,greenMax, data.filter((x) => x), dataMax !== dataMin ? (dataMax - zCutoff) / (dataMax - dataMin) : 0.5);
  return dataMax === dataMin ? [0.5, 0.5] : [
    ((dataMax - greenMax) * 0.8) / (dataMax - dataMin),
    ((greenMin - dataMin) * 0.8) / (dataMax - dataMin),];
};

for (let y of sets) { // дополнение данных, чтобы отображать далее градиенты и красные точки
  const dZ = data.filter((i: any) => i[y]).map((i: any) => i[y]),
    dataMax = Math.max(...dZ),
    dataMin = Math.min(...dZ); // пределы красных полос
  dMaxGlob = Math.max(dMaxGlob, dataMax);
  dMinGlob = Math.min(dMinGlob, dataMin);
  //console.log('=='+y, dataMin);
  data = data.map((x :any, i :number) => ({ // добавили z-оценки
    ...x,
    ['z' + y]: zScore(data.map((x: any) => x[y]))[i],
    [y]: [dataMin, data.map((x: any) => x[y])[i]],
  }));
  S.map((el: any, i: any) => { S[i].G = gradientOffset(el.set); });
}
// key={'d_' + x.dataKey +'_' + x.cx}
const redGreenDot = (x: { cx: number | undefined; cy: number | undefined; payload: { [x: string]: number; };
    dataKey: string; }) =>
  <Dot cx={x.cx} cy={x.cy} r={3} key={'d_' + x.dataKey +'_' + x.cx}
  stroke={Math.abs(x.payload['z' + x.dataKey]) > zCutoff ? 'red' : '#3d3'}
  strokeWidth={Math.abs(x.payload['z' + x.dataKey]) > zCutoff ? 6 : 2}
/>;

const App: React.FC = () => {
  const [chartData, setChartData] :any[] = React.useState(sets);
  const chgGroupsList = (ev: React.MouseEvent<HTMLInputElement, MouseEvent>, x: string) => {
    const A = structuredClone(chartData);
    //console.log('--3', A, x, sets);
    if (A.indexOf(x) >= 0) A.splice(A.indexOf(x), 1);
    else A.push(x);
    setChartData(A);
  };

  return <div>
  <div style={{ textAlign: 'center' }}>
    {S.map((s :any, i: any) => (
      <span className="chbGroups" key={'i_' + s.set + '_' + i}>
        <input type="checkbox" id={'i_' + s.set}
          checked={chartData.indexOf(s.set) >= 0}
          disabled={sets.indexOf(s.set) < 0}
          onClick={(ev) => chgGroupsList(ev, s.set)}
          onChange={(x) => x}
        />
        <label htmlFor={'i_' + s.set} style={{cursor: sets.indexOf(s.set) < 0 ? 'no-drop' : 'pointer',}}>
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
    <YAxis type="number"
  domain={[(x: number) => x - (dMaxGlob - x) * 0.01, (x: number) => x + (x - dMinGlob) * 0.01]}/>
    <Tooltip />
    <defs>
      {S.map((s:any, i:any) => (
        <linearGradient key={s.set + '_' + i} id={s.set} x1="0" y1="0" x2="0" y2="1">
          <stop offset={s.G[0]||0} stopColor={s.colrRed} stopOpacity={s.opacRed} />
          <stop offset={s.G[0]||0} stopColor={s.colrGreen} stopOpacity={s.opacGreen} />
          <stop offset={(1 - s.G[1])||0} stopColor={s.colrGreen} stopOpacity={s.opacGreen} />
          <stop offset={(1 - s.G[1])||0} stopColor={s.colrRed} stopOpacity={s.opacRed} />
        </linearGradient>
      ))}
    </defs>
    {S.map((s: any, i: any) =>
      chartData.indexOf(s.set) >= 0 &&
      (document.querySelector('.chbGroups i_'+'s.set') as any)?.['checked'] !==
        'checked' ? <React.Fragment key={'F_' + s.set + '_' + i}>
        <Area type="monotone"
          dot={redGreenDot as any}
          dataKey={s.set}
          fill={`url(#${s.set})`}
          stroke={s.colrStroke}
        />
      </React.Fragment> : null
    )}
  </AreaChart>
</div>};

export default App;
