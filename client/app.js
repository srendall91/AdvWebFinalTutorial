var socket = io.connect("http://localhost:8080");

var canvas = document.getElementById('canvas-video');
var context = canvas.getContext('2d');
var facecanvas = document.getElementById('canvas-face');
var facecontext = facecanvas.getContext('2d');
var facedata = document.getElementById('data');
var eyesdata = document.getElementById('data2');
var img = new Image();
var glassesArray = [
  // array holding all available glasses images
  // additional parameters:
  //  centre - where midpoint between eyes is located on the glasses (can be asymmetric)
  //  separation - distance between eye centres
  // it is assumed eyes will be level in glasses image
  {src:'glassesRed.png', centre:{x:250, y:140}, separation:200},
  {src:'glassesTransparentGreen.png', centre:{x:250, y:140}, separation:200},
  {src:'glassesTransparentBlue.png', centre:{x:250, y:140}, separation:200},
  {src:'glassesTransparentBlack.png', centre:{x:250, y:140}, separation:200},
  {src:'3DGlasses.png', centre:{x:364, y:100}, separation:360},
  {src:'LegoBatman.png', centre:{x:168, y:287}, separation:142},
  {src:'none'}
]
var moustacheArray = [
  // array holding all available moustache images
  // additional parameters:
  //  centre - where location of midpoint of upper lip
  //  separation - reference for scaling -how far apart eyes would be on the image when placed on face
  {src:'moustache.png', centre:{x:248, y:40}, separation:250},
  {src:'brown.png', centre:{x:255, y:200}, separation:245},
  {src:'magnum.png', centre:{x:110, y:34}, separation:200},
  {src:'jacksparrow.png', centre:{x:108, y:24}, separation:125},
  {src:'banana.png', centre:{x:138, y:20}, separation:200},
  {src:'none'}
]
var glasses = new Image();
setGlasses(0); // set the default selected glasses

var moustache = new Image();
setMoustache(5); //set deault selected moustache to none

var persistentFace = new Object();//

function setGlasses(item){
  // function called by radio buttons in index.html
  value = glassesArray[item];
  glasses.src = 'images/'+ value.src;
  glasses.props = {centre:value.centre,  separation:value.separation};
  console.log(glasses.src)
}

function setMoustache(item){
  // function called by radio buttons in index.html
  value = moustacheArray[item];
  moustache.src = 'images/'+ value.src;
  moustache.props = {centre:value.centre, separation:value.separation};
  console.log(moustache.src)
}
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

function processFace(face, storedFace){
  storedFace.face = face.face

  if (face.eyes != undefined){
    if (face.eyes.length == 2){
      storedFace.eyes = eyesParams(face.eyes)
    } else {
      if (storedFace.eyes == undefined){
        //guess eye locations from size of face bounding box
        // unless previously found
        storedFace.eyes = {
          centre:{
            x:face.face.width/2,
            y:face.face.height/3
          },
          separation:face.face.width/2,
          angle:0}
      }
    }
  }

  if (face.nose != undefined){
    storedFace.nose = face.nose
  } else {
    if (storedFace.nose == undefined){
      // guess nose bounding box , unless previously found
      storedFace.nose = {
          x:face.face.width/3,
          y:face.face.height/3,
          height:face.face.height/3,
          width:face.face.width/3
      }
    }
  }
};

function drawGlasses(face, glasses){

  scale = face.eyes.separation/glasses.props.separation;

  context.save(); // store default canvas mapping
  // make canvas origin(0,0) between eyes
  // rotate to angle of eyes
  // scale so glasses fit
  // and draw with centres matching
  context.translate(face.face.x+face.eyes.centre.x, face.face.y+face.eyes.centre.y)
  context.scale(scale,scale)
  context.rotate(face.eyes.angle)

  context.drawImage(glasses, -glasses.props.centre.x, -glasses.props.centre.y,
     glasses.width, glasses.height)

  context.restore(); // restore default canvas mapping
}

function drawMoustache(face, moustache){

  scale = face.eyes.separation/moustache.props.separation;

  if (face.nose != undefined){

    context.save(); // store default canvas mapping
    // make canvas origin(0,0) bottom/middle of nose bounding box
    // rotate to angle of eyes
    // scale moustache relative to eye centres
    // and draw on canvas with centres matching
    context.translate(face.face.x+face.nose.x+face.nose.width/2,
       face.face.y+face.nose.y+face.nose.height)
    context.scale(scale,scale)
    context.rotate(face.eyes.angle)

    context.drawImage(moustache, -moustache.props.centre.x, -moustache.props.centre.y,
       moustache.width, moustache.height)

    context.restore(); // restore default canvas mapping
  }
};

socket.on('frame', function(data) {
  var uint8Arr = new Uint8Array(data.buffer);
  var str = String.fromCharCode.apply(null, uint8Arr);
  var base64String = btoa(str);
  //console.log(data.faces)
  img.onload = function(){
    context.drawImage(this, 0, 0, canvas.width, canvas.height);

    if (data.faces !== undefined) {
      //console.log('faces array',data.faces)

      // calculate angle of and midpoint between eyes
      // retaining previous data if eyes, nose not detected
      processFace(data.faces[data.faces.length-1], persistentFace);

      if (glasses.src.slice(-4) != 'none') drawGlasses(persistentFace, glasses);
      if (moustache.src.slice(-4) != 'none') drawMoustache(persistentFace, moustache);

    };
  };
  img.src = 'data:image/png;base64,' +base64String;
});

socket.on('face', function(data) {
  // close up of found face
  var uint8Arr = new Uint8Array(data.buffer);
  var str = String.fromCharCode.apply(null, uint8Arr);
  var base64String = btoa(str);
  img.onload = function(){
    facecontext.drawImage(this, 0, 0, 200, 200);
  };
  img.src = 'data:image/png;base64,' +base64String;
});
