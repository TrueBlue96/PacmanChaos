let my,shared,pacmanFont;
let marginVert,marginHori,col,row;
let obstacles, borders, ballCol,pacmanCol;
let path = [];
let wasHere = [];
let createWalls = [];
let eggs = [];
let scene = 0;
let size = 90;
let pacSize = 55;
let ghostSize = 50;
let spacing = 2;
let isPaused = false;
let hightlight = false;
let pacman,instructions,link;
let titleBackground,paused;
let x = 10;
let y = 300;

let redGhostArray = [];
let blueGhostArray = [];
let greenGhostArray = [];
let purpleGhostArray = [];
// let frameCount = 0;

function preload(){
    partyConnect(
        "wss://deepstream-server-1.herokuapp.com",
        "Pacman_basic",
        "main1"
      );
    shared = partyLoadShared("globals");
    my = partyLoadMyShared();
    participants = partyLoadParticipantShareds();
    //sounds

    //images
    titleBackground = loadImage("assets/titleScreen.png");
    paused = loadImage("assets/PausedScreen.png");

    //sprites
    redGhostArray[0] = loadImage("assets/RedGhostStatic.png");
    redGhostArray[1] = loadImage("assets/RedGhostLeft.png");
    redGhostArray[2] = loadImage("assets/RedGhostRight.png");
    redGhostArray[3] = loadImage("assets/RedGhostUp.png");
    redGhostArray[4] = loadImage("assets/RedGhostDown.png");
    redGhostArray[5] = loadImage("assets/RedGhostDead.png");

    blueGhostArray[0] = loadImage("assets/BlueGhostStatic.png");
    blueGhostArray[1] = loadImage("assets/BlueGhostLeft.png");
    blueGhostArray[2] = loadImage("assets/BlueGhostRight.png");
    blueGhostArray[3] = loadImage("assets/BlueGhostUp.png");
    blueGhostArray[4] = loadImage("assets/BlueGhostDown.png");
    blueGhostArray[5] = loadImage("assets/BlueGhostDead.png");

    greenGhostArray[0] = loadImage("assets/GreenGhostStatic.png");
    greenGhostArray[1] = loadImage("assets/GreenGhostLeft.png");
    greenGhostArray[2] = loadImage("assets/GreenGhostRight.png");
    greenGhostArray[3] = loadImage("assets/GreenGhostUp.png");
    greenGhostArray[4] = loadImage("assets/GreenGhostDown.png");
    greenGhostArray[5] = loadImage("assets/GreenGhostDead.png");

    purpleGhostArray[0] = loadImage("assets/PurpleGhostStatic.png");
    purpleGhostArray[1] = loadImage("assets/PurpleGhostLeft.png");
    purpleGhostArray[2] = loadImage("assets/PurpleGhostRight.png");
    purpleGhostArray[3] = loadImage("assets/PurpleGhostUp.png");
    purpleGhostArray[4] = loadImage("assets/PurpleGhostDown.png");
    purpleGhostArray[5] = loadImage("assets/PurpleGhostDead.png");

     //Font
     pacmanFont = loadFont("assets/crackman.TTF");
}

