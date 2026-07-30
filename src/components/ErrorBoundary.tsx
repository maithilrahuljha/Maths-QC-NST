import { Component, ReactNode } from 'react';

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

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Arial, sans-serif',
          background: '#f8fafc',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '40px',
            maxWidth: '500px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h1 style={{ color: '#1e293b', marginBottom: '8px' }}>Dashboard Error</h1>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>
              Something went wrong while loading the dashboard.
            </p>
            <pre style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '12px',
              textAlign: 'left',
              overflow: 'auto',
              maxHeight: '150px',
              marginBottom: '20px'
            }}>
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#2563eb',
                color: 'white',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
