import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ui/ProtectedRoute";
import PageTransition from "./components/ui/PageTransition";
import NotFound from "pages/NotFound";
import Landing from './pages/Landing';
import JobSeekerDashboard from './pages/job-seeker-dashboard';
import JobDetails from './pages/job-details';
import EmployerDashboard from './pages/employer-dashboard';
import JobSearchResults from './pages/job-search-results';
import ApplicationTracking from './pages/application-tracking';
import Register from './pages/register';
import Login from './pages/login';
import Profile from './pages/profile';
import JobPosting from './pages/job-posting/index';
import CandidateBrowsing from './pages/candidates/index';
import CandidateDetails from './pages/candidate-details/index';
import CompanyDetails from './pages/company-details/index';
import SavedJobs from './pages/saved-jobs';
import AuthCallback from './pages/auth/callback';

const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <ScrollToTop />
          <RouterRoutes>
            {/* Public routes */}
            <Route path="/" element={
              <PageTransition>
                <Landing />
              </PageTransition>
            } />
            <Route path="/register" element={
              <PageTransition>
                <Register />
              </PageTransition>
            } />
            <Route path="/login" element={
              <PageTransition>
                <Login />
              </PageTransition>
            } />
            <Route path="/auth/callback" element={
              <PageTransition>
                <AuthCallback />
              </PageTransition>
            } />
            
            {/* Protected routes */}
            <Route path="/job-seeker-dashboard" element={
              <ProtectedRoute requiredRole="job_seeker">
                <PageTransition>
                  <JobSeekerDashboard />
                </PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/employer-dashboard" element={
              <ProtectedRoute requiredRole="employer">
                <PageTransition>
                  <EmployerDashboard />
                </PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/job-details/:id" element={
              <ProtectedRoute>
                <PageTransition>
                  <JobDetails />
                </PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/job-details" element={
              <ProtectedRoute>
                <PageTransition>
                  <JobDetails />
                </PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/job-search-results" element={
              <ProtectedRoute>
                <PageTransition>
                  <JobSearchResults />
                </PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/application-tracking" element={
              <ProtectedRoute>
                <PageTransition>
                  <ApplicationTracking />
                </PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <PageTransition>
                  <Profile />
                </PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/create-job" element={
              <ProtectedRoute requiredRole="employer">
                <PageTransition>
                  <JobPosting />
                </PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/candidates" element={
              <ProtectedRoute requiredRole="employer">
                <PageTransition>
                  <CandidateBrowsing />
                </PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/candidate/:id" element={
              <ProtectedRoute requiredRole="employer">
                <PageTransition>
                  <CandidateDetails />
                </PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/company/:id" element={
              <ProtectedRoute>
                <PageTransition>
                  <CompanyDetails />
                </PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/saved-jobs" element={
              <ProtectedRoute requiredRole="job_seeker">
                <PageTransition>
                  <SavedJobs />
                </PageTransition>
              </ProtectedRoute>
            } />
            
            <Route path="*" element={
              <PageTransition>
                <NotFound />
              </PageTransition>
            } />
          </RouterRoutes>
        </ErrorBoundary>
      </AuthProvider>
      <SpeedInsights />
    </BrowserRouter>
  );
};

export default Routes;