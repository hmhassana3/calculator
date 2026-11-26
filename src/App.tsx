import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './contexts/SettingsContext';
import Layout from './components/Layout';
import StandardCalculator from './pages/StandardCalculator';
import ScientificCalculator from './pages/ScientificCalculator';
import UnitConverterPage from './pages/UnitConverterPage';
import CurrencyConverter from './pages/CurrencyConverter';
import HistoryPage from './pages/HistoryPage';
import TrashPage from './pages/TrashPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<StandardCalculator />} />
            <Route path="/scientific" element={<ScientificCalculator />} />
            <Route path="/convert/currency" element={<CurrencyConverter />} />
            <Route path="/convert/:category" element={<UnitConverterPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/trash" element={<TrashPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  );
}

export default App;
