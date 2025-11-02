import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Zap, AlertTriangle, CheckCircle, Clock, Info, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from '../../hooks/use-toast';

interface PredictionResult {
  predicted_class: string;
  predicted_class_index: number;
  confidence: number;
  probabilities: Record<string, number>;
  maintenance_urgency: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  model_version: string;
  timestamp: string;
  inference_time?: number;
}

interface AnalysisHistory {
  id: string;
  image_url: string;
  result: PredictionResult;
  location?: string;
  notes?: string;
  created_at: string;
}

const PavementAnalysisPanel: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [batchMode, setBatchMode] = useState(false);
  const [batchResults, setBatchResults] = useState<PredictionResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'fair':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'poor':
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const analyzeImage = async (file: File) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/ai/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();

      if (data.success) {
        setResult(data.result);

        // Create image URL for display
        const imageUrl = URL.createObjectURL(file);
        setSelectedImage(imageUrl);

        // Add to history
        const historyItem: AnalysisHistory = {
          id: Date.now().toString(),
          image_url: imageUrl,
          result: data.result,
          created_at: new Date().toISOString(),
        };

        setHistory(prev => [historyItem, ...prev]);

        toast({
          title: 'Analysis Complete',
          description: `Pavement condition: ${data.result.predicted_class} (${(data.result.confidence * 100).toFixed(1)}% confidence)`,
        });
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Failed to analyze the image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeBatch = async (files: FileList) => {
    setIsLoading(true);
    setBatchResults([]);

    try {
      const formData = new FormData();
        Array.from(files).forEach((file) => {
          formData.append('images', file);
        });

      const response = await fetch('/api/ai/predict_batch', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Batch analysis failed');
      }

      const data = await response.json();

      if (data.success) {
        setBatchResults(data.results);

        toast({
          title: 'Batch Analysis Complete',
          description: `Analyzed ${data.results.length} images successfully`,
        });
      } else {
        throw new Error(data.error || 'Batch analysis failed');
      }
    } catch (error) {
      console.error('Batch analysis error:', error);
      toast({
        title: 'Batch Analysis Failed',
        description: 'Failed to analyze the images. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) { return; }

    if (batchMode) {
      analyzeBatch(files);
    } else {
      const file = files[0];
      if (file) {
        analyzeImage(file);
      }
    }
  }, [batchMode]);

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const triggerCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const clearResults = () => {
    setResult(null);
    setSelectedImage(null);
    setBatchResults([]);
  };

  const exportResults = () => {
    const dataToExport = batchMode ? batchResults : [result];
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pavement-analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Pavement Analysis</h2>
          <p className="text-gray-600">Advanced condition assessment using machine learning</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Zap className="h-3 w-3" />
          AI Powered
        </Badge>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Images for Analysis
          </CardTitle>
          <CardDescription>
            Upload pavement images for AI-powered condition assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Mode Toggle */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={batchMode}
                  onChange={(e) => { setBatchMode(e.target.checked); }}
                  className="rounded border-gray-300"
                />
                Batch Mode (Multiple Images)
              </label>
            </div>

            {/* Upload Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={triggerFileUpload}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {batchMode ? 'Select Images' : 'Upload Image'}
              </Button>

              <Button
                variant="outline"
                onClick={triggerCameraCapture}
                disabled={isLoading || batchMode}
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                Take Photo
              </Button>

              {(result || batchResults.length > 0) && (
                <>
                  <Button
                    variant="outline"
                    onClick={clearResults}
                    disabled={isLoading}
                  >
                    Clear Results
                  </Button>
                  <Button
                    variant="outline"
                    onClick={exportResults}
                    disabled={isLoading}
                  >
                    Export Results
                  </Button>
                </>
              )}
            </div>

            {/* Hidden File Inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple={batchMode}
              onChange={handleFileUpload}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-blue-700">
                  {batchMode ? 'Analyzing images...' : 'Analyzing image...'}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {!batchMode && result && selectedImage && (
        <Tabs defaultValue="results" className="space-y-4">
          <TabsList>
            <TabsTrigger value="results">Analysis Results</TabsTrigger>
            <TabsTrigger value="details">Detailed Metrics</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Display */}
              <Card>
                <CardHeader>
                  <CardTitle>Analyzed Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={selectedImage}
                    alt="Analyzed pavement"
                    className="w-full h-64 object-cover rounded-lg border"
                  />
                </CardContent>
              </Card>

              {/* Main Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getConditionIcon(result.predicted_class)}
                    Condition Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Condition:</span>
                      <Badge variant="secondary" className="capitalize">
                        {result.predicted_class}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Confidence:</span>
                      <span className="text-sm">{(result.confidence * 100).toFixed(1)}%</span>
                    </div>

                    <Progress value={result.confidence * 100} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Urgency:</span>
                      <Badge className={getUrgencyColor(result.maintenance_urgency)}>
                        {result.maintenance_urgency}
                      </Badge>
                    </div>
                  </div>

                  {result.inference_time && (
                    <div className="text-xs text-gray-500 border-t pt-2">
                      Analysis completed in {(result.inference_time * 1000).toFixed(0)}ms
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Urgency Alert */}
            {(result.maintenance_urgency === 'high' || result.maintenance_urgency === 'critical') && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Maintenance Required:</strong> This pavement section requires {result.maintenance_urgency} priority attention.
                  Please review the recommendations below.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Probability Scores</CardTitle>
                <CardDescription>
                  Confidence scores for each pavement condition class
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(result.probabilities).map(([condition, probability]) => (
                    <div key={condition} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize font-medium">{condition}</span>
                        <span>{(probability * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={probability * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Model Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Model Version:</span>
                    <div className="text-gray-600">{result.model_version}</div>
                  </div>
                  <div>
                    <span className="font-medium">Analysis Time:</span>
                    <div className="text-gray-600">{new Date(result.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Maintenance Recommendations
                </CardTitle>
                <CardDescription>
                  AI-generated recommendations based on the pavement condition analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.recommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-card rounded-lg"
                    >
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Batch Results */}
      {batchMode && batchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Batch Analysis Results</CardTitle>
            <CardDescription>
              Analysis results for {batchResults.length} images
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {['excellent', 'good', 'fair', 'poor', 'failed'].map(condition => {
                  const count = batchResults.filter(r => r.predicted_class === condition).length;
                  const percentage = (count / batchResults.length * 100).toFixed(1);

                  return (
                    <div key={condition} className="text-center p-3 bg-card rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{count}</div>
                      <div className="text-sm text-gray-600 capitalize">{condition}</div>
                      <div className="text-xs text-gray-500">{percentage}%</div>
                    </div>
                  );
                })}
              </div>

              {/* Results Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Image #</th>
                      <th className="text-left p-2">Condition</th>
                      <th className="text-left p-2">Confidence</th>
                      <th className="text-left p-2">Urgency</th>
                      <th className="text-left p-2">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchResults.map((result, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">#{index + 1}</td>
                        <td className="p-2">
                          <Badge variant="secondary" className="capitalize">
                            {result.predicted_class}
                          </Badge>
                        </td>
                        <td className="p-2">{(result.confidence * 100).toFixed(1)}%</td>
                        <td className="p-2">
                          <Badge className={getUrgencyColor(result.maintenance_urgency)}>
                            {result.maintenance_urgency}
                          </Badge>
                        </td>
                        <td className="p-2">
                          {result.inference_time ? `${(result.inference_time * 1000).toFixed(0)}ms` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Analyses</CardTitle>
            <CardDescription>
              History of your pavement condition analyses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 border rounded-lg hover:bg-card cursor-pointer"
                  onClick={() => {
                    setSelectedImage(item.image_url);
                    setResult(item.result);
                  }}
                >
                  <img
                    src={item.image_url}
                    alt="Analysis thumbnail"
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {getConditionIcon(item.result.predicted_class)}
                      <span className="font-medium capitalize">
                        {item.result.predicted_class}
                      </span>
                      <Badge className={getUrgencyColor(item.result.maintenance_urgency)}>
                        {item.result.maintenance_urgency}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(item.created_at).toLocaleString()} •
                      {(item.result.confidence * 100).toFixed(1)}% confidence
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PavementAnalysisPanel;