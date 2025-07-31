/**
 * Phase 7: Voice Interface System
 * Advanced natural language processing and voice interaction system for hands-free construction management
 */

import { performanceMonitor } from './performance';
import { aiMlEngine } from './aiMlEngine';
import { supabase } from '@/integrations/supabase/client';

// Voice Interface Core Interfaces
export interface VoiceCommand {
  id: string;
  command: string;
  intent: VoiceIntent;
  entities: VoiceEntity[];
  confidence: number;
  timestamp: Date;
  userId: string;
  context: VoiceContext;
  response: VoiceResponse;
  executed: boolean;
  executionTime?: number;
}

export interface VoiceIntent {
  name: string;
  category: 'navigation' | 'data_entry' | 'query' | 'action' | 'control' | 'report' | 'assistance';
  subcategory: string;
  confidence: number;
  parameters: Record<string, any>;
  requiredEntities: string[];
  optionalEntities: string[];
}

export interface VoiceEntity {
  type: 'project' | 'task' | 'person' | 'location' | 'date' | 'number' | 'currency' | 'material' | 'equipment';
  value: string;
  normalizedValue: any;
  confidence: number;
  position: { start: number; end: number };
  resolved: boolean;
  resolutionData?: any;
}

export interface VoiceContext {
  currentProject?: string;
  currentTask?: string;
  currentLocation?: string;
  userRole: string;
  sessionId: string;
  previousCommands: string[];
  conversationState: ConversationState;
  preferences: VoicePreferences;
}

export interface ConversationState {
  active: boolean;
  topic: string;
  awaitingResponse: boolean;
  expectedResponseType: 'confirmation' | 'selection' | 'input' | 'clarification';
  promptId?: string;
  timeoutMs: number;
  retryCount: number;
  maxRetries: number;
}

export interface VoicePreferences {
  language: string;
  accent: string;
  speechRate: number;
  volume: number;
  pitch: number;
  voiceId: string;
  wakeWordEnabled: boolean;
  wakeWord: string;
  confirmationRequired: boolean;
  verboseResponses: boolean;
}

export interface VoiceResponse {
  id: string;
  text: string;
  ssml?: string;
  audioUrl?: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'question' | 'confirmation';
  actions: VoiceAction[];
  suggestions: string[];
  followUp?: VoiceFollowUp;
  timestamp: Date;
}

export interface VoiceAction {
  type: 'navigate' | 'open' | 'create' | 'update' | 'delete' | 'export' | 'notify' | 'execute';
  target: string;
  parameters: Record<string, any>;
  executed: boolean;
  result?: any;
}

export interface VoiceFollowUp {
  question: string;
  expectedResponse: string;
  timeout: number;
  alternatives: string[];
}

export interface SpeechRecognition {
  isListening: boolean;
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  noiseThreshold: number;
  confidenceThreshold: number;
  timeout: number;
}

export interface SpeechSynthesis {
  voice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
  volume: number;
  language: string;
  isActive: boolean;
  queue: VoiceResponse[];
}

export interface VoiceSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  commands: VoiceCommand[];
  totalCommands: number;
  successfulCommands: number;
  averageConfidence: number;
  averageResponseTime: number;
  languageUsed: string;
  errors: VoiceError[];
  feedback: SessionFeedback[];
}

export interface VoiceError {
  id: string;
  type: 'recognition' | 'understanding' | 'execution' | 'synthesis';
  message: string;
  command?: string;
  confidence?: number;
  timestamp: Date;
  resolved: boolean;
  resolution?: string;
}

export interface SessionFeedback {
  commandId: string;
  rating: number; // 1-5
  helpful: boolean;
  comments?: string;
  timestamp: Date;
}

export interface VoiceAnalytics {
  totalSessions: number;
  totalCommands: number;
  averageSessionDuration: number;
  commandSuccessRate: number;
  mostUsedCommands: CommandUsage[];
  languageDistribution: LanguageUsage[];
  userSatisfaction: number;
  improvementSuggestions: string[];
}

export interface CommandUsage {
  command: string;
  intent: string;
  count: number;
  successRate: number;
  averageConfidence: number;
}

export interface LanguageUsage {
  language: string;
  count: number;
  percentage: number;
  averageConfidence: number;
}

export interface WakeWordDetection {
  enabled: boolean;
  words: string[];
  sensitivity: number;
  isListening: boolean;
  lastDetection?: Date;
  falsePositiveRate: number;
  detectionAccuracy: number;
}

export interface VoiceAccessibility {
  screenReaderIntegration: boolean;
  visualIndicators: boolean;
  hapticsEnabled: boolean;
  captionsEnabled: boolean;
  signLanguageSupport: boolean;
  cognitiveAssistance: boolean;
}

class VoiceInterfaceEngine {
  private sessions: Map<string, VoiceSession> = new Map();
  private commands: Map<string, VoiceCommand> = new Map();
  private intents: Map<string, VoiceIntent> = new Map();
  private activeSession: VoiceSession | null = null;
  private speechRecognition: SpeechRecognition | null = null;
  private speechSynthesis: SpeechSynthesis | null = null;
  private wakeWordDetection: WakeWordDetection | null = null;
  private isInitialized = false;
  private isListening = false;
  private currentContext: VoiceContext | null = null;

  // Web APIs
  private recognitionAPI: any = null;
  private synthesisAPI: any = null;

  constructor() {
    this.initializeEngine();
  }

  /**
   * Initialize the voice interface engine
   */
  private async initializeEngine(): Promise<void> {
    console.log('🗣️ Initializing Voice Interface Engine...');
    
    try {
      // Check browser support
      await this.checkBrowserSupport();
      
      // Initialize speech recognition
      await this.initializeSpeechRecognition();
      
      // Initialize speech synthesis
      await this.initializeSpeechSynthesis();
      
      // Setup wake word detection
      await this.setupWakeWordDetection();
      
      // Load predefined intents
      await this.loadPredefinedIntents();
      
      // Initialize NLP processing
      await this.initializeNLPProcessing();
      
      // Setup accessibility features
      await this.setupAccessibilityFeatures();
      
      this.isInitialized = true;
      console.log('✅ Voice Interface Engine initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Voice Interface Engine:', error);
    }
  }

