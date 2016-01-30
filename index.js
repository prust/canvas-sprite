var width = window.innerWidth || document.body.clientWidth;
var height = window.innerHeight || document.body.clientHeight;

var canvas = document.getElementById('canvas');
canvas.width = width;
canvas.height = height;
canvas.style.width = width + 'px';
canvas.style.height = height + 'px';

window.show_points = true;
window.control_point = false;

var ctx = canvas.getContext("2d");
var sprite, sprites = [];
function createSprite() {
  sprite = new Sprite(ctx);
  sprites.push(sprite);
}
createSprite();

document.body.addEventListener('click', function(evt) {
  if (control_point)
    sprite.addControlPoint({x: evt.clientX, y: evt.clientY});
  else
    sprite.addPoint({x: evt.clientX, y: evt.clientY});
});

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
