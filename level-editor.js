var width = window.innerWidth || document.body.clientWidth;
var height = window.innerHeight || document.body.clientHeight;

var sidebar_width = 200;
width -= sidebar_width;

var canvas = document.getElementById('canvas');
canvas.width = width;
canvas.height = height;
canvas.style.width = width + 'px';
canvas.style.height = height + 'px';

window.anim_duration = 2 * 1000;
window.is_animating = false;
window.animate_start = null;
window.dragging_sprite = null;
window.dragging_offset = null;

var ctx = canvas.getContext("2d");
var sprite, sprite_instances = [];

document.body.addEventListener('mousedown', function(evt) {
  onPointerDown(evt);
});

document.body.addEventListener('touchstart', function(evt) {
  onPointerDown(evt);
});

function onPointerDown(evt) {
  last_touch_evt = evt;
  var pt = event2Point(evt);
  if (pt.x < 0)
    return;

  dragging_sprite = _.find(sprite_instances, function(sprite) {
    return sprite.intersect(pt);
  });
  if (!dragging_sprite && sprite) {
    dragging_sprite = new SpriteInstance(pt, sprite);
    sprite_instances.push(dragging_sprite);
  }
  if (dragging_sprite)
    dragging_offset = {x: dragging_sprite.x - pt.x, y: dragging_sprite.y - pt.y};
}

document.body.addEventListener('mousemove', function(evt) {
  onPointerMove(evt);
});

document.body.addEventListener('touchmove', function(evt) {
  onPointerMove(evt);
});

function onPointerMove(evt) {
  last_touch_evt = evt;
  var pt = event2Point(evt);
  if (pt.x < 0)
    return;

  if (!dragging_sprite)
    return;

  // disables annoying page scrolling on iOS
  event.preventDefault();

  dragging_sprite.x = pt.x + dragging_offset.x;
  dragging_sprite.y = pt.y + dragging_offset.y;
}

document.body.addEventListener('mouseup', function(evt) {
  onPointerUp(evt);
});

document.body.addEventListener('touchend', function(evt) {
  onPointerUp(evt);
});

function onPointerUp(evt) {
  if (!sprite)
    return;

  var pt = event2Point(evt);
  if (pt.x < 0)
    return;

  if (dragging_sprite)
    dragging_sprite = null;
}

var sprites_ul = document.getElementById('sprites-list');
sprites_ul.addEventListener('click', function(evt) {
  if (evt.target.tagName != 'A')
    return;

  var id = evt.target.getAttribute('data-id');
  var json = localStorage.getItem('sprite-' + id);
  var sprite_data = JSON.parse(json);
  sprite = new Sprite(ctx, sprite_data);
  
  updateSpriteList();
});

function getSpriteInfo() {
  var sprite_info = [];
  var num_sprites = localStorage.length;
  for (var i = 0; i < num_sprites; i++) {
    var key = localStorage.key(i);
    if (!key.startsWith('sprite-'))
      continue;

    var value = localStorage.getItem(key);
    try {
      var data = JSON.parse(value);
      sprite_info.push({
        name: data.name,
        id: data.id
      });
    }
    catch(err) { }
  }
  return sprite_info;
}

function updateSpriteList() {
  var sprite_info = getSpriteInfo();

  sprites_ul.innerHTML = sprite_info.map(function(sprite_info, ix) {
    var sel = (sprite && sprite.id == sprite_info.id) ? ' class="selected"' : '';
    return '<li' + sel + '><a href=# data-id="' + sprite_info.id + '">&nbsp;' + sprite_info.name + '</li>';
  }).join('\n');
}

var save_btn = document.getElementById('save');
var title_input = document.getElementById('title');
save.addEventListener('click', function() {
  var title = title_input.value;
  localStorage.setItem(title, JSON.stringify(sprite_instances));
});

updateSpriteList();

requestAnimationFrame(animate);
animate();

function animate() {
  var pct = 1
  if (is_animating) {
    pct = (Date.now() % anim_duration) * 2 / anim_duration;
    if (pct > 1)
      pct = 1 - (pct - 1); // step backwards for 2nd half
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  sprite_instances.forEach(function(sprite) {
    sprite.draw();
  });

  requestAnimationFrame(animate);
}

