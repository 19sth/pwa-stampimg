import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ROUTE_PREFIX } from './utils/constants';
import MuLayout from './components/mulayout';
import MainPage from './pages/main';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={`${ROUTE_PREFIX}/`} element={<MuLayout />}>
          <Route index element={<MainPage />} />
        </Route>
        <Route path={`${ROUTE_PREFIX}`} element={<MuLayout />}>
          <Route index element={<MainPage />} />
        </Route>
        <Route path="/" element={<MuLayout />}>
          <Route index element={<MainPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
