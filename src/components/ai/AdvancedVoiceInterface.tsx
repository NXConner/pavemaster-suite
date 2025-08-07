import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Settings,
  Headphones,
  Radio,
  Zap,
  Brain,
  Activity,
  AudioWaveform,
  FileAudio,
  Speaker,
  Languages,
  Gauge,
} from 'lucide-react';

// Voice Interfaces
interface VoiceCommand {
  id: string;
  phrase: string;
  action: string;
  parameters?: Record<string, any>;
  confidence: number;
  timestamp: Date;
}

interface AudioAnalysis {
  volume: number;
  frequency: number;
  clarity: number;
  noiseLevel: number;
  speechDetected: boolean;
}

interface VoiceProfile {
  userId: string;
  preferredVoice: string;
  speechRate: number;
  pitch: number;
  volume: number;
  language: string;
  commandSensitivity: number;
  noiseThreshold: number;
  customCommands: VoiceCommand[];
}

interface SpeechRecognitionState {
  isListening: boolean;
  isProcessing: boolean;
  confidence: number;
  interim: string;
  final: string;
  error?: string;
}

interface SpeechSynthesisState {
  isSpeaking: boolean;
  queue: string[];
  currentText?: string;
  progress: number;
}

// Advanced Voice Engine
class AdvancedVoiceEngine {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;

  private profile: VoiceProfile;
  private onCommandCallback?: (command: VoiceCommand) => void;
  private onAudioAnalysisCallback?: (analysis: AudioAnalysis) => void;

  private isInitialized = false;
  private animationFrameId: number | null = null;

  constructor(profile: VoiceProfile) {
    this.profile = profile;
    this.initializeAPIs();
  }

