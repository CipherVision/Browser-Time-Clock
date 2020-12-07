var me = {};
var employees;
if (!(localStorage.getItem('save') === null)) {
  employees = JSON.parse(localStorage.getItem('save'));
} else {
  employees = [{
      n: 'Employee1',
      tHours: 0,
      shifts: [],
      punchedIn: false,
      pin: '111111'
    },
    {
      n: 'Employee2',
      tHours: 0,
      shifts: [],
      punchedIn: false,
      pin: '222222'
    },
    {
      n: 'Employee3',
      tHours: 0,
      shifts: [],
      punchedIn: false,
      pin: '333333'
    }
  ];
}
window.onload = function () {
  var users = document.getElementById('users');
  var codes = {};
  var infoT = document.getElementById('infoT');
  var infoBT = document.getElementById('infoBT');
  for (var i = 0; i < employees.length; i++) {
    var e = employees[i];
    codes[e.pin] = {};
    codes[e.pin].n = e.n;
    codes[e.pin].id = i;
  }
  codes['000000'] = 'grant';
  var optionsToggle = false;
  var list = document.getElementById('list');
  var pinForm = document.getElementById("pinForm");
  var pinWrap = document.getElementById("pinWrap");
  var buttonsWrap = document.getElementById("buttonsWrap");
  var punchIn;
  var punchOut;
  var shifts = [];

  me.clearT = function () {
    infoT.innerHTML = 'Please enter your 6-digit PIN';
    infoBT.innerHTML = '';
  }
  var timer = window.setTimeout(me.clearT, 4000);
  window.clearTimeout(timer);

  window.setTimeout(function () {
    pinForm.focus();
  }, 500);

  pinForm.addEventListener("input", function () {
    if (pinForm.value.length >= 6) {
      if (codes[pinForm.value] == 'grant') {
        me.optionsMenu();
      } else if (codes.hasOwnProperty(pinForm.value)) {
        clockUser(employees[codes[pinForm.value].id]);
      } else {
        infoT.innerHTML = 'Wrong pin!';
        window.clearTimeout(timer);
        timer = window.setTimeout(me.clearT, 3000);
      }
      pinForm.value = '';
    }
  });

  function clockUser(cUser) {
    if (cUser.punchedIn) {
      cUser.punchedIn = false;

      punchOut = moment().format('ddd, MMM Do, h:mm:ss A');

      //var elapsedDuration = moment.duration(pOut.diff(cUser.shifts[cUser.shifts.length-1].pIn));
      //.format('ddd, MMM Do, h:mm:ss A');

      speak('OUT.', true);
      infoT.innerHTML = 'Goodbye, ' + cUser.n + '! ' + 'Clocked out.';
      var duration = Math.round(moment.duration(moment(punchOut, 'ddd, MMM Do, h:mm:ss A').diff(moment(cUser.shifts[cUser.shifts.length - 1].punchIn, 'ddd, MMM Do, h:mm:ss A'))).asHours() * 1000) / 1000;
      infoBT.innerHTML = 'Shift Total: ' + duration;
      window.clearTimeout(timer);
      timer = window.setTimeout(me.clearT, 4000);

      addNodes(cUser, punchIn, punchOut);

    } else {
      cUser.punchedIn = true

      punchIn = moment().format('ddd, MMM Do, h:mm:ss A');
      speak('IN.', false);
      infoT.innerHTML = 'Welcome, ' + cUser.n + '! ' + 'Clocked in.';
      window.clearTimeout(timer);
      timer = window.setTimeout(me.clearT, 3000);

      addNodes(cUser, punchIn, punchOut);
    }
  }

  function addNodes(cUser, punchIn, punchOut) {
    if (!cUser.punchedIn) {

      //clocked out!

      var shift = {};
      shift.punchOut = punchOut;
      cUser.shifts.push(shift);

      localStorage.setItem('save', JSON.stringify(employees));

      //alert(JSON.stringify(employees));
    } else {

      //clocked in!

      var shift = {}
      shift.punchIn = punchIn;
      cUser.shifts.push(shift);

      localStorage.setItem('save', JSON.stringify(employees));
    }
  }

  me.optionsMenu = function () {
    if (optionsToggle) {
      optionsToggle = false;
      list.style.visibility = "visible";
      infoT.style.visibility = "visible";
      buttonsWrap.style.visibility = "hidden";
      users.style.display = "none";
      pinWrap.id = 'pinWrap';
    } else {
      optionsToggle = true;
      list.style.visibility = "hidden";
      infoT.style.visibility = "hidden";
      buttonsWrap.style.visibility = "visible";
      users.style.display = "block";
      pinWrap.id = 'pinWrap2';

      for (var i = 0; i < employees.length; i++) {
        var employee = document.getElementById(employees[i].n);
        employee.innerHTML = '';
        employees[i].tHours = 0;
        var pShifts = employees[i].shifts;
        for (var z = 0; z < pShifts.length; z++) {
          var shift = pShifts[z];
          if (typeof shift.punchOut == 'undefined') {
            //in shift
            var nodeZ = document.createElement("LI");
            //alert(typeof shift.punchIn);
            var textnodeZ = document.createTextNode('Clocked in: ' + shift.punchIn);
            nodeZ.appendChild(textnodeZ);
            nodeZ.contentEditable = true;
            employee.appendChild(nodeZ);
          } else {
            //out shift
            var duration = Math.round(moment.duration(moment(shift.punchOut, 'ddd, MMM Do, h:mm:ss A').diff(moment(pShifts[z - 1].punchIn, 'ddd, MMM Do, h:mm:ss A'))).asHours() * 1000) / 1000;
            var nodeZ = document.createElement("LI");
            var textnodeZ = document.createTextNode('Clocked out: ' + shift.punchOut);
            nodeZ.appendChild(textnodeZ);
            nodeZ.contentEditable = true;
            employee.appendChild(nodeZ);
            var nodeZ2 = document.createElement("B");
            var textnodeZ2 = document.createTextNode('Shift Total: ' + duration + ' Hours');
            nodeZ2.appendChild(textnodeZ2);
            nodeZ2.style.margin = '45px';
            employee.appendChild(nodeZ2);
            employees[i].tHours += duration;
            document.getElementById(employees[i].n + "-Hours").innerHTML = "Hours Total: " + Math.round(employees[i].tHours * 1000) / 1000;
          }
        }
      }

    }
  }

}

