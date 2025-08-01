import { useState, useEffect, useRef } from 'react';
import { Button } from './button';
import { Card } from './card';
import { Badge } from './badge';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceCommanderProps {
  onCommand?: (command: string) => void;
  className?: string;
}

export function VoiceCommander({ onCommand, className }: VoiceCommanderProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechSynthesis = window.speechSynthesis;
    
    if (SpeechRecognition && SpeechSynthesis) {
      setIsSupported(true);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        speak('Voice commands activated');
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(interimTranscript || finalTranscript);
        
        if (finalTranscript) {
          handleVoiceCommand(finalTranscript.toLowerCase().trim());
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Voice recognition error: ' + event.error);
      };
      
      recognitionRef.current = recognition;
      synthesisRef.current = SpeechSynthesis;
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const speak = (text: string) => {
    if (!synthesisRef.current) return;
    
    // Cancel any ongoing speech
    synthesisRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthesisRef.current.speak(utterance);
  };

  const handleVoiceCommand = (command: string) => {
    console.log('Voice command received:', command);
    
    // Built-in navigation commands
    if (command.includes('go to') || command.includes('navigate to') || command.includes('open')) {
      const routes: Record<string, string> = {
        'dashboard': '/',
        'projects': '/projects',
        'equipment': '/equipment',
        'team': '/team',
        'employees': '/employees',
        'tracking': '/tracking',
        'estimates': '/estimates',
        'materials': '/materials',
        'weather': '/weather',
        'analytics': '/analytics',
        'settings': '/settings',
        'photo reports': '/photo-reports',
        'notifications': '/notifications',
        'schedule': '/schedule',
        'fleet': '/fleet',
        'safety': '/safety',
        'documents': '/documents',
        'mapping': '/mapping',
        'crm': '/crm',
        'finance': '/finance',
        'accounting': '/accounting',
        'contracts': '/contracts',
        'customer portal': '/customer-portal',
      };
      
      for (const [page, route] of Object.entries(routes)) {
        if (command.includes(page)) {
          window.location.href = route;
          speak(`Navigating to ${page}`);
          return;
        }
      }
    }
    
    // System commands
    if (command.includes('stop listening') || command.includes('disable voice')) {
      stopListening();
      speak('Voice commands disabled');
      return;
    }
    
    if (command.includes('help') || command.includes('what can you do')) {
      speak('I can help you navigate the app, create projects, check weather, and more. Try saying "go to dashboard" or "create new project"');
      return;
    }
    
    if (command.includes('time') || command.includes('what time')) {
      const time = new Date().toLocaleTimeString();
      speak(`Current time is ${time}`);
      return;
    }
    
    // Custom commands
    if (onCommand) {
      onCommand(command);
    }
    
    // Default response for unrecognized commands
    speak('Command not recognized. Try saying "help" for available commands.');
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const stopSpeaking = () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Card className={`p-4 bg-background/95 backdrop-blur border-primary/20 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Button
            variant={isListening ? "destructive" : "default"}
            size="sm"
            onClick={isListening ? stopListening : startListening}
            className="gap-2"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isListening ? 'Stop' : 'Listen'}
          </Button>
          
          <Button
            variant={isSpeaking ? "destructive" : "outline"}
            size="sm"
            onClick={stopSpeaking}
            disabled={!isSpeaking}
            className="gap-2"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {isSpeaking ? 'Stop' : 'Muted'}
          </Button>
        </div>
        
        <div className="flex gap-1">
          {isListening && <Badge variant="secondary" className="animate-pulse">Listening</Badge>}
          {isSpeaking && <Badge variant="destructive" className="animate-pulse">Speaking</Badge>}
        </div>
      </div>
      
      {transcript && (
        <div className="text-sm text-muted-foreground p-2 bg-muted/50 rounded border">
          "{transcript}"
        </div>
      )}
      
      <div className="text-xs text-muted-foreground mt-2">
        Try: "Go to dashboard", "Open projects", "Help", or "What time is it?"
      </div>
    </Card>
  );
}