  private async initializeAPIs(): Promise<void> {
    try {
      // Initialize Speech Recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        this.recognition = new SpeechRecognition();

        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = this.profile.language;
        this.recognition.maxAlternatives = 3;

        this.setupRecognitionHandlers();
      }

      // Initialize Speech Synthesis
      if ('speechSynthesis' in window) {
        this.synthesis = window.speechSynthesis;
      }

      // Initialize Audio Context for analysis
      if ('AudioContext' in window || 'webkitAudioContext' in window) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContextClass();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize voice APIs:', error);
    }
  }

  private setupRecognitionHandlers(): void {
    if (!this.recognition) { return; }

    this.recognition.onstart = () => {
      console.log('Voice recognition started');
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i].transcript;
        const confidence = event.results[i].confidence || 0;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;

          // Process as command if confidence is high enough
          if (confidence >= this.profile.commandSensitivity) {
            this.processVoiceCommand(transcript, confidence);
          }
        } else {
          interimTranscript += transcript;
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    this.recognition.onend = () => {
      console.log('Voice recognition ended');
    };
  }

  private processVoiceCommand(transcript: string, confidence: number): void {
    const command: VoiceCommand = {
      id: `cmd_${Date.now()}`,
      phrase: transcript.trim(),
      action: this.extractAction(transcript),
      parameters: this.extractParameters(transcript),
      confidence,
      timestamp: new Date(),
    };

    if (this.onCommandCallback) {
      this.onCommandCallback(command);
    }
  }

  private extractAction(transcript: string): string {
    const text = transcript.toLowerCase();

    // Navigation commands
    if (text.includes('open') || text.includes('show') || text.includes('go to')) {
      return 'navigate';
    }

    // Creation commands
    if (text.includes('create') || text.includes('new') || text.includes('add')) {
      return 'create';
    }

    // Information commands
    if (text.includes('what') || text.includes('how') || text.includes('when') || text.includes('where')) {
      return 'query';
    }

    // Control commands
    if (text.includes('stop') || text.includes('pause') || text.includes('start') || text.includes('resume')) {
      return 'control';
    }

    // Analysis commands
    if (text.includes('analyze') || text.includes('calculate') || text.includes('estimate')) {
      return 'analyze';
    }

    return 'unknown';
  }

  private extractParameters(transcript: string): Record<string, any> {
    const parameters: Record<string, any> = {};
    const text = transcript.toLowerCase();

    // Extract project names
    const projectMatch = text.match(/project\s+([a-zA-Z0-9\s]+)/);
    if (projectMatch) {
      parameters.project = projectMatch[1].trim();
    }

    // Extract dates
    const dateMatch = text.match(/\b\d{1,2}\/\d{1,2}\/\d{4}\b|today|tomorrow|yesterday|next\s+week|last\s+week/);
    if (dateMatch) {
      parameters.date = dateMatch[0];
    }

    // Extract numbers
    const numberMatch = text.match(/\b\d+(?:\.\d+)?\b/);
    if (numberMatch) {
      parameters.number = parseFloat(numberMatch[0]);
    }

    return parameters;
  }

  async startListening(): Promise<void> {
    if (!this.isInitialized || !this.recognition) {
      throw new Error('Voice recognition not available');
    }

    try {
      // Start audio analysis
      await this.startAudioAnalysis();

      // Start speech recognition
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start listening:', error);
      throw error;
    }
  }

  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
    this.stopAudioAnalysis();
  }

  private async startAudioAnalysis(): Promise<void> {
    if (!this.audioContext || !this.analyser) { return; }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.microphone = this.audioContext.createMediaStreamSource(this.stream);
      this.microphone.connect(this.analyser);

      this.analyzeAudio();
    } catch (error) {
      console.error('Failed to start audio analysis:', error);
    }
  }

  private stopAudioAnalysis(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => { track.stop(); });
      this.stream = null;
    }
  }

  private analyzeAudio(): void {
    if (!this.analyser) { return; }

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const freqArray = new Uint8Array(bufferLength);

    const analyze = () => {
      this.analyser!.getByteTimeDomainData(dataArray);
      this.analyser!.getByteFrequencyData(freqArray);

      // Calculate volume (RMS)
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const value = (dataArray[i] - 128) / 128;
        sum += value * value;
      }
      const volume = Math.sqrt(sum / bufferLength);

      // Calculate dominant frequency
      let maxValue = 0;
      let maxIndex = 0;
      for (let i = 0; i < freqArray.length; i++) {
        if (freqArray[i] > maxValue) {
          maxValue = freqArray[i];
          maxIndex = i;
        }
      }
      const frequency = (maxIndex * this.audioContext!.sampleRate) / (2 * freqArray.length);

      // Calculate clarity (spectral centroid)
      let weightedSum = 0;
      let totalMagnitude = 0;
      for (let i = 0; i < freqArray.length; i++) {
        weightedSum += i * freqArray[i];
        totalMagnitude += freqArray[i];
      }
      const clarity = totalMagnitude > 0 ? weightedSum / totalMagnitude / freqArray.length : 0;

      // Speech detection (energy in vocal frequency range)
      const vocalStart = Math.floor((85 * freqArray.length * 2) / this.audioContext!.sampleRate);
      const vocalEnd = Math.floor((255 * freqArray.length * 2) / this.audioContext!.sampleRate);
      let vocalEnergy = 0;
      for (let i = vocalStart; i < vocalEnd && i < freqArray.length; i++) {
        vocalEnergy += freqArray[i];
      }
      const speechDetected = vocalEnergy > this.profile.noiseThreshold * 1000;

      const analysis: AudioAnalysis = {
        volume: volume * 100,
        frequency,
        clarity,
        noiseLevel: Math.max(...freqArray) / 255,
        speechDetected,
      };

      if (this.onAudioAnalysisCallback) {
        this.onAudioAnalysisCallback(analysis);
      }

      this.animationFrameId = requestAnimationFrame(analyze);
    };

    analyze();
  }

  async speak(text: string, priority: 'low' | 'normal' | 'high' = 'normal'): Promise<void> {
    if (!this.synthesis) {
      throw new Error('Speech synthesis not available');
    }

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);

      // Apply voice profile
      const voices = this.synthesis!.getVoices();
      const selectedVoice = voices.find(v => v.name === this.profile.preferredVoice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.rate = this.profile.speechRate;
      utterance.pitch = this.profile.pitch;
      utterance.volume = this.profile.volume;

      utterance.onend = () => { resolve(); };
      utterance.onerror = (event) => { reject(new Error(`Speech synthesis error: ${event.error}`)); };

      // Handle priority
      if (priority === 'high') {
        this.synthesis!.cancel(); // Clear queue for high priority
      }

      this.synthesis!.speak(utterance);
    });
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis ? this.synthesis.getVoices() : [];
  }

  updateProfile(profile: Partial<VoiceProfile>): void {
    this.profile = { ...this.profile, ...profile };

    if (this.recognition && profile.language) {
      this.recognition.lang = profile.language;
    }
  }

  setCommandCallback(callback: (command: VoiceCommand) => void): void {
    this.onCommandCallback = callback;
  }

  setAudioAnalysisCallback(callback: (analysis: AudioAnalysis) => void): void {
    this.onAudioAnalysisCallback = callback;
  }

  addCustomCommand(command: Omit<VoiceCommand, 'id' | 'timestamp' | 'confidence'>): void {
    const newCommand: VoiceCommand = {
      ...command,
      id: `custom_${Date.now()}`,
      timestamp: new Date(),
      confidence: 1.0,
    };

    this.profile.customCommands.push(newCommand);
  }

  removeCustomCommand(commandId: string): void {
    this.profile.customCommands = this.profile.customCommands.filter(cmd => cmd.id !== commandId);
  }

  async calibrateNoiseLevel(): Promise<number> {
    if (!this.audioContext || !this.analyser) {
      throw new Error('Audio analysis not available');
    }

    await this.startAudioAnalysis();

    return new Promise((resolve) => {
      const samples: number[] = [];
      const sampleCount = 100;
      let count = 0;

      const collectSample = () => {
        if (!this.analyser) { return; }

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);

        const avgNoise = dataArray.reduce((sum, val) => sum + val, 0) / bufferLength;
        samples.push(avgNoise);
        count++;

        if (count < sampleCount) {
          setTimeout(collectSample, 50);
        } else {
          const noiseLevel = samples.reduce((sum, val) => sum + val, 0) / samples.length;
          this.profile.noiseThreshold = noiseLevel * 1.2; // 20% above average
          this.stopAudioAnalysis();
          resolve(noiseLevel);
        }
      };

      collectSample();
    });
  }
}

