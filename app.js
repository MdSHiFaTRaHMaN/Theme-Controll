/**
 * Shopify Multi-Store Remote Controller - Dashboard App Logic
 */

(function () {
  const API_BASE = window.location.origin.startsWith('http') 
    ? window.location.origin + '/api' 
    : 'http://localhost:3000/api';

  // State
  let stores = [];
  let currentStore = null;
  let subscribers = [];

  // DOM Elements
  const storeListContainer = document.getElementById('store-list-container');
  const statTotalStores = document.getElementById('stat-total-stores');
  const statLiveCount = document.getElementById('stat-live-count');
  const statLaunchCount = document.getElementById('stat-launch-count');
  const statLeadsCount = document.getElementById('stat-leads-count');

  // Active Store Header
  const editAvatar = document.getElementById('edit-avatar');
  const editStoreTitle = document.getElementById('edit-store-title');
  const editStoreIdTag = document.getElementById('edit-store-id-tag');
  const toggleModeLive = document.getElementById('toggle-mode-live');
  const toggleModeLaunch = document.getElementById('toggle-mode-launch');

  // Form Fields
  const form = document.getElementById('store-config-form');
  const inputStoreName = document.getElementById('input-store-name');
  const inputBrandName = document.getElementById('input-brand-name');
  const inputLogoUrl = document.getElementById('input-logo-url');
  const inputHeadline = document.getElementById('input-headline');
  const inputSubtitle = document.getElementById('input-subtitle');
  const inputLaunchDate = document.getElementById('input-launch-date');
  const inputPasscode = document.getElementById('input-passcode');
  const inputSocFb = document.getElementById('input-soc-fb');
  const inputSocIg = document.getElementById('input-soc-ig');
  const inputSocTt = document.getElementById('input-soc-tt');
  const inputSocWa = document.getElementById('input-soc-wa');

  // Preview elements
  const previewModeBadge = document.getElementById('preview-mode-badge');
  const previewUrlDisplay = document.getElementById('preview-url-display');
  const mockLaunchPage = document.getElementById('mock-launch-page');
  const mockLivePage = document.getElementById('mock-live-page');
  const mockBrandDisplay = document.getElementById('mock-brand-display');
  const mockHeadlineDisplay = document.getElementById('mock-headline-display');
  const mockSubDisplay = document.getElementById('mock-sub-display');
  const mockPassDisplay = document.getElementById('mock-pass-display');
  const mockLiveBrandText = document.getElementById('mock-live-brand-text');

  // Modals
  const modalAddStore = document.getElementById('modal-add-store');
  const formAddStore = document.getElementById('form-add-store');
  const modalLeads = document.getElementById('modal-leads');
  const modalSnippet = document.getElementById('modal-snippet');
  const snippetRenderCode = document.getElementById('snippet-render-code');

  // --------------------------------------------------------------------------
  // Initialization & Fetching
  // --------------------------------------------------------------------------
  async function init() {
    await fetchStores();
    await fetchSubscribers();
    setupEventListeners();
    startPreviewCountdown();
  }

  async function fetchStores() {
    try {
      const res = await fetch(`${API_BASE}/stores?t=${Date.now()}`);
      const data = await res.json();
      if (data && data.success) {
        stores = data.stores;
        renderStoreList();
        updateGlobalStats();
        if (!currentStore && stores.length > 0) {
          selectStore(stores[0].id);
        } else if (currentStore) {
          const updated = stores.find(s => s.id === currentStore.id);
          if (updated) selectStore(updated.id);
        }
      }
    } catch (err) {
      console.warn('Backend server not connected. Falling back to local demo state.');
      loadDemoData();
    }
  }

  async function fetchSubscribers() {
    try {
      const res = await fetch(`${API_BASE}/subscribers?t=${Date.now()}`);
      const data = await res.json();
      if (data && data.success) {
        subscribers = data.subscribers;
        statLeadsCount.innerText = subscribers.length;
      }
    } catch (e) {}
  }

  function loadDemoData() {
    stores = [
      {
        id: 'singhclo',
        name: 'SinghClo Main Store',
        mode: 'LIVE',
        brandName: 'SinghClo',
        logoUrl: '',
        headline: 'Something Extraordinary\nIs On The Way',
        subtitle: 'We are crafting an exclusive shopping experience curated just for you. Sign up for early VIP access and secret drops.',
        launchDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        passcode: 'vip2026',
        socials: { fb: 'https://facebook.com', ig: 'https://instagram.com', tt: '', wa: '' }
      },
      {
        id: 'brand2',
        name: 'Store 2 - Luxury Edition',
        mode: 'LAUNCH_SOON',
        brandName: 'Brand Two',
        logoUrl: '',
        headline: 'Grand Opening\nRevealing Very Soon',
        subtitle: 'The new season collection drops in a few days. Join our VIP waitlist.',
        launchDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        passcode: 'vip2026',
        socials: { fb: '', ig: '', tt: '', wa: '' }
      }
    ];
    renderStoreList();
    updateGlobalStats();
    selectStore(stores[0].id);
  }

  // --------------------------------------------------------------------------
  // Rendering Stores List
  // --------------------------------------------------------------------------
  function renderStoreList() {
    storeListContainer.innerHTML = '';
    stores.forEach(st => {
      const card = document.createElement('div');
      card.className = `store-card-item ${currentStore && currentStore.id === st.id ? 'selected' : ''}`;
      card.dataset.id = st.id;

      const isLive = st.mode === 'LIVE';

      card.innerHTML = `
        <div class="store-item-top">
          <div>
            <div class="store-item-name">${escapeHtml(st.name)}</div>
            <div class="store-item-id">${st.id}</div>
          </div>
          <div class="store-status-badge ${isLive ? 'live' : 'launch'}">
            ${isLive ? '🟢 LIVE' : '⏳ LAUNCH'}
          </div>
        </div>
        <div class="store-item-bottom">
          <button type="button" class="quick-toggle-btn" data-action="toggle" data-id="${st.id}">
            ${isLive ? 'Switch to Launch Soon' : 'Switch to Live Store'}
          </button>
          <button type="button" class="quick-toggle-btn" data-action="snippet" data-id="${st.id}">
            Tag Code
          </button>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.closest('[data-action]')) return;
        selectStore(st.id);
      });

      storeListContainer.appendChild(card);
    });
  }

  function updateGlobalStats() {
    statTotalStores.innerText = `${stores.length} Stores`;
    const liveCount = stores.filter(s => s.mode === 'LIVE').length;
    const launchCount = stores.filter(s => s.mode === 'LAUNCH_SOON').length;
    statLiveCount.innerText = liveCount;
    statLaunchCount.innerText = launchCount;
  }

  // --------------------------------------------------------------------------
  // Select & Edit Store
  // --------------------------------------------------------------------------
  function selectStore(storeId) {
    const st = stores.find(s => s.id === storeId);
    if (!st) return;
    currentStore = st;

    // Highlight card
    document.querySelectorAll('.store-card-item').forEach(c => {
      c.classList.toggle('selected', c.dataset.id === storeId);
    });

    // Populate Top Header
    editAvatar.innerText = (st.brandName || st.name).charAt(0).toUpperCase();
    editStoreTitle.innerText = st.name;
    editStoreIdTag.innerText = st.id;

    updateModeToggleButtons(st.mode);

    // Populate Form Fields
    inputStoreName.value = st.name || '';
    inputBrandName.value = st.brandName || '';
    inputLogoUrl.value = st.logoUrl || '';
    inputHeadline.value = st.headline || '';
    inputSubtitle.value = st.subtitle || '';
    inputPasscode.value = st.passcode || 'vip2026';

    // Format datetime-local
    if (st.launchDate) {
      try {
        const d = new Date(st.launchDate);
        const pad = (n) => String(n).padStart(2, '0');
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        inputLaunchDate.value = formatted;
      } catch (e) {
        inputLaunchDate.value = '';
      }
    }

    // Socials
    inputSocFb.value = (st.socials && st.socials.fb) || '';
    inputSocIg.value = (st.socials && st.socials.ig) || '';
    inputSocTt.value = (st.socials && st.socials.tt) || '';
    inputSocWa.value = (st.socials && st.socials.wa) || '';

    // Update Live Preview Screen
    updateLivePreview();
  }

  function updateModeToggleButtons(mode) {
    if (mode === 'LIVE') {
      toggleModeLive.className = 'mode-toggle-btn active-live';
      toggleModeLaunch.className = 'mode-toggle-btn';
    } else {
      toggleModeLive.className = 'mode-toggle-btn';
      toggleModeLaunch.className = 'mode-toggle-btn active-launch';
    }
  }

  // --------------------------------------------------------------------------
  // Live Interactive Preview Sync
  // --------------------------------------------------------------------------
  function updateLivePreview() {
    if (!currentStore) return;

    const isLive = currentStore.mode === 'LIVE';
    previewModeBadge.innerText = `Mode: ${isLive ? '🟢 LIVE STORE' : '⏳ LAUNCH SOON'}`;
    previewUrlDisplay.innerText = `https://${currentStore.id}.myshopify.com`;

    if (isLive) {
      mockLaunchPage.style.display = 'none';
      mockLivePage.style.display = 'block';
      mockLiveBrandText.innerText = (inputBrandName.value || currentStore.brandName || 'BRAND').toUpperCase();
    } else {
      mockLivePage.style.display = 'none';
      mockLaunchPage.style.display = 'flex';

      mockBrandDisplay.innerText = (inputBrandName.value || currentStore.brandName || 'SINGHCLO').toUpperCase();
      mockHeadlineDisplay.innerHTML = (inputHeadline.value || 'Something Extraordinary\nIs On The Way').replace(/\n/g, '<br>');
      mockSubDisplay.innerText = inputSubtitle.value || 'We are crafting an exclusive shopping experience...';
      mockPassDisplay.innerText = inputPasscode.value || 'vip2026';
    }
  }

  // Form input live listener
  [inputBrandName, inputHeadline, inputSubtitle, inputPasscode].forEach(el => {
    el.addEventListener('input', updateLivePreview);
  });

  // --------------------------------------------------------------------------
  // Save Changes
  // --------------------------------------------------------------------------
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentStore) return;

    const payload = {
      name: inputStoreName.value.trim(),
      brandName: inputBrandName.value.trim(),
      logoUrl: inputLogoUrl.value.trim(),
      headline: inputHeadline.value.trim(),
      subtitle: inputSubtitle.value.trim(),
      launchDate: new Date(inputLaunchDate.value).toISOString(),
      passcode: inputPasscode.value.trim(),
      socials: {
        fb: inputSocFb.value.trim(),
        ig: inputSocIg.value.trim(),
        tt: inputSocTt.value.trim(),
        wa: inputSocWa.value.trim()
      }
    };

    try {
      const res = await fetch(`${API_BASE}/store/update/${currentStore.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data && data.success) {
        showToast('✅ Store changes saved & deployed live!', 'success');
        await fetchStores();
      } else {
        showToast('❌ ' + (data.message || 'Error updating store'), 'error');
      }
    } catch (err) {
      // Local update
      Object.assign(currentStore, payload);
      showToast('✅ Changes saved locally!', 'success');
      renderStoreList();
      updateLivePreview();
    }
  });

  // Quick Mode Switch Toggles
  toggleModeLive.addEventListener('click', () => setStoreMode('LIVE'));
  toggleModeLaunch.addEventListener('click', () => setStoreMode('LAUNCH_SOON'));

  async function setStoreMode(newMode) {
    if (!currentStore || currentStore.mode === newMode) return;
    currentStore.mode = newMode;
    updateModeToggleButtons(newMode);
    updateLivePreview();

    try {
      const res = await fetch(`${API_BASE}/store/toggle/${currentStore.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode })
      });
      const data = await res.json();
      if (data && data.success) {
        showToast(`⚡ Store switched to ${newMode === 'LIVE' ? '🟢 LIVE' : '⏳ LAUNCH SOON'}!`, 'success');
        await fetchStores();
      }
    } catch (e) {
      showToast(`⚡ Switched to ${newMode}!`, 'success');
      renderStoreList();
      updateGlobalStats();
    }
  }

  // --------------------------------------------------------------------------
  // Event Delegation for Sidebar actions
  // --------------------------------------------------------------------------
  storeListContainer.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const storeId = btn.dataset.id;
    const action = btn.dataset.action;

    if (action === 'toggle') {
      const st = stores.find(s => s.id === storeId);
      if (!st) return;
      const targetMode = st.mode === 'LIVE' ? 'LAUNCH_SOON' : 'LIVE';
      st.mode = targetMode;
      try {
        await fetch(`${API_BASE}/store/toggle/${storeId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: targetMode })
        });
        showToast(`Switched ${st.name} to ${targetMode}!`, 'success');
        await fetchStores();
      } catch (err) {
        renderStoreList();
        updateGlobalStats();
      }
    } else if (action === 'snippet') {
      openSnippetModal(storeId);
    }
  });

  // --------------------------------------------------------------------------
  // Modals & Navigation Actions
  // --------------------------------------------------------------------------
  function setupEventListeners() {
    // Add Store Modal
    document.getElementById('btn-add-store').addEventListener('click', () => {
      modalAddStore.style.display = 'flex';
    });
    document.getElementById('btn-close-add-modal').addEventListener('click', () => {
      modalAddStore.style.display = 'none';
    });
    document.getElementById('btn-cancel-add-store').addEventListener('click', () => {
      modalAddStore.style.display = 'none';
    });

    formAddStore.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('new-store-id').value.trim().toLowerCase();
      const name = document.getElementById('new-store-name').value.trim();
      const mode = document.getElementById('new-store-mode').value;

      try {
        const res = await fetch(`${API_BASE}/store/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, name, mode })
        });
        const data = await res.json();
        if (data && data.success) {
          showToast(`🎉 Store "${name}" created successfully!`, 'success');
          modalAddStore.style.display = 'none';
          formAddStore.reset();
          await fetchStores();
          selectStore(id);
        } else {
          showToast(`❌ ${data.message || 'Could not add store'}`, 'error');
        }
      } catch (err) {
        stores.push({
          id, name, mode, brandName: name,
          launchDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          headline: 'Something Extraordinary\nIs On The Way',
          subtitle: 'We are crafting an exclusive shopping experience.',
          passcode: 'vip2026'
        });
        modalAddStore.style.display = 'none';
        formAddStore.reset();
        renderStoreList();
        updateGlobalStats();
        selectStore(id);
      }
    });

    // Snippet Instructions Modal
    document.getElementById('btn-snippet-code').addEventListener('click', () => {
      openSnippetModal(currentStore ? currentStore.id : 'singhclo');
    });
    document.getElementById('btn-copy-store-snippet').addEventListener('click', () => {
      openSnippetModal(currentStore ? currentStore.id : 'singhclo');
    });
    document.getElementById('btn-close-snippet-modal').addEventListener('click', () => {
      modalSnippet.style.display = 'none';
    });
    document.getElementById('btn-copy-snippet-render').addEventListener('click', () => {
      const code = snippetRenderCode.innerText;
      navigator.clipboard.writeText(code);
      showToast('📋 Liquid tag copied to clipboard!', 'success');
    });

    // Leads / Subscribers Modal
    document.getElementById('btn-view-leads').addEventListener('click', () => {
      openLeadsModal();
    });
    document.getElementById('btn-close-leads-modal').addEventListener('click', () => {
      modalLeads.style.display = 'none';
    });
    document.getElementById('select-leads-store-filter').addEventListener('change', renderLeadsTable);
    document.getElementById('btn-export-csv').addEventListener('click', exportLeadsCSV);
  }

  function openSnippetModal(storeId) {
    snippetRenderCode.innerText = `{% render 'store-mode-controller', store_id: '${storeId}' %}`;
    modalSnippet.style.display = 'flex';
  }

  function openLeadsModal() {
    // Populate store filter options
    const select = document.getElementById('select-leads-store-filter');
    select.innerHTML = '<option value="all">All Stores</option>';
    stores.forEach(st => {
      const opt = document.createElement('option');
      opt.value = st.id;
      opt.innerText = `${st.name} (${st.id})`;
      select.appendChild(opt);
    });

    renderLeadsTable();
    modalLeads.style.display = 'flex';
  }

  function renderLeadsTable() {
    const filter = document.getElementById('select-leads-store-filter').value;
    const tbody = document.getElementById('leads-table-body');
    tbody.innerHTML = '';

    let list = subscribers;
    if (filter !== 'all') {
      list = list.filter(s => s.storeId === filter);
    }

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 24px; color: #64748b;">No email leads captured yet. Subscriptions from your Launch Soon pages will appear here!</td></tr>';
      return;
    }

    list.forEach((sub, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td><strong style="color:#ffffff;">${escapeHtml(sub.email)}</strong></td>
        <td><code>${escapeHtml(sub.storeId)}</code></td>
        <td>${new Date(sub.createdAt || sub.date).toLocaleString()}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function exportLeadsCSV() {
    if (subscribers.length === 0) {
      showToast('No leads to export!', 'error');
      return;
    }
    let csv = 'Email,Store ID,Date\n';
    subscribers.forEach(s => {
      csv += `"${s.email}","${s.storeId}","${s.createdAt || s.date}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `shopify_vip_leads_${Date.now()}.csv`;
    link.click();
    showToast('📥 CSV file downloaded!', 'success');
  }

  // --------------------------------------------------------------------------
  // Countdown Timer in Mockup
  // --------------------------------------------------------------------------
  function startPreviewCountdown() {
    setInterval(() => {
      if (!currentStore || !currentStore.launchDate) return;
      const target = new Date(currentStore.launchDate).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      const pad = (n) => String(n).padStart(2, '0');
      const dEl = document.getElementById('mock-d');
      const hEl = document.getElementById('mock-h');
      const mEl = document.getElementById('mock-m');
      const sEl = document.getElementById('mock-s');

      if (dEl) dEl.innerText = pad(days);
      if (hEl) hEl.innerText = pad(hours);
      if (mEl) mEl.innerText = pad(mins);
      if (sEl) sEl.innerText = pad(secs);
    }, 1000);
  }

  // --------------------------------------------------------------------------
  // Toast Helper
  // --------------------------------------------------------------------------
  function showToast(msg, type = 'success') {
    const box = document.getElementById('toast-box');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = msg;
    box.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3500);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Start app
  init();
})();
