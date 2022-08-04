const readFile = (e) => {
	//const file = e.target.files[0];
	console.log(e.target.files[0]);
	console.log(e.target.files[0].arrayBuffer());
	var wave = e.target.files[0].arrayBuffer();
	readWave(wave);
	audioPlayer.src = URL.createObjectURL(e.target.files[0]);

	return;
};

function loadFileFromArrayBuffer(buffer) {
	setSrc(URL.createObjectURL(new Blob([buffer])));
	readWave(buffer);
	function setSrc(src) {
		audioPlayer.src = src;
	}
}

function readWave(wave) {
	var audioCtx = new AudioContext();
	if (typeof wave === "object" && typeof wave.then === "function") {
		wave
			.then((arrayBuffer) => {
				return audioCtx.decodeAudioData(arrayBuffer);
			})
			.then((a) => {
				audioBuffer = a;
				rate = audioBuffer.sampleRate;
				distanceBetweenSample = rect.width / (audioBuffer.length / uhhhres);
				secondWidth = Math.floor(rect.width / audioBuffer.duration);
				horizontalScale = secondWidth / normalSecondWidth;
				//drawLine(draw(audioBuffer.getChannelData(0)));
				draw(audioBuffer.getChannelData(0));
			});
	} else {
		audioCtx.decodeAudioData(wave).then((a) => {
			audioBuffer = a;
			rate = audioBuffer.sampleRate;
			distanceBetweenSample = rect.width / (audioBuffer.length / uhhhres);
			secondWidth = Math.floor(rect.width / audioBuffer.duration);
			horizontalScale = secondWidth / normalSecondWidth;
			//drawLine(draw(audioBuffer.getChannelData(0)));
			draw(audioBuffer.getChannelData(0));
		});
	}
}
function draw(data) {
	ctx.clearRect(0, 0, width, height);
	var dat = [];
	var padding = 5;
	rect = canv.getBoundingClientRect();
	var blockSize = Math.floor(
		rate / (normalSecondWidth * horizontalScale * sampleResolution)
	);
	//console.log(distanceBetweenSample);
	//console.log(rate / (normalSecondWidth * horizontalScale * sampleResolution));
	var w = rect.width / samples; //how many pixels on the canvas to offset
	ctx.beginPath();
	ctx.moveTo(0, rect.height / 2);
	ctx.lineWidth = 1;
	ctx.strokeStyle = strokeColor;
	console.log(1 / distanceBetweenSample);
	for (let i = 0; i < audioBuffer.length / uhhhres; i++) {
		var x = distanceBetweenSample * i;
		var offset = Math.floor(rate * secondOffset);
		let h = data[i * uhhhres + offset] * (rect.height / 2);
		var even = (i + 1) % 2;
		/*
		if (h < 0) h = 0;
		else if (h > rect.height / 2) h = h > rect.height / 2;
		h = even ? h : -h;*/
		ctx.lineTo(
			x + distanceBetweenSample,
			(h || 0) * verticalScale + rect.height / 2
		);
		//dat.push({ x: x, h: h, w: w, isEven: (i + 1) % 2 });
	}
	ctx.stroke();
	return dat;
}

function drawLine(data) {
	data.map((e) => {
		drawLineSegment(e.x, e.h, e.w, e.isEven);
	});
}

function drawLineSegment(x, h, w, even) {
	ctx.lineWidth = 0.5;
	ctx.strokeStyle = strokeColor;
	ctx.lineTo(x + w, h);
	ctx.stroke();
}
var audioPlayer = document.getElementById("audio");
var samples = 10000;
var maxSamples = 10000;
var sampleResolution = 10;
var strokeColor = "#000";
var audioBuffer;
var rate = 44100;
var secondWidth = 50; //width of one second in px
var normalSecondWidth = 50;
var musicResolution = 0;
var verticalScale = 1;
var horizontalScale = 1;
var secondOffset = 0;
var distanceBetweenSample = 1;
var uhhhres = 16;
var maxPerPix = 10;

function setScale(w) {
	secondWidth = w;
	musicResolution = Math.floor(rate / secondWidth);
	drawLine();
}

document.querySelector("#fileItem").onchange = readFile;

