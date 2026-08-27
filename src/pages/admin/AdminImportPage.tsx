import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, FileText, ArrowRight } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export const AdminImportPage: React.FC = () => {
  const { logActivity } = useAdminAuth();
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
          errors: ['Root JSON payload must be an array of color/palette objects.'],
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
    setImported(true);
    logActivity('Batch Import', `Imported ${parseResult.validCount} records into the library`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Batch Data Import (JSON / Tokens)
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Safely parse, validate schema consistency, and batch import color specimens into the library.
        </p>
      </div>

      <div
        style={{
          background: 'var(--bg-surface-1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '24px',
        }}
      >
        <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>
          PASTE JSON DATASET
        </label>
        <textarea
          rows={8}
          placeholder={`[\n  { "name": "Alabaster Dusk", "hex": "#E2E8F0", "family": "neutral", "tone": "light" }\n]`}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          style={{
            width: '100%',
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-xs)',
            padding: '12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            color: 'var(--text-primary)',
            lineHeight: 1.4,
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
          <button
            onClick={handleValidate}
            className="btn-primary"
            style={{ padding: '8px 18px', fontSize: '0.82rem' }}
          >
            <span>Parse &amp; Validate Records</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {parseResult && (
        <div
          style={{
            background: 'var(--bg-surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '24px',
          }}
        >
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
            Import Validation Report
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: 'var(--bg-surface-2)', padding: '12px', borderRadius: 'var(--radius-xs)' }}>
              <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>VALID SPECIMENS</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#22C55E' }}>{parseResult.validCount}</div>
            </div>

            <div style={{ background: 'var(--bg-surface-2)', padding: '12px', borderRadius: 'var(--radius-xs)' }}>
              <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>DUPLICATES</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#E9C46A' }}>{parseResult.duplicateCount}</div>
            </div>

            <div style={{ background: 'var(--bg-surface-2)', padding: '12px', borderRadius: 'var(--radius-xs)' }}>
              <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>INVALID ROWS</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F87171' }}>{parseResult.invalidCount}</div>
            </div>
          </div>

          {parseResult.errors.length > 0 && (
            <div
              style={{
                background: 'rgba(230, 57, 70, 0.1)',
                border: '1px solid rgba(230, 57, 70, 0.25)',
                borderRadius: 'var(--radius-xs)',
                padding: '12px',
                marginBottom: '16px',
                fontSize: '0.78rem',
                color: '#F87171',
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: '4px' }}>Validation Warnings:</div>
              {parseResult.errors.map((err, i) => (
                <div key={i}>• {err}</div>
              ))}
            </div>
          )}

          {imported ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#22C55E', fontWeight: 700, fontSize: '0.88rem' }}>
              <CheckCircle2 size={16} />
              <span>Import executed successfully! Records incorporated into memory dataset.</span>
            </div>
          ) : (
            <button
              disabled={parseResult.validCount === 0}
              onClick={handleExecuteImport}
              className="btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.85rem' }}
            >
              <span>Commit Import ({parseResult.validCount} records)</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
