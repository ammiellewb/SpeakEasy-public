/**
 * WordButtonGrid - Creates a 2D grid of word buttons with speech prompts
 * Each button displays a word and triggers speech output when clicked
 */

//@input Asset.ObjectPrefab buttonPrefab {"hint":"The button prefab to instantiate"}
//@input SceneObject gridCenter {"hint":"The center of the grid"}
//@input float gridWidth = 6 {"hint":"Number of buttons along the X axis"}
//@input float gridHeight = 2 {"hint":"Number of buttons along the Z axis"}
//@input float spacingX = 1.5 {"hint":"Spacing between buttons in the X direction"}
//@input float spacingY = 1.5 {"hint":"Spacing between buttons in the Z direction"}
//@input float zPosition = 0.0 {"hint":"Fixed Y position for all buttons"}
//@input Component.AudioComponent audioComponent {"hint":"Audio component for click feedback"}
//@input bool enableAudioFeedback = true {"hint":"Enable audio feedback on button clicks"}

// -------- Word Button Data --------
var WORD_BUTTONS = [
  { id: "yes", word: "Yes", prompt: "Yes, I agree with that" },
  { id: "no", word: "No", prompt: "No, I don't agree" },
  { id: "help", word: "Help", prompt: "I need help please" },
  { id: "stop", word: "Stop", prompt: "Please stop what you're doing" },
  { id: "more", word: "More", prompt: "I would like more please" },
  { id: "eat", word: "Eat", prompt: "I'm hungry and want to eat" },
  { id: "drink", word: "Drink", prompt: "I'm thirsty and need a drink" },
  { id: "bathroom", word: "Bathroom", prompt: "I need to use the bathroom" },
  { id: "tired", word: "Tired", prompt: "I'm feeling tired and need to rest" },
  { id: "pain", word: "Pain", prompt: "I'm experiencing pain and discomfort" },
  { id: "ok", word: "I'm OK", prompt: "I'm okay and feeling fine" },
  { id: "break", word: "Break", prompt: "I need to take a break" }
];

function InstantiateOn2DGrids() {
    // Initialize with the proper pattern
    script.createEvent("OnStartEvent").bind(onStart);
    
    function onStart() {
        instantiateGrid();
    }
    
    function instantiateGrid() {
        if (!script.buttonPrefab || !script.gridCenter) {
            print("Please assign both the button prefab and the grid center Transform.");
            return;
        }
        
        // Calculate the starting position based on the center of the grid
        var centerPosition = script.gridCenter.getTransform().getWorldPosition();
        var startPosition = new vec3(
            centerPosition.x - (script.gridWidth - 1) * script.spacingX / 2,
            centerPosition.y - (script.gridHeight - 1) * script.spacingY / 2,
            centerPosition.z + script.zPosition
        );
        
        var buttonIndex = 0;
        
        // Loop through the rows and columns to instantiate the word buttons
        for (var z = 0; z < script.gridHeight; z++) {
            for (var x = 0; x < script.gridWidth; x++) {
                if (buttonIndex >= WORD_BUTTONS.length) break;
                
                // Calculate the position for each button (on the XZ plane)
                var position = new vec3(
                    startPosition.x + x * script.spacingX,
                    startPosition.y + z * script.spacingY,
                    startPosition.z
                );
                
                // Create a word button instance at the calculated position
                createWordButton(position, WORD_BUTTONS[buttonIndex]);
                buttonIndex++;
            }
        }
        
        print("Created " + buttonIndex + " word buttons in grid");
    }
    
    // Helper method to create a word button at a specific position
    function createWordButton(position, buttonData) {
        if (script.buttonPrefab) {
            var instance = script.buttonPrefab.instantiate(script.sceneObject);
            instance.getTransform().setWorldPosition(position);
            instance.name = "WordButton_" + buttonData.id;
            
            // Store button data on the instance for later reference
            instance.buttonData = buttonData;
            
            // Add text component if it doesn't exist
            setupButtonText(instance, buttonData.word);
            
            // Add touch interaction
            setupButtonInteraction(instance);
            
            print("Created word button '" + buttonData.word + "' at position: " + position.x + ", " + position.y + ", " + position.z);
        }
    }
    
    // Setup text display on the button
    function setupButtonText(buttonInstance, word) {
        // Try to find existing text component in the prefab or its children
        var textComponent = findTextComponent(buttonInstance);
        
        if (!textComponent) {
            // Create text component if it doesn't exist
            textComponent = buttonInstance.createComponent("Component.Text");
        }
        
        if (textComponent) {
            // Force override the text
            textComponent.text = word;
            textComponent.size = 24;
            textComponent.alignment = TextAlignment.Center;
            textComponent.textFill.color = new vec4(1, 1, 1, 1); // White text
            textComponent.dropShadowSettings.enabled = true;
            textComponent.dropShadowSettings.offset = new vec2(1, -1);
            textComponent.dropShadowSettings.radius = 2;
            
            print("Set button text to: " + word);
        } else {
            print("Warning: Could not find or create text component for button");
        }
    }
    
    // Helper function to find text component in button or its children
    function findTextComponent(sceneObject) {
        // First check the main object
        var textComp = sceneObject.getComponent("Component.Text");
        if (textComp) return textComp;
        
        // Then check all children recursively
        var children = sceneObject.getChildren();
        for (var i = 0; i < children.length; i++) {
            textComp = findTextComponent(children[i]);
            if (textComp) return textComp;
        }
        
        return null;
    }
    
    // Setup touch interaction for the button
    function setupButtonInteraction(buttonInstance) {
        var touchComponent = buttonInstance.getComponent("Component.TouchComponent");
        
        if (!touchComponent) {
            touchComponent = buttonInstance.createComponent("Component.TouchComponent");
        }
        
        if (touchComponent) {
            touchComponent.interactable = true;
            touchComponent.addTapCallback(function() {
                onButtonTapped(buttonInstance);
            });
        }
    }
    
    // Handle button tap events
    function onButtonTapped(buttonInstance) {
        var buttonData = buttonInstance.buttonData;
        if (!buttonData) return;
        
        print("[WordButton] Tapped: " + buttonData.word);
        
        // Visual feedback - could add scaling or color change here
        // For now, just log the action
        
        // Audio feedback
        if (script.enableAudioFeedback && script.audioComponent) {
            script.audioComponent.play(1);
        }
        
        // Trigger speech output
        triggerSpeechOutput(buttonData.prompt);
        
        // Call global handler if available
        if (global.onWordButtonSelected) {
            global.onWordButtonSelected(buttonData);
        }
    }
    
    // Trigger speech output for the prompt
    function triggerSpeechOutput(prompt) {
        print("[Speech] Output: " + prompt);
        
        // Hook for external speech systems
        if (global.onSpeechRequest) {
            global.onSpeechRequest(prompt);
        } else {
            // Fallback - ready for TTS integration
            print("[Speech] Ready for TTS: " + prompt);
        }
    }
}

// Setup global speech handler
global.onSpeechRequest = function(prompt) {
    print("[Global Speech Handler] Prompt: " + prompt);
    // This is where you would integrate with your TTS system
    // Example: Send to phone app, use Lens Studio audio, etc.
};

// Register the script
script.WordButtonGrid = InstantiateOn2DGrids;
InstantiateOn2DGrids();

print("[WordButtonGrid] Initialization complete - Ready to create word buttons with speech prompts");
