const score = document.querySelector('#score');
const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

canvas.width = 1280;
canvas.height = 720;

//player class
class Player {
  constructor() {
    this.velocity = { x: 0, y: 0 };

    const image = new Image();
    image.src = './assets/fighter.png';

    this.ratation = 0;
    this.opacity = 1;

    image.onload = () => {
      const scale = 0.5;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: canvas.width / 2 - this.width / 2,
        y: canvas.height - this.height - 30,
      };
    };
  }

  draw() {
    // context.fillStyle = 'red';
    // context.fillRect(this.position.x, this.position.y, this.width, this.height);
    context.save();
    context.globalAlpha = this.opacity;
    context.translate(
      player.position.x + player.width / 2,
      player.position.y + player.height / 2
    );
    context.rotate(this.rotation);
    context.translate(
      -player.position.x - player.width / 2,
      -player.position.y - player.height / 2
    );
    context.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );

    context.restore();
  }

  update() {
    if (this.image) {
      this.draw();
      this.position.x += this.velocity.x;
    }
  }
}

//projectile class
class Projectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;

    this.radius = 4;
  }

  draw() {
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    context.fillStyle = 'red';
    context.fill();
    context.closePath();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

//alien Projectile class
class AlienProjectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;

    this.width = 3;
    this.height = 10;
  }

  draw() {
    context.fillStyle = 'white';
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

//particles class
class Particle {
  constructor({ position, velocity, radius, color, fades }) {
    this.position = position;
    this.velocity = velocity;

    this.radius = radius;
    this.color = color;
    this.opacity = 1;
    this.fades = fades;
  }

  draw() {
    context.save();
    context.globalAlpha = this.opacity;
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    context.fillStyle = this.color;
    context.fill();
    context.closePath();
    context.restore();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.fades) {
      this.opacity -= 0.01;
    }
  }
}

//alien class
class Alien {
  constructor({ position }) {
    this.velocity = { x: 0, y: 0 };

    const image = new Image();
    image.src = './assets/alien.png';

    image.onload = () => {
      const scale = 0.25;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: position.x,
        y: position.y,
      };
    };
  }

  draw() {
    // context.fillStyle = 'red';
    // context.fillRect(this.position.x, this.position.y, this.width, this.height);

    context.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  update({ velocity }) {
    if (this.image) {
      this.draw();
      this.position.x += velocity.x;
      this.position.y += velocity.y;
    }
  }

  shoot(alienProjectiles) {
    alienProjectiles.push(
      new AlienProjectile({
        position: {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height,
        },
        velocity: {
          x: 0,
          y: 5,
        },
      })
    );
  }
}

//grid class
class Grid {
  constructor() {
    this.position = {
      x: 0,
      y: 0,
    };
    this.velocity = {
      x: 3,
      y: 0,
    };

    this.aliens = [];
    const rows = Math.floor(Math.random() * 5 + 2);
    const columns = Math.floor(Math.random() * 10 + 5);

    this.width = columns * 60;

    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        this.aliens.push(
          new Alien({
            position: {
              x: x * 60,
              y: y * 60,
            },
          })
        );
      }
    }
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    this.velocity.y = 0;

    if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
      this.velocity.x = -this.velocity.x;
      this.velocity.y = 60;
    }
  }
}

//create a new player instance
const player = new Player();
const projectiles = [];
const grids = [];
const alienProjectiles = [];
const particles = [];

const keys = {
  a: { pressed: false },
  d: { pressed: false },
  space: { pressed: false },
};

//create animation to paint animations for instances
let frames = 0;
let randomInterval = Math.floor(Math.random() * 500 + 500);
let game = {
  over: false,
  active: true,
};

let scoreCount = 0;

for (let i = 0; i < 100; i++) {
  particles.push(
    new Particle({
      position: {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
      },
      velocity: {
        x: 0,
        y: 0.3,
      },
      radius: Math.random() * 2,
      color: 'white',
    })
  );
}

function createParticles({ object, color, fades }) {
  for (let i = 0; i < 15; i++) {
    particles.push(
      new Particle({
        position: {
          x: object.position.x + object.width / 2,
          y: object.position.y + object.height / 2,
        },
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
        },
        radius: Math.random() * 3,
        color: color || '#BAA0DE',
        fades,
      })
    );
  }
}

