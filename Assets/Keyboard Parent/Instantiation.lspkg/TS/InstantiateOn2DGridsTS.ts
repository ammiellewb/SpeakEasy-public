/**
 * WordButtonGrid - TypeScript version creates a 2D grid of word buttons with speech prompts
 * Each button displays a word and triggers speech output when clicked
 */

// Word Button Data Interface
interface WordButtonData {
    id: number;
    word: string;
    prompt: string;
}

@component
export class InstantiateOn2DGridsTS extends BaseScriptComponent {
    @input
    @hint("The button prefab to instantiate")
    buttonPrefab!: ObjectPrefab;
    
    @input
    @hint("The center of the grid")
    gridCenter!: SceneObject;
    
    @input
    @hint("Number of buttons along the X axis")
    gridWidth: number = 6;
    
    @input
    @hint("Number of buttons along the Z axis")
    gridHeight: number = 2;
    
    @input
    @hint("Spacing between buttons in the X direction")
    spacingX: number = 1.5;
    
    @input
    @hint("Spacing between buttons in the Z direction")
    spacingY: number = 1.5;
    
    @input
    @hint("Fixed Y position for all buttons")
    zPosition: number = 0.0;
    
    // @input
    // @hint("Audio component for click feedback")
    // audioComponent?: AudioComponent;
    
    // @input
    // @hint("Enable audio feedback on button clicks")
    // enableAudioFeedback: boolean = true;

    // Reference to ObjectLabelHandler to get detected objects dynamically
    @input
    @hint("Reference to ObjectLabelHandler for dynamic word buttons")
    objectLabelHandler!: any; // Use correct type if available

    // Fallback static buttons if no detected objects available
    private readonly DEFAULT_WORD_BUTTONS: WordButtonData[] = [
        { id: 1, word: "Yes", prompt: "Yes, I agree with that" },
        { id: 2, word: "No", prompt: "No, I don't agree" },
        { id: 3, word: "Help", prompt: "I need help please" },
        { id: 4, word: "Stop", prompt: "Please stop what you're doing" },
        { id: 5, word: "More", prompt: "I would like more please" },
        { id: 6, word: "Eat", prompt: "I'm hungry and want to eat" },
        { id: 7, word: "Drink", prompt: "I'm thirsty and need a drink" },
        { id: 8, word: "Bathroom", prompt: "I need to use the bathroom" },
        { id: 9, word: "Tired", prompt: "I'm feeling tired and need to rest" },
        { id: 10, word: "Pain", prompt: "I'm experiencing pain and discomfort" },
        { id: 11, word: "OK", prompt: "I'm okay and feeling fine" },
        { id: 12, word: "Break", prompt: "I need to take a break" }
    ];

    // Get word buttons from both default set and ObjectLabelHandler, removing all duplicates
    private getWordButtons(): WordButtonData[] {
        let allButtons = [...this.DEFAULT_WORD_BUTTONS]; // Start with default buttons
        const wordSet = new Set(allButtons.map(btn => btn.word.toLowerCase()));
        
        if (this.objectLabelHandler) {
            const detected = this.objectLabelHandler.getDetectedObjects();
            print(`[InstantiateOn2DGridsTS] getDetectedObjects returned: ${JSON.stringify(detected)}`);
            if (Array.isArray(detected) && detected.length > 0) {
                // First deduplicate within detected objects (keep first occurrence)
                const seenDetectedWords = new Set<string>();
                const uniqueDetected = detected.filter(btn => {
                    const word = btn.word ? btn.word.toLowerCase() : '';
                    if (!word || seenDetectedWords.has(word) || wordSet.has(word)) {
                        print(`[InstantiateOn2DGridsTS] Filtering out duplicate/invalid word: ${btn.word}`);
                        return false;
                    }
                    seenDetectedWords.add(word);
                    return true;
                }).map(detectedBtn => {
                    // Ensure detected buttons have proper format with default prompts
                    return {
                        id: detectedBtn.id || (allButtons.length + seenDetectedWords.size),
                        word: detectedBtn.word,
                        prompt: detectedBtn.prompt || `I see ${detectedBtn.word}` // Default prompt if missing
                    } as WordButtonData;
                });
                
                // Combine default and unique detected buttons
                allButtons = allButtons.concat(uniqueDetected);
                print(`[InstantiateOn2DGridsTS] Combined ${this.DEFAULT_WORD_BUTTONS.length} default and ${uniqueDetected.length} unique detected buttons`);
            }
        } else {
            print('[InstantiateOn2DGridsTS] objectLabelHandler not available');
        }
        
        return allButtons; 
    }
    
    // Initialize with the proper pattern
    onAwake(): void {
        this.createEvent("OnStartEvent").bind(() => {
            this.onStart();
            print("Onstart event triggered");
        });
    }
    
