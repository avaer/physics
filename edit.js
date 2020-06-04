import * as THREE from './xrpackage/three.module.js';
import {XRPackageEngine, XRPackage} from './xrpackage.js';
import {BufferGeometryUtils} from './BufferGeometryUtils.js';
import {TransformControls} from './TransformControls.js';
import {OutlineEffect} from './OutlineEffect.js';
import {XRChannelConnection} from 'https://metartc.com/xrrtc.js';
import {JSONClient} from 'https://sync.webaverse.com/sync-client.js';
import address from 'https://contracts.webaverse.com/address.js';
import abi from 'https://contracts.webaverse.com/abi.js';
import {pe, renderer, scene, camera, container, floorMesh, getSession} from './run.js';
import {downloadFile, readFile, bindUploadFileButton} from './xrpackage/util.js';

const apiHost = `https://ipfs.exokit.org/ipfs`;
const presenceEndpoint = `wss://presence.exokit.org`;
const worldsEndpoint = 'https://worlds.exokit.org';
const packagesEndpoint = 'https://packages.exokit.org';
const scenesEndpoint = 'https://scenes.exokit.org';
const network = 'rinkeby';
const infuraApiKey = '4fb939301ec543a0969f3019d74f80c2';
const rpcUrl = `https://${network}.infura.io/v3/${infuraApiKey}`;
const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
// window.web3 = web3;
const contract = new web3.eth.Contract(abi, address);

// Ammo().then(async Ammo => {

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localVector3 = new THREE.Vector3();
const localVector4 = new THREE.Vector3();
const localQuaternion = new THREE.Quaternion();
const localQuaternion2 = new THREE.Quaternion();
const localEuler = new THREE.Euler();
const localMatrix = new THREE.Matrix4();
const localMatrix2 = new THREE.Matrix4();
const localBox = new THREE.Box3();

function parseQuery(queryString) {
  var query = {};
  var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=');
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return query;
}

const targetMeshGeometry = (() => {
  const targetGeometry = BufferGeometryUtils.mergeBufferGeometries([
    new THREE.BoxBufferGeometry(0.03, 0.2, 0.03)
      .applyMatrix4(new THREE.Matrix4().makeTranslation(0, -0.1, 0)),
    new THREE.BoxBufferGeometry(0.03, 0.2, 0.03)
      .applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, 1))))
      .applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, 0.1)),
    new THREE.BoxBufferGeometry(0.03, 0.2, 0.03)
      .applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), new THREE.Vector3(1, 0, 0))))
      .applyMatrix4(new THREE.Matrix4().makeTranslation(0.1, 0, 0)),
  ]);
  return BufferGeometryUtils.mergeBufferGeometries([
    targetGeometry.clone()
      .applyMatrix4(new THREE.Matrix4().makeTranslation(-0.5, 0.5, -0.5)),
    targetGeometry.clone()
      .applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, -1, 0))))
      .applyMatrix4(new THREE.Matrix4().makeTranslation(-0.5, -0.5, -0.5)),
    targetGeometry.clone()
      .applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1))))
      .applyMatrix4(new THREE.Matrix4().makeTranslation(-0.5, 0.5, 0.5)),
    targetGeometry.clone()
      .applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0))))
      .applyMatrix4(new THREE.Matrix4().makeTranslation(0.5, 0.5, -0.5)),
    targetGeometry.clone()
      .applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0))))
      .applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1))))
      .applyMatrix4(new THREE.Matrix4().makeTranslation(0.5, 0.5, 0.5)),
    targetGeometry.clone()
      .applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1))))
      .applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, -1, 0))))
      .applyMatrix4(new THREE.Matrix4().makeTranslation(-0.5, -0.5, 0.5)),
    targetGeometry.clone()
      .applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0))))
      .applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, -1, 0))))
      .applyMatrix4(new THREE.Matrix4().makeTranslation(0.5, -0.5, -0.5)),
    targetGeometry.clone()
      .applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(-1, 1, 0).normalize(), new THREE.Vector3(1, -1, 0).normalize())))
      .applyMatrix4(new THREE.Matrix4().makeTranslation(0.5, -0.5, 0.5)),
  ])// .applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0.5, 0));
})();
const targetVsh = `
  #define M_PI 3.1415926535897932384626433832795
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    float f = 1.0 + pow(sin(uTime * M_PI), 0.5) * 0.2;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * f, 1.);
  }
`;
const targetFsh = `
  uniform float uHighlight;
  uniform float uTime;
  void main() {
    float f = max(1.0 - pow(uTime, 0.5), 0.1);
    gl_FragColor = vec4(vec3(f * uHighlight), 1.0);
  }
`;
const _makeTargetMesh = () => {
  const geometry = targetMeshGeometry;
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uHighlight: {
        type: 'f',
        value: 0,
      },
      uTime: {
        type: 'f',
        value: 0,
      },
    },
    vertexShader: targetVsh,
    fragmentShader: targetFsh,
    // transparent: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  return mesh;
};

/* window.downloadTargetMesh = async () => {
  const {GLTFExporter} = await import('./GLTFExporter.js');
  const targetMesh = _makeTargetMesh();
  targetMesh.material = new THREE.MeshBasicMaterial({
    color: 0x000000,
  });
  const data = await new Promise((accept, reject) => {
    const exporter = new GLTFExporter();
    const exportScene = new THREE.Scene();
    exportScene.add(targetMesh);
    exporter.parse(exportScene, gltf => {
      accept(gltf);
    }, {
      binary: true,
      includeCustomExtensions: true,
    });
  });
  console.log('got data', data);
  const b = new Blob([data], {
    type: 'application/octet-stream',
  });
  downloadFile(b, 'target.glb');
}; */

(async () => {
  const res = await fetch('./assets/avatar.vrm');
  const b = await res.blob();
  b.name = 'model.vrm';
  const d = await XRPackage.compileFromFile(b);
  const p = new XRPackage(d);
  pe.wearAvatar(p);
})();
// pe.defaultAvatar();
// pe.setGamepadsConnected(true);

