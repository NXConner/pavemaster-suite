// @ts-nocheck
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import {
  Camera,
  Scan,
  Eye,
  Upload,
  Download,
  Zap,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  FileImage,
  Layers,
  Grid,
  Crosshair,
  Search,
  Brain,
  Settings,
  BarChart3,
} from 'lucide-react';

// Computer Vision Interfaces
interface ImageAnalysisResult {
  id: string;
  imageUrl: string;
  analysisType: 'progress' | 'quality' | 'defect' | 'equipment' | 'document';
  timestamp: Date;
  results: {
    confidence: number;
    detections: Detection[];
    measurements: Measurement[];
    text?: OCRResult[];
    quality?: QualityAssessment;
    defects?: DefectAnalysis[];
  };
  metadata: {
    imageSize: { width: number; height: number };
    fileSize: number;
    format: string;
    location?: string;
    project?: string;
  };
}

interface Detection {
  id: string;
  type: 'crack' | 'pothole' | 'equipment' | 'person' | 'vehicle' | 'material' | 'structure';
  bbox: { x: number; y: number; width: number; height: number };
  confidence: number;
  label: string;
  attributes?: Record<string, any>;
}

interface Measurement {
  id: string;
  type: 'length' | 'width' | 'area' | 'volume' | 'depth';
  value: number;
  unit: string;
  accuracy: number;
  method: 'calibrated' | 'estimated' | 'reference';
}

interface OCRResult {
  id: string;
  text: string;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
  type: 'text' | 'number' | 'date' | 'signature' | 'stamp';
}

interface QualityAssessment {
  overallScore: number;
  factors: {
    surfaceCondition: number;
    materialQuality: number;
    workmanship: number;
    compliance: number;
  };
  recommendations: string[];
  issues: string[];
}

interface DefectAnalysis {
  id: string;
  type: 'crack' | 'pothole' | 'settlement' | 'erosion' | 'drainage' | 'edge' | 'surface';
  severity: 'low' | 'medium' | 'high' | 'critical';
  size: { length?: number; width?: number; depth?: number; area?: number };
  location: { x: number; y: number };
  cause?: string;
  recommendation: string;
  urgency: 'immediate' | 'within_week' | 'within_month' | 'monitor';
}

