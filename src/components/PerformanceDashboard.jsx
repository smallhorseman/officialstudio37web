import React, { useState, useEffect } from 'react';
import { usePerformanceMonitor } from '../hooks/usePerformance';

const PerformanceDashboard = ({ isVisible = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const metrics = usePerformanceMonitor();
  const [networkInfo, setNetworkInfo] = useState({});

  useEffect(() => {
    // Get network information
    if ('connection' in navigator) {
      setNetworkInfo({
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
      });
    }
  }, []);

  if (!isVisible && !import.meta.env.DEV) return null;

  const getPerformanceScore = () => {
    const scores = [];
    
    // FCP Score (0-100)
    if (metrics.fcp) {
      const fcpScore = metrics.fcp < 1800 ? 100 : Math.max(0, 100 - (metrics.fcp - 1800) / 20);
      scores.push(fcpScore);
    }
    
    // LCP Score (0-100)
    if (metrics.lcp) {
      const lcpScore = metrics.lcp < 2500 ? 100 : Math.max(0, 100 - (metrics.lcp - 2500) / 25);
      scores.push(lcpScore);
    }
    
    // CLS Score (0-100)
    if (metrics.cls !== undefined) {
      const clsScore = metrics.cls < 0.1 ? 100 : Math.max(0, 100 - (metrics.cls - 0.1) * 1000);
      scores.push(clsScore);
    }

    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  };

  const performanceScore = getPerformanceScore();

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${isExpanded ? 'w-80' : 'w-16'} transition-all duration-300`}>
      <div className="bg-[#262626] border border-[#F3E3C3]/20 rounded-lg shadow-lg overflow-hidden">
        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-3 flex items-center justify-center hover:bg-[#333] transition-colors"
          title="Performance Monitor"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            performanceScore >= 90 ? 'bg-green-500' :
            performanceScore >= 70 ? 'bg-yellow-500' :
            'bg-red-500'
          } text-white`}>
            {performanceScore}
          </div>
          {isExpanded && (
            <span className="ml-2 text-[#F3E3C3] text-sm font-semibold">Performance</span>
          )}
        </button>

        {/* Expanded Panel */}
        {isExpanded && (
          <div className="p-4 border-t border-[#F3E3C3]/20">
            <div className="space-y-3">
              {/* Core Web Vitals */}
              <div>
                <h4 className="text-sm font-semibold text-[#F3E3C3] mb-2">Core Web Vitals</h4>
                <div className="space-y-2">
                  {metrics.fcp && (
                    <div className="flex justify-between text-xs">
                      <span className="text-[#F3E3C3]/70">FCP</span>
                      <span className={`font-mono ${metrics.fcp < 1800 ? 'text-green-400' : 'text-red-400'}`}>
                        {Math.round(metrics.fcp)}ms
                      </span>
                    </div>
                  )}
                  {metrics.lcp && (
                    <div className="flex justify-between text-xs">
                      <span className="text-[#F3E3C3]/70">LCP</span>
                      <span className={`font-mono ${metrics.lcp < 2500 ? 'text-green-400' : 'text-red-400'}`}>
                        {Math.round(metrics.lcp)}ms
                      </span>
                    </div>
                  )}
                  {metrics.cls !== undefined && (
                    <div className="flex justify-between text-xs">
                      <span className="text-[#F3E3C3]/70">CLS</span>
                      <span className={`font-mono ${metrics.cls < 0.1 ? 'text-green-400' : 'text-red-400'}`}>
                        {metrics.cls.toFixed(3)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Memory Usage */}
              {metrics.memory && (
                <div>
                  <h4 className="text-sm font-semibold text-[#F3E3C3] mb-2">Memory Usage</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#F3E3C3]/70">Used</span>
                      <span className="font-mono text-[#F3E3C3]">{metrics.memory.used}MB</span>
                    </div>
                    <div className="w-full bg-[#1a1a1a] rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(100, (metrics.memory.used / metrics.memory.total) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bundle Size */}
              {metrics.bundleSize && (
                <div>
                  <h4 className="text-sm font-semibold text-[#F3E3C3] mb-2">Bundle Size</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#F3E3C3]/70">JS</span>
                      <span className="font-mono text-blue-400">
                        {Math.round(metrics.bundleSize.js / 1024)}KB
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#F3E3C3]/70">CSS</span>
                      <span className="font-mono text-purple-400">
                        {Math.round(metrics.bundleSize.css / 1024)}KB
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Network Info */}
              {networkInfo.effectiveType && (
                <div>
                  <h4 className="text-sm font-semibold text-[#F3E3C3] mb-2">Network</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#F3E3C3]/70">Type</span>
                      <span className="font-mono text-green-400">{networkInfo.effectiveType}</span>
                    </div>
                    {networkInfo.downlink && (
                      <div className="flex justify-between text-xs">
                        <span className="text-[#F3E3C3]/70">Speed</span>
                        <span className="font-mono text-yellow-400">{networkInfo.downlink}Mbps</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceDashboard;