function setup(){
    let mainCanvas = createCanvas(1100,900);
    mainCanvas.parent("canvasdiv");
    let frameCount = frameRate(100);
    // angleMode(RADIANS);
    textFont(pacmanFont);
    col = width / size;
    row = height / size; 
   
    marginVert = Math.floor((width - col * size) / 2);
    marginHori = Math.floor((height - row * size) / 2);
    //change colors - or make them random
    obstacles = color(50,0,200);
    borders = color(80,60,200);
    ballCol = color(255);
    pacmanCol = color(254,213,0);
    link = createA("instructions.html","");

    instructions = createImg("assets/icon.png","instructions.html").parent(link);
    instructions.position(1350,50);
    instructions.size(60,60);

    for(let i = 0; i < col; i++){
        path[i] = [];
        wasHere[i] = [];
       for(let j = 0; j < row; j++){
          path[i][j] = [[col + 2][row + 2]];
        //   wasHere[i][j] = [[col + 2][row + 2]];
       }
    }
        //toggle server info
    partyToggleInfo(false);
    toggle = document.getElementById('toggle');

    //connect 4 observer role
    if(partyIsHost()){
        partySetShared(shared,{
            player: 0,
            //initialize pacman
            px: centerX(6),
            py: centerY(7),
            vx: 0,
            vy: 0,
            speed: 3,
            speedX: 0,
            speedY: 0,
            dir: 0,
            red_dir: 0,
            blue_dir: 0,
            green_dir: 0,
            purple_dir: 0,
            vel: 1,
            thetaOff: 0,
            theta: 0,

            //red ghost
            red_px: ghostCenterX(5),
            red_py: ghostCenterY(4),
            red_vx: 0,
            red_vy: 0,

            //blue
            blue_px: ghostCenterX(6),
            blue_py: ghostCenterY(4),
            blue_vx: 0,
            blue_vy: 0,

            //green
            green_px: ghostCenterX(5),
            green_py: ghostCenterY(5),
            green_vx: 0,
            green_vy: 0,
            green_pathCount: 0,

            //purple
            purple_px: ghostCenterX(6),//was col
            purple_py: ghostCenterY(5),
            purple_vx: 0,
            purple_vy: 0,
            purple_pathCount: 0,

            hostStart: false,
            hostRestart: false,
            role: "Observer"
        });
    }

    // Make a select menu
    teamDropDownMenu = createSelect();
    teamDropDownMenu.option("Choose a Team");
    teamDropDownMenu.disable("Choose a Team");
    teamDropDownMenu.option("Pac-man");
    teamDropDownMenu.option("Red Ghost");
    teamDropDownMenu.option("Blue Ghost");
    teamDropDownMenu.option("Green Ghost");
    teamDropDownMenu.option("Purple Ghost");
    teamDropDownMenu.position(1470,600);
    teamDropDownMenu.id("menu");

    if(partyIsHost){
        if(shared.player == 0){
            my.selectedTeam = "Pac-man";
        }
        else if(shared.player == 1){
            my.selectedTeam = "Red Ghost";
        }
        else if(shared.player == 2){
            my.selectedTeam = "Blue Ghost";
        }
        else if(shared.player == 3){
            my.selectedTeam = "Green Ghost";
        }
        else if(shared.player == 4){
            my.selectedTeam = "Purple Ghost";
        }
        else{
            my.selectedTeam = "Observer";
        }
    }
    
    // When an option is chosen, assign it to my.selectedTeam
    teamDropDownMenu.changed(() =>{
        my.selectedTeam = teamDropDownMenu.value();
    });
}

function draw(){
    background(1);
    instructions.hide();
    switch(scene){
    case 1:
      game();
      break;
    default:
      startScreen();
      instructions.show();
      break;
   }
}


function mousePressed(){
    if(scene == 0 && mouseX < 800 && mouseX > 350 && mouseY < 750 && mouseY > 700){
        scene = 1;
    }

    //exit or quit
}

function keyPressed(){
    //P
    // if(keyCode == 80){
    //    // pause();
    //     scene = 2;
    //     isPaused = true;
    // }
    // else{
    //     scene = 1;
    //     isPaused = false;
    // }
}

function startScreen(){
    image(titleBackground,0,0,1100,1000);
    textSize(90);
    fill(255);
    text("Pac-man: Chaos",100,200);
    textSize(60);
    
    if(frameCount % 60 < 30){
        text("Start Game",350,750);
    }

   //buttonHighlight();
}

function buttonHighlight(){

}

function waitForHost(){

}

function game(){
    background(0);
    maze();
    tokens();
    //pacman
    pacmanDraw();
    pacmanControls();

    //red ghost
    drawRedGhost();
    redGhostControls();

    //blue ghost
    drawBlueGhost();
    blueGhostControls();

    //green ghost
    drawGreenGhost();
    greenGhostControls();

    //purple ghost
    drawPurpleGhost();
    purpleGhostControls();
    //console.log(dist(shared.px,shared.py,createWalls[0][0],createWalls[0][1]));
    // definePath();

    detectWall();
    // chaosMode();
    //pacman appears on the other side of the screen when out of bounds
    shared.px = (shared.px + width) % width;
    shared.py = (shared.py + height) % height;//temporary

    shared.red_px = (shared.red_px + width) % width;
    shared.blue_px = (shared.blue_px + width) % width;
    shared.green_px = (shared.green_px + width) % width;
    shared.purple_px = (shared.purple_px + width) % width;
}

