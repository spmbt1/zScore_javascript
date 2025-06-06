/** Компонент zScore (z-оценки) для демо в Recharts. Использовать:
 * 1) Копируем всё в страницу https://recharts.org/en-US/examples/AreaChartFillByValue справа
 * 2) Нажимаем Run сверху кода. Смотрим результат.
 * Результат - участки функции с |zScore| > 1 заполняются красным фоном
 */
import React, { PureComponent } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from 'recharts';

// начало кода JS решения
const zCutoff = 1; // условие отсечки z-оценки; что больше по модулю - то красным
const sets = 2; // сколько кривых выводить
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
    for (let v of values) if (v != null && (v = +v) >= v) {
      delta = v - mean;
      mean += delta / ++x;
      sum += delta * (v - mean);
    }
  } else {
    let i = -1;
    for (let v of values) if ((v = valueof(v, ++i, values)) != null && (v = +v) >= v) {
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
    for (let v of values)  if (v != null && (v = +v) >= v) {
      ++x, sum += v;
    }
  } else {
    let i = -1;
    for (let v of values) if ((v = valueof(v, ++i, values)) != null && (v = +v) >= v) {
      ++x, sum += v;
    }
  }
  if (x) return sum / x;
}

const zScore = (inputs, accessor) => inputs.map(
  i => ((i - mean(inputs, accessor)) / deviation(inputs, accessor)));
// конец кода JS решения (но и далее - небольшие правки кода JS)
let data = [
  {
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    av: 2400,
  },
  {
    name: 'Page B',
    uv: 2000,
    pv: 1398,
    av: 2210,
  },
  {
    name: 'Page C',
    uv: -1000,
    pv: 9800,
    av: 2290,
  },
  {
    name: 'Page D',
    uv: 500,
    pv: 3908,
    av: 2000,
  },
  {
    name: 'Page E',
    uv: -2000,
    pv: 5900,
    av: 2181,
  },
  {
    name: 'Page F',
    uv: -250,
    pv: 3800,
    av: 2500,
  },
  {
    name: 'Page G',
    uv: 4100,
    pv: 4500,
    av: 2100,
  },
];

data = data.map((x, i) => ({ // добавили z-оценки
  ...x,
  zuv: zScore(Object.values(data.map((x) => x.uv)))[i],
  zpv: zScore(Object.values(data.map((x) => x.pv)))[i],
  zpa: zScore(Object.values(data.map((x) => x.av)))[i],
}));

const gradientOffset = (z) => {
  const dataMax = Math.max(...data.map((i) => i[z])),
    dataMin = Math.min(...data.map((i) => i[z]));
  if (dataMax === dataMin) {
    return 0.5;
  }
  return (dataMax - zCutoff) / (dataMax - dataMin);
};

const offU = gradientOffset('zuv'),
  offP = gradientOffset('zpv');
  offA = gradientOffset('zpa');

const redGreenDot = x => {console.log(x); return <Dot cx={x.cx} cy={x.cy} r={3}
  stroke={Math.abs(x.payload['z'+x.dataKey]) > 1 ? 'red' : '#3d3'}
  strokeWidth={Math.abs(x.payload['z'+x.dataKey]) > 1 ? 6 : 2} />;};

export default class Example extends PureComponent {
  static demoUrl = 'https://codesandbox.io/p/sandbox/area-chart-filled-by-sign-td4jqk';
  // x1="-1" y1="0" x2="1" y2="0">
  render() {
    return <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        width={500}
        height={400}
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <defs>
          <linearGradient id="splitColorU" x1="0" y1="0" x2="0" y2="1">
            <stop offset={offU} stopColor="red" stopOpacity={0.8} />
            <stop offset={offU} stopColor="green" stopOpacity={0.1} />
            <stop offset={1 - offU} stopColor="green" stopOpacity={0.1} />
            <stop offset={1 - offU} stopColor="red" stopOpacity={0.8} />
          </linearGradient>
          <linearGradient id="splitColorP" x1="0" y1="0" x2="0" y2="1">
            <stop offset={offP} stopColor="#f37c" stopOpacity={0.8} />
            <stop offset={offP} stopColor="blue" stopOpacity={0.1} />
            <stop offset={1 - offP} stopColor="blue" stopOpacity={0.1} />
            <stop offset={1 - offP} stopColor="#f37c" stopOpacity={0.8} />
          </linearGradient>
          <linearGradient id="splitColorA" x1="0" y1="0" x2="0" y2="1">
            <stop offset={offA} stopColor="#f37c" stopOpacity={0.8} />
            <stop offset={offA} stopColor="blue" stopOpacity={0.1} />
            <stop offset={1 - offA} stopColor="blue" stopOpacity={0.1} />
            <stop offset={1 - offA} stopColor="#f37c" stopOpacity={0.8} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="uv"
          stroke="#000"
          fill="url(#splitColorU)"
          dot={redGreenDot}
          stroke="red"
          strokeWidth="2"
        />
        {sets > 1 ? <Area
          type="monotone"
          dataKey="pv"
          stroke="#000"
          fill="url(#splitColorP)"
          dot={redGreenDot}
          stroke="blue"
          strokeWidth="2"
        /> : null}
        {sets === 3 ? <Area
          type="monotone"
          dataKey="av"
          stroke="#000"
          fill="url(#splitColorA)"
          dot={redGreenDot}
          stroke="green"
          strokeWidth="2"
        /> : null}
      </AreaChart>
      </ResponsiveContainer>;
  }
}


