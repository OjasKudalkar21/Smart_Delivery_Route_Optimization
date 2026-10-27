import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { 
  ArrowRight, 
  Cpu, 
  Zap, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Route, 
  BarChart2, 
  Layers,
  Sparkles,
  Activity,
  Terminal,
  Server,
  Play,
  RotateCcw,
  Sliders,
  TrendingDown,
  Check,
  Compass
} from 'lucide-react';

export default function App() {
  const [totalVertices, setTotalVertices] = useState(128);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans selection:bg-orange-100 selection:text-[#f26522]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12">
        <LandingPage 
          onGetStarted={() => alert('Launching Route Planner...')} 
          onNavigateToVisualizer={() => alert('Navigating to DSA Visualizer...')} 
          totalVertices={totalVertices}
        />
      </div>
    </div>
  );
}

// ============================================================================
// 3D THREE.JS ROUTE NETWORK MAP CANVAS COMPONENT
// ============================================================================
const RouteMap3DCanvas = ({ nodeCount = 128, algorithm = 'dijkstra', speed = 1, showParticles = true }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [telemetry, setTelemetry] = useState({ lat: '37.7749', lng: '-122.4194', nodeIndex: 1, distKm: 14.8, latencyMs: 2.84, activeWeight: 42 });

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f172a, 0.018);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 24, 32);
    camera.lookAt(0, 0, 0);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    currentMount.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const orangePointLight = new THREE.PointLight(0xf26522, 3, 40);
    orangePointLight.position.set(0, 5, 0);
    scene.add(orangePointLight);

    const cyanPointLight = new THREE.PointLight(0x06b6d4, 2, 30);
    cyanPointLight.position.set(-15, 8, -15);
    scene.add(cyanPointLight);

    // 5. Grid Matrix Terrain Base
    const gridHelper = new THREE.GridHelper(60, 40, 0xf26522, 0x334155);
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    const floorGeo = new THREE.PlaneGeometry(80, 80);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8, metalness: 0.2 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.55;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // 6. Generate Nodes & Graph Edges
    const nodesGroup = new THREE.Group();
    const edgesGroup = new THREE.Group();
    scene.add(nodesGroup);
    scene.add(edgesGroup);

    const nodePositions: THREE.Vector3[] = [];
    const actualNodeCount = Math.min(nodeCount, 60);

    const radius = 18;
    for (let i = 0; i < actualNodeCount; i++) {
      const angle = (i / actualNodeCount) * Math.PI * 2;
      const r = 4 + Math.random() * radius;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = Math.sin(i * 0.5) * 1.5;
      nodePositions.push(new THREE.Vector3(x, y, z));
    }

    const nodeGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const regularNodeMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.3, metalness: 0.8 });
    const depotMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.8 });

    nodePositions.forEach((pos, idx) => {
      const isDepot = idx === 0;
      const mesh = new THREE.Mesh(nodeGeo, isDepot ? depotMat : regularNodeMat);
      mesh.position.copy(pos);
      mesh.castShadow = true;
      nodesGroup.add(mesh);

      if (isDepot) {
        const ringGeo = new THREE.RingGeometry(0.6, 0.8, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.copy(pos);
        ring.position.y += 0.05;
        scene.add(ring);
      }
    });

    const edgeMat = new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.5 });
    for (let i = 0; i < actualNodeCount; i++) {
      for (let j = i + 1; j < actualNodeCount; j++) {
        const dist = nodePositions[i].distanceTo(nodePositions[j]);
        if (dist < 9) {
          const edgeGeo = new THREE.BufferGeometry().setFromPoints([nodePositions[i], nodePositions[j]]);
          const line = new THREE.Line(edgeGeo, edgeMat);
          edgesGroup.add(line);
        }
      }
    }

    // 7. Active Shortest Path Route Curve
    const pathIndices = [0];
    let curr = 0;
    for (let k = 0; k < 6; k++) {
      let nearest = -1;
      let minD = Infinity;
      for (let n = 0; n < actualNodeCount; n++) {
        if (!pathIndices.includes(n)) {
          const d = nodePositions[curr].distanceTo(nodePositions[n]);
          if (d < minD) {
            minD = d;
            nearest = n;
          }
        }
      }
      if (nearest !== -1) {
        pathIndices.push(nearest);
        curr = nearest;
      }
    }

    const pathPoints = pathIndices.map(idx => nodePositions[idx]);
    const routeCurve = new THREE.CatmullRomCurve3(pathPoints);

    const pathColor = algorithm === 'dijkstra' ? 0xf26522 : 0x06b6d4;
    const tubeGeo = new THREE.TubeGeometry(routeCurve, 64, 0.12, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({ 
      color: pathColor, 
      emissive: pathColor, 
      emissiveIntensity: 1.2, 
      roughness: 0.2 
    });
    const routeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    scene.add(routeMesh);

    const activeNodeMat = new THREE.MeshStandardMaterial({ 
      color: pathColor, 
      emissive: pathColor, 
      emissiveIntensity: 0.9 
    });
    pathIndices.forEach(idx => {
      const activeNode = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), activeNodeMat);
      activeNode.position.copy(nodePositions[idx]);
      scene.add(activeNode);
    });

    // 8. Dynamic Floating Vehicle Carrier Mesh
    const vehicleGroup = new THREE.Group();
    const carBodyGeo = new THREE.BoxGeometry(0.8, 0.5, 1.4);
    const carBodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.9 });
    const carMesh = new THREE.Mesh(carBodyGeo, carBodyMat);
    carMesh.castShadow = true;
    vehicleGroup.add(carMesh);

    const headLight = new THREE.SpotLight(0xffffff, 4, 12, Math.PI / 6, 0.5);
    headLight.position.set(0, 0, 0.7);
    headLight.target.position.set(0, -0.2, 3);
    vehicleGroup.add(headLight);
    vehicleGroup.add(headLight.target);

    scene.add(vehicleGroup);

    // 9. Floating Particle Matrix Cloud
    let particlesMesh: THREE.Points | null = null;
    if (showParticles) {
      const pGeo = new THREE.BufferGeometry();
      const pCount = 300;
      const pPos = new Float32Array(pCount * 3);
      for (let p = 0; p < pCount * 3; p += 3) {
        pPos[p] = (Math.random() - 0.5) * 60;
        pPos[p + 1] = Math.random() * 20;
        pPos[p + 2] = (Math.random() - 0.5) * 60;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({ color: 0xf26522, size: 0.15, transparent: true, opacity: 0.6 });
      particlesMesh = new THREE.Points(pGeo, pMat);
      scene.add(particlesMesh);
    }

    // 10. Interactive Controls & Mouse Drag Orbit
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let cameraAngle = 0;
    let cameraRadius = 38;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      cameraAngle -= deltaX * 0.005;
      camera.position.x = Math.sin(cameraAngle) * cameraRadius;
      camera.position.z = Math.cos(cameraAngle) * cameraRadius;
      camera.position.y = Math.max(5, Math.min(50, camera.position.y + deltaY * 0.1));
      camera.lookAt(0, 0, 0);

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => { isDragging = false; };

    const onWheel = (e: WheelEvent) => {
      cameraRadius = Math.max(15, Math.min(70, cameraRadius + e.deltaY * 0.03));
      camera.position.x = Math.sin(cameraAngle) * cameraRadius;
      camera.position.z = Math.cos(cameraAngle) * cameraRadius;
      camera.lookAt(0, 0, 0);
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel);

    // 11. Animation Loop
    let animationFrameId: number;
    let progress = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      progress += 0.0015 * speed;
      if (progress > 1) progress = 0;

      const currentPos = routeCurve.getPointAt(progress);
      const tangent = routeCurve.getTangentAt(progress);
      
      vehicleGroup.position.copy(currentPos);
      vehicleGroup.position.y += 0.4;
      vehicleGroup.lookAt(currentPos.clone().add(tangent));

      if (particlesMesh) {
        particlesMesh.rotation.y += 0.0005;
      }

      if (!isDragging) {
        cameraAngle += 0.001;
        camera.position.x = Math.sin(cameraAngle) * cameraRadius;
        camera.position.z = Math.cos(cameraAngle) * cameraRadius;
        camera.lookAt(0, 0, 0);
      }

      orangePointLight.position.copy(vehicleGroup.position);
      orangePointLight.position.y += 2;

      renderer.render(scene, camera);
    };

    animate();

    const telemetryInterval = setInterval(() => {
      setTelemetry(prev => ({
        ...prev,
        lat: (37.7749 + (Math.random() - 0.5) * 0.01).toFixed(4),
        lng: (-122.4194 + (Math.random() - 0.5) * 0.01).toFixed(4),
        nodeIndex: Math.floor(progress * pathIndices.length) + 1,
        activeWeight: Math.floor(30 + Math.random() * 25)
      }));
    }, 1200);

    const handleResize = () => {
      if (!currentMount) return;
      const newWidth = currentMount.clientWidth;
      const newHeight = currentMount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(telemetryInterval);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, [nodeCount, algorithm, speed, showParticles]);

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-[2rem] overflow-hidden bg-slate-950 border border-slate-200/80 shadow-2xl shadow-slate-200/50 group">
      
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Telemetry Overlay Bar */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-xs font-mono text-slate-300 pointer-events-none shadow-xl">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-white uppercase tracking-wider">3D WebGL Engine</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-slate-400">POS: <strong className="text-slate-200">{telemetry.lat}° N, {telemetry.lng}° W</strong></span>
          <span className="text-slate-400">ACTIVE WEIGHT: <strong className="text-[#f26522]">{telemetry.activeWeight} ms</strong></span>
          <span className="text-slate-400">LATENCY: <strong className="text-emerald-400">{telemetry.latencyMs}ms</strong></span>
        </div>
      </div>

      {/* Bottom Floating Control Guidelines */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-[10px] font-mono text-slate-300 pointer-events-none shadow-md">
        <Compass className="w-3.5 h-3.5 text-[#f26522]" />
        <span>Drag to Orbit • Scroll to Zoom</span>
      </div>

      {/* Engine Status Pill Right */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 backdrop-blur-md border border-orange-500/30 text-[10px] font-mono text-[#f26522] font-bold pointer-events-none shadow-md">
        <Zap className="w-3.5 h-3.5" />
        <span>C++17 Dijkstra Active</span>
      </div>

    </div>
  );
};

// ============================================================================
// MAIN LANDING PAGE COMPONENT
// ============================================================================
interface LandingPageProps {
  onGetStarted: () => void;
  onNavigateToVisualizer: () => void;
  totalVertices: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted = () => {},
  onNavigateToVisualizer = () => {},
  totalVertices = 128
}) => {
  // Interactive Controls State
  const [activeStep, setActiveStep] = useState<number>(2);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [selectedPreset, setSelectedPreset] = useState<'standard' | 'express' | 'heavy'>('express');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'architecture' | 'performance' | 'safety'>('architecture');
  const [pathAlgorithm, setPathAlgorithm] = useState<'dijkstra' | 'bfs'>('dijkstra');
  const [showParticles, setShowParticles] = useState<boolean>(true);

  const [simulationLog, setSimulationLog] = useState<string[]>([
    '[08:00:00] INIT: C++17 Adjacency list allocated with 128 vertices',
    '[08:00:01] BFS: Connectivity verification complete. 0 unreachable stops.'
  ]);

  const presets = {
    standard: { nodes: 64, payload: '12,000 kg', speedAvg: '65 km/h' },
    express: { nodes: 128, payload: '18,000 kg', speedAvg: '82 km/h' },
    heavy: { nodes: 256, payload: '28,000 kg', speedAvg: '58 km/h' }
  };

  const handleRunSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setActiveStep(1);
    setSimulationLog(['[SIM START] Executing native priority queue Dijkstra...']);

    let current = 1;
    const interval = setInterval(() => {
      current++;
      if (current <= 4) {
        setActiveStep(current);
        const logMsg = current === 2 
          ? '[VALIDATE] Running dual BFS/DFS reachability passes across subgraphs...'
          : current === 3
          ? '[SOLVE] Min-Heap priority queue extracting optimal edge weights...'
          : '[DISPATCH] Route vectors finalized & streamed to 3D map dashboard.';
        setSimulationLog(prev => [...prev, logMsg]);
      } else {
        clearInterval(interval);
        setIsSimulating(false);
        setSimulationLog(prev => [...prev, '[COMPLETE] Route resolved in 2.84ms with 28.4% efficiency gain.']);
      }
    }, 900 / simulationSpeed);
  };

  const workflowSteps = [
    {
      step: 1,
      title: 'Graph & Depot Initialization',
      time: '08:00:00',
      description: 'The municipal road network is loaded as an adjacency list into contiguous vector memory.',
      status: activeStep > 1 ? 'Completed' : activeStep === 1 ? 'Running' : 'Pending',
      metric: 'Vector Memory Built'
    },
    {
      step: 2,
      title: 'Reachability & Path Validation',
      time: '08:00:01',
      description: 'Concurrent BFS and DFS passes verify that all target delivery stops are strongly connected.',
      status: activeStep > 2 ? 'Completed' : activeStep === 2 ? 'Running' : 'Pending',
      metric: '0 Unreachable Nodes'
    },
    {
      step: 3,
      title: 'Greedy Sequence Computation',
      time: '08:00:02',
      description: 'Min-Heap Dijkstra runs iteratively to construct the shortest delivery stop order.',
      status: activeStep > 3 ? 'Completed' : activeStep === 3 ? 'Running' : 'Pending',
      metric: 'O((V+E) log V)'
    },
    {
      step: 4,
      title: 'Dispatch & Fleet Telemetry',
      time: '08:00:03',
      description: 'Final route vectors and distance legs stream live to the interactive 3D map visualizer.',
      status: activeStep === 4 && !isSimulating ? 'Completed' : activeStep === 4 ? 'Running' : 'Pending',
      metric: 'Live Socket Stream'
    },
  ];

  return (
    <div className="space-y-12 text-slate-800 pb-12 font-sans selection:bg-orange-100 selection:text-[#f26522]">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION WITH 3D WEBGL MAP VISUALIZER                              */}
      {/* ========================================================================= */}
      <div className="relative bg-gradient-to-b from-white via-slate-50/50 to-white backdrop-blur-2xl p-8 sm:p-12 lg:p-14 rounded-[2.5rem] border border-slate-200/90 shadow-2xl shadow-orange-500/5 overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute -top-32 -right-32 w-[30rem] h-[30rem] bg-gradient-to-br from-orange-400/20 via-amber-300/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] bg-gradient-to-tr from-slate-200/40 via-orange-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-7">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 border border-orange-200 text-[#f26522] text-xs font-black tracking-wider uppercase shadow-xs">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>C++17 Engine • 3D WebGL Route Visualizer</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
              Smart Delivery Route <span className="bg-gradient-to-r from-[#f26522] to-amber-500 bg-clip-text text-transparent">Optimization</span> Engine
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl">
              RoutePilot models complex municipal delivery networks as weighted graph structures. By combining a native C++ priority queue with Dijkstra’s algorithm and greedy nearest-neighbor heuristics, it turns chaotic stop sequences into minimal-distance dispatch routes.
            </p>

            {/* Metric Pills */}
            <div className="grid grid-cols-3 gap-4 pt-2 max-w-xl">
              <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-sm backdrop-blur-md hover:border-orange-200 transition-all">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Total Nodes</span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">{presets[selectedPreset].nodes} <span className="text-xs font-sans text-slate-500 font-semibold">Vertices</span></p>
              </div>
              <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-sm backdrop-blur-md hover:border-emerald-200 transition-all">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Avg Savings</span>
                <p className="text-xl sm:text-2xl font-black text-emerald-600 font-mono tracking-tight">~26.1%</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-sm backdrop-blur-md hover:border-orange-200 transition-all">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Complexity</span>
                <p className="text-xl sm:text-2xl font-black text-[#f26522] font-mono tracking-tight">O(E log V)</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                onClick={onGetStarted}
                className="group relative px-8 py-4 bg-[#f26522] hover:bg-[#d95318] text-white font-bold rounded-2xl text-sm shadow-xl shadow-orange-500/25 hover:shadow-2xl hover:shadow-orange-500/35 flex items-center gap-3 transition-all duration-300 active:scale-[0.98] overflow-hidden cursor-pointer"
              >
                <span className="relative z-10">Launch Route Planner</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={onNavigateToVisualizer}
                className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-sm border border-slate-800 shadow-lg shadow-slate-900/10 flex items-center gap-3 transition-all duration-300 active:scale-[0.98] cursor-pointer"
              >
                <Cpu className="w-4 h-4 text-[#f26522]" />
                <span>Open DSA Visualizer</span>
              </button>
            </div>
          </div>

          {/* Hero Right: 3D Interactive WebGL Map Visualizer */}
          <div className="lg:col-span-6 space-y-3">
            <div className="w-full h-[460px]">
              <RouteMap3DCanvas 
                nodeCount={presets[selectedPreset].nodes} 
                algorithm={pathAlgorithm}
                speed={simulationSpeed}
                showParticles={showParticles}
              />
            </div>

            {/* 3D Canvas Controls Overlay Strip */}
            <div className="p-3 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold">Path Solver:</span>
                <button
                  onClick={() => setPathAlgorithm('dijkstra')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${pathAlgorithm === 'dijkstra' ? 'bg-[#f26522] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Dijkstra
                </button>
                <button
                  onClick={() => setPathAlgorithm('bfs')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${pathAlgorithm === 'bfs' ? 'bg-cyan-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  BFS
                </button>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 font-medium">
                  <input 
                    type="checkbox" 
                    checked={showParticles} 
                    onChange={(e) => setShowParticles(e.target.checked)}
                    className="accent-[#f26522] rounded cursor-pointer"
                  />
                  <span>Particle Grid</span>
                </label>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE COCKPIT / SIMULATOR SECTION                                */}
      {/* ========================================================================= */}
      <div className="bg-white/90 backdrop-blur-2xl p-8 sm:p-10 rounded-[2.5rem] border border-slate-200/90 shadow-2xl shadow-slate-200/50 space-y-8">
        
        {/* Cockpit Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-orange-50 border border-orange-200 text-[#f26522]">
                <Sliders className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Interactive Dispatch Simulator</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Configure fleet parameters and simulate the multi-stage algorithm execution lifecycle
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="px-5 py-2.5 bg-[#f26522] hover:bg-[#d95318] disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isSimulating ? 'Simulating Engine...' : 'Run Pipeline'}</span>
            </button>
            <button
              onClick={() => {
                setActiveStep(1);
                setIsSimulating(false);
                setSimulationLog(['[RESET] Simulator state cleared. Ready for launch.']);
              }}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all active:scale-95 cursor-pointer"
              title="Reset Steps"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Fleet Configuration Control Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xl">
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Dispatch Profile</label>
            <div className="grid grid-cols-3 gap-2">
              {(['standard', 'express', 'heavy'] as const).map((preset) => (
                <button
                  key={preset}
                  onClick={() => setSelectedPreset(preset)}
                  className={`py-2 rounded-xl font-bold uppercase text-[10px] tracking-wider border transition-all cursor-pointer ${
                    selectedPreset === preset
                      ? 'bg-[#f26522] text-white border-[#f26522] shadow-lg shadow-orange-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Execution Speed</label>
            <div className="flex items-center gap-3 h-10 px-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <input 
                type="range" 
                min="0.5" 
                max="3" 
                step="0.5"
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                className="w-full accent-[#f26522] cursor-pointer"
              />
              <span className="font-mono font-bold text-[#f26522] text-xs w-8 text-right">{simulationSpeed}x</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Active Node Graph Capacity</label>
            <div className="flex items-center justify-between h-10 px-4 rounded-xl bg-slate-800/80 border border-slate-700 font-mono text-xs font-bold">
              <span>{presets[selectedPreset].nodes} Vertices</span>
              <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">Loaded</span>
            </div>
          </div>

        </div>

        {/* Telemetry Log Terminal */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3 font-mono text-xs shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#f26522]" />
              <span className="font-bold text-slate-300">Native C++ Engine Trace Log</span>
            </div>
            <span className="text-[10px] text-slate-500">stdout</span>
          </div>

          <div className="h-28 overflow-y-auto space-y-1 text-slate-300">
            {simulationLog.map((log, idx) => (
              <p key={idx} className="flex items-start gap-2">
                <span className="text-[#f26522] font-bold">&gt;</span>
                <span className={log.includes('COMPLETE') ? 'text-emerald-400 font-bold' : ''}>{log}</span>
              </p>
            ))}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. CORE ARCHITECTURE TABS & PILLARS                                       */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
              <Layers className="w-6 h-6 text-[#f26522]" />
              Core Technical System Pillars
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              How RoutePilot combines strict data structures with fast delivery heuristics
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'architecture'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Graph Architecture
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'performance'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Performance
            </button>
            <button
              onClick={() => setActiveTab('safety')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'safety'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Validation & Safety
            </button>
          </div>
        </div>

        {/* Content Panel for Selected Tab */}
        <div className="bg-white/90 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-slate-200/90 shadow-2xl shadow-slate-200/50 transition-all">
          {activeTab === 'architecture' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-50/80 to-white border border-slate-200/80 space-y-4 hover:border-orange-300 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#f26522] group-hover:scale-110 transition-transform">
                  <Route className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Adjacency List Storage</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Road segments are stored using contiguous vector pointers rather than dense matrices, reducing space complexity to <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[#f26522] font-mono">O(V + E)</code> and accelerating cache hits during search traversals.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-50/80 to-white border border-slate-200/80 space-y-4 hover:border-amber-300 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Min-Heap Priority Queue</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Dijkstra uses C++ <code className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px] text-slate-800">std::priority_queue</code> to maintain minimum distance extraction in logarithmic time <code className="bg-slate-100 px-1.5 py-0.5 rounded text-amber-600 font-mono">O(log V)</code>.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-50/80 to-white border border-slate-200/80 space-y-4 hover:border-slate-400 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:scale-110 transition-transform">
                  <Terminal className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Native C++ Compilation</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Core solver logic compiles cleanly with C++17 compilers, eliminating runtime memory garbage collection pauses for real-time applications.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-50/80 to-white border border-slate-200/80 space-y-4 hover:border-emerald-300 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <TrendingDown className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Fuel & Distance Savings</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Comparing the computed nearest-neighbor sequence against unoptimized order shows consistent distance reductions averaging 25% to 35% on multi-stop trips.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-50/80 to-white border border-slate-200/80 space-y-4 hover:border-orange-300 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#f26522] group-hover:scale-110 transition-transform">
                  <BarChart2 className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Polynomial Time Bounds</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  By constructing tours iteratively with repeated single-source shortest path calls, computation completes in polynomial time instead of factorial NP-hard brute force.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-50/80 to-white border border-slate-200/80 space-y-4 hover:border-amber-300 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Low-Latency Execution</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Routes across standard urban road networks evaluate in under 3 milliseconds, allowing quick recalibration when new stops are added.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-50/80 to-white border border-slate-200/80 space-y-4 hover:border-emerald-300 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">BFS Connectivity Checks</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Breadth-First Search systematically traverses connected components using a FIFO queue to confirm that every requested destination can be reached from the depot.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-50/80 to-white border border-slate-200/80 space-y-4 hover:border-slate-400 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:scale-110 transition-transform">
                  <Server className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">DFS Stack Verification</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Depth-First Search explores full graph paths using explicit stack structures to identify isolated subgraphs and prevent dead-end dispatches.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-50/80 to-white border border-slate-200/80 space-y-4 hover:border-orange-300 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#f26522] group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Unreachable Node Safeguards</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  If road closures or missing edges isolate a destination node, the engine marks it unreachable and reports it clearly instead of failing silently.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. INTERACTIVE TIMELINE SECTION                                            */}
      {/* ========================================================================= */}
      <div className="bg-white/90 backdrop-blur-2xl p-8 sm:p-10 rounded-[2.5rem] border border-slate-200/90 shadow-2xl shadow-slate-200/50 space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
              <Clock className="w-6 h-6 text-[#f26522]" />
              Optimization Workflow Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Click any stage below to inspect detailed execution metadata
            </p>
          </div>
          <span className="text-xs font-mono font-extrabold text-[#f26522] bg-orange-50 border border-orange-200 px-4 py-1.5 rounded-full self-start sm:self-auto shadow-xs">
            Stage {activeStep} of 4 Active
          </span>
        </div>

        {/* Workflow Pipeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {workflowSteps.map((item) => {
            const isActive = activeStep === item.step;
            const isCompleted = item.step < activeStep;

            return (
              <div
                key={item.step}
                onClick={() => setActiveStep(item.step)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-4 relative group ${
                  isActive
                    ? 'bg-gradient-to-b from-orange-50/90 via-white to-white border-[#f26522] shadow-xl shadow-orange-500/10 ring-2 ring-orange-400/30 -translate-y-1'
                    : isCompleted
                    ? 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/80'
                    : 'bg-white border-slate-200/80 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`w-9 h-9 rounded-xl text-xs font-black font-mono flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-[#f26522] text-white shadow-md shadow-orange-500/30'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : item.step}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-500 shadow-2xs">
                    {item.time}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400 font-semibold">{item.metric}</span>
                  <span className={`font-bold ${
                    isActive ? 'text-[#f26522]' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};