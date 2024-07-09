// Configuração básica do Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
scene.background = new THREE.Color(0x87CEEB); // Azul claro

// Adicionando uma luz ambiente
let ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Adicionando uma luz direcional
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// Adicionando sombras
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 5024;
directionalLight.shadow.mapSize.height = 5024;
directionalLight.shadow.camera.near = 2.5;
directionalLight.shadow.camera.far = 500;

// Adicionando controles de órbita
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Movimento suave da câmera
controls.dampingFactor = 0.25; // Velocidade de suavização dos movimentos

// Criando um terreno
const terrainSize = 30; // Tamanho do terreno
const terrainGeometry = new THREE.PlaneGeometry(terrainSize, terrainSize, 400, 400);
terrainGeometry.rotateX(-Math.PI / 2); // Rotaciona o terreno para que fique plano
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg'); // Carrega a textura do terreno
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(10, 10); // Repete a textura no terreno
const terrainMaterial = new THREE.MeshLambertMaterial({ map: texture }); // Usa MeshLambertMaterial para iluminação difusa
const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
terrain.receiveShadow = true;
scene.add(terrain);

// Função para criar o jogador
function createPlayer(scene) {
    const playerGeometry = new THREE.BoxGeometry(1, 2, 1);
    const playerMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.y = 1; // Coloca o jogador na altura do chão
    player.castShadow = true;
    scene.add(player);
    return player;
}

// Inicialização do jogador
const player = createPlayer(scene); // Adicionando o jogador à cena

// Posicionando a câmera
camera.position.set(0, 10, 20); // Ajusta a posição da câmera para uma visão melhor da cena
controls.update(); // Atualiza os controles para refletir a nova posição da câmera

// Criação do sol com brilho adicional
const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.set(0, 80, 0);
scene.add(sun);

// Adicionando uma luz pontual no sol
const pointLight = new THREE.PointLight(0xffff00, 1.5, 100);
pointLight.position.copy(sun.position);
scene.add(pointLight);

// Criando um efeito de brilho ao redor do sol
const spriteMaterial = new THREE.SpriteMaterial({
    map: new THREE.TextureLoader().load('https://threejs.org/examples/textures/lensflare/lensflare0_alpha.png'),
    color: 0xffff00,
    transparent: true,
    opacity: 0.75
});

const sunGlow = new THREE.Sprite(spriteMaterial);
sunGlow.scale.set(10, 10, 1);
sun.add(sunGlow);

// Criando uma lua orbital
const moonGeometry = new THREE.SphereGeometry(1, 32, 32);
const moonMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaaa }); // Usando MeshPhongMaterial para reflexão de luz
const moon = new THREE.Mesh(moonGeometry, moonMaterial);
moon.position.set(-10, -80, 0); // Posição inicial da lua
scene.add(moon);

// Movendo a luz ambiente junto com o sol
ambientLight.position.copy(sun.position);

// Variáveis para controlar a direção do sol e da lua
const sunDirection = { x: -1, y: 1, z: 2 }; // Direção do sol
const moonDirection = { x: -1, y: 1, z: 1 }; // Direção da lua, oposta ao sol

// Função para atualizar a posição orbital do sol e da lua
function updateOrbitalPositions() {
    const time = Date.now() * 0.00005; // Fator de escala para controlar a velocidade do movimento
    const solradius = 30; // Raio da órbita
    const luaradius = 20; // Raio da órbita
    const sunSpeed = 0.2; // Velocidade orbital do sol
    const moonSpeed = 0.2; // Velocidade orbital da lua

    // Calcula a nova posição orbital do sol
    const sunX = Math.cos(time * sunSpeed) * solradius * sunDirection.x + 2;
    const sunZ = Math.sin(time * sunSpeed) * solradius * sunDirection.z;
    const sunY = Math.sin(time * sunSpeed) * solradius * sunDirection.y + 2;
    sun.position.set(sunX, sunY, sunZ); // Define a nova posição do sol

    // Calcula a nova posição orbital da lua
    const moonX = Math.cos(time * moonSpeed) * luaradius * moonDirection.x;
    const moonZ = Math.sin(time * moonSpeed) * luaradius * moonDirection.z;
    const moonY = -Math.sin(time * moonSpeed) * luaradius * moonDirection.y;
    moon.position.set(moonX, moonY, moonZ); // Define a nova posição da lua
}

