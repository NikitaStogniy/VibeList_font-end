/**
 * Error Boundary Component
 *
 * Catches React component errors and displays a fallback UI.
 * Integrates with Sentry for error tracking (when configured).
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { useTranslation } from '@/hooks/use-translation';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Default Error Fallback Component with i18n support
 */
function DefaultErrorFallback({
  error,
  errorInfo,
  onReset,
  onReload
}: {
  error: Error;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
  onReload: () => void;
}) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={styles.emoji}>⚠️</Text>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('errors.somethingWentWrong')}
        </Text>
        <Text style={[styles.message, { color: colors.text }]}>
          {t('errors.errorBoundaryMessage')}
        </Text>

        {__DEV__ && error && (
          <View style={[styles.errorDetails, { backgroundColor: colors.icon + '20' }]}>
            <Text style={[styles.errorText, { color: colors.text }]}>
              {error.toString()}
            </Text>
            {errorInfo && (
              <Text style={[styles.stackTrace, { color: colors.text }]} numberOfLines={8}>
                {errorInfo.componentStack}
              </Text>
            )}
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={onReset}
          >
            <Text style={styles.buttonText}>{t('actions.tryAgain')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary, { borderColor: colors.tint }]}
            onPress={onReload}
          >
            <Text style={[styles.buttonText, styles.buttonTextSecondary, { color: colors.tint }]}>
              {Platform.OS === 'web' ? t('actions.reloadPage') : t('actions.resetApp')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error Boundary caught error:', error, errorInfo);

    // Capture error with Sentry if initialized
    Sentry.withScope((scope) => {
      scope.setTag('error_boundary', 'root_app');
      scope.setContext('errorInfo', {
        componentStack: errorInfo.componentStack,
      });
      Sentry.captureException(error);
    });

    this.setState({
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    // On web, reload the page
    if (Platform.OS === 'web') {
      window.location.reload();
    } else {
      // On native, just reset the error state
      this.handleReset();
    }
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI with i18n support
      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          onReload={this.handleReload}
        />
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
    opacity: 0.8,
  },
  errorDetails: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    maxHeight: 200,
  },
  errorText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 8,
  },
  stackTrace: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    opacity: 0.7,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    fontWeight: '600',
  },
});
