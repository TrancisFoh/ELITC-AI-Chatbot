import React, { Component, ErrorInfo, ReactNode } from 'react';
import { dbService } from '../services/db';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
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
    console.error("Uncaught React Error Boundary Exception:", error, errorInfo);
    
    const sessionId = sessionStorage.getItem('elitc_chat_session_id') || undefined;
    
    dbService.saveErrorLog({
      session_id: sessionId,
      error_message: error.message || String(error),
      stack_trace: `${error.stack || ''}\n\nComponent Stack:\n${errorInfo.componentStack || ''}`,
      component: 'ReactErrorBoundary'
    });
  }

  componentDidMount() {
    window.addEventListener('error', this.handleWindowError);
    window.addEventListener('unhandledrejection', this.handlePromiseRejection);
  }

  componentWillUnmount() {
    window.removeEventListener('error', this.handleWindowError);
    window.removeEventListener('unhandledrejection', this.handlePromiseRejection);
  }

  private handleWindowError = (event: ErrorEvent) => {
    // Prevent logging standard React error twice if possible, but catch unhandled global errors
    const error = event.error || event.message;
    console.error("Global Window Error caught:", error);
    
    const sessionId = sessionStorage.getItem('elitc_chat_session_id') || undefined;
    
    dbService.saveErrorLog({
      session_id: sessionId,
      error_message: event.message || (error instanceof Error ? error.message : String(error)),
      stack_trace: error instanceof Error ? error.stack : undefined,
      component: `WindowGlobalError: ${event.filename || 'unknown'}:${event.lineno || 0}:${event.colno || 0}`
    });
  };

  private handlePromiseRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    console.error("Unhandled Promise Rejection caught:", reason);
    
    const sessionId = sessionStorage.getItem('elitc_chat_session_id') || undefined;
    
    dbService.saveErrorLog({
      session_id: sessionId,
      error_message: reason instanceof Error ? reason.message : (typeof reason === 'string' ? reason : JSON.stringify(reason)),
      stack_trace: reason instanceof Error ? reason.stack : undefined,
      component: 'UnhandledPromiseRejection'
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 font-sans">
          <div className="bg-white p-8 md:p-10 rounded-3xl border border-zinc-200 shadow-xl w-full max-w-lg flex flex-col items-center text-center">
            {/* Pulsing Warning Icon Container */}
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center text-rose-500 animate-pulse">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white" />
            </div>

            <h1 className="text-2xl font-black text-zinc-950 tracking-tight mb-3">
              Something went wrong
            </h1>
            
            <p className="text-zinc-500 text-sm leading-relaxed mb-6 max-w-sm">
              We encountered a temporary technical glitch. We've logged this error automatically and are looking into it. Let's get you back on track!
            </p>

            {this.state.error && (
              <div className="w-full text-left bg-zinc-50 border border-zinc-200 rounded-xl p-4 mb-8 max-h-36 overflow-y-auto font-mono text-[11px] text-zinc-600 whitespace-pre-wrap select-all">
                <span className="font-bold text-rose-600">Error:</span> {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={this.handleReload}
                className="flex-1 bg-zinc-950 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-zinc-950/10 cursor-pointer text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer text-sm"
              >
                <Home className="w-4 h-4" />
                Go to Assistant
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