// Movendo a luz ambiente e a luz direcional junto com o sol
function updateLightPosition() {
    ambientLight.position.copy(sun.position); // Move a luz ambiente junto com o sol
    directionalLight.position.copy(sun.position); // Move a luz direcional junto com o sol
}

// Função para criar um balão de diálogo
function createDialogueBalloon() {
    const balloonGeometry = new THREE.PlaneGeometry(2, 1, 1);
    const balloonMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    const balloon = new THREE.Mesh(balloonGeometry, balloonMaterial);
    balloon.position.y = 3; // Altura acima do NPC
    balloon.visible = false; // Inicialmente invisível
    return balloon;
}

// Função para criar o menu de opções
function createMenu(options) {
    const menu = new THREE.Group();
    const optionHeight = 0.5;
    const optionSpacing = 0.1;

    options.forEach((option, index) => {
        const optionGeometry = new THREE.PlaneGeometry(2, optionHeight);
        const optionMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, side: THREE.DoubleSide });
        const optionMesh = new THREE.Mesh(optionGeometry, optionMaterial);

        const loader = new THREE.FontLoader();
        loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
            const textGeometry = new THREE.TextGeometry(option, {
                font: font,
                size: 0.2,
                height: 0.01
            });
            const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.position.set(-0.9, -0.1, 0.1); // Ajuste conforme necessário
            optionMesh.add(textMesh);
        });

        optionMesh.position.y = -index * (optionHeight + optionSpacing);
        optionMesh.name = option; // Nomear o mesh com o nome da opção
        optionMesh.userData = { index }; // Guardar o índice da opção nos dados do usuário
        menu.add(optionMesh);
    });

    menu.position.set(0, 3, 0);
    menu.visible = false;
    return menu;
}

// Função para criar um NPC
function createNPC() {
    const npcGeometry = new THREE.BoxGeometry(1, 2, 1);
    const npcMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const npc = new THREE.Mesh(npcGeometry, npcMaterial);
    npc.position.y = 1; // Coloca o NPC na altura do chão
    npc.castShadow = true;
    return npc;
}

// Função para criar um submenu de missões ou loja
function createSubMenu(options) {
    return createMenu(options);
}

// Função para criar um diálogo de perguntas e respostas
function createDialogue() {
    const dialogue = new THREE.Group();
    const questions = ["Qual é o seu nome?", "Como você está?", "Qual é a sua missão?"];
    const questionHeight = 0.5;
    const questionSpacing = 0.1;

    questions.forEach((question, index) => {
        const questionGeometry = new THREE.PlaneGeometry(3, questionHeight);
        const questionMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, side: THREE.DoubleSide });
        const questionMesh = new THREE.Mesh(questionGeometry, questionMaterial);

        const loader = new THREE.FontLoader();
        loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
            const textGeometry = new THREE.TextGeometry(question, {
                font: font,
                size: 0.2,
                height: 0.01
            });
            const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.position.set(-1.4, -0.1, 0.1); // Ajuste conforme necessário
            questionMesh.add(textMesh);
        });

        questionMesh.position.y = -index * (questionHeight + questionSpacing);
        questionMesh.name = question; // Nomear o mesh com o nome da pergunta
        dialogue.add(questionMesh);
    });

    dialogue.position.set(0, 3, 0);
    dialogue.visible = false;
    return dialogue;
}

// Inicialização do NPC, do menu e dos submenus após a cena e o jogador serem definidos
const npc = createNPC(); // Criando o NPC
const dialogueBalloon = createDialogueBalloon(); // Criando o balão de diálogo
const menu = createMenu(["Falar", "Missões", "Loja"]); // Criando o menu de opções
const missionMenu = createSubMenu(["Missão 1", "Missão 2", "Missão 3"]); // Criando o submenu de missões
const shopMenu = createSubMenu(["Item 1", "Item 2", "Item 3"]); // Criando o submenu de loja
const dialogue = createDialogue(); // Criando o diálogo de perguntas e respostas

