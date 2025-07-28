import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Mic, MicOff, Volume2, VolumeX, MessageSquare, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface VoiceInterfaceProps {
  onTranscription?: (text: string) => void;
  onResponse?: (text: string) => void;
  className?: string;
}

export function VoiceInterface({ onTranscription, onResponse, className = "" }: VoiceInterfaceProps) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const updateAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(average / 255);

    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Set up audio context for visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => { track.stop(); });
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      updateAudioLevel();

      toast({
        title: "Recording started",
        description: "Speak now...",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording failed",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      // Send to speech-to-text
      const { data: transcriptionData, error: transcriptionError } = await supabase.functions.invoke('voice-to-text', {
        body: { audio: base64Audio }
      });

      if (transcriptionError) throw transcriptionError;

      const transcribedText = transcriptionData.text;
      setTranscript(transcribedText);
      onTranscription?.(transcribedText);

      // Generate AI response
      const { data: responseData, error: responseError } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          message: transcribedText,
          context: 'voice_interface'
        }
      });

      if (responseError) throw responseError;

      const aiResponse = responseData.response;
      onResponse?.(aiResponse);

      // Convert response to speech
      const { data: speechData, error: speechError } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: aiResponse,
          voice: 'alloy'
        }
      });

      if (speechError) throw speechError;

      // Play the audio response
      await playAudioResponse(speechData.audioContent);

      toast({
        title: "Processing complete",
        description: "AI response generated and played",
      });
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Processing failed",
        description: "Could not process voice command",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudioResponse = async (base64Audio: string) => {
    setIsSpeaking(true);
    
    try {
      const audioData = atob(base64Audio);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }

      const audioBlob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsSpeaking(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Voice Assistant
          </h3>
          <div className="flex items-center gap-2">
            {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSpeaking && <Volume2 className="h-4 w-4 text-primary animate-pulse" />}
          </div>
        </div>

        {/* Audio Level Visualization */}
        {isRecording && (
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-100 ease-out"
              style={{ width: `${Math.min(audioLevel * 100, 100)}%` }}
            />
          </div>
        )}

        {/* Status */}
        <div className="flex flex-wrap gap-2">
          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              <Mic className="h-3 w-3 mr-1" />
              Recording
            </Badge>
          )}
          {isProcessing && (
            <Badge variant="secondary">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Processing
            </Badge>
          )}
          {isSpeaking && (
            <Badge variant="default">
              <Volume2 className="h-3 w-3 mr-1" />
              Speaking
            </Badge>
          )}
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">You said:</p>
            <p className="text-sm">{transcript}</p>
          </div>
        )}

        {/* Control Button */}
        <Button
          onClick={toggleRecording}
          disabled={isProcessing || isSpeaking}
          variant={isRecording ? "destructive" : "default"}
          className="w-full"
          size="lg"
        >
          {isRecording ? (
            <>
              <MicOff className="h-4 w-4 mr-2" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 mr-2" />
              Start Recording
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Click to start voice conversation with AI assistant
        </p>
      </CardContent>
    </Card>
  );
}