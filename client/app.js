var socket = io.connect("http://localhost:8080");

var canvas = document.getElementById('canvas-video');
var context = canvas.getContext('2d');
var facecanvas = document.getElementById('canvas-face');
var facecontext = facecanvas.getContext('2d');
var facedata = document.getElementById('data');
var img = new Image();
var glasses = new Image();
glasses.src = 'glasses.png';
var face = new Object();

socket.on('face_detect', function(data){
  //console.log(data);
  face= data;
  //context.drawImage(glasses, face.x, face.y, face.height, face.width);
});

// socket.on('face_data', function(data){
//   facedata.innerHTML= data;
//   console.log(data)
// });

socket.on('frame', function(data) {
  var uint8Arr = new Uint8Array(data.buffer);
  var str = String.fromCharCode.apply(null, uint8Arr);
  var base64String = btoa(str);
  img.onload = function(){
    context.drawImage(this, 0, 0, canvas.width, canvas.height);
    context.drawImage(glasses, face.x, face.y, face.height, face.width);
    facedata.innerHTML= 'number of faces found = ' + data.faces.length;
    console.log(data.faces)
  };
  img.src = 'data:image/png;base64,' +base64String;
});
socket.on('face', function(data) {
  var uint8Arr = new Uint8Array(data.buffer);
  var str = String.fromCharCode.apply(null, uint8Arr);
  var base64String = btoa(str);
  img.onload = function(){
    facecontext.drawImage(this, 0, 0, 200, 200);
  };
  img.src = 'data:image/png;base64,' +base64String;
});