const velocity = new THREE.Vector3();
const lastGrabs = [false, false];
const lastAxes = [[0, 0], [0, 0]];
function animate(timestamp, frame) {
  /* const timeFactor = 1000;
  targetMesh.material.uniforms.uTime.value = (Date.now() % timeFactor) / timeFactor; */

  const currentSession = getSession();
  if (currentSession) {
    const {inputSources} = currentSession;
    for (let i = 0; i < inputSources.length; i++) {
      const inputSource = inputSources[i];
      const {handedness, gamepad} = inputSource;
      if (gamepad) {
        const index = handedness === 'right' ? 1 : 0;

        // buttons
        const {buttons} = gamepad;
        const grab = buttons[1].pressed;
        const lastGrab = lastGrabs[index];
        if (!lastGrab && grab) { // grip
          // console.log('gripped', handedness);
          pe.grabdown(handedness);
        } else if (lastGrab && !grab) {
          pe.grabup(handedness);
        }
        lastGrabs[index] = grab;

        // axes
        const {axes} = gamepad;
        if (handedness == 'left') {
          localVector.set(0, 0, 0);
          if (axes[0] < -0.5) {
            localVector.x += 0.015;
          } else if (axes[0] > 0.5) {
            localVector.x -= 0.015;
          }
          if (axes[1] < -0.5) {
            localVector.z += 0.015;
          } else if (axes[1] > 0.5) {
            localVector.z -= 0.015;
          }
          pe.matrix.decompose(localVector2, localQuaternion, localVector3);
          const xrCamera = pe.renderer.xr.getCamera(pe.camera);
          localQuaternion2.copy(xrCamera.quaternion).premultiply(localQuaternion);
          localEuler.setFromQuaternion(localQuaternion2, 'YXZ');
          localEuler.x = 0;
          localEuler.z = 0;
          localVector.applyEuler(localEuler);
          localVector2.add(localVector);
          pe.setMatrix(localMatrix.compose(localVector2, localQuaternion, localVector3));
        } else if (handedness === 'right') {
          const _applyRotation = r => {
            const xrCamera = pe.renderer.xr.getCamera(pe.camera);
            localMatrix
              .copy(xrCamera.matrix)
              .premultiply(pe.matrix)
              .decompose(localVector, localQuaternion, localVector2);
            localQuaternion.premultiply(localQuaternion2.setFromAxisAngle(localVector3.set(0, 1, 0), r));
            localMatrix
              .compose(localVector, localQuaternion, localVector2)
              .multiply(localMatrix2.getInverse(xrCamera.matrix));
            pe.setMatrix(localMatrix);
          };
          if (axes[0] < -0.5 && !(lastAxes[index][0] < -0.5)) {
            _applyRotation(-Math.PI*0.2);
          } else if (axes[0] > 0.5 && !(lastAxes[index][0] > 0.5)) {
            _applyRotation(Math.PI*0.2);
          }
        }
        lastAxes[index][0] = axes[0];
        lastAxes[index][1] = axes[1];
      }
    }
    
    pe.setRigMatrix(null);
  } else if (document.pointerLockElement) {
    const speed = 0.015 * (keys.shift ? 3 : 1);
    const cameraEuler = pe.camera.rotation.clone();
    cameraEuler.x = 0;
    cameraEuler.z = 0;
    localVector.set(0, 0, 0);
    if (keys.left) {
      localVector.add(new THREE.Vector3(-1, 0, 0).applyEuler(cameraEuler));
    }
    if (keys.right) {
      localVector.add(new THREE.Vector3(1, 0, 0).applyEuler(cameraEuler));
    }
    if (keys.up) {
      localVector.add(new THREE.Vector3(0, 0, -1).applyEuler(cameraEuler));
    }
    if (keys.down) {
      localVector.add(new THREE.Vector3(0, 0, 1).applyEuler(cameraEuler));
    }
    if (localVector.length() > 0) {
      localVector.normalize().multiplyScalar(speed);
    }
    velocity.add(localVector);
    pe.camera.position.add(velocity);
    pe.camera.updateMatrixWorld();
    velocity.multiplyScalar(0.7);

    if (selectedTool === 'thirdperson') {
      pe.camera.matrixWorld.decompose(localVector, localQuaternion, localVector2);
      localVector.add(localVector3.copy(avatarCameraOffset).applyQuaternion(localQuaternion));
      if (velocity.lengthSq() > 0) {
        localQuaternion.setFromUnitVectors(localVector3.set(0, 0, -1), localVector4.copy(velocity).normalize());
      }
      pe.setRigMatrix(localMatrix.compose(localVector, localQuaternion, localVector2));
    } else if (selectedTool === 'isometric') {
      pe.camera.matrixWorld.decompose(localVector, localQuaternion, localVector2);
      localVector.add(localVector3.copy(isometricCameraOffset).applyQuaternion(localQuaternion));
      if (velocity.lengthSq() > 0) {
        localQuaternion.setFromUnitVectors(localVector3.set(0, 0, -1), localVector4.copy(velocity).normalize());
      }
      pe.setRigMatrix(localMatrix.compose(localVector, localQuaternion, localVector2));
    } else if (selectedTool === 'birdseye') {
      pe.camera.matrixWorld.decompose(localVector, localQuaternion, localVector2);
      localVector.add(localVector3.set(0, -birdsEyeHeight + avatarHeight, 0));
      if (velocity.lengthSq() > 0) {
        localQuaternion.setFromUnitVectors(localVector3.set(0, 0, -1), localVector4.copy(velocity).normalize());
      }
      pe.setRigMatrix(localMatrix.compose(localVector, localQuaternion, localVector2));
    } else {
      pe.setRigMatrix(null);
    }
  } else {
    pe.setRigMatrix(null);
  }

  // const f = Math.sin((Date.now()%1000)/1000*Math.PI*2);
  // pe.setMatrix(localMatrix.compose(localVector.set(0, 0, 3 * f), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));

  renderer.render(scene, camera);

  if (pe.avatar) {
    const {pose} = pe.avatar;
    for (let i = 0; i < peerConnections.length; i++) {
      const peerConnection = peerConnections[i];
      peerConnection.send('pose', pose);
    }
  }
}
renderer.setAnimationLoop(animate);
renderer.xr.setSession(pe.fakeSession);

bindUploadFileButton(document.getElementById('import-scene-input'), async file => {
  const uint8Array = await readFile(file);
  pe.importScene(uint8Array);
});

