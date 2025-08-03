import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { SealcoatCalculator } from "@/components/calculators/SealcoatCalculator";
import { StripingCalculator } from "@/components/calculators/StripingCalculator";
import { MaterialEstimator } from "@/components/calculators/MaterialEstimator";
import { RegulationsGuide } from "@/components/regulations/RegulationsGuide";
import { ProjectDashboard } from "@/components/dashboard/ProjectDashboard";
import { AsphaltGuardian } from "@/components/guardian/AsphaltGuardian";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Shield, BarChart3, FileText, Settings, MapPin } from "lucide-react";

const IntegratedDashboard = () => {
  const [currentSection, setCurrentSection] = useState("home");

  const renderSection = () => {
    switch (currentSection) {
      case "sealcoat-calc":
        return <SealcoatCalculator />;
      case "striping-calc":
        return <StripingCalculator />;
      case "material-calc":
        return <MaterialEstimator />;
      case "regulations":
        return <RegulationsGuide />;
      case "dashboard":
        return <ProjectDashboard />;
      case "guardian":
        return <AsphaltGuardian />;
      case "quality":
        return <AsphaltGuardian />;
      case "compliance":
        return <AsphaltGuardian />;
      case "inspections":
        return <AsphaltGuardian />;
      case "cost-calc":
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Advanced Cost Calculator</h1>
            <p className="text-muted-foreground mb-6">
              Comprehensive cost analysis tool integrating material costs, labor rates, and equipment expenses.
            </p>
            <Card>
              <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>
                  This feature is currently being developed and will include:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Real-time material pricing integration</li>
                  <li>Regional cost adjustments</li>
                  <li>Labor rate calculations</li>
                  <li>Equipment cost optimization</li>
                  <li>Profit margin analysis</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        );
      case "scheduler":
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Job Scheduler</h1>
            <p className="text-muted-foreground mb-6">
              Advanced scheduling system for optimal resource allocation and project management.
            </p>
            <Card>
              <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>
                  This feature will provide comprehensive job scheduling capabilities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Weather-aware scheduling</li>
                  <li>Resource conflict resolution</li>
                  <li>Crew assignment optimization</li>
                  <li>Equipment availability tracking</li>
                  <li>Client notification system</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        );
      case "equipment":
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Equipment Tracker</h1>
            <p className="text-muted-foreground mb-6">
              Comprehensive equipment management and maintenance tracking system.
            </p>
            <Card>
              <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>
                  Advanced equipment management features are in development.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Real-time equipment location tracking</li>
                  <li>Preventive maintenance scheduling</li>
                  <li>Usage analytics and optimization</li>
                  <li>Cost per hour tracking</li>
                  <li>Maintenance history and records</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        );
      case "mapping":
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Site Mapping</h1>
            <p className="text-muted-foreground mb-6">
              Interactive site mapping and measurement tools for accurate project planning.
            </p>
            <Card>
              <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>
                  Interactive mapping features are being developed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>GPS-based site mapping</li>
                  <li>Area measurement tools</li>
                  <li>Photo overlay capabilities</li>
                  <li>Project progress visualization</li>
                  <li>Integration with estimation tools</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        );
      case "materials":
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Material Database</h1>
            <p className="text-muted-foreground mb-6">
              Comprehensive material specifications and supplier management system.
            </p>
            <Card>
              <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>
                  Material database features are in development.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Material specification library</li>
                  <li>Supplier contact management</li>
                  <li>Price comparison tools</li>
                  <li>Quality ratings and reviews</li>
                  <li>Inventory tracking integration</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        );
      case "practices":
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Best Practices</h1>
            <p className="text-muted-foreground mb-6">
              Industry best practices and standard operating procedures for asphalt work.
            </p>
            <Card>
              <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>
                  Best practices documentation is being compiled.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Industry standard procedures</li>
                  <li>Safety protocols and guidelines</li>
                  <li>Quality control checklists</li>
                  <li>Troubleshooting guides</li>
                  <li>Video training materials</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        );
      case "weather":
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Weather Conditions</h1>
            <p className="text-muted-foreground mb-6">
              Real-time weather monitoring and work suitability assessment.
            </p>
            <Card>
              <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>
                  Weather monitoring features are being integrated.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Real-time weather data</li>
                  <li>Work suitability indicators</li>
                  <li>7-day project forecasts</li>
                  <li>Weather alert notifications</li>
                  <li>Historical weather data</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <div className="space-y-8">
            <HeroSection onSectionChange={setCurrentSection} />
            
            {/* Quick Access Dashboard */}
            <div className="container mx-auto px-6">
              <h2 className="text-2xl font-bold mb-6">Quick Access</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Calculators Section */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-blue-600" />
                      Calculators
                    </CardTitle>
                    <CardDescription>
                      Professional estimation tools for accurate project planning
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setCurrentSection("sealcoat-calc")}
                    >
                      Sealcoat Calculator
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setCurrentSection("striping-calc")}
                    >
                      Striping Calculator
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setCurrentSection("material-calc")}
                    >
                      Material Estimator
                    </Button>
                  </CardContent>
                </Card>

                {/* Guardian Features */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      Guardian Suite
                    </CardTitle>
                    <CardDescription>
                      Quality control and compliance management tools
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setCurrentSection("guardian")}
                    >
                      Asphalt Guardian
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setCurrentSection("quality")}
                    >
                      Quality Control
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setCurrentSection("compliance")}
                    >
                      Compliance Tracking
                    </Button>
                  </CardContent>
                </Card>

                {/* Project Management */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                      Project Management
                    </CardTitle>
                    <CardDescription>
                      Complete project oversight and management tools
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setCurrentSection("dashboard")}
                    >
                      Project Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setCurrentSection("scheduler")}
                    >
                      Job Scheduler
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setCurrentSection("equipment")}
                    >
                      Equipment Tracker
                    </Button>
                  </CardContent>
                </Card>

                {/* Regulations & Compliance */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-red-600" />
                      Regulations
                    </CardTitle>
                    <CardDescription>
                      Industry regulations and compliance guidelines
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setCurrentSection("regulations")}
                    >
                      Regulations Guide
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setCurrentSection("practices")}
                    >
                      Best Practices
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setCurrentSection("inspections")}
                    >
                      Inspection Tools
                    </Button>
                  </CardContent>
                </Card>

                {/* Site Management */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-orange-600" />
                      Site Management
                    </CardTitle>
                    <CardDescription>
                      Site mapping, measurement, and monitoring tools
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setCurrentSection("mapping")}
                    >
                      Site Mapping
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setCurrentSection("weather")}
                    >
                      Weather Conditions
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setCurrentSection("materials")}
                    >
                      Material Database
                    </Button>
                  </CardContent>
                </Card>

                {/* Advanced Tools */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-gray-600" />
                      Advanced Tools
                    </CardTitle>
                    <CardDescription>
                      Professional-grade analysis and optimization tools
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setCurrentSection("cost-calc")}
                    >
                      Cost Calculator
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setCurrentSection("analytics")}
                    >
                      Analytics Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setCurrentSection("optimization")}
                    >
                      Optimization Tools
                    </Button>
                  </CardContent>
                </Card>

              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentSection={currentSection} onSectionChange={setCurrentSection} />
      {renderSection()}
    </div>
  );
};

export default IntegratedDashboard;