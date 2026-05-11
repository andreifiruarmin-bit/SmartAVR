import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white p-10 rounded-[3rem] border border-slate-200 shadow-2xl">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-100 animate-pulse">
              <AlertTriangle className="w-10 h-10" />
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">Oops! Ceva nu a mers bine</h2>
            <p className="text-slate-500 font-bold text-sm leading-relaxed mb-8">
              A apărut o eroare neașteptată în aplicație. Nu îți face griji, datele tale sunt în siguranță în Supabase.
            </p>

            {this.state.error && (
              <div className="bg-slate-50 p-4 rounded-2xl mb-8 border border-slate-100">
                <p className="text-[10px] font-mono text-slate-400 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
              >
                <Home className="w-4 h-4" />
                Acasă
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
