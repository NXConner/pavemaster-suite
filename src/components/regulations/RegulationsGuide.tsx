import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Book,
  Scale,
  Leaf,
  HardHat
} from "lucide-react"

export const RegulationsGuide = () => {
  const federalRegulations = [
    {
      title: "FHWA Standards",
      category: "Federal Highway Administration",
      description: "Guidelines for highway construction and maintenance including material specifications and quality standards.",
      compliance: "Required",
      lastUpdated: "2024"
    },
    {
      title: "EPA Environmental Standards",
      category: "Environmental Protection Agency",
      description: "Environmental regulations for construction activities, waste management, and air quality.",
      compliance: "Required",
      lastUpdated: "2023"
    },
    {
      title: "OSHA Safety Requirements",
      category: "Occupational Safety and Health",
      description: "Workplace safety standards for construction and road work operations.",
      compliance: "Required",
      lastUpdated: "2024"
    }
  ]

  const stateRegulations = [
    {
      title: "DOT Material Specifications",
      state: "California",
      description: "State-specific material standards for asphalt mixes, aggregates, and additives.",
      status: "Active"
    },
    {
      title: "Contractor Licensing",
      state: "California",
      description: "Requirements for contractor certification and bonding for public works projects.",
      status: "Active"
    },
    {
      title: "Traffic Control Standards",
      state: "California",
      description: "Work zone safety and traffic management requirements during construction.",
      status: "Active"
    }
  ]

  const technicalStandards = [
    {
      organization: "AASHTO",
      standard: "M 323",
      title: "Superpave Volumetric Mix Design",
      description: "Standard method for asphalt mix design using Superpave criteria."
    },
    {
      organization: "ASTM",
      standard: "D6926",
      title: "Standard Practice for Preparation of Bituminous Specimens",
      description: "Laboratory compaction procedures for asphalt specimens."
    },
    {
      organization: "ASTM",
      standard: "D6927",
      title: "Marshall Stability and Flow Test",
      description: "Test method for determining stability and flow of asphalt mixtures."
    },
    {
      organization: "AASHTO",
      standard: "T 283",
      title: "Moisture Susceptibility Test",
      description: "Test for resistance of compacted asphalt mixtures to moisture damage."
    }
  ]

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Book className="h-8 w-8" />
            Regulations & Compliance Guide
          </h1>
          <p className="text-muted-foreground">
            Comprehensive guide to regulatory requirements and industry standards
          </p>
        </div>
        <Badge variant="outline" className="gap-2">
          <CheckCircle className="h-3 w-3" />
          Updated 2024
        </Badge>
      </div>

      <Tabs defaultValue="federal" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="federal" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Federal
          </TabsTrigger>
          <TabsTrigger value="state" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            State/Local
          </TabsTrigger>
          <TabsTrigger value="technical" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Technical
          </TabsTrigger>
          <TabsTrigger value="environmental" className="flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            Environmental
          </TabsTrigger>
        </TabsList>

        <TabsContent value="federal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Federal Regulations
              </CardTitle>
              <CardDescription>
                Key federal requirements for asphalt and paving operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {federalRegulations.map((reg, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{reg.title}</h3>
                      <p className="text-sm text-muted-foreground">{reg.category}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-red-100 text-red-800 mb-1">
                        {reg.compliance}
                      </Badge>
                      <p className="text-xs text-muted-foreground">Updated {reg.lastUpdated}</p>
                    </div>
                  </div>
                  <p className="text-sm">{reg.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Federal regulations are mandatory for all projects involving federal funding or interstate commerce. 
              Non-compliance can result in project delays, fines, and loss of federal funding eligibility.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="state" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                State & Local Regulations
              </CardTitle>
              <CardDescription>
                State-specific requirements and local ordinances
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stateRegulations.map((reg, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{reg.title}</h3>
                      <p className="text-sm text-muted-foreground">{reg.state} Requirement</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {reg.status}
                    </Badge>
                  </div>
                  <p className="text-sm">{reg.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">California Caltrans</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  California Department of Transportation specifications and standards
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Standard Specifications</li>
                  <li>• Standard Special Provisions</li>
                  <li>• Material Testing Requirements</li>
                  <li>• Quality Assurance Programs</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Local Permits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Local jurisdiction requirements and permits
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Encroachment Permits</li>
                  <li>• Traffic Control Plans</li>
                  <li>• Noise Ordinances</li>
                  <li>• Environmental Permits</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Technical Standards
              </CardTitle>
              <CardDescription>
                Industry testing and quality standards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {technicalStandards.map((standard, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{standard.organization} {standard.standard}</h3>
                      <p className="text-sm font-medium">{standard.title}</p>
                    </div>
                    <Badge variant="outline">{standard.organization}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{standard.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AASHTO Standards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  American Association of State Highway and Transportation Officials
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Material Specifications</li>
                  <li>• Test Methods</li>
                  <li>• Design Standards</li>
                  <li>• Quality Procedures</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ASTM Standards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  American Society for Testing and Materials
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Laboratory Testing</li>
                  <li>• Material Properties</li>
                  <li>• Performance Testing</li>
                  <li>• Quality Control</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Superpave Standards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Superior Performing Asphalt Pavements
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Mix Design Methods</li>
                  <li>• Performance Grading</li>
                  <li>• Volumetric Properties</li>
                  <li>• Field Procedures</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="environmental" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                Environmental Compliance
              </CardTitle>
              <CardDescription>
                Environmental regulations and sustainability requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    EPA Requirements
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Air Quality Standards - Control dust and emissions during operations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Water Quality Protection - Prevent runoff contamination</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Waste Management - Proper disposal of materials and chemicals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Noise Control - Comply with local noise ordinances</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Leaf className="h-4 w-4" />
                    Sustainability Practices
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Recycled Content - Use RAP (Recycled Asphalt Pavement) when possible</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Energy Efficiency - Warm mix asphalt technologies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Carbon Footprint - Optimize transportation and production</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>LEED Credits - Contribute to green building certification</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Alert>
                <Leaf className="h-4 w-4" />
                <AlertDescription>
                  Environmental compliance is increasingly important. Many projects now require 
                  sustainability reporting and may prefer contractors with green certifications.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardHat className="h-5 w-5" />
                Safety & Health Regulations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-3">OSHA Requirements</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Personal Protective Equipment (PPE)</li>
                    <li>• Work Zone Traffic Control</li>
                    <li>• Equipment Safety Standards</li>
                    <li>• Hazard Communication</li>
                    <li>• Emergency Response Plans</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Industry Best Practices</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Pre-task Safety Briefings</li>
                    <li>• Equipment Inspection Protocols</li>
                    <li>• Heat Stress Prevention</li>
                    <li>• Chemical Safety Training</li>
                    <li>• Incident Reporting Procedures</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}