import { useEffect, useState } from 'react';
import { getToken, logout, getNames, getTenant } from './services/api';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GiftForm from './pages/GiftForm';
import GiftDetail from './pages/GiftDetail';
import PublicGiftList from './pages/PublicGiftList';
import BottomNav from './components/BottomNav';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [tenant, setTenant] = useState('');
  const [names, setNamesState] = useState({ nome1: '', nome2: '' });
  const [userId, setUserId] = useState(null);
  const [giftId, setGiftId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getToken();
    const storedTenant = getTenant();
    setIsAuthenticated(!!token);

    if (token) {
      const storedNames = getNames();
      setNamesState(storedNames);
      if (storedTenant) setTenant(storedTenant);
    }
    
    const rawHash = window.location.hash.slice(1) || '/';
    const hash = rawHash.startsWith('/') ? rawHash.slice(1) : rawHash;
    const parts = hash.split('/');
    
    // Redirecionamento automático se logado
    if (token && storedTenant && (hash === '' || hash === 'login' || hash === 'register')) {
      navigateTo('dashboard', storedTenant);
      return;
    }

    if (hash === '' || hash === 'login') {
      setCurrentPage('login');
    } else if (hash === 'register') {
      setCurrentPage('register');
    } else if (parts[1] === 'dashboard' && parts[0]) {
      setTenant(parts[0]);
      setCurrentPage('dashboard');
    } else if (parts[1] === 'gifts' && parts[2] === 'new' && parts[0]) {
      setTenant(parts[0]);
      setCurrentPage('gift-form');
      setGiftId(null);
    } else if (parts[1] === 'gifts' && parts[2] && parts[3] !== 'edit' && parts[0]) {
      setTenant(parts[0]);
      setGiftId(parts[2]);
      setCurrentPage('gift-detail');
    } else if (parts[1] === 'gifts' && parts[2] && parts[3] === 'edit' && parts[0]) {
      setTenant(parts[0]);
      setGiftId(parts[2]);
      setCurrentPage('gift-form');
    } else if (parts[1] === 'lista' && parts[0]) {
      setTenant(parts[0]);
      setCurrentPage('public-list');
    }
  }, []);

  const navigateTo = (page, newTenant = null, newGiftId = null) => {
    setCurrentPage(page);
    if (newTenant) setTenant(newTenant);
    if (newGiftId) setGiftId(newGiftId);

    if (page === 'login') {
      window.location.hash = '#/login';
    } else if (page === 'register') {
      window.location.hash = '#/register';
    } else if (page === 'dashboard') {
      window.location.hash = `#/${newTenant}/dashboard`;
    } else if (page === 'gift-form') {
      if (newGiftId) {
        window.location.hash = `#/${newTenant}/gifts/${newGiftId}/edit`;
      } else {
        window.location.hash = `#/${newTenant}/gifts/new`;
      }
    } else if (page === 'gift-detail') {
      window.location.hash = `#/${newTenant}/gifts/${newGiftId}`;
    }
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setTenant('');
    setNamesState({ nome1: '', nome2: '' });
    setUserId(null);
    navigateTo('login');
  };

  const getBottomNavView = () => {
    if (currentPage === 'public-list') return 'list';
    if (['login', 'register'].includes(currentPage)) return 'login';
    if (['dashboard', 'gift-form', 'gift-detail'].includes(currentPage)) return 'dashboard';
    return 'home';
  };

  const handleBottomNavChange = (view) => {
    if (view === 'home' || view === 'dashboard') {
      if (isAuthenticated && tenant) {
        navigateTo('dashboard', tenant);
      } else {
        navigateTo('login');
      }
    } else if (view === 'list') {
      if (tenant) {
        window.location.hash = `#/${tenant}/lista`;
        setCurrentPage('public-list');
      }
    } else if (view === 'login') {
      navigateTo('login');
    }
  };

  return (
    <div className="min-h-dvh bg-cream pb-safe-nav md:pb-0">
      {currentPage === 'login' && (
        <Login onLoginSuccess={(t) => {
          setIsAuthenticated(true);
          setTenant(t);
          const storedNames = getNames();
          setNamesState(storedNames);
          navigateTo('dashboard', t);
        }} onRegisterClick={() => navigateTo('register')} />
      )}
      {currentPage === 'register' && (
        <Register onRegisterSuccess={(t) => {
          setIsAuthenticated(true);
          setTenant(t);
          const storedNames = getNames();
          setNamesState(storedNames);
          navigateTo('dashboard', t);
        }} onLoginClick={() => navigateTo('login')} />
      )}
      {currentPage === 'dashboard' && tenant && (
        <Dashboard 
          tenant={tenant}
          names={names}
          onLogout={handleLogout}
          onNewGift={() => navigateTo('gift-form', tenant, null)}
          onEditGift={(id) => navigateTo('gift-form', tenant, id)}
          onViewGift={(id) => navigateTo('gift-detail', tenant, id)}
        />
      )}
      {currentPage === 'gift-form' && tenant && (
        <GiftForm 
          key={giftId || 'new'}
          tenant={tenant}
          giftId={giftId}
          onSave={() => navigateTo('dashboard', tenant)}
          onCancel={() => navigateTo('dashboard', tenant)}
        />
      )}
      {currentPage === 'gift-detail' && tenant && giftId && (
        <GiftDetail 
          tenant={tenant}
          giftId={giftId}
          onDelete={() => navigateTo('dashboard', tenant)}
          onBack={() => navigateTo('dashboard', tenant)}
        />
      )}
      {currentPage === 'public-list' && tenant && (
        <PublicGiftList tenant={tenant} />
      )}

      {/* Bottom Navigation for Mobile */}
      {tenant && (
        <BottomNav 
          currentView={getBottomNavView()} 
          onViewChange={handleBottomNavChange} 
          isAuthenticated={isAuthenticated} 
          tenant={tenant} 
        />
      )}
    </div>
  );
}

export default App;
