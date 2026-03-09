import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/common/Nav';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Results from './pages/Results';

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
