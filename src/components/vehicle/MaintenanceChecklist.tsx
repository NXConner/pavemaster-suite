import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { FileUpload } from '../ui/drag-drop';
import { Wrench } from 'lucide-react';

export interface MaintenanceChecklistData {
  items: {
    oilChange: boolean;
    airFilter: boolean;
    cabinFilter: boolean;
    brakeService: boolean;
    tireRotation: boolean;
    tirePressure: boolean;
    fluidTopOff: boolean;
    batteryTest: boolean;
    beltsHoses: boolean;
    lightsElectrical: boolean;
    suspensionSteering: boolean;
  };
  notes: string;
  workAttachments?: File[];
  manualsAndGuides?: File[];
}

interface MaintenanceChecklistProps {
  vehicleId?: string;
  onSubmit?: (data: MaintenanceChecklistData) => void;
  onUploadFiles?: (files: File[], category: string) => Promise<void> | void;
}

export function MaintenanceChecklist({ vehicleId, onSubmit, onUploadFiles }: MaintenanceChecklistProps) {
  const [data, setData] = useState<MaintenanceChecklistData>({
    items: {
      oilChange: false,
      airFilter: false,
      cabinFilter: false,
      brakeService: false,
      tireRotation: false,
      tirePressure: false,
      fluidTopOff: false,
      batteryTest: false,
      beltsHoses: false,
      lightsElectrical: false,
      suspensionSteering: false,
    },
    notes: '',
    workAttachments: [],
    manualsAndGuides: [],
  });

  const toggle = (key: keyof MaintenanceChecklistData['items']) => {
    setData((prev) => ({
      ...prev,
      items: { ...prev.items, [key]: !prev.items[key] },
    }));
  };

  const handleSubmit = async () => {
    if (onUploadFiles) {
      if (data.workAttachments && data.workAttachments.length > 0) {
        await onUploadFiles(data.workAttachments, 'maintenance_work');
      }
      if (data.manualsAndGuides && data.manualsAndGuides.length > 0) {
        await onUploadFiles(data.manualsAndGuides, 'manuals_guides');
      }
    }
    onSubmit?.(data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Checklist</CardTitle>
          <CardDescription>Track completed maintenance tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3">
          {([
            ['oilChange', 'Oil change'],
            ['airFilter', 'Air filter replaced/cleaned'],
            ['cabinFilter', 'Cabin filter replaced'],
            ['brakeService', 'Brake inspection/service'],
            ['tireRotation', 'Tire rotation'],
            ['tirePressure', 'Set tire pressures'],
            ['fluidTopOff', 'Top off all fluids'],
            ['batteryTest', 'Battery tested/cleaned'],
            ['beltsHoses', 'Inspect belts and hoses'],
            ['lightsElectrical', 'Lights and electrical check'],
            ['suspensionSteering', 'Suspension and steering check'],
          ] as [keyof MaintenanceChecklistData['items'], string][]).map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 p-2 rounded border bg-muted/30">
              <input type="checkbox" checked={data.items[key]} onChange={() => toggle(key)} />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Work Notes & Attachments</CardTitle>
          <CardDescription>Add notes and upload photos, receipts, or parts lists</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Add maintenance notes (diagnostics, parts used, torque specs, etc.)"
            value={data.notes}
            onChange={(e) => setData((p) => ({ ...p, notes: e.target.value }))}
            rows={4}
          />
          <div>
            <Label>Photos, receipts, and parts lists</Label>
            <FileUpload
              accept="image/*,application/pdf"
              multiple
              maxFiles={15}
              maxSize={25}
              onFileSelect={(files) => setData((p) => ({ ...p, workAttachments: files }))}
            />
          </div>
          <div>
            <Label>Manuals and repair guides</Label>
            <FileUpload
              accept="application/pdf,image/*"
              multiple
              maxFiles={10}
              maxSize={50}
              onFileSelect={(files) => setData((p) => ({ ...p, manualsAndGuides: files }))}
            />
          </div>
          <Button onClick={handleSubmit} className="w-full">
            <Wrench className="h-4 w-4 mr-2" />
            Save Maintenance Checklist
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}