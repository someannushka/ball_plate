
var currentIndex = 50
var canvas = document.getElementById("renderCanvas");

var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = function () { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, disableWebGL2Support: false }); };
var delayCreateScene = function () {
    // Create a scene.
    var scene = new BABYLON.Scene(engine);

    const gravityVector = new BABYLON.Vector3(0, -9.8, 0);
    const physicsPlugin = new BABYLON.CannonJSPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);

    // Create a default skybox with an environment.
    var hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("textures/forest.dds", scene);
    var currentSkybox = scene.createDefaultSkybox(hdrTexture, true);


    // Append glTF model to scene.

    // We need to execute some codes right after model load.
    // So I used constructor of .Append function as you can see and divide it to few parts.
    // After load success we start to manipulate animation.

    BABYLON.SceneLoader.Append("./", "scene.glb", scene, function (scene) {
        // Create a default arc rotate camera and light.

        scene.createDefaultCameraOrLight(true, true, true);

        for (i = 0; i < scene.materials.length; i++) {
            // lets apply this to all materials just to be sure this works...
            scene.materials[i + 12].albedoColor = new BABYLON.Color3(0.33, 0.22, 0.09);
        }

        // The default camera looks at the back of the asset.
        // Rotate the camera by 180 degrees to the front of the asset.
        scene.activeCamera.alpha += Math.PI;
    }, function (progress) {
        //console.log(progress)
    }, function (success) {

        // First we need to detect all animations on the scene and stop them at start because they are playing with auto restart at starting point.
        // Since we have only one animation group in the scene we don't need to do too many things on this side.
        // This animation flows like from bottom to top for arm movement.
        // So we need to go to middle frame of the animation.
        // success.animationGroups[i].start(false, 1000, 0, 1.14); line make us achive this.
        // we dont want to see board animate to middle frame at start so I put animation speed 1000 (so fast so eyes cant detect it)
        // 0 represents starting point and 1.14 represents middle frame


        for (let i = 0; i < success.animationGroups.length; i++) {
            success.animationGroups[i].reset();
            success.animationGroups[i].stop();
            success.animationGroups[i].start(false, 1000, 0, 1.14);
        }

    });


    return scene;
};
window.initFunction = async function () {



    var asyncEngineCreation = async function () {
        try {
            return createDefaultEngine();
        } catch (e) {
            console.log("the available createEngine function failed. Creating the default engine instead");
            return createDefaultEngine();
        }
    }

    window.engine = await asyncEngineCreation();
    if (!engine) throw 'engine should not be null.';
    window.scene = delayCreateScene();
};
initFunction().then(() => {
    console.log(document.getElementById(firstSlider.value))

    sceneToRender = scene
    engine.runRenderLoop(function () {
        if (sceneToRender && sceneToRender.activeCamera) {
            sceneToRender.render();
        }
    });
});

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});

document.getElementById("firstSlider").addEventListener("input", function (evt) {
    // We need to animate our board according to slider value
    // We don't know our current frame so I use our slider as frame index 
    // currentIndex represents last frame index
    // scene.animationGroups[0].start(false, 0.5, currentIndex / 100 * 2.28, (this.value / 100) * 2.28) move our animation
    // from current Index to slider value so board start to animate based on these values
    scene.animationGroups[0].start(false, 0.5, currentIndex / 100 * 2.28, (this.value / 100) * 2.28)
    currentIndex = this.value;
});
