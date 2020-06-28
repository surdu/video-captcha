const startBtn = document.getElementById("startBtn");
const preview = document.getElementById("preview");
const video = document.querySelector("#preview video");
const numbers = document.getElementById("numbers");
const html = document.querySelector("body");
const thanks = document.getElementById("thanks");

const videoConstraints = {
	audio: true,
	video: {
			facingMode: "user",
			width: 640,
			height: 480
	}
};

const sequences = [
	"000:1000|002B7F:1000|FCD116:1000|CE1126:1000|lime:1000|fff:0",
	"red:1000|lime:1000|black:1000|magenta:1000|purple:1000|fff:0"
];
const sequenceIndex = random(sequences.length);

const audioContext = new AudioContext()

function random(max) {
  return Math.floor(Math.random() * max);
}

function flashSequence(sequence) {
	const items = sequence
		.split("|")
		.map(function(item){
			const [color, duration] = item.split(":");
			return {color, duration};
		});

	renderItem();

	function renderItem() {
		const [item] = items.splice(0, 1);

		if (item) {
			html.style.backgroundColor = item.color;

			setTimeout(renderItem, item.duration);
		}
	}
}

function playBeep() {
	const oscilator = audioContext.createOscillator()
	const gain = audioContext.createGain()
	oscilator.connect(gain);

	oscilator.type = "sine"
	oscilator.connect(audioContext.destination)
	oscilator.start()

	setTimeout(function() {
		oscilator.stop();
	}, 100);
}

function faitAttention() {
	return new Promise(function(resolve) {
		var count = 3;

		const intervalId = setInterval(function() {
			if (count !== 0) {
				playBeep();
			}
			else {
				numbers.style.display = "none";
				clearInterval(intervalId);
				resolve();
			}

			numbers.innerHTML = count;
			count--;
		}, 1000);
	})
}

preview.style.display = "none";

startBtn.addEventListener("click", function() {
		preview.style.display = "block";
		startBtn.style.display = "none";

		navigator.mediaDevices.getUserMedia(videoConstraints)
		.then(function(mediaStreamObj) {
			if ("srcObject" in video) {
				video.srcObject = mediaStreamObj;
			} else {
				video.src = window.URL.createObjectURL(mediaStreamObj);
			}

			video.onloadedmetadata = function(ev) {
				video.play();
			};

			//add listeners for saving video/audio
			const mediaRecorder = new MediaRecorder(mediaStreamObj);
			const chunks = [];

			mediaRecorder.ondataavailable = function(ev) {
				chunks.push(ev.data);
			}
			mediaRecorder.onstop = (ev)=>{
				const movie = new Blob(chunks, { 'type' : 'video/mp4;' });

				preview.style.display = "none";
				thanks.style.display = "block";

				const form = new FormData();
				form.append('sequence', sequenceIndex);
				form.append('movie', movie);

				const request = new XMLHttpRequest();
				request.open('POST', '/upload', true);
				request.onload = function(e) {
					thanks.innerHTML = "That's all folks! Thanks!"
				};
				request.send(form);

			}

			faitAttention().then(function() {
				mediaRecorder.start();
				console.log(mediaRecorder.state);

				setTimeout(function(){
					flashSequence(sequences[sequenceIndex]);
					playBeep();

					setTimeout(function() {
						mediaRecorder.stop();
						video.pause();
					}, 5000);
				}, 200);
			});
		})
		.catch(function(err) {
			console.log(err.name, err.message);
		});

});

