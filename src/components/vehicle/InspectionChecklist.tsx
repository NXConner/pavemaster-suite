import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { FileUpload } from '../ui/drag-drop';
import { CheckCircle } from 'lucide-react';

export interface InspectionChecklistData {
  exterior: {
    windshield: boolean;
    bodyPanelColorsMatch: boolean;
    magnetAdheres: boolean;
    freshPaint: boolean;
    trunkHoodSeamsAligned: boolean;
    doorFenderSeamsAligned: boolean;
    scratchesFree: boolean;
    dentsFree: boolean;
    wipersFunctional: boolean;
    lightsFunctional: boolean;
  };
  tires: {
    reputableBrand: boolean;
    sameMake: boolean;
    noCutsBubbles: boolean;
    treadEven: boolean;
    spareEquipmentPresent: boolean;
    spareInflated: boolean;
  };
  engine: {
    noLeaks: boolean;
    fillerNeckClean: boolean;
    terminalsClean: boolean;
    oilClean: boolean;
    noOdors: boolean;
    exhaustNormal: boolean;
  };
  suspension: {
    restsLevel: boolean;
    noCreakingOnBounce: boolean;
    cornersRespondSame: boolean;
  };
  interior: {
    seatsGood: boolean;
    doorsOperate: boolean;
    trunkOperates: boolean;
    noHeavyFreshener: boolean;
    gaugesWork: boolean;
    noDashWarnings: boolean;
    stereoWorks: boolean;
    heaterWorks: boolean;
  };
  notes: string;
  attachments?: File[];
}

interface InspectionChecklistProps {
  vehicleId?: string;
  onSubmit?: (data: InspectionChecklistData) => void;
  onUploadFiles?: (files: File[], category: string) => Promise<void> | void;
}

