// Scene
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth/window.innerHeight,
0.1,
1000
);

camera.position.z = 4;


// Renderer
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setClearColor(0xffffff,1);

document.body.appendChild(renderer.domElement);



// WAVY CIRCLE FUNCTION
function createWavyCircle(radius,segments,waveAmplitude,waveFrequency){

const shape=new THREE.Shape();

for(let i=0;i<=segments;i++){

const angle=(i/segments)*Math.PI*2;

const r=radius+Math.sin(angle*waveFrequency)*waveAmplitude;

const x=r*Math.cos(angle);
const y=r*Math.sin(angle);

if(i===0) shape.moveTo(x,y);
else shape.lineTo(x,y);

}

return new THREE.ShapeGeometry(shape);

}


// Wavy button geometry
const geometry=createWavyCircle(
1.2,   // radius (size of button)
256,   // smoothness
0.08,  // wave amplitude
14     // number of waves
);


// Gradient material
const material=new THREE.ShaderMaterial({

uniforms:{
mixValue:{value:0}
},

vertexShader:`

varying vec2 vUv;

void main(){

vUv=uv;

gl_Position=
projectionMatrix*
modelViewMatrix*
vec4(position,1.0);

}

`,

fragmentShader:`

uniform float mixValue;
varying vec2 vUv;

void main(){

vec3 colorA=mix(
vec3(1.0,0.0,0.6),
vec3(0.4,0.0,1.0),
vUv.y
);

vec3 colorB=mix(
vec3(1.0,0.0,0.6),
vec3(0.0,0.3,1.0),
vUv.x
);

vec3 color=mix(colorA,colorB,mixValue);

gl_FragColor=vec4(color,1.0);

}

`,

side:THREE.DoubleSide

});


// Button mesh
let mesh=new THREE.Mesh(geometry,material);

scene.add(mesh);



// OTHER GEOMETRIES FOR MORPH
const sphereGeometry=new THREE.SphereGeometry(1,64,64);

const lineGeometry=new THREE.BufferGeometry().setFromPoints([
new THREE.Vector3(-1,0,0),
new THREE.Vector3(1,0,0)
]);

const circleGeometry=new THREE.CircleGeometry(1,128);



// TESSERACT
function createTesseract(size){

const vertices=[];
const edges=[];

for(let i=0;i<16;i++){

const x=(i&1?1:-1)*size;
const y=(i&2?1:-1)*size;
const z=(i&4?1:-1)*size;
const w=(i&8?1:-1)*size;

vertices.push(new THREE.Vector3(x,y,z+w*0.5));

}

for(let i=0;i<16;i++){

for(let j=i+1;j<16;j++){

const diff=i^j;

if(diff && !(diff&(diff-1))){
edges.push(vertices[i],vertices[j]);
}

}

}

return new THREE.BufferGeometry().setFromPoints(edges);

}

const tesseractGeometry=createTesseract(0.7);



// MORPH SYSTEM
let stage=0;
let morphTime=0;
let started=false;


function morphTo(newGeometry){

morphTime=0;

const oldPositions=mesh.geometry.attributes.position.array.slice();
const newPositions=newGeometry.attributes.position.array;

const length=Math.min(oldPositions.length,newPositions.length);

function update(){

morphTime+=0.016;

const t=Math.min(morphTime/3,1);

const positions=mesh.geometry.attributes.position.array;

for(let i=0;i<length;i++){

positions[i]=oldPositions[i]*(1-t)+newPositions[i]*t;

}

mesh.geometry.attributes.position.needsUpdate=true;

material.uniforms.mixValue.value=t;

if(t<1){

requestAnimationFrame(update);

}else{

setTimeout(nextStage,4000);

}

}

update();

}


function nextStage(){

stage++;

if(stage===1) morphTo(lineGeometry);

else if(stage===2) morphTo(circleGeometry);

else if(stage===3) morphTo(sphereGeometry);

else if(stage===4){

scene.remove(mesh);

mesh=new THREE.LineSegments(
tesseractGeometry,
new THREE.LineBasicMaterial({color:0x9933ff})
);

scene.add(mesh);

}

}



// CLICK DETECTION
const raycaster=new THREE.Raycaster();
const mouse=new THREE.Vector2();

renderer.domElement.addEventListener("click",(event)=>{

if(started) return;

mouse.x=(event.clientX/window.innerWidth)*2-1;
mouse.y=-(event.clientY/window.innerHeight)*2+1;

raycaster.setFromCamera(mouse,camera);

const hit=raycaster.intersectObject(mesh);

if(hit.length>0){

started=true;

mesh.scale.set(1.2,1.2,1.2);

setTimeout(nextStage,2000);

}

});



// ANIMATION
function animate(){

requestAnimationFrame(animate);

mesh.rotation.z+=0.01;

renderer.render(scene,camera);

}

animate();



// RESIZE
window.addEventListener("resize",()=>{

camera.aspect=window.innerWidth/window.innerHeight;

camera.updateProjectionMatrix();

renderer.setSize(window.innerWidth,window.innerHeight);

});
