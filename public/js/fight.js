

var fight = {
	debug: {
		showLogs: true,
		logs: []
	},
	log: function(logArray) {
		if (fight.debug.showLogs && window.console) console.log(logArray);
		else fight.debug.logs.push(logArray)
	},
	user: {
		AB: null,
		id: null,
		name: null,
		face: {
			imageSrc: null,
			data: {},
		},
		stats: {
			level: 0,
			hp: {
				max: 0,
				current: 0
			},
			stamina: {
				max: 0,
				current: 0
			}
		},
		inventory: []
	},
	opponent: null,
	match: {
		id: null,
		startTime: null,
		round: {
			num: 0,
			maxRoundTime: 10 * 1000,
			lastRoundStart: null
		},
		lastUserAction: null,
		lastOpponentAction: null,
		history: {
			userActions: [],
			opponentActions: []

		}
	},
	action: {
		attack:{
			do: function(panelArray) {
				fight.log(["attach do() called with: ", panelArray])
			},
			confirm: function() {
				fight.log(["attach confirm() called."])
			}
		},
		block:{
			do: function(panelArray) {
				fight.log(["block do() called with: ", panelArray])
			},
			confirm: function() {
				fight.log(["block confirm() called."])
			}
		}
	},
	uiHandlers: {
		interactions: {
			selectAction: {
				type: "click",
				selectors: ["#actions a"],
				handler: function(ev) {
					var index = $(fight.uiHandlers.interactions.selectAction.selectors[0]).index(this);
					fight.log(["selectAction handler called on: ", this, index]);

				},
			},
			selectPanel: {
				type: "click",
				selectors: ["#grid .panel"],
				handler: function(ev) {
					var index = $(fight.uiHandlers.interactions.selectPanel.selectors[0]).index(this);
					fight.log(["selectPanel handler called on: ", this, index])
					fight.socket.emit('action', {
						fightId: fight.match.id,
						action: {
							type: "attack",
							block: index
						},
						opponent: fight.opponent.AB
					})
				},
				updateTimeBar: {
					type: 'tick',
					selectors: ["body"],
					handler: function(ev, data) {
						var $timeBar = $('#time .bar');
						$timebar.css('width', data.percent +"%");
					}
				}
			}
		},
		attach: function(type, selector, handler) {
			fight.log(["attaching ", type, " handler to ", selector, " -> ", handler]);
			$('body').on(type, selector, handler);
		},
		attachAll: function(){
			fight.log(["uiHandlers attachAll() called."])
			for (interaction in fight.uiHandlers.interactions) {
				var type = fight.uiHandlers.interactions[interaction].type;
				var handler = fight.uiHandlers.interactions[interaction].handler;
				for (sel in fight.uiHandlers.interactions[interaction].selectors) {
					var selector = fight.uiHandlers.interactions[interaction].selectors[sel];
					fight.uiHandlers.attach(type, selector, handler);
				}
			}
		}
	},
	socket: null,
	init: function() {
		fight.uiHandlers.attachAll();

		fight.socket = io.connect();

		fight.socket.on('handshake', function (data) {
			console.log("on handshake: ", data);
			fight.socket.emit('handshake-success', prompt("choose a name"));
		});

		fight.socket.on('fight', function (data){
			console.log("on fight: ", data);

			fight.opponent = {
				AB: data.opponent,
				name: data.opponentname
			}

			fight.user.AB = data.user;
			fight.user.name = data.username;

			fight.match.id = data.fightId;

			fight.methods.showFightInterface();
		});

		fight.socket.on('action', function(data) {
			console.log("Opponent action: ", data);
			
		})

	},
	methods:{
		showFightInterface: function(){
			$("#interface").removeClass("waiting");
			$("#interface").addClass("fight");
		},
		setupRoundTimer: function() {
			return window.setInterval(function(){

			}, fight.match.maxRoundTime);
		}
	}
}

$(document).ready(function(){fight.init();})