function gameOver(){

}

function pause(){
    background(paused);
    textSize(60);
    text("PAUSED",300,300);
}

function death(){

}

function victory(){

}

function maze(){
    //boundaries
    fill(0);
    stroke(borders);
    strokeWeight(spacing * 3);
    //
    rect(marginHori + 20,marginVert + 15,1050, 870);//recalculate
    fill(0);
    noStroke();

    //exits
    //left side
    rect(9, centerY(6) - 100, 25, 100);
    stroke(borders);
    line(centerX(0),centerY(6) - 100, centerX(1) - 25, centerY(6) - 100);
    line(centerX(0), centerY(6), centerX(1) - 25, centerY(6));

    //right
    noStroke();
    rect(centerX(col) + 10, centerY(6) - 100, 25, 100);
    stroke(borders);
    line(centerX(col) + 15, centerY(6) - 100, centerX(col + 1), centerY(6) - 100);
    line(centerX(col) + 15, centerY(6), centerX(col + 1), centerY(6));
    /*
    make array of the walls to loop through it
    change the walls!
    Draw obstacles of the type: (column, row, width XX, length YY)
    array of coordinates - iterate and don't draw eggs on the coordinates*/
    
        //top left
        walls(2, 2, 1, 2),
        walls(2, 2, 2, 1),

        //bottom left
        walls(2, 7, 1, 2),
        walls(2, 7, 1, 1),
        walls(2, 8, 2, 1),
        walls(4, 8, 1, 2),
  
        //top right
        walls(8, 2, 2, 1),
        walls(10, 2, 1, 3),

        //ghost cage
        walls(4, 4, 1, 2),
        walls(4, 6, 2, 1),
        walls(5, 6, 2, 1),
        walls(7, 4, 1, 3),
        
        //bottom
        walls(6, 10, 2, 0.75),
        //bottom right
        walls(10, 6, 1, 1),
        walls(10, 7, 2, 1),
        walls(8, 8, 2, 1),
        walls(9, 8, 1, 2);
       // console.log(createWalls);
}

//draw walls after tokens - temp fix
function walls(x,y,numC,numR){
    let x0, y0, large, comp;
    x0 = marginHori + (x - 1) * size; // _ + (9) * 100 = 
    y0 = marginVert + (y - 1) * size; // _ + (299) * 100 = 
    large = numC * 90;
    comp = numR * 90;
    fill(obstacles);
    noStroke();
    strokeWeight(spacing / 2);
    rect(x0,y0,large,comp);
    //console.log(large,comp);
    createWalls.push([x0,y0,large,comp]);
}

//pellets around the maze
//use wall array - make sure eggs don't collide with walls - if they do remove eggs from egg array
function tokens(){
  let cx,cy;
  noStroke();
  for(let i = 1; i <= col; i++){
    for(let j = 1; j <= row; j++){
       cx = centerX(i);
       cy = centerY(j);
       for(let i = 0; i < createWalls.length; i++){}
        //see if walls x & y is the same as the create walls
           //loop through walls and see if
          //only create eggs if there is not a wall in location - centerX, centerY
          fill(ballCol);
          ellipse(cx,cy,25,25);
       
         eggs.push([cx,cy]);
        
       }
    }
  //console.log(eggs);
}

//define the array of the map
// function definePath(){
//    for(let j = 0; j <= row + 1; j++){
//        for(let i = 0; i <= col + 1; i++){
//            if(get(centerX(i),centerY(j) != obstacles && wasHere[j][i] == false)){
//                path[j][i] = 2;
//            }
//            if(i == 0 || j == 0 || i == col + 1 || j == row + 1){
//                path[j][i] = 0;
//            }
//            if((i == 0 || i == col + 1) && j == 6){
//                path[j][i] = 3;
//            }
//            if((i == 3 && j == 3) || (i == 12 && j == 3)){
//                path[j][i] = 4;
//            }
//            if(wasHere[8][4] == false){
//                path[8][4] = 4;
//            }
//            if(wasHere[8][4] == true){
//             path[8][4] = 1;
//         }
//         if(wasHere[8][11] == false){
//             path[8][11] = 4;
//         }
//         if(wasHere[8][11] == true){
//          path[8][11] = 1;
//      }
//        }
//    } 
// }

