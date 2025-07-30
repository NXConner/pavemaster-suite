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
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useJargon } from '@/contexts/JargonContext';
import { useToast } from '@/hooks/use-toast';
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
  Download,
  Search,
  Filter,
  Target,
  Swords,
  Crown,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  Zap,
  Clock,
  BarChart3,
  Settings,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  UserCheck,
  Medal,
  Crosshair,
  Radio,
  Compass,
  Map
} from 'lucide-react';

// Enhanced types with military optimization
interface EnhancedVeteranProfile {
  id: string;
  employeeId: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    emergencyContact: string;
    preferredName?: string;
  };
  militaryService: {
    branch: 'Army' | 'Navy' | 'Air Force' | 'Marines' | 'Coast Guard' | 'Space Force';
    rank: string;
    payGrade: string;
    serviceYears: string;
    honorableDischarge: boolean;
    disabilityRating?: number;
    securityClearance?: 'Confidential' | 'Secret' | 'Top Secret' | 'TS/SCI';
    deployments: number;
    combatExperience: boolean;
    awards: string[];
    mos?: string; // Military Occupational Specialty
  };
  skills: {
    specializations: string[];
    leadershipExperience: boolean;
    technicalSkills: string[];
    certifications: string[];
    languages: string[];
    equipmentExperience: string[];
  };
  preferences: {
    jargonMode: 'military' | 'civilian' | 'hybrid';
    communicationStyle: 'direct' | 'diplomatic' | 'tactical';
    workStyle: 'independent' | 'team' | 'leadership';
    stressManagement: string[];
  };
  benefits: {
    vaId?: string;
    preferredVaCenter: string;
    giStatus: 'unused' | 'partial' | 'exhausted';
    homeLoansUsed: number;
    disabilityCompensation: boolean;
    vocationalRehab: boolean;
  };
  business: {
    veteranOwnedBusiness: boolean;
    vosbCertified: boolean;
    sdvosbCertified: boolean;
    businessType?: string;
    federalContracts: boolean;
    mentorshipInterest: boolean;
  };
  support: {
    counselingServices: boolean;
    peerSupport: boolean;
    familySupport: boolean;
    careerTransition: boolean;
    financialCounseling: boolean;
  };
}

interface MilitaryContract {
  id: string;
  title: string;
  agency: string;
  description: string;
  value: string;
  bidDeadline: string;
  location: string;
  requirements: string[];
  setAside: 'VOSB' | 'SDVOSB' | 'SBA' | 'HUBZone' | 'WOSB' | 'Open';
  naicsCode: string;
  classification: 'Unclassified' | 'Confidential' | 'Secret' | 'Top Secret';
  url: string;
  matchScore?: number;
}

interface VeteranBenefit {
  id: string;
  name: string;
  category: 'healthcare' | 'education' | 'disability' | 'housing' | 'employment' | 'business';
  description: string;
  eligibility: string[];
  applicationProcess: string;
  contactInfo: string;
  amount?: string;
  deadline?: string;
  priority: 'high' | 'medium' | 'low';
  militaryTerminology?: string;
  civilianTerminology?: string;
  active: boolean;
}

