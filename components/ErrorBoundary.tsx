import React, { Component, ErrorInfo, ReactNode } from 'react';
import { getTranslations } from '../utils/i18n';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    // Aqui você poderia enviar para um serviço de logging
  }

  private handleReset = (): void => {
    // @ts-expect-error - setState existe em Component mas TypeScript não está reconhecendo
    this.setState({
      hasError: false,
      error: null,
    });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      // @ts-expect-error - props existe em Component mas TypeScript não está reconhecendo
      const { fallback } = this.props;
      if (fallback) {
        return fallback;
      }

      const t = getTranslations();

      return (
        <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white border-4 border-brand-dark p-6 max-w-md w-full shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black text-brand-pink mb-4">{t.error.title}</h2>
            <p className="font-mono text-sm text-gray-600 mb-4">{t.error.message}</p>
            {this.state.error && (
              <details className="mb-4 text-left">
                <summary className="cursor-pointer text-xs text-gray-500 mb-2">
                  {t.error.technicalDetails}
                </summary>
                <pre className="text-xs bg-gray-100 p-2 overflow-auto max-h-32">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReset}
              className="w-full bg-brand-dark text-white py-3 font-bold hover:bg-gray-800"
            >
              {t.error.tryAgain}
            </button>
          </div>
        </div>
      );
    }

    // @ts-expect-error - props existe em Component mas TypeScript não está reconhecendo
    const { children } = this.props;
    return children;
  }
}

export default ErrorBoundary;