function centerX(col){
    return marginHori + (col - 0.5) * size;
}

function centerY(row){
    return marginVert + (row - 0.5) * size;
}

function ghostCenterX(col){
    return marginHori + (col - 0.75) * size;
}

function ghostCenterY(row){
    return marginVert + (row - 0.75) * size;
}
//pacman
function pacmanDraw(){
    fill(pacmanCol);
    stroke(0);
    strokeWeight(3);
    shared.theta = PI / 3 * sq(sin(shared.thetaOff));//chomping

    if(shared.speedY < 0){
        arc(shared.px,shared.py,pacSize,pacSize, -shared.theta - PI / 6, shared.theta + 7 * PI / 6);
    }

    else if(shared.speedY > 0){
        arc(shared.px,shared.py,pacSize,pacSize, -7 * PI /6 - shared.theta, shared.theta + PI / 6);
    }

    else if(shared.speedX < 0){
        arc(shared.px,shared.py,pacSize,pacSize, shared.theta + PI, -shared.theta + PI);
    }

    else if(shared.speedX > 0){
        arc(shared.px,shared.py,pacSize,pacSize,shared.theta,-shared.theta);
    }

    else{
        //up
        if(shared.dir == 1){
            arc(shared.px,shared.py,pacSize,pacSize,-shared.theta - PI / 6, shared.theta + 7 * PI / 6);
            //eyes
            fill(0);
            ellipse(shared.px+12,shared.py,10,10);
        }
        //down
        else if(shared.dir == 2){
            arc(shared.px,shared.py,pacSize,pacSize,-7 * PI / 6 - shared.theta, shared.theta + PI / 6);
            //eyes
            fill(0);
            ellipse(shared.px+12,shared.py,10,10);
        }
        //left
        else if(shared.dir == 3){
            arc(shared.px,shared.py,pacSize,pacSize,shared.theta + PI, -shared.theta + PI);
            //eyes
            fill(0);
            ellipse(shared.px,shared.py-12, 10,10);
        }
        //right
        else if(shared.dir == 4){
            arc(shared.px,shared.py,pacSize,pacSize,shared.theta,-shared.theta);
            //eyes
            fill(0);
            ellipse(shared.px,shared.py-12,10,10);
        }
        else{
            arc(shared.px,shared.py,pacSize,pacSize,shared.theta,-shared.theta);
            //eyes
            fill(0);
            ellipse(shared.px,shared.py-12,10,10);
        }
    }
    shared.thetaOff += 0.1;//mouth movement
}

function pacmanControls(){
    shared.px += shared.vx;
    shared.py += shared.vy;
    shared.vx = 0;
    shared.vy = 0;

    if(my.selectedTeam == "Pac-man"){
        //have to speed instead of speedX & speedY
        //Up arrow or W

          
    //vertical collision - make velocity 0
    if(keyIsDown(UP_ARROW) || keyIsDown(87)){
        shared.vx = 0;
        shared.vy = -shared.vel * shared.speed;
        shared.dir = 1;
    }
    //down arrow or S
    if(keyIsDown(DOWN_ARROW) || keyIsDown(83)){
        shared.vx = 0;
        shared.vy = shared.vel * shared.speed;
        shared.dir = 2;
    }
    //left arrow & A
    if(keyIsDown(LEFT_ARROW) || keyIsDown(65)){
        shared.vx = -shared.vel * shared.speed;
        shared.vy = 0;
        shared.dir = 3;
    }
    //right arrow or D
    if(keyIsDown(RIGHT_ARROW) || keyIsDown(68)){
        shared.vx = shared.vel * shared.speed;
        shared.vy = 0;
        shared.dir = 4;
    }
    }

}

