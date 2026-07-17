import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./Components/Login";
import Signup from "./Components/Signup";
import MainNav from "./Components/MainNav";
import Home from "./Components/Home";
import Cart from "./Components/Cart";
import AllProducts from "./Components/AllProducts";
import Product from "./Components/Product";
import ProductDetail from "./Components/ProductDetail";
import Checkout from "./Components/Checkout";
import Wishlist from "./Components/Wishlist";
import Compare from "./Components/Compare";
import CompareBar from "./Components/CompareBar";
import SupportWidget from "./Components/SupportWidget";
import AdminUpdateProduct from "./Components/AdminUpdateProduct";

import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CompareProvider } from "./context/CompareContext";
import { ReviewsProvider } from "./context/ReviewsContext";
import { ToastProvider } from "./context/ToastContext";

import "./index.css";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("token") ? true : false;
  });

  
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  return (
    <ToastProvider>
      <CartProvider>
        <WishlistProvider>
          <CompareProvider>
            <ReviewsProvider>
              <Router>
                {!isAuthenticated ? (
                  <Routes>
                    <Route
                      path="/"
                      element={<Login setIsAuthenticated={setIsAuthenticated} />}
                    />
                    <Route
                      path="/signup"
                      element={<Signup setIsAuthenticated={setIsAuthenticated} />}
                    />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                ) : (
                  <>
                    <MainNav setIsAuthenticated={setIsAuthenticated} />

                    <Routes>
                      <Route path="/home" element={<Home />} />
                      <Route path="/all-products" element={<AllProducts />} />
                      <Route path="/product/:brand" element={<Product />} />
                      <Route path="/product-detail/:id" element={<ProductDetail />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/compare" element={<Compare />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route
                        path="/admin"
                        element={isAdmin ? <AdminUpdateProduct /> : <Navigate to="/all-products" />}
                      />
                      <Route path="*" element={<Navigate to="/all-products" />} />
                    </Routes>

                    <CompareBar />
                    <SupportWidget />
                  </>
                )}
              </Router>
            </ReviewsProvider>
          </CompareProvider>
        </WishlistProvider>
      </CartProvider>
    </ToastProvider>
  );
};

export default App;