/**
 * main.js - Juego 3D Virus Zombie
 * Implementa la lógica básica del juego con Three.js
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';

let scene, camera, renderer;
let gameState = 'puzzle'; // puzzle, maze, virus, boss
let uiOverlay, gameText, startButton;

init();
animate();

function init() {
  // Setup scene
  scene = new THREE.Scene();

  // Setup camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 5, 10);

  // Setup renderer
  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas'), antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x1f2937); // Tailwind gray-800

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  // Add directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7);
  scene.add(directionalLight);

  // UI elements
  uiOverlay = document.getElementById('uiOverlay');
  gameText = document.getElementById('gameText');
  startButton = document.getElementById('startButton');

  startButton.addEventListener('click', () => {
    if (gameState === 'puzzle') {
      startPuzzle();
    }
  });

  window.addEventListener('resize', onWindowResize, false);

  // Initialize puzzle room
  setupPuzzleRoom();
}

function setupPuzzleRoom() {
  gameText.innerHTML = 'Resuelve el rompecabezas para conocer las partes del microscopio.<br>Haz click en "Comenzar" para iniciar.';
  startButton.style.display = 'inline-block';

  // Clear scene objects if any
  clearScene();

  // Add simple 3D objects representing puzzle pieces (placeholder)
  // For simplicity, we will just add colored cubes representing parts
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const materials = [
    new THREE.MeshStandardMaterial({ color: 0xff0000 }), // rojo
    new THREE.MeshStandardMaterial({ color: 0x00ff00 }), // verde
    new THREE.MeshStandardMaterial({ color: 0x0000ff }), // azul
  ];

  for (let i = 0; i < 3; i++) {
    const cube = new THREE.Mesh(geometry, materials[i]);
    cube.position.set(i * 2 - 2, 0.5, 0);
    cube.name = ['Ocular', 'Objetivo', 'Platina'][i];
    scene.add(cube);
  }
}

function startPuzzle() {
  startButton.style.display = 'none';
  gameText.innerHTML = 'Selecciona las partes del microscopio en orden correcto para continuar.';

  // For simplicity, simulate puzzle solved after 5 seconds
  setTimeout(() => {
    gameText.innerHTML = '¡Rompecabezas resuelto! Ahora atraviesa el laberinto y encuentra las piezas.';
    gameState = 'maze';
    setupMazeRoom();
  }, 5000);
}

function setupMazeRoom() {
  clearScene();

  // Placeholder: add floor and walls for maze
  const floorGeometry = new THREE.PlaneGeometry(20, 20);
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x4b5563 }); // Tailwind gray-600
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // Add simple walls (boxes)
  const wallGeometry = new THREE.BoxGeometry(1, 2, 5);
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x374151 }); // Tailwind gray-700

  const wall1 = new THREE.Mesh(wallGeometry, wallMaterial);
  wall1.position.set(-5, 1, 0);
  scene.add(wall1);

  const wall2 = new THREE.Mesh(wallGeometry, wallMaterial);
  wall2.position.set(5, 1, 0);
  scene.add(wall2);

  // Add player (simple sphere)
  const playerGeometry = new THREE.SphereGeometry(0.5, 16, 16);
  const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x2563eb }); // Tailwind blue-600
  const player = new THREE.Mesh(playerGeometry, playerMaterial);
  player.position.set(0, 0.5, 8);
  player.name = 'player';
  scene.add(player);

  // Add zombie scientist (red sphere)
  const zombieGeometry = new THREE.SphereGeometry(0.5, 16, 16);
  const zombieMaterial = new THREE.MeshStandardMaterial({ color: 0xdc2626 }); // Tailwind red-600
  const zombie = new THREE.Mesh(zombieGeometry, zombieMaterial);
  zombie.position.set(0, 0.5, -8);
  zombie.name = 'zombie';
  scene.add(zombie);

  // Add microscope parts to collect (small cubes)
  const partGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const partMaterial = new THREE.MeshStandardMaterial({ color: 0x10b981 }); // Tailwind green-500

  for (let i = 0; i < 3; i++) {
    const part = new THREE.Mesh(partGeometry, partMaterial);
    part.position.set((i - 1) * 3, 0.25, (Math.random() * 10) - 5);
    part.name = 'part' + i;
    scene.add(part);
  }

  // Store references for game loop
  gameObjects.player = player;
  gameObjects.zombie = zombie;
  gameObjects.partsCollected = 0;
  gameObjects.partsTotal = 3;

  gameText.innerHTML = 'Encuentra las piezas del microscopio y evita al zombie científico. Usa las flechas para moverte.';
  startButton.style.display = 'none';

  // Setup controls
  setupControls();
}

let gameObjects = {};
let keysPressed = {};

function setupControls() {
  window.addEventListener('keydown', (e) => {
    keysPressed[e.key.toLowerCase()] = true;
  });
  window.addEventListener('keyup', (e) => {
    keysPressed[e.key.toLowerCase()] = false;
  });
}

function updateMaze() {
  const player = gameObjects.player;
  const zombie = gameObjects.zombie;

  // Simple player movement
  const speed = 0.1;
  if (keysPressed['arrowup'] || keysPressed['w']) player.position.z -= speed;
  if (keysPressed['arrowdown'] || keysPressed['s']) player.position.z += speed;
  if (keysPressed['arrowleft'] || keysPressed['a']) player.position.x -= speed;
  if (keysPressed['arrowright'] || keysPressed['d']) player.position.x += speed;

  // Simple zombie AI: move towards player
  const direction = new THREE.Vector3();
  direction.subVectors(player.position, zombie.position).normalize();
  zombie.position.addScaledVector(direction, 0.05);

  // Check collision with parts
  scene.children.forEach((obj) => {
    if (obj.name.startsWith('part')) {
      if (obj.position.distanceTo(player.position) < 0.7) {
        scene.remove(obj);
        gameObjects.partsCollected++;
        gameText.innerHTML = 'Piezas encontradas: ' + gameObjects.partsCollected + ' / ' + gameObjects.partsTotal;
        if (gameObjects.partsCollected >= gameObjects.partsTotal) {
          gameText.innerHTML = '¡Has encontrado todas las piezas! Ahora ve a la sala del virus.';
          gameState = 'virus';
          setupVirusRoom();
        }
      }
    }
  });

  // Check collision with zombie (game over)
  if (player.position.distanceTo(zombie.position) < 0.7) {
    gameText.innerHTML = '¡El zombie científico te atrapó! Juego terminado.';
    gameState = 'gameover';
  }
}

function setupVirusRoom() {
  clearScene();

  // Add virus model (simple red sphere with glow)
  const virusGeometry = new THREE.SphereGeometry(2, 32, 32);
  const virusMaterial = new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0xff0000, emissiveIntensity: 0.7 });
  const virus = new THREE.Mesh(virusGeometry, virusMaterial);
  virus.position.set(0, 2, 0);
  scene.add(virus);

  gameText.innerHTML = 'Has llegado a la sala del virus. Prepárate para enfrentar al jefe final.';
  startButton.style.display = 'inline-block';
  startButton.textContent = 'Enfrentar Jefe Final';

  startButton.onclick = () => {
    gameState = 'boss';
    setupBossFight();
    startButton.style.display = 'none';
  };
}

function setupBossFight() {
  clearScene();

  // Add boss (large zombie sphere)
  const bossGeometry = new THREE.SphereGeometry(3, 32, 32);
  const bossMaterial = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, emissive: 0x4b0000, emissiveIntensity: 0.8 });
  const boss = new THREE.Mesh(bossGeometry, bossMaterial);
  boss.position.set(0, 3, 0);
  scene.add(boss);

  gameText.innerHTML = 'Jefe final: ¡Derrota al zombie científico! Usa las teclas para atacar y esquivar.';
  startButton.style.display = 'none';

  // Simple boss fight logic placeholder
  // For now, after 10 seconds, player wins
  setTimeout(() => {
    gameText.innerHTML = '¡Felicidades! Has derrotado al jefe final y salvado al mundo del virus zombie.';
    gameState = 'win';
  }, 10000);
}

function clearScene() {
  // Remove all objects except lights
  for (let i = scene.children.length - 1; i >= 0; i--) {
    const obj = scene.children[i];
    if (!(obj.type === 'AmbientLight' || obj.type === 'DirectionalLight')) {
      scene.remove(obj);
    }
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  if (gameState === 'maze') {
    updateMaze();
  }

  renderer.render(scene, camera);
}
