import { useState } from 'react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Label } from '../components/ui/label';
import { 
  Shield, 
  Award, 
  ExternalLink, 
  Phone, 
  MapPin, 
  DollarSign,
  Building,
  Users,
  Heart,
  Flag,
  Medal
} from 'lucide-react';

interface VeteranProfile {
  id: string;
  employeeId: string;
  branch: string;
  rank: string;
  serviceYears: string;
  honorableDischarge: boolean;
  disabilityRating?: number;
  specializations: string[];
  securityClearance?: string;
  veteranOwnedBusiness: boolean;
  contactInfo: {
    vaId?: string;
    emergencyContact: string;
    preferredVaCenter: string;
  };
}

const mockVeteranProfile: VeteranProfile = {
  id: "vet-001",
  employeeId: "emp-001",
  branch: "Army",
  rank: "Sergeant",
  serviceYears: "2015-2020",
  honorableDischarge: true,
  disabilityRating: 30,
  specializations: ["Heavy Equipment Operation", "Leadership", "Logistics"],
  securityClearance: "Secret",
  veteranOwnedBusiness: true,
  contactInfo: {
    vaId: "VA123456789",
    emergencyContact: "(555) 123-4567",
    preferredVaCenter: "Richmond VA Medical Center"
  }
};

const vaResources = [
  {
    title: "VA.gov",
    description: "Official VA website for benefits, healthcare, and services",
    url: "https://www.va.gov",
    category: "primary"
  },
  {
    title: "Virginia Department of Veterans Services",
    description: "State-specific veteran resources and benefits",
    url: "https://www.dvs.virginia.gov",
    category: "state"
  },
  {
    title: "VA Healthcare",
    description: "Medical care and health benefits",
    url: "https://www.va.gov/health-care",
    category: "healthcare"
  },
  {
    title: "VA Disability Compensation",
    description: "Disability ratings and compensation",
    url: "https://www.va.gov/disability",
    category: "benefits"
  },
  {
    title: "GI Bill Benefits",
    description: "Education and training benefits",
    url: "https://www.va.gov/education",
    category: "education"
  },
  {
    title: "VA Home Loans",
    description: "Home loan guaranty program",
    url: "https://www.va.gov/housing-assistance",
    category: "housing"
  }
];

const contractingOpportunities = [
  {
    title: "SBA VOSB Certification",
    description: "Veteran-Owned Small Business certification",
    status: "Available",
    value: "Set-aside contracts",
    link: "https://www.sba.gov/federal-contracting/contracting-assistance-programs/veteran-contracting-assistance-programs"
  },
  {
    title: "SDVOSB Certification", 
    description: "Service-Disabled Veteran-Owned Small Business",
    status: "Priority",
    value: "Enhanced preferences",
    link: "https://www.sba.gov/federal-contracting/contracting-assistance-programs/veteran-contracting-assistance-programs"
  },
  {
    title: "GSA Schedules",
    description: "Government-wide procurement contracts",
    status: "Active",
    value: "$75M+ annually",
    link: "https://www.gsa.gov/buying-selling/products-services/professional-services/professional-services-schedule-pss"
  },
  {
    title: "SAM.gov Registration",
    description: "System for Award Management registration",
    status: "Required",
    value: "Federal contracting eligibility",
    link: "https://sam.gov"
  }
];

const businessSupport = [
  {
    title: "SCORE Mentorship",
    description: "Free business mentoring for veteran entrepreneurs",
    icon: Users,
    link: "https://www.score.org/veterans"
  },
  {
    title: "SBA Funding Programs",
    description: "Loans and funding specifically for veteran businesses",
    icon: DollarSign,
    link: "https://www.sba.gov/funding-programs/loans/veteran-loans"
  },
  {
    title: "Veterans Business Outreach Centers",
    description: "Business development assistance and training",
    icon: Building,
    link: "https://www.sba.gov/local-assistance/resource-partners/veterans-business-outreach-centers-vboc"
  },
  {
    title: "StreetShares Foundation",
    description: "Veteran business funding and support",
    icon: Heart,
    link: "https://streetsharesfoundation.org"
  }
];

