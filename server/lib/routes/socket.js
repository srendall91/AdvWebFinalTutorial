var cv= require ('opencv');

//Camera options

var camW = 640;
var camH = 480;
var camFps = 5;
var camInterval = 1000/camFps;
//var EYES_CASCADE = './node_modules/opencv/data/haarcascade_eye_tree_eyeglasses.xml';
var EYES_CASCADE = './node_modules/opencv/data/haarcascade_eye.xml';
var NOSE_CASCADE = './node_modules/opencv/data/haarcascade_mcs_nose.xml';
var facesReturn = [];

//initcam

var camera = new cv.VideoCapture(0);
camera.setWidth(camW);
camera.setHeight(camH);

module.exports = function(socket){
	setInterval(function(){
		camera.read(function(err, im){
			if (err) throw err;


			//socket.emit('frame', { buffer: im.toBuffer()});
			im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
				facesReturn =[]
		    for (i=0;i<faces.length; i++){
					var facereturn = {};
		      var x = faces[i];
					facereturn.face = x

					var face = im.roi(x.x,x.y,x.width,x.height);

					face.detectObject(EYES_CASCADE, {}, function(err, eyes){
						facereturn.eyes = eyes;
				     for (i=0;i<eyes.length; i++){
				       eye = eyes[i];
						   face.ellipse(eye.x + eye.width/2, eye.y + eye.height/2, eye.width/2, eye.height/2);
						 };
					 });

					face.detectObject(NOSE_CASCADE, {}, function(err, noses){
						facereturn.nose = noses[0];
				    // for (i=0;i<noses.length; i++){
				    //   nose =noses[i];
						// 	console.log('nose', nose);
						// 	face.ellipse(nose.x + nose.width/2, nose.y + nose.height/2, nose.width/2, nose.height/2,[0,255,0]);
						// };
					});
					// socket.emit('face', {buffer: face.toBuffer()});
					// socket.emit('face_detect',x);
					facesReturn[i] = facereturn
				};

				//socket.emit('face_data', facesReturn);
				//console.log(facesReturn)

			});
			socket.emit('frame', { buffer: im.toBuffer(), faces: facesReturn});
		});
	}, camInterval);

};
