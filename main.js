const geometry = new THREE.CircleGeometry(1, 128);
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
      vec3 color = vec3(vUv.x, 0.0, vUv.y); // UV gradient
      gl_FragColor = vec4(color, 1.0);
    }
  `
});

const positions = [
  [0, 0, 0], // center
  [2, 0, 0], [-2, 0, 0], // X axis
  [0, 2, 0], [0, -2, 0], // Y axis
  [Math.sqrt(2), Math.sqrt(2), 0], // 45°
  [-Math.sqrt(2), Math.sqrt(2), 0], // 135°
  [-Math.sqrt(2), -Math.sqrt(2), 0], // 225°
  [Math.sqrt(2), -Math.sqrt(2), 0]  // 315°
];

positions.forEach(pos => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...pos);
  scene.add(mesh);
});

function animate() {
  requestAnimationFrame(animate);
  scene.children.forEach(obj => {
    obj.rotation.z += 0.01;
  });
  renderer.render(scene, camera);
}
animate();
