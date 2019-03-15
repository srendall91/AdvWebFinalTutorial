var socket = io.connect("http://localhost:8080");

var canvas = document.getElementById('canvas-video');
var context = canvas.getContext('2d');
var facecanvas = document.getElementById('canvas-face');
var facecontext = facecanvas.getContext('2d');
var facedata = document.getElementById('data');
var eyesdata = document.getElementById('data2');
var img = new Image();
var glassesArray = [
  {src:'glassesRed.png', centre:{x:250, y:140}, separation:200},
  {src:'glassesTransparentRed.png', centre:{x:250, y:140}, separation:200},
  {src:'glassesTransparentGreen.png', centre:{x:250, y:140}, separation:200},
  {src:'glassesTransparentBlue.png', centre:{x:250, y:140}, separation:200},
  {src:'glassesTransparentBlack.png', centre:{x:250, y:140}, separation:200},
  {src:'3DGlasses.png', centre:{x:364, y:100}, separation:360},
  {src:'LegoBatman.png', centre:{x:168, y:287}, separation:142},
  {src:'none'}
]
var moustacheArray = [
  {src:'moustache.png', centre:{x:248, y:53}},
  {src:'none'}
]
var glasses = new Image();
setGlasses(0);

var moustache = new Image();
setMoustache(0);

var face = new Object();

function setGlasses(item){
  // function called by radio buttons in HTML
  value = glassesArray[item];
  glasses.src = 'images/'+ value.src;
  glasses.props = {centre:value.centre,  separation:value.separation};
  console.log(glasses.src)
}

function setMoustache(item){
  // function called by radio buttons in HTML
  value = moustacheArray[item];
  moustache.src = 'images/'+ value.src;
  moustache.props = {centre:value.centre};
  console.log(moustache.src)
}

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
          separation:((eye2.x-eye1.x)), // adequate for small angles
          angle:((eye2.y-eye1.y)/(eye2.x-eye1.x)), // true for very small angles (in radians)
        };
    };
  };

  eyes = eyesParams(face.eyes);
  scale = eyes.separation/glasses.props.separation;

  context.save(); // store default canvas mapping
  context.translate(face.face.x+eyes.centre.x, face.face.y+eyes.centre.y)
  context.scale(scale,scale)
  context.rotate(eyes.angle)

  context.drawImage(glasses, -glasses.props.centre.x, -glasses.props.centre.y,
     glasses.width, glasses.height)

  context.restore(); // restore default canvas mapping

};

socket.on('frame', function(data) {
  var uint8Arr = new Uint8Array(data.buffer);
  var str = String.fromCharCode.apply(null, uint8Arr);
  var base64String = btoa(str);
  //console.log(data.faces)
  img.onload = function(){
    context.drawImage(this, 0, 0, canvas.width, canvas.height);

    if (data.faces.length == 1) {
      if ((data.faces[0].eyes.length == 2)&&(glasses.src != 'images/none')){
        drawGlasses(data.faces[0], glasses);
      };
    };
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
