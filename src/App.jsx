import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Journals from './pages/Journals';
import Tasks from './pages/Tasks';
import RiskCalculator from './pages/RiskCalculator';
import CustomPage from './pages/CustomPage';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/journals" replace />} />
        <Route path="/journals" element={<Journals />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/risk" element={<RiskCalculator />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/p/:pageId" element={<CustomPage />} />
        <Route path="*" element={<Navigate to="/journals" replace />} />
      </Route>
    </Routes>
  );
}
