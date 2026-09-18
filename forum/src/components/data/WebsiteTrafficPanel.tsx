import { ChartNoAxesCombined, Check, RefreshCw } from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { fetchWebsiteTraffic } from '../../api/websiteTraffic';
import { TRAFFIC_PERIODS, trafficAxis, trafficDateTicks, type TrafficPeriod, type TrafficSeries, type WebsiteTraffic } from '../../utils/websiteTraffic';
import { LoadingState } from '../layout/LoadingState';

const numberFormat = new Intl.NumberFormat('zh-CN');

export function WebsiteTrafficPanel() {
  const [period, setPeriod] = useState<TrafficPeriod>('week');
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{ period: TrafficPeriod; data: WebsiteTraffic | null; error: string }>({ period, data: null, error: '' });
  const data = state.period === period ? state.data : null;
  const error = state.period === period ? state.error : '';

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

  return (
    <section className="data-display-card website-traffic-panel">
      <header className="data-display-card-header website-traffic-header">
        <span className="data-display-card-icon"><ChartNoAxesCombined aria-hidden="true" size={17} /></span>
        <h1>网站流量</h1>
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
      ) : data ? <TrafficChart data={data} /> : <LoadingState className="website-traffic-state" label="正在读取网站流量" variant="panel" />}
    </section>
  );
}

function TrafficChart({ data }: { data: WebsiteTraffic }) {
  const [visibleIds, setVisibleIds] = useState(['total']);
  const [selectedIndex, setSelectedIndex] = useState(data.dates.length - 1);
  const [width, setWidth] = useState(800);
  const plotRef = useRef<HTMLDivElement>(null);
  const readoutId = useId();
  const visible = useMemo(() => data.series.filter((series) => visibleIds.includes(series.id)), [data.series, visibleIds]);
  const axis = useMemo(() => trafficAxis(visible), [visible]);
  const height = 280;
  const left = 52;
  const right = 14;
  const top = 30;
  const bottom = height - 32;
  const plotWidth = width - left - right;
  const x = (index: number) => left + index / (data.dates.length - 1) * plotWidth;
  const y = (value: number) => bottom - value / axis.maximum * (bottom - top);
  const pathFor = (series: TrafficSeries) => series.values.map((value, index) => `${index ? 'L' : 'M'}${x(index).toFixed(2)},${y(value).toFixed(2)}`).join(' ');

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
    const index = Math.round((plotX - left) / plotWidth * (data.dates.length - 1));
    setSelectedIndex(Math.max(0, Math.min(data.dates.length - 1, index)));
  }

  function moveDate(event: KeyboardEvent<HTMLDivElement>) {
    const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, PageUp: -7, PageDown: 7 };
    let index = selectedIndex;
    if (event.key in offsets) index += offsets[event.key];
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = data.dates.length - 1;
    else return;
    event.preventDefault();
    setSelectedIndex(Math.max(0, Math.min(data.dates.length - 1, index)));
  }

  function toggleSeries(id: string) {
    setVisibleIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }

  return (
    <div className="website-traffic-content">
      <div
        aria-describedby={readoutId}
        aria-label="每日浏览量折线图，左右方向键选择日期"
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
          {visible.length === 1 && <path d={`${pathFor(visible[0])} L${x(data.dates.length - 1)},${bottom} L${left},${bottom} Z`} fill={seriesColor(visible[0])} fillOpacity="0.08" />}
          {visible.map((series) => (
            <path d={pathFor(series)} fill="none" key={series.id} stroke={seriesColor(series)} strokeLinecap="round" strokeLinejoin="round" strokeWidth={series.bid === null ? 2.5 : 1.8} vectorEffect="non-scaling-stroke" />
          ))}
          {visible.length > 0 && <line className="website-traffic-cursor" x1={x(selectedIndex)} x2={x(selectedIndex)} y1={top} y2={bottom} />}
          {visible.map((series) => <circle cx={x(selectedIndex)} cy={y(series.values[selectedIndex])} fill={seriesColor(series)} key={series.id} r={3.5} stroke="var(--surface)" strokeWidth={1.5} />)}
        </svg>
        {visible.length === 0 && <span className="website-traffic-no-series">选择要显示的曲线</span>}
      </div>
      <div className="website-traffic-readout-heading">
        <output aria-live="polite" id={readoutId}>
          <time dateTime={data.dates[selectedIndex]}>{data.dates[selectedIndex]}</time>
          <span className="sr-only">{visible.map((series) => `，${series.label} ${series.values[selectedIndex]} 次`).join('')}</span>
        </output>
        <div aria-label="曲线选择" className="website-traffic-selection" role="group">
          <button onClick={() => setVisibleIds(['total'])} type="button">仅全站</button>
          <button onClick={() => setVisibleIds(data.series.filter((series) => series.bid !== null).map((series) => series.id))} type="button">各版块</button>
        </div>
      </div>
      <div aria-label="当日浏览量与曲线显示" className="website-traffic-series">
        {data.series.map((series) => (
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
        ))}
      </div>
    </div>
  );
}

function seriesColor(series: TrafficSeries) {
  return series.bid === null ? 'var(--brand-strong)' : `hsl(${(series.bid * 137.508) % 360} 58% var(--website-traffic-color-lightness))`;
}

function formatAxisCount(value: number) {
  if (value >= 100000000) return `${(value / 100000000).toFixed(1).replace(/\.0$/, '')}亿`;
  if (value >= 10000) return `${(value / 10000).toFixed(1).replace(/\.0$/, '')}万`;
  return numberFormat.format(value);
}