npc.add(dialogueBalloon); // Adicionando o balão de diálogo ao NPC
npc.add(menu); // Adicionando o menu ao NPC
npc.add(missionMenu); // Adicionando o submenu de missões ao NPC
npc.add(shopMenu); // Adicionando o submenu de loja ao NPC
npc.add(dialogue); // Adicionando o diálogo ao NPC
scene.add(npc); // Adicionando o NPC à cena

// Variáveis para controlar o movimento do NPC
let targetPosition = new THREE.Vector3(Math.random() * terrainSize - terrainSize / 2, 1, Math.random() * terrainSize - terrainSize / 2); // Define uma posição aleatória para o NPC se movimentar
let npcSpeed = Math.random() * 0.02 + 0.01; // Velocidade inicial do NPC

// Função de animação para mover e rotacionar o NPC de forma realista
function animateNPC() {
    const playerDistance = npc.position.distanceTo(player.position); // Calcula a distância entre o NPC e o jogador
    const minDistanceToPlayer = 2; // Distância mínima para o NPC parar quando o jogador se aproxima

    if (playerDistance > minDistanceToPlayer) {
        // Verifica se o NPC está parado, se sim, redefine a velocidade
        if (npcSpeed === 0) {
            npcSpeed = Math.random() * 0.02 + 0.01; // Define uma velocidade aleatória entre 0.01 e 0.03
        }

        // Calcula a direção para a posição alvo
        const direction = targetPosition.clone().sub(npc.position).normalize();
        
        // Move o NPC na direção da posição alvo com uma velocidade baseada na distância entre o NPC e o jogador
        npc.position.add(direction.clone().multiplyScalar(npcSpeed));

        // Rotação do NPC na direção do movimento
        npc.lookAt(targetPosition);

        // Verifica se o NPC chegou próximo o suficiente da posição alvo
        if (npc.position.distanceTo(targetPosition) < 1) {
            // Define uma nova posição alvo aleatória
            targetPosition = new THREE.Vector3(Math.random() * terrainSize - terrainSize / 2, 1, Math.random() * terrainSize - terrainSize / 2);
        }
    } else {
        // Parar o NPC quando o jogador está próximo
        npcSpeed = 0;
        // NPC olha para o jogador
        npc.lookAt(player.position);
    }
}

// Função para verificar a proximidade do jogador em relação ao NPC
function checkPlayerProximity() {
    const distance = player.position.distanceTo(npc.position);
    if (distance < 5) { // Defina o raio de proximidade como 5 unidades (ajuste conforme necessário)
        dialogueBalloon.visible = true; // Mostrar o balão de diálogo
    } else {
        dialogueBalloon.visible = false; // Esconder o balão de diálogo
        menu.visible = false; // Esconder o menu quando o jogador se afasta
        missionMenu.visible = false; // Esconder o submenu de missões
        shopMenu.visible = false; // Esconder o submenu de loja
        dialogue.visible = false; // Esconder o diálogo
    }
}

        let playerCoins = 1000; // Initial player coins
        const houseEditCost = 1000; // Cost to edit house

        const objectsJson = {
            "house": {
                "name": "Medieval House",
                "components": [
                    {
                        "type": "wall",
                        "name": "Front Wall",
                        "dimensions": { "width": 10, "height": 7, "depth": 0.5 },
                        "position": { "x": 0, "y": 3.5, "z": 5 },
                        "material": { "color": "#8B4513" }
                    },
                    {
                        "type": "wall",
                        "name": "Back Wall",
                        "dimensions": { "width": 10, "height": 7, "depth": 0.5 },
                        "position": { "x": 0, "y": 3.5, "z": -5 },
                        "material": { "color": "#8B4513" }
                    },
                    {
                        "type": "wall",
                        "name": "Left Wall",
                        "dimensions": { "width": 0.5, "height": 7, "depth": 10 },
                        "position": { "x": -5, "y": 3.5, "z": 0 },
                        "material": { "color": "#8B4513" }
                    },
                    {
                        "type": "wall",
                        "name": "Right Wall",
                        "dimensions": { "width": 0.5, "height": 7, "depth": 10 },
                        "position": { "x": 5, "y": 3.5, "z": 0 },
                        "material": { "color": "#8B4513" }
                    },
                    {
                        "type": "door",
                        "name": "Front Door",
                        "dimensions": { "width": 2, "height": 4, "depth": 0.2 },
                        "position": { "x": 0, "y": 2, "z": 5.1 },
                        "material": { "color": "#654321" }
                    },
                    {
                        "type": "window",
                        "name": "Front Window Left",
                        "dimensions": { "width": 1, "height": 1.5, "depth": 0.2 },
                        "position": { "x": -3, "y": 4, "z": 5.1 },
                        "material": { "color": "#87CEEB", "opacity": 0.6, "transparent": true }
                    },
                    {
                        "type": "window",
                        "name": "Front Window Right",
                        "dimensions": { "width": 1, "height": 1.5, "depth": 0.2 },
                        "position": { "x": 3, "y": 4, "z": 5.1 },
                        "material": { "color": "#87CEEB", "opacity": 0.6, "transparent": true }
                    },
                    {
                        "type": "roof",
                        "name": "Roof",
                        "dimensions": { "width": 11, "height": 4, "depth": 11 },
                        "position": { "x": 0, "y": 8.5, "z": 0 },
                        "material": { "color": "#A52A2A" }
                    }
                ]
            }
        };

        const editHouseDiv = document.getElementById('editHouseDiv');

