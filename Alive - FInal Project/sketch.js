var serial; // variable to hold an instance of the serialport library
var portName = '/dev/cu.usbmodem1421'; // fill in your serial port name here
let dataArray = [];
let maxValues = 200;   // here to change values when running
let max = 0;
let min = 0;
let totalbubbles = 1;
let circles = [];
let data;
let hb = false;

var score = 0;
var bubblesStarted = false;

let heartSize = 100;
let closeInstruction;

let graphCenter;
let graphHeight = 300;
let interval;
let TakeAbreak = false;
let visualize = [];
let gameOff = true;

let levelMarks = [];


function setup() {
  createCanvas(windowWidth, windowHeight);
  serial = new p5.SerialPort(); // make a new instance of the serialport library
  serial.on('data', serialEvent); // callback for when new data arrives
  closeInstruction = createButton("START",500,500);
  closeInstruction.parent("#instruction");
  closeInstruction.class('close-button');
  closeInstruction.mousePressed(closeDiv);
//  closeInstruction.mousePressed(select("#instruction").remove());


  graphCenter = height/4*3;
}

function closeDiv(){
  console.log('ok');
  select("#instruction").remove();
  dataArray = [];
  gameOff = false;
}

let mode = 0;
function draw() {

  background("#283039");
  textAlign(CENTER);
  fill("#FFFFDB");
  noStroke();
  textSize(45);
  textFont("Avenir")
  fill(255,255,255);


  if(bubblesStarted == false) {
  text("Take a moment to appreciate an automated function of your body", width/2,height/7)
  }   //text("Take a moment to appreciate the automated functions of your body", width/2,height/8);
  else if (bubblesStarted && mode == 0) {
    text("Also, know that you are in full control.",width/2,height/7);
    text("Score : " + score , width / 10 * 8, height / 10 * 2);
   }else{
     text("Here is your breathing history:",width/2,height/7);
  }

  if(mode == 0){
    //Only continue if data is present in DataArray
    if (dataArray.length < 1) {
      return;
    }

    // Create Array and calculate x and y for each data point
    var locs = [];
    for (let i = 0; i < dataArray.length; i++) {
      //resolution (datapoints) on x-axis
      var x = i * (width / 2 / maxValues);
      //mapping y value of dataArray between height +- 150
      var y = map(dataArray[i], max, min, graphCenter - graphHeight/2, graphCenter + graphHeight/2);
      //save values in vector that is pushed in locs array
      locs.push(createVector(x, y));
    }

    // Draw them
    for (let i = 0; i < locs.length - 1; i++) {

      stroke("#384048");
      //line is drawn between second last and last point (reason locs.length is -1)
      line(0, graphCenter, width, graphCenter);
      strokeWeight(2);
      stroke("#FFFFDB")
      line(locs[i].x, locs[i].y, locs[i + 1].x, locs[i + 1].y);
      // if (keyIsPressed) {
        // visualize.push(locs[i].y);
      // }
    }

    // Use lastposition to do things
    var lastLoc = locs[locs.length - 1];
    // when line reaches midway, execute following once
    if (lastLoc.x > (width / 2 - 10) && bubblesStarted == false && gameOff == false) {   // here to insert bubbles
    // if (lastLoc.x > 10 && bubblesStarted == false) {   // here to insert bubbles
      //bubblesStarted is changed so that it will only run once, not second time in draw loop
      bubblesStarted = true;
      gameOff = false;
      addBubble();
      interval = setInterval(addBubble, 800);
    }


    if(TakeAbreak){
      clearInterval(interval);

      setTimeout(function(){
        interval = setInterval(addBubble, 1500)
      }, 9000);
      TakeAbreak = false;
    }

    updateBubble(lastLoc.x, lastLoc.y);
    noStroke();
    textSize(24);
    bubblesRemove();
    //draw heartbeat
    //strokeWeight(3);
    //ellipse(width/7,height/4*1,heartSize,heartSize);
    // showHeartBeat();
  }else if(mode==1){
      // Create Array and calculate x and y for each data point
      var locs = [];
      max = d3.max(visualize);
      min = d3.min(visualize);
    // console.log(visualize);

      for (let i = 0; i < visualize.length; i++) {
        //resolution (datapoints) on x-axis
        var x = i * (width / visualize.length);
        //mapping y value of dataArray between height +- 150
        var y = map(visualize[i], max, min, graphCenter - graphHeight/2, graphCenter + graphHeight/2);
        //save values in vector that is pushed in locs array
        locs.push(createVector(x, y));
      }
      let levelName = 1;
      for (let i = 0; i < levelMarks.length; i+=2) {
            var x0 = levelMarks[i] * (width / visualize.length);
            let x1 = width;
            if(i+1 <= levelMarks.length - 1){
              x1 = levelMarks[i+1] * (width / visualize.length);
            }
            var y0 = graphCenter - 40;
            var y1 = graphCenter - 40;
            // stroke(255, 0, 219);
            //line is drawn between second last and last point (reason locs.length is -1)
            // strokeWeight(3);
            fill(255, 40);
            rect(x0, graphCenter - graphHeight/2, x1 - x0, graphHeight);
            fill(255);
            text(levelName, x0, graphCenter - graphHeight/2);
            levelName++;
            // line(x0,y0,x1,y1);
            noFill();
      }

      // Draw them
      for (let i = 0; i < locs.length - 1; i++) {

        stroke(255, 255, 219);
        //line is drawn between second last and last point (reason locs.length is -1)
        line(0, graphCenter, width, graphCenter);
        strokeWeight(3);
        noFill();
        line(locs[i].x, locs[i].y, locs[i + 1].x, locs[i + 1].y);
        // if (keyIsPressed) {
        //   visualize.push(locs[i].y);
        // }
      }
  }
}

