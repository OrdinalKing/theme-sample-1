import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import SignInPage from './pages/SignIn/SignInPage.jsx';
import AccountsPage from './pages/Accounts/AccountsPage.jsx';
import HistoryPage from './pages/History/HistoryPage.jsx';
import RewardsPage from './pages/Rewards/RewardsPage.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<SignInPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/rewards" element={<RewardsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