let selectedTool = 'camera';
let avatarHeight = 1.2;
const birdsEyeHeight = 10;
const avatarCameraOffset = new THREE.Vector3(0, 0, -1);
const isometricCameraOffset = new THREE.Vector3(0, 0, -5);
const tools = Array.from(document.querySelectorAll('.tool'));
for (let i = 0; i < tools.length; i++) {
  const tool = document.getElementById('tool-' + (i+1));
  tool.addEventListener('click', e => {
    for (let i = 0; i < tools.length; i++) {
      tools[i].classList.remove('selected');
    }
    tool.classList.add('selected');

    const oldSelectedTool = selectedTool;
    selectedTool = tool.getAttribute('tool');

    if (selectedTool !== oldSelectedTool) {
      hoverTarget = null;
      for (let i = 0; i < selectTargets.length; i++) {
        const selectTarget = selectTargets[i];
        selectTarget.control && _unbindTransformControls(selectTarget);
      }
      selectTargets = [];

      switch (oldSelectedTool) {
        case 'thirdperson': {
          pe.camera.position.add(localVector.copy(avatarCameraOffset).applyQuaternion(pe.camera.quaternion));
          pe.camera.updateMatrixWorld();
          pe.setCamera(camera);
          break;
        }
        case 'isometric': {
          pe.camera.position.add(localVector.copy(isometricCameraOffset).applyQuaternion(pe.camera.quaternion));
          pe.camera.updateMatrixWorld();
          pe.setCamera(camera);
          break;
        }
        /* case 'birdseye': {
          pe.camera.position.add(localVector.copy(avatarCameraOffset).applyQuaternion(pe.camera.quaternion));
          pe.camera.updateMatrixWorld();
          pe.setCamera(camera);
          break;
        } */
      }

      let decapitate = true;
      switch (selectedTool) {
        case 'camera': {
          document.exitPointerLock();
          pe.orbitControls.enabled = true;
          pe.orbitControls.target.copy(pe.camera.position).add(new THREE.Vector3(0, 0, -3).applyQuaternion(pe.camera.quaternion));
          _resetKeys();
          velocity.set(0, 0, 0);
          break;
        }
        case 'firstperson': {
          pe.camera.position.y = avatarHeight;
          pe.camera.updateMatrixWorld();
          pe.setCamera(camera);

          document.dispatchEvent(new MouseEvent('mouseup'));
          pe.orbitControls.enabled = false;
          pe.domElement.requestPointerLock();
          break;
        }
        case 'thirdperson': {
          pe.camera.position.y = avatarHeight;
          pe.camera.position.sub(localVector.copy(avatarCameraOffset).applyQuaternion(pe.camera.quaternion));
          pe.camera.updateMatrixWorld();
          pe.setCamera(camera);

          document.dispatchEvent(new MouseEvent('mouseup'));
          pe.orbitControls.enabled = false;
          pe.domElement.requestPointerLock();
          decapitate = false;
          break;
        }
        case 'isometric': {
          pe.camera.rotation.x = -Math.PI/4;
          pe.camera.quaternion.setFromEuler(pe.camera.rotation);
          pe.camera.position.y = avatarHeight;
          pe.camera.position.sub(localVector.copy(isometricCameraOffset).applyQuaternion(pe.camera.quaternion));
          pe.camera.updateMatrixWorld();
          pe.setCamera(camera);

          document.dispatchEvent(new MouseEvent('mouseup'));
          pe.orbitControls.enabled = false;
          pe.domElement.requestPointerLock();
          decapitate = false;
          break;
        }
        case 'birdseye': {
          pe.camera.position.y = birdsEyeHeight;
          pe.camera.rotation.x = -Math.PI/2;
          pe.camera.quaternion.setFromEuler(pe.camera.rotation);
          pe.camera.updateMatrixWorld();
          pe.setCamera(camera);

          document.dispatchEvent(new MouseEvent('mouseup'));
          pe.orbitControls.enabled = false;
          pe.domElement.requestPointerLock();
          decapitate = false;
          break;
        }
        case 'select': {
          pe.orbitControls.enabled = false;
          _resetKeys();
          velocity.set(0, 0, 0);
          break;
        }
      }
      if (pe.rig) {
        if (decapitate) {
          pe.rig.decapitate();
        } else {
          pe.rig.undecapitate();
        }
      }
    }
  });
}
document.addEventListener('pointerlockchange', e => {
  if (!document.pointerLockElement) {
    tools.find(tool => tool.matches('.tool[tool=camera]')).click();
  }
});

const keys = {
  up: false,
  down: false,
  left: false,
  right: false,
  shift: false,
};
const _resetKeys = () => {
  for (const k in keys) {
    keys[k] = false;
  }
};
window.addEventListener('keydown', e => {
  switch (e.which) {
    case 49: // 1
    case 50:
    case 51:
    case 52:
    case 53:
    {
      tools[e.which - 49].click();
      break;
    }
    case 87: { // W
      if (!document.pointerLockElement) {
        // nothing
      } else {
        keys.up = true;
      }
      break;
    }
    case 65: { // A
      if (!document.pointerLockElement) {
        // nothing
      } else {
        keys.left = true;
      }
      break;
    }
    case 83: { // S
      if (!document.pointerLockElement) {
        // nothing
      } else {
        keys.down = true;
      }
      break;
    }
    case 68: { // D
      if (!document.pointerLockElement) {
        // nothing
      } else {
        keys.right = true;
      }
      break;
    }
    case 69: { // E
      if (document.pointerLockElement) {
        // nothing
      } else {
        selectTargets.forEach(selectedObjectMesh => {
          selectedObjectMesh.control.setMode('rotate');
        });
      }
      break;
    }
    case 82: { // R
      if (document.pointerLockElement) {
        pe.equip('back');
      } else {
        selectTargets.forEach(selectedObjectMesh => {
          selectedObjectMesh.control.setMode('scale');
        });
      }
      break;
    }
    case 70: { // F
      pe.grabdown('right');
      break;
    }
    case 16: { // shift
      if (document.pointerLockElement) {
        keys.shift = true;
      }
      break;
    }
    case 8: // backspace
    case 46: // del
    {
      /* if (selectedObjectMeshes.length > 0) {
        const oldSelectedObjectMeshes = selectedObjectMeshes;

        _setHoveredObjectMesh(null);
        _setSelectedObjectMesh(null, false);

        const action = createAction('removeObjects', {
          oldObjectMeshes: oldSelectedObjectMeshes,
          container,
          objectMeshes,
        });
        execute(action);
      } */
      break;
    }
  }
});
window.addEventListener('keyup', e => {
  switch (e.which) {
    case 87: { // W
      if (document.pointerLockElement) {
        keys.up = false;
      }
      break;
    }
    case 65: { // A
      if (document.pointerLockElement) {
        keys.left = false;
      }
      break;
    }
    case 83: { // S
      if (document.pointerLockElement) {
        keys.down = false;
      }
      break;
    }
    case 68: { // D
      if (document.pointerLockElement) {
        keys.right = false;
      }
      break;
    }
    case 70: { // F
      pe.grabup('right');
      break;
    }
    case 16: { // shift
      if (document.pointerLockElement) {
        keys.shift = false;
      }
      break;
    }
  }
});
window.addEventListener('mousedown', e => {
  if (document.pointerLockElement) {
    pe.grabtriggerdown('right');
    pe.grabuse('right');
  }
});
window.addEventListener('mouseup', e => {
  if (document.pointerLockElement) {
    pe.grabtriggerup('right');
  }
});

