import type { FC } from 'react';
import type { CompressionLevel } from '../App';

interface CompressionOptionsProps {
  levels: CompressionLevel[];
  selected: CompressionLevel;
  onSelect: (level: CompressionLevel) => void;
}

const CompressionOptions: FC<CompressionOptionsProps> = ({
  levels,
  selected,
  onSelect,
}) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-text-primary mb-2">
          选择压缩级别
        </h3>
        <p className="text-sm text-text-secondary">
          根据您的需求选择最适合的压缩方式
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {levels.map((level) => (
          <div
            key={level.id}
            className={`feature-card cursor-pointer transition-all duration-200 ${
              selected.id === level.id
                ? 'border-primary bg-primary/5 shadow-md'
                : 'hover:border-slate-300'
            }`}
            onClick={() => onSelect(level)}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selected.id === level.id
                    ? 'border-primary bg-primary'
                    : 'border-slate-300'
                }`}
              >
                {selected.id === level.id && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
              <h4 className="font-semibold text-text-primary">
                {level.name}
              </h4>
            </div>
            
            <p className="text-sm text-text-secondary leading-relaxed">
              {level.description}
            </p>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-text-secondary">质量:</span>
              <div className="flex-1 bg-slate-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${level.quality * 100}%` }}
                ></div>
              </div>
              <span className="text-xs text-text-secondary">
                {Math.round(level.quality * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-text-secondary">
          💡 提示：压缩效果因PDF内容而异。图片较多的文档压缩效果更明显。
        </p>
      </div>
    </div>
  );
};

export default CompressionOptions; 