/** Компонент zScore (z-оценки) для демо в Recharts. Использовать:
 * 1) Копируем всё в страницу https://recharts.org/en-US/examples/AreaChartFillByValue справа
 * 2) Нажимаем Run сверху кода. Смотрим результат. (Версия 2025-06-07)
 * Результат - участки функции с |zScore| > 1 заполняются красным фоном
 */
// Новее на хуках от Recharts: https://codesandbox.io/p/sandbox/area-chart-filled-by-sign-td4jqk
import React, { PureComponent } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from 'recharts';

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
// конец функций zScore
let S = [ // параметры множеств данных
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
].map(el => ({...{ // параметры множества по умолчанию
  opacRed: 0.8,
  opacGreen: 0.1,
  colrRed: 'red',
  colrGreen: 'green',
  colrStroke: 'green',
  colrStrokeAlarm: 'red',
}, ...el}));
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
    dG = data.filter(i => i[z] && Math.abs(i[zz]) <= zCutoff).map(i => i[z][1]),
    greenMax = Math.max(...dG),
    greenMin = Math.min(...dG),
    dZ = data.filter(i => i[zz]).map(i => i[z][1]),
    dataMax = Math.max(...dZ),
    dataMin = Math.min(...dZ);
  //console.log('=='+z,dZ, dataMax,greenMax, data.filter((x) => x), dataMax !== dataMin ? (dataMax - zCutoff) / (dataMax - dataMin) : 0.5);
  return dataMax === dataMin ? [0.5, 0.5]
    : [(dataMax - greenMax) * 0.8 / (dataMax - dataMin), (greenMin - dataMin) * 0.8 / (dataMax - dataMin)];
};

for(y of sets) {
  const dZ = data.filter(i => i[y]).map(i => i[y]),
    dataMax = Math.max(...dZ),
    dataMin = Math.min(...dZ); // пределы красных полос
  dMaxGlob = Math.max(dMaxGlob, dataMax);
  dMinGlob = Math.min(dMinGlob, dataMin);
  //console.log('=='+y, dataMin);
  data = data.map((x, i) => ({ // добавили z-оценки
    ...x,
    ['z' + y]: zScore(data.map(x => x[y]))[i],
    [y]: [dataMin, data.map(x => x[y])[i]],
  }));
  S.map((el, i) => {S[i].G = gradientOffset(el.set)});
}

const redGreenDot = x => <Dot cx={x.cx} cy={x.cy} r={3}
  stroke={Math.abs(x.payload['z' + x.dataKey]) > zCutoff ? 'red' : '#3d3'}
  strokeWidth={Math.abs(x.payload['z'+x.dataKey]) > zCutoff ? 6 : 2} />;

export default class Example extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { sets };
  }
  chgGroupsList = (ev, x) => {
    const A = structuredClone(this.state.sets);
    //console.log('--3', A, x, this.props);
    if (A.indexOf(x) >= 0) A.splice(A.indexOf(x), 1);
    else A.push(x);
    this.setState({ sets: A });
  };
  render() {
    return <ResponsiveContainer width="100%" height="100%">
      <div style={{textAlign: 'center'}}>
        {S.map(s => <span className="chbGroups">
          <input type="checkbox" key={'i_'+s.set} id={'i_'+s.set}
            checked={this.state.sets.indexOf(s.set) >= 0 ? 'checked' : ''}
            disabled={sets.indexOf(s.set) < 0 ? 'disabled' : ''}
            onClick={ev => this.chgGroupsList(ev, s.set)} />
          <label key={'L_'+s.set} for={'i_'+s.set}
            style={{cursor: sets.indexOf(s.set) < 0 ? 'no-drop' : 'pointer'}}>
            &nbsp;группа <b>{s.set}</b>; </label>
          </span>)}
        <i>(показать группы данных)</i>
      </div>
      <AreaChart width={500} height={400} data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis type="number" domain={[x => x - (dMaxGlob - x) * 0.01,
          x => x + (x - dMinGlob) * 0.01]} />
        <Tooltip />
        <defs>
          {S.map(s => <linearGradient key={s.set} id={s.set} x1="0" y1="0" x2="0" y2="1">
            <stop offset={s.G[0]} stopColor={s.colrRed} stopOpacity={s.opacRed} />
            <stop offset={s.G[0]} stopColor={s.colrGreen} stopOpacity={s.opacGreen} />
            <stop offset={1 - s.G[1]} stopColor={s.colrGreen} stopOpacity={s.opacGreen} />
            <stop offset={1 - s.G[1]} stopColor={s.colrRed} stopOpacity={s.opacRed} />
          </linearGradient>)}
        </defs>
        {S.map(s => this.state.sets.indexOf(s.set) >= 0
        && document.querySelector(`.chbGroups i_${s.set}`)?.checked !== 'checked'
          ? <Area key={'a_'+s.set}
            type="monotone"
            dataKey={s.set}
            fill={`url(#${s.set})`}
            dot={redGreenDot}
            stroke={s.colrStroke}
        /> : null)}
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
3. Заменяем весь код в редактируемом поле на страницу `zScoreRecharts.jsx` или `zScoreRecharts-v2.jsx`.
4. Нажимаем **Run**. Смотрим результат и поясняющие комментарии в коде.
5. Чтобы смотреть не все кривые, изменить состав `sets` в 8-й строчке (достаточно исказить имя, например, -d3).

## Что здесь наблюдают

На странице компонента `zScoreRecharts.jsx` представлено решение задачи:
1) раскрасить все участки графиков, на которых модуль z-score > 1, в красный цвет.
2) Цвет точек графика должен совпадать с цветом участка. (Не сказано, какой цвет, если участок не красный, но пусть зелёный.)