function generateEditForm() {
    objectsJson.house.components.forEach((component, index) => {
        const section = document.createElement('div');
        section.innerHTML = `<h3>${component.name}</h3>`;

        for (let key in component.dimensions) {
            const label = document.createElement('label');
            label.innerHTML = `${key.charAt(0).toUpperCase() + key.slice(1)}: `;
            const input = document.createElement('input');
            input.type = 'number';
            input.value = component.dimensions[key];
            input.dataset.index = index;
            input.dataset.property = `dimensions.${key}`;
            label.appendChild(input);
            section.appendChild(label);
        }

        for (let key in component.position) {
            const label = document.createElement('label');
            label.innerHTML = `Position ${key.toUpperCase()}: `;
            const input = document.createElement('input');
            input.type = 'number';
            input.value = component.position[key];
            input.dataset.index = index;
            input.dataset.property = `position.${key}`;
            label.appendChild(input);
            section.appendChild(label);
        }

        const colorLabel = document.createElement('label');
        colorLabel.innerHTML = `Color: `;
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = component.material.color;
        colorInput.dataset.index = index;
        colorInput.dataset.property = `material.color`;
        colorLabel.appendChild(colorInput);
        section.appendChild(colorLabel);

        if (component.material.opacity !== undefined) {
            const opacityLabel = document.createElement('label');
            opacityLabel.innerHTML = `Opacity: `;
            const opacityInput = document.createElement('input');
            opacityInput.type = 'number';
            opacityInput.min = 0;
            opacityInput.max = 1;
            opacityInput.step = 0.1;
            opacityInput.value = component.material.opacity;
            opacityInput.dataset.index = index;
            opacityInput.dataset.property = `material.opacity`;
            opacityLabel.appendChild(opacityInput);
            section.appendChild(opacityLabel);
        }

        const category = document.getElementById(component.type.charAt(0).toUpperCase() + component.type.slice(1) + 's');
        if (category) { // Verifica se o elemento category foi encontrado
            category.appendChild(section);
        } else {
            console.error(`Element with id '${component.type.charAt(0).toUpperCase() + component.type.slice(1) + 's'}' not found.`);
        }
    });
}


        //generateEditForm();

        editHouseDiv.addEventListener('input', (event) => {
            const input = event.target;
            const index = input.dataset.index;
            const propertyPath = input.dataset.property.split('.');
            let component = objectsJson.house.components[index];
            propertyPath.forEach((prop, idx) => {
                if (idx === propertyPath.length - 1) {
                    component[prop] = input.type === 'color' ? input.value : parseFloat(input.value);
                } else {
                    component = component[prop];
                }
            });
            updateHouse();
        });

        function showCategory(category) {
            document.querySelectorAll('#editHouseDiv .category').forEach(div => {
                div.style.display = div.id === category ? 'block' : 'none';
            });
        }

        function createOrUpdateHouse() {
            const houseGroup = new THREE.Group();

            objectsJson.house.components.forEach(component => {
                let geometry, material;

                switch (component.type) {
                    case 'wall':
                        geometry = new THREE.BoxGeometry(component.dimensions.width, component.dimensions.height, component.dimensions.depth);
                        material = new THREE.MeshBasicMaterial({ color: component.material.color });
                        break;
                    case 'door':
                        geometry = new THREE.BoxGeometry(component.dimensions.width, component.dimensions.height, component.dimensions.depth);
                        material = new THREE.MeshBasicMaterial({ color: component.material.color });
                        break;
                    case 'window':
                        geometry = new THREE.BoxGeometry(component.dimensions.width, component.dimensions.height, component.dimensions.depth);
                        material = new THREE.MeshBasicMaterial({ color: component.material.color, transparent: true, opacity: component.material.opacity });
                        break;
                    case 'roof':
                        geometry = new THREE.ConeGeometry(component.dimensions.width / 2, component.dimensions.height, 4);
                        material = new THREE.MeshBasicMaterial({ color: component.material.color });
                        break;
                }

                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(component.position.x, component.position.y, component.position.z);
                houseGroup.add(mesh);
            });

            if (scene.getObjectByName('house')) {
                const existingHouse = scene.getObjectByName('house');
                scene.remove(existingHouse);
            }

            houseGroup.name = 'house';
            scene.add(houseGroup);
        }

        //createOrUpdateHouse();

        function updateHouse() {
            createOrUpdateHouse();
        }

        // Handle menu selection
        function handleMenuSelection(optionName) {
            switch (optionName) {
                case 'Loja 3':
                    shopMenu.visible = true;
                    missionMenu.visible = false;
                    dialogue.visible = false;
                    break;
                // Add other cases for 'Missões 2' and 'Falar 1'
            }
        }

        // Handle item purchase
        function handleItemPurchase(itemName) {
            if (itemName === 'Item 1' && playerCoins >= houseEditCost) {
                playerCoins -= houseEditCost;
                alert('Você comprou o item 1! Agora você pode editar a casa.');
                editHouseDiv.style.display = 'block';
            } else if (itemName === 'Item 1' && playerCoins < houseEditCost) {
                alert('Você está sem dinheiro, vai fazer missões.');
            }
        }

        // Event listener for shop menu item selection
        shopMenu.addEventListener('click', (event) => {
            const itemName = event.target.innerText;
            handleItemPurchase(itemName);
        });

        // Keyboard event to toggle menu visibility
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                const distance = player.position.distanceTo(npc.position);
                if (distance < 5) {
                    menu.visible = !menu.visible;
                    if (menu.visible) {
                        npc.remove(dialogueBalloon);
                    } else {
                        npc.add(dialogueBalloon);
                        missionMenu.visible = false;
                        shopMenu.visible = false;
                        dialogue.visible = false;
                    }
                }
            } else if (menu.visible || missionMenu.visible || shopMenu.visible || dialogue.visible) {
                const selectedOption = parseInt(event.key) - 1;
                if (!isNaN(selectedOption)) {
                    if (menu.visible) {
                        const option = menu.children[selectedOption];
                        if (option) {
                            handleMenuSelection(option.name);
                        }
                    } else if (missionMenu.visible) {
                        const mission = missionMenu.children[selectedOption];
                        if (mission) {
                            console.log("Missão selecionada:", mission.name);
                            missionMenu.visible = false;
                            dialogueBalloon.visible = true;
                        }
                    } else if (shopMenu.visible) {
                        const item = shopMenu.children[selectedOption];
                        if (item) {
                            console.log("Item selecionado:", item.name);
                            handleItemPurchase(item.name);
                        }
                    } else if (dialogue.visible) {
                        const question = dialogue.children[selectedOption];
                        if (question) {
                            console.log("Pergunta selecionada:", question.name);
                        }
                    }
                }
            }
        });