/* document.getElementById('world-name').addEventListener('change', e => {
  pe.name = e.target.value;
}); */
document.getElementById('reset-scene-button').addEventListener('click', e => {
  pe.reset();
});
/* document.getElementById('publish-scene-button').addEventListener('click', async e => {
  const hash = await pe.uploadScene();
  const res = await fetch(scenesEndpoint + '/' + hash, {
    method: 'PUT',
    body: JSON.stringify({
      name: pe.name,
      hash,
    }),
  });
  if (res.ok) {
    // nothing
  } else {
    console.warn('invalid status code: ' + res.status);
  }
}); */
document.getElementById('export-scene-button').addEventListener('click', async e => {
  const uint8Array = await pe.exportScene();
  const b = new Blob([uint8Array], {
    type: 'application/webbundle',
  });
  downloadFile(b, 'scene.wbn');
});
let shieldLevel = 1;
const _placeholdPackage = p => {
  p.visible = false;
  if (!p.placeholderBox) {
    p.placeholderBox = _makeTargetMesh();
    p.placeholderBox.package = p;
    p.placeholderBox.matrix.copy(p.matrix).decompose(p.placeholderBox.position, p.placeholderBox.quaternion, p.placeholderBox.scale);
  }
  scene.add(p.placeholderBox);
};
const _unplaceholdPackage = p => {
  p.visible = true;
  if (p.placeholderBox) {
    scene.remove(p.placeholderBox);
  }
};
document.getElementById('shield-slider').addEventListener('change', e => {
  const newShieldLevel = parseInt(e.target.value, 10);
  const {packages} = pe;
  switch (newShieldLevel) {
    case 0: {
      for (const p of packages) {
        _placeholdPackage(p);
      }
      shieldLevel = newShieldLevel;
      hoverTarget = null;
      selectTargets = [];
      break;
    }
    case 1: {
      for (const p of packages) {
        _unplaceholdPackage(p);
      }
      shieldLevel = newShieldLevel;
      hoverTarget = null;
      for (let i = 0; i < selectTargets.length; i++) {
        const selectTarget = selectTargets[i];
        selectTarget.control && _unbindTransformControls(selectTarget);
      }
      selectTargets = [];
      break;
    }
  }
});
document.getElementById('toggle-stage-button').addEventListener('click', e => {
  floorMesh.visible = !floorMesh.visible;
});
function _matrixUpdate(e) {
  const p = this;
  const matrix = e.data;
  p.placeholderBox && p.placeholderBox.matrix.copy(matrix).decompose(p.placeholderBox.position, p.placeholderBox.quaternion, p.placeholderBox.scale);
  channelConnection && jsonClient.setItem(['children', p.id, 'matrix'], matrix.toArray());
}
const _bindObject = p => {
  p.addEventListener('matrixupdate', _matrixUpdate);
};
const _unbindObject = p => {
  p.removeEventListener('matrixupdate', _matrixUpdate);
};
pe.packages.forEach(p => {
  _bindObject(p);
});
pe.addEventListener('packageadd', async e => {
  const p = e.data;

  if (shieldLevel === 0) {
    _placeholdPackage(p);
  }
  _renderObjects();

  if (channelConnection) {
    p.hash = await p.upload();

    if (p.parent) {
      jsonClient.setItem(['children', p.id], {
        id: p.id,
        hash: p.hash,
        matrix: p.matrix.toArray(),
      });
    }
  }
  _bindObject(p);
});
pe.addEventListener('packageremove', e => {
  const p = e.data;
  if (p.placeholderBox) {
    scene.remove(p.placeholderBox);
  }

  if (selectedObject === p) {
    selectedObject = null;
  }
  _renderObjects();

  if (channelConnection) {
    jsonClient.removeItem(['children', p.id]);
  }
  _unbindObject(p);
});

let hoverTarget = null;
let selectTargets = [];

const hoverOutlineEffect = new OutlineEffect(renderer, {
  defaultThickness: 0.01,
  defaultColor: new THREE.Color(0x42a5f5).toArray(),
  defaultAlpha: 0.5,
  // defaultKeepAlive: false,//true,
});
const selectOutlineEffect = new OutlineEffect(renderer, {
  defaultThickness: 0.01,
  defaultColor: new THREE.Color(0x66bb6a).toArray(),
  defaultAlpha: 0.5,
  // defaultKeepAlive: false,//true,
});

let transformControlsHovered = false;
const _bindTransformControls = o => {
  const control = new TransformControls(camera, renderer.domElement, document);
  // control.setMode(transformMode);
  control.size = 3;
  // control.visible = toolManager.getSelectedElement() === xrIframe;
  // control.enabled = control.visible;
  /* control.addEventListener('dragging-changed', e => {
    orbitControls.enabled = !e.value;
  }); */
  control.addEventListener('mouseEnter', () => {
    transformControlsHovered = true;
  });
  control.addEventListener('mouseLeave', () => {
    transformControlsHovered = false;
  });
  const _snapshotTransform = o => ({
    position: o.position.clone(),
    quaternion: o.quaternion.clone(),
    scale: o.scale.clone(),
  });
  let lastTransform = _snapshotTransform(o);
  let changed = false;
  control.addEventListener('mouseDown', () => {
    lastTransform = _snapshotTransform(o);
  });
  control.addEventListener('mouseUp', () => {
    if (changed) {
      changed = false;

      const newTransform = _snapshotTransform(o);
      o.position.copy(newTransform.position);
      o.quaternion.copy(newTransform.quaternion);
      o.scale.copy(newTransform.scale);
      o.updateMatrixWorld();
      o.package.setMatrix(o.matrix);
      /* const action = createAction('transform', {
        object: o,
        oldTransform: lastTransform,
        newTransform,
      });
      execute(action); */
      lastTransform = newTransform;
    }
  });
  control.addEventListener('objectChange', e => {
    changed = true;
  });
  control.attach(o);
  scene.add(control);
  o.control = control;
};
const _unbindTransformControls = o => {
  scene.remove(o.control);
  o.control.dispose();
  o.control = null;
  transformControlsHovered = false;
};

let renderingOutline = false;
const outlineScene = new THREE.Scene();
scene.onAfterRender = () => {
  if (renderingOutline) return;
  renderingOutline = true;

  outlineScene.position.copy(container.position);
  outlineScene.quaternion.copy(container.quaternion);
  outlineScene.scale.copy(container.scale);

  let oldHoverParent;
  if (hoverTarget) {
    oldHoverParent = hoverTarget.parent;
    outlineScene.add(hoverTarget);
  }
  hoverOutlineEffect.renderOutline(outlineScene, camera);
  if (oldHoverParent) {
    oldHoverParent.add(hoverTarget);
  }

  const oldSelectParents = selectTargets.map(o => o.parent);
  for (let i = 0; i < selectTargets.length; i++) {
    outlineScene.add(selectTargets[i]);
  }
  selectOutlineEffect.renderOutline(outlineScene, camera);
  for (let i = 0; i < selectTargets.length; i++) {
    const oldSelectParent = oldSelectParents[i];
    oldSelectParent && oldSelectParent.add(selectTargets[i]);
  }

  renderingOutline = false;
};

