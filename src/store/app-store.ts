import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewType =
  | 'landing'
  | 'calculator'
  | 'results'
  | 'admin-login'
  | 'admin-dashboard'
  | 'admin-leads'
  | 'admin-lead-detail'
  | 'admin-reference'
  | 'admin-offer-rules'
  | 'admin-privacy';

export interface CalculatorData {
  contactData: {
    fullName: string;
    email: string;
    whatsapp: string;
    role: string;
    institution: string;
    city: string;
    state: string;
    institutionType: string;
    sterilizedPackages: number | null;
    incubatorCount: number | null;
    incubatorType: string;
    hasOwnCME: boolean;
    hasTraceability: boolean;
    wantsFeedback: boolean;
    lgpdConsent: boolean;
  };
  consumptionData: Record<string, { quantity: number; category: string }>;
  globalMonthlySpending: number;
}

export interface CalculationResult {
  itemResults: Array<{
    name: string;
    category: string;
    quantity: number;
    refUnitPrice: number;
    estimatedCost: number;
  }>;
  totalCurrentCost: number;
  totalCMECost: number;
  totalSaving: number;
  savingPercentage: number;
  opportunityClass: string;
  suggestedOffer: string;
  leadId?: string;
}

interface AppState {
  currentView: ViewType;
  isAdmin: boolean;
  adminToken: string | null;
  adminName: string | null;
  selectedLeadId: string | null;
  calculatorData: CalculatorData | null;
  calculationResult: CalculationResult | null;
  sidebarOpen: boolean;

  setView: (view: ViewType) => void;
  login: (token: string, name: string) => void;
  logout: () => void;
  selectLead: (id: string | null) => void;
  setCalculatorData: (data: CalculatorData) => void;
  setCalculationResult: (result: CalculationResult) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentView: 'landing',
      isAdmin: false,
      adminToken: null,
      adminName: null,
      selectedLeadId: null,
      calculatorData: null,
      calculationResult: null,
      sidebarOpen: true,

      setView: (view) => set({ currentView: view }),
      login: (token, name) => set({ isAdmin: true, adminToken: token, adminName: name, currentView: 'admin-dashboard' }),
      logout: () =>
        set({
          isAdmin: false,
          adminToken: null,
          adminName: null,
          currentView: 'landing',
          selectedLeadId: null,
        }),
      selectLead: (id) => set({ selectedLeadId: id }),
      setCalculatorData: (data) => set({ calculatorData: data }),
      setCalculationResult: (result) => set({ calculationResult: result }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'cme-app-storage',
      partialize: (state) => ({
        adminToken: state.adminToken,
        isAdmin: state.isAdmin,
        adminName: state.adminName,
      }),
    }
  )
);
