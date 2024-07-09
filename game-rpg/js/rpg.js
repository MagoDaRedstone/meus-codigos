// rpg.js

// Variáveis para controle de movimento
const playerSpeed = 0.1; // Velocidade de movimento do jogador
const jumpHeight = 2; // Altura do salto
let isJumping = false; // Verifica se o jogador está atualmente pulando
let jumpVelocity = 0; // Velocidade vertical do salto
const gravity = 0.05; // Gravidade
const playerMovement = {
    forward: false,
    backward: false,
    left: false,
    right: false
};

// Lidando com eventos de teclado para mover o jogador
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w':
            playerMovement.forward = true;
            break;
        case 's':
            playerMovement.backward = true;
            break;
        case 'a':
            playerMovement.left = true;
            break;
        case 'd':
            playerMovement.right = true;
            break;
        case ' ':
            if (!isJumping) {
                isJumping = true;
                jumpVelocity = 0.5; // Velocidade inicial do salto
            }
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'w':
            playerMovement.forward = false;
            break;
        case 's':
            playerMovement.backward = false;
            break;
        case 'a':
            playerMovement.left = false;
            break;
        case 'd':
            playerMovement.right = false;
            break;
    }
});

// Função para atualizar a posição do jogador suavemente
function updatePlayerPosition() {
    const moveVector = new THREE.Vector3();

    // Movimento para frente e para trás
    if (playerMovement.forward) {
        moveVector.z -= playerSpeed;
    }
    if (playerMovement.backward) {
        moveVector.z += playerSpeed;
    }

    // Movimento para a esquerda e para a direita
    if (playerMovement.left) {
        moveVector.x -= playerSpeed;
    }
    if (playerMovement.right) {
        moveVector.x += playerSpeed;
    }

    // Converter a direção do movimento do jogador para o sistema de coordenadas do mundo
    moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);

    // Atualizar a posição do jogador
    player.position.add(moveVector);

    // Aplicar gravidade e atualizar a posição vertical do jogador durante o salto
    if (isJumping) {
        player.position.y += jumpVelocity;
        jumpVelocity -= gravity;
        if (player.position.y <= 1) { // Verifica se o jogador aterrisou
            player.position.y = 1;
            isJumping = false;
        }
    }
}

// Função de animação para atualizar a posição do jogador suavemente
function animatePlayer() {
    requestAnimationFrame(animatePlayer);
    updatePlayerPosition(); 
}
animatePlayer();