//Red Ghost
function drawRedGhost(){
    if(shared.speedY < 0){
      image(redGhostArray[0],shared.red_px,shared.red_py,ghostSize,ghostSize);
    }

    else if(shared.speedY > 0){
       image(redGhostArray[3],shared.red_px,shared.red_py,ghostSize,ghostSize);
    }

    else if(shared.speedX < 0){
       image(redGhostArray[0],shared.red_px,shared.red_py,ghostSize,ghostSize);
    }

    else if(shared.speedX > 0){
        image(redGhostArray[2],shared.red_px,shared.red_py,ghostSize,ghostSize);
    }

    else{
        //up
        if(shared.red_dir == 1){
           image(redGhostArray[3],shared.red_px,shared.red_py,ghostSize,ghostSize);
        }
        //down
        else if(shared.red_dir == 2){
           image(redGhostArray[4],shared.red_px,shared.red_py,ghostSize,ghostSize);
        }
        //left
        else if(shared.red_dir == 3){
           image(redGhostArray[1],shared.red_px,shared.red_py,ghostSize,ghostSize);
        }
        //right
        else if(shared.red_dir == 4){
           image(redGhostArray[2],shared.red_px,shared.red_py,ghostSize,ghostSize);
        }
        else if (shared.red_dir == 0){
            image(redGhostArray[0],shared.red_px,shared.red_py,ghostSize,ghostSize);
        }
    }
}

function redGhostControls(){
    shared.red_px += shared.red_vx;
    shared.red_py += shared.red_vy;
    shared.red_vx = 0;
    shared.red_vy = 0;
    //have to speed instead of speedX & speedY

    if(my.selectedTeam == "Red Ghost"){
        //w - up
        if(keyIsDown(UP_ARROW) || keyIsDown(87)){
            shared.red_vx = 0;
            shared.red_vy = -shared.vel * shared.speed;
            shared.red_dir = 1;
        }
        //s - down
        else if(keyIsDown(DOWN_ARROW) || keyIsDown(83)){
            shared.red_vx = 0;
            shared.red_vy = shared.vel * shared.speed;
            shared.red_dir = 2;
        }
        //a - left
        else if(keyIsDown(LEFT_ARROW) || keyIsDown(65)){
            shared.red_vx = -shared.vel * shared.speed;
            shared.red_vy = 0;
            shared.red_dir = 3;
        }
        //d - right
        else if(keyIsDown(RIGHT_ARROW) || keyIsDown(68)){
            shared.red_vx = shared.vel * shared.speed;
            shared.red_vy = 0;
            shared.red_dir = 4;
        }
        //set ghost back to static if the player isn't moving
        else{
            shared.red_vx = 0;
            shared.red_vy = 0;
            shared.red_dir = 0;
        }
    }
}

//Blue Ghost
function drawBlueGhost(){
    if(shared.speedY < 0){
      image(blueGhostArray[0],shared.blue_px,shared.blue_py,ghostSize,ghostSize);
    }

    else if(shared.speedY > 0){
       image(blueGhostArray[2],shared.blue_px,shared.blue_py,ghostSize,ghostSize);
    }

    else if(shared.speedX < 0){
       image(blueGhostArray[0],shared.blue_px,shared.blue_py,ghostSize,ghostSize);
    }

    else if(shared.speedX > 0){
        image(blueGhostArray[2],shared.blue_px,shared.blue_py,ghostSize,ghostSize);
    }

    else{
        //up
        if(shared.blue_dir == 1){
           image(blueGhostArray[3],shared.blue_px,shared.blue_py,ghostSize,ghostSize);
        }
        //down
        else if(shared.blue_dir == 2){
           image(blueGhostArray[4],shared.blue_px,shared.blue_py,ghostSize,ghostSize);
        }
        //left
        else if(shared.blue_dir == 3){
           image(blueGhostArray[1],shared.blue_px,shared.blue_py,ghostSize,ghostSize);
        }
        //right
        else if(shared.blue_dir == 4){
           image(blueGhostArray[2],shared.blue_px,shared.blue_py,ghostSize,ghostSize);
        }
        else{
            image(blueGhostArray[0],shared.blue_px,shared.blue_py,ghostSize,ghostSize);
        }
    }
}

