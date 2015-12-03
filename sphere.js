var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");

function rotateZ(v, r) {
    var x = v[0];
    var y= v[1];
    var z = v[2];
    var rx = x*Math.cos(r) - y*Math.sin(r);
    var ry = x*Math.sin(r) + y*Math.cos(r);
    return [rx, ry, z];
}

function rotateY(v, r) {
    var x = v[0];
    var y = v[1];
    var z = v[2];
    var rx = x*Math.cos(r) + z*Math.sin(r);
    var rz = x * -Math.sin(r) + z*Math.cos(r);
    return [rx, y, z];
}

function drawSpheres(now) {
    ctx.fillStyle = "#CCCCCC";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#424242";

    var npoints = 50;
    var radius = 100;

    var pspeed = now / 100;
    var n = Math.abs(Math.cos(pspeed/2)*2) * npoints;
    var t = Math.min(now / 10000, 1);
    var r = t*t*t * radius;

    var s = (Math.PI*2)/n;
    var cx = canvas.width/2;
    var cy = canvas.height/2;
    for (var a = 0; a < n; a++) {
        for (var b = 0; b < n; b++) {
            var ar = a * s;
            var br = b * s;
            var x = r * Math.sin(ar)*Math.cos(br);
            var y = r * Math.sin(ar)*Math.sin(br);
            var z = r * Math.cos(ar);

            var speed = now/10000;
            var rv = rotateZ([x, y, z], speed);
            rv = rotateY([x,y,z], speed);

            var colorSpeed = speed;

            ctx.fillRect(cx + rv[0], cy + rv[1], 1, 1);
        }
    }
}

function startAnimation() {
  var started = Date.now();
  function drawFrame() {
      var now = Date.now();
      lastDraw = now;

      drawSpheres(now-started);

      requestAnimationFrame(drawFrame);
  }
  drawFrame();
}

setTimeout(startAnimation, 2000);
