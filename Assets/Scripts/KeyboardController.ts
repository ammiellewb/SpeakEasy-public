import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";
import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";
import { InteractorEvent } from "SpectaclesInteractionKit.lspkg/Core/Interactor/InteractorEvent";

@component
export class KeyboardController extends BaseScriptComponent {
  @input
  @hint("Reference to the yellow button (TouchUpDownButton) Interactable component")
  touchUpDownButton: Interactable;

  onKeyPressed = new Event<void>();

  onAwake() {
    this.createEvent("OnStartEvent").bind(this.onStart.bind(this));
  }

  onStart() {
    // Only trigger when the specific TouchUpDownButton is interacted with
    if (this.touchUpDownButton) {
      this.touchUpDownButton.onTriggerStart.add((interactorEvent: InteractorEvent) => {
        print("TouchUpDownButton trigger activated for object detection");
        this.onKeyPressed.invoke();
      });
    } else {
      print("Warning: TouchUpDownButton not assigned to KeyboardController");
    }
  }
}
