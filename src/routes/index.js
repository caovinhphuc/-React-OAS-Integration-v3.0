import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';

import AuthLayout from '../components/layout/AuthLayout';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Pages
import APIDocumentationPage from '../pages/APIDocumentationPage';
import DashboardPage from '../pages/DashboardPage';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';
import SchemaManagementPage from '../pages/SchemaManagementPage';
import TestingPage from '../pages/TestingPage';

const AppRoutes = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout>
              <HomePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/api-docs"
        element={
          <ProtectedRoute>
            <MainLayout>
              <APIDocumentationPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/schemas"
        element={
          <ProtectedRoute>
            <MainLayout>
              <SchemaManagementPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/testing"
        element={
          <ProtectedRoute>
            <MainLayout>
              <TestingPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Redirect root to dashboard if authenticated */}
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        }
      />

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
