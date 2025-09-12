"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";

// Types
interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  image?: string;
  bio?: string;
}

interface ProfilePermissions {
  canEdit: boolean;
  canDelete: boolean;
  canManageAcademic: boolean;
  canViewPrivate: boolean;
}

interface ProfileState {
  user: User | null;
  permissions: ProfilePermissions;
  expandedSections: Set<string>;
  activeTab: string;
  loading: boolean;
  error: string | null;
}

type ProfileAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_PERMISSIONS'; payload: ProfilePermissions }
  | { type: 'TOGGLE_SECTION'; payload: string }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'EXPAND_SECTION'; payload: string }
  | { type: 'COLLAPSE_SECTION'; payload: string }
  | { type: 'EXPAND_ALL_SECTIONS'; payload: string[] }
  | { type: 'COLLAPSE_ALL_SECTIONS' };

interface ProfileContextType {
  state: ProfileState;
  dispatch: React.Dispatch<ProfileAction>;
  // Helper functions
  toggleSection: (sectionId: string) => void;
  setActiveTab: (tab: string) => void;
  expandSection: (sectionId: string) => void;
  collapseSection: (sectionId: string) => void;
  expandAllSections: (sectionIds: string[]) => void;
  collapseAllSections: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Initial state
const initialState: ProfileState = {
  user: null,
  permissions: {
    canEdit: false,
    canDelete: false,
    canManageAcademic: false,
    canViewPrivate: false,
  },
  expandedSections: new Set(),
  activeTab: 'overview',
  loading: false,
  error: null,
};

// Reducer
function profileReducer(state: ProfileState, action: ProfileAction): ProfileState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };

    case 'SET_PERMISSIONS':
      return { ...state, permissions: action.payload };

    case 'TOGGLE_SECTION': {
      const newExpanded = new Set(state.expandedSections);
      if (newExpanded.has(action.payload)) {
        newExpanded.delete(action.payload);
      } else {
        newExpanded.add(action.payload);
      }
      return { ...state, expandedSections: newExpanded };
    }

    case 'EXPAND_SECTION': {
      const newExpanded = new Set(state.expandedSections);
      newExpanded.add(action.payload);
      return { ...state, expandedSections: newExpanded };
    }

    case 'COLLAPSE_SECTION': {
      const newExpanded = new Set(state.expandedSections);
      newExpanded.delete(action.payload);
      return { ...state, expandedSections: newExpanded };
    }

    case 'EXPAND_ALL_SECTIONS':
      return { ...state, expandedSections: new Set(action.payload) };

    case 'COLLAPSE_ALL_SECTIONS':
      return { ...state, expandedSections: new Set() };

    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

// Context
const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Provider Props
interface ProfileProviderProps {
  children: ReactNode;
  initialUser?: User;
  loggedInUserId?: string;
}

// Provider Component
export function ProfileProvider({
  children,
  initialUser,
  loggedInUserId
}: ProfileProviderProps) {
  const [state, dispatch] = useReducer(profileReducer, {
    ...initialState,
    user: initialUser || null,
    permissions: {
      canEdit: initialUser?.id === loggedInUserId,
      canDelete: initialUser?.id === loggedInUserId,
      canManageAcademic: initialUser?.role === 'INSTITUTION' && initialUser?.id === loggedInUserId,
      canViewPrivate: initialUser?.id === loggedInUserId,
    },
  });

  // Helper functions
  const toggleSection = (sectionId: string) => {
    dispatch({ type: 'TOGGLE_SECTION', payload: sectionId });
  };

  const setActiveTab = (tab: string) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  };

  const expandSection = (sectionId: string) => {
    dispatch({ type: 'EXPAND_SECTION', payload: sectionId });
  };

  const collapseSection = (sectionId: string) => {
    dispatch({ type: 'COLLAPSE_SECTION', payload: sectionId });
  };

  const expandAllSections = (sectionIds: string[]) => {
    dispatch({ type: 'EXPAND_ALL_SECTIONS', payload: sectionIds });
  };

  const collapseAllSections = () => {
    dispatch({ type: 'COLLAPSE_ALL_SECTIONS' });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const value: ProfileContextType = {
    state,
    dispatch,
    toggleSection,
    setActiveTab,
    expandSection,
    collapseSection,
    expandAllSections,
    collapseAllSections,
    setLoading,
    setError,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

// Hook to use the context
export function useProfileContext() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return context;
}

// Selector hooks for specific state slices
export function useProfileUser() {
  const { state } = useProfileContext();
  return state.user;
}

export function useProfilePermissions() {
  const { state } = useProfileContext();
  return state.permissions;
}

export function useProfileExpansion() {
  const { state, toggleSection, expandSection, collapseSection, expandAllSections, collapseAllSections } = useProfileContext();
  return {
    expandedSections: state.expandedSections,
    toggleSection,
    expandSection,
    collapseSection,
    expandAllSections,
    collapseAllSections,
  };
}

export function useProfileTab() {
  const { state, setActiveTab } = useProfileContext();
  return {
    activeTab: state.activeTab,
    setActiveTab,
  };
}

export function useProfileLoading() {
  const { state, setLoading, setError } = useProfileContext();
  return {
    loading: state.loading,
    error: state.error,
    setLoading,
    setError,
  };
}