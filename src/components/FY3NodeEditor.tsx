import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ScriptNode, NodeConnection, NodeGraph, GameObject, GameScene, ScriptNodeCategory } from '../types/engine';
import { NODE_TEMPLATES, getNodeTemplate, compileNodeGraphToJS } from '../engine/nodeCompiler';
import { Language, ThemeMode, translations } from '../utils/i18n';
import { 
  Plus, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Search, 
  Sliders, 
  X,
  Play,
  Layers
} from 'lucide-react';

interface FY3NodeEditorProps {
  graph?: NodeGraph;
  objects: GameObject[];
  scenes: GameScene[];
  targetObjectId?: string;
  onUpdateGraph: (newGraph: NodeGraph, compiledJS: string) => void;
  language: Language;
  theme: ThemeMode;
}

const CATEGORY_LABELS_AR: Record<ScriptNodeCategory, string> = {
  events: 'الأحداث (Events)',
  movement: 'الحركة (Movement)',
  camera: 'الكاميرا (Camera)',
  input: 'المدخلات (Input)',
  actions: 'الإجراءات (Actions)',
  vfx: 'المؤثرات (VFX)',
  gameplay: 'الفيزياء واللعب (Gameplay)',
  ui: 'الواجهة (UI)'
};

const KEYBOARD_KEYS = [
  { label: 'حرف W (للأعلى / حركة Y-)', value: 'KeyW' },
  { label: 'حرف S (للأسفل / حركة Y+)', value: 'KeyS' },
  { label: 'حرف A (لليسار / حركة X-)', value: 'KeyA' },
  { label: 'حرف D (لليمين / حركة X+)', value: 'KeyD' },
  { label: 'مسافة (Space / قفز)', value: 'Space' },
  { label: 'سهم يمين (ArrowRight)', value: 'ArrowRight' },
  { label: 'سهم يسار (ArrowLeft)', value: 'ArrowLeft' },
  { label: 'سهم أعلى (ArrowUp)', value: 'ArrowUp' },
  { label: 'سهم أسفل (ArrowDown)', value: 'ArrowDown' },
  { label: 'إدخال (Enter)', value: 'Enter' },
  { label: 'زر Z (إجراء)', value: 'KeyZ' },
  { label: 'زر X (ضرب / إطلاق)', value: 'KeyX' }
];

const SOUND_OPTIONS = [
  { label: 'قفز (Jump)', value: 'jump' },
  { label: 'ليزر (Laser)', value: 'laser' },
  { label: 'قطعة نقدية (Coin)', value: 'coin' },
  { label: 'ضربة / ضرر (Hit)', value: 'hit' },
  { label: 'انفجار (Explosion)', value: 'explosion' },
  { label: 'فوز (Win Fanfare)', value: 'win' },
  { label: 'خسارة (Game Over)', value: 'lose' },
  { label: 'نقرة (Click)', value: 'click' }
];

