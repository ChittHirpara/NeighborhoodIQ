import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[NeighborhoodIQ] Uncaught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-zinc-900/60 border border-rose-900/40 rounded-xl p-8 text-center backdrop-blur-xl">
            <div className="w-14 h-14 bg-rose-950/60 border border-rose-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-7 w-7 text-rose-400" />
            </div>
            <h2 className="text-white text-xl font-serif italic mb-2">Unexpected System Error</h2>
            <p className="text-zinc-400 text-xs font-mono leading-relaxed mb-2">
              {this.state.error?.message || 'An unknown error occurred.'}
            </p>
            <p className="text-zinc-600 text-[10px] uppercase tracking-widest font-mono mb-8">
              NeighborhoodIQ / Error Boundary Triggered
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black text-[10px] uppercase tracking-widest font-bold rounded transition-colors"
            >
              <RefreshCw className="h-4 w-4" /> Return to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