    onStart(): void {
        // Set up bidirectional reference with ObjectLabelHandler
        if (this.objectLabelHandler) {
            print('[InstantiateOn2DGridsTS] Setting up grid reference in ObjectLabelHandler');
            this.objectLabelHandler.gridScriptInstance = this;
        }
        this.instantiateGrid();
    }

    // Public method to refresh grid when new objects are detected
    public refreshGrid(): void {
        // Clear all existing buttons before creating new ones
        print('[InstantiateOn2DGridsTS] Clearing existing buttons');
        const childCount = this.sceneObject.getChildrenCount();
        for (let i = childCount - 1; i >= 0; i--) {
            const child = this.sceneObject.getChild(i);
            if (child && child.name.startsWith('WordButton_')) {
                child.destroy();
            }
        }
        this.instantiateGrid();
    }
    
    instantiateGrid(): void {
        if (!this.buttonPrefab) {
            print("ERROR: Please assign a buttonPrefab in the Inspector!");
            print("SETUP: Create a prefab with Image/Text components, then assign it to buttonPrefab");
            return;
        }

        if (!this.gridCenter) {
            print("ERROR: Please assign a gridCenter SceneObject in the Inspector!");
            print("SETUP: Create an empty SceneObject to act as the grid center point");
            return;
        }

        // Get dynamic word buttons
        const wordButtons = this.getWordButtons();

        // Calculate the starting position based on the center of the grid
        const centerPosition = this.gridCenter.getTransform().getWorldPosition();
        const startPosition = new vec3(
            centerPosition.x - (this.gridWidth - 1) * this.spacingX / 2,
            centerPosition.y - (this.gridHeight - 1) * this.spacingY / 2,
            centerPosition.z + this.zPosition,
        );

        let buttonIndex = 0;

        // Loop through the rows and columns to instantiate the word buttons
        for (let z = 0; z < this.gridHeight; z++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (buttonIndex >= wordButtons.length) break;

                // Calculate the position for each button (on the XZ plane)
                const position = new vec3(
                    startPosition.x + x * this.spacingX,
                    startPosition.y + z * this.spacingY,
                    startPosition.z,
                );

                // Create a word button instance at the calculated position
                this.createWordButton(position, wordButtons[buttonIndex]);
                buttonIndex++;
            }
        }

