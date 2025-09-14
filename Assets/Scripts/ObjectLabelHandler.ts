import { SceneController } from "./SceneController";
import { GroqAPI } from "./GroqAPI";

interface DetectedObjectData {
  id: number;
  word: string;
  prompt: string;
}

@component
export class ObjectLabelHandler extends BaseScriptComponent {
  // Reference to grid script instance (set this from outside)
  public gridScriptInstance: any;
  @input
  @hint("Reference to the SceneController to listen for detected objects")
  sceneController: SceneController;
  @input
  @hint("Reference to the GroqAPI for generating conversational prompts")
  groqAPI: GroqAPI;

  private detectedObjects: DetectedObjectData[] = [];
  private nextId: number = 13; // Starting ID as per requirements (integer)
  private lastProcessedLabels: string[] = []; // Store the raw labels for checking specific objects

  onAwake() {
    print("🚀 ObjectLabelHandler onAwake() called - Script is loading!");
    this.createEvent("OnStartEvent").bind(this.onStart.bind(this));
  }

  onStart() {
    print("=== OBJECT LABEL HANDLER DEBUG ===");
    print(`SceneController assigned: ${this.sceneController ? "YES" : "NO"}`);
    print(`GroqAPI assigned: ${this.groqAPI ? "YES" : "NO"}`);
    
    if (this.sceneController) {
      print("✅ Subscribing to onObjectsDetected event");
      // Listen for detected objects
      this.sceneController.onObjectsDetected.add((labels: string[]) => {
        print("🔥 ObjectLabelHandler received detected objects!");
        this.handleDetectedObjects(labels);
      });
    } else {
      print("❌ SceneController not assigned to ObjectLabelHandler");
    }
  }

  private handleDetectedObjects(labels: string[]) {
    // Store raw labels for specific object checking
    this.lastProcessedLabels = [...labels];
    
    // Reset detected objects for new detection
    this.detectedObjects = [];
    
    // Deduplicate labels (case-insensitive)
    const uniqueLabels = Array.from(new Set(labels.map(label => label.toLowerCase())))
      .map(label => {
        // Find the original label with its original case
        return labels.find(l => l.toLowerCase() === label) || label;
      });
    
    print(`[ObjectLabelHandler] Filtered ${labels.length} labels to ${uniqueLabels.length} unique labels`);
    
    // Process each unique label and generate prompts
    const processPromises = uniqueLabels.map((label, index) => {
      return new Promise<void>((resolve) => {
        if (this.groqAPI) {
          this.groqAPI.generateConversationalPrompt(label, (prompt: string) => {
            const objectData: DetectedObjectData = {
              id: this.nextId + index,
              word: this.capitalizeFirstLetter(label),
              prompt: prompt.replace(/^[^:]+:\s*/, '') // Remove any prefix like "AI:"
            };
            this.detectedObjects.push(objectData);
            resolve();
          });
        } else {
          // Fallback if GroqAPI is not available
          const objectData: DetectedObjectData = {
            id: this.nextId + index,
            word: this.capitalizeFirstLetter(label),
            prompt: `I see a ${label}. What would you like to know about it?`
          };
          this.detectedObjects.push(objectData);
          resolve();
        }
      });
    });
    
    // When all prompts are generated, log the final JSON and check for specific objects
    Promise.all(processPromises).then(() => {
      this.logDetectedObjects();
      this.checkForSpecificObjects(this.lastProcessedLabels);
      // Refresh grid after detected objects are ready
      if (this.gridScriptInstance && typeof this.gridScriptInstance.refreshGrid === 'function') {
        print('[ObjectLabelHandler] Calling refreshGrid on gridScriptInstance');
        this.gridScriptInstance.refreshGrid();
      }
    });
  }

  private logDetectedObjects() {
    // Format the output as a single-line JSON array
    const jsonOutput = JSON.stringify(
      this.detectedObjects.map(obj => ({
        id: obj.id,
        word: obj.word,
        prompt: obj.prompt
      }))
    );
    
    // Output the JSON array
    print(jsonOutput);
    
    // Increment ID for next detection
    this.nextId += this.detectedObjects.length;
  }

  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  private checkForSpecificObjects(labels: string[]) {
    const objectsToFind = ["book", "poster", "pizza", "phone", "laptop"];
    
    objectsToFind.forEach(targetObject => {
      const found = labels.some(label => 
        label.toLowerCase().includes(targetObject.toLowerCase())
      );
      
      if (found) {
        print(`Found specific object: ${targetObject}`);
        // Add any specific behavior for found objects here
        this.onSpecificObjectFound(targetObject);
      }
    });
  }

  private onSpecificObjectFound(objectType: string) {
    // Example actions when specific objects are found
    switch (objectType.toLowerCase()) {
      case "book":
        print("📚 Book detected - could trigger reading mode");
        break;
      case "pizza":
        print("🍕 Pizza detected - could trigger food recognition");
        break;
      case "phone":
        print("📱 Phone detected - could trigger device interaction");
        break;
    }
  }

  // Public methods to access detected objects from other scripts
  getDetectedObjects(): DetectedObjectData[] {
    print("🔍 getDetectedObjects() called");
    return [...this.detectedObjects];
  }

  getDetectedObjectsAsJson(): string {
    return JSON.stringify(this.detectedObjects, null, 2);
  }

  hasObject(objectName: string): boolean {
    return this.detectedObjects.some(obj => 
      obj.word.toLowerCase().includes(objectName.toLowerCase())
    );
  }

  getObjectCount(): number {
    return this.detectedObjects.length;
  }
}
