import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { RouteType } from '../../types';
import { KromaButton } from '../../components/common/KromaButton';

interface Props {
  children: ReactNode;
  onNavigatePublic?: (route: RouteType) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class AdminErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[KROMA Admin Error Boundary caught error]:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleHardReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] w-full flex items-center justify-center p-6 bg-[#F8F8F8] dark:bg-[#090A0C] text-[#171717] dark:text-[#F8F8F8] font-sans">
          <div className="max-w-md w-full p-6 sm:p-8 bg-white dark:bg-[#111216] border border-black/10 dark:border-white/10 rounded-xs shadow-specimen flex flex-col gap-5">
            <div className="flex items-center gap-3 pb-3 border-b border-black/10 dark:border-white/10">
              <div className="w-9 h-9 rounded-xs bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center shrink-0 border border-[#FF3B30]/20">
                <AlertCircle size={20} />
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#FF3B30] font-bold">
                  STUDIO TELEMETRY ANOMALY
                </div>
                <h1 className="text-base font-bold text-[#171717] dark:text-[#F8F8F8] mt-0.5">
                  Administrative Workspace Error
                </h1>
              </div>
            </div>

            <p className="text-xs text-[#707070] dark:text-[#9DA3AF] leading-relaxed">
              An unexpected runtime error occurred within the administrative stage. Your state and local credentials remain preserved.
            </p>

            {this.state.error && (
              <div className="p-3 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xs text-xs font-mono text-[#D70015] dark:text-[#FF453A] overflow-x-auto max-h-32">
                {this.state.error.message || 'Unknown execution failure'}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-black/10 dark:border-white/10">
              <KromaButton
                variant="filled"
                size="sm"
                onClick={this.handleRetry}
                iconLeft={<RefreshCw size={13} />}
                className="flex-1 !text-xs !py-2"
              >
                Retry
              </KromaButton>
              <KromaButton
                variant="outline"
                size="sm"
                onClick={this.handleHardReload}
                className="flex-1 !text-xs !py-2"
              >
                Reload Page
              </KromaButton>
              {this.props.onNavigatePublic && (
                <KromaButton
                  variant="ghost"
                  size="sm"
                  onClick={() => this.props.onNavigatePublic!({ path: 'home' })}
                  iconLeft={<ArrowLeft size={13} />}
                  className="!text-xs !py-2 text-[#707070]"
                >
                  Public Site
                </KromaButton>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
