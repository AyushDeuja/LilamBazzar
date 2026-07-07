import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Browse from './pages/Browse.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Checkout from './pages/Checkout.jsx';
import MyBids from './pages/MyBids.jsx';
import MyOrders from './pages/MyOrders.jsx';
import Profile from './pages/Profile.jsx';
import VendorProducts from './pages/vendor/VendorProducts.jsx';
import ProductForm from './pages/vendor/ProductForm.jsx';
import VendorSales from './pages/vendor/VendorSales.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';
import AdminCategories from './pages/admin/AdminCategories.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* public */}
        <Route path="/" element={<Browse />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* any signed-in user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-bids" element={<MyBids />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* vendor */}
        <Route element={<ProtectedRoute roles={['vendor']} />}>
          <Route path="/vendor/products" element={<VendorProducts />} />
          <Route path="/vendor/products/new" element={<ProductForm />} />
          <Route path="/vendor/products/:id/edit" element={<ProductForm />} />
          <Route path="/vendor/sales" element={<VendorSales />} />
        </Route>

        {/* admin */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer className="footer">
        <div className="container ">
          <strong>LilamBazzar</strong> — bid, win &amp; shop. Built with NestJS +
          React.
        </div>
      </footer>
    </>
  );
}