// Função para tratar a seleção do menu principal
function handleMenuSelection(option) {
    if (option === "Falar") {
        menu.visible = false;
        dialogue.visible = true;
    } else if (option === "Missões") {
        menu.visible = false;
        missionMenu.visible = true;
    } else if (option === "Loja") {
        menu.visible = false;
        shopMenu.visible = true;
    }
}


const dayNightStates = ["Day", "Night"];
let currentDayNightState = dayNightStates[0]; // Começa de dia
const dayNightDiv = document.getElementById("dayNightDiv");

const dayColor = new THREE.Color(0x87CEEB); // Azul claro para o dia
const nightColor = new THREE.Color(0x000022); // Azul escuro para a noite
let skyColor = new THREE.Color(); // Cor atual do céu

// Função para criar estrelas
function createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1,
        sizeAttenuation: true,
        transparent: true
    });

    const starCount = 1000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
        starPositions[i * 3 + 0] = (Math.random() - 0.5) * 200; // x
        starPositions[i * 3 + 1] = (Math.random() - 0.5) * 200; // y
        starPositions[i * 3 + 2] = (Math.random() - 0.5) * 200; // z
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    return stars;
}

const stars = createStars();

function updateDayNightState() {
    const maxY = 20; // Altura máxima do sol para considerar "dia"
    const minY = -20; // Altura mínima do sol para considerar "noite"

    // Atualiza o estado do dia ou da noite
    if (sun.position.y > 0) {
        currentDayNightState = dayNightStates[0]; // Day
    } else {
        currentDayNightState = dayNightStates[1]; // Night
    }
    dayNightDiv.innerHTML = currentDayNightState;

    // Normaliza a posição do sol entre 0 e 1 para interpolação de cores
    const t = Math.max(0, Math.min(1, (sun.position.y - minY) / (maxY - minY)));
    skyColor.lerpColors(nightColor, dayColor, t);

    scene.background = skyColor; // Atualiza a cor do fundo do céu

    // Atualiza a opacidade das estrelas
    const starOpacity = 1 - t;
    stars.material.opacity = starOpacity;
}

