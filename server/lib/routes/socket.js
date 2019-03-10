var cv= require ('opencv');

//Camera options

var camW = 640;
var camH = 480;
var camFps = 5;
var camInterval = 1000/camFps;

//initcam

var camera = new cv.VideoCapture(0);
camera.setWidth(camW);
camera.setHeight(camH);

module.exports = function(socket){
	setInterval(function(){
		camera.read(function(err, im){
			if (err) throw err;
			socket.emit('frame', { buffer: im.toBuffer()});
		});
	}, camInterval);
};

