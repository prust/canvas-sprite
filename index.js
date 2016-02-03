var width = window.innerWidth || document.body.clientWidth;
var height = window.innerHeight || document.body.clientHeight;

var sidebar_width = 200;
width -= sidebar_width;

var canvas = document.getElementById('canvas');
canvas.width = width;
canvas.height = height;
canvas.style.width = width + 'px';
canvas.style.height = height + 'px';

window.show_points = true;
window.control_point = false;
window.state_name = null;
window.is_animating = false;
window.animate_start = null;

// the distance between the mouse & any point
// to make the mouse modify the point
window.MOUSE_SNAP = 8;
window.TOUCH_SNAP = 20;

var ctx = canvas.getContext("2d");
var sprite, sprites = [];
function createSprite() {
  var border_color = border_input.value;
  var fill_color = fill_input.value;
  sprite = new Sprite(ctx, border_color, fill_color);
  sprites.push(sprite);
}

var dragging_pt = null;
var last_touch_evt;

document.body.addEventListener('mousedown', function(evt) {
  onPointerDown(evt, MOUSE_SNAP);
});

document.body.addEventListener('touchstart', function(evt) {
  onPointerDown(evt, TOUCH_SNAP);
});

function onPointerDown(evt, snap) {
  last_touch_evt = evt;
  var pt = event2Point(evt);
  if (pt.x < 0)
    return;

  var points;
  if (state_name)
    points = sprite.states[state_name].points;
  else
    points = sprite.points;
  var close_pt = _.find(points, function(sprite_pt) {
    return distance(sprite_pt, pt) < snap;
  });
  if (close_pt)
    dragging_pt = close_pt;
}

document.body.addEventListener('mousemove', function(evt) {
  onPointerMove(evt, MOUSE_SNAP);
});

document.body.addEventListener('touchmove', function(evt) {
  onPointerMove(evt, TOUCH_SNAP);
});

function onPointerMove(evt, snap) {
  last_touch_evt = evt;
  var pt = event2Point(evt);
  if (pt.x < 0)
    return;

  if (!dragging_pt)
    return;

  // disables annoying page scrolling on iOS
  event.preventDefault();

  dragging_pt.x = pt.x;
  dragging_pt.y = pt.y;
}

document.body.addEventListener('mouseup', function(evt) {
  onPointerUp(evt, MOUSE_SNAP);
});

document.body.addEventListener('touchend', function(evt) {
  onPointerUp(evt, TOUCH_SNAP);
});

function onPointerUp(evt, snap) {
  var pt = event2Point(evt, last_touch_evt);
  if (pt.x < 0)
    return;

  if (dragging_pt) {
    dragging_pt = null;
  }
  else {  
    if (control_point)
      sprite.addControlPoint(pt);
    else
      sprite.addPoint(pt);
  }
}

var show_pts_btn = document.getElementById('show-points');
show_pts_btn.addEventListener('click', function() {
  show_points = !show_points;
  if (show_points)
    show_pts_btn.innerHTML = 'Hide Points';
  else
    show_pts_btn.innerHTML = 'Show Points';
});

var control_pt_btn = document.getElementById('control-point');
control_pt_btn.addEventListener('click', function() {
  control_point = !control_point;
  if (control_point)
    control_pt_btn.innerHTML = 'Normal Point';
  else
    control_pt_btn.innerHTML = 'Control Point';
});

var create_btn = document.getElementById('create-shape');
create_btn.addEventListener('click', function() {
  createSprite();
});

var border_input = document.getElementById('border-color');
border_input.addEventListener('blur', function() {
  sprite.strokeStyle = border_input.value;
});

var fill_input = document.getElementById('fill-color');
fill_input.addEventListener('blur', function() {
  sprite.fillStyle = fill_input.value;
});

var close_shape_btn = document.getElementById('close-shape');
close_shape_btn.addEventListener('click', function() {
  sprite.close();
});

var add_state_btn = document.getElementById('add-state');
add_state_btn.addEventListener('click', function() {
  var name = prompt('Enter name for new animation state:', '');
  if (name) {
    sprite.addState(name);
    var new_opt = document.createElement('option');
    new_opt.appendChild(document.createTextNode(name));
    state_sel.appendChild(new_opt);
    state_sel.value = name;
    onStateChange();
  }
});

var state_sel = document.getElementById('anim-state');
state_sel.addEventListener('change', onStateChange);

function onStateChange() {
  if (state_sel.value == 'Default')
    state_name = null;
  else
  state_name = state_sel.value;
}

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

function event2Point(evt, last_touch_evt) {
  var x, y;
  if (evt.touches) {
    // the touchend event doesn't send coords, you have to use the last touchmove
    if (!evt.touches.length)
      evt = last_touch_evt;

    var touch = evt.touches[0];
    x = touch.pageX;
    y = touch.pageY;
  }
  else {
    x = evt.clientX;
    y = evt.clientY;
  }

  return {x: x - canvas.offsetLeft, y: y - canvas.offsetTop};
}

createSprite();

requestAnimationFrame(animate);
animate();

function animate() {
  var pct = 1; // todo change this when animating
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  sprites.forEach(function(sprite) {
    sprite.draw(state_name, pct);
    if (show_points) {
      if (state_name)
        sprite.states[state_name].points.forEach(drawPoint);
      else
        sprite.points.forEach(drawPoint);
    }
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
