// LandingPage.tsx - Complete single-file landing page with white background

import { useState, useEffect } from "react";
import { 
  Menu, 
  X, 
  Cloud, 
  ArrowRight, 
  Play, 
  DollarSign, 
  Shield, 
  Server, 
  TrendingUp, 
  Lock, 
  Zap,
  Plug,
  Brain,
  Lightbulb,
  Star,
  Github,
  Twitter,
  Linkedin,
  Mail,
  CheckCircle
} from "lucide-react";

const LandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Features data
  const features = [
    {
      icon: DollarSign,
      title: "Smart Cost Analytics",
      description:
        "Track spending patterns, identify waste, and get AI recommendations to reduce cloud bills by up to 40%",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Shield,
      title: "Security Scanner",
      description:
        "Detect exposed resources, IAM risks, and compliance issues before they become problems",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Server,
      title: "Complete Visibility",
      description:
        "See all your AWS resources in one place with low-level tracking and idle resource detection",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: TrendingUp,
      title: "Cost Forecasting",
      description:
        "Predict future spending with AI-powered forecasts and proactive budget alerts",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Lock,
      title: "Compliance Ready",
      description:
        "Meet SOC2, HIPAA, and GDPR requirements with automated compliance checks",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: Zap,
      title: "Real-time Alerts",
      description:
        "Get instant notifications for cost spikes, security threats, and resource changes",
      color: "from-yellow-500 to-orange-500",
    },
  ];

  // How it works steps
  const steps = [
    {
      icon: Plug,
      title: "Connect AWS Account",
      description: "One-click IAM role setup with least-privilege permissions",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Brain,
      title: "AI Scans Resources",
      description: "Our AI analyzes your infrastructure for cost and security issues",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Lightbulb,
      title: "Get Recommendations",
      description: "Receive actionable insights and save money instantly",
      color: "from-green-500 to-emerald-500",
    },
  ];

  // Testimonials data
  const testimonials = [
    {
      quote:
        "We reduced our AWS bill by 35% within the first month. The AI recommendations saved us thousands instantly.",
      name: "Sarah Chen",
      role: "CTO, TechStart",
      rating: 5,
    },
    {
      quote:
        "The security scanner found critical IAM issues we didn't know existed. This tool is a must-have for any AWS user.",
      name: "Michael Rodriguez",
      role: "DevOps Lead, CloudScale",
      rating: 5,
    },
    {
      quote:
        "Finally a tool that shows you exactly what's wasting money and tells you how to fix it. Game changer!",
      name: "Emily Johnson",
      role: "FinOps Manager, DataFlow",
      rating: 5,
    },
  ];

  // Stats with counters
  const StatCounter = ({ target, label, icon: Icon }: { target: number; label: string; icon: any }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let start = 0;
      const duration = 2000;
      const step = target / (duration / 16);

      const timer = setInterval(() => {
        start += step;
        if (start >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }, [target]);

    const formatValue = (value: number) => {
      if (target >= 1000000) return `$${(value / 1000000).toFixed(1)}M+`;
      if (target >= 1000) return `${(value / 1000).toFixed(1)}K+`;
      return `${value}+`;
    };

    return (
      <div className="text-center p-6 rounded-2xl bg-gray-50 border border-gray-200 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <p className="text-4xl font-bold text-gray-900 mb-2">{formatValue(count)}</p>
        <p className="text-gray-600">{label}</p>
      </div>
    );
  };

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      {/* Navbar */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm" : "bg-white border-b border-gray-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer">
              <Cloud className="w-8 h-8 text-purple-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                CloudOptima
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-gray-900 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-gray-900 transition-colors">
                How It Works
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-gray-900 transition-colors">
                Pricing
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">
                Documentation
              </a>
              <a
                href="/auth/login"
                className="px-4 py-2 border border-purple-500 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
              >
                Sign In
              </a>
              <a
                href="/auth/register"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-all"
              >
                Get Started
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-700 hover:text-gray-900"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-4">
                <a href="#features" className="text-gray-700 hover:text-gray-900 transition-colors py-2">
                  Features
                </a>
                <a href="#how-it-works" className="text-gray-700 hover:text-gray-900 transition-colors py-2">
                  How It Works
                </a>
                <a href="#pricing" className="text-gray-700 hover:text-gray-900 transition-colors py-2">
                  Pricing
                </a>
                <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors py-2">
                  Documentation
                </a>
                <div className="flex flex-col gap-3 pt-2">
                  <a
                    href="/auth/login"
                    className="text-center px-4 py-2 border border-purple-500 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    Sign In
                  </a>
                  <a
                    href="/auth/register"
                    className="text-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-all"
                  >
                    Get Started
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 mb-6">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
            <span className="text-sm text-purple-700 font-medium">AI-Powered Cloud Management</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-purple-800 to-pink-700 bg-clip-text text-transparent">
            Take Control of Your Cloud Costs
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            AI-powered AWS cost optimization, security monitoring, and resource management — all in one platform
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all text-lg shadow-lg"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </a>
            <button className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all text-lg text-gray-700">
              <Play className="w-5 h-5" />
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">$2M+</p>
              <p className="text-sm text-gray-600">Cloud Cost Saved</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">10K+</p>
              <p className="text-sm text-gray-600">Resources Monitored</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">99.9%</p>
              <p className="text-sm text-gray-600">Uptime</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">24/7</p>
              <p className="text-sm text-gray-600">Security Monitoring</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Everything you need to manage your cloud
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Powerful features to help you optimize costs, secure your infrastructure,
              and gain complete visibility
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all hover:scale-105"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section with Counters */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCounter target={2500000} label="Cloud Cost Saved" icon={TrendingUp} />
            <StatCounter target={10500} label="Resources Monitored" icon={Server} />
            <StatCounter target={150} label="Security Threats Blocked" icon={Shield} />
            <StatCounter target={8760} label="Hours Monitored" icon={Zap} />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get started in minutes with our simple three-step process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold z-10">
                  {index + 1}
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-gradient-to-r from-purple-300 to-pink-300 -translate-y-1/2" />
                )}

                <div className="pt-8 p-6 rounded-2xl bg-white border border-gray-200 shadow-sm text-center">
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center mx-auto mb-4`}
                  >
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Loved by engineers worldwide
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See what our customers are saying about CloudOptima
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all"
              >
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>

                {/* Author */}
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Badge */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 mb-4">Trusted by innovative companies worldwide</p>
            <div className="flex flex-wrap justify-center gap-8 opacity-70">
              <span className="text-xl font-semibold text-gray-600">TechStart</span>
              <span className="text-xl font-semibold text-gray-600">CloudScale</span>
              <span className="text-xl font-semibold text-gray-600">DataFlow</span>
              <span className="text-xl font-semibold text-gray-600">InnovateLabs</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Ready to optimize your cloud costs?
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Join thousands of companies saving money with CloudOptima
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all text-lg shadow-lg"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-purple-500 text-purple-700 rounded-xl font-semibold hover:bg-purple-50 transition-all text-lg"
            >
              Sign In
            </a>
          </div>
          <p className="text-sm text-gray-600 mt-6">No credit card required. Free for 14 days.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Cloud className="w-8 h-8 text-purple-600" />
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  CloudOptima
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                AI-powered cloud cost optimization and security platform
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2024 CloudOptima. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;