var canv = document.getElementById("track");
var ctx = canv.getContext("2d");
var rect = canv.getBoundingClientRect();
samples = rect.width * sampleResolution;
maxSamples = rect.width * sampleResolution;
canv.width = rect.width;
canv.height = rect.height;
var height = rect.height;
var width = rect.width;
var middle = height / 2;
var margin = 0.8;
var res = 1; //every 1px
function resize() {
	rect = canv.getBoundingClientRect();
	ctx.canvas.width = rect.width;
	ctx.canvas.height = rect.height;
	samples = rect.width * sampleResolution;
	maxSamples = rect.width * sampleResolution;
	draw(audioBuffer.getChannelData(0));
}

function scrollEv(e) {
	var delta = e.wheelDeltaY / 3000;
	distanceBetweenSample += delta;
	distanceBetweenSample = Math.max(distanceBetweenSample, 0.001);
	resize();
}
var potentialSecondOffset;
function pan(e) {
	if (e.buttons == 4) potentialSecondOffset -= e.movementX / 100;
	potentialSecondOffset = potentialSecondOffset < 0 ? 0 : potentialSecondOffset;
	potentialSecondOffset = audioBuffer
		? potentialSecondOffset > audioBuffer.duration - 1
			? audioBuffer.duration - 1
			: potentialSecondOffset
		: 0;
	if (audioBuffer != null && potentialSecondOffset != secondOffset) resize();
	potentialSecondOffset = secondOffset;
}
window.onresize = resize;
document.onwheel = scrollEv;
document.onmousemove = pan;

function run() {
	// Creating Our XMLHttpRequest object
	var xhr = new XMLHttpRequest();

	// Making our connection
	var url = "KEU.mp3";
	var responseType = "arraybuffer";
	xhr.open("GET", url, true);
	xhr.responseType = responseType;

	// function execute after request is successful
	xhr.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			console.log(this.response);
			loadFileFromArrayBuffer(this.response);
		}
	};
	// Sending our request
	xhr.send();
}
run();

//get the current position of the song from the Audio PLayer
function getCurrentTime() {
	return audioPlayer.currentTime;
}

//gets the current value of the audio buffer at given sample index
function getCurrentVolume(index) {
	if (state != States.PLAYING) return [-100, -100];
	if (audioBuffer == null) return [-100, -100];
	var scanRadius = 512;
	var scanIncrement = 4;
	var volume = [0, 0];
	for (var i = 0; i < audioBuffer.numberOfChannels; ++i) {
		temp = 0;
		var data = audioBuffer.getChannelData(i);
		//console.log(data)

		for (var j = 0; j < scanRadius; j += scanIncrement) {
			var x = Math.abs(data[index + j]);
			if (x > temp) {
				temp = x;
			}
		}

		volume[i] = 20 * Math.log10(temp) + 0.001;
	}
	return volume;
}
var States = {
	PLAYING: "play",
	PAUSED: "pause",
	STOPPED: "stop",
};
var state = States.STOPPED;
var globalVolume = 1;

//when the audio Player starts playing, set the state to playing
function onPlay() {
	state = States.PLAYING;
	playbackClock();
}
function onPause() {
	state = States.PAUSED;
}
audioPlayer.onplay = onPlay;
audioPlayer.onpause = onPause;

var volMeterLeft = document.getElementById("vol-l");
var volMeterRight = document.getElementById("vol-r");

var timeMeter = document.getElementById("timestamp");

//called to begin a requestanimation frame loop if the state is playing, otherwise stop the loop
function playbackClock() {
	//logs the current volume of the audio buffer at the current time
	if (state == States.PLAYING) {
		requestAnimationFrame(playbackClock);
	}
}

const lerp = (a, b, t) => a + (b - a) * t;
var previousVolume = [0, 0];

function uiClock() {
	updateVolumeBars(getCurrentVolume(Math.floor(getCurrentTime() * rate)));
	updateTimestamp();
	updateCursor();
	requestAnimationFrame(uiClock);
}
uiClock();

