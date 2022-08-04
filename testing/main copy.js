const readFile = (e) => {
	const file = e.target.files[0];
	let reader = new FileReader();

	reader.onload = function (e) {
		arrayBuffer = new Uint8Array(reader.result);
		console.log(
			arrayBuffer.length / rate,
			rect.width / secondWidth,
			rate / secondWidth
		);
		musicResolution = Math.floor(rate / secondWidth);
		drawLine();
	};

	reader.readAsArrayBuffer(file);
};
var arrayBuffer = [];
var rate = 44100;
var secondWidth = 50;
var musicResolution = 0;

function setScale(w) {
	secondWidth = w;
	musicResolution = Math.floor(rate / secondWidth);
	drawLine();
}

document.querySelector("#fileItem").onchange = readFile;

var canv = document.getElementById("track");
var ctx = canv.getContext("2d");
var rect = canv.getBoundingClientRect();
var height = rect.height;
var width = rect.width;
var middle = height / 2;
var margin = 0.8;
var res = 1; //every 1px
function drawLine() {
	ctx.clearRect(0, 0, width, height);
	ctx.beginPath();
	ctx.moveTo(0, middle);
	for (let i = 0; i < width / res; i++) {
		if (arrayBuffer == []) {
			ctx.lineTo(i, middle + middle * (Math.random() * 2 - 1) * margin);
		} else if (arrayBuffer != []) {
			ctx.lineTo(
				i,
				middle + middle * (arrayBuffer[i * musicResolution] / 255) * margin
			);
		}
	}
	ctx.stroke();
}
canv.width = rect.width;
canv.height = rect.height;
drawLine();

window.onresize = () => {
	rect = canv.getBoundingClientRect();
	ctx.canvas.width = rect.width;
	ctx.canvas.height = rect.height;
	drawLine();
};
