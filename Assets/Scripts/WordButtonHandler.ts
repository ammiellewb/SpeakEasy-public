/**
 * WordButtonHandler - Individual button script that handles touch events for a single word button
 * This script is attached to each instantiated button to handle its specific touch interactions
 */

interface WordButtonData {
    id: number;
    word: string;
    prompt: string;
}

@component
export class WordButtonHandler extends BaseScriptComponent {
    public buttonData: WordButtonData | null = null;
    public gridComponent: any = null;

    onAwake(): void {
        this.setupTouchEvent();
    }

    private setupTouchEvent(): void {
        // Set up touch event for this specific button
        const tapEvent = this.createEvent("TapEvent");
        tapEvent.bind(() => {
            this.onButtonTapped();
        });
        
        print(`[WordButtonHandler] ✓ Set up tap event for button: ${this.sceneObject.name}`);
    }

    private onButtonTapped(): void {
        print(`[WordButtonHandler] Button tapped: ${this.sceneObject.name}`);
        
        if (!this.buttonData) {
            print(`[WordButtonHandler] ✗ No button data set for: ${this.sceneObject.name}`);
            return;
        }

        print(`[WordButtonHandler] ✓ Tapped: "${this.buttonData.word}"`);
        print(`[WordButtonHandler] ✓ Prompt: "${this.buttonData.prompt}"`);

        // Trigger speech output
        this.triggerSpeechOutput(this.buttonData.prompt);

        // Notify grid component if available
        if (this.gridComponent && typeof this.gridComponent.onWordButtonTapped === 'function') {
            this.gridComponent.onWordButtonTapped(this.buttonData);
        }
    }

    public setButtonData(data: WordButtonData): void {
        this.buttonData = data;
        print(`[WordButtonHandler] Set button data: ${JSON.stringify(data)}`);
    }

    public setGridComponent(gridComp: any): void {
        this.gridComponent = gridComp;
    }

    private triggerSpeechOutput(prompt: string): void {
        print(`[WordButtonHandler] 🔊 Triggering speech: "${prompt}"`);
        
        // Use TextToSpeechController global function
        if ((global as any).getTTSResults) {
            (global as any).getTTSResults(prompt);
            print(`[WordButtonHandler] ✓ Sent to TTS Controller: ${prompt}`);
        } else {
            print(`[WordButtonHandler] ⚠️ No TTS Controller found`);
        }
    }
}

print("[WordButtonHandler] Script loaded - Ready for individual button handling");