let tempArray = [];
let averageLength = 1;
function serialEvent() {
  if(mode == 1){
    return
  }
  var data = serial.readLine(); //taking data from arduino and reading them
  if (data.length > 0) {
    tempArray.push(int(data)); //put full (int) numbers into array
    if (data == "HEARTBEAT") {
      hb = true; //used to display heartbeat
      heartSize = 100;
    } else {
      hb = false;
      heartSize = heartSize - 1;
      if (heartSize < 0 ) {
      heartSize = 0;
}

    }

    //console.log(hb);


    if (tempArray.length > 15) {

      dataArray.push(d3.mean(tempArray));
      visualize.push(d3.mean(tempArray));

      //    console.log(tempArray);
      // this is recalibrating without line loosing its x position (which messes up level fields)
      // let dataArrayForAverages = dataArray.slice(dataArray.length - averageLength, dataArray.length);
      // console.log(dataArray);
      // console.log(dataArrayForAverages);
      // averageLength += 1;
      // max = d3.max(dataArrayForAverages);
      // min = d3.min(dataArrayForAverages);
      max = d3.max(dataArray);
      min = d3.min(dataArray);

      while (dataArray.length > maxValues) { //maxVal max 500 numbers
        dataArray.splice(0, 1);
      }
      tempArray = []; //reset temp array to create space for 10 new numbers
    }

  }

}

function mousePressed() {
  if(gameOff){
      dataArray = [];
  }
  averageLength = 0;

}

//add bubbles to array when breath passes the middle
let theta = 0;
// let levelMarks = [];

// let levelLengths = [30, 60, 90];
let levelLengths = [30, 55, 70];



