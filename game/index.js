const colors = ["green", "red", "yellow", "blue"];
const levels = [
  { label: "Easy", value: 10 },
  { label: "Medium", value: 20 },
  { label: "Hard", value: 30 },
];

const board = {
  el: document.querySelector("#board"),
  square: {
    build: (color) => {
      const squareEl = document.createElement("div");
      squareEl.id = color;
      squareEl.classList.add("square");

      squareEl.addEventListener("click", () => {
        game.playSquare(color);
      });

      return squareEl;
    },
  },
  controllers: {
    init: () => {
      const controllers = board.controllers.build();

      const score = board.controllers.score.build();
      const level = board.controllers.level.build(levels);
      const start = board.controllers.start.build();

      controllers.appendChild(score);
      controllers.appendChild(level);
      controllers.appendChild(start);

      return controllers;
    },
    build: () => {
      const controllers = document.createElement("div");
      controllers.id = "controllers";

      return controllers;
    },
    score: {
      build: () => {
        const score = document.createElement("div");
        const span = document.createElement("span");

        span.textContent = "0";
        score.id = "score";
        score.textContent = "Score: ";
        score.appendChild(span);

        return score;
      },
    },
    level: {
      build: (levels) => {
        const levelEl = document.createElement("select");

        levelEl.name = "level";
        levelEl.id = "level";

        levels.map((level) => {
          const option = document.createElement("option");
          option.value = level.value;
          option.textContent = level.label;
          levelEl.appendChild(option);
        });

        return levelEl;
      },
    },
    start: {
      build: () => {
        const start = document.createElement("button");

        start.id = "start";
        start.textContent = "Start";

        start.addEventListener("click", () => {
          game.start();
        });

        return start;
      },
    },
    buildScore: () => {
      const score = controllers.score.build();
      controllers.el.appendChild(score);
    },
    buildLevel: (levels) => {
      const level = controllers.level.build(levels);
      controllers.el.appendChild(level);
    },
    buildStart: () => {
      const start = controllers.start.build();
      controllers.el.appendChild(start);
    },
  },
  init: () => {
    board.build();
    board.buildSquares();
    board.buildControllers();
  },
  build: () => {
    const maxBoardSize = board.getMinParentSize(board.el) * 0.8;
    board.el.style.width = maxBoardSize + "px";
    board.el.style.height = maxBoardSize + "px";
  },
  buildSquares: () => {
    const squares = colors.map((color) => board.square.build(color));
    squares.forEach((square) => board.el.appendChild(square));
  },
  buildControllers: () => {
    const controllers = board.controllers.init();
    board.el.appendChild(controllers);
  },
  getMinParentSize: (el) => {
    const parent = el.parentElement;
    const parentWidth = parent.clientWidth;
    const parentHeight = parent.clientHeight;
    return Math.min(parentWidth, parentHeight);
  },
  removeControllers: () => {
    const controllers = document.querySelector("#controllers");
    const level = controllers.querySelector("#level");
    const start = controllers.querySelector("#start");

    controllers.removeChild(level);
    controllers.removeChild(start);
  },
  addControllers: () => {
    const controllers = document.querySelector("#controllers");
    const level = board.controllers.level.build(levels);
    const start = board.controllers.start.build();

    controllers.appendChild(level);
    controllers.appendChild(start);
  },
};

const game = {
  score: 0,
  level: 10,
  computerSequence: [],
  playerSequence: [],
  isPlaying: false,
  isPaused: false,
  isWin: false,
  computerSequenceTimer: null,
  computerSequenceLoop: null,
  playColorSquareTimer: null,
  init: () => {
    board.init();
  },
  start: () => {
    board.removeControllers();
    game.isPlaying = true;
    game.computerPlaySequence();
    game.userPlaySequence();
  },
  lose: () => {
    clearInterval(board.computerSequenceTimer);
    clearTimeout(board.computerSequenceLoop);
    game.reset();
    board.addControllers();
    game.updateScore(0);
  },
  reset: () => {
    game.isPlaying = false;
    game.isPaused = false;
    game.isWin = false;
    game.score = 0;
    game.computerSequence = [];
    game.playerSequence = [];
  },
  check: () => {
    const isCorrect = game.playerSequence.every(
      (color, index) => color === game.computerSequence[index]
    );

    if (
      isCorrect &&
      game.playerSequence.length === game.computerSequence.length
    ) {
      game.playerSequence = [];
      game.continue();
    } else if (!isCorrect) {
      game.lose();
    }
  },
  continue: () => {
    game.computerPlaySequence();
  },
  computerPlaySequence: () => {
    game.toggleSquaresDisabled();
    game.isPaused = true;
    game.computerSequence.push(game.getRandomColor());

    game.computerSequence.forEach((color, index) => {
      board.computerSequenceTimer = setTimeout(() => {
        clearTimeout(board.playColorSquareTimer);
        game.playSquare(color);
        game.isPaused = false;
      }, 1000 * (index + 1));
    });

    board.computerSequenceLoop = setTimeout(() => {
      clearInterval(board.computerSequenceTimer);

      game.updateScore(game.computerSequence.length);
      game.toggleSquaresDisabled();
    }, 1000 * game.computerSequence.length + 1000);

    // console.log(game.computerSequence); // debug
  },
  userPlaySequence: () => {
    const squares = document.querySelectorAll(".square");
    squares.forEach((square) => {
      square.addEventListener("click", () => {
        if (!game.isPaused) {
          game.playerSequence.push(square.id);
          game.playSquare(square.id);
          game.check();
          // console.log(game.playerSequence); // debug
        }
      });
    });
  },
  /* Utils */
  getRandomColor: () => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  },
  /* Dom elements */
  toggleSquaresDisabled: () => {
    /* select all squares without the last one */
    const squares = document.querySelectorAll(".square:not(:last-child)");
    squares.forEach((square) => {
      square.classList.toggle("disabled");
    });
  },
  playSquare: (color) => {
    game.playColor(color);
    game.playSound(color);
  },
  playColor: (color) => {
    const square = document.querySelector(`#${color}`);
    square.classList.add("active");
    board.playColorSquareTimer = setTimeout(() => {
      square.classList.remove("active");
    }, 500);
  },
  playSound: (color) => {
    const sound = new Audio(`./game/sounds/${color}.mp3`);
    sound.play();
  },
  updateScore: (value) => {
    game.score = value;
    const scoreEl = document.querySelector("#score span");
    scoreEl.textContent = game.score;
  },
};

game.init();