const raycaster = new THREE.Raycaster();
const _updateRaycasterFromMouseEvent = (raycaster, e) => {
  const mouse = new THREE.Vector2(( ( e.clientX ) / window.innerWidth ) * 2 - 1, - ( ( e.clientY ) / window.innerHeight ) * 2 + 1);
  raycaster.setFromCamera(mouse, pe.camera);
  // raycaster.ray.origin.add(raycaster.ray.direction);
};
const _updateMouseMovement = e => {
  const {movementX, movementY} = e;
  if (selectedTool === 'thirdperson') {
    pe.camera.position.add(localVector.copy(avatarCameraOffset).applyQuaternion(pe.camera.quaternion));
  } else if (selectedTool === 'isometric') {
    pe.camera.position.add(localVector.copy(isometricCameraOffset).applyQuaternion(pe.camera.quaternion));
  } else if (selectedTool === 'birdseye') {
    pe.camera.rotation.x = -Math.PI/2;
    pe.camera.quaternion.setFromEuler(pe.camera.rotation);
    // pe.camera.updateMatrixWorld();
    // pe.setCamera(camera);
  }

  pe.camera.rotation.y -= movementX * Math.PI*2*0.001;
  if (selectedTool !== 'isometric' && selectedTool !== 'birdseye') {
    pe.camera.rotation.x -= movementY * Math.PI*2*0.001;
    pe.camera.rotation.x = Math.min(Math.max(pe.camera.rotation.x, -Math.PI/2), Math.PI/2);
    pe.camera.quaternion.setFromEuler(pe.camera.rotation);
  }

  if (selectedTool === 'thirdperson') {
    pe.camera.position.sub(localVector.copy(avatarCameraOffset).applyQuaternion(pe.camera.quaternion));
  } else if (selectedTool === 'isometric') {
    pe.camera.position.sub(localVector.copy(isometricCameraOffset).applyQuaternion(pe.camera.quaternion));
  }
  pe.camera.updateMatrixWorld();
  pe.setCamera(camera);
};
renderer.domElement.addEventListener('mousemove', e => {
  if (selectedTool === 'firstperson' || selectedTool === 'thirdperson' || selectedTool === 'isometric' || selectedTool === 'birdseye') {
    _updateMouseMovement(e);
  } else if (selectedTool === 'select' && !getSession()) {
    _updateRaycasterFromMouseEvent(raycaster, e);

    hoverTarget = null;
    if (shieldLevel === 0) {
      for (let i = 0; i < pe.packages.length; i++) {
        const p = pe.packages[i];
        p.matrix.decompose(localVector, localQuaternion, localVector2);
        localVector.add(localVector3.set(0, 1/2, 0));
        localBox.setFromCenterAndSize(localVector, localVector2);
        if (raycaster.ray.intersectsBox(localBox)) {
          hoverTarget = p.placeholderBox;
          break;
        }
      }
    }
  }
});
renderer.domElement.addEventListener('click', e => {
  for (let i = 0; i < selectTargets.length; i++) {
    const selectTarget = selectTargets[i];
    if (selectTarget.control) {
      _unbindTransformControls(selectTarget);
    }
  }
  selectTargets = hoverTarget ? [hoverTarget] : [];
  for (let i = 0; i < selectTargets.length; i++) {
    _bindTransformControls(selectTargets[i]);
  }
});

const runMode = document.getElementById('run-mode');
const editMode = document.getElementById('edit-mode');

const worldsButton = document.getElementById('worlds-button');
const inventoryButton = document.getElementById('inventory-button');
const dropdownButton = document.getElementById('dropdown-button');
const dropdown = document.getElementById('dropdown');
const worldsSubpage = document.getElementById('worlds-subpage');
const inventorySubpage = document.getElementById('inventory-subpage');
const tabs = Array.from(dropdown.querySelectorAll('.tab'));
const tabContents = Array.from(dropdown.querySelectorAll('.tab-content'));
const worldsSubtabs = Array.from(worldsSubpage.querySelectorAll('.subtab'));
const worldsSubtabContents = Array.from(worldsSubpage.querySelectorAll('.subtab-content'));
const inventorySubtabs = Array.from(inventorySubpage.querySelectorAll('.subtab'));
const inventorySubtabContents = Array.from(inventorySubpage.querySelectorAll('.subtab-content'));
worldsButton.addEventListener('click', e => {
  worldsButton.classList.toggle('open');
  worldsSubpage.classList.toggle('open');

  dropdownButton.classList.remove('open');
  dropdown.classList.remove('open');
  inventoryButton.classList.remove('open');
  inventorySubpage.classList.remove('open');
});
inventoryButton.addEventListener('click', e => {
  inventoryButton.classList.toggle('open');
  inventorySubpage.classList.toggle('open');

  dropdownButton.classList.remove('open');
  dropdown.classList.remove('open');
  worldsButton.classList.remove('open');
  worldsSubpage.classList.remove('open');
});
dropdownButton.addEventListener('click', e => {
  dropdownButton.classList.toggle('open');
  dropdown.classList.toggle('open');

  worldsButton.classList.remove('open');
  inventoryButton.classList.remove('open');
  inventorySubpage.classList.remove('open');
  worldsSubpage.classList.remove('open');
});
for (let i = 0; i < tabs.length; i++) {
  const tab = tabs[i];
  const tabContent = tabContents[i];
  tab.addEventListener('click', e => {
    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i];
      const tabContent = tabContents[i];
      tab.classList.remove('open');
      tabContent.classList.remove('open');
    }

    tab.classList.add('open');
    tabContent.classList.add('open');

    if (selectedObject) {
      selectedObject = null;
      _renderObjects();
    }
  });
}
for (let i = 0; i < worldsSubtabs.length; i++) {
  const subtab = worldsSubtabs[i];
  const subtabContent = worldsSubtabContents[i];
  subtab.addEventListener('click', e => {
    for (let i = 0; i < worldsSubtabs.length; i++) {
      const subtab = worldsSubtabs[i];
      const subtabContent = worldsSubtabContents[i];
      subtab.classList.remove('open');
      subtabContent.classList.remove('open');
    }

    subtab.classList.add('open');
    subtabContent.classList.add('open');
  });
}
for (let i = 0; i < inventorySubtabs.length; i++) {
  const subtab = inventorySubtabs[i];
  const subtabContent = inventorySubtabContents[i];
  subtab.addEventListener('click', e => {
    for (let i = 0; i < inventorySubtabs.length; i++) {
      const subtab = inventorySubtabs[i];
      const subtabContent = inventorySubtabContents[i];
      subtab.classList.remove('open');
      subtabContent.classList.remove('open');
    }

    subtab.classList.add('open');
    subtabContent.classList.add('open');
  });
}

