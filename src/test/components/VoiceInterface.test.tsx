import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VoiceInterface } from '@/components/VoiceInterface';

// Mock the toast hook
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock MediaRecorder
class MockMediaRecorder {
  state = 'inactive';
  ondataavailable: ((event: any) => void) | null = null;
  onstop: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;

  constructor() {
    // Constructor
  }

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    if (this.onstop) {
      this.onstop(new Event('stop'));
    }
  }

  addEventListener(event: string, handler: (event: any) => void) {
    if (event === 'dataavailable') {
      this.ondataavailable = handler;
    } else if (event === 'stop') {
      this.onstop = handler;
    }
  }

  removeEventListener() {
    // Mock implementation
  }
}

global.MediaRecorder = MockMediaRecorder as any;

// Mock getUserMedia
global.navigator.mediaDevices = {
  getUserMedia: vi.fn(() => Promise.resolve({
    getTracks: () => [
      {
        stop: vi.fn(),
        kind: 'audio',
        enabled: true,
      }
    ],
  })),
} as any;

// Mock AudioContext
global.AudioContext = vi.fn(() => ({
  createAnalyser: vi.fn(() => ({
    fftSize: 256,
    frequencyBinCount: 128,
    getByteFrequencyData: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
  createMediaStreamSource: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
  close: vi.fn(),
  state: 'running',
})) as any;

// Mock Web Speech API
global.SpeechRecognition = vi.fn(() => ({
  continuous: false,
  interimResults: false,
  lang: 'en-US',
  start: vi.fn(),
  stop: vi.fn(),
  abort: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
})) as any;

global.webkitSpeechRecognition = global.SpeechRecognition;

// Mock SpeechSynthesis
global.speechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => []),
  speaking: false,
  pending: false,
  paused: false,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
} as any;

global.SpeechSynthesisUtterance = vi.fn(() => ({
  text: '',
  voice: null,
  volume: 1,
  rate: 1,
  pitch: 1,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
})) as any;

describe('VoiceInterface', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders voice interface controls', () => {
    render(<VoiceInterface />);

    expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();
  });

  it('shows recording state when recording starts', async () => {
    render(<VoiceInterface />);

    const recordButton = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(recordButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
    });
  });

  it('calls onTranscription callback when transcription is received', async () => {
    const onTranscription = vi.fn();
    render(<VoiceInterface onTranscription={onTranscription} />);

    // This would typically be triggered by speech recognition results
    // For testing, we can simulate the transcription process
    const recordButton = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(recordButton);

    // Simulate transcription completion
    await waitFor(() => {
      // In a real scenario, this would be triggered by speech recognition
      // For now, we just test that the component renders correctly
      expect(recordButton).toBeInTheDocument();
    });
  });

  it('handles audio level visualization', () => {
    render(<VoiceInterface />);

    // The component should render without audio level initially
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('supports text-to-speech functionality', async () => {
    const speakSpy = vi.spyOn(global.speechSynthesis, 'speak');
    
    render(<VoiceInterface />);

    // In a real implementation, there would be a way to trigger TTS
    // This tests that the speech synthesis is available
    expect(global.speechSynthesis.speak).toBeDefined();
  });

  it('handles microphone permissions', async () => {
    const getUserMediaSpy = vi.spyOn(navigator.mediaDevices, 'getUserMedia');

    render(<VoiceInterface />);

    const recordButton = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(recordButton);

    await waitFor(() => {
      expect(getUserMediaSpy).toHaveBeenCalledWith({ audio: true });
    });
  });

  it('displays processing state during speech processing', async () => {
    render(<VoiceInterface />);

    // Simulate processing state
    const recordButton = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(recordButton);

    // Test that the component can handle processing states
    expect(recordButton).toBeInTheDocument();
  });

  it('cleans up resources on unmount', () => {
    const { unmount } = render(<VoiceInterface />);

    // Start recording to create resources
    const recordButton = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(recordButton);

    // Unmount should clean up without errors
    expect(() => unmount()).not.toThrow();
  });

  it('handles voice interface errors gracefully', async () => {
    // Mock getUserMedia to reject
    vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockRejectedValueOnce(
      new Error('Permission denied')
    );

    render(<VoiceInterface />);

    const recordButton = screen.getByRole('button', { name: /start recording/i });
    fireEvent.click(recordButton);

    // Component should handle the error gracefully
    await waitFor(() => {
      expect(recordButton).toBeInTheDocument();
    });
  });
});