import { ChartColumnStacked, Check, ChevronRight, RefreshCw } from 'lucide-react';
import { memo, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type Dispatch, type KeyboardEvent, type PointerEvent, type SetStateAction } from 'react';
import { fetchWebsiteTraffic } from '../../api/websiteTraffic';
import { TRAFFIC_PERIODS, buildTrafficBars, groupTrafficSeries, isTrafficDateInPeriod, trafficAxis, trafficDateTicks, type TrafficBars, type TrafficPeriod, type TrafficSeries, type WebsiteTraffic } from '../../utils/websiteTraffic';
import { readTrafficSeriesSelection, saveTrafficSeriesSelection } from '../../utils/websiteTrafficPreferences';
import { LoadingState } from '../layout/LoadingState';
import { StatisticsDataNotice } from './StatisticsDataNotice';

const numberFormat = new Intl.NumberFormat('zh-CN');

export function WebsiteTrafficPanel() {
  const [period, setPeriod] = useState<TrafficPeriod>('week');
  const [visibleIds, setVisibleIds] = useState(readTrafficSeriesSelection);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{ period: TrafficPeriod; data: WebsiteTraffic | null; error: string }>({ period, data: null, error: '' });
  const data = state.period === period ? state.data : null;
  const error = state.period === period ? state.error : '';

  useEffect(() => { saveTrafficSeriesSelection(visibleIds); }, [visibleIds]);

  useEffect(() => {
    const controller = new AbortController();
    setState({ period, data: null, error: '' });
    void fetchWebsiteTraffic(period, controller.signal).then((data) => {
      if (!controller.signal.aborted) setState({ period, data, error: '' });
    }, (error: unknown) => {
      if (!controller.signal.aborted) {
        setState({ period, data: null, error: error instanceof Error ? error.message : '网站流量读取失败，请稍后重试。' });
      }
    });
    return () => controller.abort();
  }, [period, revision]);

  function selectDate(date: string) {
    if (!data || !isTrafficDateInPeriod(date, data.endDate, period)) return;
    setSelectedDate(date);
  }

  return (
    <section className="data-display-card website-traffic-panel">
      <header className="data-display-card-header website-traffic-header">
        <span className="data-display-card-icon"><ChartColumnStacked aria-hidden="true" size={17} /></span>
        <div className="statistics-title"><h1>网站流量</h1><StatisticsDataNotice dailyUpdate /></div>
        <div aria-label="统计时段" className="website-traffic-periods" role="group">
          {TRAFFIC_PERIODS.map((item) => (
            <button aria-pressed={period === item.id} key={item.id} onClick={() => setPeriod(item.id)} type="button">{item.label}</button>
          ))}
        </div>
        <button aria-label="刷新网站流量" className="website-traffic-refresh" disabled={!data && !error} onClick={() => setRevision((value) => value + 1)} title="刷新" type="button">
          <RefreshCw aria-hidden="true" size={16} />
        </button>
      </header>
      {error ? (
        <div className="website-traffic-state" role="alert">
          <p>{error}</p>
          <button onClick={() => setRevision((value) => value + 1)} type="button"><RefreshCw aria-hidden="true" size={15} />重试</button>
        </div>
      ) : data ? (
        <TrafficChart data={data} onSelectDate={selectDate} selectedDate={selectedDate} setVisibleIds={setVisibleIds} visibleIds={visibleIds} />
      ) : <LoadingState className="website-traffic-state" label="正在读取网站流量" variant="panel" />}
    </section>
  );
}

