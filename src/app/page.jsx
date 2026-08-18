'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import StatsBar from '../components/StatsBar';
import StoreList from '../components/StoreList';
import StoreEditor from '../components/StoreEditor';
import LivePreview from '../components/LivePreview';
import AddStoreModal from '../components/AddStoreModal';
import LeadsModal from '../components/LeadsModal';
import LiquidGuideModal from '../components/LiquidGuideModal';
import LoginPage from '../components/LoginPage';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const [authChecking, setAuthChecking] = useState(true);

  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [stats, setStats] = useState({ total: 0, live: 0, launchSoon: 0, leads: 0 });
  const [dbStatus, setDbStatus] = useState({ type: 'Local Storage', isMongo: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [addingStore, setAddingStore] = useState(false);

  // Modals state
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [isLeadsOpen, setIsLeadsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Helper for auth headers
  const getAuthHeaders = (tokenOverride = null) => {
    const token = tokenOverride || authToken || localStorage.getItem('dashboard_auth_token') || sessionStorage.getItem('dashboard_auth_token') || '';
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  // Fetch initial data
  const fetchData = async (overrideToken = null) => {
    setLoading(true);
    try {
      const res = await fetch('/api/stores', {
        headers: getAuthHeaders(overrideToken),
      });
      const data = await res.json();
      if (data && data.success) {
        setStores(data.stores || []);
        setStats(data.stats || { total: 0, live: 0, launchSoon: 0, leads: 0 });
        if (data.dbStatus) setDbStatus(data.dbStatus);

        // Retain current store selection or select the first one
        if (!selectedStore && data.stores?.length > 0) {
          setSelectedStore(data.stores[0]);
        } else if (selectedStore) {
          const fresh = data.stores.find((s) => s.id === selectedStore.id);
          if (fresh) setSelectedStore(fresh);
        }
      } else if (res.status === 401) {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
      showToast('Could not reach backend API', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Auth verification check on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('dashboard_auth_token') || sessionStorage.getItem('dashboard_auth_token');
      if (!token) {
        setAuthChecking(false);
        setIsAuthenticated(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/verify', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data && data.success && data.authorized) {
          setAuthToken(token);
          setIsAuthenticated(true);
          fetchData(token);
        } else {
          localStorage.removeItem('dashboard_auth_token');
          sessionStorage.removeItem('dashboard_auth_token');
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setAuthChecking(false);
      }
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = (token) => {
    setAuthToken(token);
    setIsAuthenticated(true);
    fetchData(token);
    showToast('🔑 Successfully authenticated!');
  };

  const handleLogout = () => {
    localStorage.removeItem('dashboard_auth_token');
    sessionStorage.removeItem('dashboard_auth_token');
    setAuthToken('');
    setIsAuthenticated(false);
    showToast('Logged out');
  };

  const [bulkToggling, setBulkToggling] = useState(false);

  // Quick 1-click toggle store mode
  const handleQuickToggle = async (storeId, targetMode) => {
    setTogglingId(storeId);
    try {
      const res = await fetch(`/api/store/toggle/${storeId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ mode: targetMode }),
      });
      const data = await res.json();
      if (data && data.success) {
        const updatedStore = data.store;
        setStores((prev) =>
          prev.map((s) => (s.id === storeId ? updatedStore : s))
        );
        if (selectedStore?.id === storeId) {
          setSelectedStore(updatedStore);
        }
        // Update stats
        const newLiveCount = stores.map(s => s.id === storeId ? updatedStore : s).filter(s => s.mode === 'LIVE').length;
        const newLaunchCount = stores.map(s => s.id === storeId ? updatedStore : s).filter(s => s.mode === 'LAUNCH_SOON').length;
        setStats(prev => ({ ...prev, live: newLiveCount, launchSoon: newLaunchCount }));

        showToast(`Store switched to ${updatedStore.mode === 'LIVE' ? '🟢 LIVE' : '⏳ LAUNCH SOON'}`);
      } else {
        showToast(data.message || 'Error toggling store mode', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Toggle request failed', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  // Bulk Toggle All Stores
  const handleBulkToggle = async (targetMode) => {
    if (!confirm(`Are you sure you want to switch ALL connected stores to ${targetMode === 'LIVE' ? '🟢 LIVE' : '⏳ LAUNCH SOON'}?`)) {
      return;
    }
    setBulkToggling(true);
    try {
      const res = await fetch('/api/stores/bulk-toggle', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ mode: targetMode }),
      });
      const data = await res.json();
      if (data && data.success) {
        setStores(data.stores);
        setStats(data.stats);
        if (selectedStore) {
          const updatedSelected = data.stores.find(s => s.id === selectedStore.id);
          if (updatedSelected) setSelectedStore(updatedSelected);
        }
        showToast(`⚡ All ${data.stores.length} stores switched to ${targetMode === 'LIVE' ? '🟢 LIVE' : '⏳ LAUNCH SOON'}!`);
      } else {
        showToast(data.message || 'Failed to bulk toggle stores', 'error');
      }
    } catch (err) {
      showToast('Bulk toggle request failed', 'error');
    } finally {
      setBulkToggling(false);
    }
  };

  // Save Store Configuration
  const handleSaveStore = async (storeId, updatePayload) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/store/update/${storeId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatePayload),
      });
      const data = await res.json();
      if (data && data.success) {
        const updated = data.store;
        setStores((prev) => prev.map((s) => (s.id === storeId ? updated : s)));
        setSelectedStore(updated);
        showToast('Settings saved successfully!');
      } else {
        showToast(data.message || 'Error saving settings', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Save request failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Add new store
  const handleAddStore = async (newStoreData) => {
    setAddingStore(true);
    try {
      const res = await fetch('/api/store/add', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newStoreData),
      });
      const data = await res.json();
      if (data && data.success) {
        const created = data.store;
        setStores((prev) => [created, ...prev]);
        setSelectedStore(created);
        setStats(prev => ({
          ...prev,
          total: prev.total + 1,
          live: created.mode === 'LIVE' ? prev.live + 1 : prev.live,
          launchSoon: created.mode === 'LAUNCH_SOON' ? prev.launchSoon + 1 : prev.launchSoon,
        }));
        showToast(`🎉 Store "${created.name}" created successfully!`);
        return true;
      } else {
        throw new Error(data.message || 'Failed to create store');
      }
    } finally {
      setAddingStore(false);
    }
  };

  // Delete store
  const handleDeleteStore = async (storeId, storeName) => {
    if (!confirm(`Are you sure you want to delete store "${storeName}" (${storeId})?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/store/${storeId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data && data.success) {
        const remaining = stores.filter((s) => s.id !== storeId);
        setStores(remaining);
        if (selectedStore?.id === storeId) {
          setSelectedStore(remaining.length > 0 ? remaining[0] : null);
        }
        showToast(`Store ${storeName} removed.`);
      }
    } catch (e) {
      showToast('Error deleting store', 'error');
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#07080d] flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-indigo-400 font-semibold text-sm">
          <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <span>Verifying security credentials...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-xl text-xs font-semibold ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                : 'bg-indigo-950/90 border-indigo-500/40 text-indigo-100'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        dbStatus={dbStatus}
        onRefresh={() => fetchData()}
        loading={loading}
        onOpenAddStore={() => setIsAddStoreOpen(true)}
        onOpenLeads={() => setIsLeadsOpen(true)}
        onOpenLiquidGuide={() => setIsGuideOpen(true)}
        onLogout={handleLogout}
        totalLeads={stats.leads}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 lg:p-8">
        {/* Stats Row */}
        <StatsBar stats={stats} />

        {/* 3-Column Layout: Stores List (Col 1), Store Configurator (Col 2), Simulator Preview (Col 3) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Column 1: Store List Sidebar (3 cols on large screen) */}
          <div className="lg:col-span-3 h-full">
            <StoreList
              stores={stores}
              selectedStore={selectedStore}
              onSelectStore={setSelectedStore}
              onQuickToggle={handleQuickToggle}
              onBulkToggle={handleBulkToggle}
              onDeleteStore={handleDeleteStore}
              togglingId={togglingId}
              bulkToggling={bulkToggling}
            />
          </div>

          {/* Column 2: Active Store Editor (5 cols on large screen) */}
          <div className="lg:col-span-5 h-full">
            <StoreEditor
              store={selectedStore}
              onSave={handleSaveStore}
              onToggleMode={handleQuickToggle}
              onDeleteStore={handleDeleteStore}
              saving={saving}
              toggling={togglingId === selectedStore?.id}
            />
          </div>

          {/* Column 3: Real-Time Live Preview Simulator (4 cols on large screen) */}
          <div className="lg:col-span-4 h-full">
            <LivePreview store={selectedStore} />
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddStoreModal
        isOpen={isAddStoreOpen}
        onClose={() => setIsAddStoreOpen(false)}
        onAddStore={handleAddStore}
        adding={addingStore}
      />

      <LeadsModal
        isOpen={isLeadsOpen}
        onClose={() => setIsLeadsOpen(false)}
        stores={stores}
      />

      <LiquidGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        selectedStore={selectedStore}
      />
    </div>
  );
}
