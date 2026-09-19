import { BadgeCheck, Check, Circle, Download, Maximize, Minus, Plus, X } from 'lucide-react';
import { memo, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { YAHOU_STATUS_LABELS, type YahouLineage } from '../../data/yahouLineage';
import { useTheme } from '../../hooks/useTheme';
import {
  layoutYahouOverview, zoomYahouViewBox,
  type YahouOverviewLayout, type YahouViewBox,
} from '../../utils/yahouOverview';
import { DialogNativeLayer } from '../layout/DialogPresence';
import { YAHOU_OVERVIEW_PALETTES, type YahouOverviewPalette } from '../../utils/yahouOverviewTheme';

export function YahouLineageOverview({ data, onClose }: { data: YahouLineage; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const result = useMemo(() => {
    try { return { layout: layoutYahouOverview(data), error: '' }; }
    catch { return { layout: null, error: '谱系总览生成失败，请关闭后重试。' }; }
  }, [data]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return createPortal(
    <DialogNativeLayer
      aria-labelledby={titleId}
      className="yahou-workspace yahou-overview-dialog"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      ref={dialogRef}
    >
      <header className="yahou-overview-header">
        <h2 id={titleId}>谱系总览</h2>
        <button aria-label="关闭谱系总览" autoFocus className="toolbox-icon-button" onClick={onClose} type="button"><X size={19} /></button>
      </header>
      {result.layout ? <OverviewCanvas key={data.revision} layout={result.layout} /> : <p className="yahou-load-state" role="alert">{result.error}</p>}
    </DialogNativeLayer>,
    document.body,
  );
}

function OverviewCanvas({ layout }: { layout: YahouOverviewLayout }) {
  const { theme } = useTheme();
  const palette = YAHOU_OVERVIEW_PALETTES[theme];
  const svgRef = useRef<SVGSVGElement>(null);
  const [view, setView] = useState(layout.bounds);
  const viewRef = useRef(view);
  const titleId = useId();
  const descriptionId = useId();
  const drag = useRef<{ pointerId: number; x: number; y: number; scale: number; view: YahouViewBox } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const zoom = layout.bounds.width / view.width;
  viewRef.current = view;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    function onWheel(event: WheelEvent) {
      event.preventDefault();
      const matrix = svg!.getScreenCTM();
      if (!matrix) return;
      const anchor = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 300 : 1);
      const factor = Math.exp(Math.max(-0.5, Math.min(0.5, delta * 0.002)));
      setView((current) => zoomYahouViewBox(current, layout.bounds, factor, anchor));
    }
    // Native listener is non-passive so zoom never scrolls the underlying page.
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [layout]);

  function startDrag(event: PointerEvent<SVGSVGElement>) {
    if (event.button !== 0 || drag.current) return;
    const scale = svgRef.current?.getScreenCTM()?.a;
    if (!scale || scale <= 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, scale, view: viewRef.current };
    setDragging(true);
  }

  function moveDrag(event: PointerEvent<SVGSVGElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    setView({
      ...current.view,
      x: current.view.x - (event.clientX - current.x) / current.scale,
      y: current.view.y - (event.clientY - current.y) / current.scale,
    });
  }

  function stopDrag(event: PointerEvent<SVGSVGElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    drag.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function handleKeyboard(event: KeyboardEvent<SVGSVGElement>) {
    const moves: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      setView((current) => ({ ...current, x: current.x + move[0] * current.width * 0.1, y: current.y + move[1] * current.height * 0.1 }));
    } else if (['+', '=', '-'].includes(event.key)) {
      event.preventDefault();
      setView((current) => zoomYahouViewBox(current, layout.bounds, event.key === '-' ? 1.4 : 1 / 1.4));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setView(layout.bounds);
    }
  }

  function downloadSvg() {
    const svg = svgRef.current;
    if (!svg) return;
    try {
      const snapshot = svg.cloneNode(true) as SVGSVGElement;
      snapshot.setAttribute('viewBox', viewBoxValue(layout.bounds));
      snapshot.setAttribute('width', String(Math.ceil(layout.bounds.width)));
      snapshot.setAttribute('height', String(Math.ceil(layout.bounds.height)));
      snapshot.removeAttribute('class');
      snapshot.removeAttribute('tabindex');
      const blob = new Blob([new XMLSerializer().serializeToString(snapshot)], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = '押后谱系总览.svg';
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setDownloadError('');
    } catch {
      setDownloadError('总览下载失败，请重试。');
    }
  }

  return (
    <>
      <div className="yahou-overview-toolbar">
        <div aria-label="状态图例" className="yahou-legend">
          <span className="yahou-qualified"><BadgeCheck size={14} />师父</span>
          <span className="yahou-passed"><Check size={14} />押后</span>
          <span className="yahou-pending"><Circle size={14} />学徒</span>
        </div>
        <span className="yahou-overview-count">{layout.nodes.length - 1} 人 · {layout.generations} 代</span>
        <div aria-label="总览缩放" className="yahou-overview-controls">
          <button aria-label="缩小总览" className="toolbox-icon-button" disabled={zoom <= 1} onClick={() => setView((current) => zoomYahouViewBox(current, layout.bounds, 1.4))} type="button"><Minus size={16} /></button>
          <output aria-label="缩放比例">{Math.round(zoom * 100)}%</output>
          <button aria-label="放大总览" className="toolbox-icon-button" disabled={zoom >= 64} onClick={() => setView((current) => zoomYahouViewBox(current, layout.bounds, 1 / 1.4))} type="button"><Plus size={16} /></button>
          <button className="toolbox-secondary-button" onClick={() => setView(layout.bounds)} type="button"><Maximize size={15} />适应窗口</button>
          <button className="toolbox-secondary-button" onClick={downloadSvg} type="button"><Download size={15} />下载 SVG</button>
        </div>
      </div>
      {downloadError ? <p className="yahou-overview-error" role="alert">{downloadError}</p> : null}
      <div className="yahou-overview-canvas" style={{ background: palette.background }}>
        <svg
          aria-describedby={descriptionId}
          aria-labelledby={titleId}
          className={dragging ? 'is-dragging' : undefined}
          onKeyDown={handleKeyboard}
          onLostPointerCapture={stopDrag}
          onPointerCancel={stopDrag}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={stopDrag}
          preserveAspectRatio="xMidYMid meet"
          ref={svgRef}
          role="img"
          tabIndex={0}
          viewBox={viewBoxValue(view)}
          xmlns="http://www.w3.org/2000/svg"
        >
          <title id={titleId}>押后谱系总览</title>
          <desc id={descriptionId}>从左向右展示师徒关系，根节点实践部，共 {layout.nodes.length - 1} 位会员，{layout.generations} 代。绿色为师父，蓝色为押后，金色为学徒。</desc>
          <OverviewDrawing layout={layout} palette={palette} />
        </svg>
      </div>
    </>
  );
}

const OverviewDrawing = memo(function OverviewDrawing({ layout, palette }: { layout: YahouOverviewLayout; palette: YahouOverviewPalette }) {
  return (
    <g fontFamily="'PingFang SC', 'Microsoft YaHei', sans-serif">
      <rect fill={palette.background} height={layout.bounds.height} width={layout.bounds.width} x={layout.bounds.x} y={layout.bounds.y} />
      <g fill="none" stroke={palette.link} strokeWidth={1}>
        {layout.links.map(({ child, path }) => <path d={path} key={child.id} vectorEffect="non-scaling-stroke" />)}
      </g>
      {layout.nodes.map((node) => {
        const colors = node.status === null ? palette.root : palette.nodes[node.status];
        return <rect fill={colors.fill} height={node.height} key={node.id === null ? 'root' : `member:${node.id}`} rx={3} stroke={colors.stroke} strokeWidth={0.8} vectorEffect="non-scaling-stroke" width={node.width} x={node.x - node.width / 2} y={node.y - node.height / 2}><title>{node.label}{node.status === null ? '' : ` · ${YAHOU_STATUS_LABELS[node.status]}`}</title></rect>;
      })}
      <g dominantBaseline="central" fill={palette.text} pointerEvents="none" textAnchor="middle">
        {layout.nodes.map((node) => (
          <text aria-label={node.label} fontSize={node.fontSize} fontWeight={node.status === 'qualified' || node.id === null ? 650 : 450} key={node.id === null ? 'root' : `member:${node.id}`}>
            {node.labelLines.map((line, index) => <tspan key={index} x={node.x} y={node.y + (index - (node.labelLines.length - 1) / 2) * node.lineHeight}>{line}</tspan>)}
          </text>
        ))}
      </g>
    </g>
  );
});

function viewBoxValue(view: YahouViewBox) {
  return `${view.x} ${view.y} ${view.width} ${view.height}`;
}
