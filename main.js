// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 4;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Wavy circle geometry (scalloped edge)
function createWavyCircle(radius, segments, waveAmplitude, waveFrequency) {
  const shape = new THREE.Shape();
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const r = radius + Math.sin(angle * waveFrequency) * waveAmplitude;
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  return new THREE.ShapeGeometry(shape);
}

// Geometry
const geometry = createWavyCircle(1, 256, 0.2, 8);

// Shader material for magenta/blue split
const material = new THREE.ShaderMaterial({
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    void main() {
      if (vUv.y > 0.5) {
        gl_FragColor = vec4(1.0, 0.0, 0.6, 1.0); // magenta top
      } else {
        gl_FragColor = vec4(0.0, 0.3, 1.0, 1.0); // blue bottom
      }
    }
  `,
  side: THREE.DoubleSide
});

// Mesh
const circle = new THREE.Mesh(geometry, material);
scene.add(circle);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  circle.rotation.z += 0.01; // slow rotation
  renderer.render(scene, camera);
}
animate();

// Responsive resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
