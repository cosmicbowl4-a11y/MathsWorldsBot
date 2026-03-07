// Button geometry with UVs and depth
const shape = new THREE.Shape().absarc(0, 0, 1, 0, Math.PI * 2, false);
const extrudeSettings = { depth: 0.2, bevelEnabled: false };
const buttonGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
const buttonMesh = new THREE.Mesh(buttonGeometry, material);
buttonMesh.position.set(0, 0, 0); // center
scene.add(buttonMesh);

// Click detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([buttonMesh]);
  if (intersects.length > 0) {
    scene.remove(buttonMesh);
    mesh = new THREE.Mesh(sphereGeometry, material);
    scene.add(mesh);

    // Animate gradient shift
    let t = 0;
    function animateGradient() {
      t += 0.01;
      material.uniforms.mixValue.value = Math.min(t, 1.0);
      if (t < 1.0) requestAnimationFrame(animateGradient);
    }
    animateGradient();

    setTimeout(nextStage, 5000);
  }
}
window.addEventListener("click", onClick);
