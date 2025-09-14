import animate, { CancelSet } from "SpectaclesInteractionKit.lspkg/Utils/animate";

const UI_CAM_DISTANCE = 50;
const UI_CAM_HEIGHT = -9;

@component
export class TapUI extends BaseScriptComponent {
  @input mainCamObj: SceneObject;
  @input tapPromptAnchor: SceneObject;
  @input tapPromptText: Text;
  @input tapButtonCollider: ColliderComponent;

  private tapPromptTrans: Transform;
  private trans: Transform;
  private mainCamTrans: Transform;
  private isActive: boolean = true;

  onAwake() {
    this.tapPromptTrans = this.tapPromptAnchor.getTransform();
    this.tapPromptTrans.setLocalScale(vec3.one());
    this.trans = this.getSceneObject().getTransform();
    this.mainCamTrans = this.mainCamObj.getTransform();
    this.tapPromptText.text = "Tap to detect objects";
    this.createEvent("OnStartEvent").bind(this.onStart.bind(this));
    this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
  }

  private onStart() {
    this.showTapPrompt(true);
  }

  activateTapButton(activate: boolean) {
    this.tapButtonCollider.enabled = activate;
    this.isActive = activate;
    this.showTapPrompt(activate);
  }

  onTapButtonDown() {
    print("Tap button pressed for object detection!");
    this.showTapPrompt(false);
  }

  showDetectionInProgress() {
    this.tapPromptText.text = "Detecting objects...";
    this.showTapPrompt(true);
  }

  resetToDefault() {
    this.tapPromptText.text = "Tap to detect objects";
    this.showTapPrompt(true);
  }

  private onUpdate() {
    if (!this.isActive) return;
    
    var camPos = this.mainCamTrans.getWorldPosition();
    var desiredPosition = camPos.add(
      this.mainCamTrans.forward.uniformScale(-UI_CAM_DISTANCE)
    );
    desiredPosition = desiredPosition.add(
      this.mainCamTrans.up.uniformScale(UI_CAM_HEIGHT)
    );
    this.trans.setWorldPosition(
      vec3.lerp(
        this.trans.getWorldPosition(),
        desiredPosition,
        getDeltaTime() * 10
      )
    );
    var desiredRotation = quat.lookAt(this.mainCamTrans.forward, vec3.up());
    this.trans.setWorldRotation(
      quat.slerp(
        this.trans.getWorldRotation(),
        desiredRotation,
        getDeltaTime() * 10
      )
    );
  }

  private showTapPrompt(show: boolean) {
    var currScale = this.tapPromptTrans.getLocalScale();
    var desiredScale = show ? vec3.one() : vec3.zero();
    animate({
      easing: "ease-out-elastic",
      duration: 0.5,
      update: (t) => {
        this.tapPromptTrans.setLocalScale(
          vec3.lerp(currScale, desiredScale, t)
        );
      },
      ended: null,
      cancelSet: new CancelSet(),
    });
  }
}