const worlds = document.getElementById('worlds');
const _makeWorldHtml = w => `
  <div class="world ${currentWorldHash === w.hash ? 'open' : ''}" type="${w.type}" hash="${w.hash}">
    <img src=question.png>
    <div class=wrap>
      <h1>${w.name}</h1>
      <p>This is a world description.</p>
    </div>
    <nav class=button>${w.type}</nav>
  </div>
`;
let channelConnection = null;
const peerConnections = [];
const _connect = roomName => {
  channelConnection && channelConnection.close();

  let name = 'Player';
  channelConnection = new XRChannelConnection(`${presenceEndpoint}/?c=${encodeURIComponent(roomName)}`);
  channelConnection.addEventListener('open', e => {
    // console.log('got open', e);
  });
  channelConnection.addEventListener('peerconnection', e => {
    const peerConnection = e.data;
    console.log('got peer connection', peerConnection);

    peerConnection.name = 'User';
    peerConnection.addEventListener('name', async e => {
      const name = e.data;
      peerConnection.name = name;
      _renderAvatars();
    });
    peerConnection.send('name', name);
    peerConnection.avatar = null;
    // peerConnection.avatar = new XRPackage();
    // peerConnection.avatar.setAvatar(true);
    peerConnection.addEventListener('pose', e => {
      const pose = e.data;
      if (!peerConnection.avatar) {
        peerConnection.avatar = new XRPackage();
        pe.add(peerConnection.avatar);
      }
      peerConnection.avatar.setPose(pose);
    });
    peerConnection.addEventListener('avatar', async e => {
      const hash = e.data;
      const p = await XRPackage.download(hash);

      if (peerConnection.avatar) {
        pe.remove(peerConnection.avatar);
        peerConnection.avatar = null;
      }

      p.setAvatar(true);
      pe.add(p);
      peerConnection.avatar = p;

      _renderAvatars();
    });
    peerConnection.addEventListener('close', e => {
      peerConnections.splice(peerConnections.indexOf(peerConnection), 1);
      _renderAvatars();
    });
    peerConnections.push(peerConnection);
    _renderAvatars();
  });
  channelConnection.addEventListener('message', e => {
    const m = e.data;
    const {method} = m;
    switch (method) {
      case 'init': {
        const {json, baseIndex} = m;
        console.log('got init', json, baseIndex);
        jsonClient.pullInit(json, baseIndex);
        break;
      }
      case 'ops': {
        const {ops, baseIndex} = m;
        jsonClient.pullOps(ops, baseIndex);
        break;
      }
      default: {
        console.warn('unknown channel connection method: ', JSON.stringify(method), m);
        break;
      }
    }
    // console.log('xr channel message', m);
  });
  channelConnection.addEventListener('close', e => {
    console.log('channel connection close', e);

    pe.reset();
    channelConnection = null;
  });
}
const headerLabel = document.getElementById('header-label');
let currentWorldHash = '';
const _enterWorld = async hash => {
  currentWorldHash = hash;

  headerLabel.innerText = hash || 'Sandbox';
  runMode.setAttribute('href', 'run.html' + (hash ? ('?w=' + hash) : ''));
  editMode.setAttribute('href', 'edit.html' + (hash ? ('?w=' + hash) : ''));

  singleplayerButton.classList.remove('open');
  multiplayerButton.classList.remove('open');
  Array.from(worlds.querySelectorAll('.world')).forEach(w => {
    w.classList.remove('open');
  });
  const w = worlds.querySelector(`[hash=${hash}]`);
  w && w.classList.add('open');

  worldType = null;
  worldTools.style.visibility = 'hidden';

  if (hash) {
    const res = await fetch(worldsEndpoint + '/' + hash);
    if (res.ok) {
      const j = await res.json();
      const {type, hash} = j;
      if (type === 'singleplayer') {
        // console.log('download scene', hash);
        pe.downloadScene(hash);
      } else if (type === 'multiplayer') {
        _connect(hash);
      }
    } else {
      console.warn('invalid world status code: ' + w + ' ' + res.status);
    }
  } else {
    pe.reset();
  }
};
const _pushWorld = hash => {
  history.pushState({}, '', window.location.protocol + '//' + window.location.host + window.location.pathname + '?w=' + hash);
  _handleUrl(window.location.href);
};
const _bindWorld = w => {
  w.addEventListener('click', async e => {
    const hash = w.getAttribute('hash');
    _pushWorld(hash);
  });
};
(async () => {
  const res = await fetch(worldsEndpoint);
  const children = await res.json();
  const ws = await Promise.all(children.map(child =>
    fetch(worldsEndpoint + '/' + child)
      .then(res => res.json())
  ));
  worlds.innerHTML = ws.map(w => _makeWorldHtml(w)).join('\n');
  Array.from(worlds.querySelectorAll('.world')).forEach((w, i) => _bindWorld(w, ws[i]));
})();
let worldType = 'singleplayer';
const singleplayerButton = document.getElementById('singleplayer-button');
singleplayerButton.addEventListener('click', e => {
  channelConnection && channelConnection.close();

  pe.reset();

  singleplayerButton.classList.add('open');
  multiplayerButton.classList.remove('open');
  Array.from(worlds.querySelectorAll('.world')).forEach(w => {
    w.classList.remove('open');
  });
  worldType = 'singleplayer';
  worldTools.style.visibility = null;
});
const multiplayerButton = document.getElementById('multiplayer-button');
multiplayerButton.addEventListener('click', async e => {
  channelConnection && channelConnection.close();

  pe.reset();

  singleplayerButton.classList.remove('open');
  multiplayerButton.classList.add('open');
  Array.from(worlds.querySelectorAll('.world')).forEach(w => {
    w.classList.remove('open');
  });
  worldType = 'multiplayer';
  worldTools.style.visibility = null;
});

