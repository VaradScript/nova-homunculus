import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const SystemMetrics: React.FC = () => {
    const [cpu, setCpu] = useState(12);
    const [ram, setRam] = useState(45);
    const [network, setNetwork] = useState(1.2);

    useEffect(() => {
        const interval = setInterval(() => {
            setCpu(prev => Math.max(5, Math.min(95, prev + (Math.random() * 10 - 5))));
            setRam(prev => Math.max(30, Math.min(80, prev + (Math.random() * 2 - 1))));
            setNetwork(prev => Math.max(0.1, Math.min(10, prev + (Math.random() * 0.5 - 0.25))));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-4 rounded-xl border border-white/5 bg-white/5 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Live Telemetry</span>
                <span className="text-[8px] text-cyan animate-pulse">LIVE</span>
            </div>

            <div className="space-y-3">
                {/* CPU */}
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400">PROCESSOR LOAD</span>
                        <span className={cpu > 80 ? "text-amber" : "text-cyan"}>{cpu.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            animate={{ width: `${cpu}%` }}
                            className={cpu > 80 ? "h-full bg-amber" : "h-full bg-cyan"}
                        />
                    </div>
                </div>

                {/* RAM */}
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400">MEMORY ALLOCATION</span>
                        <span className="text-cyan">{ram.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            animate={{ width: `${ram}%` }}
                            className="h-full bg-blue"
                        />
                    </div>
                </div>

                {/* Network */}
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400">NETWORK THROUGHPUT</span>
                        <span className="text-cyan">{network.toFixed(2)} MB/S</span>
                    </div>
                    <div className="flex gap-1 h-4 items-end">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{ height: `${Math.random() * 100}%` }}
                                className="flex-1 bg-cyan/20 w-1 rounded-t-sm"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
