import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Shield,
  Truck,
  Calculator,
  MapPin,
  Users,
  BarChart,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: Shield,
      title: 'Military-Grade Security',
      description: 'Advanced security protocols protect your operational data',
    },
    {
      icon: Calculator,
      title: 'Smart Estimation',
      description: 'AI-powered calculations for accurate project estimates',
    },
    {
      icon: MapPin,
      title: 'Real-Time Tracking',
      description: 'Monitor crews and equipment with GPS precision',
    },
    {
      icon: Users,
      title: 'Crew Management',
      description: 'Efficient personnel and resource allocation',
    },
    {
      icon: BarChart,
      title: 'Analytics Dashboard',
      description: 'Comprehensive reporting and business intelligence',
    },
    {
      icon: Truck,
      title: 'Fleet Operations',
      description: 'Complete equipment and vehicle management',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">PaveMaster Suite</span>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              ISAC-OS Active
            </Badge>
            <Link to="/auth">
              <Button>Access System</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center space-y-8">
          <Badge variant="outline" className="mx-auto">
            Next-Generation Pavement Operations
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Tactical Command Center for
            <span className="text-primary block">Asphalt Operations</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Military-inspired interface designed for professional pavement contractors.
            Streamline operations, maximize efficiency, and dominate your market with
            advanced tactical tools.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="gap-2">
                Deploy System <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold">Mission-Critical Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built for contractors who demand precision, reliability, and tactical advantage
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">
                Built for Small Contractors,
                <span className="text-primary block">Engineered for Growth</span>
              </h2>

              <p className="text-muted-foreground text-lg">
                Whether you're a 2-person crew or expanding operation, PaveMaster Suite
                scales with your business while maintaining the tactical edge you need
                to outmaneuver the competition.
              </p>

              <div className="space-y-4">
                {[
                  'Reduce estimation time by 75%',
                  'Improve crew efficiency by 40%',
                  'Eliminate scheduling conflicts',
                  'Track equipment in real-time',
                  'Generate professional reports',
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <Link to="/auth">
                <Button size="lg" className="gap-2">
                  Start Mission <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="bg-muted/30 rounded-lg p-8 space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">$47,200</div>
                <p className="text-muted-foreground">Average monthly revenue increase</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">75%</div>
                  <p className="text-sm text-muted-foreground">Time Saved</p>
                </div>
                <div>
                  <div className="text-2xl font-bold">98%</div>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Deploy?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Join the ranks of professional contractors using military-grade tools
            to dominate their markets.
          </p>

          <Link to="/auth">
            <Button size="lg" variant="secondary" className="gap-2">
              Access Command Center <Shield className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 PaveMaster Suite. Military-grade solutions for professional contractors.</p>
        </div>
      </footer>
    </div>
  );
}