        print(`Created ${buttonIndex} word buttons in grid`);
    }
    
    // Helper method to create a word button at a specific position
    private createWordButton(position: vec3, buttonData: WordButtonData): void {
        if (this.buttonPrefab) {
            print(`[CreateButton] Creating button for: "${buttonData.word}"`);
            
            const instance = this.buttonPrefab.instantiate(this.sceneObject);
            instance.getTransform().setWorldPosition(position);
            instance.name = `WordButton_${buttonData.id}`;
            
            print(`[CreateButton] ✓ Instance name: ${instance.name}`);
            
            // Add text component if it doesn't exist
            this.setupButtonText(instance, buttonData.word);
            
            // Add WordButtonHandler script to handle touch events
            this.setupButtonHandler(instance, buttonData);
            
            print(`[CreateButton] ✓ Created word button '${buttonData.word}' at position: ${position.x}, ${position.y}, ${position.z}`);
        }
    }

    // Setup the WordButtonHandler script on the button instance
    private setupButtonHandler(buttonInstance: any, buttonData: WordButtonData): void {
        try {
            // Create WordButtonHandler component
            const handlerScript = buttonInstance.createComponent("Component.ScriptComponent");
            if (handlerScript) {
                // Set the script type (this may need adjustment based on how Lens Studio handles script references)
                // For now, we'll store the data directly on the instance and handle touch events
                
                // Store button data on the instance
                (buttonInstance as any).buttonData = buttonData;
                (buttonInstance as any).gridComponent = this;
                
                // Set up touch event on the button instance
                const touchComponent = buttonInstance.createComponent("Component.TouchComponent");
                if (touchComponent) {
                    // Create tap event specifically for this button
                    const buttonTapEvent = handlerScript.createEvent("TapEvent");
                    if (buttonTapEvent) {
                        buttonTapEvent.bind(() => {
                            this.handleButtonTap(buttonInstance);
                        });
                        print(`[ButtonHandler] ✓ Set up tap event for: ${buttonInstance.name}`);
                    }
                }
                
                print(`[ButtonHandler] ✓ Set up handler for: ${buttonInstance.name}`);
            }
        } catch (error) {
            print(`[ButtonHandler] Error setting up handler: ${error}`);
            // Fallback: store data directly and rely on global tap handling
            (buttonInstance as any).buttonData = buttonData;
            (buttonInstance as any).gridComponent = this;
        }
    }

    // Handle tap for a specific button
    private handleButtonTap(buttonInstance: any): void {
        const buttonData = (buttonInstance as any).buttonData as WordButtonData;
        
        if (!buttonData) {
            print(`[ButtonTap] ✗ No button data for: ${buttonInstance.name}`);
            return;
        }
        
        print(`[ButtonTap] ✓ Tapped: "${buttonData.word}" - Prompt: "${buttonData.prompt}"`);
        
        // Trigger speech output
        this.triggerSpeechOutput(buttonData.prompt);
        
        // Call the callback for external systems
        this.onWordButtonTapped(buttonData);
    }

    // Public callback for when a word button is tapped
    public onWordButtonTapped(buttonData: WordButtonData): void {
        print(`[GridCallback] Word button selected: ${buttonData.word}`);
        
        // Call global handler if available
        if ((global as any).onWordButtonSelected) {
            (global as any).onWordButtonSelected(buttonData);
            print(`[GridCallback] ✓ Sent to global handler`);
        }
    }
    
    // Setup text display on the button
    private setupButtonText(buttonInstance: any, word: string): void {
        // Find and override ALL text components to ensure no "A" remains
        this.overrideAllTextComponents(buttonInstance, word);
    }
    
    // Override all text components recursively to eliminate default "A" text
    private overrideAllTextComponents(sceneObject: any, word: string): void {
        // Check the main object for text component
        const textComp = sceneObject.getComponent("Component.Text");
        if (textComp) {
            textComp.text = word;
            textComp.size = 20; // Smaller size to prevent blocking
            textComp.alignment = 1; // Center alignment
            textComp.textFill.color = new (vec4 as any)(1, 1, 1, 1); // White text
            textComp.dropshadowSettings.enabled = true;
            textComp.dropshadowSettings.offset = new (vec2 as any)(1, -1);
            textComp.dropshadowSettings.radius = 2;
            print(`Overrode text component with: ${word}`);
        }
        
        // Recursively check all children
        const childCount = sceneObject.getChildrenCount();
        for (let i = 0; i < childCount; i++) {
            const child = sceneObject.getChild(i);
            this.overrideAllTextComponents(child, word);
        }
        
        // If no text component found, create one on the main object
        if (!textComp && childCount === 0) {
            const newTextComponent = sceneObject.createComponent("Component.Text");
            if (newTextComponent) {
                newTextComponent.text = word;
                newTextComponent.size = 20;
                newTextComponent.alignment = 1;
                newTextComponent.textFill.color = new (vec4 as any)(1, 1, 1, 1);
                newTextComponent.dropshadowSettings.enabled = true;
                newTextComponent.dropshadowSettings.offset = new (vec2 as any)(1, -1);
                newTextComponent.dropshadowSettings.radius = 2;
                print(`Created new text component with: ${word}`);
            }
        }
    }
    
    // Helper function to find text component in button or its children
    private findTextComponent(sceneObject: any): any {
        // First check the main object
        const textComp = sceneObject.getComponent("Component.Text");
        if (textComp) return textComp;
        
        // Then check all children recursively
        const childCount = sceneObject.getChildrenCount();
        for (let i = 0; i < childCount; i++) {
            const child = sceneObject.getChild(i);
            const foundComp = this.findTextComponent(child);
            if (foundComp) return foundComp;
        }
        
        return null;
    }
    
    // Trigger speech output for the prompt
    private triggerSpeechOutput(prompt: string): void {
        print(`[Speech] 🔊 Triggering speech output: "${prompt}"`);
        print(`[Speech] 📝 Prompt length: ${prompt.length} characters`);
        
        // Use TextToSpeechController global function
        if ((global as any).getTTSResults) {
            (global as any).getTTSResults(prompt);
            print(`[Speech] ✓ Sent to TTS Controller: ${prompt}`);
        } else {
            // Fallback for legacy speech systems
            if ((global as any).onSpeechRequest) {
                (global as any).onSpeechRequest(prompt);
                print(`[Speech] ✓ Sent to legacy speech handler`);
            } else {
                print(`[Speech] ⚠️ No TTS Controller found - Make sure TextToSpeechController is initialized`);
            }
        }
    }
}

// Fallback global speech handler (TextToSpeechController takes priority)
if (!(global as any).onSpeechRequest) {
    (global as any).onSpeechRequest = function(prompt: string) {
        print(`[Legacy Speech Handler] Prompt: ${prompt}`);
        // This is a fallback - TextToSpeechController's getTTSResults should be used instead
        print(`[Legacy Speech Handler] ⚠️ Consider using TextToSpeechController.getTTSResults() instead`);
    };
}

print("[WordButtonGrid] TypeScript initialization complete - Ready to create word buttons with TTS speech prompts");