export const FY3NodeEditor: React.FC<FY3NodeEditorProps> = ({
  graph: initialGraph,
  objects,
  scenes,
  targetObjectId,
  onUpdateGraph,
  language,
  theme
}) => {
  const [graph, setGraph] = useState<NodeGraph>(() => {
    if (initialGraph && initialGraph.nodes) {
      return initialGraph;
    }
    return { nodes: [], connections: [] };
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [connectingFrom, setConnectingFrom] = useState<{ nodeId: string; socketId: string } | null>(null);
  const [wireMousePos, setWireMousePos] = useState<{ x: number; y: number } | null>(null);

  // Pan and Zoom
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 40 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging Node State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const t = translations[language];
  const lastTargetRef = useRef<string | undefined>(targetObjectId);

  // Sync graph only when switching target object or scene
  useEffect(() => {
    if (targetObjectId !== lastTargetRef.current) {
      lastTargetRef.current = targetObjectId;
      setGraph(initialGraph || { nodes: [], connections: [] });
    } else if (initialGraph && initialGraph.nodes && initialGraph.nodes.length > 0 && graph.nodes.length === 0) {
      setGraph(initialGraph);
    }
  }, [targetObjectId, initialGraph]);

  // Non-passive mouse wheel zoom listener centered on mouse cursor
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      setZoom(prevZoom => {
        const nextZoom = Math.min(3.0, Math.max(0.2, parseFloat((prevZoom * zoomFactor).toFixed(3))));
        setPan(prevPan => {
          const worldX = (mouseX - prevPan.x) / prevZoom;
          const worldY = (mouseY - prevPan.y) / prevZoom;
          return {
            x: mouseX - worldX * nextZoom,
            y: mouseY - worldY * nextZoom
          };
        });
        return nextZoom;
      });
    };

    el.addEventListener('wheel', onNativeWheel, { passive: false });
    return () => el.removeEventListener('wheel', onNativeWheel);
  }, []);

  // Global mouse up listener to ensure panning cleanly ends even outside canvas
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsPanning(false);
      setDraggingNodeId(null);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Push update and recompile
  const triggerUpdate = useCallback((newGraph: NodeGraph) => {
    setGraph(newGraph);
    const compiled = compileNodeGraphToJS(newGraph, objects, scenes, targetObjectId);
    onUpdateGraph(newGraph, compiled);
  }, [objects, scenes, targetObjectId, onUpdateGraph]);


  // Add node to canvas
  const handleAddNode = (templateType: string) => {
    const template = getNodeTemplate(templateType);
    if (!template) return;

    const defaultParams = { ...template.defaultParams };
    const defaultObjId = targetObjectId || (objects[0]?.id || '');
    if ('targetObjectId' in defaultParams) {
      defaultParams.targetObjectId = defaultObjId;
    }
    if ('objectAId' in defaultParams) {
      defaultParams.objectAId = defaultObjId;
    }
    if ('objectBId' in defaultParams && objects.length > 1) {
      defaultParams.objectBId = objects.find(o => o.id !== defaultObjId)?.id || objects[1].id;
    }
    if ('targetSceneId' in defaultParams && scenes.length > 0) {
      defaultParams.targetSceneId = scenes[0].id;
    }

    const newNode: ScriptNode = {
      id: 'node_' + Math.random().toString(36).substring(2, 9),
      type: template.type,
      title: template.title,
      category: template.category,
      x: Math.round((-pan.x + 180) / zoom + (Math.random() * 40 - 20)),
      y: Math.round((-pan.y + 120) / zoom + (Math.random() * 40 - 20)),
      inputs: JSON.parse(JSON.stringify(template.inputs)),
      outputs: JSON.parse(JSON.stringify(template.outputs)),
      params: defaultParams
    };

    const updatedGraph: NodeGraph = {
      ...graph,
      nodes: [...graph.nodes, newNode]
    };

    triggerUpdate(updatedGraph);
  };

  // Delete node
  const handleDeleteNode = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedNodes = graph.nodes.filter(n => n.id !== nodeId);
    const updatedConns = graph.connections.filter(c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId);
    triggerUpdate({ nodes: updatedNodes, connections: updatedConns });
  };

  // Delete connection wire
  const handleDeleteConnection = (connId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedConns = graph.connections.filter(c => c.id !== connId);
    triggerUpdate({ ...graph, connections: updatedConns });
  };

  // Update node param
  const handleUpdateNodeParam = (nodeId: string, paramKey: string, value: any) => {
    const updatedNodes = graph.nodes.map(n => {
      if (n.id === nodeId) {
        return {
          ...n,
          params: {
            ...n.params,
            [paramKey]: value
          }
        };
      }
      return n;
    });

    triggerUpdate({ ...graph, nodes: updatedNodes });
  };

  // Handle Dragging Nodes on Canvas
  const handleNodeMouseDown = (node: ScriptNode, e: React.MouseEvent) => {
    if (e.button !== 0) return; // only left click
    e.stopPropagation();
    setDraggingNodeId(node.id);
    setDragOffset({
      x: e.clientX / zoom - node.x,
      y: e.clientY / zoom - node.y
    });
  };

  // Canvas Pan Handlers - Supports Right-Click Drag and Background Left-Click Drag
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Right Click Pan (كلك يمين للتحرك في كافة الاتجاهات)
    if (e.button === 2) {
      e.preventDefault();
      e.stopPropagation();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    // Left Click Pan on empty background or SVG
    if (e.button === 0) {
      if (e.target !== containerRef.current && (e.target as HTMLElement).tagName !== 'svg') {
        return;
      }
      // Cancel any active wire connection
      if (connectingFrom) {
        setConnectingFrom(null);
        setWireMousePos(null);
        return;
      }
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    // 1. Move dragging node
    if (draggingNodeId) {
      const newX = Math.round(e.clientX / zoom - dragOffset.x);
      const newY = Math.round(e.clientY / zoom - dragOffset.y);
      setGraph(prev => ({
        ...prev,
        nodes: prev.nodes.map(n => n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n)
      }));
      return;
    }

    // 2. Pan canvas (Right-click drag or background drag in all directions)
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    // 3. Track wire drag position
    if (connectingFrom && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const worldX = (e.clientX - rect.left - pan.x) / zoom;
      const worldY = (e.clientY - rect.top - pan.y) / zoom;
      setWireMousePos({ x: worldX, y: worldY });
    }
  };

  const handleCanvasMouseUp = (e: React.MouseEvent) => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
      triggerUpdate(graph);
    }
    setIsPanning(false);
  };


  // Socket Connection Handlers (Support both Click & Drag-Drop)
  const handleStartConnect = (nodeId: string, socketId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConnectingFrom({ nodeId, socketId });
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const worldX = (e.clientX - rect.left - pan.x) / zoom;
      const worldY = (e.clientY - rect.top - pan.y) / zoom;
      setWireMousePos({ x: worldX, y: worldY });
    }
  };

  const handleEndConnect = (toNodeId: string, toSocketId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!connectingFrom) return;
    if (connectingFrom.nodeId === toNodeId) {
      // Cannot connect node to itself
      setConnectingFrom(null);
      setWireMousePos(null);
      return;
    }

    // Avoid duplicate connection
    const exists = graph.connections.some(
      c => c.fromNodeId === connectingFrom.nodeId &&
           c.fromSocketId === connectingFrom.socketId &&
           c.toNodeId === toNodeId &&
           c.toSocketId === toSocketId
    );

    if (!exists) {
      const newConn: NodeConnection = {
        id: 'conn_' + Math.random().toString(36).substring(2, 9),
        fromNodeId: connectingFrom.nodeId,
        fromSocketId: connectingFrom.socketId,
        toNodeId,
        toSocketId
      };

      triggerUpdate({
        ...graph,
        connections: [...graph.connections, newConn]
      });
    }

    setConnectingFrom(null);
    setWireMousePos(null);
  };

  // Filter templates for palette
  const filteredTemplates = NODE_TEMPLATES.filter(tpl => {
    const matchesCat = selectedCategory === 'all' || tpl.category === selectedCategory;
    const matchesQuery = tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tpl.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="flex-1 flex overflow-hidden font-mono select-none bg-black text-white">
      {/* Center Interactive Node Canvas - White Background with Black Outlined Cards */}
      <div 
        ref={containerRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onContextMenu={(e) => e.preventDefault()}
        className="flex-1 relative overflow-hidden cursor-default bg-white text-black"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(0, 0, 0, 0.15) 1.2px, transparent 1.2px)`,
          backgroundSize: '24px 24px',
          backgroundPosition: `${pan.x % 24}px ${pan.y % 24}px`
        }}
      >
        {/* SVG Purple Bezier Wires Layer */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0'
          }}
        >
          {/* Render Existing Connections */}
          {graph.connections.map(conn => {
            const fromNode = graph.nodes.find(n => n.id === conn.fromNodeId);
            const toNode = graph.nodes.find(n => n.id === conn.toNodeId);
            if (!fromNode || !toNode) return null;

            const fromX = fromNode.x + 240; // right edge of node
            const fromY = fromNode.y + 44;
            const toX = toNode.x;           // left edge of node
            const toY = toNode.y + 44;

            const dx = Math.abs(toX - fromX) * 0.55;
            const pathData = `M ${fromX} ${fromY} C ${fromX + dx} ${fromY}, ${toX - dx} ${toY}, ${toX} ${toY}`;

            return (
              <g key={conn.id} className="pointer-events-auto cursor-pointer group">
                <path
                  d={pathData}
                  fill="none"
                  stroke="#9333ea"
                  strokeWidth="3.5"
                  className="group-hover:stroke-red-500 transition-colors"
                />
                <circle
                  cx={(fromX + toX) / 2}
                  cy={(fromY + toY) / 2}
                  r="7"
                  className="fill-white stroke-purple-600 group-hover:fill-red-600 group-hover:stroke-black cursor-pointer"
                  onClick={(e) => handleDeleteConnection(conn.id, e)}
                >
                  <title>انقر لحذف الوصلة</title>
                </circle>
              </g>
            );
          })}

          {/* Active Purple Wire being dragged */}
          {connectingFrom && wireMousePos && (() => {
            const fromNode = graph.nodes.find(n => n.id === connectingFrom.nodeId);
            if (!fromNode) return null;
            const fromX = fromNode.x + 240;
            const fromY = fromNode.y + 44;
            const toX = wireMousePos.x;
            const toY = wireMousePos.y;
            const dx = Math.abs(toX - fromX) * 0.55;
            const pathData = `M ${fromX} ${fromY} C ${fromX + dx} ${fromY}, ${toX - dx} ${toY}, ${toX} ${toY}`;

            return (
              <path
                d={pathData}
                fill="none"
                stroke="#a855f7"
                strokeWidth="4"
                strokeDasharray="6,4"
              />
            );
          })()}
        </svg>

        {/* Nodes Layer in World Space */}
        <div 
          className="absolute inset-0 origin-top-left"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
          }}
        >
          {graph.nodes.length === 0 && (
            <div className="absolute top-24 left-24 p-6 border-2 border-dashed border-neutral-300 bg-white/95 text-neutral-600 rounded max-w-sm pointer-events-none shadow-sm">
              <span className="font-bold text-sm block mb-1 text-black">لا توجد مكعبات مضافة بعد</span>
              <p className="text-xs leading-relaxed">
                اختر المكعبات من القائمة على اليمين (مثل مكعب زر، مكعبات الحركة، مكعب الكاميرا) لبرمجة هذا الكائن بكل سهولة.
              </p>
            </div>
          )}

          {graph.nodes.map(node => {
            const template = getNodeTemplate(node.type);

            return (
              <div
                key={node.id}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: '240px'
                }}
                className="absolute z-20 rounded border-2 border-black bg-white text-black shadow-2xl flex flex-col font-mono text-xs select-none transition-shadow overflow-hidden"
              >
                {/* Node Header (Draggable) - Pure Black & White Style */}
                <div 
                  onMouseDown={(e) => handleNodeMouseDown(node, e)}
                  className="px-3 py-2 bg-black text-white flex items-center justify-between cursor-grab active:cursor-grabbing border-b-2 border-black"
                >
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-black text-xs text-white truncate">{node.title}</span>
                    <span className="text-[9px] text-neutral-400 font-bold opacity-90">
                      {CATEGORY_LABELS_AR[node.category] || node.category}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleDeleteNode(node.id, e)}
                    className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    title="حذف المكعب"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Sockets Bar (Inputs on left, Outputs on right with purple connectors) */}
                <div className="px-3 py-2 flex items-center justify-between border-b border-neutral-300 bg-neutral-100">
                  {/* Left: Input Sockets */}
                  <div className="flex flex-col gap-1.5">
                    {node.inputs.map(socket => (
                      <div 
                        key={socket.id}
                        onClick={(e) => handleEndConnect(node.id, socket.id, e)}
                        onMouseUp={(e) => handleEndConnect(node.id, socket.id, e)}
                        className="flex items-center gap-1.5 cursor-pointer group"
                      >
                        <div 
                          className="w-4 h-4 rounded-sm border-2 border-purple-600 bg-purple-100 group-hover:bg-purple-600 group-hover:scale-110 shadow-sm transition-all"
                          title="نقطة استقبال الوصلة"
                        />
                        <span className="text-[11px] font-bold text-neutral-900">{socket.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Right: Output Sockets */}
                  <div className="flex flex-col gap-1.5 items-end ml-auto">
                    {node.outputs.map(socket => (
                      <div 
                        key={socket.id}
                        onMouseDown={(e) => handleStartConnect(node.id, socket.id, e)}
                        onClick={(e) => handleStartConnect(node.id, socket.id, e)}
                        className="flex items-center gap-1.5 cursor-pointer group"
                      >
                        <span className="text-[11px] font-bold text-neutral-900">{socket.name}</span>
                        <div 
                          className="w-4 h-4 rounded-sm border-2 border-purple-600 bg-purple-600 group-hover:bg-purple-700 group-hover:scale-110 shadow-md transition-all"
                          title="اسحب أو انقر لمد وصلة بنفسجية"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Node Config Fields - Crisp Black Text on White */}
                {template && template.fields.length > 0 && (
                  <div className="p-3 space-y-2.5 bg-white text-black">
                    {template.fields.map(field => {
                      const val = node.params[field.key] ?? field.defaultValue;

                      return (
                        <div key={field.key} className="flex flex-col gap-1">
                          <label className="text-[11px] font-bold text-neutral-800 block">
                            {field.label}
                          </label>

                          {/* 1. Target Object Selector */}
                          {field.type === 'select-object' && (
                            <select
                              value={val}
                              onChange={(e) => handleUpdateNodeParam(node.id, field.key, e.target.value)}
                              className="w-full bg-neutral-50 text-neutral-900 border border-neutral-300 rounded px-2 py-1.5 text-xs font-bold outline-none focus:border-black focus:bg-white"
                            >
                              <option value="">-- الكائن الحالي --</option>
                              {objects.map(obj => (
                                <option key={obj.id} value={obj.id}>
                                  {obj.name}
                                </option>
                              ))}
                            </select>
                          )}

                          {/* 2. Target Scene Selector */}
                          {field.type === 'select-scene' && (
                            <select
                              value={val}
                              onChange={(e) => handleUpdateNodeParam(node.id, field.key, e.target.value)}
                              className="w-full bg-neutral-50 text-neutral-900 border border-neutral-300 rounded px-2 py-1.5 text-xs font-bold outline-none focus:border-black focus:bg-white"
                            >
                              <option value="">-- اختر مشهداً --</option>
                              {scenes.map(s => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                            </select>
                          )}

                          {/* 3. Sound Selector */}
                          {field.type === 'select-sound' && (
                            <select
                              value={val}
                              onChange={(e) => handleUpdateNodeParam(node.id, field.key, e.target.value)}
                              className="w-full bg-neutral-50 text-neutral-900 border border-neutral-300 rounded px-2 py-1.5 text-xs font-bold outline-none focus:border-black focus:bg-white"
                            >
                              {SOUND_OPTIONS.map(snd => (
                                <option key={snd.value} value={snd.value}>
                                  {snd.label}
                                </option>
                              ))}
                            </select>
                          )}

                          {/* 4. Keyboard Key Selector */}
                          {field.type === 'select-key' && (
                            <select
                              value={val}
                              onChange={(e) => handleUpdateNodeParam(node.id, field.key, e.target.value)}
                              className="w-full bg-neutral-50 text-neutral-900 border border-neutral-300 rounded px-2 py-1.5 text-xs font-bold outline-none focus:border-black focus:bg-white"
                            >
                              {KEYBOARD_KEYS.map(k => (
                                <option key={k.value} value={k.value}>
                                  {k.label}
                                </option>
                              ))}
                            </select>
                          )}

                          {/* 5. Custom Select Dropdown */}
                          {field.type === 'select' && field.options && (
                            <select
                              value={val}
                              onChange={(e) => handleUpdateNodeParam(node.id, field.key, e.target.value)}
                              className="w-full bg-neutral-50 text-neutral-900 border border-neutral-300 rounded px-2 py-1.5 text-xs font-bold outline-none focus:border-black focus:bg-white"
                            >
                              {field.options.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          )}

                          {/* 6. Number Input */}
                          {field.type === 'number' && (
                            <input
                              type="number"
                              value={val}
                              onChange={(e) => handleUpdateNodeParam(node.id, field.key, parseFloat(e.target.value) || 0)}
                              className="w-full bg-neutral-50 text-neutral-900 border border-neutral-300 rounded px-2 py-1.5 text-xs font-bold outline-none focus:border-black focus:bg-white font-mono"
                            />
                          )}

                          {/* 7. Text Input */}
                          {field.type === 'text' && (
                            <input
                              type="text"
                              value={val}
                              onChange={(e) => handleUpdateNodeParam(node.id, field.key, e.target.value)}
                              className="w-full bg-neutral-50 text-neutral-900 border border-neutral-300 rounded px-2 py-1.5 text-xs font-bold outline-none focus:border-black focus:bg-white"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Side Palette: All FY3 Blocks in Pure Black & White Theme */}
      <div className="w-72 border-r border-neutral-800 bg-black flex flex-col shrink-0 text-white">
        <div className="p-3 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-white" />
            <span className="font-bold text-xs text-white">مكعبات FY3</span>
          </div>
          <span className="text-[10px] text-white font-bold px-1.5 py-0.5 bg-neutral-900 rounded border border-neutral-700">
            {filteredTemplates.length} مكعب
          </span>
        </div>

        {/* Search Input */}
        <div className="p-2 border-b border-neutral-800 bg-black">
          <div className="flex items-center gap-1.5 px-2 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-xs">
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مكعب..."
              className="bg-transparent border-none outline-none text-xs w-full text-white placeholder-neutral-400"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="p-2 border-b border-neutral-800 flex gap-1 flex-wrap bg-neutral-950">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2 py-1 text-[10px] rounded font-bold cursor-pointer transition-colors ${
              selectedCategory === 'all' ? 'bg-white text-black' : 'bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setSelectedCategory('movement')}
            className={`px-2 py-1 text-[10px] rounded font-bold cursor-pointer transition-colors ${
              selectedCategory === 'movement' ? 'bg-white text-black' : 'bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800'
            }`}
          >
            الحركة
          </button>
          <button
            onClick={() => setSelectedCategory('input')}
            className={`px-2 py-1 text-[10px] rounded font-bold cursor-pointer transition-colors ${
              selectedCategory === 'input' ? 'bg-white text-black' : 'bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800'
            }`}
          >
            الأزرار
          </button>
          <button
            onClick={() => setSelectedCategory('camera')}
            className={`px-2 py-1 text-[10px] rounded font-bold cursor-pointer transition-colors ${
              selectedCategory === 'camera' ? 'bg-white text-black' : 'bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800'
            }`}
          >
            الكاميرا
          </button>
          <button
            onClick={() => setSelectedCategory('gameplay')}
            className={`px-2 py-1 text-[10px] rounded font-bold cursor-pointer transition-colors ${
              selectedCategory === 'gameplay' ? 'bg-white text-black' : 'bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800'
            }`}
          >
            الفيزياء
          </button>
        </div>

        {/* Blocks Catalog List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-black">
          {filteredTemplates.map(template => (
            <div
              key={template.type}
              onClick={() => handleAddNode(template.type)}
              className="group p-2.5 rounded border border-neutral-800 hover:border-white bg-neutral-950 hover:bg-neutral-900 transition-all cursor-pointer flex flex-col gap-1 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white group-hover:text-white transition-colors">
                  {template.title}
                </span>
                <Plus className="w-3.5 h-3.5 text-white group-hover:scale-125 transition-transform" />
              </div>
              <p className="text-[10px] text-neutral-400 line-clamp-2 leading-relaxed">
                {template.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
