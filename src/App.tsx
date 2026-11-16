/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { AdminPanel } from './components/AdminPanel';
import { LandingPage } from './components/LandingPage';

function isAdminPath(): boolean {
  return window.location.pathname.startsWith('/admin');
}

export default function App() {
  const [adminView, setAdminView] = useState<boolean>(isAdminPath);

  useEffect(() => {
    const onPopState = () => setAdminView(isAdminPath());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  function navigateToAdmin() {
    window.history.pushState({}, '', '/admin');
    setAdminView(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function navigateToSite() {
    window.history.pushState({}, '', '/');
    setAdminView(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  if (adminView) {
    return <AdminPanel onBackToSite={navigateToSite} />;
  }

  return <LandingPage onOpenAdmin={navigateToAdmin} />;
}
