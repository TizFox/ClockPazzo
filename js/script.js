//const r = document.querySelector(':root');

// COSTANTS //
const h_s = 3600;
const m_s = 60;

// Sounds //
const timerSoundDuration = 10000;
const pomodoroTimerSoundDuration = 5000;
const names = ["Sound1", "Sound2", "Sound3", "Sound4", "Sound5", "Sound6", "Sound7"];
var sounds = [];

// Classes //
var dateAndClock, timeLeft, timer, pomodoroTimer;

// --- GLOBAL UPDATE --- //
window.onload = () => {
	let soundCollector = document.getElementById("SoundCollector");
	for (let i = 0; i < names.length; i++) {
		soundCollector.innerHTML += `<audio id="${names[i]}" loop src="./assets/sounds/${names[i]}.wav"></audio>`
		sounds.push(document.getElementById(names[i]));
	}

	dateAndClock = new DateAndClock(false, false);
	timeLeft = new TimeLeft();
	timer = new Timer();
	pomodoroTimer = new PomodoroTimer()
	updateAll();
}
window.setInterval(updateAll, 500);
function updateAll() {
	const newTime = getTime();
	dateAndClock.update(newTime);
	timeLeft.update(newTime);
	timer.update(newTime);
	pomodoroTimer.update(newTime);
}

/*
----- TODO -----
CSS:
- Color Palette // Meh
- Sizes	// Meh
- Effetto orologio fisico a palette	// AAAAAHHHHH

JS:
- Timer Pause
--- END TODO ---
*/

// ---------- Get Time ---------- //
function getTime() {
	const now = new Date();

	const yFull = now.getFullYear();
	const yHalf = yFull % 100;
	const mNum = addZero(now.getMonth() + 1);
	const mName = getMonthName(mNum);
	const dNum = addZero(now.getDate());
	const dName = getDayName(now.getDay());

	const h = addZero(now.getHours());
    const m = addZero(now.getMinutes());
    const s = addZero(now.getSeconds());

    return {
    	date: now,
    	yearFull: yFull,
    	yearHalf: yHalf,
    	monthNum: mNum,
    	monthName: mName,
    	dayNum: dNum,
    	dayName: dName,
    	hour: h,
    	minute: m,
    	second: s
    }
}
function addZero(n) {
	return (n < 10 ? '0' : '') + n;
}
function convertHMS(h, m, s) {
	return h * h_s + m * m_s + s;
}
function convertS(s) {
	var h = Math.floor(s / h_s);
	s -= h * h_s;
	var m = Math.floor(s / m_s);
	s -= m * m_s;
	return {h, m, s};
}
function getDayName(nDay) {
	switch (nDay) {
	case 0:
		return 'Sunday';
	case 1:
		return 'Monday';
	case 2:
		return 'Tuesday';
	case 3:
		return 'Wednsday';
	case 4:
		return 'Thursday';
	case 5:
		return 'Friday';
	case 6:
		return 'Saturday';
	}
}
function getMonthName(nMonth) {
	switch (nMonth) {
	case '01':
		return 'January';
	case '02':
		return 'Febuary';
	case '03':
		return 'March';
	case '04':
		return 'April';
	case '05':
		return 'May';
	case '06':
		return 'June';
	case '07':
		return 'July';
	case '08':
		return 'August';
	case '09':
		return 'September';
	case '10':
		return 'October';
	case '11':
		return 'November';
	case '12':
		return 'December';
	default:
		return 'WTF';
	}
}
function linearInterpolation(start, end, t) {
	var intervalDuration = end - start;
	if (intervalDuration == 0) {
		return 0;
	}
	var relativeT = t - start;
	return relativeT / intervalDuration;
}
function playSound(index, duration) {
	sounds[index].play();
	window.setTimeout(stopSound, duration, index);
}
function stopSound(index) {
	sounds[index].pause();
	sounds[index].currentTime = 0;
}

// ---------- Date & Clock ---------- //
class DateAndClock {
	constructor(yT, mT) {
		this.yearType = yT; 	// true => Full | false => Last2
		this.monthType = mT;	// true => Name | false => Num

		this.dayName = document.getElementById('DdayName');
		this.dayNum = document.getElementById('DdayNum');
		this.month = document.getElementById('Dmonth')
		this.year = document.getElementById('Dyear');

		this.hour = document.getElementById('Chour');
		this.minute = document.getElementById('Cminute');
		this.second = document.getElementById('Csecond');

	}
	toggleYearType() {
		yearType = !yearType;
	}
	toggleMonthType() {
		monthType = !monthType;
	}
	update(newTime) {
		this.dayName.innerHTML = newTime.dayName;

		this.dayNum.innerHTML = newTime.dayNum;
		this.month.innerHTML = (this.monthType) ? newTime.monthName : newTime.monthNum;
		this.year.innerHTML = (this.yearType) ? newTime.yearFull : newTime.yearHalf;

		this.hour.innerHTML = newTime.hour;
		this.minute.innerHTML = newTime.minute;
		this.second.innerHTML = newTime.second;
	}
}

