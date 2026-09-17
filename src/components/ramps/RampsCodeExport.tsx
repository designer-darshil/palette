import React, { useState, useMemo } from 'react';
import {
  GeneratedPaletteResult,
  exportToCssCustomProperties,
  exportToTailwindV4,
  exportToAgentPrompt,
} from '../../utils/rampsEngine';
import { Code, Terminal, FileJson, FileCode } from 'lucide-react';
import { StudioCodeBlock, StudioExportTab } from '../studio/StudioCodeBlock';

interface RampsCodeExportProps {
  paletteResult: GeneratedPaletteResult;
}

type ExportTab = 'css' | 'tailwind' | 'json' | 'prompt' | 'text';

export const RampsCodeExport: React.FC<RampsCodeExportProps> = ({ paletteResult }) => {
  const [activeTab, setActiveTab] = useState<ExportTab>('css');

  const cssCode = useMemo(() => exportToCssCustomProperties(paletteResult), [paletteResult]);
  const tailwindCode = useMemo(() => exportToTailwindV4(paletteResult), [paletteResult]);
  const jsonCode = useMemo(() => JSON.stringify(paletteResult.rawJson, null, 2), [paletteResult]);
  const promptCode = useMemo(() => exportToAgentPrompt(paletteResult), [paletteResult]);
  const textCode = paletteResult.rawPlainText;

  const getActiveContent = () => {
    switch (activeTab) {
      case 'css': return cssCode;
      case 'tailwind': return tailwindCode;
      case 'json': return jsonCode;
      case 'prompt': return promptCode;
      case 'text': return textCode;
    }
  };

  const getFilename = () => {
    switch (activeTab) {
      case 'css': return `ramps-tokens-${paletteResult.config.brand}.css`;
      case 'tailwind': return `tailwind.theme.css`;
      case 'json': return `ramps-tokens-${paletteResult.config.brand}.json`;
      case 'prompt':
      case 'text': return `ramps-palette-${paletteResult.config.brand}.txt`;
    }
  };

  const getMimeType = () => {
    switch (activeTab) {
      case 'css':
      case 'tailwind': return 'text/css';
      case 'json': return 'application/json';
      case 'prompt':
      case 'text': return 'text/plain';
    }
  };

  const tabs: StudioExportTab<ExportTab>[] = [
    { id: 'css', label: 'CSS Variables', icon: <FileCode size={13} /> },
    { id: 'tailwind', label: 'Tailwind v4', icon: <Code size={13} /> },
    { id: 'json', label: 'JSON (DTCG)', icon: <FileJson size={13} /> },
    { id: 'prompt', label: 'Agent Prompt', icon: <Terminal size={13} /> },
    { id: 'text', label: 'Plain Text Spec', icon: <FileCode size={13} /> },
  ];

  return (
    <section id="developer-export" className="w-full">
      <StudioCodeBlock
        title="Developer Code & Token Export"
        description="Ready-to-use tokens compiled for modern web frameworks, design systems, and coding agents."
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        code={getActiveContent()}
        filename={getFilename()}
        mimeType={getMimeType()}
        language={activeTab}
      />
    </section>
  );
};
