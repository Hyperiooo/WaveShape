channels = 1; //1 for mono or 2 for stereo
sampleRate = 44100; //44.1khz (normal mp3 samplerate)
kbps = 128; //encode 128kbps mp3
mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, kbps);
var mp3Data = [];

samples = new Int16Array(44100); //one second of silence (get your data from the source you have)
sampleBlockSize = 1152; //can be anything but make it a multiple of 576 to make encoders life easier

var mp3Data = [];
for (var i = 0; i < samples.length; i += sampleBlockSize) {
	sampleChunk = samples.subarray(i, i + sampleBlockSize);
	var mp3buf = mp3encoder.encodeBuffer(sampleChunk);
	if (mp3buf.length > 0) {
		mp3Data.push(mp3buf);
	}
}
var mp3buf = mp3encoder.flush(); //finish writing mp3

if (mp3buf.length > 0) {
	mp3Data.push(new Int8Array(mp3buf));
}

var blob = new Blob(mp3Data, { type: "audio/mp3" });
var url = window.URL.createObjectURL(blob);
console.log("MP3 URl: ", url);