const _makePackageHtml = p => `
  <div class=package>
    <img src="question.png">
    <!-- <img src="${p.img}" width=256 height=256> -->
    <div class=text>
      <div class="name cardTitle">${p.name}</div>
    </div>
    <div class=background>
      <nav class="button add-button">Add</nav>
      <a class="button" target="_blank" href="/run.html?h=${p.hash}">Test</a>
    </div>
  </div>
`;
const _bindPackage = (pE, pJ) => {
  const addButton = pE.querySelector('.add-button');
  addButton.addEventListener('click', async e => {
    const {hash} = pJ;
    const p = await XRPackage.download(hash);
    pe.add(p);
  });
  /* const runButton = pE.querySelector('.run-button');
  runButton.addEventListener('click', async e => {
    const {hash} = pJ;
    const p = await XRPackage.download(hash);
    pe.add(p);
  }); */
};
const packages = document.getElementById('packages');
(async () => {
  const res = await fetch(packagesEndpoint);
  const children = await res.json();
  const ps = await Promise.all(children.map(child =>
    fetch(packagesEndpoint + '/' + child)
      .then(res => res.json())
  ));
  packages.innerHTML = ps.map(p => _makePackageHtml(p)).join('\n');
  Array.from(packages.querySelectorAll('.package')).forEach((pe, i) => _bindPackage(pe, ps[i]));
})();
const tokens = document.getElementById('tokens');
async function getTokenByIndex(index) {
  const metadataHash = await contract.methods.getMetadata(index, 'hash').call();
  const metadata = await fetch(`${apiHost}/${metadataHash}`).then(res => res.json());
  const {dataHash, screenshotHash, modelHash} = metadata;
  return {
    index: index,
    name: metadata.objectName,
    img: `${apiHost}/${screenshotHash}`,
    metadataHash: metadataHash,
    dataHash: dataHash,
    modelHash: modelHash
  }
}
const _getTokenHtml = cardData => {
  const {index, name, img, metadataHash, dataHash, modelHash} = cardData;
  return `\
    <div class="token card">
      <a href="/run.html?i=${index}">
        <img src="${img}" width=256 height=256>
      </a>
      <div class=text>
        <div class="name cardTitle">${name}</div>
        <input type=text value="xrpk install ${index}" readonly class="cardCode">
        <nav class="cardAction add-action"><span>Add</span><i class="fa fa-chevron-right"></i></nav>
        <a href="/run.html?i=${index}" target="_blank" class="cardAction"><span>Test</span><i class="fa fa-chevron-right"></i></a>
        <a href="https://cryptopolys.com/create.html?o=${encodeURIComponent(metadataHash)}" class="cardAction"><span>Edit</span><i class="fa fa-chevron-right"></i></a>
        <a href="https://ipfs.exokit.org/ipfs/${dataHash}.wbn" class="cardAction"><span>Download package</span><i class="fa fa-chevron-right"></i></a>
        <a href="https://ipfs.exokit.org/ipfs/${modelHash}.glb" class="cardAction"><span>Download model</span><i class="fa fa-chevron-right"></i></a>
        <a href="https://${network}.opensea.io/assets/${address}/${index}" class="cardAction"><span>Opensea</span><i class="fa fa-chevron-right"></i></a>
      </div>
    </div>
  `;
};
(async () => {
  const totalObjects = await contract.methods.getNonce().call();
  const ts = [];
  for (let i = 1; i <= totalObjects; i++) {
    const t = await getTokenByIndex(i);
    ts.push(t);
    const h = _getTokenHtml(t);
    tokens.innerHTML += h;

    Array.from(tokens.querySelectorAll('.token')).forEach((token, i) => {
      const addAction = token.querySelector('.add-action');
      addAction.addEventListener('click', async e => {
        const t = ts[i];
        const {dataHash} = t;
        const p = await XRPackage.download(dataHash);
        pe.add(p);
      });
      const input = token.querySelector('input');
      input.addEventListener('click', e => {
        input.select();
      });
    });
  }
})();
/* const scenes = document.getElementById('scenes');
(async () => {
  const res = await fetch(scenesEndpoint);
  const children = await res.json();
  const ss = await Promise.all(children.map(child =>
    fetch(scenesEndpoint + '/' + child)
      .then(res => res.json())
  ));
  scenes.innerHTML = ss.map(s => `
    <div class=scene>${s.name}</div>
  `).join('\n');
  Array.from(scenes.querySelectorAll('.scene')).forEach((s, i) => {
    s.addEventListener('click', async e => {
      const s = ss[i];
      const {hash} = s;
      pe.downloadScene(hash);
    });
  });
})(); */
const worldTools = document.getElementById('world-tools');
const publishWorldButton = document.getElementById('publish-world-button');
publishWorldButton.addEventListener('click', async e => {
  let hash;
  if (worldType === 'singleplayer') {
    hash = await pe.uploadScene();
  } else if (worldType === 'multiplayer') {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    hash = Array.prototype.map.call(array, x => ('00' + x.toString(16)).slice(-2)).join('');
  }
  
  const w = {
    name: 'WebXR world',
    description: 'This is a world description',
    hash,
    type: worldType,
  };
  const res = await fetch(worldsEndpoint + '/' + hash, {
    method: 'PUT',
    body: JSON.stringify(w),
  });
  if (res.ok) {
    worlds.innerHTML += '\n' + _makeWorldHtml(w);
    const ws = Array.from(worlds.querySelectorAll('.world'));
    Array.from(worlds.querySelectorAll('.world')).forEach(w => _bindWorld(w));
    const newW = ws[ws.length - 1];
    newW.click();
  } else {
    console.warn('invalid status code: ' + res.status);
  }
});

const _pullPackages = async children => {
  const keepPackages = [];
  for (const id in children) {
    const child = children[id];
    let p = pe.packages.find(p => p.id === child.id);
    if (!p) {
      p = await XRPackage.download(child.hash);
      p.id = child.id;
      pe.add(p);
    }
    localMatrix.fromArray(child.matrix);
    if (!p.matrix.equals(localMatrix)) {
      p.setMatrix(localMatrix);
    }
    keepPackages.push(p);
  }
  const packages = pe.packages.slice();
  for (let i = 0; i < packages.length; i++) {
    const p = packages[i];
    if (!keepPackages.includes(p)) {
      pe.remove(p);
    }
  }
};

const jsonClient = new JSONClient({});
jsonClient.addEventListener('localUpdate', e => {
  const j = e.data;
  const {children = []} = j;
  _pullPackages(children);
});
jsonClient.addEventListener('message', e => {
  // console.log('send ops 1', e.data);
  if (channelConnection) {
    const {ops, baseIndex} = e.data;
    // console.log('send ops 2', {ops, baseIndex});
    channelConnection.send(JSON.stringify({
      method: 'ops',
      ops,
      baseIndex,
    }));
  }
});

const avatarMe = document.getElementById('avatar-me');
const unwearButton = avatarMe.querySelector('.unwear-button');
const avatars = document.getElementById('avatars');
const _renderAvatars = () => {
  const {avatar} = pe;
  const previewEl = avatarMe.querySelector('.preview');
  const nameEl = avatarMe.querySelector('.name');
  if (avatar) {
    // previewEl.src = avatar.getPreviewUrl();
    nameEl.innerText = avatar.name;
    unwearButton.style.display = null;
  } else {
    // previewEl.src = avatar.getPreviewUrl();
    nameEl.innerText = 'No avatar';
    unwearButton.style.display = 'none';
  }

  avatars.innerHTML = peerConnections
    // .filter(pc => !!pc.avatar)
    .map(pc => `
      <nav class=avatar>
        <img src="question.png">
        <div class=name>${pc.name}</div>
        ${pc.avatar ? `<nav class="button unwear-button">Wear</nav>` : ''}
        <!-- <div class=tag>You</div> -->
      </nav>
    `).join('\n');
};
pe.addEventListener('avatarchange', e => {
  _renderAvatars();
});
unwearButton.addEventListener('click', e => {
  pe.defaultAvatar();
});

