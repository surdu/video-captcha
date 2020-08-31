const startBtn = document.getElementById("startBtn");
const preview = document.getElementById("preview");
const video = document.getElementById("previewVideo");
const numbers = document.getElementById("numbers");
const html = document.querySelector("body");
const thanks = document.getElementById("thanks");
const overlay = document.getElementsByClassName('overlay')[0]

const videoConstraints = {
	audio: true,
	video: {
			facingMode: "user",
			width: 640,
			height: 480
	}
};

const sequences = [
	"black:1000|002B7F:1000|FCD116:1000|CE1126:1000|lime:1000|transparent:0",
	"red:1000|lime:1000|black:1000|magenta:1000|purple:1000|transparent:0"
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
		//const freq = 14500;
		//const dur = 400;
        //playBeepBeep(freq, dur);
		if (item) {
    		const overlay = document.createElement('div')
    		overlay.style.backgroundColor = item.color
			overlay.style.width = "100vw"
			overlay.style.height = "100vh"
			overlay.style.position ="absolute"
			overlay.style.top = "0"
			overlay.style.left = "0"
			
			const body = document.getElementsByTagName('body')[0]
			body.appendChild(overlay)
			//html.style.backgroundColor = item.color;
			//playBeep();
			setTimeout(renderItem, item.duration);
		}
	}
	console.log('should disappear')
}


const cycleColors = (durations, startTime, classNames) => {
    setTimeout(durations.forEach((duration, idx) =>
        setTimeout(()=>{
        console.log(classNames[idx])
        overlay.classList = "overlay " + classNames[idx] 
    }, duration)), startTime)
}

function playBeepBeep(freq, dur) {
	const oscilator = audioContext.createOscillator()
	const gain = audioContext.createGain()
	oscilator.connect(gain);
	var frequency = freq;
	oscilator.frequency.value = frequency;
	oscilator.type = "sine"
	//oscillator.frequency.value = frequency;
	oscilator.connect(audioContext.destination)
	oscilator.start()

	setTimeout(function() {
		oscilator.stop();
	}, dur);
}


function playBeep() {
	const oscilator = audioContext.createOscillator()
	const gain = audioContext.createGain()
	oscilator.connect(gain);
	var frequency = 2500;
	oscilator.frequency.value = frequency;
	oscilator.type = "sine"
	//oscillator.frequency.value = frequency;
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
    				//var freq = 16000;
            		//var dur = 2000;
                    //playBeepBeep(freq, dur);
                    var audioCtx = new(window.AudioContext || window.webkitAudioContext)();
                    function playNote(frequency, duration) {
                      // create Oscillator node
                      var oscillator = audioCtx.createOscillator();
                    
                      oscillator.type = 'square';
                      oscillator.frequency.value = frequency; // value in hertz
                      oscillator.connect(audioCtx.destination);
                      oscillator.start();
                    
                      setTimeout(
                        function() {
                          oscillator.stop();
                          playMelody();
                        }, duration);
                    }
                    
                    function playMelody() {
                      if (notes.length > 0) {
                        note = notes.pop();
                        playNote(note[0], note[1]);
                      }
                    }
                    
                    
                    notes = [
                      [12000, 500],
                      [13000, 1000],
                      [14000, 500],
                      [15000, 1000],
                      [16000, 500]
                    ];
                    
                    notes.reverse();
                    tempo = 100;
                    playMelody();
                    
					//flashSequence(sequences[sequenceIndex]);
					//playBeep();
                    cycleColors([1100,2000, 2050, 5000, 6000, 6030], 500, ['white', 'black', 'transparent','white', 'black', 'transparent'])
					setTimeout(function() {
						mediaRecorder.stop();
						video.pause();
					}, 10000);
				}, 1000);
			});
		})
		.catch(function(err) {
			console.log(err.name, err.message);
		});

});