function clearAll() {
  var retVal = confirm("Are you sure?");
  if (retVal == true) {
    localStorage.clear();
    location.reload(true);
  } else {}
}

function saveH() {
  for (var i = 0; i < employees.length; i++) {
    var userT = document.getElementsByTagName('UL')[i];
    for (var z = 0; z < employees.length; z++) {
      if (employees[z].n == userT.id) {
        var w = 0;
        for (var x = 0; x < userT.children.length; x++) {
          if (userT.children[x].innerHTML.substring(0, 5) == 'Clock') {
            var shiftString = userT.children[x].innerHTML;
            if (typeof employees[z].shifts[w].punchOut == 'undefined') {
              employees[z].shifts[w].punchIn = shiftString.match(/(?<=: ).*/gi)[0];
            } else {
              employees[z].shifts[w].punchOut = shiftString.match(/(?<=: ).*/gi)[0];
            }
            w++;
          } else {
            if (userT.children[x].innerHTML == '') {
              if (typeof employees[z].shifts[w].punchOut == 'undefined') {
                //alert('deleted punch in!');
                //alert(x);
                //alert(userT.children.length);

                if (x == userT.children.length - 1) {
                  employees[z].punchedIn = false;
                  employees[z].shifts.splice(w, 1);
                  userT.children[x].parentNode.removeChild(userT.children[x]);
                } else if (userT.children[x + 1].innerHTML == '') {
                  employees[z].shifts.splice(w, 1);
                  userT.children[x].parentNode.removeChild(userT.children[x]);
                  employees[z].shifts.splice(w, 1);
                  userT.children[x].parentNode.removeChild(userT.children[x]);
                  userT.children[x].parentNode.removeChild(userT.children[x]);
                  w--;
                  x--;
                }
              }
            }
          }
        }
        break;
      }
    }
  }
  localStorage.setItem('save', JSON.stringify(employees));
  alert('Saved!');
  me.optionsMenu();
  me.optionsMenu();
}

function speak(words, out) {
  var voice = new SpeechSynthesisUtterance(words);
  voice.voice = me.voices[27];
  voice.rate = 0.3;
  if (out) {
    voice.pitch = 0.1;
  } else {
    voice.pitch = 1.1;
  }
  window.speechSynthesis.speak(voice);
}
window.speechSynthesis.onvoiceschanged = function () {
  me.voices = window.speechSynthesis.getVoices();
};