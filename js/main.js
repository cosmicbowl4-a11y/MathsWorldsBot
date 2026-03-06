const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(
45,
window.innerWidth/window.innerHeight,
0.1,
1000
);

camera.position.z = 7;

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);

const group = new THREE.Group();
scene.add(group);

const planes=[];

const NUM_PLANES=30;
const BASE_RADIUS=2.4;

let collapse=0;
let pulse=0;
let clicked=false;

for(let i=0;i<NUM_PLANES;i++){

const angle=(i/NUM_PLANES)*Math.PI*2;

const geo=new THREE.PlaneGeometry(
2.2,
0.55,
120,
30
);

const color=new THREE.Color().setHSL(
i/NUM_PLANES,
0.75,
0.55
);

const mat=new THREE.MeshBasicMaterial({
color:color,
side:THREE.DoubleSide,
transparent:true,
opacity:0.9
});

const mesh=new THREE.Mesh(geo,mat);

group.add(mesh);

planes.push({
mesh:mesh,
geo:geo,
angle:angle,
phase:i*0.2
});

}

const ico=new THREE.IcosahedronGeometry(1.2,1);

const metric=new THREE.LineSegments(
new THREE.WireframeGeometry(ico),
new THREE.LineBasicMaterial({
color:0x222222,
transparent:true,
opacity:0.45
})
);

group.add(metric);

const glowGeo=new THREE.SphereGeometry(1.8,32,32);

const glowMat=new THREE.MeshBasicMaterial({
color:0x88aaff,
transparent:true,
opacity:0.08
});

const glow=new THREE.Mesh(glowGeo,glowMat);

group.add(glow);

window.addEventListener("pointerdown",()=>{

clicked=true;
pulse=1;

});

let t=0;

function animate(){

requestAnimationFrame(animate);

t+=0.02;

if(clicked){

collapse+=0.01;
pulse*=0.96;

}

const amplitude=
0.25+
0.15*Math.sin(t)+
pulse*0.35;

planes.forEach((p,i)=>{

const r=BASE_RADIUS*(1-collapse);

p.mesh.position.x=Math.cos(p.angle)*r;
p.mesh.position.y=Math.sin(p.angle)*r;

p.mesh.lookAt(0,0,0);

const pos=p.geo.attributes.position;

for(let j=0;j<pos.count;j++){

const x=pos.getX(j);

const wave=
Math.sin(x*3+t+p.phase)*
Math.cos(p.angle*3);

pos.setZ(j,wave*amplitude);

}

pos.needsUpdate=true;

});

metric.rotation.x+=0.01;
metric.rotation.y+=0.008;

glow.scale.set(
1+Math.sin(t)*0.1,
1+Math.sin(t)*0.1,
1+Math.sin(t)*0.1
);

group.rotation.z+=0.002;

if(collapse>1){

window.location.href="game.html";

}

renderer.render(scene,camera);

}

animate();
