
import React from 'react';
import { cn } from '@/lib/utils';

const ScoreBar = ({ score }) => {
  const getScoreColor = (value) => {
    if (value >= 80) return "bg-red-500 shadow-red-500/50";
    if (value >= 50) return "bg-orange-500 shadow-orange-500/50";
    return "bg-blue-500 shadow-blue-500/50";
  };

  const getScoreLabel = (value) => {
    if (value >= 80) return "QUENTE";
    if (value >= 50) return "MORNO";
    return "FRIO";
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-semibold">
        <span className="text-gray-400">Score do Lead</span>
        <span className={cn(
          "px-2 py-0.5 rounded text-[10px] text-white",
          getScoreColor(score).replace('shadow', '').replace('/50', '/20')
        )}>
          {getScoreLabel(score)}
        </span>
      </div>
      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-500 shadow-lg", getScoreColor(score))}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      <div className="text-right text-xs text-white font-mono">{score}/100</div>
    </div>
  );
};

export default ScoreBar;