export function InspectionChecklist({ vehicleId, onSubmit, onUploadFiles }: InspectionChecklistProps) {
  const [data, setData] = useState<InspectionChecklistData>({
    exterior: {
      windshield: false,
      bodyPanelColorsMatch: false,
      magnetAdheres: false,
      freshPaint: false,
      trunkHoodSeamsAligned: false,
      doorFenderSeamsAligned: false,
      scratchesFree: false,
      dentsFree: false,
      wipersFunctional: false,
      lightsFunctional: false,
    },
    tires: {
      reputableBrand: false,
      sameMake: false,
      noCutsBubbles: false,
      treadEven: false,
      spareEquipmentPresent: false,
      spareInflated: false,
    },
    engine: {
      noLeaks: false,
      fillerNeckClean: false,
      terminalsClean: false,
      oilClean: false,
      noOdors: false,
      exhaustNormal: false,
    },
    suspension: {
      restsLevel: false,
      noCreakingOnBounce: false,
      cornersRespondSame: false,
    },
    interior: {
      seatsGood: false,
      doorsOperate: false,
      trunkOperates: false,
      noHeavyFreshener: false,
      gaugesWork: false,
      noDashWarnings: false,
      stereoWorks: false,
      heaterWorks: false,
    },
    notes: '',
    attachments: [],
  });

  const toggle = (path: string) => {
    setData((prev) => {
      const parts = path.split('.');
      const next: any = { ...prev };
      let cursor: any = next;
      for (let i = 0; i < parts.length - 1; i += 1) {
        cursor[parts[i]] = { ...cursor[parts[i]] };
        cursor = cursor[parts[i]];
      }
      const last = parts[parts.length - 1];
      cursor[last] = !cursor[last];
      return next;
    });
  };

  const handleSubmit = async () => {
    if (onUploadFiles && data.attachments && data.attachments.length > 0) {
      await onUploadFiles(data.attachments, 'inspection_checklist');
    }
    onSubmit?.(data);
  };

  const setNotes = (notes: string) => setData((prev) => ({ ...prev, notes }));

  const setAttachments = (files: File[]) => setData((prev) => ({ ...prev, attachments: files }));

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Mark items that pass inspection</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );

  const Item = ({ id, label }: { id: string; label: string }) => (
    <label className="flex items-center gap-3 p-2 rounded border bg-muted/30">
      <input type="checkbox" checked={(data as any)[id.split('.')[0]] ? (data as any)[id.split('.')[0]][id.split('.')[1]] : false} onChange={() => toggle(id)} />
      <span className="text-sm">{label}</span>
    </label>
  );

  return (
    <div className="space-y-6">
      <Section title="Exterior">
        <div className="grid md:grid-cols-2 gap-2">
          <Item id="exterior.windshield" label="Windshield free of cracks" />
          <Item id="exterior.bodyPanelColorsMatch" label="Body panel colors match" />
          <Item id="exterior.magnetAdheres" label="Magnet adheres to all steel body panels" />
          <Item id="exterior.freshPaint" label="Fresh paint job (may conceal rust)" />
          <Item id="exterior.trunkHoodSeamsAligned" label="Trunk/hood seams properly aligned" />
          <Item id="exterior.doorFenderSeamsAligned" label="Door/fender seams properly aligned" />
          <Item id="exterior.scratchesFree" label="Free of body scratches" />
          <Item id="exterior.dentsFree" label="Free of body dents" />
          <Item id="exterior.wipersFunctional" label="Wipers and blades fully functional" />
          <Item id="exterior.lightsFunctional" label="Headlights and directionals functional" />
        </div>
      </Section>

      <Section title="Tires">
        <div className="grid md:grid-cols-2 gap-2">
          <Item id="tires.reputableBrand" label="Reputable brand (Michelin, Bridgestone, etc.)" />
          <Item id="tires.sameMake" label="All tires same make" />
          <Item id="tires.noCutsBubbles" label="No cuts, bubbles or cracks" />
          <Item id="tires.treadEven" label="Tread worn evenly" />
          <Item id="tires.spareEquipmentPresent" label="Spare, jack and lug wrench present" />
          <Item id="tires.spareInflated" label="Spare tire inflated" />
        </div>
      </Section>

      <Section title="Engine">
        <div className="grid md:grid-cols-2 gap-2">
          <Item id="engine.noLeaks" label="Free of fluid or oil leaks" />
          <Item id="engine.fillerNeckClean" label="Oil filler neck not coated with deposits" />
          <Item id="engine.terminalsClean" label="Battery terminals free of corrosion" />
          <Item id="engine.oilClean" label="Oil dipstick free of dark/black oil" />
          <Item id="engine.noOdors" label="No unusual odors while running" />
          <Item id="engine.exhaustNormal" label="Exhaust not blue or black" />
        </div>
      </Section>

      <Section title="Suspension">
        <div className="grid md:grid-cols-2 gap-2">
          <Item id="suspension.restsLevel" label="Vehicle rests level" />
          <Item id="suspension.noCreakingOnBounce" label="No creaking when bouncing corners" />
          <Item id="suspension.cornersRespondSame" label="All corners respond the same" />
        </div>
      </Section>

      <Section title="Interior">
        <div className="grid md:grid-cols-2 gap-2">
          <Item id="interior.seatsGood" label="Seats unworn and free of cracks" />
          <Item id="interior.doorsOperate" label="All doors open and close freely" />
          <Item id="interior.trunkOperates" label="Trunk opens and closes freely" />
          <Item id="interior.noHeavyFreshener" label="No heavy scent of air freshener" />
          <Item id="interior.gaugesWork" label="All gauges work" />
          <Item id="interior.noDashWarnings" label="No dashboard warning lights" />
          <Item id="interior.stereoWorks" label="Stereo works" />
          <Item id="interior.heaterWorks" label="Heater works" />
        </div>
      </Section>

      <Card>
        <CardHeader>
          <CardTitle>Notes and Attachments</CardTitle>
          <CardDescription>Add observations and upload photos or PDFs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter inspection notes..."
            value={data.notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
          <FileUpload
            accept="image/*,application/pdf"
            multiple
            maxFiles={10}
            maxSize={25}
            onFileSelect={(files) => setAttachments(files)}
          />
          <Button onClick={handleSubmit} className="w-full">
            <CheckCircle className="h-4 w-4 mr-2" />
            Save Inspection Checklist
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}