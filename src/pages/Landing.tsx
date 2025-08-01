import { useState, useEffect } from 'react';
import { ArrowRight, PlayCircle, Star, Shield, Zap, MapPin, BarChart3, Calendar, Truck, Calculator, Cloud, CheckCircle, Quote } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

const AnimatedCounter = ({ end, duration = 2000, prefix = '', suffix = '' }: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

const CinematicLanding = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Smart Scheduling",
      description: "Weather-aware scheduling with automated crew dispatch and real-time updates."
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "GPS Fleet Tracking",
      description: "Real-time vehicle and crew location monitoring with route optimization."
    },
    {
      icon: <Calculator className="h-6 w-6" />,
      title: "Material Calculator",
      description: "Precise asphalt quantity calculations with cost estimation and mix design."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Business Analytics",
      description: "Comprehensive reporting with profit analysis and performance metrics."
    },
    {
      icon: <Truck className="h-6 w-6" />,
      title: "Equipment Management",
      description: "Asset tracking with maintenance scheduling and fuel monitoring."
    },
    {
      icon: <Cloud className="h-6 w-6" />,
      title: "Weather Integration",
      description: "Real-time weather monitoring for optimal paving conditions."
    }
  ];

  const testimonials = [
    {
      name: "Mike Patterson",
      company: "Patterson Paving LLC",
      role: "Owner",
      content: "PaveMaster Suite transformed our operations. We've increased efficiency by 40% and our church parking lot projects are now our most profitable.",
      rating: 5
    },
    {
      name: "Sarah Mitchell",
      company: "Heritage Sealcoating",
      role: "Operations Manager",
      content: "The GPS tracking and scheduling features alone have saved us thousands in fuel costs and reduced our response times significantly.",
      rating: 5
    },
    {
      name: "David Rodriguez",
      company: "Cornerstone Asphalt",
      role: "Project Manager",
      content: "Finally, a system built specifically for our industry. The church-focused features are exactly what we needed.",
      rating: 5
    }
  ];

  const stats = [
    { number: 150, suffix: "+", label: "Features" },
    { number: 40, suffix: "%", label: "Efficiency Increase" },
    { number: 99.9, suffix: "%", label: "Uptime" },
    { number: 500, suffix: "+", label: "Projects Managed" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className={`space-y-8 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
              <div className="space-y-4">
                <Badge variant="secondary" className="text-sm font-medium">
                  <Zap className="h-3 w-3 mr-1" />
                  Industry-Leading Platform
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    Master Your
                  </span>
                  <br />
                  Paving Business
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  The complete solution for asphalt paving and sealing contractors. 
                  Specialized for church parking lots, built for professional excellence.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-primary hover:scale-105 transition-transform">
                  <PlayCircle className="h-5 w-5 mr-2" />
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button variant="outline" size="lg" className="hover:bg-accent">
                  Watch Demo
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-success" />
                  <span className="text-sm font-medium">Enterprise Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-sm font-medium">99.9% Uptime</span>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className={`relative ${isVisible ? 'animate-scale-in animation-delay-300' : 'opacity-0'}`}>
              <div className="relative bg-card rounded-2xl shadow-2xl p-8 border">
                <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground rounded-full p-3">
                  <BarChart3 className="h-6 w-6" />
                </div>
                
                {/* Mock Dashboard */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Today's Overview</h3>
                    <Badge variant="secondary">Live</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-accent/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-primary">
                        <AnimatedCounter end={16} />
                      </div>
                      <div className="text-sm text-muted-foreground">Active Crews</div>
                    </div>
                    <div className="bg-accent/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-success">
                        $<AnimatedCounter end={125} suffix="K" />
                      </div>
                      <div className="text-sm text-muted-foreground">Revenue MTD</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Project Completion</span>
                      <span className="text-sm font-medium">87%</span>
                    </div>
                    <div className="w-full bg-accent rounded-full h-2">
                      <div className="bg-gradient-primary h-2 rounded-full animate-pulse-glow" style={{ width: '87%' }} />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -bottom-6 -left-6 bg-warning text-warning-foreground rounded-lg p-3 shadow-lg animate-bounce-soft">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="absolute -top-6 left-1/2 bg-success text-success-foreground rounded-lg p-3 shadow-lg animate-bounce-soft animation-delay-500">
                <MapPin className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-accent/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="text-3xl lg:text-4xl font-bold text-primary">
                  <AnimatedCounter end={stat.number} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="text-sm">
              Complete Solution
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold">
              Everything You Need to
              <span className="bg-gradient-primary bg-clip-text text-transparent"> Excel</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From project planning to completion, PaveMaster Suite provides all the tools 
              your asphalt business needs to thrive.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="space-y-4">
                  <div className="inline-flex p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Church Focus Section */}
      <section className="py-24 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary">Church Specialist</Badge>
                <h2 className="text-3xl lg:text-4xl font-bold">
                  Built for Church
                  <span className="bg-gradient-primary bg-clip-text text-transparent"> Parking Lots</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  We understand the unique challenges of church parking lot projects. 
                  From maximizing parking spaces to working around services, 
                  PaveMaster Suite is tailored for your success.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Parking Space Optimization</h4>
                    <p className="text-sm text-muted-foreground">Maximize capacity with intelligent layout planning</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Service Schedule Integration</h4>
                    <p className="text-sm text-muted-foreground">Plan around church activities and events</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Community Communication</h4>
                    <p className="text-sm text-muted-foreground">Keep congregations informed throughout the project</p>
                  </div>
                </div>
              </div>

              <Button className="bg-gradient-primary">
                Learn More About Church Solutions
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <div className="relative">
              <div className="bg-card rounded-2xl shadow-xl p-8 border">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">St. Mark's Lutheran Church</h3>
                    <Badge variant="secondary">In Progress</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Area:</span>
                      <div className="font-medium">12,500 sq ft</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Parking Spaces:</span>
                      <div className="font-medium">78 spaces</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Start Date:</span>
                      <div className="font-medium">March 15</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Completion:</span>
                      <div className="font-medium">March 22</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">65%</span>
                    </div>
                    <div className="w-full bg-accent rounded-full h-2">
                      <div className="bg-gradient-primary h-2 rounded-full" style={{ width: '65%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">
              What Our <span className="bg-gradient-primary bg-clip-text text-transparent">Customers</span> Say
            </h2>
            <p className="text-lg text-muted-foreground">
              Join hundreds of contractors who trust PaveMaster Suite
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <Quote className="h-6 w-6 text-muted-foreground" />
                <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                <div className="border-t pt-4">
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  <div className="text-sm text-primary font-medium">{testimonial.company}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8 text-primary-foreground">
            <h2 className="text-3xl lg:text-5xl font-bold">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl opacity-90">
              Join the leading contractors who trust PaveMaster Suite to grow their business.
              Start your free trial today and see the difference.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="hover:scale-105 transition-transform">
                <PlayCircle className="h-5 w-5 mr-2" />
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                Schedule Demo
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 pt-8 text-sm opacity-75">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>30-Day Free Trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold">PaveMaster Suite</h3>
              <p className="text-sm text-muted-foreground">
                The complete solution for asphalt paving and sealing contractors.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Product</h4>
              <div className="space-y-2 text-sm">
                <div><a href="#" className="text-muted-foreground hover:text-foreground">Features</a></div>
                <div><a href="#" className="text-muted-foreground hover:text-foreground">Pricing</a></div>
                <div><a href="#" className="text-muted-foreground hover:text-foreground">Mobile App</a></div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Company</h4>
              <div className="space-y-2 text-sm">
                <div><a href="#" className="text-muted-foreground hover:text-foreground">About</a></div>
                <div><a href="#" className="text-muted-foreground hover:text-foreground">Contact</a></div>
                <div><a href="#" className="text-muted-foreground hover:text-foreground">Support</a></div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Legal</h4>
              <div className="space-y-2 text-sm">
                <div><a href="#" className="text-muted-foreground hover:text-foreground">Privacy</a></div>
                <div><a href="#" className="text-muted-foreground hover:text-foreground">Terms</a></div>
                <div><a href="#" className="text-muted-foreground hover:text-foreground">Security</a></div>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 PaveMaster Suite. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CinematicLanding;