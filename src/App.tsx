import { Routes, Route } from 'react-router-dom';
import { Browser } from './components/Browser';

function App() {
  return (
    <Routes>
      <Route path="/*" element={<Browser />} />
    </Routes>
  );
}

export default App;