// ---------- Time Left ---------- //
class TimeLeft {
	constructor() {
		this.start = 0;
		this.end = 0;

		this.progressBar = document.getElementById('TLprogressBar');
		this.progressBarLabel = document.getElementById('TLprogressBarLabel');

		this.hourInput = document.getElementById('TLhourInput');
		this.minuteInput = document.getElementById('TLminuteInput');

		this.startBtn = document.getElementById('startTimeLeft');
	}

	update(newTime) {
		var now = newTime.date.getTime();
		if (this.end - now <= 0) {
			// End Progress Bar
			this.end = 0;
			this.start = 0;
			this.setPercent('');
			this.setLabel('');
		}
		// Update Progress Bar
		var value = linearInterpolation(this.start, this.end, now);
		this.progressBar.style.width =  String(value * 100) + '%';

		this.setPercent(String(Math.floor(value * 100)) + '%');
	}

	setPercent(percent) {
		if (percent == '') {
			this.progressBar.innerHTML = '';
			return;
		}
		this.progressBar.innerHTML = percent;
	}

	setLabel(label) {
		if (label == '') {
			this.progressBarLabel.innerHTML = '[NULL]';
			return;
		}	
		this.progressBarLabel.innerHTML = label;
	}

	setTargetTime() {
		var hour = Number(this.hourInput.value);
		var minute = Number(this.minuteInput.value);

		// Check Target Time
		if (hour < 0 || hour > 24) {
			this.hourInput.value = '';
			return;
		}
		if (minute < 0 || minute > 59) {
			this.minuteInput.value = '';
			return;
		}

		// Set Progress Bar Label
		var now = getTime();
		let label = now.hour + ':' + now.minute + ' => ' + addZero(hour) + ':' + addZero(minute);
		this.setLabel(label);

		// Start Progress Bar
		var date = now.date;
		this.start = date.getTime();
		date.setHours(hour, minute);
		this.end = date.getTime();

		this.hourInput.value = ''
		this.minuteInput.value = ''
	}
}

// ---------- Timer ---------- //
class Timer {
	constructor() {
		this.pause = false;
		this.toStart = false;
		this.isRunning = false;
		this.startTime = 0;
		this.duration = 0;

		this.hour = document.getElementById('Thour');
		this.minute = document.getElementById('Tminute');
		this.second = document.getElementById('Tsecond');
		this.hour.innerHTML = '00';
		this.minute.innerHTML = '00';
		this.second.innerHTML = '00';

		this.hourInput = document.getElementById('ThourInput');
		this.minuteInput = document.getElementById('TminuteInput');
		this.secondInput = document.getElementById('TsecondInput');

		this.startBtn = document.getElementById('Tstart');
		this.startBtn.disabled = true;

		this.soundDuration = timerSoundDuration;
		this.soundSelect = document.getElementById('Tsounds');
		// Fill Options
		for (let i = 0; i < sounds.length; i++) {
			this.soundSelect.innerHTML += `<option>${names[i]}</option>`;
		}
	}

	update(newTime) {
		if (this.duration == 0) {
			return;
		}

		var hour = Number(newTime.hour);
		var minute = Number(newTime.minute);
		var second = Number(newTime.second);

		var now = convertHMS(hour, minute, second);

		if (this.toStart) {
			this.startTime = now;
			this.isRunning = true;
			this.toStart = false;
		}

		var timeRemaning = this.duration - (now - this.startTime);

		if (timeRemaning == -1) {
			return this.end();
		} else if (this.isRunning) {
			var obj = convertS(timeRemaning);

			this.hour.innerHTML = addZero(obj.h);
			this.minute.innerHTML = addZero(obj.m);
			this.second.innerHTML = addZero(obj.s);
		}
	}