function TrafficChart({ data, onSelectDate, selectedDate, setVisibleIds, visibleIds }: {
  data: WebsiteTraffic;
  onSelectDate: (date: string) => void;
  selectedDate: string | null;
  setVisibleIds: Dispatch<SetStateAction<string[]>>;
  visibleIds: string[];
}) {
  const dateIndex = selectedDate ? data.dates.indexOf(selectedDate) : -1;
  const selectedIndex = dateIndex < 0 ? data.dates.length - 1 : dateIndex;
  const [width, setWidth] = useState(800);
  const plotRef = useRef<HTMLDivElement>(null);
  const readoutId = useId();
  const visible = useMemo(() => data.series.filter((series) => visibleIds.includes(series.id)), [data.series, visibleIds]);
  const groups = useMemo(() => groupTrafficSeries(data.series), [data.series]);
  const bars = useMemo(() => buildTrafficBars(visible), [visible]);
  const axis = useMemo(() => trafficAxis(visible), [visible]);
  const secondarySelected = groups.secondary.filter((series) => visibleIds.includes(series.id)).length;
  const height = 280;
  const left = 52;
  const right = 14;
  const top = 30;
  const bottom = height - 32;
  const plotWidth = width - left - right;
  const slotWidth = plotWidth / data.dates.length;
  const x = (index: number) => left + (index + 0.5) * slotWidth;
  const y = (value: number) => bottom - value / axis.maximum * (bottom - top);

  useLayoutEffect(() => {
    const plot = plotRef.current;
    if (!plot) return;
    const resize = () => setWidth(Math.max(280, Math.round(plot.clientWidth)));
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(plot);
    return () => observer.disconnect();
  }, []);

  function selectFromPointer(event: PointerEvent<SVGSVGElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width) return;
    const plotX = (event.clientX - bounds.left) / bounds.width * width;
    const index = Math.floor((plotX - left) / plotWidth * data.dates.length);
    onSelectDate(data.dates[Math.max(0, Math.min(data.dates.length - 1, index))]);
  }

  function moveDate(event: KeyboardEvent<HTMLDivElement>) {
    const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, PageUp: -7, PageDown: 7 };
    let index = selectedIndex;
    if (event.key in offsets) index += offsets[event.key];
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = data.dates.length - 1;
    else return;
    event.preventDefault();
    onSelectDate(data.dates[Math.max(0, Math.min(data.dates.length - 1, index))]);
  }

  function toggleSeries(id: string) {
    setVisibleIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }

  function seriesButton(series: TrafficSeries) {
    return (
      <button
        aria-label={`${series.label}，${data.dates[selectedIndex]} 浏览 ${series.values[selectedIndex]} 次`}
        aria-pressed={visibleIds.includes(series.id)}
        key={series.id}
        onClick={() => toggleSeries(series.id)}
        style={{ '--series-color': seriesColor(series) } as CSSProperties}
        type="button"
      >
        <span aria-hidden="true" className="website-traffic-series-marker"><Check size={10} /></span>
        <span className="website-traffic-series-name">{series.label}</span>
        <strong>{numberFormat.format(series.values[selectedIndex])}</strong>
      </button>
    );
  }

  return (
    <div className="website-traffic-content">
      <div
        aria-describedby={readoutId}
        aria-label="每日浏览量堆叠柱形图，左右方向键选择日期"
        className="website-traffic-plot"
        onKeyDown={moveDate}
        ref={plotRef}
        role="group"
        tabIndex={0}
      >
        <svg aria-hidden="true" onPointerDown={selectFromPointer} onPointerMove={selectFromPointer} viewBox={`0 0 ${width} ${height}`}>
          <text className="website-traffic-axis-label" x={left} y={14}>浏览次数</text>
          {axis.ticks.map((tick) => (
            <g key={tick}>
              <line className="website-traffic-grid-line" x1={left} x2={width - right} y1={y(tick)} y2={y(tick)} />
              <text className="website-traffic-axis-label" dominantBaseline="middle" textAnchor="end" x={left - 9} y={y(tick)}>{formatAxisCount(tick)}</text>
            </g>
          ))}
          {trafficDateTicks(data.dates.length, plotWidth).map((index) => (
            <text className="website-traffic-axis-label" key={index} textAnchor={index === 0 ? 'start' : index === data.dates.length - 1 ? 'end' : 'middle'} x={x(index)} y={height - 9}>
              {data.period === 'year' ? data.dates[index].slice(0, 7).replace('-', '/') : data.dates[index].slice(5).replace('-', '/')}
            </text>
          ))}
          {visible.length > 0 && <rect className="website-traffic-selection-band" height={bottom - top} width={slotWidth} x={left + selectedIndex * slotWidth} y={top} />}
          <TrafficBarMarks bars={bars} bottom={bottom} key={visible.map((series) => series.id).join(',')} left={left} maximum={axis.maximum} slotWidth={slotWidth} top={top} />
        </svg>
        {visible.length === 0 && <span className="website-traffic-no-series">选择要显示的统计范围</span>}
      </div>
      <div className="website-traffic-readout-heading">
        <TrafficDatePicker date={data.dates[selectedIndex]} max={data.endDate} min={data.startDate} onSelectDate={onSelectDate} />
        <output aria-live="polite" className="sr-only" id={readoutId}>
          {data.dates[selectedIndex]}{visible.map((series) => `，${series.label} ${series.values[selectedIndex]} 次`).join('')}
        </output>
        <div aria-label="统计范围" className="website-traffic-selection" role="group">
          <button onClick={() => setVisibleIds(['total'])} type="button">仅全站</button>
          <button onClick={() => setVisibleIds(groups.primary.filter((series) => series.bid !== null).map((series) => series.id))} type="button">主要版块</button>
        </div>
      </div>
      <div aria-label="全站与主要版块当日浏览量" className="website-traffic-series">
        {groups.primary.map(seriesButton)}
      </div>
      {groups.secondary.length > 0 && (
        <details className="website-traffic-secondary">
          <summary>
            <span>其他版块{secondarySelected > 0 && <small>{secondarySelected} 已选</small>}</span>
            <ChevronRight aria-hidden="true" size={15} />
          </summary>
          <div aria-label="其他版块当日浏览量" className="website-traffic-series">
            {groups.secondary.map(seriesButton)}
          </div>
        </details>
      )}
    </div>
  );
}

