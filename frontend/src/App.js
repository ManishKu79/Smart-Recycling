// frontend/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import CollectorDashboard from './pages/collector/CollectorDashboard';
import CollectorHistory from './pages/collector/CollectorHistory';
// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HowItWorks from "./pages/HowItWorks";
import SmartBinSimulator from "./pages/SmartBinSimulator";
import AdminCollectors from './pages/admin/AdminCollectors';
// import CollectorDashboard from './pages/collector/CollectorDashboard';
// User Pages
import UserDashboard from "./pages/user/UserDashboard";
import SubmitRecycling from "./pages/user/SubmitRecycling";
import UserRewards from "./pages/user/UserRewards";
import UserProfile from "./pages/user/UserProfile";
import RecyclingHistory from "./pages/user/RecyclingHistory";
// import CollectorHistory from './pages/collector/CollectorHistory';
// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSubmissions from "./pages/admin/AdminSubmissions";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminRewards from "./pages/admin/AdminRewards";
import AdminSettings from "./pages/admin/AdminSettings";
// import RedeemCode from './components/RedeemCode';
import AdminPickups from "./pages/admin/AdminPickups";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <div className="container">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/smartbin" element={<SmartBinSimulator />} />

                {/* User Routes */}
                <Route
                  path="/user/dashboard"
                  element={
                    <ProtectedRoute role="user">
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
  path="/admin/collectors"
  element={
    <ProtectedRoute role="admin">
      <AdminCollectors />
    </ProtectedRoute>
  }
/>

<Route
  path="/collector/dashboard"
  element={
    <ProtectedRoute role="collector">
      <CollectorDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/collector/history"
  element={
    <ProtectedRoute role="collector">
      <CollectorHistory />
    </ProtectedRoute>
  }
/>
<Route
  path="/collector/profile"
  element={
    <ProtectedRoute role="collector">
      <UserProfile />
    </ProtectedRoute>
  }
/>
<Route
  path="/collector/dashboard"
  element={
    <ProtectedRoute role="collector">
      <CollectorDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/collector/history"
  element={
    <ProtectedRoute role="collector">
      <CollectorHistory />
    </ProtectedRoute>
  }
/>

                <Route
                  path="/admin/pickups"
                  element={
                    <ProtectedRoute role="admin">
                      <AdminPickups />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user/recycle"
                  element={
                    <ProtectedRoute role="user">
                      <SubmitRecycling />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user/rewards"
                  element={
                    <ProtectedRoute role="user">
                      <UserRewards />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user/profile"
                  element={
                    <ProtectedRoute role="user">
                      <UserProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user/history"
                  element={
                    <ProtectedRoute role="user">
                      <RecyclingHistory />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute role="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/submissions"
                  element={
                    <ProtectedRoute role="admin">
                      <AdminSubmissions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute role="admin">
                      <AdminUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/rewards"
                  element={
                    <ProtectedRoute role="admin">
                      <AdminRewards />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute role="admin">
                      <AdminSettings />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </main>
          <Footer />
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
