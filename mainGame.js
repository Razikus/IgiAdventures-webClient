tableInitialized = false;
var recognizer = function(evt) {
    var message = "";
    var span = $(console).find("span");
    if(evt.type == "message") {
        objectReceived = JSON.parse(evt.data);
        
        message = objectReceived.code;
        code = objectReceived.code;
        if(code == 3) {
            initDialog();
            loadMusics();
        }
        else if(code == 1) {
            loadedDatas = objectReceived;
            if(!tableInitialized) {
                initTable();
                tableInitialized = true;
            }
            else {
                reloadTable(loadedDatas.args);
            }
        }
    }
    else if(evt.type == "close") {
        message = "Websocket closed";
    }
    else if(evt.type == "open") {
        message = "Opening";
    }
    else {
        message = evt.type;
    }
    $(span).text(message);
}
var gameCanvas = document.getElementById("game");
var app = initApp(1024, 512, gameCanvas);

function initApp(x, y, gameCanvas) {
	var pixiApp = new PIXI.Application(x, y, {view: gameCanvas, backgroundColor: 0xFFFFFF });
	pixiApp.renderer.autoResize = true;
	PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
	return pixiApp;
}
var soundtrack = new Howl({
        src: ['sounds/soundtrack.mp3']
}
);
var clickSound = new Howl({
        src: ['sounds/click.mp3']
}
);
var winSound = new Howl({
        src: ['sounds/win.mp3']
}
);
function loadMusics() {
    soundtrack.once('load', function() {
        loadPixi();
    });
}
var igis = Math.floor(Math.random() * 100) + 50  ;
function loadPixi() {
    PIXI.loader
        .add("images/igi.png")
        .add("images/restart.png")
        .load(setup);
}
function setup() {
    sendToSocket(new TopAction(50));
    igis = Math.floor(Math.random() * 10) + 5  ;
    timenow = new Date().getTime();
    timeall = 0;
    timeavg = 0;
    soundtrack.stop();
    soundtrack.play();
    bunnies = [];
    points = igis;
    textStyle = new PIXI.TextStyle({
	    fontFamily: "Arial",
	    fontSize: 22,
	    fill: ['#FFFFFF', '#00ff99'],
	    stroke: '#000000',
	    strokeThickness: 5,
	    wordWrap: true,
	    wordWrapWidth: 440
    });
    scoreText = new PIXI.Text('Score: ' + timeavg, textStyle);
    scoreText.x = 30;
    scoreText.y = 60;
    app.stage.addChild(scoreText);
    pointsText = new PIXI.Text('Igis: ' + points, textStyle);
    pointsText.x = 30;
    pointsText.y = 30;
    app.stage.addChild(pointsText);
    restartButton = new PIXI.Sprite(PIXI.loader.resources["images/restart.png"].texture);
    restartButton.anchor.set(0.5);
    restartButton.x = gameCanvas.width - 50;
    restartButton.y = gameCanvas.height - 50;
    restartButton.scale.x *= 0.3;
    restartButton.scale.y *= 0.3;
    restartButton.interactive = true;
    restartButton.buttonMode = true;
    restartButton.on("pointerdown", onRestart);
    for(i = 0; i < igis; i++) {
        bunnies.push(addRandomIgi(app.stage));
    }
    app.stage.addChild(restartButton);
    app.ticker.add(gameLoop);
	$(".preLoader").fadeOut("slow");
}
function gameLoop(delta) {
    for(i = 0; i < bunnies.length; i++) {
        bunnies[i].rotation += delta * bunnies[i].rotateDelta;
    }
}
function addRandomIgi(stage) {
    var newIgi = new PIXI.Sprite(PIXI.loader.resources["images/igi.png"].texture);
    scale = Math.random();
    if(scale < 0.05 || scale > 0.15) {
	    scale = 0.1;
    }
    newIgi.scale.x *= scale;
    newIgi.scale.y *= scale;
    newIgi.anchor.set(0.5);
    newIgi.x = Math.floor((Math.random() * gameCanvas.width) + 1);
    newIgi.y = Math.floor((Math.random() * gameCanvas.height) + 1);
    newIgi.buttonMode = true;
    newIgi.interactive = true;
    newIgi.on("pointerdown", onIgiClick);
    newIgi.rotateDelta = Math.random()/10;
    stage.addChild(newIgi);
    return newIgi;
}
function onIgiClick(evt) {
    points = points - 1;
    n = igis - points;
    timeadd = new Date().getTime();
    timeall = timeall + timeadd - timenow;
    timenow = timeadd;
    timeavg = timeall / n;
    timeavg = timeavg.toFixed(3);
    pointsText.text = "Igis: " + points;
    scoreText.text = "Score: " + timeavg + "ms";

    if(points == 0) {
        winSound.play();
        soundtrack.stop();
	    showScoreDialog();

    } else {
        clickSound.rate((Math.random()*2) + 1);
        clickSound.play();
    }
    app.stage.removeChild(evt.target);
}
function onRestart(evt) {
    for (var i = app.stage.children.length - 1; i >= 0; i--) {
        app.stage.removeChild(app.stage.children[i]);
    }
    app.ticker.remove(gameLoop);
    setup();
}
function initDialog() {
      dialog = $( "#dialog-form" ).dialog({
      autoOpen: false,
      height: 200,
      width: 350,
      modal: true,
      buttons: {
        "Wyslij wynik": addScore
      },
      close: function() {
      }
    });

}

function reloadTable(args) {
    table.fnClearTable();
    table.fnAddData(args);
}

function initTable() {
    $(document).ready(function() {
        table = $('#scores').dataTable( {
            "language": {
                "url": "https://cdn.datatables.net/plug-ins/1.10.15/i18n/Polish.json"

            },
            "order": [[ 1, "asc" ]],
            data: loadedDatas.args,
            destroy: true,
            columns: [
                { data: "nickname" },
                { data: "score" }
            ]
        } );
    });
}

function showScoreDialog() {
	$("#dialog-form").dialog("open");
}

function addScore() {
	var nick = $("#nick").val().replace(/\s/g, "");
	var score = timeavg;
	timeavg = 9999999;
    sendToSocket(new AddAction(nick, score));
	$("#dialog-form").dialog("close");
    sendToSocket(new TopAction(50));
}


function sendToSocket(object) {
    webSocket.send(JSON.stringify(object));
}

function TopAction(howmuch) {
    this.howmuch = howmuch;
    this.actionName = "TOP";
}

function AddAction(nickname, score) {
    this.nickname = nickname;
    this.score = score;
    this.actionName = "ADD";
}
