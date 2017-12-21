class Circle {

  constructor(x, y, r, firstOrLast, lastlast, c) {
    this.x = x;
    this.y = y;
    this.radius = r;
    this.firstOrLast = firstOrLast;
    this.registered = false;
    this.lastlast = lastlast;
    this.color = c;

  }
  display() {
    noStroke();
    fill(this.color);
    ellipse(this.x, this.y, this.radius, this.radius);
  }

  move() {

    this.x = this.x - 1;
    alpha--;
  }

  collision(x2, y2) {
    var d = dist(this.x, this.y, x2, y2);

    if (d < this.radius) {
      console.log("COLLISION");
      //if collision clear circle;
      this.x = -40;
      score = score + 1;
    }
    let xd = dist(this.x, 0, x2, 0);
    if(this.firstOrLast && !this.registered && xd < this.radius*3){
      console.log("passing special bubble");
      levelMarks.push(visualize.length);
      this.registered = true;

      if(this.lastlast) {
        console.log("last bubble start timer");
        setTimeout(function(){
          mode = 1
        }, 5000);

      }
    }
  }
}

class Text {

  constructor(text, x, y, r, c) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = c;
  }
  display() {
    fill(this.color);
    text(this.text, this.x, this.y);
  }

  move() {
    this.x = this.x - 1;
  }

  collision(x2, y2) {
    // placeholder function that will be called, becasue this O=Object
    // will be created into the same array as the bubbles
    // if we didnt have this fake collision function, it would throw an error.
  }
}
