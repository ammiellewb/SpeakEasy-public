import { GeminiAPI } from "./GeminiAPI";
import { SpeechUI } from "./SpeechUI";
import { ResponseUI } from "./ResponseUI";
import { Loading } from "./Loading";
import { DepthCache } from "./DepthCache";
import { DebugVisualizer } from "./DebugVisualizer";
import { KeyboardController } from "./KeyboardController";
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";

@component
export class SceneController extends BaseScriptComponent {
  @input
  @hint("Show debug visuals in the scene")
  showDebugVisuals: boolean = false;
  @input
  @hint("Visualizes 2D points over the camera frame for debugging")
  @allowUndefined
  debugVisualizer: DebugVisualizer;
  @input
  @hint("Handles speech input and ASR")
  @allowUndefined
  speechUI: SpeechUI;
  @input
  @hint("Handles keyboard/tap input for object detection (optional)")
  keyboardController?: KeyboardController;
  @input
  @hint("Calls to the Gemini API using Smart Gate")
  gemini: GeminiAPI;
  @input
  @hint("Displays AI speech output")
  @allowUndefined
  responseUI: ResponseUI;
  @input
  @hint("Loading visual")
  loading: Loading;
  @input
  @hint("Caches depth frame and converts pixel positions to world space")
  depthCache: DepthCache;

  // Event to expose detected object labels for external use
  onObjectsDetected = new Event<string[]>();

  private isRequestRunning = false;

  onAwake() {
    this.createEvent("OnStartEvent").bind(this.onStart.bind(this));
  }

  onStart() {
    // Listen for keyboard/tap input (if available)
    if (this.keyboardController && this.keyboardController.onKeyPressed) {
      this.keyboardController.onKeyPressed.add(() => {
        this.onObjectDetectionTriggered();
      });
    }

    // Keep speech functionality as main option
    if (this.speechUI && this.speechUI.onSpeechReady) {
      this.speechUI.onSpeechReady.add((text) => {
        this.onSpeechRecieved(text);
      });
    }
  }

  onObjectDetectionTriggered() {
    // Trigger object detection with a default prompt when keyboard/tap is pressed
    this.onSpeechRecieved("What do you see? Show me all the objects you can identify.");
  }

  onSpeechRecieved(text: string) {
    if (this.speechUI) {
      this.speechUI.activateSpeechButton(false);
    }
    if (this.isRequestRunning) {
      print("REQUEST ALREADY RUNNING");
      return;
    }
    print("MAKING REQUEST~~~~~");
    this.isRequestRunning = true;
    this.loading.activateLoder(true);
    //reset everything
    if (this.responseUI) {
      this.responseUI.clearLabels();
      this.responseUI.closeResponseBubble();
    }
    //save depth frame
    let depthFrameID = this.depthCache.saveDepthFrame();
    let camImage = this.depthCache.getCamImageWithID(depthFrameID);
    //take capture
    this.sendToGemini(camImage, text, depthFrameID);
    if (this.showDebugVisuals && this.debugVisualizer) {
      this.debugVisualizer.updateCameraFrame(camImage);
    }
  }

  private sendToGemini(
    cameraFrame: Texture,
    text: string,
    depthFrameID: number
  ) {
    this.gemini.makeGeminiRequest(cameraFrame, text, (response) => {
      this.isRequestRunning = false;
      if (this.speechUI) {
        this.speechUI.activateSpeechButton(true);
      }
      this.loading.activateLoder(false);
      print("GEMINI Points LENGTH: " + response.points.length);
      if (this.responseUI) {
        this.responseUI.openResponseBubble(response.aiMessage);
      }
      
      // Extract object labels for external use
      const detectedLabels: string[] = [];
      for (var i = 0; i < response.points.length; i++) {
        detectedLabels.push(response.points[i].label);
      }
      
      // Emit the detected labels event
      this.onObjectsDetected.invoke(detectedLabels);
      print("Detected objects: " + detectedLabels.join(", "));
      
      //create points and labels
      for (var i = 0; i < response.points.length; i++) {
        var pointObj = response.points[i];
        if (this.showDebugVisuals) {
          this.debugVisualizer.visualizeLocalPoint(
            pointObj.pixelPos,
            cameraFrame
          );
        }
        var worldPosition = this.depthCache.getWorldPositionWithID(
          pointObj.pixelPos,
          depthFrameID
        );
        if (worldPosition != null) {
          //create and position label in world space
          if (this.responseUI) {
            this.responseUI.loadWorldLabel(
              pointObj.label,
              worldPosition,
              pointObj.showArrow
            );
          }
        }
      }
      this.depthCache.disposeDepthFrame(depthFrameID);
    });
  }
}