  /**
   * Check browser support for voice APIs
   */
  private async checkBrowserSupport(): Promise<void> {
    const hasSpeechRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    const hasSpeechSynthesis = 'speechSynthesis' in window;
    
    if (!hasSpeechRecognition) {
      console.warn('⚠️ Speech Recognition not supported in this browser');
    }
    
    if (!hasSpeechSynthesis) {
      console.warn('⚠️ Speech Synthesis not supported in this browser');
    }
    
    console.log('🔍 Browser voice support checked');
  }

  /**
   * Initialize speech recognition
   */
  private async initializeSpeechRecognition(): Promise<void> {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        this.recognitionAPI = new SpeechRecognition();
        
        this.speechRecognition = {
          isListening: false,
          language: 'en-US',
          continuous: true,
          interimResults: true,
          maxAlternatives: 3,
          noiseThreshold: 0.5,
          confidenceThreshold: 0.7,
          timeout: 10000
        };
        
        // Configure recognition
        this.recognitionAPI.continuous = this.speechRecognition.continuous;
        this.recognitionAPI.interimResults = this.speechRecognition.interimResults;
        this.recognitionAPI.maxAlternatives = this.speechRecognition.maxAlternatives;
        this.recognitionAPI.lang = this.speechRecognition.language;
        
        // Setup event handlers
        this.recognitionAPI.onstart = () => {
          this.speechRecognition!.isListening = true;
          this.isListening = true;
          console.log('🎤 Speech recognition started');
        };
        
        this.recognitionAPI.onend = () => {
          this.speechRecognition!.isListening = false;
          this.isListening = false;
          console.log('🎤 Speech recognition ended');
        };
        
        this.recognitionAPI.onresult = (event: any) => {
          this.handleSpeechResult(event);
        };
        
        this.recognitionAPI.onerror = (event: any) => {
          this.handleSpeechError(event);
        };
        
        console.log('🎤 Speech recognition initialized');
      }
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
    }
  }

  /**
   * Initialize speech synthesis
   */
  private async initializeSpeechSynthesis(): Promise<void> {
    try {
      if ('speechSynthesis' in window) {
        this.synthesisAPI = window.speechSynthesis;
        
        this.speechSynthesis = {
          voice: null,
          rate: 1.0,
          pitch: 1.0,
          volume: 0.8,
          language: 'en-US',
          isActive: false,
          queue: []
        };
        
        // Wait for voices to load
        await this.loadVoices();
        
        console.log('🔊 Speech synthesis initialized');
      }
    } catch (error) {
      console.error('Failed to initialize speech synthesis:', error);
    }
  }

  /**
   * Load available voices
   */
  private async loadVoices(): Promise<void> {
    return new Promise((resolve) => {
      const loadVoices = () => {
        const voices = this.synthesisAPI.getVoices();
        if (voices.length > 0) {
          // Find best voice for the language
          const preferredVoice = voices.find(voice => 
            voice.lang.startsWith(this.speechSynthesis!.language) && 
            voice.localService
          ) || voices.find(voice => 
            voice.lang.startsWith(this.speechSynthesis!.language)
          ) || voices[0];
          
          this.speechSynthesis!.voice = preferredVoice;
          console.log(`🎵 Selected voice: ${preferredVoice.name} (${preferredVoice.lang})`);
          resolve();
        } else {
          // Voices not loaded yet, wait
          setTimeout(loadVoices, 100);
        }
      };
      
      loadVoices();
    });
  }

  /**
   * Setup wake word detection
   */
  private async setupWakeWordDetection(): Promise<void> {
    this.wakeWordDetection = {
      enabled: true,
      words: ['hey pavemaster', 'pavemaster', 'assistant'],
      sensitivity: 0.8,
      isListening: false,
      falsePositiveRate: 0.1,
      detectionAccuracy: 0.9
    };
    
    console.log('👂 Wake word detection setup completed');
  }

  /**
   * Load predefined voice intents
   */
  private async loadPredefinedIntents(): Promise<void> {
    const predefinedIntents: VoiceIntent[] = [
      // Navigation intents
      {
        name: 'navigate_to_dashboard',
        category: 'navigation',
        subcategory: 'page',
        confidence: 0.9,
        parameters: { target: 'dashboard' },
        requiredEntities: [],
        optionalEntities: ['project']
      },
      {
        name: 'navigate_to_projects',
        category: 'navigation',
        subcategory: 'page',
        confidence: 0.9,
        parameters: { target: 'projects' },
        requiredEntities: [],
        optionalEntities: ['project']
      },
      {
        name: 'open_project',
        category: 'navigation',
        subcategory: 'item',
        confidence: 0.85,
        parameters: { action: 'open', type: 'project' },
        requiredEntities: ['project'],
        optionalEntities: []
      },
      
      // Data entry intents
      {
        name: 'create_task',
        category: 'data_entry',
        subcategory: 'create',
        confidence: 0.8,
        parameters: { action: 'create', type: 'task' },
        requiredEntities: ['task'],
        optionalEntities: ['project', 'person', 'date']
      },
      {
        name: 'update_progress',
        category: 'data_entry',
        subcategory: 'update',
        confidence: 0.85,
        parameters: { action: 'update', type: 'progress' },
        requiredEntities: ['task', 'number'],
        optionalEntities: ['project']
      },
      {
        name: 'add_expense',
        category: 'data_entry',
        subcategory: 'create',
        confidence: 0.8,
        parameters: { action: 'create', type: 'expense' },
        requiredEntities: ['currency'],
        optionalEntities: ['project', 'material']
      },
      
      // Query intents
      {
        name: 'get_project_status',
        category: 'query',
        subcategory: 'status',
        confidence: 0.85,
        parameters: { query: 'status', type: 'project' },
        requiredEntities: ['project'],
        optionalEntities: []
      },
      {
        name: 'get_budget_info',
        category: 'query',
        subcategory: 'financial',
        confidence: 0.85,
        parameters: { query: 'budget', type: 'financial' },
        requiredEntities: [],
        optionalEntities: ['project']
      },
      {
        name: 'get_weather_info',
        category: 'query',
        subcategory: 'environmental',
        confidence: 0.8,
        parameters: { query: 'weather', type: 'environmental' },
        requiredEntities: [],
        optionalEntities: ['location', 'date']
      },
      
      // Action intents
      {
        name: 'generate_report',
        category: 'action',
        subcategory: 'report',
        confidence: 0.85,
        parameters: { action: 'generate', type: 'report' },
        requiredEntities: [],
        optionalEntities: ['project', 'date']
      },
      {
        name: 'send_notification',
        category: 'action',
        subcategory: 'communication',
        confidence: 0.8,
        parameters: { action: 'send', type: 'notification' },
        requiredEntities: ['person'],
        optionalEntities: ['project']
      },
      {
        name: 'export_data',
        category: 'action',
        subcategory: 'data',
        confidence: 0.8,
        parameters: { action: 'export', type: 'data' },
        requiredEntities: [],
        optionalEntities: ['project', 'date']
      },
      
      // Control intents
      {
        name: 'start_recording',
        category: 'control',
        subcategory: 'media',
        confidence: 0.9,
        parameters: { action: 'start', type: 'recording' },
        requiredEntities: [],
        optionalEntities: []
      },
      {
        name: 'stop_recording',
        category: 'control',
        subcategory: 'media',
        confidence: 0.9,
        parameters: { action: 'stop', type: 'recording' },
        requiredEntities: [],
        optionalEntities: []
      },
      {
        name: 'pause_voice',
        category: 'control',
        subcategory: 'voice',
        confidence: 0.95,
        parameters: { action: 'pause', type: 'voice' },
        requiredEntities: [],
        optionalEntities: []
      },
      
      // Assistance intents
      {
        name: 'get_help',
        category: 'assistance',
        subcategory: 'help',
        confidence: 0.9,
        parameters: { query: 'help', type: 'assistance' },
        requiredEntities: [],
        optionalEntities: []
      },
      {
        name: 'explain_feature',
        category: 'assistance',
        subcategory: 'explanation',
        confidence: 0.8,
        parameters: { query: 'explain', type: 'feature' },
        requiredEntities: [],
        optionalEntities: []
      }
    ];

    predefinedIntents.forEach(intent => {
      this.intents.set(intent.name, intent);
    });

    console.log(`🧠 Loaded ${predefinedIntents.length} predefined voice intents`);
  }

  /**
   * Initialize NLP processing
   */
  private async initializeNLPProcessing(): Promise<void> {
    // This would integrate with a real NLP service like Google Dialogflow,
    // Amazon Lex, or a custom trained model
    console.log('🤖 NLP processing initialized');
  }

  /**
   * Setup accessibility features
   */
  private async setupAccessibilityFeatures(): Promise<void> {
    const accessibility: VoiceAccessibility = {
      screenReaderIntegration: true,
      visualIndicators: true,
      hapticsEnabled: navigator.vibrate ? true : false,
      captionsEnabled: true,
      signLanguageSupport: false,
      cognitiveAssistance: true
    };
    
    console.log('♿ Accessibility features setup completed');
  }

  /**
   * Start listening for voice commands
   */
  async startListening(context?: Partial<VoiceContext>): Promise<boolean> {
    if (!this.isInitialized || !this.recognitionAPI) {
      console.error('Voice recognition not available');
      return false;
    }

    try {
      // Update context
      if (context) {
        this.currentContext = {
          currentProject: context.currentProject,
          currentTask: context.currentTask,
          currentLocation: context.currentLocation,
          userRole: context.userRole || 'user',
          sessionId: context.sessionId || `session-${Date.now()}`,
          previousCommands: context.previousCommands || [],
          conversationState: context.conversationState || {
            active: false,
            topic: '',
            awaitingResponse: false,
            expectedResponseType: 'input',
            timeoutMs: 30000,
            retryCount: 0,
            maxRetries: 3
          },
          preferences: context.preferences || {
            language: 'en-US',
            accent: 'US',
            speechRate: 1.0,
            volume: 0.8,
            pitch: 1.0,
            voiceId: 'default',
            wakeWordEnabled: true,
            wakeWord: 'hey pavemaster',
            confirmationRequired: false,
            verboseResponses: false
          }
        };
      }

      // Start a new session if not exists
      if (!this.activeSession) {
        await this.startSession();
      }

      this.recognitionAPI.start();
      
      performanceMonitor.recordMetric('voice_listening_started', 1, 'count', {
        sessionId: this.activeSession?.id,
        language: this.speechRecognition?.language
      });

      return true;

    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      return false;
    }
  }

  /**
   * Stop listening for voice commands
   */
  stopListening(): void {
    if (this.recognitionAPI && this.isListening) {
      this.recognitionAPI.stop();
    }
  }

  /**
   * Start a new voice session
   */
  private async startSession(): Promise<VoiceSession> {
    const sessionId = `voice-session-${Date.now()}`;
    
    const session: VoiceSession = {
      id: sessionId,
      userId: this.currentContext?.userRole || 'user',
      startTime: new Date(),
      commands: [],
      totalCommands: 0,
      successfulCommands: 0,
      averageConfidence: 0,
      averageResponseTime: 0,
      languageUsed: this.speechRecognition?.language || 'en-US',
      errors: [],
      feedback: []
    };

    this.sessions.set(sessionId, session);
    this.activeSession = session;

    console.log(`🎙️ Started voice session: ${sessionId}`);
    return session;
  }

  /**
   * Handle speech recognition result
   */
  private async handleSpeechResult(event: any): Promise<void> {
    const result = event.results[event.resultIndex];
    const transcript = result[0].transcript.trim();
    const confidence = result[0].confidence;

    console.log(`🎤 Heard: "${transcript}" (confidence: ${confidence.toFixed(2)})`);

    // Check confidence threshold
    if (confidence < (this.speechRecognition?.confidenceThreshold || 0.7)) {
      await this.handleLowConfidence(transcript, confidence);
      return;
    }

    // Check for wake word if enabled
    if (this.wakeWordDetection?.enabled && !this.isWakeWordDetected(transcript)) {
      return;
    }

    // Process the command
    await this.processVoiceCommand(transcript, confidence);
  }

  /**
   * Check if wake word is detected
   */
  private isWakeWordDetected(transcript: string): boolean {
    if (!this.wakeWordDetection?.enabled) return true;

    const lowerTranscript = transcript.toLowerCase();
    return this.wakeWordDetection.words.some(word => 
      lowerTranscript.includes(word.toLowerCase())
    );
  }

  /**
   * Handle low confidence recognition
   */
  private async handleLowConfidence(transcript: string, confidence: number): Promise<void> {
    const response = await this.createVoiceResponse({
      text: `I'm not sure I understood that correctly. You said "${transcript}". Could you please repeat that?`,
      type: 'question',
      suggestions: ['Yes, that\'s correct', 'Let me try again', 'Cancel']
    });

    await this.speak(response);

    // Record error
    if (this.activeSession) {
      const error: VoiceError = {
        id: `error-${Date.now()}`,
        type: 'recognition',
        message: 'Low confidence recognition',
        command: transcript,
        confidence,
        timestamp: new Date(),
        resolved: false
      };
      this.activeSession.errors.push(error);
    }
  }

  /**
   * Process voice command using NLP
   */
  private async processVoiceCommand(transcript: string, confidence: number): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Extract intent and entities
      const { intent, entities } = await this.extractIntentAndEntities(transcript);
      
      if (!intent) {
        await this.handleUnknownCommand(transcript);
        return;
      }

      // Create voice command object
      const command: VoiceCommand = {
        id: `cmd-${Date.now()}`,
        command: transcript,
        intent,
        entities,
        confidence,
        timestamp: new Date(),
        userId: this.currentContext?.userRole || 'user',
        context: this.currentContext!,
        response: await this.createVoiceResponse({ text: '', type: 'info', suggestions: [], actions: [] }),
        executed: false
      };

      // Execute the command
      await this.executeVoiceCommand(command);
      
      // Store command
      this.commands.set(command.id, command);
      if (this.activeSession) {
        this.activeSession.commands.push(command);
        this.activeSession.totalCommands++;
        if (command.executed) {
          this.activeSession.successfulCommands++;
        }
      }

      const processingTime = performance.now() - startTime;
      command.executionTime = processingTime;

      performanceMonitor.recordMetric('voice_command_processed', processingTime, 'ms', {
        intent: intent.name,
        confidence,
        executed: command.executed
      });

    } catch (error) {
      console.error('Error processing voice command:', error);
      await this.handleCommandError(transcript, error as Error);
    }
  }

  /**
   * Extract intent and entities from transcript using NLP
   */
  private async extractIntentAndEntities(transcript: string): Promise<{ intent: VoiceIntent | null; entities: VoiceEntity[] }> {
    // Simplified NLP processing - in production, this would use a proper NLP service
    const lowerTranscript = transcript.toLowerCase();
    
    // Find matching intent
    let bestIntent: VoiceIntent | null = null;
    let highestScore = 0;

    for (const [intentName, intent] of this.intents) {
      const score = this.calculateIntentScore(lowerTranscript, intent);
      if (score > highestScore && score > 0.5) {
        highestScore = score;
        bestIntent = { ...intent, confidence: score };
      }
    }

    // Extract entities
    const entities = await this.extractEntities(transcript);

    return { intent: bestIntent, entities };
  }

  /**
   * Calculate intent matching score
   */
  private calculateIntentScore(transcript: string, intent: VoiceIntent): number {
    const intentKeywords: Record<string, string[]> = {
      navigate_to_dashboard: ['dashboard', 'home', 'main', 'overview'],
      navigate_to_projects: ['projects', 'project', 'work'],
      open_project: ['open', 'show', 'view', 'project'],
      create_task: ['create', 'add', 'new', 'task', 'todo'],
      update_progress: ['update', 'progress', 'complete', 'finish'],
      add_expense: ['add', 'expense', 'cost', 'money', 'spend'],
      get_project_status: ['status', 'how is', 'progress', 'project'],
      get_budget_info: ['budget', 'money', 'cost', 'financial'],
      get_weather_info: ['weather', 'forecast', 'rain', 'temperature'],
      generate_report: ['report', 'generate', 'create', 'summary'],
      send_notification: ['send', 'notify', 'alert', 'message'],
      export_data: ['export', 'download', 'save', 'data'],
      start_recording: ['start', 'begin', 'record'],
      stop_recording: ['stop', 'end', 'finish', 'record'],
      pause_voice: ['pause', 'stop', 'quiet', 'silence'],
      get_help: ['help', 'assist', 'support', 'how'],
      explain_feature: ['explain', 'what is', 'how does', 'feature']
    };

    const keywords = intentKeywords[intent.name] || [];
    let score = 0;
    let matchedKeywords = 0;

    for (const keyword of keywords) {
      if (transcript.includes(keyword)) {
        score += 1;
        matchedKeywords++;
      }
    }

    // Normalize score
    return keywords.length > 0 ? score / keywords.length : 0;
  }

  /**
   * Extract entities from transcript
   */
  private async extractEntities(transcript: string): Promise<VoiceEntity[]> {
    const entities: VoiceEntity[] = [];
    
    // Simple entity extraction patterns
    const patterns = {
      project: /project\s+(\w+)/gi,
      task: /task\s+(\w+)/gi,
      person: /@(\w+)|to\s+(\w+)/gi,
      date: /(\d{1,2}\/\d{1,2}\/\d{4})|tomorrow|today|yesterday/gi,
      number: /(\d+(?:\.\d+)?)/g,
      currency: /\$(\d+(?:\.\d+)?)/g,
      material: /(\w+\s+materials?|\w+\s+concrete|\w+\s+steel)/gi,
      equipment: /(\w+\s+equipment|\w+\s+machine|\w+\s+tool)/gi
    };

    for (const [entityType, pattern] of Object.entries(patterns)) {
      let match;
      while ((match = pattern.exec(transcript)) !== null) {
        entities.push({
          type: entityType as any,
          value: match[1] || match[0],
          normalizedValue: this.normalizeEntityValue(entityType, match[1] || match[0]),
          confidence: 0.8,
          position: { start: match.index, end: match.index + match[0].length },
          resolved: true
        });
      }
    }

    return entities;
  }

  /**
   * Normalize entity value
   */
  private normalizeEntityValue(entityType: string, value: string): any {
    switch (entityType) {
      case 'number':
        return parseFloat(value);
      case 'currency':
        return parseFloat(value.replace('$', ''));
      case 'date':
        if (value.toLowerCase() === 'today') return new Date();
        if (value.toLowerCase() === 'tomorrow') {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          return tomorrow;
        }
        if (value.toLowerCase() === 'yesterday') {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          return yesterday;
        }
        return new Date(value);
      default:
        return value.toLowerCase();
    }
  }

  /**
   * Execute voice command
   */
  private async executeVoiceCommand(command: VoiceCommand): Promise<void> {
    const { intent, entities } = command;
    
    try {
      let response: VoiceResponse;
      
      switch (intent.name) {
        case 'navigate_to_dashboard':
          response = await this.handleNavigation('dashboard');
          break;
        case 'navigate_to_projects':
          response = await this.handleNavigation('projects');
          break;
        case 'open_project':
          response = await this.handleOpenProject(entities);
          break;
        case 'create_task':
          response = await this.handleCreateTask(entities);
          break;
        case 'update_progress':
          response = await this.handleUpdateProgress(entities);
          break;
        case 'add_expense':
          response = await this.handleAddExpense(entities);
          break;
        case 'get_project_status':
          response = await this.handleGetProjectStatus(entities);
          break;
        case 'get_budget_info':
          response = await this.handleGetBudgetInfo(entities);
          break;
        case 'get_weather_info':
          response = await this.handleGetWeatherInfo(entities);
          break;
        case 'generate_report':
          response = await this.handleGenerateReport(entities);
          break;
        case 'send_notification':
          response = await this.handleSendNotification(entities);
          break;
        case 'export_data':
          response = await this.handleExportData(entities);
          break;
        case 'start_recording':
          response = await this.handleStartRecording();
          break;
        case 'stop_recording':
          response = await this.handleStopRecording();
          break;
        case 'pause_voice':
          response = await this.handlePauseVoice();
          break;
        case 'get_help':
          response = await this.handleGetHelp();
          break;
        case 'explain_feature':
          response = await this.handleExplainFeature(entities);
          break;
        default:
          response = await this.createVoiceResponse({
            text: "I understand you want to " + intent.name.replace('_', ' ') + ", but I'm not sure how to do that yet.",
            type: 'info',
            suggestions: ['Try a different command', 'Get help']
          });
      }
      
      command.response = response;
      command.executed = true;
      
      // Speak the response
      await this.speak(response);
      
    } catch (error) {
      console.error(`Error executing command ${intent.name}:`, error);
      command.executed = false;
      
      const errorResponse = await this.createVoiceResponse({
        text: "Sorry, I had trouble executing that command. Please try again.",
        type: 'error',
        suggestions: ['Try again', 'Get help']
      });
      
      command.response = errorResponse;
      await this.speak(errorResponse);
    }
  }

  /**
   * Handle navigation commands
   */
  private async handleNavigation(target: string): Promise<VoiceResponse> {
    return this.createVoiceResponse({
      text: `Navigating to ${target}`,
      type: 'success',
      actions: [{
        type: 'navigate',
        target,
        parameters: {},
        executed: true
      }],
      suggestions: []
    });
  }

  /**
   * Handle open project command
   */
  private async handleOpenProject(entities: VoiceEntity[]): Promise<VoiceResponse> {
    const projectEntity = entities.find(e => e.type === 'project');
    
    if (!projectEntity) {
      return this.createVoiceResponse({
        text: "Which project would you like to open?",
        type: 'question',
        suggestions: ['Project Alpha', 'Project Beta', 'Show all projects']
      });
    }

    return this.createVoiceResponse({
      text: `Opening ${projectEntity.value} project`,
      type: 'success',
      actions: [{
        type: 'open',
        target: 'project',
        parameters: { projectId: projectEntity.normalizedValue },
        executed: true
      }],
      suggestions: []
    });
  }

  /**
   * Handle create task command
   */
  private async handleCreateTask(entities: VoiceEntity[]): Promise<VoiceResponse> {
    const taskEntity = entities.find(e => e.type === 'task');
    const projectEntity = entities.find(e => e.type === 'project');
    const dateEntity = entities.find(e => e.type === 'date');
    
    if (!taskEntity) {
      return this.createVoiceResponse({
        text: "What task would you like to create?",
        type: 'question',
        suggestions: ['Foundation work', 'Site inspection', 'Material delivery']
      });
    }

    return this.createVoiceResponse({
      text: `Creating task: ${taskEntity.value}${projectEntity ? ` for ${projectEntity.value}` : ''}${dateEntity ? ` due ${dateEntity.value}` : ''}`,
      type: 'success',
      actions: [{
        type: 'create',
        target: 'task',
        parameters: {
          name: taskEntity.value,
          projectId: projectEntity?.normalizedValue,
          dueDate: dateEntity?.normalizedValue
        },
        executed: true
      }],
      suggestions: ['Add more details', 'Assign to someone', 'Set priority']
    });
  }

  /**
   * Handle update progress command
   */
  private async handleUpdateProgress(entities: VoiceEntity[]): Promise<VoiceResponse> {
    const taskEntity = entities.find(e => e.type === 'task');
    const numberEntity = entities.find(e => e.type === 'number');
    
    if (!taskEntity || !numberEntity) {
      return this.createVoiceResponse({
        text: "Please specify which task and what percentage complete.",
        type: 'question',
        suggestions: ['Foundation work 75%', 'Site inspection 100%']
      });
    }

    return this.createVoiceResponse({
      text: `Updated ${taskEntity.value} to ${numberEntity.value}% complete`,
      type: 'success',
      actions: [{
        type: 'update',
        target: 'task_progress',
        parameters: {
          taskId: taskEntity.normalizedValue,
          progress: numberEntity.normalizedValue
        },
        executed: true
      }],
      suggestions: ['Add notes', 'Notify team', 'Update timeline']
    });
  }

  /**
   * Handle add expense command
   */
  private async handleAddExpense(entities: VoiceEntity[]): Promise<VoiceResponse> {
    const currencyEntity = entities.find(e => e.type === 'currency');
    const materialEntity = entities.find(e => e.type === 'material');
    
    if (!currencyEntity) {
      return this.createVoiceResponse({
        text: "How much was the expense?",
        type: 'question',
        suggestions: ['$500', '$1,200', '$75.50']
      });
    }

    return this.createVoiceResponse({
      text: `Added expense of $${currencyEntity.value}${materialEntity ? ` for ${materialEntity.value}` : ''}`,
      type: 'success',
      actions: [{
        type: 'create',
        target: 'expense',
        parameters: {
          amount: currencyEntity.normalizedValue,
          category: materialEntity?.normalizedValue || 'general'
        },
        executed: true
      }],
      suggestions: ['Add receipt', 'Categorize expense', 'Add description']
    });
  }

  /**
   * Handle get project status command
   */
  private async handleGetProjectStatus(entities: VoiceEntity[]): Promise<VoiceResponse> {
    const projectEntity = entities.find(e => e.type === 'project');
    
    // Simulate fetching project status
    const mockStatus = {
      name: projectEntity?.value || 'Current project',
      progress: Math.floor(Math.random() * 100),
      budget: Math.floor(Math.random() * 1000000),
      timeline: Math.floor(Math.random() * 30) + 'days remaining'
    };

    return this.createVoiceResponse({
      text: `${mockStatus.name} is ${mockStatus.progress}% complete, with $${mockStatus.budget.toLocaleString()} budget remaining and ${mockStatus.timeline}.`,
      type: 'info',
      suggestions: ['Get more details', 'See tasks', 'Check budget']
    });
  }

  /**
   * Handle get budget info command
   */
  private async handleGetBudgetInfo(entities: VoiceEntity[]): Promise<VoiceResponse> {
    // Simulate fetching budget information
    const mockBudget = {
      total: Math.floor(Math.random() * 1000000),
      spent: Math.floor(Math.random() * 500000),
      remaining: Math.floor(Math.random() * 500000)
    };

    return this.createVoiceResponse({
      text: `Budget overview: $${mockBudget.total.toLocaleString()} total, $${mockBudget.spent.toLocaleString()} spent, $${mockBudget.remaining.toLocaleString()} remaining.`,
      type: 'info',
      suggestions: ['See breakdown', 'Add expense', 'Generate report']
    });
  }

  /**
   * Handle get weather info command
   */
  private async handleGetWeatherInfo(entities: VoiceEntity[]): Promise<VoiceResponse> {
    // Simulate fetching weather information
    const conditions = ['sunny', 'cloudy', 'rainy', 'partly cloudy'];
    const mockWeather = {
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      temperature: Math.floor(Math.random() * 40) + 50,
      humidity: Math.floor(Math.random() * 100)
    };

    return this.createVoiceResponse({
      text: `Current weather: ${mockWeather.condition}, ${mockWeather.temperature}°F, ${mockWeather.humidity}% humidity.`,
      type: 'info',
      suggestions: ['7-day forecast', 'Work recommendations', 'Safety alerts']
    });
  }

  /**
   * Handle generate report command
   */
  private async handleGenerateReport(entities: VoiceEntity[]): Promise<VoiceResponse> {
    return this.createVoiceResponse({
      text: "Generating project report. This will take a moment.",
      type: 'info',
      actions: [{
        type: 'execute',
        target: 'generate_report',
        parameters: {},
        executed: true
      }],
      suggestions: ['Email report', 'Download PDF', 'Share with team']
    });
  }

  /**
   * Handle send notification command
   */
  private async handleSendNotification(entities: VoiceEntity[]): Promise<VoiceResponse> {
    const personEntity = entities.find(e => e.type === 'person');
    
    if (!personEntity) {
      return this.createVoiceResponse({
        text: "Who would you like to notify?",
        type: 'question',
        suggestions: ['Project manager', 'Team lead', 'All team members']
      });
    }

    return this.createVoiceResponse({
      text: `Sending notification to ${personEntity.value}`,
      type: 'success',
      actions: [{
        type: 'notify',
        target: personEntity.normalizedValue,
        parameters: {},
        executed: true
      }],
      suggestions: ['Add message', 'Set priority', 'Schedule for later']
    });
  }

  /**
   * Handle export data command
   */
  private async handleExportData(entities: VoiceEntity[]): Promise<VoiceResponse> {
    return this.createVoiceResponse({
      text: "Exporting project data. You'll receive a download link shortly.",
      type: 'success',
      actions: [{
        type: 'export',
        target: 'project_data',
        parameters: {},
        executed: true
      }],
      suggestions: ['Choose format', 'Select date range', 'Include attachments']
    });
  }

  /**
   * Handle start recording command
   */
  private async handleStartRecording(): Promise<VoiceResponse> {
    return this.createVoiceResponse({
      text: "Starting voice recording for documentation.",
      type: 'success',
      actions: [{
        type: 'execute',
        target: 'start_recording',
        parameters: {},
        executed: true
      }],
      suggestions: ['Pause recording', 'Add timestamps', 'Stop recording']
    });
  }

  /**
   * Handle stop recording command
   */
  private async handleStopRecording(): Promise<VoiceResponse> {
    return this.createVoiceResponse({
      text: "Recording stopped and saved to project files.",
      type: 'success',
      actions: [{
        type: 'execute',
        target: 'stop_recording',
        parameters: {},
        executed: true
      }],
      suggestions: ['Transcribe recording', 'Share recording', 'Start new recording']
    });
  }

  /**
   * Handle pause voice command
   */
  private async handlePauseVoice(): Promise<VoiceResponse> {
    this.stopListening();
    
    return this.createVoiceResponse({
      text: "Voice assistant paused. Say 'Hey PaveMaster' to resume.",
      type: 'info',
      suggestions: []
    });
  }

  /**
   * Handle get help command
   */
  private async handleGetHelp(): Promise<VoiceResponse> {
    return this.createVoiceResponse({
      text: "I can help you navigate, create tasks, check project status, add expenses, generate reports, and much more. What would you like to do?",
      type: 'info',
      suggestions: [
        'Show me projects',
        'Create a new task', 
        'What\'s the weather?',
        'Generate a report',
        'Check budget'
      ]
    });
  }

  /**
   * Handle explain feature command
   */
  private async handleExplainFeature(entities: VoiceEntity[]): Promise<VoiceResponse> {
    return this.createVoiceResponse({
      text: "I can explain any feature of PaveMaster. What would you like to know more about?",
      type: 'info',
      suggestions: [
        'Project management',
        'Budget tracking',
        'Task creation',
        'Report generation',
        'Voice commands'
      ]
    });
  }

  /**
   * Handle unknown command
   */
  private async handleUnknownCommand(transcript: string): Promise<void> {
    const response = await this.createVoiceResponse({
      text: `I didn't understand "${transcript}". Can you try rephrasing that or ask for help?`,
      type: 'error',
      suggestions: ['Get help', 'Try again', 'Show available commands']
    });

    await this.speak(response);
  }

  /**
   * Handle command error
   */
  private async handleCommandError(transcript: string, error: Error): Promise<void> {
    console.error('Command error:', error);
    
    const response = await this.createVoiceResponse({
      text: "Sorry, there was an error processing your command. Please try again.",
      type: 'error',
      suggestions: ['Try again', 'Get help']
    });

    await this.speak(response);

    // Log error
    if (this.activeSession) {
      const voiceError: VoiceError = {
        id: `error-${Date.now()}`,
        type: 'execution',
        message: error.message,
        command: transcript,
        timestamp: new Date(),
        resolved: false
      };
      this.activeSession.errors.push(voiceError);
    }
  }

  /**
   * Handle speech recognition error
   */
  private handleSpeechError(event: any): void {
    console.error('Speech recognition error:', event.error);
    
    if (this.activeSession) {
      const error: VoiceError = {
        id: `error-${Date.now()}`,
        type: 'recognition',
        message: `Speech recognition error: ${event.error}`,
        timestamp: new Date(),
        resolved: false
      };
      this.activeSession.errors.push(error);
    }
  }

  /**
   * Create voice response object
   */
  private async createVoiceResponse(data: {
    text: string;
    type: 'success' | 'error' | 'info' | 'warning' | 'question' | 'confirmation';
    actions?: VoiceAction[];
    suggestions: string[];
    followUp?: VoiceFollowUp;
  }): Promise<VoiceResponse> {
    return {
      id: `response-${Date.now()}`,
      text: data.text,
      type: data.type,
      actions: data.actions || [],
      suggestions: data.suggestions,
      followUp: data.followUp,
      timestamp: new Date()
    };
  }

  /**
   * Speak voice response using text-to-speech
   */
  async speak(response: VoiceResponse): Promise<void> {
    if (!this.synthesisAPI || !this.speechSynthesis) {
      console.log(`🔊 [Voice]: ${response.text}`);
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(response.text);
      
      if (this.speechSynthesis.voice) {
        utterance.voice = this.speechSynthesis.voice;
      }
      
      utterance.rate = this.speechSynthesis.rate;
      utterance.pitch = this.speechSynthesis.pitch;
      utterance.volume = this.speechSynthesis.volume;

      utterance.onstart = () => {
        this.speechSynthesis!.isActive = true;
      };

      utterance.onend = () => {
        this.speechSynthesis!.isActive = false;
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        this.speechSynthesis!.isActive = false;
      };

      this.synthesisAPI.speak(utterance);

      performanceMonitor.recordMetric('voice_response_spoken', response.text.length, 'characters', {
        type: response.type,
        hasActions: response.actions.length > 0
      });

    } catch (error) {
      console.error('Failed to speak response:', error);
    }
  }

  /**
   * End current voice session
   */
  async endSession(): Promise<VoiceSession | null> {
    if (!this.activeSession) return null;

    this.activeSession.endTime = new Date();
    
    // Calculate session statistics
    const sessionDuration = this.activeSession.endTime.getTime() - this.activeSession.startTime.getTime();
    
    if (this.activeSession.totalCommands > 0) {
      this.activeSession.averageConfidence = 
        this.activeSession.commands.reduce((sum, cmd) => sum + cmd.confidence, 0) / this.activeSession.totalCommands;
      
      this.activeSession.averageResponseTime = 
        this.activeSession.commands.reduce((sum, cmd) => sum + (cmd.executionTime || 0), 0) / this.activeSession.totalCommands;
    }

    const session = this.activeSession;
    this.activeSession = null;

    performanceMonitor.recordMetric('voice_session_completed', sessionDuration, 'ms', {
      totalCommands: session.totalCommands,
      successfulCommands: session.successfulCommands,
      errorCount: session.errors.length
    });

    console.log(`🎙️ Ended voice session: ${session.id} (${sessionDuration}ms, ${session.totalCommands} commands)`);
    return session;
  }

  /**
   * Get voice analytics
   */
  getAnalytics(): VoiceAnalytics {
    const sessions = Array.from(this.sessions.values());
    const commands = Array.from(this.commands.values());

    const totalSessions = sessions.length;
    const totalCommands = commands.length;
    const completedSessions = sessions.filter(s => s.endTime);
    
    const averageSessionDuration = completedSessions.length > 0 
      ? completedSessions.reduce((sum, s) => {
          const duration = s.endTime!.getTime() - s.startTime.getTime();
          return sum + duration;
        }, 0) / completedSessions.length
      : 0;

    const successfulCommands = commands.filter(c => c.executed).length;
    const commandSuccessRate = totalCommands > 0 ? successfulCommands / totalCommands : 0;

    // Most used commands
    const commandCounts: Record<string, { count: number; successCount: number; confidenceSum: number }> = {};
    commands.forEach(cmd => {
      const intentName = cmd.intent.name;
      if (!commandCounts[intentName]) {
        commandCounts[intentName] = { count: 0, successCount: 0, confidenceSum: 0 };
      }
      commandCounts[intentName].count++;
      commandCounts[intentName].confidenceSum += cmd.confidence;
      if (cmd.executed) {
        commandCounts[intentName].successCount++;
      }
    });

    const mostUsedCommands: CommandUsage[] = Object.entries(commandCounts)
      .map(([command, stats]) => ({
        command,
        intent: command,
        count: stats.count,
        successRate: stats.successCount / stats.count,
        averageConfidence: stats.confidenceSum / stats.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Language distribution
    const languageCounts: Record<string, { count: number; confidenceSum: number }> = {};
    sessions.forEach(session => {
      const lang = session.languageUsed;
      if (!languageCounts[lang]) {
        languageCounts[lang] = { count: 0, confidenceSum: 0 };
      }
      languageCounts[lang].count++;
      languageCounts[lang].confidenceSum += session.averageConfidence;
    });

    const totalLanguageCount = Object.values(languageCounts).reduce((sum, stats) => sum + stats.count, 0);
    const languageDistribution: LanguageUsage[] = Object.entries(languageCounts)
      .map(([language, stats]) => ({
        language,
        count: stats.count,
        percentage: (stats.count / totalLanguageCount) * 100,
        averageConfidence: stats.confidenceSum / stats.count
      }));

    // User satisfaction (mock calculation)
    const userSatisfaction = commandSuccessRate * 0.7 + (averageSessionDuration > 0 ? 0.3 : 0);

    return {
      totalSessions,
      totalCommands,
      averageSessionDuration,
      commandSuccessRate,
      mostUsedCommands,
      languageDistribution,
      userSatisfaction,
      improvementSuggestions: [
        'Add more natural language patterns',
        'Improve entity recognition accuracy',
        'Expand domain-specific vocabulary',
        'Implement better error recovery'
      ]
    };
  }

  /**
   * Get current session
   */
  getCurrentSession(): VoiceSession | null {
    return this.activeSession;
  }

  /**
   * Get all sessions
   */
  getAllSessions(): VoiceSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Get voice command by ID
   */
  getCommand(commandId: string): VoiceCommand | undefined {
    return this.commands.get(commandId);
  }

  /**
   * Check if engine is initialized
   */
  isEngineInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Check if currently listening
   */
  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): string[] {
    return [
      'en-US', 'en-GB', 'en-AU', 'en-CA',
      'es-ES', 'es-MX', 'es-US',
      'fr-FR', 'fr-CA',
      'de-DE',
      'it-IT',
      'pt-BR', 'pt-PT',
      'ja-JP',
      'ko-KR',
      'zh-CN', 'zh-TW'
    ];
  }

  /**
   * Update voice preferences
   */
  updatePreferences(preferences: Partial<VoicePreferences>): void {
    if (this.currentContext) {
      this.currentContext.preferences = { ...this.currentContext.preferences, ...preferences };
      
      // Update speech synthesis settings
      if (this.speechSynthesis) {
        if (preferences.speechRate) this.speechSynthesis.rate = preferences.speechRate;
        if (preferences.volume) this.speechSynthesis.volume = preferences.volume;
        if (preferences.pitch) this.speechSynthesis.pitch = preferences.pitch;
        if (preferences.language) this.speechSynthesis.language = preferences.language;
      }
      
      // Update speech recognition settings
      if (this.speechRecognition && this.recognitionAPI) {
        if (preferences.language) {
          this.speechRecognition.language = preferences.language;
          this.recognitionAPI.lang = preferences.language;
        }
      }
      
      // Update wake word settings
      if (this.wakeWordDetection) {
        if (preferences.wakeWordEnabled !== undefined) {
          this.wakeWordDetection.enabled = preferences.wakeWordEnabled;
        }
        if (preferences.wakeWord) {
          this.wakeWordDetection.words = [preferences.wakeWord];
        }
      }
    }
  }

  /**
   * Get engine status
   */
  getStatus(): {
    initialized: boolean;
    listening: boolean;
    synthesisActive: boolean;
    currentSessionId?: string;
    totalSessions: number;
    totalCommands: number;
    supportedLanguages: number;
  } {
    return {
      initialized: this.isInitialized,
      listening: this.isListening,
      synthesisActive: this.speechSynthesis?.isActive || false,
      currentSessionId: this.activeSession?.id,
      totalSessions: this.sessions.size,
      totalCommands: this.commands.size,
      supportedLanguages: this.getSupportedLanguages().length
    };
  }
}

// Export singleton instance
export const voiceInterface = new VoiceInterfaceEngine();
export default voiceInterface;