function blueGhostControls(){
    shared.blue_px += shared.blue_vx;
    shared.blue_py += shared.blue_vy;
    shared.blue_vx = 0;
    shared.blue_vy = 0;
    //have to speed instead of speedX & speedY

    if(my.selectedTeam == "Blue Ghost"){
        //w
        if(keyIsDown(UP_ARROW) || keyIsDown(87)){
            shared.blue_vx = 0;
            shared.blue_vy = -shared.vel * shared.speed;
            shared.blue_dir = 1;
        }
        //s
        else if(keyIsDown(DOWN_ARROW) || keyIsDown(83)){
            shared.blue_vx = 0;
            shared.blue_vy = shared.vel * shared.speed;
            shared.blue_dir = 2;
        }
        //a
        else if(keyIsDown(LEFT_ARROW) || keyIsDown(65)){
            shared.blue_vx = -shared.vel * shared.speed;
            shared.blue_vy = 0;
            shared.blue_dir = 3;
        }
        //d
        else if(keyIsDown(RIGHT_ARROW) || keyIsDown(68)){
            shared.blue_vx = shared.vel * shared.speed;
            shared.blue_vy = 0;
            shared.blue_dir = 4;
        }

          //set ghost back to static if the player isn't moving
          else{
            shared.blue_vx = 0;
            shared.blue_vy = 0;
            shared.blue_dir = 0;
        }
    }
}

//Green Ghost
function drawGreenGhost(){
    if(shared.speedY < 0){
      image(greenGhostArray[0],shared.green_px,shared.green_py,ghostSize,ghostSize);
    }

    else if(shared.speedY > 0){
       image(greenGhostArray[0],shared.green_px,shared.green_py,ghostSize,ghostSize);
    }

    else if(shared.speedX < 0){
       image(greenGhostArray[0],shared.green_px,shared.green_py,ghostSize,ghostSize);
    }

    else if(shared.speedX > 0){
        image(greenGhostArray[0],shared.green_px,shared.green_py,ghostSize,ghostSize);
    }

    else{
        //up
        if(shared.green_dir == 1){
           image(greenGhostArray[3],shared.green_px,shared.green_py,ghostSize,ghostSize);
        }
        //down
        else if(shared.green_dir == 2){
           image(greenGhostArray[4],shared.green_px,shared.green_py,ghostSize,ghostSize);
        }
        //left
        else if(shared.green_dir == 3){
           image(greenGhostArray[1],shared.green_px,shared.green_py,ghostSize,ghostSize);
        }
        //right
        else if(shared.green_dir == 4){
           image(greenGhostArray[2],shared.green_px,shared.green_py,ghostSize,ghostSize);
        }
        else{
            image(greenGhostArray[0],shared.green_px,shared.green_py,ghostSize,ghostSize);
        }
    }
}

function greenGhostControls(){
    shared.green_px += shared.green_vx;
    shared.green_py += shared.green_vy;
    shared.green_vx = 0;
    shared.green_vy = 0;
    //have to speed instead of speedX & speedY

    if(my.selectedTeam == "Green Ghost"){
        //w
        if(keyIsDown(UP_ARROW) || keyIsDown(87)){
            shared.green_vx = 0;
            shared.green_vy = -shared.vel * shared.speed;
            shared.green_dir = 1;
        }
        //s
        else if(keyIsDown(DOWN_ARROW) || keyIsDown(83)){
            shared.green_vx = 0;
            shared.green_vy = shared.vel * shared.speed;
            shared.green_dir = 2;
        }
        //a
        else if(keyIsDown(LEFT_ARROW) || keyIsDown(65)){
            shared.green_vx = -shared.vel * shared.speed;
            shared.green_vy = 0;
            shared.green_dir = 3;
        }
        //d
        else if(keyIsDown(RIGHT_ARROW) || keyIsDown(68)){
            shared.green_vx = shared.vel * shared.speed;
            shared.green_vy = 0;
            shared.green_dir = 4;
        }

          //set ghost back to static if the player isn't moving
        else{
            shared.green_vx = 0;
            shared.green_vy = 0;
            shared.green_dir = 0;
        }
    }
}