export default function VeteranResources() {
  const [activeTab, setActiveTab] = useState('overview');
  const profile = mockVeteranProfile;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <Flag className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Veteran Resources</h1>
          <p className="text-muted-foreground">
            Comprehensive support system for veteran employees and business owners
          </p>
        </div>
        <Badge variant="outline" className="ml-auto">
          <Medal className="h-3 w-3 mr-1" />
          Veteran-Owned Business
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="business">Business Support</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Veteran Profile
                </CardTitle>
                <CardDescription>Service details and current status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Branch</Label>
                    <p className="text-sm text-muted-foreground">{profile.branch}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Rank</Label>
                    <p className="text-sm text-muted-foreground">{profile.rank}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Service Years</Label>
                    <p className="text-sm text-muted-foreground">{profile.serviceYears}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Disability Rating</Label>
                    <p className="text-sm text-muted-foreground">{profile.disabilityRating}%</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Specializations</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.specializations.map((spec, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Honorable Discharge</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  VA Contact Information
                </CardTitle>
                <CardDescription>Preferred VA center and contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">VA ID</Label>
                  <p className="text-sm text-muted-foreground">{profile.contactInfo.vaId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Preferred VA Center</Label>
                  <p className="text-sm text-muted-foreground">{profile.contactInfo.preferredVaCenter}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Emergency Contact</Label>
                  <p className="text-sm text-muted-foreground">{profile.contactInfo.emergencyContact}</p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact VA Center
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vaResources.map((resource, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{resource.title}</CardTitle>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardDescription className="text-sm">{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      Visit Resource
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Benefits Tab */}
        <TabsContent value="benefits" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Healthcare Benefits</CardTitle>
                <CardDescription>VA medical care and health services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>VA Healthcare Eligibility</span>
                  <Badge variant="default">Enrolled</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Mental Health Services</span>
                  <Badge variant="default">Available</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Dental Coverage</span>
                  <Badge variant="secondary">Limited</Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Schedule Appointment
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Benefits</CardTitle>
                <CardDescription>Compensation and financial assistance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Disability Compensation</span>
                  <Badge variant="default">30% Rating</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>GI Bill Benefits</span>
                  <Badge variant="default">Available</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Home Loan Eligibility</span>
                  <Badge variant="default">Qualified</Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Check Benefits Status
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-6">
          <div className="space-y-4">
            {contractingOpportunities.map((opportunity, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                    <Badge variant={opportunity.status === 'Available' ? 'default' : 
                                 opportunity.status === 'Priority' ? 'destructive' : 'secondary'}>
                      {opportunity.status}
                    </Badge>
                  </div>
                  <CardDescription>{opportunity.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Value/Benefit</p>
                      <p className="text-sm text-muted-foreground">{opportunity.value}</p>
                    </div>
                    <Button variant="outline" asChild>
                      <a href={opportunity.link} target="_blank" rel="noopener noreferrer">
                        Learn More
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Business Support Tab */}
        <TabsContent value="business" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {businessSupport.map((support, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <support.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{support.title}</CardTitle>
                      <CardDescription className="text-sm">{support.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href={support.link} target="_blank" rel="noopener noreferrer">
                      Access Support
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Virginia-Specific Resources</CardTitle>
              <CardDescription>State resources for veteran-owned businesses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span>VA Small Business Development</span>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://www.dvs.virginia.gov/business" target="_blank" rel="noopener noreferrer">
                    Visit
                  </a>
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span>VA Procurement Technical Assistance</span>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://www.virginiaptac.org" target="_blank" rel="noopener noreferrer">
                    Visit
                  </a>
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span>VA Economic Development</span>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://www.vedp.org" target="_blank" rel="noopener noreferrer">
                    Visit
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}