При этом в коде страницы через веб-страницу можно произвольно прописывать разные наборы данных, переставлять их и смотреть подсвеченные точки данных, попадающие в множество |z-score| > 1.

Технически, надо понимать, что ось Х имеет смысл равномерной упорядоченной шкалы с произвольным набором данных, а смысл функции z-оценки, вывод которой наблюдаем в раскраске точек - увидеть все точки в множестве с отклонением более 1 от среднего значения (среднее - где-то посередине на ВЕРТИКАЛЬНОЙ ОСИ и ничем не отмечено. По идее, чтобы отметить, можно прочертить линию градиента с z-score = 0.5. В коде условие отсечки указано в переменной **zCutoff = 1**, а на графике отображено красными областями сверху и снизу множества точек по ВЕРТИКАЛЬНОЙ оси.

Прошу не путаться в осях (кто впервые увидел график), потому что обычно точки для наблюдения разброса располагают горизонтально, а закон случайного распределения рисуют обычно "колоколом", и "сигмы" просто связаны с z-score. Здесь же постановка иная, колокол в расчётах не участвует, а формируется из алгоритмов среднего и среднеквадратичного отклонения. И, по задаче, зет-оценка отображается по вертикали.

### Процесс решения

Модуль - значит, и меньше -1 тоже раскрашиваются вниз.
Поэтому реализуем раскраску через 3 градиента "красный-зеленоватый-красный". Точки на красном фоне - красные, остальные зелёные.


### Решение представлено в данном репозитории

Требовалось предоставить:

1. Ссылка на визуальный результат (развёрнутый проект): https://recharts.org/en-US/examples/SimpleLineChart, но сделать указанные выше в разделе "Процесс запуска" 3 несложных пункта, чтобы увидеть результат.
2. Ссылка на репозиторий GitHub с исходным кодом: https://github.com/spmbt1/zScore_javascript (данный репозиторий).

![данные с ключами `uv`](zScore1-20250606.png)

Можно было создать здесь ссылку по типу "нажал - и всё работает". Но так задача не стояла. А если б была так поставлена, то надо:

1. Создать React-проект, уже с хуками, и тут можно брать за основу ссылку из речартс-страницы: https://codesandbox.io/p/sandbox/area-chart-filled-by-sign-td4jqk (в коде страницы есть). Сейчас там версия 18.3.
2. Функции расчётов красиво утащить в другой компонент.
3. Адаптировать код основы к задаче.
4. Скомпилировать, положить в проект результат.
5. Смотреть на *.github.io .

Но обойдёмся без излишеств и многих файлов - решение есть.

==============================

## Постановка версии 2 (2025-06-07)

Наблюдения показали, что первое решение из `zScoreRecharts.jsx` хорошо работает НЕ ДЛЯ ВСЕХ множеств точек, а лишь для тех, у которых имеются точки с разными знаками значений (положительные и отрицательные значения). Это - из-за особенности реализации градиентов в Recharts: градиенты идут от значений в сторону нуля, а в сторону бесконечностей ничем не заполняются. Поэтому решение прекрасно бы подошло для самой функции zScore(), потому что она всегда имеет разный знак (колокол же).

И плохо решение работает для 1) наборов с одним знаком и для 2) наборов с пустыми значениями - там огибающая формируется только по интерполяции. Для изолированных точек огибающей вообще нет; для 2 изолированных точек интерполяция линейная.

Поэтому в версии 2:

1. Добавлена поддержка пустых значений. (Вопросы экстраполяции не решаем.)
2. Градиенты переделали так, чтобы они ориентировались не на zScore(), а на множества значений, удовлетворяющих 2 условиям, и охватывали их не до нуля, а до некоторого визуально удобного предела (5-10% от красной полосы). Остальное в сторону нуля покрывается прозрачным фейк-градиентом (если нет значений другого знака).

Все эти проблемы, напомним, из-за неподходящего инструмента для универсального решения задачи. Но другого нет в Recharts, а создание с нуля или обогащение либы - вряд ли хорошая идея (заказчик не платит и задачу не ставит).

### Способы решения

Вместо (dataMin, dataMax) вычисляем 3 участка (zPlus, zPluMid, zMidMin, zMinus) по множествам данных zXX (значения zScore() для точек). Отступы от крайних точек берём так, чтобы 1) был 5-10% отступ для градиента в сторону нуля, 2) было расстояние между группами точек примерно посередине. (Середина годится, но м.б. не всегда.)

А есть ещё Range для заполнения данных - вот для чего в значениях бывают массивы пар, и они как раз все от 0 по умолчанию. Если туда засовываем dataMin - 5% (если все - одного знака "+"), то вопрос решается.

С таким подходом, используя интервал из 2 значений, графики (по вертикали) получаются всегда несимметричными, но выглядят понятно и сбалансированно по количеству "красного". Выбираем такой подход для 2-й версии.

![сразу 4 набора, 4 графика](zScore4-20250608.png)

Показан тестовый массив для всех выявленных сложных случаев - пропуски и разное расположение относительно нуля.

Затем, можем устроить интерактивное включение и выключение 4 графиков по отдельности, для удобства смены масштаба.

## Намётки версии 3 (2025-06-07)

* Если пары `value` центрировать по среднему, а не по `dataMin`, то группы данных будут выглядеть симметрично. Правда, таких обширных полос фона не будет и они окажутся незаметны. Это несложно сделать и посмотреть, как будет.
* Сейчас код привязан к реализации удалённой страницы. Чуть что там изменится - перестанет работать. Так что для долговременности, всё же, придётся занести /src` с проектом.
* Да и `useState` сейчас не работает (и не должен) в `PureComponent`, и просто state тоже "отдыхает" - нужно компилировать проект, чтобы начали работать, например, чекбоксы вверху, которые пока просто индикаторы включённых наборов данных.

======================

*/