export const AdvancedVoiceInterface: React.FC<{
  onCommand?: (command: VoiceCommand) => void;
}> = ({ onCommand }) => {
  const [voiceEngine, setVoiceEngine] = useState<AdvancedVoiceEngine | null>(null);
  const [recognitionState, setRecognitionState] = useState<SpeechRecognitionState>({
    isListening: false,
    isProcessing: false,
    confidence: 0,
    interim: '',
    final: '',
  });
  const [synthesisState, setSynthesisState] = useState<SpeechSynthesisState>({
    isSpeaking: false,
    queue: [],
    progress: 0,
  });
  const [audioAnalysis, setAudioAnalysis] = useState<AudioAnalysis>({
    volume: 0,
    frequency: 0,
    clarity: 0,
    noiseLevel: 0,
    speechDetected: false,
  });
  const [profile, setProfile] = useState<VoiceProfile>({
    userId: 'user_1',
    preferredVoice: '',
    speechRate: 1,
    pitch: 1,
    volume: 1,
    language: 'en-US',
    commandSensitivity: 0.7,
    noiseThreshold: 50,
    customCommands: [],
  });
  const [recentCommands, setRecentCommands] = useState<VoiceCommand[]>([]);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const engine = new AdvancedVoiceEngine(profile);

    engine.setCommandCallback((command) => {
      setRecentCommands(prev => [command, ...prev.slice(0, 9)]);
      if (onCommand) { onCommand(command); }
    });

    engine.setAudioAnalysisCallback(setAudioAnalysis);

    setVoiceEngine(engine);

    // Load available voices
    const loadVoices = () => {
      const voices = engine.getAvailableVoices();
      setAvailableVoices(voices);
      if (!profile.preferredVoice && voices.length > 0) {
        setProfile(prev => ({ ...prev, preferredVoice: voices[0].name }));
      }
    };

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();

    return () => {
      engine.stopListening();
    };
  }, [profile.language, profile.commandSensitivity, profile.noiseThreshold]);

  const handleStartListening = async () => {
    if (!voiceEngine) { return; }

    try {
      setRecognitionState(prev => ({ ...prev, isListening: true }));
      await voiceEngine.startListening();
    } catch (error) {
      console.error('Failed to start listening:', error);
      setRecognitionState(prev => ({ ...prev, isListening: false, error: 'Failed to start listening' }));
    }
  };

  const handleStopListening = () => {
    if (!voiceEngine) { return; }

    voiceEngine.stopListening();
    setRecognitionState(prev => ({ ...prev, isListening: false }));
  };

  const handleSpeak = async (text: string, priority: 'low' | 'normal' | 'high' = 'normal') => {
    if (!voiceEngine) { return; }

    try {
      setSynthesisState(prev => ({ ...prev, isSpeaking: true, currentText: text }));
      await voiceEngine.speak(text, priority);
      setSynthesisState(prev => ({ ...prev, isSpeaking: false, currentText: undefined }));
    } catch (error) {
      console.error('Failed to speak:', error);
      setSynthesisState(prev => ({ ...prev, isSpeaking: false, currentText: undefined }));
    }
  };

  const handleProfileUpdate = (updates: Partial<VoiceProfile>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    if (voiceEngine) {
      voiceEngine.updateProfile(updates);
    }
  };

  const handleCalibrateNoise = async () => {
    if (!voiceEngine) { return; }

    setIsCalibrating(true);
    try {
      const noiseLevel = await voiceEngine.calibrateNoiseLevel();
      handleProfileUpdate({ noiseThreshold: noiseLevel * 1.2 });
    } catch (error) {
      console.error('Failed to calibrate noise:', error);
    } finally {
      setIsCalibrating(false);
    }
  };

  const handleTestVoice = () => {
    handleSpeak('Hello! This is a test of the voice synthesis system. How do I sound?');
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Headphones className="h-6 w-6 text-blue-600" />
              <CardTitle>Advanced Voice Interface</CardTitle>
              <Badge variant="secondary">
                <Radio className="h-3 w-3 mr-1" />
                Phase 2.2
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={recognitionState.isListening ? 'default' : 'secondary'}>
                {recognitionState.isListening ? <Mic className="h-3 w-3 mr-1" /> : <MicOff className="h-3 w-3 mr-1" />}
                {recognitionState.isListening ? 'Listening' : 'Inactive'}
              </Badge>
              <Badge variant={synthesisState.isSpeaking ? 'default' : 'secondary'}>
                {synthesisState.isSpeaking ? <Speaker className="h-3 w-3 mr-1" /> : <VolumeX className="h-3 w-3 mr-1" />}
                {synthesisState.isSpeaking ? 'Speaking' : 'Silent'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="controls" className="w-full">
            <TabsList>
              <TabsTrigger value="controls">
                <Mic className="h-4 w-4 mr-2" />
                Controls
              </TabsTrigger>
              <TabsTrigger value="analysis">
                <Activity className="h-4 w-4 mr-2" />
                Audio Analysis
              </TabsTrigger>
              <TabsTrigger value="commands">
                <Brain className="h-4 w-4 mr-2" />
                Commands
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="controls" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Speech Recognition</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleStartListening}
                        disabled={recognitionState.isListening}
                        className="flex-1"
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Start Listening
                      </Button>
                      <Button
                        onClick={handleStopListening}
                        disabled={!recognitionState.isListening}
                        variant="outline"
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                    </div>

                    {recognitionState.isListening && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Activity className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Listening for commands...</span>
                        </div>

                        {audioAnalysis.speechDetected && (
                          <div className="p-2 bg-green-50 dark:bg-green-900 rounded border border-green-200 dark:border-green-800">
                            <p className="text-sm text-green-700 dark:text-green-300">
                              🎤 Speech detected - Volume: {audioAnalysis.volume.toFixed(1)}%
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-sm">Recognition Confidence</Label>
                      <Progress value={recognitionState.confidence * 100} className="w-full" />
                      <span className="text-xs text-gray-500">{Math.round(recognitionState.confidence * 100)}%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Speech Synthesis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        placeholder="Enter text to speak..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSpeak(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleTestVoice}
                          variant="outline"
                          className="flex-1"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Test Voice
                        </Button>
                      </div>
                    </div>

                    {synthesisState.isSpeaking && synthesisState.currentText && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Volume2 className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Speaking...</span>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900 rounded border border-blue-200 dark:border-blue-800">
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            "{synthesisState.currentText}"
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-sm">Speech Progress</Label>
                      <Progress value={synthesisState.progress} className="w-full" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSpeak('Welcome to PaveMaster Suite')}
                    >
                      Welcome Message
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSpeak('Current time is ' + new Date().toLocaleTimeString())}
                    >
                      Current Time
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSpeak('Voice system is ready for commands')}
                    >
                      System Status
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSpeak('Thank you for using PaveMaster Suite')}
                    >
                      Thank You
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Gauge className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{audioAnalysis.volume.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Volume</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <AudioWaveform className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{audioAnalysis.frequency.toFixed(0)}Hz</p>
                    <p className="text-sm text-gray-600">Frequency</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{(audioAnalysis.clarity * 100).toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Clarity</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Radio className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{(audioAnalysis.noiseLevel * 100).toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Noise</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Real-time Audio Visualization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Volume Level</span>
                      <Progress value={audioAnalysis.volume} className="flex-1 mx-4" />
                      <span className="text-sm w-12">{audioAnalysis.volume.toFixed(1)}%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Noise Level</span>
                      <Progress
                        value={audioAnalysis.noiseLevel * 100}
                        className="flex-1 mx-4"
                      />
                      <span className="text-sm w-12">{(audioAnalysis.noiseLevel * 100).toFixed(1)}%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Speech Detection</span>
                      <Badge variant={audioAnalysis.speechDetected ? 'default' : 'secondary'}>
                        {audioAnalysis.speechDetected ? 'Detected' : 'None'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Noise Calibration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Calibrate the noise threshold for optimal speech detection in your environment.
                  </p>
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={handleCalibrateNoise}
                      disabled={isCalibrating}
                      variant="outline"
                    >
                      {isCalibrating ? (
                        <>
                          <Activity className="h-4 w-4 mr-2 animate-spin" />
                          Calibrating...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Calibrate Noise
                        </>
                      )}
                    </Button>
                    <span className="text-sm">
                      Current threshold: {profile.noiseThreshold.toFixed(1)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="commands" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Voice Commands</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    {recentCommands.length > 0 ? (
                      <div className="space-y-2">
                        {recentCommands.map((command) => (
                          <div key={command.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <Badge variant="outline">{command.action}</Badge>
                              <span className="text-xs text-gray-500">
                                {command.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm font-medium">"{command.phrase}"</p>
                            <div className="flex items-center mt-2 space-x-2 text-xs text-gray-500">
                              <span>Confidence: {Math.round(command.confidence * 100)}%</span>
                              {Object.keys(command.parameters || {}).length > 0 && (
                                <span>• Params: {Object.keys(command.parameters!).join(', ')}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No voice commands recorded yet
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Supported Commands</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Navigation</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>• "Open [module name]" / "Show [page]" / "Go to [section]"</p>
                        <p>• "Navigate to projects" / "Display dashboard"</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Creation</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>• "Create new project [name]" / "Add task [description]"</p>
                        <p>• "New report" / "Start calculation"</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Information</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>• "What is [project status]?" / "How many [items]?"</p>
                        <p>• "When is [deadline]?" / "Where is [location]?"</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Control</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>• "Stop [process]" / "Pause [activity]"</p>
                        <p>• "Start [operation]" / "Resume [task]"</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Voice Recognition</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select
                        value={profile.language}
                        onValueChange={(value) => { handleProfileUpdate({ language: value }); }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="en-GB">English (UK)</SelectItem>
                          <SelectItem value="es-ES">Spanish</SelectItem>
                          <SelectItem value="fr-FR">French</SelectItem>
                          <SelectItem value="de-DE">German</SelectItem>
                          <SelectItem value="zh-CN">Chinese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Command Sensitivity: {Math.round(profile.commandSensitivity * 100)}%</Label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={profile.commandSensitivity}
                        onChange={(e) => { handleProfileUpdate({ commandSensitivity: parseFloat(e.target.value) }); }}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500">
                        Higher values require more confident speech recognition
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Noise Threshold: {profile.noiseThreshold.toFixed(1)}</Label>
                      <input
                        type="range"
                        min="10"
                        max="200"
                        step="5"
                        value={profile.noiseThreshold}
                        onChange={(e) => { handleProfileUpdate({ noiseThreshold: parseFloat(e.target.value) }); }}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500">
                        Adjust for your environment's background noise level
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Voice Synthesis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Voice</Label>
                      <Select
                        value={profile.preferredVoice}
                        onValueChange={(value) => { handleProfileUpdate({ preferredVoice: value }); }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableVoices.map((voice) => (
                            <SelectItem key={voice.name} value={voice.name}>
                              {voice.name} ({voice.lang})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Speech Rate: {profile.speechRate.toFixed(1)}x</Label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={profile.speechRate}
                        onChange={(e) => { handleProfileUpdate({ speechRate: parseFloat(e.target.value) }); }}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Pitch: {profile.pitch.toFixed(1)}</Label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={profile.pitch}
                        onChange={(e) => { handleProfileUpdate({ pitch: parseFloat(e.target.value) }); }}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Volume: {Math.round(profile.volume * 100)}%</Label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={profile.volume}
                        onChange={(e) => { handleProfileUpdate({ volume: parseFloat(e.target.value) }); }}
                        className="w-full"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export { AdvancedVoiceEngine };
export type { VoiceCommand, AudioAnalysis, VoiceProfile };