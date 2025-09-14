// TextToSpeechController.ts
// Version: 0.2.0
// Event: On Awake
// Description: Synthesize any provided text in English with TextToSpeech module
// and expose Audio Track and words info results through public functions that
// can be accessed across this project
// ---- GLOBAL API USAGE ----
// Call global.getTTSResults("Provide any text input") to any provided text in English with TextToSpeech module

// Type definitions for Snap Camera Kit SDK
interface WordInfo {
    word: string;
    startTime: number;
    endTime: number;
}

interface PhonemeInfo {
    // Add phoneme properties as needed
}

interface AudioTrackAsset {
    // Add audio track properties as needed
}

interface AudioComponent {
    audioTrack: AudioTrackAsset | null;
    play(loops?: number): void;
}

interface TextToSpeechModule {
    synthesize(
        text: string,
        options: TextToSpeech.Options,
        onComplete: (audioTrackAsset: AudioTrackAsset, wordInfos: WordInfo[], phonemeInfos: PhonemeInfo[], voiceStyle: number) => void,
        onError: (error: string, description: string) => void
    ): void;
}

declare namespace TextToSpeech {
    interface Options {
        voiceName: string;
        voiceStyle: number | VoiceStyles;
        voicePace: number;
    }
    namespace Options {
        function create(): Options;
    }
    enum VoiceStyles {
        Auto = "Auto"
    }
    enum VoiceNames {
        Sasha = "Sasha",
        Sam = "Sam"
    }
}

@component
export class TextToSpeechController extends BaseScriptComponent {
    @input("Asset.TextToSpeechModule")
    @hint("Text To Speech Module")
    tts!: TextToSpeechModule;
    
    @input("Component.AudioComponent")
    @hint("Audio Component for playback")
    audio!: AudioComponent;
    
    @input
    @hint("Enable automatic voice style selection")
    autoStyleSelector: boolean = true;
    
    @input
    @hint("Voice name selection")
    voiceName: string = "Sasha";
    
    @input
    @hint("Voice style for Sasha (1-6)")
    voiceStyleSasha: number = 1;
    
    @input
    @hint("Voice style for Sam (1-6)")
    voiceStyleSam: number = 1;
    
    @input
    @hint("Voice pace (0.75 - 1.50)")
    voicePace: number = 1.0;
    
    @input
    @hint("Enable TTS preview on start")
    previewTTS: boolean = false;
    
    @input
    @hint("Preview text to speak on start")
    previewText: string = "Hello, this is a text to speech preview";

    private readonly VOICE_PACE_SCALE: number = 100;

    onAwake(): void {
        this.initialize();
    }

    private initialize(): void {
        if (!this.tts) {
            print("ERROR: Make sure to set the TTS Module in TextToSpeechController");
            return;
        }
        
        if (!this.audio) {
            print("ERROR: Make sure to set the Audio Component in TextToSpeechController");
            return;
        }

        // Set up global TTS function
        (global as any).getTTSResults = (text: string) => {
            this.getTTSResults(text);
        };

        // Preview TTS if enabled
        if (this.previewTTS && this.previewText) {
            const options = this.getOptions();
            this.tts.synthesize(this.previewText, options, 
                (audioTrackAsset, wordInfos, phonemeInfos, voiceStyle) => {
                    this.previewTTSCompleteHandler(audioTrackAsset, wordInfos, phonemeInfos, voiceStyle);
                },
                (error, description) => {
                    this.previewTTSErrorHandler(error, description);
                }
            );
        }

        print("[TextToSpeechController] Initialized successfully - global.getTTSResults is ready");
    }

    private onTTSCompleteHandler = (audioTrackAsset: AudioTrackAsset, wordInfos: WordInfo[], phonemeInfos: PhonemeInfo[], voiceStyle: number): void => {
        print("[TTS] Success - Playing audio");
        this.playTTSAudio(audioTrackAsset, this.audio);
        
        // Log word timing information
        for (let i = 0; i < wordInfos.length; i++) {
            print(`[TTS] Word: "${wordInfos[i].word}", Start: ${wordInfos[i].startTime}, End: ${wordInfos[i].endTime}`);
        }
    };

    private onTTSErrorHandler = (error: string, description: string): void => {
        print(`[TTS] Error: ${error}, Description: ${description}`);
    };

    private previewTTSCompleteHandler = (audioTrackAsset: AudioTrackAsset, wordInfos: WordInfo[], phonemeInfos: PhonemeInfo[], voiceStyle: number): void => {
        print("[TTS] Preview Event: On TTS Complete");
        this.audio.audioTrack = audioTrackAsset;
        this.audio.play(1);
    };

    private previewTTSErrorHandler = (error: string, description: string): void => {
        print(`[TTS] Preview Event Error: ${error}, Description: ${description}`);
    };

    private playTTSAudio(audioTrackAsset: AudioTrackAsset, audioComponent: AudioComponent): void {
        audioComponent.audioTrack = audioTrackAsset;
        audioComponent.play(1);
    }

    private getOptions(): TextToSpeech.Options {
        const options = TextToSpeech.Options.create();
        options.voiceName = this.voiceName;
        
        if (this.autoStyleSelector) {
            options.voiceStyle = TextToSpeech.VoiceStyles.Auto;
        } else {
            if (this.voiceName === TextToSpeech.VoiceNames.Sasha) {
                options.voiceStyle = this.voiceStyleSasha;
            } else {
                options.voiceStyle = this.voiceStyleSam;
            }
        }
        
        options.voicePace = this.voicePace * this.VOICE_PACE_SCALE;
        return options;
    }

    public getTTSResults(text: string): void {
        if (this.previewTTS) {
            print("[TTS] Alert: Preview TTS Audio might be cut off by new Audio. Uncheck Preview TTS to disable preview.");
        }
        
        print(`[TTS] Synthesizing text: "${text}"`);
        const options = this.getOptions();
        this.tts.synthesize(text, options, this.onTTSCompleteHandler, this.onTTSErrorHandler);
        print(`[TTS] Event: On TTS Create: ${text}`);
    }
}

print("[TextToSpeechController] Script loaded - Ready for initialization");
