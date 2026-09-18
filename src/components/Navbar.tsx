import React from 'react';
import { KromaHeader } from './KromaHeader';
import { RouteType } from '../types';

export { KromaHeader } from './KromaHeader';

interface NavbarProps {
  currentRoute: RouteType;
  onNavigate: (route: RouteType) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = (props) => {
  return <KromaHeader {...props} />;
};
