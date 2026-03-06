const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Geometry: Circle with high resolution
const geometry = new THREE.CircleGeometry(1, 128);

// Shader Material for UV Gradient
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
      vec3 color = vec3(vUv.x, 0.0, vUv.y); // UV-based gradient
      gl_FragColor = vec4(color, 1.0);
    }
  `,
  side: THREE.DoubleSide
});

// Positions for main axes and diagonals
const positions = [
  [0, 0, 0], // center
  [2, 0, 0], [-2, 0, 0], // X axis
  [0, 2, 0], [0, -2, 0], // Y axis
  [0, 0, 2], [0, 0, -2], // Z axis
  [1.4, 1.4, 0], [-1.4, 1.4, 0], // 45°, 135°
  [-1.4, -1.4, 0], [1.4, -1.4, 0] // 225°, 315°
];

// Create and add meshes
positions.forEach((pos, i) => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...pos);

  // Rotate some for visual complexity
  mesh.rotation.x = (i % 3) * 0.5;
  mesh.rotation.y = (i % 2) * 0.3;

  scene.add(mesh);
});

// Animate
function animate() {
  requestAnimationFrame(animate);
  scene.rotation.y += 0.005;
  renderer.render(scene, camera);
}
animate();
