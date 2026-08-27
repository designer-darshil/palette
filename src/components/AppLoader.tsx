import React from 'react';

/**
 * AppLoader Component
 * The primary boot loader is mounted directly in index.html with inline critical CSS
 * to guarantee 0ms paint time, zero white-flash, and zero React-mount flicker.
 * This component is kept as a non-rendering safe export.
 */
export const AppLoader: React.FC = () => null;
