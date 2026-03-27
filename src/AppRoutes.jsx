import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import Rootleyout from './leyout/Rootleyout';
import Home from './pages/home/home';

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route element={<Rootleyout />}>
            <Route path="/" element={<Home />} />
        </Route>
    )
);

export default function AppRoutes() {
    return <RouterProvider router={router} />;
}
