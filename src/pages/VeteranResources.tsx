import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import {
  Shield,
  Star,
  ExternalLink,
  Building,
  Users,
  Award,
  FileText,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  Briefcase,
  Heart,
  Flag,
  Gavel,
  TrendingUp,
  Globe,
  Truck,
  Home,
  GraduationCap,
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Download
} from 'lucide-react';

// Types
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

interface VeteranResource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: 'benefits' | 'healthcare' | 'education' | 'employment' | 'business' | 'housing' | 'legal';
  targetAudience: 'veteran' | 'spouse' | 'business-owner' | 'all';
  state?: string;
  lastUpdated: string;
}

interface VeteranBenefit {
  id: string;
  name: string;
  description: string;
  eligibility: string[];
  applicationProcess: string;
  contactInfo: string;
  amount?: string;
  deadline?: string;
  active: boolean;
}

interface GovernmentContract {
  id: string;
  title: string;
  agency: string;
  description: string;
  value: string;
  bidDeadline: string;
  location: string;
  requirements: string[];
  setAside: 'VOSB' | 'SDVOSB' | 'SBA' | 'Open' | 'Other';
  url: string;
}

export default function VeteranResources() {
  const { toast } = useToast();
  
  // State management
  const [veteranProfiles, setVeteranProfiles] = useState<VeteranProfile[]>([]);
  const [resources, setResources] = useState<VeteranResource[]>([]);
  const [benefits, setBenefits] = useState<VeteranBenefit[]>([]);
  const [contracts, setContracts] = useState<GovernmentContract[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<VeteranProfile | null>(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Load initial data
  useEffect(() => {
    loadVeteranData();
  }, []);

  const loadVeteranData = () => {
    // Mock data - in production, this would come from API
    setVeteranProfiles([
      {
        id: '1',
        employeeId: 'EMP001',
        branch: 'Army',
        rank: 'Staff Sergeant',
        serviceYears: '2010-2018',
        honorableDischarge: true,
        disabilityRating: 30,
        specializations: ['Heavy Equipment', 'Leadership', 'Logistics'],
        securityClearance: 'Secret',
        veteranOwnedBusiness: false,
        contactInfo: {
          vaId: 'VA123456789',
          emergencyContact: 'John Doe (555) 123-4567',
          preferredVaCenter: 'Richmond VA Medical Center'
        }
      }
    ]);

    setResources([
      {
        id: '1',
        title: 'VA.gov - Official VA Website',
        description: 'Access all VA benefits, healthcare, and services',
        url: 'https://www.va.gov',
        category: 'benefits',
        targetAudience: 'all',
        lastUpdated: '2024-01-15'
      },
      {
        id: '2',
        title: 'Virginia Department of Veterans Services',
        description: 'State-specific veteran resources and benefits',
        url: 'https://www.dvs.virginia.gov',
        category: 'benefits',
        targetAudience: 'all',
        state: 'Virginia',
        lastUpdated: '2024-01-10'
      },
      {
        id: '3',
        title: 'SBA Veteran Business Programs',
        description: 'Small Business Administration veteran entrepreneur programs',
        url: 'https://www.sba.gov/funding-programs/loans/microloans/veteran-programs',
        category: 'business',
        targetAudience: 'business-owner',
        lastUpdated: '2024-01-12'
      },
      {
        id: '4',
        title: 'VOSB/SDVOSB Certification',
        description: 'Veteran-Owned Small Business certification process',
        url: 'https://www.va.gov/osdbu/verification/',
        category: 'business',
        targetAudience: 'business-owner',
        lastUpdated: '2024-01-08'
      },
      {
        id: '5',
        title: 'Federal Business Opportunities',
        description: 'Government contracting opportunities for veteran businesses',
        url: 'https://sam.gov/content/opportunities',
        category: 'business',
        targetAudience: 'business-owner',
        lastUpdated: '2024-01-14'
      },
      {
        id: '6',
        title: 'Virginia eVA Procurement Portal',
        description: 'State procurement opportunities and vendor registration',
        url: 'https://eva.virginia.gov',
        category: 'business',
        targetAudience: 'business-owner',
        state: 'Virginia',
        lastUpdated: '2024-01-11'
      }
    ]);

    setBenefits([
      {
        id: '1',
        name: 'VA Healthcare',
        description: 'Comprehensive healthcare services for eligible veterans',
        eligibility: ['Honorable discharge', 'Service-connected disability', 'Low income'],
        applicationProcess: 'Apply online at VA.gov or visit local VA medical center',
        contactInfo: '1-877-222-VETS (8387)',
        active: true
      },
      {
        id: '2',
        name: 'GI Bill Education Benefits',
        description: 'Education and training benefits for veterans and dependents',
        eligibility: ['Active duty service', 'Honorable discharge', '90+ days of service'],
        applicationProcess: 'Apply online through VA.gov education portal',
        contactInfo: '1-888-442-4551',
        amount: 'Up to $26,000+ per year',
        active: true
      },
      {
        id: '3',
        name: 'VA Home Loan Guarantee',
        description: 'Home loan guarantees for eligible veterans',
        eligibility: ['Minimum service requirements', 'Honorable discharge', 'Credit requirements'],
        applicationProcess: 'Obtain Certificate of Eligibility, find approved lender',
        contactInfo: '1-877-827-3702',
        active: true
      }
    ]);

    setContracts([
      {
        id: '1',
        title: 'Road Maintenance Services - District 7',
        agency: 'Virginia Department of Transportation',
        description: 'Asphalt repair and maintenance services for interstate highways',
        value: '$2.5M - $5M',
        bidDeadline: '2024-02-15',
        location: 'Central Virginia',
        requirements: ['VDOT Prequalification', 'Bonding Capacity', 'Safety Record'],
        setAside: 'VOSB',
        url: 'https://eva.virginia.gov/solicitation/12345'
      },
      {
        id: '2',
        title: 'Parking Lot Rehabilitation',
        agency: 'U.S. General Services Administration',
        description: 'Federal building parking lot resurfacing and maintenance',
        value: '$500K - $1M',
        bidDeadline: '2024-02-28',
        location: 'Richmond, VA',
        requirements: ['GSA Schedule', 'Security Clearance', 'OSHA Compliance'],
        setAside: 'SDVOSB',
        url: 'https://sam.gov/opportunity/federal-parking-rehab'
      }
    ]);
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || resource.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const VeteranBadge = ({ profile }: { profile: VeteranProfile }) => (
    <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1">
      <Flag className="h-3 w-3" />
      Veteran - {profile.branch}
    </Badge>
  );

  const DisabilityBadge = ({ rating }: { rating: number }) => (
    <Badge variant="secondary" className="flex items-center gap-1">
      <Heart className="h-3 w-3" />
      {rating}% Service-Connected
    </Badge>
  );

  const ResourceCard = ({ resource }: { resource: VeteranResource }) => (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {resource.category === 'benefits' && <Star className="h-4 w-4 text-yellow-500" />}
              {resource.category === 'healthcare' && <Heart className="h-4 w-4 text-red-500" />}
              {resource.category === 'education' && <GraduationCap className="h-4 w-4 text-blue-500" />}
              {resource.category === 'employment' && <Briefcase className="h-4 w-4 text-green-500" />}
              {resource.category === 'business' && <Building className="h-4 w-4 text-purple-500" />}
              {resource.category === 'housing' && <Home className="h-4 w-4 text-orange-500" />}
              {resource.category === 'legal' && <Gavel className="h-4 w-4 text-gray-500" />}
              {resource.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{resource.category}</Badge>
              <Badge variant="secondary">{resource.targetAudience}</Badge>
              {resource.state && <Badge variant="outline">{resource.state}</Badge>}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(resource.url, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Updated: {new Date(resource.lastUpdated).toLocaleDateString()}
          </span>
          <Button
            size="sm"
            onClick={() => window.open(resource.url, '_blank')}
          >
            Visit Resource
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const BenefitCard = ({ benefit }: { benefit: VeteranBenefit }) => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-500" />
          {benefit.name}
          {benefit.amount && <Badge variant="secondary">{benefit.amount}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{benefit.description}</p>
        
        <div>
          <h4 className="font-semibold text-sm mb-2">Eligibility Requirements:</h4>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            {benefit.eligibility.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-sm mb-2">How to Apply:</h4>
          <p className="text-sm text-muted-foreground">{benefit.applicationProcess}</p>
        </div>
        
        <div className="flex items-center gap-2 pt-2 border-t">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{benefit.contactInfo}</span>
        </div>
        
        {benefit.deadline && (
          <div className="flex items-center gap-2 text-orange-600">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">Deadline: {benefit.deadline}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const ContractCard = ({ contract }: { contract: GovernmentContract }) => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-500" />
            {contract.title}
          </span>
          <Badge 
            variant={contract.setAside === 'VOSB' || contract.setAside === 'SDVOSB' ? 'default' : 'secondary'}
          >
            {contract.setAside}
          </Badge>
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Building className="h-3 w-3" />
            {contract.agency}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {contract.location}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{contract.description}</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm mb-1">Contract Value</h4>
            <p className="text-lg font-bold text-green-600">{contract.value}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1">Bid Deadline</h4>
            <p className="text-sm text-orange-600 font-medium">{contract.bidDeadline}</p>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-sm mb-2">Requirements:</h4>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            {contract.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
        
        <Button
          className="w-full"
          onClick={() => window.open(contract.url, '_blank')}
        >
          View Opportunity
          <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Veteran Resources & Support
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive support for veterans and veteran-owned businesses
          </p>
        </div>
        <Button onClick={() => setIsProfileDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Veteran Profile
        </Button>
      </div>

      {/* Veteran Profiles Summary */}
      {veteranProfiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Company Veterans ({veteranProfiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {veteranProfiles.map((profile) => (
                <Card key={profile.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Employee {profile.employeeId}</span>
                    </div>
                    <VeteranBadge profile={profile} />
                  </div>
                  <div className="space-y-1 text-sm">
                    <p><strong>Branch:</strong> {profile.branch}</p>
                    <p><strong>Rank:</strong> {profile.rank}</p>
                    <p><strong>Service:</strong> {profile.serviceYears}</p>
                    {profile.disabilityRating && (
                      <div className="mt-2">
                        <DisabilityBadge rating={profile.disabilityRating} />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="business">Business Support</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  VA Healthcare
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">Access comprehensive healthcare services through the VA system.</p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open('https://www.va.gov/health-care/', '_blank')}
                >
                  Learn More
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-500" />
                  Education Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">Use GI Bill benefits for education and training programs.</p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open('https://www.va.gov/education/', '_blank')}
                >
                  Apply Now
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-purple-500" />
                  Business Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">Explore government contracting and VOSB certification.</p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setActiveTab('business')}
                >
                  View Opportunities
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => window.open('https://www.va.gov', '_blank')}
                >
                  <Globe className="h-6 w-6" />
                  VA.gov Portal
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => window.open('https://www.ebenefits.va.gov', '_blank')}
                >
                  <Star className="h-6 w-6" />
                  eBenefits
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => window.open('https://www.myhealth.va.gov', '_blank')}
                >
                  <Heart className="h-6 w-6" />
                  MyHealtheVet
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => window.open('https://www.sba.gov/funding-programs/loans/microloans/veteran-programs', '_blank')}
                >
                  <DollarSign className="h-6 w-6" />
                  SBA Veterans
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="benefits">Benefits</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="employment">Employment</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="housing">Housing</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Resources Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {benefits.map((benefit) => (
              <BenefitCard key={benefit.id} benefit={benefit} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Government Contracting Opportunities
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Set-aside contracts and opportunities for veteran-owned businesses
              </p>
            </CardHeader>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {contracts.map((contract) => (
              <ContractCard key={contract.id} contract={contract} />
            ))}
          </div>

          {/* Additional Contracting Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Contracting Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-semibold">Federal Opportunities</h4>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => window.open('https://sam.gov', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      SAM.gov - Federal Contracting
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => window.open('https://www.gsa.gov/buying-selling/products-services/security-protection/security-detection-equipment/threat-detection-equipment/schedule-84-vehicles-and-related-items', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      GSA Schedules
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Virginia State Opportunities</h4>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => window.open('https://eva.virginia.gov', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      eVA - Virginia Procurement
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => window.open('https://www.virginiadot.org/business/bu-contractors.asp', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      VDOT Contracting
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Veteran-Owned Business Support
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Resources and programs specifically for veteran entrepreneurs
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-3">Certification Programs</h4>
                  <div className="space-y-3">
                    <Card className="p-4">
                      <h5 className="font-medium mb-2">VOSB Certification</h5>
                      <p className="text-sm text-muted-foreground mb-3">
                        Veteran-Owned Small Business certification for federal contracting
                      </p>
                      <Button
                        size="sm"
                        onClick={() => window.open('https://www.va.gov/osdbu/verification/', '_blank')}
                      >
                        Apply Now
                      </Button>
                    </Card>
                    <Card className="p-4">
                      <h5 className="font-medium mb-2">SDVOSB Certification</h5>
                      <p className="text-sm text-muted-foreground mb-3">
                        Service-Disabled Veteran-Owned Small Business certification
                      </p>
                      <Button
                        size="sm"
                        onClick={() => window.open('https://www.va.gov/osdbu/verification/', '_blank')}
                      >
                        Learn More
                      </Button>
                    </Card>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Funding & Support</h4>
                  <div className="space-y-3">
                    <Card className="p-4">
                      <h5 className="font-medium mb-2">SBA Veteran Loans</h5>
                      <p className="text-sm text-muted-foreground mb-3">
                        Special loan programs for veteran entrepreneurs
                      </p>
                      <Button
                        size="sm"
                        onClick={() => window.open('https://www.sba.gov/funding-programs/loans/microloans/veteran-programs', '_blank')}
                      >
                        View Programs
                      </Button>
                    </Card>
                    <Card className="p-4">
                      <h5 className="font-medium mb-2">SCORE Mentorship</h5>
                      <p className="text-sm text-muted-foreground mb-3">
                        Free business mentoring for veteran entrepreneurs
                      </p>
                      <Button
                        size="sm"
                        onClick={() => window.open('https://www.score.org/find-mentor', '_blank')}
                      >
                        Find Mentor
                      </Button>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Essential Business Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => window.open('https://www.sba.gov/business-guide/plan-your-business/write-your-business-plan', '_blank')}
                >
                  <FileText className="h-6 w-6" />
                  Business Planning
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => window.open('https://www.irs.gov/businesses', '_blank')}
                >
                  <CreditCard className="h-6 w-6" />
                  Tax Information
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => window.open('https://www.sba.gov/business-guide/manage-your-business/stay-legally-compliant', '_blank')}
                >
                  <Gavel className="h-6 w-6" />
                  Legal Compliance
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Veteran Profile Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Veteran Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input id="employeeId" placeholder="EMP001" />
              </div>
              <div>
                <Label htmlFor="branch">Service Branch</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="army">Army</SelectItem>
                    <SelectItem value="navy">Navy</SelectItem>
                    <SelectItem value="airforce">Air Force</SelectItem>
                    <SelectItem value="marines">Marines</SelectItem>
                    <SelectItem value="coastguard">Coast Guard</SelectItem>
                    <SelectItem value="spacefource">Space Force</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rank">Rank</Label>
                <Input id="rank" placeholder="Staff Sergeant" />
              </div>
              <div>
                <Label htmlFor="serviceYears">Service Years</Label>
                <Input id="serviceYears" placeholder="2010-2018" />
              </div>
            </div>
            <div>
              <Label htmlFor="specializations">Specializations</Label>
              <Input id="specializations" placeholder="Heavy Equipment, Leadership, Logistics" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast({ title: "Success", description: "Veteran profile added successfully" });
                setIsProfileDialogOpen(false);
              }}>
                Add Profile
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}