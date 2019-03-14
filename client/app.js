var socket = io.connect("http://localhost:8080");

var canvas = document.getElementById('canvas-video');
var context = canvas.getContext('2d');
var facecanvas = document.getElementById('canvas-face');
var facecontext = facecanvas.getContext('2d');
var facedata = document.getElementById('data');
var eyesdata = document.getElementById('data2');
var img = new Image();
var glasses = new Image();
glasses.src = 'glasses.png';
glasses.props = {centre:{x:250, y:140}, radius:100};
console.log(glasses.src, glasses.props, glasses.props.centre.x);
var face = new Object();

function drawGlasses(face, glasses){
  function midpoint(feature){
    return {x:(feature.x + feature.width/2), y:(feature.y + feature.height/2)}
  }
  function eyesParams(eyes){
    if (eyes.length != 2) return 'wrong number of eyes';
    else{
      //sort eyes by x value
      eyes.sort((a,b) => (a.x > b.x) ? 1 : ((b.x > a.x) ? -1 : 0));

      //get eye centres
      eye1 = midpoint(eyes[0]);
      eye2 = midpoint(eyes[1]);

      return {
          centre:{
            x:(eye1.x+(eye2.x-eye1.x)/2),
            y:(eye1.y+(eye2.y-eye1.y)),
          },
          radius:((eye2.x-eye1.x)/2), // adequate for small angles
          angle:((eye2.y-eye1.y)/(eye2.x-eye1.x)), // true for very small angles (radians)
        };
    };
  };

  context.save(); // store default canvas mapping

  eyes = eyesParams(face.eyes);
  scale = eyes.radius/glasses.props.radius;

  context.translate(face.face.x+eyes.centre.x, face.face.y+eyes.centre.y)
  context.scale(scale,scale)
  context.rotate(eyes.angle)

  context.drawImage(glasses, -glasses.props.centre.x, -glasses.props.centre.y,
     glasses.width, glasses.height)

  context.restore(); // store default canvas mapping

};

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
    if (data.faces.length == 1) {
      if (data.faces[0].eyes.length == 2){
        drawGlasses(data.faces[0], glasses);
      };
    };
    facedata.innerHTML= 'number of faces found = ' + data.faces.length;
    if (data.faces.length>0){
      eyesdata.innerHTML= 'number of eyes found = ' + data.faces[0].eyes.length;
    }
    //console.log(data.faces)
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