/*

# zScore_javascript
Компонент zScore (z-оценки) для демо в Recharts

### Процесс запуска, наблюдения результата и модификации

1. Имеем 1 файл - страницу компонента React (без хуков) для вставки в страницу демонстрации графика: `https://recharts.org/en-US/examples/SimpleLineChart`.
2. Открываем страницу демонстрации по ссылке. Справа видим редактируемое поле и кнопку Run над ним.
3. Заменяем весь код в редактируемом поле на страницу `zScoreRecharts.jsx` .
4. Нажимаем **Run**. Смотрим результат и поясняющие комментарии в коде.

## Что здесь наблюдают

На странице компонента `zScoreRecharts.jsx` представлено решение задачи:
1) раскрасить все участки графиков, на которых модуль z-score > 1, в красный цвет.
2) Цвет точек графика должен совпадать с цветом участка. (Не сказано, какой цвет, если участок не красный, но пусть зелёный.)

При этом в коде страницы через веб-страницу можно произвольно прописывать разные наборы данных, переставлять их и смотреть подсвеченные точки данных, попадающие в множество |z-score| > 1.

Технически, надо понимать, что ось Х имеет смысл равномерной упорядоченной шкалы с произвольным набором данных, а смысл функции z-оценки, вывод которой наблюдаем в раскраске точек - увидеть все точки в множестве с отклонением более 1 от среднего значения (среднее - где-то посередине на ВЕРТИКАЛЬНОЙ ОСИ и ничем не отмечено. По идее, чтобы отметить, можно прочертить линию градиента с z-score = 0.5. В коде условие отсечки указано в переменной **zCutoff = 1**, а на графике отображено красными областями сверху и снизу множества точек по ВЕРТИКАЛЬНОЙ оси.

Прошу не путаться в осях (кто впервые увидел график), потому что обычно точки для наблюдения разброса располагают горизонтально, а закон случайного распределения рисуют обычно "колоколом", и "сигмы" просто связаны с z-score. Здесь же постановка иная, колокол в расчётах не участвует, а формируется из алгоритмов среднего и среднеквадратичного отклонения. И, по задаче, зет-оценка отображается по вертикали.

### Процесс решения

Модуль - значит, и меньше -1 тоже раскрашиваются вниз.
Поэтому реализуем раскраску через 3 градиента "красный-зеленоватый-красный". И те точки, что на красном фоне - красные, остальные зелёные.


### Решение представлено в данном репозитории

Требовалось предоставить:

1. Ссылка на визуальный результат (развёрнутый проект): https://recharts.org/en-US/examples/SimpleLineChart, но сделать указанные выше в разделе "Процесс запуска" 3 несложных пункта, чтобы увидеть результат.
2. Ссылка на репозиторий GitHub с исходным кодом: https://github.com/spmbt1/zScore_javascript (данный репозиторий).

Можно было создать здесь ссылку по типу "нажал - и всё работает". Но так задача не стояла. А если б была так поставлена, то надо:

1. Создать React-проект, уже с хуками, и тут можно брать за основу ссылку из речартс-страницы: https://codesandbox.io/p/sandbox/area-chart-filled-by-sign-td4jqk (в коде страницы есть). Сейчас там версия 18.3.
2. Функции расчётов красиво утащить в другой компонент.
3. Адаптировать код основы к задаче.
4. Скомпилировать, положить в проект результат.
5. Смотреть на *.github.io .

Но обойдёмся без излишеств и многих файлов - решение есть.

*/