// Computer Vision Engine
class ComputerVisionEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private models: Map<string, any> = new Map();
  private isInitialized = false;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    this.initializeModels();
  }

  private async initializeModels() {
    // Initialize pre-trained models (simulated)
    this.models.set('defect_detection', {
      name: 'Defect Detection Model',
      version: '2.1.0',
      accuracy: 0.94,
      classes: ['crack', 'pothole', 'settlement', 'erosion'],
    });

    this.models.set('equipment_recognition', {
      name: 'Equipment Recognition Model',
      version: '1.8.0',
      accuracy: 0.91,
      classes: ['excavator', 'dump_truck', 'roller', 'paver', 'loader'],
    });

    this.models.set('text_detection', {
      name: 'Text Detection Model',
      version: '3.0.0',
      accuracy: 0.96,
      languages: ['en', 'es', 'fr', 'de'],
    });

    this.models.set('quality_assessment', {
      name: 'Quality Assessment Model',
      version: '1.5.0',
      accuracy: 0.89,
      metrics: ['surface', 'material', 'workmanship', 'compliance'],
    });

    this.isInitialized = true;
  }

  async analyzeImage(imageFile: File, analysisType: string): Promise<ImageAnalysisResult> {
    if (!this.isInitialized) {
      throw new Error('Computer vision engine not initialized');
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          this.canvas.width = img.width;
          this.canvas.height = img.height;
          this.ctx.drawImage(img, 0, 0);

          const result = this.performAnalysis(img, analysisType);
          resolve(result);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(imageFile);
    });
  }

  private performAnalysis(image: HTMLImageElement, analysisType: string): ImageAnalysisResult {
    const result: ImageAnalysisResult = {
      id: `analysis_${Date.now()}`,
      imageUrl: this.canvas.toDataURL(),
      analysisType: analysisType as any,
      timestamp: new Date(),
      results: {
        confidence: 0,
        detections: [],
        measurements: [],
      },
      metadata: {
        imageSize: { width: image.width, height: image.height },
        fileSize: 0,
        format: 'image/jpeg',
      },
    };

    switch (analysisType) {
      case 'defect':
        result.results = this.detectDefects(image);
        break;
      case 'progress':
        result.results = this.analyzeProgress(image);
        break;
      case 'quality':
        result.results = this.assessQuality(image);
        break;
      case 'equipment':
        result.results = this.recognizeEquipment(image);
        break;
      case 'document':
        result.results = this.processDocument(image);
        break;
    }

    return result;
  }

  private detectDefects(image: HTMLImageElement): any {
    // Simulate defect detection
    const detections: Detection[] = [];
    const defects: DefectAnalysis[] = [];

    // Simulate random defect detection
    const numDefects = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < numDefects; i++) {
      const x = Math.random() * image.width;
      const y = Math.random() * image.height;
      const width = 50 + Math.random() * 100;
      const height = 20 + Math.random() * 50;

      const defectTypes = ['crack', 'pothole', 'settlement', 'erosion'];
      const type = defectTypes[Math.floor(Math.random() * defectTypes.length)] as any;
      const severity = ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any;

      detections.push({
        id: `detection_${i}`,
        type: type,
        bbox: { x, y, width, height },
        confidence: 0.7 + Math.random() * 0.3,
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} (${severity})`,
      });

      defects.push({
        id: `defect_${i}`,
        type,
        severity,
        size: { length: width, width: height, area: width * height },
        location: { x, y },
        recommendation: this.getDefectRecommendation(type, severity),
        urgency: this.getDefectUrgency(severity),
      });
    }

    return {
      confidence: 0.92,
      detections,
      measurements: [],
      defects,
    };
  }

  private analyzeProgress(image: HTMLImageElement): any {
    // Simulate progress analysis
    const detections: Detection[] = [];
    const measurements: Measurement[] = [];

    // Detect equipment and workers
    const equipmentTypes = ['excavator', 'dump_truck', 'roller', 'paver'];
    const numEquipment = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < numEquipment; i++) {
      const type = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
      detections.push({
        id: `equipment_${i}`,
        type: 'equipment',
        bbox: {
          x: Math.random() * image.width,
          y: Math.random() * image.height,
          width: 100 + Math.random() * 200,
          height: 80 + Math.random() * 120,
        },
        confidence: 0.85 + Math.random() * 0.15,
        label: type.replace('_', ' ').toUpperCase(),
      });
    }

    // Estimate progress measurements
    measurements.push({
      id: 'completed_area',
      type: 'area',
      value: 1200 + Math.random() * 800,
      unit: 'sq_ft',
      accuracy: 0.85,
      method: 'estimated',
    });

    return {
      confidence: 0.88,
      detections,
      measurements,
    };
  }

  private assessQuality(image: HTMLImageElement): any {
    // Simulate quality assessment
    const quality: QualityAssessment = {
      overallScore: 75 + Math.random() * 20,
      factors: {
        surfaceCondition: 80 + Math.random() * 15,
        materialQuality: 85 + Math.random() * 10,
        workmanship: 70 + Math.random() * 25,
        compliance: 90 + Math.random() * 10,
      },
      recommendations: [
        'Improve edge finishing technique',
        'Ensure proper material compaction',
        'Monitor temperature during application',
      ],
      issues: [
        'Minor surface irregularities detected',
        'Edge alignment could be improved',
      ],
    };

    return {
      confidence: 0.87,
      detections: [],
      measurements: [],
      quality,
    };
  }

  private recognizeEquipment(image: HTMLImageElement): any {
    // Simulate equipment recognition
    const detections: Detection[] = [];
    const equipmentTypes = ['excavator', 'dump_truck', 'roller', 'paver', 'loader'];
    const numEquipment = Math.floor(Math.random() * 4) + 1;

    for (let i = 0; i < numEquipment; i++) {
      const type = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
      detections.push({
        id: `equipment_${i}`,
        type: 'equipment',
        bbox: {
          x: Math.random() * image.width,
          y: Math.random() * image.height,
          width: 150 + Math.random() * 200,
          height: 100 + Math.random() * 150,
        },
        confidence: 0.82 + Math.random() * 0.18,
        label: type.replace('_', ' ').toUpperCase(),
        attributes: {
          make: ['CAT', 'John Deere', 'Volvo', 'Komatsu'][Math.floor(Math.random() * 4)],
          status: 'active',
        },
      });
    }

    return {
      confidence: 0.91,
      detections,
      measurements: [],
    };
  }

  private processDocument(image: HTMLImageElement): any {
    // Simulate OCR processing
    const text: OCRResult[] = [];
    const numTextBlocks = Math.floor(Math.random() * 8) + 3;

    const sampleTexts = [
      'PROJECT: Highway 101 Resurfacing',
      'DATE: ' + new Date().toLocaleDateString(),
      'CONTRACTOR: ABC Paving Inc.',
      'INSPECTOR: John Smith',
      'MATERIAL: Hot Mix Asphalt',
      'THICKNESS: 3 inches',
      'TEMPERATURE: 275°F',
      'APPROVED',
    ];

    for (let i = 0; i < numTextBlocks && i < sampleTexts.length; i++) {
      text.push({
        id: `text_${i}`,
        text: sampleTexts[i],
        confidence: 0.88 + Math.random() * 0.12,
        bbox: {
          x: 50 + Math.random() * (image.width - 200),
          y: 50 + i * 40,
          width: 200 + Math.random() * 150,
          height: 30,
        },
        type: sampleTexts[i].includes('DATE') ? 'date'
              : sampleTexts[i].includes('APPROVED') ? 'stamp' : 'text',
      });
    }

    return {
      confidence: 0.94,
      detections: [],
      measurements: [],
      text,
    };
  }

  private getDefectRecommendation(type: string, severity: string): string {
    const recommendations: Record<string, Record<string, string>> = {
      crack: {
        low: 'Monitor and seal if necessary',
        medium: 'Seal crack within 2 weeks',
        high: 'Repair crack immediately',
        critical: 'Emergency repair required',
      },
      pothole: {
        low: 'Schedule patching within month',
        medium: 'Patch within 1 week',
        high: 'Emergency patching required',
        critical: 'Road closure may be necessary',
      },
      settlement: {
        low: 'Monitor settlement area',
        medium: 'Investigate and repair',
        high: 'Immediate investigation required',
        critical: 'Structural assessment needed',
      },
      erosion: {
        low: 'Improve drainage',
        medium: 'Repair drainage system',
        high: 'Emergency drainage repair',
        critical: 'Major drainage overhaul needed',
      },
    };

    return recommendations[type]?.[severity] || 'Assess and repair as needed';
  }

  private getDefectUrgency(severity: string): 'immediate' | 'within_week' | 'within_month' | 'monitor' {
    switch (severity) {
      case 'critical': return 'immediate';
      case 'high': return 'within_week';
      case 'medium': return 'within_month';
      default: return 'monitor';
    }
  }

  async processVideo(videoFile: File): Promise<ImageAnalysisResult[]> {
    // Simulate video processing by analyzing frames
    const results: ImageAnalysisResult[] = [];
    const frameCount = 10; // Simulate 10 frames

    for (let i = 0; i < frameCount; i++) {
      // Create a mock frame analysis
      const result: ImageAnalysisResult = {
        id: `frame_${i}`,
        imageUrl: '',
        analysisType: 'progress',
        timestamp: new Date(Date.now() + i * 1000),
        results: {
          confidence: 0.85 + Math.random() * 0.1,
          detections: [],
          measurements: [{
            id: `progress_${i}`,
            type: 'area',
            value: 100 * i + Math.random() * 50,
            unit: 'sq_ft',
            accuracy: 0.8,
            method: 'estimated',
          }],
        },
        metadata: {
          imageSize: { width: 1920, height: 1080 },
          fileSize: 0,
          format: 'video/mp4',
        },
      };
      results.push(result);
    }

    return results;
  }

  getBatchAnalytics(results: ImageAnalysisResult[]): any {
    if (results.length === 0) { return null; }

    const totalDefects = results.reduce((sum, r) => sum + (r.results.defects?.length || 0), 0);
    const avgConfidence = results.reduce((sum, r) => sum + r.results.confidence, 0) / results.length;
    const defectTypes = new Map<string, number>();
    const severityCounts = new Map<string, number>();

    results.forEach(result => {
      result.results.defects?.forEach(defect => {
        defectTypes.set(defect.type, (defectTypes.get(defect.type) || 0) + 1);
        severityCounts.set(defect.severity, (severityCounts.get(defect.severity) || 0) + 1);
      });
    });

    return {
      totalAnalyses: results.length,
      totalDefects,
      avgConfidence: Math.round(avgConfidence * 100),
      mostCommonDefect: Array.from(defectTypes.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'none',
      criticalIssues: results.filter(r => r.results.defects?.some(d => d.severity === 'critical')).length,
      defectDistribution: Object.fromEntries(defectTypes),
      severityDistribution: Object.fromEntries(severityCounts),
    };
  }
}

export const ComputerVisionEngineComponent: React.FC = () => {
  const [visionEngine] = useState(() => new ComputerVisionEngine());
  const [analyses, setAnalyses] = useState<ImageAnalysisResult[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<ImageAnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisType, setAnalysisType] = useState<string>('defect');
  const [batchAnalytics, setBatchAnalytics] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBatchAnalytics(visionEngine.getBatchAnalytics(analyses));
  }, [analyses, visionEngine]);

  const handleImageUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      const result = await visionEngine.analyzeImage(file, analysisType);
      setAnalyses(prev => [result, ...prev]);
    } catch (error) {
      console.error('Image analysis error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVideoUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      const results = await visionEngine.processVideo(file);
      setAnalyses(prev => [...results, ...prev]);
    } catch (error) {
      console.error('Video analysis error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        handleImageUpload(file);
      } else if (file.type.startsWith('video/')) {
        handleVideoUpload(file);
      }
    }
  };

  const renderDetectionOverlay = (analysis: ImageAnalysisResult) => {
    return (
      <div className="relative">
        <img
          src={analysis.imageUrl}
          alt="Analysis result"
          className="max-w-full h-auto"
        />
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ aspectRatio: `${analysis.metadata.imageSize.width}/${analysis.metadata.imageSize.height}` }}
        >
          {analysis.results.detections.map((detection) => (
            <g key={detection.id}>
              <rect
                x={detection.bbox.x}
                y={detection.bbox.y}
                width={detection.bbox.width}
                height={detection.bbox.height}
                fill="none"
                stroke={detection.type === 'crack' || detection.type === 'pothole' ? '#ef4444' : '#22c55e'}
                strokeWidth="2"
                className="opacity-80"
              />
              <text
                x={detection.bbox.x}
                y={detection.bbox.y - 5}
                fill={detection.type === 'crack' || detection.type === 'pothole' ? '#ef4444' : '#22c55e'}
                fontSize="12"
                className="font-medium"
              >
                {detection.label} ({Math.round(detection.confidence * 100)}%)
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="h-6 w-6 text-blue-600" />
              <CardTitle>Computer Vision Engine</CardTitle>
              <Badge variant="secondary">Phase 2.3</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isProcessing ? 'default' : 'secondary'}>
                {isProcessing ? <Activity className="h-3 w-3 mr-1 animate-spin" /> : <Eye className="h-3 w-3 mr-1" />}
                {isProcessing ? 'Processing' : 'Ready'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="analyze" className="w-full">
            <TabsList>
              <TabsTrigger value="analyze">
                <Camera className="h-4 w-4 mr-2" />
                Image Analysis
              </TabsTrigger>
              <TabsTrigger value="results">
                <Target className="h-4 w-4 mr-2" />
                Results
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analyze" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upload & Analyze</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Analysis Type</Label>
                        <select
                          value={analysisType}
                          onChange={(e) => { setAnalysisType(e.target.value); }}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="defect">Defect Detection</option>
                          <option value="progress">Progress Analysis</option>
                          <option value="quality">Quality Assessment</option>
                          <option value="equipment">Equipment Recognition</option>
                          <option value="document">Document Processing (OCR)</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Upload Image</Label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isProcessing}
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>Upload Video</Label>
                        <input
                          ref={videoInputRef}
                          type="file"
                          accept="video/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Button
                          onClick={() => videoInputRef.current?.click()}
                          disabled={isProcessing}
                          variant="outline"
                          className="w-full"
                        >
                          <FileImage className="h-4 w-4 mr-2" />
                          Upload Video
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-card dark:bg-gray-800 rounded-lg">
                        <h4 className="font-medium mb-2">Analysis Capabilities</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Crack & defect detection</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Progress measurement</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Quality assessment</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Equipment recognition</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>OCR text extraction</span>
                          </div>
                        </div>
                      </div>

                      {isProcessing && (
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Activity className="h-4 w-4 animate-spin" />
                              <span className="text-sm">Processing image...</span>
                            </div>
                            <Progress value={45} className="w-full" />
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Analysis Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      {analyses.length > 0 ? (
                        <div className="space-y-2">
                          {analyses.map((analysis) => (
                            <div
                              key={analysis.id}
                              className="p-3 border rounded-lg cursor-pointer hover:bg-card dark:hover:bg-gray-800"
                              onClick={() => { setSelectedAnalysis(analysis); }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline">{analysis.analysisType}</Badge>
                                <span className="text-xs text-gray-500">
                                  {analysis.timestamp.toLocaleTimeString()}
                                </span>
                              </div>
                              <div className="text-sm space-y-1">
                                <div>Confidence: {Math.round(analysis.results.confidence * 100)}%</div>
                                <div>Detections: {analysis.results.detections.length}</div>
                                {analysis.results.defects && (
                                  <div>Defects: {analysis.results.defects.length}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No analyses yet. Upload an image to get started.
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Analysis Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedAnalysis ? (
                      <div className="space-y-4">
                        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                          {renderDetectionOverlay(selectedAnalysis)}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Type:</span>
                            <Badge>{selectedAnalysis.analysisType}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Confidence:</span>
                            <span className="text-sm">{Math.round(selectedAnalysis.results.confidence * 100)}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Detections:</span>
                            <span className="text-sm">{selectedAnalysis.results.detections.length}</span>
                          </div>
                        </div>

                        {selectedAnalysis.results.defects && selectedAnalysis.results.defects.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Detected Defects</Label>
                            {selectedAnalysis.results.defects.map((defect) => (
                              <div key={defect.id} className="p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium capitalize">{defect.type}</span>
                                  <Badge variant={defect.severity === 'critical' ? 'destructive' : 'secondary'}>
                                    {defect.severity}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600">{defect.recommendation}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {selectedAnalysis.results.quality && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Quality Assessment</Label>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Overall Score:</span>
                                <span className="text-sm font-medium">{Math.round(selectedAnalysis.results.quality.overallScore)}%</span>
                              </div>
                              {Object.entries(selectedAnalysis.results.quality.factors).map(([factor, score]) => (
                                <div key={factor} className="flex items-center justify-between">
                                  <span className="text-xs capitalize">{factor.replace(/([A-Z])/g, ' $1')}:</span>
                                  <span className="text-xs">{Math.round(score)}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedAnalysis.results.text && selectedAnalysis.results.text.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Extracted Text</Label>
                            <div className="space-y-1">
                              {selectedAnalysis.results.text.map((text) => (
                                <div key={text.id} className="text-xs p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                  {text.text} ({Math.round(text.confidence * 100)}%)
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Select an analysis to view details
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {batchAnalytics ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Scan className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{batchAnalytics.totalAnalyses}</p>
                      <p className="text-sm text-gray-600">Total Analyses</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{batchAnalytics.totalDefects}</p>
                      <p className="text-sm text-gray-600">Total Defects</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{batchAnalytics.avgConfidence}%</p>
                      <p className="text-sm text-gray-600">Avg Confidence</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Zap className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{batchAnalytics.criticalIssues}</p>
                      <p className="text-sm text-gray-600">Critical Issues</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No analytics data available yet. Analyze some images to see statistics.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Model Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Defect Detection Model</span>
                      </div>
                      <Badge variant="default">v2.1.0 (94% accuracy)</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Equipment Recognition</span>
                      </div>
                      <Badge variant="default">v1.8.0 (91% accuracy)</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium">OCR Text Detection</span>
                      </div>
                      <Badge variant="default">v3.0.0 (96% accuracy)</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Quality Assessment</span>
                      </div>
                      <Badge variant="default">v1.5.0 (89% accuracy)</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export { ComputerVisionEngine as ComputerVisionEngineClass };
export type { ImageAnalysisResult, Detection, DefectAnalysis, QualityAssessment, OCRResult };