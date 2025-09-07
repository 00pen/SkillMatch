import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RoleAdaptiveNavbar from '../components/ui/RoleAdaptiveNavbar';
import Button from '../components/ui/Button';
import Icon from '../components/AppIcon';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect authenticated users to appropriate dashboard
  useEffect(() => {
    if (user) {
      const userProfile = user.user_metadata;
      const dashboardRoute = userProfile?.role === 'job-seeker' 
        ? '/job-seeker-dashboard' 
        : '/employer-dashboard';
      navigate(dashboardRoute);
    }
  }, [user, navigate]);

  const features = [
    {
      icon: 'Target',
      title: 'Smart Job Matching',
      description: 'Our AI-powered algorithm matches you with the perfect opportunities based on your skills and preferences.'
    },
    {
      icon: 'Users',
      title: 'Connect with Top Companies',
      description: 'Access exclusive job opportunities from leading companies across various industries.'
    },
    {
      icon: 'TrendingUp',
      title: 'Career Growth Insights',
      description: 'Get personalized recommendations and market insights to accelerate your career growth.'
    },
    {
      icon: 'Shield',
      title: 'Trusted Platform',
      description: 'Join thousands of professionals who trust SkillMatch for their career advancement.'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Active Jobs' },
    { number: '5,000+', label: 'Companies' },
    { number: '50,000+', label: 'Job Seekers' },
    { number: '95%', label: 'Success Rate' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <RoleAdaptiveNavbar />
      
      {/* Hero Section */}
      <section className="pt-16 pb-20 bg-gradient-to-br from-background via-background to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center shadow-lg">
                <Icon name="Zap" size={40} color="white" />
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
              Find Your Perfect
              <span className="text-secondary block mt-2">Career Match</span>
            </h1>
            
            <p className="text-xl text-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
              SkillMatch connects talented professionals with their dream jobs through intelligent matching, 
              personalized recommendations, and direct access to top employers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                variant="default"
                size="lg"
                onClick={() => navigate('/register')}
                iconName="UserPlus"
                iconPosition="left"
                className="min-w-48"
              >
                Get Started Free
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/job-search-results')}
                iconName="Search"
                iconPosition="left"
                className="min-w-48"
              >
                Browse Jobs
              </Button>
            </div>
            
            <p className="text-sm text-text-secondary">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/login')}
                className="text-secondary hover:underline font-medium"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-secondary mb-2">
                  {stat.number}
                </div>
                <div className="text-text-secondary font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4">
              Why Choose SkillMatch?
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              We're more than just a job board. We're your career advancement partner.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                  <Icon name={feature.icon} size={32} className="text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-secondary/10 via-secondary/5 to-secondary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            Join thousands of professionals who have found their perfect match through SkillMatch.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="default"
              size="lg"
              onClick={() => navigate('/register')}
              iconName="Rocket"
              iconPosition="left"
              className="min-w-48"
            >
              Start Your Journey
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              onClick={() => navigate('/login')}
              iconName="LogIn"
              iconPosition="left"
              className="min-w-48"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                  <Icon name="Zap" size={20} color="white" />
                </div>
                <span className="text-xl font-bold text-text-primary">SkillMatch</span>
              </div>
              <p className="text-text-secondary mb-4">
                Connecting talent with opportunity through intelligent matching and personalized career guidance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-text-primary mb-4">For Job Seekers</h4>
              <ul className="space-y-2 text-text-secondary">
                <li><button onClick={() => navigate('/register')} className="hover:text-secondary">Create Profile</button></li>
                <li><button onClick={() => navigate('/job-search-results')} className="hover:text-secondary">Browse Jobs</button></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-secondary">Track Applications</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-text-primary mb-4">For Employers</h4>
              <ul className="space-y-2 text-text-secondary">
                <li><button onClick={() => navigate('/register')} className="hover:text-secondary">Post Jobs</button></li>
                <li><button onClick={() => navigate('/register')} className="hover:text-secondary">Find Talent</button></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-secondary">Manage Hiring</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-text-secondary">
            <p>&copy; 2025 SkillMatch. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;