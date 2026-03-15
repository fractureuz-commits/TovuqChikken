import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import Rootleyout from './leyout/Rootleyout';
import ProtectedRoute from './leyout/login/ProtectedRoute';
// import Home from './pages/home/home';
import Kafolat from './pages/Kafolat/kafolat';
import Document from './pages/Document/document';
import Home from './pages/home/home';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Rootleyout />}>
      <Route path="/" element={<Home />} />
      <Route
        path="/kafolat"
        element={
          <ProtectedRoute>
            <Kafolat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/document-list"
        element={
          <ProtectedRoute>
            <Document />
          </ProtectedRoute>
        }
      />
    </Route>
  )
);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}