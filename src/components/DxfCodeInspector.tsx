import React, { useState } from 'react';
import { DxfDocument } from '../cad/dxfGenerator';
import { Code, Copy, Check } from 'lucide-react';

interface DxfCodeInspectorProps {
  doc: DxfDocument;
  filename: string;
}

export const DxfCodeInspector: React.FC<DxfCodeInspectorProps> = ({ doc, filename }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate snippet
  const fullDxf = doc.toDxfString();
  const previewLines = fullDxf.split('\r\n').slice(0, 100).join('\n');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullDxf);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden text-neutral-300">
      <div className="px-4 py-3 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-semibold text-neutral-200">
            DXF ASCII ソースインスペクター ({filename})
          </span>
          <span className="text-[11px] font-mono text-neutral-500">
            [総行数: {fullDxf.split('\r\n').length.toLocaleString()} 行 / 約 {(fullDxf.length / 1024).toFixed(1)} KB]
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'コピー完了' : '全コードコピー'}</span>
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-2.5 py-1 text-xs rounded-md bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30 border border-cyan-500/30 transition-colors"
          >
            {isOpen ? '閉じる' : '先頭100行を表示'}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 bg-neutral-950 font-mono text-xs overflow-x-auto max-h-72 border-t border-neutral-800">
          <pre className="text-emerald-400/90 leading-relaxed">{previewLines}</pre>
          <div className="mt-2 text-[11px] text-neutral-500 italic">
            ... 以降省略（全 {fullDxf.split('\r\n').length} 行の完全なASCII DXF R12 / AutoCAD 2000仕様データ）
          </div>
        </div>
      )}
    </div>
  );
};
