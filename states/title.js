
import { Toolbox } from "../toolbox.js";

export class Title {

    canvas;
    pencil;
    changeToGame = false;
    toolbox = new Toolbox();

 

    constructor(canvas, pencil) {
        this.canvas = canvas;
        this.pencil = pencil;

        // bind handlers so 'this' is correct in callbacks
        this.onKeyPressed = this.onKeyPressed.bind(this);
        this.onClicked = this.onClicked.bind(this);

        // use keydown and add listeners (no trailing commas)
        document.addEventListener("keydown", this.onKeyPressed);
        this.canvas.addEventListener("click", this.onClicked);
    }

    onKeyPressed(event) {
        this.changeToGame = true;
    }
    
    onClicked(event) {
        let isHitButton = this.toolbox.isWithinRect(
            event.offsetX, event.offsetY, 
            this.startButtonX, this.startButtonY, 
            this.startButtonW, this.startButtonH
        );
        this.changeToGame = isHitButton;
    }

    // Call destroy() when leaving the title state to remove listeners
    destroy() {
        document.removeEventListener("keydown", this.onKeyPressed);
       
    }

    update() {
        
        this.pencil.fillStyle = "blue";
        this.pencil.fillRect(0, 0, this.canvas.width, this.canvas.height);

        
        this.pencil.fillStyle = "darkgrey";
        this.pencil.font = "50px Orbitron, sans-serif";
        this.pencil.fillText("Robo Battle", 175, 300);
        

         this.pencil.fillStyle = "darkgrey";
        this.pencil.font = "25px Orbitron, sans-serif";
        this.pencil.fillText("Press any button to start", 170, 400);

        
        if(this.changeToGame) {
            this.changeToGame = false; // consume it
            return "game";
        }
    }
}