let specialBubbleCount = 0;
function addBubble() {
  //  console.log(circles);
  if (circles.length < levelLengths[0]) {

    if(circles.length == 0 || circles.length == levelLengths[0]-1){
      console.log("pushng special bubble");
      // levelMarks.push([visualize.length]);
      circles.push(new Circle(width,   graphCenter + sin(theta)  * (graphHeight/4)   , 30, true, null, "#33c7ff"));
    }else{
      circles.push(new Circle(width,   graphCenter + sin(theta)  * (graphHeight/4)   , 30, false, null, "#33c7ff"));
    }
    theta+=0.8;
    // circles.push(new Circle(width, random(graphCenter - graphHeight/2, graphCenter + graphHeight/2), 10, 10));
  } else if(circles.length == levelLengths[0]){

    // levelMarks[levelMarks.length-1].push(visualize.length);
    console.log(levelMarks);

    circles.push(new Text("LEVEL 2", width + 400, graphCenter + sin(theta)  * (graphHeight/4 - 200), 30, "#00C294"))
    TakeAbreak = true;
  }
else if(circles.length < levelLengths[1]){

    if(circles.length == levelLengths[0]+1 || circles.length == levelLengths[1]-1){
      console.log("pushng special bubble");
      // levelMarks.push([visualize.length]);
      circles.push(new Circle(width,   graphCenter - (graphHeight/4), 30, true, false, "#00C294"));
    }else{
      circles.push(new Circle(width,   graphCenter - (graphHeight/4), 30, false, false, "#00C294"));
    }
    // circles.push(new Circle(width, graphCenter - (graphHeight/4), 30))
    // circles.push(new Text(width, graphCenter + (sin(theta) * (graphHeight/4)), 40))
    // theta+=1.2;
    // circles.push(new Text(width, graphCenter + (sin(theta) * (graphHeight/4)), 40))
    //TakeAbreak = true;
  }else if(circles.length == levelLengths[1]){

    circles.push(new Text("LEVEL 3", width + 400, graphCenter + sin(theta) * (graphHeight/4-200), 30, "#FFA142"))
    TakeAbreak = true;
  }else if(circles.length < levelLengths[2]){
    if(circles.length == levelLengths[1]+1){
    console.log("pushng special bubble");
      circles.push(new Circle(width,   graphCenter - random(graphCenter-graphHeight/4,graphCenter+graphHeight/4), 30, true, false, "#FFA142"));
    }else if(circles.length == levelLengths[2]-1){

      console.log("pushng special bubble");
      // levelMarks.push([visualize.length]);
      circles.push(new Circle(width, random(graphCenter-graphHeight/4,graphCenter+graphHeight/4), 30, true, true, "#FFA142"));
    }else{
      circles.push(new Circle(width, random(graphCenter-graphHeight/4,graphCenter+graphHeight/4), 30, false, false, "#FFA142"));
    }
    // circles.push(new Circle(width, graphCenter + random(graphHeight/4), 30));
    // circles.push(new Text(width, graphCenter + (sin(theta) * (graphHeight/4)), 40))
    //theta+=0.8;
    // circles.push(new Text(width, graphCenter + (sin(theta) * (graphHeight/4)), 40))
    // TakeAbreak = true;
  }else if(circles.length == levelLengths[2]){

    circles.push(new Text("GAME OVER", width + 400, graphCenter + sin(theta) * (graphHeight/4-200), 30, "#FFA142"))
    TakeAbreak = true;
  }
//  } else if(circles.length == 91){

   //something here to end reading and sum up using visualize
}


// else if (circles.length > 20 && circles.length < 40) {
//     circles.push(new Circle(width, height / 4*3, 20, 20))
//   } else {
//     circles.push(new Circle(width, height / 4*3 - 150, 15, 15))
//   }


function bubblesRemove() {
  if (circles.length > 100) {
    circles.splice(0, 1);
  //  console.log("Bubble removed");
  }
}

function updateBubble(x2, y2) {
  for (var i = 0; i < circles.length; i++) {
    //  if (circles.length <= 20) {
    circles[i].collision(x2, y2);
    circles[i].move();
    circles[i].display();
  }
}

// function showHeartBeat() {
//   if (hb == true) {
//     heartSize = 100;
//     console.log("beat");
//   } else {
//     heartSize -= 0.25;
//   }
//   fill(255);
// console.log(heartSize);
//   ellipse(width / 2, height / 2, heartSize, heartSize);
//
// }
