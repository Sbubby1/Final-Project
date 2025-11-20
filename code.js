// ...existing code...
import { Game } from "./states/game.js";
import { GameOver } from "./states/gameOver.js";
import { Title } from "./states/title.js";
import { Toolbox } from "./toolbox.js";

let canvas = document.getElementById("myCanvas");
let pencil = canvas.getContext("2d");
let toolbox = new Toolbox();

// state instances
let game = new Game(canvas, pencil);
let gameOver = new GameOver(canvas, pencil);
let title = new Title(canvas, pencil);

let state = title;

function switchState(newState) {
    if (state === newState) return;
    if (state && typeof state.destroy === "function") state.destroy();
    state = newState;
}

function gameLoop() {
    // don't force state back to title every frame
    pencil.clearRect(0, 0, canvas.width, canvas.height);

    let command = state.update();

    if (command == "title") {
        switchState(title);
    } else if (command == "gameOver") {
        switchState(gameOver);
    } else if (command == "game") {
        switchState(game);
    }
}

setInterval(gameLoop, 1000 / 60);
// ...existing code...