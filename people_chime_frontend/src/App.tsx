import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { useState } from 'react';
import './App.css'
import NavBar from './components/NavBar';
import LoginComponent from './components/LoginComponent';
import { AuthService } from './services/AuthService';
import Home from './components/Home';

const authService = new AuthService();

function App() {

  const [userName, setUserName] = useState<string | undefined>(undefined);

  const router = createBrowserRouter([
    {
      element: (
        <>
          <NavBar userName={userName} />
          <Outlet />


        </>
      ),
      children: [
        {
          path: "/",
          element: <Home />
        },
        {
          path: "/login",
          element: <LoginComponent authService={authService} setUserNameCb={setUserName} />,
        },
        {
          path: "/profile",
          element: <div>Profile page</div>,
        },
        {
          path: "/createSpace",
          element: <div>Create space page</div>,
        },
        {
          path: "/spaces",
          element: <div>Spaces page </div>,
        },
      ]
    },
  ]);


  return (
    <div className="wrapper">
      <RouterProvider router={router} />
    </div>
  )
}

export default App
