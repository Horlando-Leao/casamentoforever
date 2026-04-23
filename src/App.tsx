import { useEffect, useState } from 'react';
import { getToken, logout, getNames, getTenant, getEventDetails, saveEventDetails } from './services/api';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GiftForm from './pages/GiftForm';
import GiftDetail from './pages/GiftDetail';
import ReceivedGifts from './pages/ReceivedGifts';
import EventForm from './pages/EventForm';
import PublicEventDetail from './pages/PublicEventDetail';
import BottomNav from './components/BottomNav';
import Modal from './components/Modal';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [tenant, setTenant] = useState('');
  const [names, setNamesState] = useState({ nome1: '', nome2: '' });
  const [userId, setUserId] = useState(null);
  const [giftId, setGiftId] = useState(null);
  const [qrToken, setQrToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
    confirmLabel: 'Confirmar',
    cancelLabel: 'Cancelar',
    type: 'confirm'
  });

  const showModal = (config) => {
    setModalConfig({
      title: '',
      message: '',
      confirmLabel: 'Confirmar',
      cancelLabel: 'Cancelar',
      type: 'confirm',
      onConfirm: null,
      onCancel: null,
      ...config,
      isOpen: true
    });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    const handleHashChange = () => {
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
      } else if (parts[0] === 'convite' && parts[1]) {
        setQrToken(parts[1]);
        setCurrentPage('public-event');
      } else {
        // Protected routes
        if (!token) {
          navigateTo('login');
          return;
        }

        if (parts[1] === 'dashboard' && parts[0]) {
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
        } else if (parts[1] === 'received' && parts[0]) {
          setTenant(parts[0]);
          setCurrentPage('received-gifts');
        } else if (parts[1] === 'event' && parts[0]) {
          setTenant(parts[0]);
          setCurrentPage('event-form');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Run on mount

    return () => window.removeEventListener('hashchange', handleHashChange);
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
    } else if (page === 'received-gifts') {
      window.location.hash = `#/${newTenant}/received`;
    } else if (page === 'event-form') {
      window.location.hash = `#/${newTenant}/event`;
    }
  };

  const handleShareInvitation = async (tenantSlug) => {
    try {
      let event;
      try {
        const data = await getEventDetails(tenantSlug);
        event = data.event;
      } catch (e) {
        event = null;
      }

      const generateLink = async (currentEvent) => {
        let eventToShare = currentEvent;
        if (!eventToShare) {
          const created = await saveEventDetails(tenantSlug, {
            endereco: '',
            horario: '',
            data_evento: '',
            dress_code: '',
            observacoes: '',
          });
          eventToShare = created.event;
        }
        const token = eventToShare.qr_token;
        const url = `${window.location.origin}/#/convite/${token}`;
        await navigator.clipboard.writeText(url);
        showModal({
          title: 'Link Copiado!',
          message: 'O link do convite foi copiado para sua área de transferência.',
          type: 'alert',
          confirmLabel: 'Ok'
        });
      };

      if (!event || !event.endereco) {
        showModal({
          title: 'Adicionar Endereço?',
          message: 'Nenhum endereço de convite foi cadastrado. Deseja adicionar o endereço antes de compartilhar?',
          confirmLabel: 'Sim, Adicionar',
          cancelLabel: 'Não, Compartilhar Assim Mesmo',
          onConfirm: () => navigateTo('event-form', tenantSlug),
          onCancel: () => generateLink(event)
        });
        return;
      }

      await generateLink(event);
    } catch (error) {
      showModal({
        title: 'Ops!',
        message: error.message || 'Falha ao gerar o link de compartilhamento.',
        type: 'alert',
        confirmLabel: 'Entendido'
      });
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
    if (currentPage === 'public-event' || currentPage === 'event-form') return 'list';
    if (['login', 'register'].includes(currentPage)) return 'login';
    if (['dashboard', 'gift-form', 'gift-detail', 'received-gifts'].includes(currentPage)) return 'dashboard';
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
        navigateTo('event-form', tenant);
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
          onViewReceived={() => navigateTo('received-gifts', tenant)}
          onViewEvent={() => navigateTo('event-form', tenant)}
          onShareInvitation={() => handleShareInvitation(tenant)}
          showModal={showModal}
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
          showModal={showModal}
        />
      )}
      {currentPage === 'received-gifts' && tenant && (
        <ReceivedGifts 
          tenant={tenant}
          onBack={() => navigateTo('dashboard', tenant)}
          showModal={showModal}
        />
      )}
      {currentPage === 'event-form' && tenant && (
        <EventForm
          tenant={tenant}
          onBack={() => navigateTo('dashboard', tenant)}
          showModal={showModal}
        />
      )}
      {currentPage === 'public-event' && qrToken && (
        <PublicEventDetail
          qrToken={qrToken}
        />
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
      {/* Global Modal */}
      <Modal
        {...modalConfig}
        onClose={closeModal}
      />
    </div>
  );
}

export default App;
