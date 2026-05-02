'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { LandingPage } from '@/components/landing-page';
import { CalculatorForm } from '@/components/calculator-form';
import { ResultsPage } from '@/components/results-page';
import { AdminLogin } from '@/components/admin-login';
import { AdminLayout } from '@/components/admin-layout';
import { AdminDashboard } from '@/components/admin-dashboard';
import { AdminLeads } from '@/components/admin-leads';
import { AdminLeadDetail } from '@/components/admin-lead-detail';
import { AdminReference } from '@/components/admin-reference';
import { AdminOfferRules } from '@/components/admin-offer-rules';
import { PrivacyPolicy } from '@/components/privacy-policy';

export default function Home() {
  const { currentView, isAdmin, adminToken, setView } = useAppStore();

  // Verify token on mount if admin
  useEffect(() => {
    if (isAdmin && adminToken) {
      fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: adminToken }),
      }).then((res) => res.json()).then((data) => {
        if (!data.valid) {
          useAppStore.getState().logout();
        }
      }).catch(() => {
        useAppStore.getState().logout();
      });
    }
  }, [isAdmin, adminToken]);

  // Public views
  if (currentView === 'landing') return <LandingPage />;
  if (currentView === 'calculator') return <CalculatorForm />;
  if (currentView === 'results') return <ResultsPage />;
  if (currentView === 'admin-login') return <AdminLogin />;
  if (currentView === 'admin-privacy') return <PrivacyPolicy />;

  // Admin views
  if (isAdmin) {
    const adminContent = (() => {
      switch (currentView) {
        case 'admin-dashboard': return <AdminDashboard />;
        case 'admin-leads': return <AdminLeads />;
        case 'admin-lead-detail': return <AdminLeadDetail />;
        case 'admin-reference': return <AdminReference />;
        case 'admin-offer-rules': return <AdminOfferRules />;
        case 'admin-privacy': return <PrivacyPolicy />;
        default: return <AdminDashboard />;
      }
    })();

    return <AdminLayout>{adminContent}</AdminLayout>;
  }

  // Fallback: not admin but trying to access admin pages
  if (currentView.startsWith('admin-')) {
    setView('admin-login');
    return null;
  }

  return <LandingPage />;
}
