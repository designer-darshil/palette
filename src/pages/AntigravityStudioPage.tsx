import React from 'react';
import { RouteType } from '../types';
import { SpringsStudioPage } from './SpringsStudioPage';

interface AntigravityStudioPageProps {
  onNavigate: (route: RouteType) => void;
  initialParams?: Record<string, string | undefined>;
}

/**
 * Legacy Antigravity Studio Page route handler.
 * Seamlessly forwards to the reimagined Springs Studio laboratory experience.
 */
export const AntigravityStudioPage: React.FC<AntigravityStudioPageProps> = ({
  onNavigate,
  initialParams,
}) => {
  return <SpringsStudioPage onNavigate={onNavigate} initialParams={initialParams} />;
};
