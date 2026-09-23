import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useLibraryData } from '../../context/LibraryDataContext';
import { KromaButton } from '../../components/common/KromaButton';
import { ColorItem } from '../../types';
import {
  hexToRgb,
  hexToHsl,
  hexToOklch,
  hslToHex,
  getContrastRatio,
  getTextColorForBackground,
} from '../../utils/colorUtils';

export const AdminImportPage: React.FC = () => {
  const { logActivity } = useAdminAuth();
  const { importBatch } = useLibraryData();
  const [jsonInput, setJsonInput] = useState('');
  const [parseResult, setParseResult] = useState<{
    validCount: number;
    duplicateCount: number;
    invalidCount: number;
    items: any[];
    errors: string[];
  } | null>(null);
  const [imported, setImported] = useState(false);

  const handleValidate = () => {
    setImported(false);
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        setParseResult({
          validCount: 0,
          duplicateCount: 0,
          invalidCount: 1,
          items: [],
          errors: ['Root JSON payload must be an array of color specimen objects.'],
        });
        return;
      }

      let valids = 0;
      let duplicates = 0;
      let invalids = 0;
      const errors: string[] = [];

      parsed.forEach((item, idx) => {
        if (!item.hex || !/^#[0-9A-Fa-f]{6}$/.test(item.hex)) {
          invalids++;
          errors.push(`Row ${idx + 1}: Missing or invalid HEX code (${item.hex || 'null'})`);
        } else if (!item.name) {
          invalids++;
          errors.push(`Row ${idx + 1}: Missing specimen name`);
        } else {
          valids++;
        }
      });

      setParseResult({
        validCount: valids,
        duplicateCount: duplicates,
        invalidCount: invalids,
        items: parsed,
        errors,
      });
    } catch (e: any) {
      setParseResult({
        validCount: 0,
        duplicateCount: 0,
        invalidCount: 1,
        items: [],
        errors: [`JSON Syntax Error: ${e.message}`],
      });
    }
  };

  const handleExecuteImport = () => {
    if (!parseResult || parseResult.validCount === 0) return;

    const newColors: ColorItem[] = parseResult.items
      .filter((item) => item.hex && /^#[0-9A-Fa-f]{6}$/.test(item.hex) && item.name)
      .map((item, idx) => {
        const cleanHex = item.hex.toUpperCase();
        const rgb = hexToRgb(cleanHex);
        const hsl = hexToHsl(cleanHex);
        const oklch = hexToOklch(cleanHex);
        const slug =
          (item.slug || item.name)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') || `import-${Date.now()}-${idx}`;

        return {
          id: `c-import-${Date.now()}-${idx}`,
          slug,
          name: item.name.trim(),
          hex: cleanHex,
          rgb: rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : 'rgb(0, 0, 0)',
          hsl: hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : 'hsl(0, 0%, 0%)',
          oklch,
          family: item.family || 'neutral',
          hueGroup: item.hueGroup || 'gray',
          tone: item.tone || 'medium',
          description: item.description || `Imported specimen: ${item.name}`,
          usageNotes: 'Batch imported administrative asset.',
          tags: Array.isArray(item.tags)
            ? item.tags
            : typeof item.tags === 'string'
            ? item.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
            : ['imported', 'specimen'],
          contrastWithWhite: getContrastRatio(cleanHex, '#FFFFFF'),
          contrastWithBlack: getContrastRatio(cleanHex, '#000000'),
          bestTextColor: getTextColorForBackground(cleanHex),
          complementaryHex: hslToHex(
            ((hsl?.h || 0) + 180) % 360,
            hsl?.s || 50,
            hsl?.l || 50
          ),
          analogousHexes: [
            hslToHex(((hsl?.h || 0) + 30) % 360, hsl?.s || 50, hsl?.l || 50),
            hslToHex(((hsl?.h || 0) + 330) % 360, hsl?.s || 50, hsl?.l || 50),
          ],
          triadicHexes: [
            hslToHex(((hsl?.h || 0) + 120) % 360, hsl?.s || 50, hsl?.l || 50),
            hslToHex(((hsl?.h || 0) + 240) % 360, hsl?.s || 50, hsl?.l || 50),
          ],
          shades: [],
        };
      });

    importBatch({ colors: newColors });
    setImported(true);
    logActivity('Batch Import', `Imported ${newColors.length} records into the library`);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#171717] dark:text-[#F8F8F8]">
          Batch Data Import
        </h1>
        <p className="text-xs text-[#707070] dark:text-[#9DA3AF] mt-1 font-mono">
          Safely parse, validate schema consistency, and batch import color specimens into the library.
        </p>
      </div>

      {/* Editor Box */}
      <div className="p-5 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs flex flex-col gap-4">
        <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
          <label className="text-xs font-mono font-medium uppercase tracking-wider text-[#707070] dark:text-[#9DA3AF]">
            JSON Specimen Dataset
          </label>
          <span className="font-mono text-xs text-[#707070] dark:text-[#9DA3AF]">
            SCHEMA: [&#123; name, hex, family, tone &#125;]
          </span>
        </div>

        <textarea
          rows={7}
          placeholder={`[\n  { "name": "Alabaster Dusk", "hex": "#E2E8F0", "family": "neutral", "tone": "light" }\n]`}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className="w-full p-3 bg-black/[0.03] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xs font-mono text-xs text-[#171717] dark:text-[#F8F8F8] focus:outline-none focus:border-[#171717] dark:focus:border-[#F8F8F8] leading-relaxed"
        />

        <div className="flex justify-end gap-2 pt-2">
          <KromaButton onClick={handleValidate} variant="filled" size="sm">
            Parse &amp; Validate Records
          </KromaButton>
        </div>
      </div>

      {/* Parse Result Report */}
      {parseResult && (
        <div className="p-5 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs flex flex-col gap-4">
          <div className="flex justify-between items-center pb-3 border-b border-black/5 dark:border-white/5">
            <h2 className="text-sm font-bold tracking-tight text-[#171717] dark:text-[#F8F8F8]">
              Import Validation Report
            </h2>
            <span className="font-mono text-xs text-[#707070] dark:text-[#9DA3AF]">
              {parseResult.items.length} TOTAL ROWS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
            <div className="p-3 bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 rounded-xs">
              <div className="text-xs text-[#707070] dark:text-[#9DA3AF] uppercase">
                VALID SPECIMENS
              </div>
              <div className="text-xl font-bold text-[#1B8738] dark:text-[#34C759] mt-0.5">
                {parseResult.validCount}
              </div>
            </div>

            <div className="p-3 bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 rounded-xs">
              <div className="text-xs text-[#707070] dark:text-[#9DA3AF] uppercase">
                DUPLICATES
              </div>
              <div className="text-xl font-bold text-[#946300] dark:text-[#FFD60A] mt-0.5">
                {parseResult.duplicateCount}
              </div>
            </div>

            <div className="p-3 bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 rounded-xs">
              <div className="text-xs text-[#707070] dark:text-[#9DA3AF] uppercase">
                INVALID ROWS
              </div>
              <div className="text-xl font-bold text-[#D70015] dark:text-[#FF3B30] mt-0.5">
                {parseResult.invalidCount}
              </div>
            </div>
          </div>

          {parseResult.errors.length > 0 && (
            <div className="p-3 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xs text-xs font-mono text-[#D70015] dark:text-[#FF3B30] space-y-1">
              <div className="font-bold">Validation Warnings:</div>
              {parseResult.errors.map((err, i) => (
                <div key={i}>• {err}</div>
              ))}
            </div>
          )}

          {imported ? (
            <div className="flex items-center gap-2 text-xs font-mono text-[#1B8738] dark:text-[#34C759] font-bold p-3 bg-[#34C759]/10 rounded-xs border border-[#34C759]/20">
              <CheckCircle2 size={16} />
              <span>
                Import committed successfully! {parseResult.validCount} records integrated into library.
              </span>
            </div>
          ) : (
            <div className="flex justify-end pt-2">
              <KromaButton
                disabled={parseResult.validCount === 0}
                onClick={handleExecuteImport}
                variant="filled"
                size="sm"
              >
                Commit Import ({parseResult.validCount} records)
              </KromaButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