export default function EnhancedVeteranResources() {
  const { state: jargonState, translateText, setJargonMode } = useJargon();
  const { toast } = useToast();
  
  // State management
  const [veteranProfiles, setVeteranProfiles] = useState<EnhancedVeteranProfile[]>([]);
  const [benefits, setBenefits] = useState<VeteranBenefit[]>([]);
  const [contracts, setContracts] = useState<MilitaryContract[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<EnhancedVeteranProfile | null>(null);
  const [activeTab, setActiveTab] = useState('command-center');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [filterClearance, setFilterClearance] = useState<string>('all');
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [showMilitaryView, setShowMilitaryView] = useState(true);

  // Load initial data
  useEffect(() => {
    loadEnhancedVeteranData();
  }, []);

  // Auto-translate content based on jargon mode
  const t = (text: string) => translateText(text);

  const loadEnhancedVeteranData = () => {
    // Enhanced mock data with military optimization
    setVeteranProfiles([
      {
        id: '1',
        employeeId: 'EMP001',
        personalInfo: {
          name: 'John "Tank" Rodriguez',
          email: 'j.rodriguez@company.com',
          phone: '(555) 123-4567',
          emergencyContact: 'Maria Rodriguez (555) 123-4568',
          preferredName: 'Tank'
        },
        militaryService: {
          branch: 'Army',
          rank: 'Staff Sergeant',
          payGrade: 'E-6',
          serviceYears: '2010-2018',
          honorableDischarge: true,
          disabilityRating: 30,
          securityClearance: 'Secret',
          deployments: 3,
          combatExperience: true,
          awards: ['Bronze Star', 'Combat Action Badge', 'Army Achievement Medal'],
          mos: '12B - Combat Engineer'
        },
        skills: {
          specializations: ['Heavy Equipment', 'Demolition', 'Leadership', 'Logistics'],
          leadershipExperience: true,
          technicalSkills: ['CAT Equipment', 'Explosives Handling', 'Route Clearance'],
          certifications: ['OSHA 30', 'CDL Class A', 'Hazmat'],
          languages: ['English', 'Spanish', 'Basic Arabic'],
          equipmentExperience: ['M-ATV', 'Buffalo MRAP', 'D7 Dozer', 'Excavators']
        },
        preferences: {
          jargonMode: 'military',
          communicationStyle: 'direct',
          workStyle: 'leadership',
          stressManagement: ['Physical Exercise', 'Team Activities', 'Clear Objectives']
        },
        benefits: {
          vaId: 'VA123456789',
          preferredVaCenter: 'Richmond VA Medical Center',
          giStatus: 'partial',
          homeLoansUsed: 1,
          disabilityCompensation: true,
          vocationalRehab: false
        },
        business: {
          veteranOwnedBusiness: false,
          vosbCertified: false,
          sdvosbCertified: false,
          federalContracts: false,
          mentorshipInterest: true
        },
        support: {
          counselingServices: false,
          peerSupport: true,
          familySupport: true,
          careerTransition: true,
          financialCounseling: false
        }
      },
      {
        id: '2',
        employeeId: 'EMP002',
        personalInfo: {
          name: 'Sarah "Doc" Williams',
          email: 's.williams@company.com',
          phone: '(555) 234-5678',
          emergencyContact: 'Michael Williams (555) 234-5679',
          preferredName: 'Doc'
        },
        militaryService: {
          branch: 'Navy',
          rank: 'Hospital Corpsman Second Class',
          payGrade: 'E-5',
          serviceYears: '2012-2020',
          honorableDischarge: true,
          disabilityRating: 0,
          securityClearance: 'Confidential',
          deployments: 2,
          combatExperience: false,
          awards: ['Navy Achievement Medal', 'Good Conduct Medal'],
          mos: 'HM - Hospital Corpsman'
        },
        skills: {
          specializations: ['Emergency Medicine', 'Field Medicine', 'Training'],
          leadershipExperience: true,
          technicalSkills: ['EMT', 'Combat Medic', 'Medical Equipment'],
          certifications: ['EMT-P', 'CPR Instructor', 'TCCC'],
          languages: ['English', 'French'],
          equipmentExperience: ['Medical Equipment', 'Field Ambulance']
        },
        preferences: {
          jargonMode: 'hybrid',
          communicationStyle: 'diplomatic',
          workStyle: 'team',
          stressManagement: ['Mindfulness', 'Medical Training', 'Helping Others']
        },
        benefits: {
          vaId: 'VA987654321',
          preferredVaCenter: 'Norfolk VA Medical Center',
          giStatus: 'unused',
          homeLoansUsed: 0,
          disabilityCompensation: false,
          vocationalRehab: true
        },
        business: {
          veteranOwnedBusiness: true,
          vosbCertified: true,
          sdvosbCertified: false,
          businessType: 'Medical Consulting',
          federalContracts: true,
          mentorshipInterest: true
        },
        support: {
          counselingServices: true,
          peerSupport: true,
          familySupport: false,
          careerTransition: false,
          financialCounseling: true
        }
      }
    ]);

    setBenefits([
      {
        id: '1',
        name: 'VA Healthcare',
        category: 'healthcare',
        description: 'Comprehensive healthcare services for eligible veterans',
        eligibility: ['Honorable discharge', 'Service-connected disability', 'Low income'],
        applicationProcess: 'Apply online at VA.gov or visit local VA medical center',
        contactInfo: '1-877-222-VETS (8387)',
        priority: 'high',
        militaryTerminology: 'Medical readiness maintenance',
        civilianTerminology: 'Healthcare benefits',
        active: true
      },
      {
        id: '2',
        name: 'GI Bill Education Benefits',
        category: 'education',
        description: 'Education and training benefits for veterans and dependents',
        eligibility: ['Active duty service', 'Honorable discharge', '90+ days of service'],
        applicationProcess: 'Apply online through VA.gov education portal',
        contactInfo: '1-888-442-4551',
        amount: 'Up to $26,000+ per year',
        priority: 'high',
        militaryTerminology: 'Training advancement program',
        civilianTerminology: 'Education funding',
        active: true
      },
      {
        id: '3',
        name: 'VA Home Loan Guarantee',
        category: 'housing',
        description: 'Home loan guarantees for eligible veterans',
        eligibility: ['Minimum service requirements', 'Honorable discharge', 'Credit requirements'],
        applicationProcess: 'Obtain Certificate of Eligibility, find approved lender',
        contactInfo: '1-877-827-3702',
        priority: 'medium',
        militaryTerminology: 'Housing acquisition support',
        civilianTerminology: 'Home buying assistance',
        active: true
      }
    ]);

    setContracts([
      {
        id: '1',
        title: 'Combat Engineering Support Services',
        agency: 'U.S. Army Corps of Engineers',
        description: 'Route clearance and explosive ordnance disposal support for training operations',
        value: '$5M - $10M',
        bidDeadline: '2024-03-15',
        location: 'Fort Belvoir, VA',
        requirements: ['Secret Clearance', 'Combat Engineering Experience', 'EOD Certification'],
        setAside: 'SDVOSB',
        naicsCode: '561621',
        classification: 'Secret',
        url: 'https://sam.gov/opportunity/combat-engineering-support',
        matchScore: 95
      },
      {
        id: '2',
        title: 'Medical Equipment Maintenance',
        agency: 'Department of Veterans Affairs',
        description: 'Preventive maintenance and repair of medical equipment at VA facilities',
        value: '$2M - $4M',
        bidDeadline: '2024-02-28',
        location: 'Richmond, VA',
        requirements: ['Medical Equipment Experience', 'VA Facility Access', 'Biomedical Certification'],
        setAside: 'VOSB',
        naicsCode: '811219',
        classification: 'Unclassified',
        url: 'https://sam.gov/opportunity/medical-equipment-maintenance',
        matchScore: 88
      }
    ]);
  };

  // Filter profiles based on search and filters
  const filteredProfiles = veteranProfiles.filter(profile => {
    const matchesSearch = searchQuery === '' || 
      profile.personalInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.militaryService.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.militaryService.rank.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBranch = filterBranch === 'all' || profile.militaryService.branch === filterBranch;
    const matchesClearance = filterClearance === 'all' || profile.militaryService.securityClearance === filterClearance;
    
    return matchesSearch && matchesBranch && matchesClearance;
  });

  // Get profile statistics
  const getProfileStats = () => {
    const totalProfiles = veteranProfiles.length;
    const withClearance = veteranProfiles.filter(p => p.militaryService.securityClearance).length;
    const combatVets = veteranProfiles.filter(p => p.militaryService.combatExperience).length;
    const businessOwners = veteranProfiles.filter(p => p.business.veteranOwnedBusiness).length;
    
    return { totalProfiles, withClearance, combatVets, businessOwners };
  };

  const stats = getProfileStats();

  // Render profile card with military optimization
  const VeteranProfileCard = ({ profile }: { profile: EnhancedVeteranProfile }) => (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Flag className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{profile.personalInfo.name}</h3>
              <p className="text-sm text-muted-foreground">{profile.employeeId}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Badge variant="outline" className="text-xs">
              {profile.militaryService.branch}
            </Badge>
            {profile.militaryService.securityClearance && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Lock className="h-3 w-3" />
                {profile.militaryService.securityClearance}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">{t('Rank')}:</span>
            <p>{profile.militaryService.rank}</p>
          </div>
          <div>
            <span className="font-medium">{t('Service')}:</span>
            <p>{profile.militaryService.serviceYears}</p>
          </div>
        </div>
        
        {/* Key Skills */}
        <div>
          <span className="font-medium text-sm">{t('Specializations')}:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {profile.skills.specializations.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {profile.skills.specializations.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{profile.skills.specializations.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Military Honors */}
        {profile.militaryService.awards.length > 0 && (
          <div>
            <span className="font-medium text-sm">{t('Awards')}:</span>
            <div className="flex items-center gap-1 mt-1">
              <Medal className="h-4 w-4 text-yellow-500" />
              <span className="text-xs text-muted-foreground">
                {profile.militaryService.awards.length} decorations
              </span>
            </div>
          </div>
        )}

        {/* Combat Experience & Deployments */}
        <div className="flex items-center justify-between text-xs">
          {profile.militaryService.combatExperience && (
            <Badge variant="secondary" className="gap-1">
              <Crosshair className="h-3 w-3" />
              Combat Veteran
            </Badge>
          )}
          {profile.militaryService.deployments > 0 && (
            <Badge variant="outline" className="gap-1">
              <Globe className="h-3 w-3" />
              {profile.militaryService.deployments} Deployments
            </Badge>
          )}
        </div>

        {/* Disability Rating */}
        {profile.militaryService.disabilityRating && profile.militaryService.disabilityRating > 0 && (
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium">
              {profile.militaryService.disabilityRating}% Service-Connected
            </span>
          </div>
        )}

        {/* Business Status */}
        {profile.business.veteranOwnedBusiness && (
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Veteran Business Owner</span>
            {profile.business.vosbCertified && (
              <Badge variant="outline" className="text-xs">VOSB</Badge>
            )}
            {profile.business.sdvosbCertified && (
              <Badge variant="outline" className="text-xs">SDVOSB</Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Military Command Structure */}
      <Card className="bg-gradient-to-r from-blue-50 via-white to-red-50 dark:from-blue-950 dark:via-gray-900 dark:to-red-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  {showMilitaryView ? (
                    <>
                      <Swords className="h-8 w-8 text-red-600" />
                      {t('Veteran Operations Command Center')}
                    </>
                  ) : (
                    <>
                      <Building className="h-8 w-8 text-blue-600" />
                      {t('Veteran Resources & Support')}
                    </>
                  )}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {showMilitaryView 
                    ? t('Military-grade veteran support and tactical resource management')
                    : t('Comprehensive support for veterans and veteran-owned businesses')
                  }
                </p>
              </div>
            </div>
            
            {/* Command Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">
                  {showMilitaryView ? 'Tactical View' : 'Business View'}
                </Label>
                <Switch
                  checked={showMilitaryView}
                  onCheckedChange={setShowMilitaryView}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setJargonMode(jargonState.mode === 'military' ? 'civilian' : 'military')}
                className="gap-2"
              >
                <Zap className="h-4 w-4" />
                Switch to {jargonState.mode === 'military' ? 'Civilian' : 'Military'}
              </Button>
              <Button onClick={() => setIsProfileDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add {t('Personnel')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Military Statistics Dashboard */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="text-2xl font-bold">{stats.totalProfiles}</h3>
                <p className="text-sm text-muted-foreground">{t('Total Veterans')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Lock className="h-8 w-8 text-purple-500" />
              <div>
                <h3 className="text-2xl font-bold">{stats.withClearance}</h3>
                <p className="text-sm text-muted-foreground">{t('Security Clearances')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Crosshair className="h-8 w-8 text-red-500" />
              <div>
                <h3 className="text-2xl font-bold">{stats.combatVets}</h3>
                <p className="text-sm text-muted-foreground">{t('Combat Veterans')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="text-2xl font-bold">{stats.businessOwners}</h3>
                <p className="text-sm text-muted-foreground">{t('Business Owners')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs with Military Organization */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="command-center" className="gap-2">
            <Target className="h-4 w-4" />
            {showMilitaryView ? 'Command' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="personnel" className="gap-2">
            <Users className="h-4 w-4" />
            {t('Personnel')}
          </TabsTrigger>
          <TabsTrigger value="operations" className="gap-2">
            <Briefcase className="h-4 w-4" />
            {t('Operations')}
          </TabsTrigger>
          <TabsTrigger value="intelligence" className="gap-2">
            <BookOpen className="h-4 w-4" />
            {showMilitaryView ? 'Intel' : 'Resources'}
          </TabsTrigger>
          <TabsTrigger value="logistics" className="gap-2">
            <DollarSign className="h-4 w-4" />
            {t('Benefits')}
          </TabsTrigger>
          <TabsTrigger value="tactical" className="gap-2">
            <Swords className="h-4 w-4" />
            {showMilitaryView ? 'Tactical' : 'Advanced'}
          </TabsTrigger>
        </TabsList>

        {/* Command Center Tab */}
        <TabsContent value="command-center" className="space-y-6">
          {/* Quick Action Command Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {showMilitaryView ? (
                  <>
                    <Target className="h-5 w-5 text-red-500" />
                    {t('Tactical Operations Center')}
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    {t('Resource Overview')}
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-4 bg-blue-50 dark:bg-blue-950">
                  <div className="flex items-center gap-3">
                    <Heart className="h-6 w-6 text-red-500" />
                    <div>
                      <h3 className="font-semibold">{t('Medical Support')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {showMilitaryView ? 'Medical readiness & care' : 'VA Healthcare Services'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-3"
                    onClick={() => window.open('https://www.va.gov/health-care/', '_blank')}
                  >
                    {t('Access Medical')}
                  </Button>
                </Card>

                <Card className="p-4 bg-green-50 dark:bg-green-950">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-6 w-6 text-blue-500" />
                    <div>
                      <h3 className="font-semibold">{t('Training Programs')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {showMilitaryView ? 'Skills advancement & certification' : 'Education Benefits'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-3"
                    onClick={() => window.open('https://www.va.gov/education/', '_blank')}
                  >
                    {t('Access Training')}
                  </Button>
                </Card>

                <Card className="p-4 bg-purple-50 dark:bg-purple-950">
                  <div className="flex items-center gap-3">
                    <Building className="h-6 w-6 text-purple-500" />
                    <div>
                      <h3 className="font-semibold">{t('Business Operations')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {showMilitaryView ? 'Tactical business support' : 'Entrepreneurship Support'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-3"
                    onClick={() => setActiveTab('operations')}
                  >
                    {t('View Operations')}
                  </Button>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Mission Critical Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-green-500" />
                {showMilitaryView ? t('Communications Center') : t('Quick Links')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => window.open('https://www.va.gov', '_blank')}
                >
                  <Globe className="h-6 w-6" />
                  {t('VA Command')}
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => window.open('https://www.ebenefits.va.gov', '_blank')}
                >
                  <Star className="h-6 w-6" />
                  {t('Benefits Portal')}
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => window.open('https://www.myhealth.va.gov', '_blank')}
                >
                  <Heart className="h-6 w-6" />
                  {t('Medical Systems')}
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => window.open('https://www.sba.gov/funding-programs/loans/microloans/veteran-programs', '_blank')}
                >
                  <DollarSign className="h-6 w-6" />
                  {t('Financial Support')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personnel Tab */}
        <TabsContent value="personnel" className="space-y-6">
          {/* Search and Filter Controls */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder={`${t('Search')} ${t('personnel')}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={filterBranch} onValueChange={setFilterBranch}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    <SelectItem value="Army">Army</SelectItem>
                    <SelectItem value="Navy">Navy</SelectItem>
                    <SelectItem value="Air Force">Air Force</SelectItem>
                    <SelectItem value="Marines">Marines</SelectItem>
                    <SelectItem value="Coast Guard">Coast Guard</SelectItem>
                    <SelectItem value="Space Force">Space Force</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterClearance} onValueChange={setFilterClearance}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Clearance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Confidential">Confidential</SelectItem>
                    <SelectItem value="Secret">Secret</SelectItem>
                    <SelectItem value="Top Secret">Top Secret</SelectItem>
                    <SelectItem value="TS/SCI">TS/SCI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Personnel Roster */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProfiles.map((profile) => (
              <VeteranProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                {showMilitaryView ? t('Tactical Contracts') : t('Government Contracting')}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {showMilitaryView 
                  ? t('Mission-critical contract opportunities for veteran operators')
                  : t('Set-aside contracts and opportunities for veteran-owned businesses')
                }
              </p>
            </CardHeader>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {contracts.map((contract) => (
              <Card key={contract.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-blue-500" />
                      {contract.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={contract.setAside === 'VOSB' || contract.setAside === 'SDVOSB' ? 'default' : 'secondary'}
                      >
                        {contract.setAside}
                      </Badge>
                      {contract.matchScore && contract.matchScore > 80 && (
                        <Badge variant="outline" className="gap-1">
                          <Target className="h-3 w-3" />
                          {contract.matchScore}% Match
                        </Badge>
                      )}
                    </div>
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
                    {contract.classification !== 'Unclassified' && (
                      <Badge variant="outline" className="gap-1 text-xs">
                        <Lock className="h-3 w-3" />
                        {contract.classification}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{contract.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">{t('Contract Value')}</h4>
                      <p className="text-lg font-bold text-green-600">{contract.value}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">{t('Deadline')}</h4>
                      <p className="text-sm text-orange-600 font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {contract.bidDeadline}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">{t('Requirements')}:</h4>
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
                    {showMilitaryView ? t('Execute Mission') : t('View Opportunity')}
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Intelligence/Resources Tab */}
        <TabsContent value="intelligence" className="space-y-6">
          <div className="grid gap-6">
            {benefits.map((benefit) => (
              <Card key={benefit.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    {showMilitaryView && benefit.militaryTerminology 
                      ? benefit.militaryTerminology 
                      : benefit.name
                    }
                    {benefit.amount && <Badge variant="secondary">{benefit.amount}</Badge>}
                    <Badge variant={benefit.priority === 'high' ? 'default' : 'outline'}>
                      {benefit.priority} priority
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    {showMilitaryView && benefit.militaryTerminology 
                      ? t(benefit.description)
                      : benefit.description
                    }
                  </p>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">{t('Eligibility Requirements')}:</h4>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      {benefit.eligibility.map((req, index) => (
                        <li key={index}>{t(req)}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">{t('Application Process')}:</h4>
                    <p className="text-sm text-muted-foreground">{t(benefit.applicationProcess)}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{benefit.contactInfo}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Logistics/Benefits Tab */}
        <TabsContent value="logistics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                {showMilitaryView ? t('Logistics Support Analysis') : t('Benefits Utilization')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{t('Healthcare Enrollment')}</span>
                    <span className="font-bold">85%</span>
                  </div>
                  <Progress value={85} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{t('Education Benefits Usage')}</span>
                    <span className="font-bold">62%</span>
                  </div>
                  <Progress value={62} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{t('Home Loan Utilization')}</span>
                    <span className="font-bold">43%</span>
                  </div>
                  <Progress value={43} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{t('Business Certification')}</span>
                    <span className="font-bold">28%</span>
                  </div>
                  <Progress value={28} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tactical/Advanced Tab */}
        <TabsContent value="tactical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Swords className="h-5 w-5 text-red-500" />
                {showMilitaryView ? t('Advanced Tactical Operations') : t('Advanced Features')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Compass className="h-6 w-6 text-blue-500" />
                    <h3 className="font-semibold">
                      {showMilitaryView ? t('Mission Planning') : t('Career Navigation')}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {showMilitaryView 
                      ? t('Strategic career transition planning with military precision')
                      : t('Personalized career development and transition support')
                    }
                  </p>
                  <Button variant="outline" className="w-full">
                    {t('Access Planning')}
                  </Button>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Map className="h-6 w-6 text-green-500" />
                    <h3 className="font-semibold">
                      {showMilitaryView ? t('Intelligence Network') : t('Peer Support Network')}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {showMilitaryView 
                      ? t('Classified veteran network for mission-critical support')
                      : t('Connect with fellow veterans for mutual support and mentorship')
                    }
                  </p>
                  <Button variant="outline" className="w-full">
                    {t('Join Network')}
                  </Button>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced Veteran Profile Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Enhanced {t('Veteran Profile')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Profile creation form would go here - simplified for brevity */}
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Enhanced profile creation form would be implemented here with:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• Complete military service details</li>
                <li>• Security clearance verification</li>
                <li>• Skills and specialization mapping</li>
                <li>• Benefits status tracking</li>
                <li>• Business information</li>
                <li>• Support preferences</li>
              </ul>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast({ title: "Success", description: "Enhanced veteran profile added successfully" });
                setIsProfileDialogOpen(false);
              }}>
                Add {t('Profile')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}