	setDuration() {
		var hour = Number(this.hourInput.value);
		var minute = Number(this.minuteInput.value);
		var second = Number(this.secondInput.value);

		this.duration = convertHMS(hour, minute, second);
		if (this.duration == 0) return;

		var obj = convertS(this.duration);
		this.startBtn.disabled = false;

		this.hour.innerHTML = addZero(obj.h);
		this.minute.innerHTML = addZero(obj.m);
		this.second.innerHTML = addZero(obj.s);
	}

	togglePause() {
		this.pause = !this.pause;
		console.log(this.pause);
	}

	start() {
		if (this.duration == 0) {
			return;
		}
		this.startBtn.disabled = true;
		this.toStart = true;
	}

	end() {
		this.duration = 0;
		this.hourInput.value = '';
		this.minuteInput.value = '';
		this.secondInput.value = '';
		this.isRunning = false;

		// Play Sound
		var value = this.soundSelect.selectedIndex;

		if (value == 0) {
			return;
		}

		playSound(value-1, this.soundDuration);
	}
}

// ---------- Pomodoro Timer ---------- //
class PomodoroTimer {
	constructor() {
		this.toStart = false;
		this.startTime = 0;
		this.duration = [0, 0];

		this.defaultState = '[NULL]';
		this.currentState = -1; // Possible States [Focus, Relax]

		this.focusInput = document.getElementById('PTfocusInput');
		this.relaxInput = document.getElementById('PTrelaxInput');

		this.startBtn = document.getElementById('PTstart');
		this.stopBtn = document.getElementById('PTstop');
		this.startBtn.disabled = true;
		this.stopBtn.disabled = true;

		this.stateLabel = document.getElementById('PTstate');
		this.stateLabel.innerHTML = this.defaultState;

		this.minute = document.getElementById('PTminute');
		this.second = document.getElementById('PTsecond');
		this.minute.innerHTML = '00';
		this.second.innerHTML = '00';

		this.soundDuration = pomodoroTimerSoundDuration;
		this.soundSelect = document.getElementById('PTsounds');
		// Fill Options
		for (let i = 0; i < sounds.length; i++) {
			this.soundSelect.innerHTML += `<option>${names[i]}</option>`;
		}
	}

	update(newTime) {
		var hour = Number(newTime.hour);
		var minute = Number(newTime.minute);
		var second = Number(newTime.second);

		var now = convertHMS(hour, minute, second);

		if (this.toStart) {
			this.toStart = false;
			this.startTime = now;

			this.updateState(0);

			this.focusInput.readOnly = true;
			this.relaxInput.readOnly = true;

			this.startBtn.disabled = true;
			this.stopBtn.disabled = false;
		}

		if (this.duration[this.currentState] == 0 || this.currentState == -1) {
			return;
		}

		var timeRemaning = this.duration[this.currentState] - (now - this.startTime);

		if (timeRemaning == -1) {
			this.startTime = now;
			var newState = this.currentState ? 0 : 1;
			this.updateState(newState);
			// Play Sound
			var value = this.soundSelect.selectedIndex;
			if (value == 'Choose a Sound') {
				return;
			}
			playSound(value-1, this.soundDuration);
		} else {
			this.updateText(timeRemaning);	
		}
	}

	updateText(time) {
		var minutes = Math.floor(time / 60);
		var seconds = time - minutes * 60;

		this.minute.innerHTML = addZero(minutes);
		this.second.innerHTML = addZero(seconds);
	}

	setDuration() {
		var focus = Number(this.focusInput.value);
		var relax = Number(this.relaxInput.value);

		if (focus <= 0 || relax <= 0) {
			this.focusInput.value = '';
			this.relaxInput.value = '';
			return;
		}

		this.startBtn.disabled = false;
		this.stopBtn.disabled = true;

		this.duration = [focus * 60, relax * 60];
		this.updateText(this.duration[0]);
	}

	updateState(code) {
		var newState = '';
		switch (code) {
		case -1:
			newState = '[NULL]';
			break;
		case 0:
			newState = "FOCUS";
			break;
		case 1:
			newState = 'RELAX';
		}
		this.currentState = code;
		this.stateLabel.innerHTML = newState;
	}

	start() {
		if (this.duration[0] == 0 || this.duration[1] == 0) {
			return;
		}
		this.startBtn.disabled = true;
		this.toStart = true;
	}

	stop() {
		this.updateState(-1);
		this.minute.innerHTML = '00';
		this.second.innerHTML = '00';

		this.focusInput.value = '';
		this.relaxInput.value = '';

		this.focusInput.readOnly = false;
		this.relaxInput.readOnly = false;

		this.startBtn.disabled = true;
		this.stopBtn.disabled = true;

		this.toStart = false;
	}
}
