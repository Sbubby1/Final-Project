import { Game } from "./states/game.js";
import { GameOver } from "./states/gameOver.js";
import { Title } from "./states/title.js";
import { Toolbox } from "./toolbox.js";

let canvas = document.getElementById("myCanvas");
let pencil = canvas.getContext("2d"); // This gives you the drawing context, like a pencil
let toolbox = new Toolbox();

//make some states to go to.
let game = new Game(canvas, pencil);
let gameOver = new GameOver(canvas, pencil);
let title = new Title(canvas, pencil);

let state = title;

function gameLoop() {

    state = title;
canvas.clearRect(0, 0, canvas.width, canvas.height);

    let command = state.update();
if(command = "title") {
    state = Title
}
if(command == "gameOver") {
    state = gameOver
}
if(command == "game") {
    state = game
}

    // if(state == title) {
    //     title.update();
    // }
}

setInterval(gameLoop, 1000 / 60);