function updateVolumeBars(vol) {
	//lerp previous volume to current volume to smooth the volume
	vol = [
		lerp(previousVolume[0], vol[0] == "-Infinity" ? -100 : vol[0], 0.1),
		lerp(previousVolume[1], vol[1] == "-Infinity" ? -100 : vol[1], 0.1),
	];
	//set the previous volume to the current volume
	previousVolume = vol;
	volMeterLeft.style.setProperty("--volPercent", 100 + vol[0] + "%");
	volMeterRight.style.setProperty("--volPercent", 100 + vol[1] + "%");
}

function updateTimestamp() {
	var minutes = Math.floor(getCurrentTime() / 60);
	minutes = minutes < 10 ? "0" + minutes : minutes;
	var seconds = Math.floor(getCurrentTime() % 60);
	seconds = seconds < 10 ? "0" + seconds : seconds;
	var milliseconds = Math.floor((getCurrentTime() * 1000) % 1000);
	milliseconds =
		milliseconds < 10
			? "00" + milliseconds
			: milliseconds < 100
			? "0" + milliseconds
			: milliseconds;
	timeMeter.innerHTML = `${minutes}:${seconds}:${milliseconds}`;
}

function updateCursor() {
	var x = getCurrentTime() * rate * (distanceBetweenSample / uhhhres) + "px";
	var cursor = document.getElementById("cursor");
	cursor.style.setProperty("--position", x);
}

function setTime(time) {
	audioPlayer.currentTime = time;
}

function play() {
	audioPlayer.play();
}
//function that toggles between playing and pausing based on the state variable
function togglePlay() {
	if (state == States.PLAYING) {
		audioPlayer.pause();
		state = States.PAUSED;
	} else if (state == States.PAUSED || state == States.STOPPED) {
		audioPlayer.play();
		state = States.PLAYING;
	}
}

function setVolume(vol) {
	globalVolume = vol;
	audioPlayer.volume = vol;
}
setVolume(0.05);

document.onkeydown = keyboardInput;

var keyboardAssignments = {
	" ": togglePlay,
};

function keyboardInput(e) {
	var activeElement = document.activeElement;
	var inputs = ["input", "select", "button", "textarea"];

	if (
		activeElement &&
		inputs.indexOf(activeElement.tagName.toLowerCase()) == -1
	) {
		e.preventDefault();
		e.stopPropagation();
		var input = [];
		var inputString = "";
		if (e.ctrlKey) input.push("CONTROL");
		if (e.altKey) input.push("ALT");
		if (e.shiftKey) input.push("SHIFT");
		if (e.key != "Control" && e.key != "Alt" && e.key != "Shift")
			input.push(e.key.toUpperCase());
		inputString = input.join("+");
		if (keyboardAssignments[inputString]) keyboardAssignments[inputString]();
	}
}

function keyboardInput(e) {
	console.log(e);
	var activeElement = document.activeElement;
	var inputs = ["input", "select", "button", "textarea"];

	if (
		activeElement &&
		inputs.indexOf(activeElement.tagName.toLowerCase()) == -1
	) {
		e.preventDefault();
		e.stopPropagation();
		var input = [];
		var inputString = "";
		if (e.ctrlKey) input.push("CONTROL");
		if (e.altKey) input.push("ALT");
		if (e.shiftKey) input.push("SHIFT");
		if (e.key != "Control" && e.key != "Alt" && e.key != "Shift")
			input.push(e.key.toUpperCase());
		inputString = input.join("+");
		if (keyboardAssignments[inputString]) keyboardAssignments[inputString]();
	}
}

//custom fast fourier transform from audiobuffer
function fft(buffer) {
	var N = buffer.length;
	var real = new Float32Array(N);
	var imag = new Float32Array(N);
	for (var i = 0; i < N; i++) {
		real[i] = buffer[i];
		imag[i] = 0;
	}
	var spectrum = new Float32Array(N / 2);
	var n = N / 2;
	var theta = Math.PI / n;
	var w = new Float32Array(n);
	var wN = new Float32Array(n);
	for (var i = 0; i < n; i++) {
		w[i] = Math.cos(theta * i);
		wN[i] = Math.sin(theta * i);
	}
	for (var i = 0; i < n; i++) {
		var r = 0;
		var i = 0;
		for (var j = 0; j < n; j++) {
			r += real[j] * w[i + j];
			i += imag[j] * wN[i + j];
		}
		spectrum[i] = Math.sqrt(r * r + i * i);
	}
	return spectrum;
}
