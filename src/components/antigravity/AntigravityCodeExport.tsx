import React, { useState, useMemo } from 'react';
import {
  AntigravityConfig,
  generateCssExport,
  generateJsExport,
  generateFramerMotionExport,
  generateMotionTokens,
  generateAgentPrompt,
} from '../../utils/antigravityEngine';
import { Code, Terminal, FileCode, FileJson, Sparkles } from 'lucide-react';
import { StudioCodeBlock, StudioExportTab } from '../studio/StudioCodeBlock';

interface AntigravityCodeExportProps {
  config: AntigravityConfig;
  sourceUrl: string;
}

type ExportTab = 'css' | 'js' | 'react' | 'json' | 'prompt';

export const AntigravityCodeExport: React.FC<AntigravityCodeExportProps> = ({ config, sourceUrl }) => {
  const [activeTab, setActiveTab] = useState<ExportTab>('css');

  const cssCode = useMemo(() => generateCssExport(config, sourceUrl), [config, sourceUrl]);
  const jsCode = useMemo(() => generateJsExport(config, sourceUrl), [config, sourceUrl]);
  const reactCode = useMemo(() => generateFramerMotionExport(config, sourceUrl), [config, sourceUrl]);
  const jsonCode = useMemo(() => JSON.stringify(generateMotionTokens(config), null, 2), [config]);
  const promptCode = useMemo(() => generateAgentPrompt(config, sourceUrl), [config, sourceUrl]);

  const getActiveContent = () => {
    switch (activeTab) {
      case 'css': return cssCode;
      case 'js': return jsCode;
      case 'react': return reactCode;
      case 'json': return jsonCode;
      case 'prompt': return promptCode;
    }
  };

  const getFilename = () => {
    switch (activeTab) {
      case 'css': return `antigravity-${config.preset || 'custom'}.css`;
      case 'js': return `antigravity-motion.js`;
      case 'react': return `AntigravityMotion.tsx`;
      case 'json': return `motion-tokens.json`;
      case 'prompt': return `antigravity-prompt.txt`;
    }
  };

  const getMimeType = () => {
    switch (activeTab) {
      case 'css': return 'text/css';
      case 'js': return 'application/javascript';
      case 'react': return 'text/typescript';
      case 'json': return 'application/json';
      case 'prompt': return 'text/plain';
    }
  };

  const tabs: StudioExportTab<ExportTab>[] = [
    { id: 'css', label: 'CSS Keyframes', icon: <FileCode size={13} /> },
    { id: 'js', label: 'JavaScript Engine', icon: <Code size={13} /> },
    { id: 'react', label: 'React / Framer Motion', icon: <Sparkles size={13} /> },
    { id: 'json', label: 'Motion Tokens (DTCG)', icon: <FileJson size={13} /> },
    { id: 'prompt', label: 'Agent Prompt', icon: <Terminal size={13} /> },
  ];

  return (
    <section id="developer-export" className="w-full">
      <StudioCodeBlock
        title="Developer Motion & Token Export"
        description="Physics kinematics compiled into CSS animations, vanilla JS integration loops, Framer Motion, and DTCG design tokens."
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
