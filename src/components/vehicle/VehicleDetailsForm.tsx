import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Truck,
  Wrench,
  FileText,
  Camera,
  Shield,
  Droplets,
  Gauge,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { sanitizeString, validateInput, vehicleDetailsSchema, rateLimiter, logSecurityEvent } from '../../lib/security';

interface VehicleDetailsProps {
  vehicleId: string;
  onSave?: (data: any) => void;
}

export function VehicleDetailsForm({ vehicleId, onSave }: VehicleDetailsProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [vehicleDetails, setVehicleDetails] = useState({
    // Vehicle Info
    vin: '',
    licensePlate: '',
    registrationNumber: '',
    registrationExpiry: '',
    insurancePolicyNumber: '',
    insuranceCompany: '',
    insuranceExpiry: '',

    // Engine & Fluids
    engineType: '',
    oilType: '',
    oilCapacityQuarts: '',
    oilFilterPartNumber: '',
    transmissionFluidType: '',
    transmissionCapacityQuarts: '',
    brakeFluidType: '',
    coolantType: '',
    coolantCapacityQuarts: '',

    // Tires
    frontTireSize: '',
    rearTireSize: '',
    tirePressureFront: '',
    tirePressureRear: '',

    // Service
    lastOilChangeDate: '',
    lastOilChangeMileage: '',
    nextOilChangeDueMileage: '',
    oilChangeIntervalMiles: '3000',
  });

  const [maintenanceRecord, setMaintenanceRecord] = useState({
    maintenanceType: '',
    description: '',
    cost: '',
    odometerReading: '',
    partsUsed: '',
    fluidsAdded: '',
    notes: '',
  });

  const [inspectionData, setInspectionData] = useState({
    inspectionType: 'daily',
    overallCondition: 'good',
    engineCondition: '',
    brakeCondition: '',
    tireCondition: '',
    lightsCondition: '',
    safetyEquipmentCheck: false,
    emergencyKitCheck: false,
    fireExtinguisherCheck: false,
    firstAidKitCheck: false,
    issuesFound: '',
    recommendations: '',
    passed: true,
  });

  const handleSaveDetails = () => {
    // Rate limiting check
    if (!rateLimiter.isAllowed('save_vehicle_details', 5, 300000)) {
      console.error('Rate limit exceeded for vehicle details save');
      logSecurityEvent({
        type: 'rate_limit',
        severity: 'medium',
        action: 'vehicle_details_save_rate_limit_exceeded',
        metadata: { action: 'save_vehicle_details' },
      });
      return;
    }

    // Validate and sanitize vehicle data
    const validation = validateInput(vehicleDetailsSchema, vehicleDetails);
    if (!validation.success) {
      console.error('Vehicle details validation failed:', validation.errors);
      logSecurityEvent({
        type: 'input_validation',
        severity: 'medium',
        action: 'invalid_vehicle_details_data',
        metadata: { errors: validation.errors },
      });
      return;
    }

    // Sanitize input data
    const sanitizedVehicleDetails = {
      ...vehicleDetails,
      vin: sanitizeString(vehicleDetails.vin),
      licensePlate: sanitizeString(vehicleDetails.licensePlate),
      registrationNumber: sanitizeString(vehicleDetails.registrationNumber),
      insurancePolicyNumber: sanitizeString(vehicleDetails.insurancePolicyNumber),
      insuranceCompany: sanitizeString(vehicleDetails.insuranceCompany),
      engineType: sanitizeString(vehicleDetails.engineType),
    };

    logSecurityEvent({
      type: 'data_access',
      severity: 'low',
      action: 'vehicle_details_saved',
      metadata: { vehicleId: vehicleId },
    });

    onSave?.(sanitizedVehicleDetails);
  };

  const handleAddMaintenance = () => {
    // Add maintenance record logic
    console.log('Adding maintenance record:', maintenanceRecord);
  };

  const handleSubmitInspection = () => {
    // Submit inspection logic
    console.log('Submitting inspection:', inspectionData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Vehicle Management</h2>
          <p className="text-muted-foreground">
            Complete vehicle details, maintenance, and inspection records
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Vehicle ID: {vehicleId}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="details" className="gap-2">
            <Truck className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="fluids" className="gap-2">
            <Droplets className="h-4 w-4" />
            Fluids & Service
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="gap-2">
            <Wrench className="h-4 w-4" />
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="inspection" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Inspection
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
        </TabsList>

        {/* Vehicle Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
              <CardDescription>Basic vehicle identification and registration details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="vin">VIN Number</Label>
                  <Input
                    id="vin"
                    value={vehicleDetails.vin}
                    onChange={(e) => { setVehicleDetails({ ...vehicleDetails, vin: sanitizeString(e.target.value) }); }}
                    placeholder="Enter VIN number"
                    maxLength={17}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licensePlate">License Plate</Label>
                  <Input
                    id="licensePlate"
                    value={vehicleDetails.licensePlate}
                    onChange={(e) => { setVehicleDetails({ ...vehicleDetails, licensePlate: sanitizeString(e.target.value) }); }}
                    placeholder="Enter license plate"
                    maxLength={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    value={vehicleDetails.registrationNumber}
                    onChange={(e) => { setVehicleDetails({ ...vehicleDetails, registrationNumber: e.target.value }); }}
                    placeholder="Enter registration number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationExpiry">Registration Expiry</Label>
                  <Input
                    id="registrationExpiry"
                    type="date"
                    value={vehicleDetails.registrationExpiry}
                    onChange={(e) => { setVehicleDetails({ ...vehicleDetails, registrationExpiry: e.target.value }); }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Insurance Information</CardTitle>
              <CardDescription>Vehicle insurance and coverage details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="insuranceCompany">Insurance Company</Label>
                  <Input
                    id="insuranceCompany"
                    value={vehicleDetails.insuranceCompany}
                    onChange={(e) => { setVehicleDetails({ ...vehicleDetails, insuranceCompany: e.target.value }); }}
                    placeholder="Enter insurance company"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
                  <Input
                    id="insurancePolicyNumber"
                    value={vehicleDetails.insurancePolicyNumber}
                    onChange={(e) => { setVehicleDetails({ ...vehicleDetails, insurancePolicyNumber: e.target.value }); }}
                    placeholder="Enter policy number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceExpiry">Insurance Expiry</Label>
                  <Input
                    id="insuranceExpiry"
                    type="date"
                    value={vehicleDetails.insuranceExpiry}
                    onChange={(e) => { setVehicleDetails({ ...vehicleDetails, insuranceExpiry: e.target.value }); }}
                  />
                </div>
              </div>
              <Button onClick={handleSaveDetails} className="w-full">
                Save Vehicle Details
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fluids & Service Tab */}
        <TabsContent value="fluids" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Engine Specifications</CardTitle>
              <CardDescription>Engine type and fluid specifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="engineType">Engine Type</Label>
                  <Input
                    id="engineType"
                    value={vehicleDetails.engineType}
                    onChange={(e) => { setVehicleDetails({ ...vehicleDetails, engineType: e.target.value }); }}
                    placeholder="e.g., 6.7L Cummins Diesel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oilType">Oil Type</Label>
                  <Select
                    value={vehicleDetails.oilType}
                    onValueChange={(value) => { setVehicleDetails({ ...vehicleDetails, oilType: value }); }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select oil type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15w40">15W-40 Diesel</SelectItem>
                      <SelectItem value="5w30">5W-30 Synthetic</SelectItem>
                      <SelectItem value="10w30">10W-30 Conventional</SelectItem>
                      <SelectItem value="0w20">0W-20 Full Synthetic</SelectItem>
                      <SelectItem value="5w20">5W-20 Synthetic Blend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oilCapacityQuarts">Oil Capacity (Quarts)</Label>
                  <Input
                    id="oilCapacityQuarts"
                    type="number"
                    step="0.1"
                    value={vehicleDetails.oilCapacityQuarts}
                    onChange={(e) => { setVehicleDetails({ ...vehicleDetails, oilCapacityQuarts: e.target.value }); }}
                    placeholder="e.g., 12.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oilFilterPartNumber">Oil Filter Part Number</Label>
                  <Input
                    id="oilFilterPartNumber"
                    value={vehicleDetails.oilFilterPartNumber}
                    onChange={(e) => { setVehicleDetails({ ...vehicleDetails, oilFilterPartNumber: e.target.value }); }}
                    placeholder="e.g., PH8170"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transmission & Brake Fluids</CardTitle>
              <CardDescription>Transmission and brake system fluid specifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="transmissionFluidType">Transmission Fluid Type</Label>
                  <Select
                    value={vehicleDetails.transmissionFluidType}
                    onValueChange={(value) => { setVehicleDetails({ ...vehicleDetails, transmissionFluidType: value }); }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select transmission fluid" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dexron6">Dexron VI</SelectItem>
                      <SelectItem value="merconlv">Mercon LV</SelectItem>
                      <SelectItem value="atf4">ATF+4</SelectItem>
                      <SelectItem value="manual">Manual Transmission Fluid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transmissionCapacityQuarts">Transmission Capacity (Quarts)</Label>
                  <Input
                    id="transmissionCapacityQuarts"
                    type="number"
                    step="0.1"
                    value={vehicleDetails.transmissionCapacityQuarts}
                    onChange={(e) => { setVehicleDetails({ ...vehicleDetails, transmissionCapacityQuarts: e.target.value }); }}
                    placeholder="e.g., 8.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brakeFluidType">Brake Fluid Type</Label>
                  <Select
                    value={vehicleDetails.brakeFluidType}
                    onValueChange={(value) => { setVehicleDetails({ ...vehicleDetails, brakeFluidType: value }); }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select brake fluid" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dot3">DOT 3</SelectItem>
                      <SelectItem value="dot4">DOT 4</SelectItem>
                      <SelectItem value="dot5">DOT 5</SelectItem>
                      <SelectItem value="dot51">DOT 5.1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coolantType">Coolant Type</Label>
                  <Input
                    id="coolantType"
                    value={vehicleDetails.coolantType}
                    onChange={(e) => { setVehicleDetails({ ...vehicleDetails, coolantType: e.target.value }); }}
                    placeholder="e.g., Extended Life Coolant"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tire Information</CardTitle>
              <CardDescription>Tire sizes and pressure specifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="frontTireSize">Front Tire Size</Label>
                  <Input
                    id="frontTireSize"
                    value={vehicleDetails.frontTireSize}
                    onChange={(e) => { setVehicleDetails({ ...vehicleDetails, frontTireSize: e.target.value }); }}
                    placeholder="e.g., 275/70R22.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rearTireSize">Rear Tire Size</Label>
                  <Input
                    id="rearTireSize"
                    value={vehicleDetails.rearTireSize}
                    onChange={(e) => { setVehicleDetails({ ...vehicleDetails, rearTireSize: e.target.value }); }}
                    placeholder="e.g., 11R22.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tirePressureFront">Front Tire Pressure (PSI)</Label>
                  <Input
                    id="tirePressureFront"
                    type="number"
                    value={vehicleDetails.tirePressureFront}
                    onChange={(e) => { setVehicleDetails({ ...vehicleDetails, tirePressureFront: e.target.value }); }}
                    placeholder="e.g., 110"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tirePressureRear">Rear Tire Pressure (PSI)</Label>
                  <Input
                    id="tirePressureRear"
                    type="number"
                    value={vehicleDetails.tirePressureRear}
                    onChange={(e) => { setVehicleDetails({ ...vehicleDetails, tirePressureRear: e.target.value }); }}
                    placeholder="e.g., 105"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Schedule</CardTitle>
              <CardDescription>Oil change and maintenance intervals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lastOilChangeDate">Last Oil Change Date</Label>
                  <Input
                    id="lastOilChangeDate"
                    type="date"
                    value={vehicleDetails.lastOilChangeDate}
                    onChange={(e) => { setVehicleDetails({ ...vehicleDetails, lastOilChangeDate: e.target.value }); }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastOilChangeMileage">Last Oil Change Mileage</Label>
                  <Input
                    id="lastOilChangeMileage"
                    type="number"
                    value={vehicleDetails.lastOilChangeMileage}
                    onChange={(e) => { setVehicleDetails({ ...vehicleDetails, lastOilChangeMileage: e.target.value }); }}
                    placeholder="e.g., 145820"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oilChangeIntervalMiles">Oil Change Interval (Miles)</Label>
                  <Select
                    value={vehicleDetails.oilChangeIntervalMiles}
                    onValueChange={(value) => { setVehicleDetails({ ...vehicleDetails, oilChangeIntervalMiles: value }); }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3000">3,000 miles</SelectItem>
                      <SelectItem value="5000">5,000 miles</SelectItem>
                      <SelectItem value="7500">7,500 miles</SelectItem>
                      <SelectItem value="10000">10,000 miles</SelectItem>
                      <SelectItem value="15000">15,000 miles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextOilChangeDueMileage">Next Oil Change Due</Label>
                  <Input
                    id="nextOilChangeDueMileage"
                    type="number"
                    value={vehicleDetails.nextOilChangeDueMileage}
                    onChange={(e) => { setVehicleDetails({ ...vehicleDetails, nextOilChangeDueMileage: e.target.value }); }}
                    placeholder="Auto-calculated"
                    disabled
                  />
                </div>
              </div>
              <Button onClick={handleSaveDetails} className="w-full">
                <Droplets className="h-4 w-4 mr-2" />
                Save Fluid Specifications
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Maintenance Record</CardTitle>
              <CardDescription>Record new maintenance or repair work</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maintenanceType">Maintenance Type</Label>
                  <Select
                    value={maintenanceRecord.maintenanceType}
                    onValueChange={(value) => { setMaintenanceRecord({ ...maintenanceRecord, maintenanceType: value }); }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select maintenance type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oil_change">Oil Change</SelectItem>
                      <SelectItem value="tire_rotation">Tire Rotation</SelectItem>
                      <SelectItem value="brake_service">Brake Service</SelectItem>
                      <SelectItem value="transmission_service">Transmission Service</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="preventive">Preventive Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={maintenanceRecord.cost}
                    onChange={(e) => { setMaintenanceRecord({ ...maintenanceRecord, cost: e.target.value }); }}
                    placeholder="Enter cost"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="odometerReading">Odometer Reading</Label>
                  <Input
                    id="odometerReading"
                    type="number"
                    value={maintenanceRecord.odometerReading}
                    onChange={(e) => { setMaintenanceRecord({ ...maintenanceRecord, odometerReading: e.target.value }); }}
                    placeholder="Current mileage"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partsUsed">Parts Used</Label>
                  <Input
                    id="partsUsed"
                    value={maintenanceRecord.partsUsed}
                    onChange={(e) => { setMaintenanceRecord({ ...maintenanceRecord, partsUsed: e.target.value }); }}
                    placeholder="e.g., Oil filter, Air filter"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={maintenanceRecord.description}
                  onChange={(e) => { setMaintenanceRecord({ ...maintenanceRecord, description: e.target.value }); }}
                  placeholder="Describe the maintenance work performed"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={maintenanceRecord.notes}
                  onChange={(e) => { setMaintenanceRecord({ ...maintenanceRecord, notes: e.target.value }); }}
                  placeholder="Additional notes or observations"
                  rows={2}
                />
              </div>
              <Button onClick={handleAddMaintenance} className="w-full">
                <Wrench className="h-4 w-4 mr-2" />
                Add Maintenance Record
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inspection Tab */}
        <TabsContent value="inspection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Inspection</CardTitle>
              <CardDescription>Conduct and record vehicle safety inspection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="inspectionType">Inspection Type</Label>
                  <Select
                    value={inspectionData.inspectionType}
                    onValueChange={(value) => { setInspectionData({ ...inspectionData, inspectionType: value }); }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily Check</SelectItem>
                      <SelectItem value="weekly">Weekly Inspection</SelectItem>
                      <SelectItem value="monthly">Monthly Inspection</SelectItem>
                      <SelectItem value="annual">Annual Inspection</SelectItem>
                      <SelectItem value="pre_trip">Pre-Trip Inspection</SelectItem>
                      <SelectItem value="post_trip">Post-Trip Inspection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overallCondition">Overall Condition</Label>
                  <Select
                    value={inspectionData.overallCondition}
                    onValueChange={(value) => { setInspectionData({ ...inspectionData, overallCondition: value }); }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                      <SelectItem value="unsafe">Unsafe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Safety Equipment Checks</Label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={inspectionData.safetyEquipmentCheck}
                          onChange={(e) => { setInspectionData({ ...inspectionData, safetyEquipmentCheck: e.target.checked }); }}
                        />
                        <span className="text-sm">Safety Equipment Present</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={inspectionData.emergencyKitCheck}
                          onChange={(e) => { setInspectionData({ ...inspectionData, emergencyKitCheck: e.target.checked }); }}
                        />
                        <span className="text-sm">Emergency Kit Complete</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={inspectionData.fireExtinguisherCheck}
                          onChange={(e) => { setInspectionData({ ...inspectionData, fireExtinguisherCheck: e.target.checked }); }}
                        />
                        <span className="text-sm">Fire Extinguisher Ready</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={inspectionData.firstAidKitCheck}
                          onChange={(e) => { setInspectionData({ ...inspectionData, firstAidKitCheck: e.target.checked }); }}
                        />
                        <span className="text-sm">First Aid Kit Stocked</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Component Conditions</Label>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="engineCondition" className="text-sm">Engine</Label>
                        <Input
                          id="engineCondition"
                          value={inspectionData.engineCondition}
                          onChange={(e) => { setInspectionData({ ...inspectionData, engineCondition: e.target.value }); }}
                          placeholder="Engine condition notes"
                        />
                      </div>
                      <div>
                        <Label htmlFor="brakeCondition" className="text-sm">Brakes</Label>
                        <Input
                          id="brakeCondition"
                          value={inspectionData.brakeCondition}
                          onChange={(e) => { setInspectionData({ ...inspectionData, brakeCondition: e.target.value }); }}
                          placeholder="Brake condition notes"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tireCondition" className="text-sm">Tires</Label>
                        <Input
                          id="tireCondition"
                          value={inspectionData.tireCondition}
                          onChange={(e) => { setInspectionData({ ...inspectionData, tireCondition: e.target.value }); }}
                          placeholder="Tire condition notes"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issuesFound">Issues Found</Label>
                  <Textarea
                    id="issuesFound"
                    value={inspectionData.issuesFound}
                    onChange={(e) => { setInspectionData({ ...inspectionData, issuesFound: e.target.value }); }}
                    placeholder="List any issues or concerns found during inspection"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recommendations">Recommendations</Label>
                  <Textarea
                    id="recommendations"
                    value={inspectionData.recommendations}
                    onChange={(e) => { setInspectionData({ ...inspectionData, recommendations: e.target.value }); }}
                    placeholder="Recommended actions or follow-up needed"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="passed"
                    checked={inspectionData.passed}
                    onChange={(e) => { setInspectionData({ ...inspectionData, passed: e.target.checked }); }}
                  />
                  <Label htmlFor="passed">Vehicle Passed Inspection</Label>
                </div>
              </div>

              <Button
                onClick={handleSubmitInspection}
                className={`w-full ${inspectionData.passed ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {inspectionData.passed ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Passed Inspection
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Submit Failed Inspection
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Documents</CardTitle>
              <CardDescription>Upload and manage vehicle-related documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Registration</h4>
                      <p className="text-sm text-muted-foreground">Vehicle registration document</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-3">
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Registration
                  </Button>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-green-600" />
                    <div>
                      <h4 className="font-medium">Insurance Card</h4>
                      <p className="text-sm text-muted-foreground">Current insurance certificate</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-3">
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Insurance
                  </Button>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <Wrench className="h-8 w-8 text-orange-600" />
                    <div>
                      <h4 className="font-medium">Maintenance Records</h4>
                      <p className="text-sm text-muted-foreground">Service history documents</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-3">
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Records
                  </Button>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <Gauge className="h-8 w-8 text-purple-600" />
                    <div>
                      <h4 className="font-medium">Inspection Certificate</h4>
                      <p className="text-sm text-muted-foreground">Current inspection certificate</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-3">
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Inspection
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