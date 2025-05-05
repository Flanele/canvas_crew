import { Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import CanvasPage from '../pages/CanvasPage';

export const AppRouter = () => {
  return (
    <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/canvas/:id' element={<CanvasPage />} />
        <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
};
