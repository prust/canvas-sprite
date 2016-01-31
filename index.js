var width = window.innerWidth || document.body.clientWidth;
var height = window.innerHeight || document.body.clientHeight;

var canvas = document.getElementById('canvas');
canvas.width = width;
canvas.height = height;
canvas.style.width = width + 'px';
canvas.style.height = height + 'px';

window.show_points = true;
window.control_point = false;

// the distance between the mouse & any point
// to make the mouse modify the point
window.UI_SNAP = 5;

var ctx = canvas.getContext("2d");
var sprite, sprites = [];
function createSprite() {
  sprite = new Sprite(ctx);
  sprites.push(sprite);
}
createSprite();

var dragging_pt = null;
document.body.addEventListener('mousedown', function(evt) {
  var pt = event2Point(evt);
  var close_pt = _.find(sprite.points, function(sprite_pt) {
    return distance(sprite_pt, pt) < UI_SNAP;
  });
  if (close_pt)
    dragging_pt = close_pt;
});

document.body.addEventListener('mousemove', function(evt) {
  var pt = event2Point(evt);
  if (!dragging_pt)
    return;

  dragging_pt.x = pt.x;
  dragging_pt.y = pt.y;
});

document.body.addEventListener('mouseup', function(evt) {
  if (dragging_pt) {
    dragging_pt = null;
  }
  else {
    var pt = event2Point(evt);
    if (control_point)
      sprite.addControlPoint(pt);
    else
      sprite.addPoint(pt);
  }
});

function distance(pt1, pt2) {
  return Math.sqrt(square(Math.abs(pt1.x - pt2.x)) + square(Math.abs(pt1.y - pt2.y)));
}

function square(x) {
  return Math.pow(x, 2);
}

// function intersects(max_pt1, min_pt1, max_pt2, min_pt2) {
//   return !(
//     max_pt1.x < min_pt2.x || 
//     max_pt1.y < min_pt2.y || 
//     min_pt1.x > max_pt2.x || 
//     min_pt1.y > max_pt2.y
//   );
// }

function event2Point(evt) {
  return {x: evt.clientX, y: evt.clientY};
}

requestAnimationFrame(animate);
animate();

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  sprites.forEach(function(sprite) {
    sprite.draw();
    if (show_points)
      sprite.points.forEach(drawPoint);
  });
  requestAnimationFrame(animate);
}

function drawPoint(pt) {
  ctx.beginPath();
  var radius = 5;
  ctx.arc(pt.x, pt.y, radius, 0, 2 * Math.PI);
  if (pt.is_control)
    ctx.fillStyle = '#F00';
  else
    ctx.fillStyle = '#000';
  ctx.fill();
  ctx.closePath();
}