//Purple Ghost
function drawPurpleGhost(){
    if(shared.speedY < 0){
      image(purpleGhostArray[0],shared.purple_px,shared.purple_py,ghostSize,ghostSize);
    }

    else if(shared.speedY > 0){
       image(purpleGhostArray[2],shared.purple_px,shared.purple_py,ghostSize,ghostSize);
    }

    else if(shared.speedX < 0){
       image(purpleGhostArray[0],shared.purple_px,shared.purple_py,ghostSize,ghostSize);
    }

    else if(shared.speedX > 0){
        image(purpleGhostArray[2],shared.purple_px,shared.purple_py,ghostSize,ghostSize);
    }

    else{
        //up
        if(shared.purple_dir == 1){
           image(purpleGhostArray[3],shared.purple_px,shared.purple_py,ghostSize,ghostSize);
        }
        //down
        else if(shared.purple_dir == 2){
           image(purpleGhostArray[4],shared.purple_px,shared.purple_py,ghostSize,ghostSize);
        }
        //left
        else if(shared.purple_dir == 3){
           image(purpleGhostArray[1],shared.purple_px,shared.purple_py,ghostSize,ghostSize);
        }
        //right
        else if(shared.purple_dir == 4){
           image(purpleGhostArray[2],shared.purple_px,shared.purple_py,ghostSize,ghostSize);
        }
        else{
            image(purpleGhostArray[0],shared.purple_px,shared.purple_py,ghostSize,ghostSize);
        }
    }
}

function purpleGhostControls(){
    shared.purple_px += shared.purple_vx;
    shared.purple_py += shared.purple_vy;
    shared.purple_vx = 0;
    shared.purple_vy = 0;
    //have to speed instead of speedX & speedY

    if(my.selectedTeam == "Purple Ghost"){
        //w
        if(keyIsDown(UP_ARROW) || keyIsDown(87)){
            shared.purple_vx = 0;
            shared.purple_vy = -shared.vel * shared.speed;
            shared.purple_dir = 1;
        }
        //s
        else if(keyIsDown(DOWN_ARROW) || keyIsDown(83)){
            shared.purple_vx = 0;
            shared.purple_vy = shared.vel * shared.speed;
            shared.purple_dir = 2;
        }
        //a
        else if(keyIsDown(LEFT_ARROW) || keyIsDown(65)){
            shared.purple_vx = -shared.vel * shared.speed;
            shared.purple_vy = 0;
            shared.purple_dir = 3;
        }
        //d
        else if(keyIsDown(RIGHT_ARROW) || keyIsDown(68)){
            shared.purple_vx = shared.vel * shared.speed;
            shared.purple_vy = 0;
            shared.purple_dir = 4;
        }

        //set ghost back to static if the player isn't moving
        else{
            shared.purple_vx = 0;
            shared.purple_vy = 0;
            shared.purple_dir = 0;
        }
    }
}


function detectWall(){
    /*make an array of the walls for collision detection and the eggs 
    First check if packman is going up-down or left-right
    If up down check if Dist < h/2
    */
    //console.log(dist(shared.px,shared.py,createWalls[0][0],createWalls[0][1]));
    for(let i = 0; i < createWalls.length; i++){
        //top wall
        if(shared.py < createWalls[0][i] || shared.py > height - createWalls[0][i]){
            if(shared.px > createWalls[i][0] && shared.px < createWalls[i][0] + width){
                shared.px = -shared.px;
                shared.py = -shared.py;

                hightlight = true;
                return true;
            }
        }
        hightlight = false;
        return false;
    //     if(shared.dir == 1 || shared.dir == 2){
    //         if(dist(shared.px,shared.py,createWalls[i][0],createWalls[i][1]) <= createWalls[i][2]/2){
    //             //vertical collision - make velocity 0
    //             shared.vel = -shared.vel * shared.speed;
    //         }
    //         //console.log(shared.vel);
    //     }
    //    //same for width
    //    if(shared.dir == 3 || shared.dir == 4){
    //     if(dist(shared.px,shared.py,createWalls[i][0],createWalls[i][3]) <= createWalls[i][4]/2){
    //         //horizontal collision - make velocity 0
    //         shared.vel = -shared.vel * shared.speed;
    //     }
    //    } 
    }

    if(hightlight){
      fill(255,0,0);
      console.log("Hit wall");
    }
}

function chaosMode(){

}