function TrafficDatePicker({ date, min, max, onSelectDate }: {
  date: string;
  min: string;
  max: string;
  onSelectDate: (date: string) => void;
}) {
  const [draft, setDraft] = useState(date);
  useEffect(() => { setDraft(date); }, [date]);
  return (
    <label className="website-traffic-date-picker">
      <span>日期</span>
      <input
        aria-label="查看指定日期的浏览量"
        max={max}
        min={min}
        onBlur={() => setDraft(date)}
        onChange={(event) => {
          const value = event.currentTarget.value;
          setDraft(value);
          if (value && event.currentTarget.validity.valid) onSelectDate(value);
        }}
        type="date"
        value={draft}
      />
    </label>
  );
}

const TrafficBarMarks = memo(function TrafficBarMarks({ bars, left, slotWidth, top, bottom, maximum }: {
  bars: TrafficBars;
  left: number;
  slotWidth: number;
  top: number;
  bottom: number;
  maximum: number;
}) {
  const barWidth = Math.min(40, slotWidth * 0.78);
  const x = (index: number) => left + (index + 0.5) * slotWidth - barWidth / 2;
  const y = (value: number) => bottom - value / maximum * (bottom - top);
  const dayCount = bars.total?.values.length ?? bars.layers[0]?.series.values.length ?? 0;
  const lastIndex = Math.max(1, dayCount - 1);
  return (
    <g>
      {Array.from({ length: dayCount }, (_, index) => (
        <g
          className="website-traffic-bar-column"
          key={index}
          style={{
            '--traffic-bar-baseline': `${bottom}px`,
            '--traffic-bar-delay': `${Math.round(index / lastIndex * Math.min(lastIndex * 24, 180))}ms`,
            '--traffic-bar-mobile-delay': `${Math.round(index / lastIndex * Math.min(lastIndex * 15, 120))}ms`,
          } as CSSProperties}
        >
          {bars.total && bars.total.values[index] > 0 && (
            <rect
              fill={seriesColor(bars.total)}
              fillOpacity={bars.layers.length ? 0.24 : 0.8}
              height={bottom - y(bars.total.values[index])}
              width={barWidth}
              x={x(index)}
              y={y(bars.total.values[index])}
            />
          )}
          {bars.layers.map(({ series, starts, ends }) => series.values[index] > 0 && (
            <rect
              fill={seriesColor(series)}
              height={y(starts[index]) - y(ends[index])}
              key={series.id}
              width={barWidth}
              x={x(index)}
              y={y(ends[index])}
            />
          ))}
        </g>
      ))}
    </g>
  );
});

// Spread the nine primary boards across the hue wheel, then interleave the
// secondary boards. Equal OKLCH lightness/chroma keeps their visual weight close.
const boardHues: Readonly<Record<number, number>> = {
  1: 145, 2: 265, 3: 65, 4: 185, 5: 25, 6: 305, 7: 105, 9: 345, 28: 225,
  8: 45, 10: 85, 11: 125, 12: 165, 13: 205, 16: 245, 20: 285, 30: 325, 31: 5,
};

function seriesColor(series: TrafficSeries) {
  if (series.bid === null) return 'var(--brand-strong)';
  const hue = boardHues[series.bid] ?? (series.bid * 137.508) % 360;
  return `oklch(var(--website-traffic-color-lightness) var(--website-traffic-color-chroma) ${hue})`;
}

function formatAxisCount(value: number) {
  if (value >= 100000000) return `${(value / 100000000).toFixed(1).replace(/\.0$/, '')}亿`;
  if (value >= 10000) return `${(value / 10000).toFixed(1).replace(/\.0$/, '')}万`;
  return numberFormat.format(value);
}
