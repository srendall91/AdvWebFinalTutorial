var socket = io.connect("http://localhost:8080");

var canvas = document.getElementById('canvas-video');
var context = canvas.getContext('2d');
var img = new Image();

socket.on('frame', function(data) {
  var uint8Arr = new Uint8Array(data.buffer);
  var str = String.fromCharCode.apply(null, uint8Arr);
  var base64String = btoa(str);
  img.onload = function(){
    context.drawImage(this, 0, 0, canvas.width, canvas.height);
  };
  img.src = 'data:image/png;base64,' +base64String;
});