// Função para criar uma nuvem sem textura
function createCloud(color, position, scale) {
    const cloudGeometry = new THREE.BoxGeometry(2.1, 2, 3); // Usamos um cubo para representar a nuvem
    const cloudMaterial = new THREE.MeshLambertMaterial({
        color: color,
        transparent: true,
        opacity: 0.5 // Definimos a opacidade para tornar a nuvem semi-transparente
    });
    const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
    cloud.position.copy(position);
    cloud.scale.set(scale.x, scale.y, scale.z);
    cloud.castShadow = true;
    return cloud;
}

// Criar e adicionar várias nuvens à cena
const clouds = [];
for (let i = 0; i < 10; i++) {
    const position = new THREE.Vector3(
        Math.random() * terrainSize - terrainSize / 2,
        45 + Math.random() * 5,
        Math.random() * terrainSize - terrainSize / 2
    );
    const scale = new THREE.Vector3(
        1 + Math.random() * 2,
        1 + Math.random() * 2,
        1
    );
    const cloudColor = new THREE.Color(0xffffff); // Definir uma cor para a nuvem (branco puro)
    const cloud = createCloud(cloudColor, position, scale);
    clouds.push(cloud);
    scene.add(cloud);
}

// Função para atualizar as posições das nuvens
function updateClouds() {
    clouds.forEach(cloud => {
        cloud.position.x += 0.001; // Movimento lento para a direita
        if (cloud.position.x > terrainSize / 2) {
            cloud.position.x = -terrainSize / 2; // Volta para o início quando sai da tela
        }
    });
}

function updateMoonLightIntensity() {
    const sunDirectionVector = sun.position.clone().normalize();
    const moonDirectionVector = moon.position.clone().normalize();
    const dotProduct = sunDirectionVector.dot(moonDirectionVector);
    const moonLightIntensity = Math.max(0, dotProduct); // Limita a intensidade mínima da luz a 0
    moon.material.emissiveIntensity = moonLightIntensity;
}


function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Atualiza os controles a cada quadro
    updateOrbitalPositions(); // Atualiza a posição orbital do sol e da lua
    updateDayNightState(); // Atualiza o estado de dia/noite e a cor do céu
    updateLightPosition(); // Atualiza a posição das luzes ambiente e direcional
    updateMoonLightIntensity();
    checkPlayerProximity();
    updateClouds();
    animateNPC();
    renderer.render(scene, camera);
}

animate();

