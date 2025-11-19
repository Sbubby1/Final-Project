import { Game } from "./game.js";
import { GameOver } from "./gameOver.js";
import { StartScreen } from "./titlescreen.js";

let canvas = document.getElementById("myCanvas");
let pencil = canvas.getContext("2d"); // This gives you the drawing context, like a pencil






let game = new Game();
let ded = new GameOver();
let title = new StartScreen();
