'use client';

import dynamic from 'next/dynamic';

const JEVVisualizer = dynamic(() => import('@/components/JEVVisualizer'), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#050816] text-slate-100 font-serif">
      <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-4" />
      <div className="text-xl font-bold tracking-widest text-cyan-300">
        JEV ARCHITECTURE LAB
      </div>
      <div className="text-xs text-slate-400 mt-1 tracking-wider uppercase">
        Initializing 3D Systems Environment
      </div>
    </div>
  ),
});

export default function Home() {
  return <JEVVisualizer />;
}
