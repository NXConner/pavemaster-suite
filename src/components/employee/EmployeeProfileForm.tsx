import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { 
  User, 
  FileText, 
  Shield,
  Camera,
  Upload,
  Contact,
  Award,
  AlertTriangle,
  CheckCircle,
  Heart
} from "lucide-react";

interface EmployeeProfileProps {
  employeeId: string;
  onSave?: (data: any) => void;
}

export function EmployeeProfileForm({ employeeId, onSave }: EmployeeProfileProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [employeeData, setEmployeeData] = useState({
    // Basic Info
    firstName: '',
    lastName: '',
    email: '',
    phonePersonal: '',
    phoneWork: '',
    address: '',
    city: '',
    state: 'VA',
    zipCode: '',
    
    // Employment
    role: '',
    department: '',
    hireDate: '',
    employmentStatus: 'full_time',
    hourlyRate: '',
    salary: '',
    weeklyHours: '40',
    
    // Driver Info
    driverLicenseNumber: '',
    driverLicenseExpiry: '',
    driverLicenseState: 'VA',
    cdlClass: '',
    
    // Performance
    performanceScore: '',
    lastReviewDate: '',
    nextReviewDate: ''
  });

  const [emergencyContact, setEmergencyContact] = useState({
    contactName: '',
    relationship: '',
    phonePrimary: '',
    phoneSecondary: '',
    email: '',
    address: '',
    city: '',
    state: 'VA',
    zipCode: ''
  });

  const [documents] = useState([
    { type: 'drivers_license', name: 'Driver\'s License', uploaded: false, expiry: '', verified: false },
    { type: 'contract', name: 'Employment Contract', uploaded: false, expiry: '', verified: false },
    { type: 'photo_id', name: 'Photo ID', uploaded: false, expiry: '', verified: false },
    { type: 'w4', name: 'W-4 Form', uploaded: false, expiry: '', verified: false },
    { type: 'i9', name: 'I-9 Form', uploaded: false, expiry: '', verified: false }
  ]);

  const [performanceReview, setPerformanceReview] = useState({
    punctualityScore: 8,
    qualityScore: 9,
    safetyScore: 10,
    teamworkScore: 8,
    overallScore: 8.8,
    goalsSet: '',
    goalsAchieved: '',
    trainingCompleted: '',
    certificationsEarned: '',
    notes: '',
    improvementAreas: '',
    strengths: ''
  });

  const handleSaveProfile = () => {
    onSave?.({ employeeData, emergencyContact });
  };

  const handleUploadDocument = (documentType: string) => {
    console.log('Uploading document:', documentType);
    // Document upload logic would go here
  };

  const handleSubmitPerformanceReview = () => {
    console.log('Submitting performance review:', performanceReview);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src="" />
            <AvatarFallback className="text-lg">
              {employeeData.firstName?.[0]}{employeeData.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {employeeData.firstName} {employeeData.lastName} Employee Profile
            </h2>
            <p className="text-muted-foreground">
              Comprehensive employee information and document management
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          Employee ID: {employeeId}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="emergency" className="gap-2">
            <Heart className="h-4 w-4" />
            Emergency
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <Award className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="certifications" className="gap-2">
            <Shield className="h-4 w-4" />
            Certifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Basic employee contact and personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xl">
                      {employeeData.firstName?.[0]}{employeeData.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Profile Photo</h4>
                  <p className="text-sm text-muted-foreground">
                    Upload a recent photo for identification
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={employeeData.firstName}
                    onChange={(e) => setEmployeeData({...employeeData, firstName: e.target.value})}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={employeeData.lastName}
                    onChange={(e) => setEmployeeData({...employeeData, lastName: e.target.value})}
                    placeholder="Enter last name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={employeeData.email}
                    onChange={(e) => setEmployeeData({...employeeData, email: e.target.value})}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phonePersonal">Personal Phone *</Label>
                  <Input
                    id="phonePersonal"
                    type="tel"
                    value={employeeData.phonePersonal}
                    onChange={(e) => setEmployeeData({...employeeData, phonePersonal: e.target.value})}
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneWork">Work Phone</Label>
                  <Input
                    id="phoneWork"
                    type="tel"
                    value={employeeData.phoneWork}
                    onChange={(e) => setEmployeeData({...employeeData, phoneWork: e.target.value})}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Home Address *</Label>
                <Input
                  id="address"
                  value={employeeData.address}
                  onChange={(e) => setEmployeeData({...employeeData, address: e.target.value})}
                  placeholder="Enter street address"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={employeeData.city}
                    onChange={(e) => setEmployeeData({...employeeData, city: e.target.value})}
                    placeholder="Enter city"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select
                    value={employeeData.state}
                    onValueChange={(value) => setEmployeeData({...employeeData, state: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VA">Virginia</SelectItem>
                      <SelectItem value="MD">Maryland</SelectItem>
                      <SelectItem value="DC">Washington DC</SelectItem>
                      <SelectItem value="NC">North Carolina</SelectItem>
                      <SelectItem value="WV">West Virginia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={employeeData.zipCode}
                    onChange={(e) => setEmployeeData({...employeeData, zipCode: e.target.value})}
                    placeholder="12345"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Employment Information</CardTitle>
              <CardDescription>Job details and employment status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="role">Job Title *</Label>
                  <Select
                    value={employeeData.role}
                    onValueChange={(value) => setEmployeeData({...employeeData, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job title" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="foreman">Foreman</SelectItem>
                      <SelectItem value="equipment_operator">Equipment Operator</SelectItem>
                      <SelectItem value="crew_member">Crew Member</SelectItem>
                      <SelectItem value="driver">Driver</SelectItem>
                      <SelectItem value="safety_coordinator">Safety Coordinator</SelectItem>
                      <SelectItem value="administrative_assistant">Administrative Assistant</SelectItem>
                      <SelectItem value="project_manager">Project Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={employeeData.department}
                    onValueChange={(value) => setEmployeeData({...employeeData, department: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="administration">Administration</SelectItem>
                      <SelectItem value="safety">Safety</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="quality_control">Quality Control</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hireDate">Hire Date *</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={employeeData.hireDate}
                    onChange={(e) => setEmployeeData({...employeeData, hireDate: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employmentStatus">Employment Status *</Label>
                  <Select
                    value={employeeData.employmentStatus}
                    onValueChange={(value) => setEmployeeData({...employeeData, employmentStatus: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="seasonal">Seasonal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    step="0.01"
                    value={employeeData.hourlyRate}
                    onChange={(e) => setEmployeeData({...employeeData, hourlyRate: e.target.value})}
                    placeholder="25.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weeklyHours">Weekly Hours</Label>
                  <Input
                    id="weeklyHours"
                    type="number"
                    value={employeeData.weeklyHours}
                    onChange={(e) => setEmployeeData({...employeeData, weeklyHours: e.target.value})}
                    placeholder="40"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Driver Information</CardTitle>
              <CardDescription>Driver's license and CDL information (if applicable)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="driverLicenseNumber">Driver's License Number</Label>
                  <Input
                    id="driverLicenseNumber"
                    value={employeeData.driverLicenseNumber}
                    onChange={(e) => setEmployeeData({...employeeData, driverLicenseNumber: e.target.value})}
                    placeholder="Enter license number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driverLicenseState">License State</Label>
                  <Select
                    value={employeeData.driverLicenseState}
                    onValueChange={(value) => setEmployeeData({...employeeData, driverLicenseState: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VA">Virginia</SelectItem>
                      <SelectItem value="MD">Maryland</SelectItem>
                      <SelectItem value="DC">Washington DC</SelectItem>
                      <SelectItem value="NC">North Carolina</SelectItem>
                      <SelectItem value="WV">West Virginia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driverLicenseExpiry">License Expiry Date</Label>
                  <Input
                    id="driverLicenseExpiry"
                    type="date"
                    value={employeeData.driverLicenseExpiry}
                    onChange={(e) => setEmployeeData({...employeeData, driverLicenseExpiry: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cdlClass">CDL Class (if applicable)</Label>
                  <Select
                    value={employeeData.cdlClass}
                    onValueChange={(value) => setEmployeeData({...employeeData, cdlClass: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select CDL class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No CDL</SelectItem>
                      <SelectItem value="class_a">Class A</SelectItem>
                      <SelectItem value="class_b">Class B</SelectItem>
                      <SelectItem value="class_c">Class C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSaveProfile} className="w-full">
                Save Employee Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Documents</CardTitle>
              <CardDescription>Upload and manage required employee documentation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {documents.map((doc) => (
                  <Card key={doc.type} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${doc.verified ? 'bg-green-100' : 'bg-gray-100'}`}>
                          {doc.type === 'drivers_license' && <Shield className="h-5 w-5 text-blue-600" />}
                          {doc.type === 'contract' && <FileText className="h-5 w-5 text-green-600" />}
                          {doc.type === 'photo_id' && <Camera className="h-5 w-5 text-purple-600" />}
                          {(doc.type === 'w4' || doc.type === 'i9') && <FileText className="h-5 w-5 text-orange-600" />}
                        </div>
                        <div>
                          <h4 className="font-medium">{doc.name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant={doc.uploaded ? "default" : "secondary"}>
                              {doc.uploaded ? "Uploaded" : "Required"}
                            </Badge>
                            {doc.verified && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.expiry && (
                          <div className="text-right text-sm">
                            <div className="text-muted-foreground">Expires</div>
                            <div className="font-medium">{doc.expiry}</div>
                          </div>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUploadDocument(doc.type)}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {doc.uploaded ? 'Replace' : 'Upload'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="border-dashed border-2 p-6 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Upload Additional Documents</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop files here or click to browse
                </p>
                <Button variant="outline">
                  Choose Files
                </Button>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emergency Contact Tab */}
        <TabsContent value="emergency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact Information</CardTitle>
              <CardDescription>Primary emergency contact for this employee</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name *</Label>
                  <Input
                    id="contactName"
                    value={emergencyContact.contactName}
                    onChange={(e) => setEmergencyContact({...emergencyContact, contactName: e.target.value})}
                    placeholder="Enter contact name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship *</Label>
                  <Select
                    value={emergencyContact.relationship}
                    onValueChange={(value) => setEmergencyContact({...emergencyContact, relationship: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phonePrimary">Primary Phone *</Label>
                  <Input
                    id="phonePrimary"
                    type="tel"
                    value={emergencyContact.phonePrimary}
                    onChange={(e) => setEmergencyContact({...emergencyContact, phonePrimary: e.target.value})}
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneSecondary">Secondary Phone</Label>
                  <Input
                    id="phoneSecondary"
                    type="tel"
                    value={emergencyContact.phoneSecondary}
                    onChange={(e) => setEmergencyContact({...emergencyContact, phoneSecondary: e.target.value})}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyEmail">Email Address</Label>
                  <Input
                    id="emergencyEmail"
                    type="email"
                    value={emergencyContact.email}
                    onChange={(e) => setEmergencyContact({...emergencyContact, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyAddress">Address</Label>
                <Input
                  id="emergencyAddress"
                  value={emergencyContact.address}
                  onChange={(e) => setEmergencyContact({...emergencyContact, address: e.target.value})}
                  placeholder="Enter street address"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="emergencyCity">City</Label>
                  <Input
                    id="emergencyCity"
                    value={emergencyContact.city}
                    onChange={(e) => setEmergencyContact({...emergencyContact, city: e.target.value})}
                    placeholder="Enter city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyState">State</Label>
                  <Select
                    value={emergencyContact.state}
                    onValueChange={(value) => setEmergencyContact({...emergencyContact, state: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VA">Virginia</SelectItem>
                      <SelectItem value="MD">Maryland</SelectItem>
                      <SelectItem value="DC">Washington DC</SelectItem>
                      <SelectItem value="NC">North Carolina</SelectItem>
                      <SelectItem value="WV">West Virginia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyZip">ZIP Code</Label>
                  <Input
                    id="emergencyZip"
                    value={emergencyContact.zipCode}
                    onChange={(e) => setEmergencyContact({...emergencyContact, zipCode: e.target.value})}
                    placeholder="12345"
                  />
                </div>
              </div>

              <Button onClick={handleSaveProfile} className="w-full">
                <Contact className="h-4 w-4 mr-2" />
                Save Emergency Contact
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Review</CardTitle>
              <CardDescription>Employee performance evaluation and development tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Punctuality Score (1-10)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={performanceReview.punctualityScore}
                        onChange={(e) => setPerformanceReview({...performanceReview, punctualityScore: parseInt(e.target.value)})}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">
                        {performanceReview.punctualityScore >= 9 ? 'Excellent' : 
                         performanceReview.punctualityScore >= 7 ? 'Good' : 
                         performanceReview.punctualityScore >= 5 ? 'Average' : 'Needs Improvement'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Quality Score (1-10)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={performanceReview.qualityScore}
                        onChange={(e) => setPerformanceReview({...performanceReview, qualityScore: parseInt(e.target.value)})}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">
                        {performanceReview.qualityScore >= 9 ? 'Excellent' : 
                         performanceReview.qualityScore >= 7 ? 'Good' : 
                         performanceReview.qualityScore >= 5 ? 'Average' : 'Needs Improvement'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Safety Score (1-10)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={performanceReview.safetyScore}
                        onChange={(e) => setPerformanceReview({...performanceReview, safetyScore: parseInt(e.target.value)})}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">
                        {performanceReview.safetyScore >= 9 ? 'Excellent' : 
                         performanceReview.safetyScore >= 7 ? 'Good' : 
                         performanceReview.safetyScore >= 5 ? 'Average' : 'Needs Improvement'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Teamwork Score (1-10)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={performanceReview.teamworkScore}
                        onChange={(e) => setPerformanceReview({...performanceReview, teamworkScore: parseInt(e.target.value)})}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">
                        {performanceReview.teamworkScore >= 9 ? 'Excellent' : 
                         performanceReview.teamworkScore >= 7 ? 'Good' : 
                         performanceReview.teamworkScore >= 5 ? 'Average' : 'Needs Improvement'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {((performanceReview.punctualityScore + performanceReview.qualityScore + 
                       performanceReview.safetyScore + performanceReview.teamworkScore) / 4).toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Overall Performance Score</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="strengths">Strengths</Label>
                  <Textarea
                    id="strengths"
                    value={performanceReview.strengths}
                    onChange={(e) => setPerformanceReview({...performanceReview, strengths: e.target.value})}
                    placeholder="List employee strengths and positive attributes"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="improvementAreas">Areas for Improvement</Label>
                  <Textarea
                    id="improvementAreas"
                    value={performanceReview.improvementAreas}
                    onChange={(e) => setPerformanceReview({...performanceReview, improvementAreas: e.target.value})}
                    placeholder="List areas where employee can improve"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Review Notes</Label>
                  <Textarea
                    id="notes"
                    value={performanceReview.notes}
                    onChange={(e) => setPerformanceReview({...performanceReview, notes: e.target.value})}
                    placeholder="Additional notes and comments about performance"
                    rows={3}
                  />
                </div>
              </div>

              <Button onClick={handleSubmitPerformanceReview} className="w-full">
                <Award className="h-4 w-4 mr-2" />
                Submit Performance Review
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Certifications & Training</CardTitle>
              <CardDescription>Track employee certifications, training, and professional development</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="h-8 w-8 text-blue-600" />
                      <div>
                        <h4 className="font-medium">OSHA 30 Certification</h4>
                        <p className="text-sm text-muted-foreground">Construction Safety Training</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Current
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">Expires: 12/2025</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Award className="h-8 w-8 text-green-600" />
                      <div>
                        <h4 className="font-medium">VDOT Certified</h4>
                        <p className="text-sm text-muted-foreground">Virginia Department of Transportation</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Current
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">Expires: 06/2025</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Heart className="h-8 w-8 text-red-600" />
                      <div>
                        <h4 className="font-medium">First Aid/CPR</h4>
                        <p className="text-sm text-muted-foreground">Emergency Medical Response</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Expires Soon
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">Expires: 02/2025</div>
                    </div>
                  </div>
                </Card>

                <Card className="border-dashed border-2 p-6 text-center">
                  <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">Add New Certification</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload certification documents and track expiration dates
                  </p>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Add Certification
                  </Button>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}