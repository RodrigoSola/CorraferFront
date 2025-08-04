import { createBrowserRouter } from "react-router-dom";
import Home from "./components/Home";
import Register from "./components/Register";
import CreateProducts from "../src/hooks/products/CreateProducts";
import Login from "./components/Login";
import Products from "./hooks/products/Products";
import { CartProvider } from "./components/CartContext";
import Clients from "./components/Clients";

const CartLayout = ({ children }) => <CartProvider>{children}</CartProvider>;

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/createproducts",
    element: <CreateProducts />,
  },
  {
    path: "/products",

    element: (
      <CartLayout>
        <Products />
      </CartLayout>
    ),
  },
  {
    path: "/clients",
    element: <Clients />,
  },
]);