let selectedObject = null;
const objectsEl = document.getElementById('objects');
const _renderObjects = () => {
  if (selectedObject) {
    let p = selectedObject;
    const schemas = Object.keys(p.schema);
    const {events} = p;
    objectsEl.innerHTML = `
      <div class=object-detail>
        <h1><nav class=back-button><i class="fa fa-arrow-left"></i></nav>${p.name}</h1>
        <nav class="button reload-button">Reload</nav>
        <nav class="button wear-button">Wear</nav>
        <nav class="button inspect-button">Inspect</nav>
        <nav class="button remove-button">Remove</nav>
        <b>Position</b>
        <div class=row>
          <label>
            <span>X</span>
            <input type=number class=position-x value=0 step=0.1>
          </label>
          <label>
            <span>Y</span>
            <input type=number class=position-y value=0 step=0.1>
          </label>
          <label>
            <span>Z</span>
            <input type=number class=position-z value=0 step=0.1>
          </label>
        </div>
        <b>Quaternion</b>
        <div class=row>
          <label>
            <span>X</span>
            <input type=number class=quaternion-x value=0 step=0.1>
          </label>
          <label>
            <span>Y</span>
            <input type=number class=quaternion-y value=0 step=0.1>
          </label>
          <label>
            <span>Z</span>
            <input type=number class=quaternion-z value=0 step=0.1>
          </label>
          <label>
            <span>W</span>
            <input type=number class=quaternion-w value=1 step=0.1>
          </label>
        </div>
        <b>Scale</b>
        <div class=row>
          <label>
            <span>X</span>
            <input type=number class=scale-x value=1 step=0.1>
          </label>
          <label>
            <span>Y</span>
            <input type=number class=scale-y value=1 step=0.1>
          </label>
          <label>
            <span>Z</span>
            <input type=number class=scale-z value=1 step=0.1>
          </label>
        </div>
        ${schemas.length > 0 ? `
          <b>Schema</b>
          <div class=row>
            ${schemas.map(name => `
              <label class=schema>
                <span class=name>${name}</span>
                <input class="schema-input" name="${escape(name)}" type=text value="${escape(p.schema[name])}">
              </label>
            `).join('\n')}
          </div>
        ` : ''}
        ${events.length > 0 ? `
          <b>Events</b>
          <div class=row>
            ${events.map(e => `
              <label class=event name="${escape(e.name)}">
                <span>${e.name}</span>
                <input class="event-input" type=text>
                <nav class="button event-send-button">Send</nav>
              </label>
            `).join('\n')}
          </div>
        ` : ''}
      </div>
    `;
    const backButton = objectsEl.querySelector('.back-button');
    backButton.addEventListener('click', e => {
      selectedObject = null;
      _renderObjects();
    });
    const inspectButton = objectsEl.querySelector('.inspect-button');
    inspectButton.addEventListener('click', async e => {
      const b = new Blob([p.data], {
        type: 'application/webbundle',
      });
      const u = URL.createObjectURL(b);
      window.open(`inspect.html?u=${u}`, '_blank');
    });
    const reloadButton = objectsEl.querySelector('.reload-button');
    reloadButton.addEventListener('click', async e => {
      await p.reload();
    });
    const wearButton = objectsEl.querySelector('.wear-button');
    wearButton.addEventListener('click', async e => {
      const p2 = p.clone();
      await pe.wearAvatar(p2);
    });
    const removeButton = objectsEl.querySelector('.remove-button');
    removeButton.addEventListener('click', e => {
      pe.remove(p);
    });

    const _setPosition = (e, key) => {
      p.matrix.decompose(localVector, localQuaternion, localVector2);
      localVector[key] = parseFloat(e.target.value);
      p.setMatrix(localMatrix.compose(localVector, localQuaternion, localVector2));
    };
    const _setQuaternion = (e, key) => {
      p.matrix.decompose(localVector, localQuaternion, localVector2);
      localQuaternion[key] = e.target.value;
      localQuaternion.normalize();
      ['x', 'y', 'z', 'w'].forEach(k => {
        objectsEl.querySelector('.quaternion-' + k).value = parseFloat(localQuaternion[k]);
      });
      p.setMatrix(localMatrix.compose(localVector, localQuaternion, localVector2));
    };
    const _setScale = (e, key) => {
      p.matrix.decompose(localVector, localQuaternion, localVector2);
      localVector2[key] = parseFloat(e.target.value);
      p.setMatrix(localMatrix.compose(localVector, localQuaternion, localVector2));
    };
    objectsEl.querySelector('.position-x').addEventListener('change', e => {
      _setPosition(e, 'x');
    });
    objectsEl.querySelector('.position-y').addEventListener('change', e => {
      _setPosition(e, 'y');
    });
    objectsEl.querySelector('.position-z').addEventListener('change', e => {
      _setPosition(e, 'z');
    });
    objectsEl.querySelector('.quaternion-x').addEventListener('change', e => {
      _setQuaternion(e, 'x');
    });
    objectsEl.querySelector('.quaternion-y').addEventListener('change', e => {
      _setQuaternion(e, 'y');
    });
    objectsEl.querySelector('.quaternion-z').addEventListener('change', e => {
      _setQuaternion(e, 'z');
    });
    objectsEl.querySelector('.quaternion-w').addEventListener('change', e => {
      _setQuaternion(e, 'w');
    });
    objectsEl.querySelector('.scale-x').addEventListener('change', e => {
      _setScale(e, 'x');
    });
    objectsEl.querySelector('.scale-y').addEventListener('change', e => {
      _setScale(e, 'y');
    });
    objectsEl.querySelector('.scale-z').addEventListener('change', e => {
      _setScale(e, 'z');
    });

    Array.from(objectsEl.querySelectorAll('.schema-input')).forEach(schemaInput => {
      const name = schemaInput.getAttribute('name');
      const value = p.schema[name] || '';
      schemaInput.value = value;
      schemaInput.addEventListener('change', e => {
        const value = e.target.value;
        p.setSchema(name, value);
      });
    });

    Array.from(objectsEl.querySelectorAll('.event')).forEach(event => {
      const name = event.getAttribute('name');
      const eventInput = event.querySelector('.event-input');
      const eventSendButton = event.querySelector('.event-send-button');
      eventSendButton.addEventListener('click', e => {
        const {value} = eventInput;
        p.sendEvent(name, value);
      });
    });
  } else {
    objectsEl.innerHTML = pe.packages.map((p, i) => `
      <div class=object index=${i}>
        <span class=name>${p.name}</span>
        <nav class=close-button><i class="fa fa-times"></i></nav>
      </div>
    `).join('\n');
    Array.from(objectsEl.querySelectorAll('.object')).forEach(packageEl => {
      const index = parseInt(packageEl.getAttribute('index'), 10);
      const p = pe.packages[index];
      packageEl.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();

        selectedObject = p;
        _renderObjects();
      });
      const closeButton = packageEl.querySelector('.close-button');
      closeButton.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();

        pe.remove(p);
      });
    });
  }
};
const _handleUrl = u => {
  const {search} = new URL(u);
  const q = parseQuery(search);
  const w = q.w || null;
  _enterWorld(w);
};
window.addEventListener('popstate', e => {
  _handleUrl(window.location.href);
});
_handleUrl(window.location.href);

// });