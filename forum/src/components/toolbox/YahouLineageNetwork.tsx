import { RelationGraph, RGProvider, type RGNodeSlotProps, type RGOptions, type RelationGraphInstance } from '@relation-graph/react';
import '@relation-graph/react/style.css';
import '../../styles/yahou-overview.css';
import { BadgeCheck, Check, Circle, Download, Maximize, Minus, Pause, Play, Plus, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { YAHOU_STATUS_LABELS, type YahouLineage } from '../../data/yahouLineage';
import { useTheme } from '../../hooks/useTheme';
import { buildYahouGraph, createYahouSimulation, DEFAULT_YAHOU_FORCES, exportYahouGraphSvg, visibleYahouLabels, YAHOU_FORCE_CONTROLS, YAHOU_GRAPH_ROOT, type YahouGraph, type YahouSimulation } from '../../utils/yahouOverview';
import { YAHOU_OVERVIEW_PALETTES } from '../../utils/yahouOverviewTheme';

const GRAPH_OPTIONS: RGOptions = {
  debug: false, showToolBar: false, layout: { layoutName: 'fixed', fixedRootNode: true },
  defaultNodeShape: 0, defaultNodeBorderWidth: 0, defaultLineShape: 1, defaultLineWidth: 1,
  defaultExpandHolderPosition: 'hide', disableDragLine: true, disableLinePointEvent: true,
  minCanvasZoom: 2, maxCanvasZoom: 400, performanceMode: false, checkedItemBackgroundColor: 'transparent',
};

export function YahouLineageNetwork({ data }: { data: YahouLineage }) {
  const graph = useMemo(() => buildYahouGraph(data), [data]);
  return <RGProvider><OverviewNetwork graph={graph} /></RGProvider>;
}

function GraphNode({ node }: RGNodeSlotProps) {
  return <span className="yahou-graph-node" title={node.text}>
    <span className="yahou-graph-label" hidden={!node.data?.labelVisible}>{node.text}</span>
  </span>;
}

function OverviewNetwork({ graph }: { graph: YahouGraph }) {
  const { theme } = useTheme();
  const palette = YAHOU_OVERVIEW_PALETTES[theme];
  const [instance, setInstance] = useState<RelationGraphInstance | null>(null);
  const engine = useRef<YahouSimulation | null>(null);
  const graphRef = useRef<RelationGraphInstance | null>(null);
  const syncRef = useRef<() => void>(() => {});
  const [ready, setReady] = useState(false);
  const [running, setRunning] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [settings, setSettings] = useState({ ...DEFAULT_YAHOU_FORCES });
  const [rootPinned, setRootPinned] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const current = useRef({ running, settings, rootPinned, palette });
  current.current = { running, settings, rootPinned, palette };
  selectedRef.current = selected;
  const [error, setError] = useState('');
  const controlsId = useId();
  const searchId = useId();
  const selectedNode = graph.nodes.find((node) => node.id === selected);
  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return normalized ? graph.nodes.filter((node) => node.label.toLocaleLowerCase().includes(normalized))
      .sort((a, b) => Number(b.label.toLocaleLowerCase() === normalized) - Number(a.label.toLocaleLowerCase() === normalized)).slice(0, 30) : [];
  }, [graph, query]);

  useEffect(() => {
    if (!instance) return;
    let cancelled = false;
    setReady(false);
    const simulation = createYahouSimulation(graph, current.current.settings);
    // A bounded warm-up gives the first fitted view a useful spread without a long animation.
    simulation.simulation.tick(80);
    engine.current = simulation;
    graphRef.current = instance;
    let lastFrame = 0;
    let lastLabels = 0;
    let labels = new Set<string>();
    const sync = (force = false) => {
      if (cancelled) return;
      const now = performance.now();
      if (!force && now - lastFrame < 32) return;
      lastFrame = now;
      if (force || now - lastLabels > 200) {
        labels = visibleYahouLabels(simulation.nodes, instance.getOptions().canvasZoom, selectedRef.current);
        lastLabels = now;
      }
      for (const node of simulation.nodes) {
        const rendered = instance.getNodeById(node.id);
        if (!rendered) continue;
        instance.updateNode(node.id, { x: node.x - node.radius, y: node.y - node.radius,
          ...(rendered.data?.labelVisible !== labels.has(node.id) ? { data: { ...rendered.data, labelVisible: labels.has(node.id) } } : {}) });
      }
    };
    syncRef.current = () => sync(true);
    const initialize = async () => {
      try {
        await instance.setJsonData({ rootId: YAHOU_GRAPH_ROOT,
          nodes: simulation.nodes.map((node) => ({ id: node.id, text: node.label,
            x: node.x - node.radius, y: node.y - node.radius, width: node.radius * 2, height: node.radius * 2,
            className: 'yahou-network-dot', data: { labelVisible: false } })),
          lines: graph.links.map((link) => ({ id: link.id, from: link.source, to: link.target, showEndArrow: false, showStartArrow: false })),
        });
        if (cancelled) return;
        instance.moveToCenter(); instance.zoomToFit();
        setZoom(instance.getOptions().canvasZoom);
        simulation.pinRoot(current.current.rootPinned);
        simulation.simulation.on('tick', () => sync());
        sync(true);
        setReady(true);
        simulation.run(current.current.running && !document.hidden);
      } catch {
        if (!cancelled) setError('关系网加载失败，请关闭后重试。');
        simulation.dispose();
      }
    };
    void initialize();
    const onVisibility = () => {
      simulation.releaseAll();
      simulation.run(current.current.running && !document.hidden);
    };
    const onBlur = () => simulation.releaseAll();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    return () => {
      cancelled = true; simulation.dispose();
      engine.current = null; graphRef.current = null; syncRef.current = () => {};
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
    };
  }, [instance, graph]);

  useEffect(() => { if (ready) engine.current?.run(running && !document.hidden); }, [running, ready]);
  useEffect(() => { engine.current?.configure(settings); }, [settings]);
  useEffect(() => { engine.current?.pinRoot(rootPinned); }, [rootPinned]);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => { if (media.matches) setRunning(false); };
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);

  useEffect(() => {
    if (!instance || !ready) return;
    const neighbors = new Set<string>(selected ? [selected] : []);
    for (const link of graph.links) if (link.source === selected || link.target === selected) {
      neighbors.add(link.source); neighbors.add(link.target);
    }
    instance.updateOptions({ backgroundColor: palette.background, defaultLineColor: palette.link });
    for (const node of graph.nodes) instance.updateNode(node.id, {
      color: node.status === null ? palette.root.stroke : palette.nodes[node.status].stroke,
      fontColor: palette.text, opacity: selected && !neighbors.has(node.id) ? 0.2 : 1,
      zIndex: node.id === selected ? 20 : 1,
    });
    for (const link of graph.links) instance.updateLine(link.id, {
      color: palette.link, opacity: !selected ? 0.5 : link.source === selected || link.target === selected ? 0.95 : 0.08,
      lineWidth: selected && (link.source === selected || link.target === selected) ? 2 : 1,
    });
    instance.setCheckedNode(selected ?? '');
    syncRef.current();
  }, [instance, ready, graph, palette, selected]);

  function fit() {
    if (!instance || !ready) return;
    instance.moveToCenter(); instance.zoomToFit();
    setZoom(instance.getOptions().canvasZoom); syncRef.current();
  }
  function changeZoom(factor: number) {
    if (!instance || !ready) return;
    instance.setZoom(instance.getOptions().canvasZoom * factor);
    setZoom(instance.getOptions().canvasZoom); syncRef.current();
  }
  function locate(id: string) {
    setSelected(id); setQuery('');
    const node = engine.current?.byId.get(id);
    if (instance && node) { instance.setZoom(120); instance.setCanvasCenter(node.x, node.y); setZoom(120); }
  }
  function onKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target instanceof HTMLElement && event.target.closest('input, button')) return;
    if (event.key === 'Home') { event.preventDefault(); fit(); }
    else if (['+', '=', '-'].includes(event.key)) { event.preventDefault(); changeZoom(event.key === '-' ? 1 / 1.3 : 1.3); }
    else if (event.key === ' ') { event.preventDefault(); event.stopPropagation(); setRunning((value) => !value); }
  }
  function download() {
    if (!engine.current) return;
    try {
      const blob = new Blob([exportYahouGraphSvg(graph, engine.current.nodes, palette)], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = '押后谱系总览.svg';
      document.body.append(link); link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setError('');
    } catch { setError('总览下载失败，请重试。'); }
  }

  return <>
    <div className="yahou-overview-toolbar">
      <div aria-label="状态图例" className="yahou-legend">
        <span className="yahou-qualified"><BadgeCheck size={14} />师父</span>
        <span className="yahou-passed"><Check size={14} />押后</span>
        <span className="yahou-pending"><Circle size={14} />学徒</span>
      </div>
      <span className="yahou-overview-count">{graph.nodes.length - 1} 人 · {graph.generations} 代</span>
      <div className="yahou-overview-controls">
        <button className="toolbox-secondary-button" disabled={!ready} onClick={() => setRunning((value) => !value)} type="button">{running ? <Pause size={15} /> : <Play size={15} />}{running ? '暂停漂浮' : '继续漂浮'}</button>
        <button aria-label="缩小总览" className="toolbox-icon-button" disabled={!ready || zoom <= 2} onClick={() => changeZoom(1 / 1.3)} type="button"><Minus size={16} /></button>
        <output aria-label="缩放比例">{Math.round(zoom)}%</output>
        <button aria-label="放大总览" className="toolbox-icon-button" disabled={!ready || zoom >= 400} onClick={() => changeZoom(1.3)} type="button"><Plus size={16} /></button>
        <button className="toolbox-secondary-button" disabled={!ready} onClick={fit} type="button"><Maximize size={15} />适应窗口</button>
        <button className="toolbox-secondary-button" disabled={!ready} onClick={download} type="button"><Download size={15} />下载 SVG</button>
        <button aria-controls={controlsId} aria-expanded={settingsOpen} className="toolbox-secondary-button" onClick={() => setSettingsOpen((value) => !value)} type="button"><SlidersHorizontal size={15} />调节</button>
      </div>
    </div>
    {error ? <p className="yahou-overview-error" role="alert">{error}</p> : null}
    <div className="yahou-overview-body">
      <div aria-label="押后谱系关系网" className="yahou-overview-canvas" onKeyDownCapture={onKeyboard}
        style={{ background: palette.background, '--yahou-graph-label-size': `${13 / Math.max(0.02, zoom / 100)}px`, '--yahou-graph-label-width': `${156 / Math.max(0.02, zoom / 100)}px`, '--yahou-graph-background': palette.background } as CSSProperties}>
        <RelationGraph options={GRAPH_OPTIONS} nodeSlot={GraphNode} onReady={setInstance}
          onNodeClick={(node) => setSelected(node.id)} onCanvasClick={() => setSelected(null)}
          onZoomEnd={() => { const graphInstance = graphRef.current; if (graphInstance) setZoom(graphInstance.getOptions().canvasZoom); syncRef.current(); }}
          onNodeDragStart={(node) => { const point = engine.current?.byId.get(node.id); if (point) engine.current?.drag(node.id, node.x + point.radius, node.y + point.radius); }}
          onNodeDragging={(node, x, y) => { const point = engine.current?.byId.get(node.id); if (point) { engine.current?.drag(node.id, x + point.radius, y + point.radius); syncRef.current(); } }}
          onNodeDragEnd={(node) => { engine.current?.release(node.id); syncRef.current(); }} />
        {!ready && !error ? <p className="yahou-graph-loading" role="status">正在加载关系网</p> : null}
        {selectedNode ? <div className="yahou-graph-selection">
          <strong>{selectedNode.label}</strong>
          <span>{selectedNode.status === null ? '实践部' : `${YAHOU_STATUS_LABELS[selectedNode.status]} · 第 ${selectedNode.generation} 代`}</span>
          {selectedNode.status !== null ? <span>师父：{selectedNode.parentId ?? '实践部'}</span> : null}
          <button aria-label="取消选中" className="toolbox-icon-button" onClick={() => setSelected(null)} type="button"><X size={15} /></button>
        </div> : null}
      </div>
      {settingsOpen ? <aside aria-label="关系网调节" className="yahou-graph-settings" id={controlsId}>
        <form className="yahou-graph-search" onSubmit={(event) => { event.preventDefault(); if (results[0]) locate(results[0].id); }}>
          <label htmlFor={searchId}><Search size={15} />搜索 ID</label>
          <input autoComplete="off" disabled={!ready} id={searchId} onChange={(event) => setQuery(event.target.value)} type="search" value={query} />
          {query.trim() ? <div aria-label="搜索结果" className="yahou-graph-results">
            {results.length ? results.map((node) => <button key={node.id} onClick={() => locate(node.id)} type="button">{node.label}</button>) : <span role="status">未找到 ID</span>}
          </div> : null}
        </form>
        <div className="yahou-force-controls">
          {YAHOU_FORCE_CONTROLS.map((control) => <label className="yahou-force-control" key={control.key}>
            <span>{control.label}<output>{settings[control.key]}</output></span>
            <input disabled={!ready} max={control.max} min={control.min} onChange={(event) => setSettings((value) => ({ ...value, [control.key]: Number(event.target.value) }))} step={control.step} type="range" value={settings[control.key]} />
          </label>)}
          <label className="yahou-graph-pin"><input checked={rootPinned} disabled={!ready} onChange={(event) => setRootPinned(event.target.checked)} type="checkbox" />固定实践部</label>
          <button className="toolbox-secondary-button" disabled={!ready} onClick={() => setSettings({ ...DEFAULT_YAHOU_FORCES })} type="button"><RotateCcw size={14} />恢复默认力度</button>
        </div>
      </aside> : null}
    </div>
  </>;
}
