import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
const stage=document.querySelector('.multi-device-stage');
let lastState={index:0,rotation:0};
window.addEventListener('device-scene-update',event=>{lastState=event.detail;});
async function start(){
 if(!stage)return;
 const manifest=await fetch('/assets/device-screens.json').then(r=>{if(!r.ok)throw Error('Asset manifest unavailable');return r.json();});
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
 renderer.domElement.className='device-canvas';renderer.domElement.setAttribute('aria-label','3D iPhone and Mac showing actual app screenshots with demonstration content');renderer.domElement.setAttribute('role','img');
 const scene=new THREE.Scene();
 const camera=new THREE.OrthographicCamera(-3,3,3,-3,.1,100);camera.position.set(0,0,10);camera.lookAt(0,0,0);
 const pmrem=new THREE.PMREMGenerator(renderer);const room=new RoomEnvironment();const environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;room.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xe4efff,0x596170,2));
 const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-3,5,7);scene.add(key);
 const rim=new THREE.DirectionalLight(0x9bbcff,2);rim.position.set(4,2,-4);scene.add(rim);
 const decoder=new DRACOLoader().setDecoderPath('/vendor/draco/').setWorkerLimit(1);
 const loader=new GLTFLoader().setDRACOLoader(decoder);
 const textureLoader=new THREE.TextureLoader();
 const pageApp=document.body.dataset.product;
 const labels=[...document.querySelectorAll('.story-screen')].map(s=>s.dataset.label);
 const mappings=labels.map((label,index)=>({app:pageApp || (label.startsWith('LibraVia')?'libravia':'velacanto'),view:pageApp?index:0}));
 const models=await Promise.all(['iphone','mac'].map(async kind=>{
  const gltf=await loader.loadAsync(manifest.models[kind].url);
  const model=gltf.scene;
  const screen=model.getObjectByName(manifest.models[kind].screenMesh);
  if(!screen?.isMesh)throw Error(`Missing ${kind} screenshot surface`);
  // Model display and glass surfaces are almost coplanar. Keep the screenshot
  // just ahead in the depth buffer without drawing through the device body.
  const material=new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});screen.material=material;
  // Use a dedicated, bounded UV map rather than the asset's wallpaper atlas.
  // Texture rows run top-to-bottom; iPhone faces -Z before its half-turn.
  model.updateMatrixWorld(true);
  screen.geometry=screen.geometry.clone();
  const positions=screen.geometry.getAttribute('position');
  const points=Array.from({length:positions.count},(_,i)=>new THREE.Vector3().fromBufferAttribute(positions,i).applyMatrix4(screen.matrixWorld));
  const screenBounds=new THREE.Box3().setFromPoints(points);
  const span=screenBounds.getSize(new THREE.Vector3());
  const uv=new Float32Array(positions.count*2);
  points.forEach((point,i)=>{
   const horizontal=(point.x-screenBounds.min.x)/span.x;
   uv[i*2]=kind==='iphone'?1-horizontal:horizontal;
   uv[i*2+1]=(screenBounds.max.y-point.y)/span.y;
  });
  screen.geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  const bounds=new THREE.Box3().setFromObject(model);const size=bounds.getSize(new THREE.Vector3());const center=bounds.getCenter(new THREE.Vector3());
  model.position.sub(center);const group=new THREE.Group();group.add(model);
  const factor=kind==='iphone'?3.8/size.y:3.6/size.x;group.scale.setScalar(factor);
  group.position.set(kind==='iphone'?1.9:-1.05,kind==='iphone'?.2:-.35,kind==='iphone'?1.6:-1.2);
  if(kind==='mac')group.rotation.y=.12;
  scene.add(group);
  const textures=await Promise.all(mappings.map(async({app,view})=>{
   let texture=await textureLoader.loadAsync(manifest.screens[app][view][kind]);
   const image=texture.image;
   const displayAspect=span.x/Math.hypot(span.y,span.z);
   // Keep captured window proportions. The reader's Mac captures are 5:4;
   // containing them prevents squeezed text on the wider MacBook display.
   if(Math.abs(image.width/image.height/displayAspect-1)>.025){
    const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=Math.round(canvas.width/displayAspect);
    const context=canvas.getContext('2d');
    context.fillStyle=manifest.screens[app][view].background?.[kind] || '#171717';context.fillRect(0,0,canvas.width,canvas.height);
    const scale=Math.min(canvas.width/image.width,canvas.height/image.height);
    const width=image.width*scale,height=image.height*scale;
    context.drawImage(image,(canvas.width-width)/2,(canvas.height-height)/2,width,height);
    texture.dispose();texture=new THREE.CanvasTexture(canvas);
   }
   texture.colorSpace=THREE.SRGBColorSpace;texture.flipY=false;texture.wrapS=THREE.ClampToEdgeWrapping;texture.wrapT=THREE.ClampToEdgeWrapping;texture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),4);return texture;
  }));
  material.map=textures[0];
  return {kind,group,material,textures};
 }));
 decoder.dispose();
 function render(state=lastState){
  models.forEach(item=>{
   // One screenshot at a time: change views while the phone faces away.
   item.material.map=item.textures[state.index] || item.textures[0];
   if(item.kind==='iphone')item.group.rotation.y=Math.PI+THREE.MathUtils.degToRad(state.rotation);
  });
  renderer.render(scene,camera);
 }
 function resize(){const width=stage.clientWidth,height=stage.clientHeight;renderer.setSize(width,height,false);const aspect=width/height;// Fit the entire pair plus its turning envelope, even on narrow displays.
 const halfHeight=Math.max(2.8,3.25/aspect);camera.left=-halfHeight*aspect;camera.right=halfHeight*aspect;camera.top=halfHeight;camera.bottom=-halfHeight;camera.updateProjectionMatrix();render();}
 stage.append(renderer.domElement);stage.classList.add('has-3d-devices');resize();
 const observer=new ResizeObserver(resize);observer.observe(stage);
 window.addEventListener('device-scene-update',event=>render(event.detail));
 renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();stage.classList.remove('has-3d-devices');});
 renderer.domElement.addEventListener('webglcontextrestored',()=>{stage.classList.add('has-3d-devices');render();});
}
start().catch(error=>{console.warn('3D devices unavailable; showing static interface fallback.',error);});