function animate() {
  if (!game.active) return;
  requestAnimationFrame(animate);
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  particles.forEach((particle, index) => {
    if (particle.position.y - particle.radius >= canvas.height) {
      particle.position.x = Math.random() * canvas.width;
      particle.position.y = -particle.radius;
    }

    if (particle.opacity <= 0) {
      setTimeout(() => {
        particles.splice(index, 1);
      }, 0);
    } else {
      particle.update();
    }
  });
  alienProjectiles.forEach((alienProjectile, index) => {
    if (alienProjectile.position.y + alienProjectile.height >= canvas.height) {
      setTimeout(() => {
        alienProjectiles.splice(index, 1);
      }, 0);
    } else {
      alienProjectile.update();
    }
    //  projectile hits player
    if (
      alienProjectile.position.y + alienProjectile.height >=
        player.position.y &&
      alienProjectile.position.x + alienProjectile.width >= player.position.x &&
      alienProjectile.position.x <= player.position.x + player.width
    ) {
      console.log('you lose');

      setTimeout(() => {
        alienProjectiles.splice(index, 1);
        player.opacity = 0;
        game.over = true;
      }, 0);

      setTimeout(() => {
        game.active = false;
      }, 2000);
      createParticles({
        object: player,
        color: 'white',
        fades: true,
      });
    }
  });
  projectiles.forEach((projectile, index) => {
    if (projectile.position.y + projectile.radius <= 0) {
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0);
    } else {
      projectile.update();
    }
  });

  grids.forEach((grid, gridIndex) => {
    grid.update();
    //   spawn projectiles
    if (frames % 100 === 0 && grid.aliens.length > 0) {
      grid.aliens[Math.floor(Math.random() * grid.aliens.length)].shoot(
        alienProjectiles
      );
    }
    grid.aliens.forEach((alien, i) => {
      alien.update({ velocity: grid.velocity });

      // projectile collision detection
      projectiles.forEach((projectile, j) => {
        if (
          projectile.position.y - projectile.radius <=
            alien.position.y + alien.height &&
          projectile.position.x + projectile.radius >= alien.position.x &&
          projectile.position.x - projectile.radius <=
            alien.position.x + alien.width &&
          projectile.position.y + projectile.radius >= alien.position.y
        ) {
          setTimeout(() => {
            const alienExists = grid.aliens.find((alienOfInterest) => {
              return alienOfInterest === alien;
            });
            const projectileExists = projectiles.find(
              (projectileOfInterest) => {
                return projectileOfInterest === projectile;
              }
            );

            //remove aliens and projectile
            if (alienExists && projectileExists) {
              scoreCount += 100;
              score.innerHTML = scoreCount;
              createParticles({
                object: alien,
                fades: true,
              });
              grid.aliens.splice(i, 1);
              projectiles.splice(j, 1);

              if (grid.aliens.length > 0) {
                const firstAlien = grid.aliens[0];
                const lastAlien = grid.aliens[grid.aliens.length - 1];

                grid.width =
                  lastAlien.position.x -
                  firstAlien.position.x +
                  lastAlien.width;

                grid.position.x = firstAlien.position.x;
              } else {
                grid.splice(gridIndex, 1);
              }
            }
          }, 0);
        }
      });
    });
  });
  if (keys.a.pressed && player.position.x >= 0) {
    player.velocity.x = -7;
    player.rotation = -0.09;
  } else if (
    keys.d.pressed &&
    player.position.x + player.width <= canvas.width
  ) {
    player.velocity.x = 7;
    player.rotation = 0.09;
  } else {
    player.velocity.x = 0;
    player.rotation = 0;
  }

  //   spawning aliens
  if (frames % randomInterval === 0) {
    grids.push(new Grid());
    randomInterval = Math.floor(Math.random() * 500 + 500);
    frames = 0;
  }

  frames++;
}

animate();

//movement
addEventListener('keydown', ({ key }) => {
  if (game.over) return;

  switch (key) {
    case 'a':
      keys.a.pressed = true;
      break;
    case 'ArrowLeft':
      keys.a.pressed = true;
      break;
    case 'd':
      keys.d.pressed = true;
      break;
    case 'ArrowRight':
      keys.d.pressed = true;
      break;
    case ' ':
      projectiles.push(
        new Projectile({
          position: {
            x: player.position.x + player.width / 2,
            y: player.position.y,
          },
          velocity: { x: 0, y: -15 },
        })
      );
      break;
  }
});

addEventListener('keyup', ({ key }) => {
  switch (key) {
    case 'a':
      keys.a.pressed = false;
      break;
    case 'ArrowLeft':
      keys.a.pressed = false;
      break;
    case 'd':
      keys.d.pressed = false;
      break;
    case 'ArrowRight':
      keys.d.pressed = false;
      break;
  }
});
