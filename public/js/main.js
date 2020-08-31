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
	"black:1000:0|white:1990:0|black:1:1",
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
			const [color, duration, faceness] = item.split(":");
			return {color, duration, faceness};
		});

	renderItem();

	function renderItem() {
		const [item] = items.splice(0, 1);
		//const freq = 14500;
		//const dur = 400;
        //playBeepBeep(freq, dur);
		if (item) {
    		
    		html.style.backgroundColor = item.color
			const faceness = parseInt(item.faceness, 10)
            if (faceness){
               preview.style.display = "block"; 
            }	
            else {
                preview.style.display = "none";
            }		
			
			setTimeout(renderItem, item.duration);
		}
	}
	console.log('should disappear')
}


const cycleColors = (durations, startTime, classNames) => {
    preview.style.display = "none";
    preview.style.display = "block";
    durations.forEach(function(duration, index){
        setTimeout(function(){
            console.log(classNames[index])
            html.classList = "overlay " + classNames[index]
              
        }, duration)
    })
    /*
    setTimeout(durations.forEach((duration, idx) =>
        setTimeout(()=>{
        console.log(classNames[idx])
        html.classList = "overlay " + classNames[idx] 
    }, duration)), startTime)
    */
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
                    
                    setTimeout(function() {
                        flashSequence(sequences[sequenceIndex]);
					}, 3000);
					
					
					//playBeep();
                    //cycleColors([1100,2000, 2050, 5000, 6000, 6030], 500, ['white', 'black', 'transparent','white', 'black', 'transparent'])
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

