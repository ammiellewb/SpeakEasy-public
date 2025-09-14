import { ButtonStateKey } from "GameController.lspkg/Scripts/ButtonState";
import { GameController } from "GameController.lspkg/GameController";

//NEW
require('LensStudio:TextInputModule');
@component
export class SceneController extends BaseScriptComponent {
  @input
  @allowUndefined
  objectVisuals: SceneObject;

  @input cameraObj: SceneObject;

  @input
  @allowUndefined
  keyboard: SceneObject;
  
  @input
  @allowUndefined
  menu: SceneObject;

  private transform: Transform = null;
  private camTrans: Transform = null;
  
  private isKeyboardOpen = false;
  private keyboardMode = 0; // 0 = menu (white text), 1 = full keyboard (bottom buttons)
  
  private gameController: GameController = GameController.getInstance();

    // Any key event handler for testing (Lens Studio compatible)
    private _onAnyKey = function(event) {
      // Trigger on any key down event from laptop keyboard
      if (event.type === "keydown") {
        print("Any key pressed - toggling keyboard (test mode)");
        this.toggleKeyboard(true);
      }
    }.bind(this);

  onAwake() {
    this.camTrans = this.cameraObj.getTransform();
    this.transform = this.getSceneObject().getTransform();
    this.createEvent("OnStartEvent").bind(this.onStart.bind(this));
    // this.objectVisuals.enabled = false;
  }

  private onStart() {
    this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
    
    // Initialize with menu mode (keyboardMode = 0)
    if (this.menu) {
      this.menu.enabled = false;
    }
    if (this.keyboard) {
      this.keyboard.enabled = true;
    }
    print("Initialized with Menu only (white text) mode");
    
    // Register button handlers before scanning
    print("Registering RT button handler");
    this.gameController.onButtonStateChanged(
      ButtonStateKey.rt,
      this.onRTPressed.bind(this)
    );
    
    print("Registering RB button handler");
    this.gameController.onButtonStateChanged(
      ButtonStateKey.rb,
      this.onRBPressed.bind(this)
    );      
    
    // Start scanning after handlers are registered
    print("Starting controller scan...");
    this.gameController.scanForControllers();
  }
  
  private onRTPressed(pressed: boolean) {
    print("RT button handler called - pressed: " + pressed);
    if (pressed) {
      print("RT button pressed - toggling keyboard");
      this.toggleKeyboard(pressed);
    }
  }
  
  private onRBPressed(pressed: boolean) {
    print("RB button handler called - pressed: " + pressed);
    if (pressed) {
      print("RB button pressed - toggling keyboard");
      this.toggleKeyboard(pressed);
    }
  }

  private toggleKeyboard(pressed: boolean) {
    if (pressed) {
      this.keyboardMode = (this.keyboardMode + 1) % 2; // Toggle between 0 and 1
      
      switch (this.keyboardMode) {
        case 0:
          // Menu (white text) - show menu, hide keyboard
          if (this.menu) {
            this.menu.enabled = true;
            print("Menu enabled: true");
          } else {
            print("Menu object is null/undefined");
          }
          if (this.keyboard) {
            this.keyboard.enabled = false;
            print("Keyboard enabled: false");
          } else {
            print("Keyboard object is null/undefined");
          }
          print("Menu (white text) mode");
          break;
        case 1:
          // Full keyboard (bottom buttons) - show keyboard, hide menu
          if (this.menu) {
            this.menu.enabled = false;
            print("Menu enabled: false");
          } else {
            print("Menu object is null/undefined");
          }
          if (this.keyboard) {
            this.keyboard.enabled = true;
            print("Keyboard enabled: true");
          } else {
            print("Keyboard object is null/undefined");
          }
          print("Full Keyboard (bottom buttons) mode");
          break;
      }
    }
  }


  private createButtonMaterial(color: vec4): Material {
    // For now, return null and set colors differently
    // This will be enhanced later with proper material creation
     return null;
   }
   
    //NEW
    showKeyboard() {
    let options = new TextInputSystem.KeyboardOptions();
    options.enablePreview = true;
    options.keyboardType = TextInputSystem.KeyboardType.Text;
    options.returnKeyType = TextInputSystem.ReturnKeyType.Return;

    global.textInputSystem.requestKeyboard(options);
    }
    //<-
  private onUpdate() {
    var buttonState = this.gameController.getButtonState();
    if (!buttonState) {
      return;
    }
    
    // Debug: Check RT and RB button states directly
    if (buttonState.rt > 0) {
      print("RT trigger detected: " + buttonState.rt);
    }
    if (buttonState.rb) {
      print("RB button detected: " + buttonState.rb);
    }
    
    //set button states in update instead of on value value changed since vertical and horizontal would come in at different times
    var moveSpeed = new vec2(
      Math.abs(buttonState.lx),
      Math.abs(buttonState.ly)
    ).distance(vec2.zero()); //0 - 1

    var joystickMoveDirection = new vec3(
      buttonState.lx,
      0,
      buttonState.ly
    ).normalize();

    // Convert joystick input into world space relative to camera’s facing direction
    var moveDir = this.camTrans
      .getWorldTransform()
      .multiplyDirection(joystickMoveDirection)
      .normalize();

    if (moveSpeed < 0.15) {
      moveSpeed = 0;
      moveDir = vec3.zero();
    }
  }
}
