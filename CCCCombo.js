(function($) {
	$.fn.CCCCombo = function(options) {
		
		options = $.extend({
			touchAreas: {},
			hackTheCSS: false,
			combotimeout: 200,
			tapTimeout: 100,
			onCombo: $.noop
		}, options);

		var lastMove = [];
		var lastEl = {
			dir: [],
			id: null
		};

		var comboTimeout = false;
		function startComboTimeout (){
			comboTimeout = true;
			window.setTimeout(
				function(){
					comboTimeout = false;
					processCombo(lastMove);
					lastMove = [];
				}, options.comboTimeout
			);
		}

		var tapTimeout = false;
		function startTapTimeout (){
			tapTimeout = true;
			startComboTimeout();
			window.setTimeout(
				function(){
					tapTimeout = false;
				}, options.tapTimeout
			);
		}

		function moveCheck (move) {
			console.log("move: ", move);
			if (move.dir === "lrl" && (move.id === "mL" || move.id === "mR")) { return "Left Right Left";}
			if (move.dir === "u" && move.id ==="bM") return "Uppercut!!";
			if (move.dir === "ldru" || move.dir === "rdul" || move.dir === "lurd" || move.dir === "rdlu") return "Round House!!!";
			return lastEl.id + "[" + lastEl.dir + "]";
		}	

		function hasAttr ($this, attr) {

			var attribute = $this.attr(attr)
			if (typeof attr !== 'undefined' && attr !== false) return true;
			return false;

		}

		function processCombo (lastMove) {

			options.onCombo(lastMove);
		} 

		return this.each(function(el, i)	{
			
			var $this = $(this);
			

			if (!hasAttr($this, "data-combo-id")) $this.attr("data-combo-id", el);

			$this.hammer().bind('drag', function (ev) {
				if (typeof ev.angle !== 'undefined') {
					var id = $(this).attr('data-combo-id');
					var dir = ev.direction[0];
					lastEl.id = id;
					if (dir !== lastEl.dir[lastEl.dir.length -1]) lastEl.dir +=dir;

				}
				ev.preventDefault()
			})

			$this.hammer().bind('dragend', function (ev) {
				
				if (lastEl.id !== null) {
					options.onCombo(moveCheck(lastEl));
					console.log(lastEl)
				}
				lastEl = {
					id: null,
					dir: []
				}
				ev.preventDefault();
			})

			$this.hammer().bind('tap', function (ev) {
				
				if (!tapTimeout) {
					startTapTimeout();
					var id = $this.attr('data-combo-id');					
					lastMove.push(id + "[tap]")
				}
				
				ev.preventDefault();
			})

			$this.hammer().bind('doubletap', function (ev) {
				
				if (!tapTimeout) {
					startTapTimeout();
					var id = $this.attr('data-combo-id');
					lastMove.push(id + "[Dtap]")
				}
				
				ev.preventDefault();
			})


		});
	};
}
(jQuery));

