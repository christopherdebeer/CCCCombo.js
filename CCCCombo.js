(function ($){
  var check=false, isRelative=true;

  $.elementFromPoint = function(x,y)
  {
    if(!document.elementFromPoint) return null;

    if(!check)
    {
      var sl;
      if((sl = $(document).scrollTop()) >0)
      {
       isRelative = (document.elementFromPoint(0, sl + $(window).height() -1) == null);
      }
      else if((sl = $(document).scrollLeft()) >0)
      {
       isRelative = (document.elementFromPoint(sl + $(window).width() -1, 0) == null);
      }
      check = (sl>0);
    }

    if(!isRelative)
    {
      x += $(document).scrollLeft();
      y += $(document).scrollTop();
    }

    return document.elementFromPoint(x,y);
  }	

})(jQuery);

(function($) {
	$.fn.CCCCombo = function(options) {
		
		options = $.extend({
			hackTheCSS: false,
			comboTimeout: 1000,
			tapTimeout: 100,
			onCombo: $.noop
		}, options);


		var CCCCombos = [
			{
				id: "rH2",
				desc: "Reverse RoundHouse!",
				moves: [
					{dir: ["ldru", "ruld"]}
				]
			},
			{
				id: "rH",
				desc: "RoundHouse!",
				moves: [
					{dir: ["lurd","rdlu"]}
				]
			},
			{
				id: "slr",
				desc: "Simple left right",
				moves: [
					{dir: ["tap"], areas: ["mL"]},
					{dir: ["tap"], areas: ["mR"]}
				]
			},
			{
				id: "ffx",
				desc: "ForwardForward Punch",
				moves: [
					{dir: ["r"]},
					{dir: ["r"]},
					{dir: ["tap"], areas: ["mR"]}
				]
			},
			{
				id: "all",
				desc: "Generous regex", 
				moves: [
					{dir: [/[rlud]*]/]}
				]
			},
			{
				id: "lrl", 
				desc: "Left Right Left!!", 
				moves: [
					{dir: ["lrl"]}
				]
			},
			{
				id: "uc2", 
				desc: "Double Uppercut!",
				moves: [
					{dir: ["u"], areas: ["bM"]},
					{dir: ["u"], areas: ["bM"]}
				]
			},
			{
				id: "dc2", 
				desc: "Slam Down!!",
				moves: [
					{dir: ["d"], areas: ["tM"]},
					{dir: ["d"], areas: ["tM"]}
				]
			}
		];

		var lastMove = [];
		var lastEl = {
			dir: [],
			id: null
		};

		var comboTimeout = false;
		function startComboTimeout (){
			if (!comboTimeout) {
				comboTimeout = true;
				lastMove = [];
				window.setTimeout(
					function(){
						comboTimeout = false;
						processCombo(lastMove);
						lastMove = [];
					}, options.comboTimeout
				);
			}
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
			// console.log("move: ", move);
			// if (move.dir === "lrl" && (move.id === "mL" || move.id === "mR")) return {id: move.id, dir: "Left Right Left"};
			// if (move.dir === "u" && move.id ==="bM") return {id: move.id, dir: "Uppercut!!"};
			// if (move.dir === "ldru" || move.dir === "rdul" || move.dir === "lurd" || move.dir === "rdlu") return {id: move.id, dir: "Round House!!!"};
			return {id: lastEl.id, dir: lastEl.dir };
		}	

		function hasAttr ($this, attr) {

			var attribute = $this.attr(attr)
			if (typeof attr !== 'undefined' && attr !== false) return true;
			return false;

		}

		function processCombo (lastMove) {

			if (lastMove.length > 0) {
				

				var matchCount = 0,
					matchedMoves = [],
					numMoves = lastMove.length;

				for (m in lastMove) {

					console.log( m, " move: ", lastMove[0])

					// check is move [m] has matching area
					var matchingArea = _.filter(CCCCombos, function(comb) {

						if (typeof comb.moves[m] !== 'undefined') {

							var areas = comb.moves[m].areas,
								noArea = typeof areas === 'undefined',
								areaMatch = _.indexOf(areas, lastMove[m].id) !== -1;

							return noArea || areaMatch;
						}
						
					})

					//console.log("possible matches: ", matchingArea);


					// check if move [m] has matching dir
					var matchingDir = _.filter(matchingArea, function(comb){
						if (typeof comb.moves[m] !== 'undefined') {

							var dirs = comb.moves[m].dir,
								noDir = typeof dirs === 'undefined',
								dirMatch = _.indexOf(dirs, lastMove[m].dir) !== -1,
								dirRegex = _.filter(dirs, function (dir) {
									if (dir instanceof RegExp) return dir.test(lastMove[m].dir);
									else return false;
								}) > 0;

								console.log("regex match: " + dirRegex.toString());

							return noDir || dirMatch || dirRegex;
						}
					})

					//console.log("refined matches: ", matchingDir);

					if (matchingDir.length > 0) matchCount++;
					if (matchCount === lastMove.length) {

						var numMovesMatch = _.filter(matchingDir, function(move) {
							return move.moves.length === numMoves;
						})

						matchedMoves = _.union(matchedMoves, numMovesMatch);
					}
				}
				
			}


			options.onCombo({
				move 	: lastMove, 
				matched : _.pluck(matchedMoves, "desc").join(" | "),
				match 	: matchedMoves.length > 0,
				matchCount: matchCount
			});
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
				
				console.log("multipoint: ",ev.touches.length > 1);
				if (lastEl.id !== null) {
					startComboTimeout();
					lastMove.push(moveCheck(lastEl));
				}
				lastEl = {
					id: null,
					dir: []
				}
				ev.preventDefault();
			})

			$this.hammer().bind('tap', function (ev) {
				
				console.log("multipoint: ",ev.touches.length > 1);
				if (!tapTimeout) {
					startTapTimeout();
					var id = $this.attr('data-combo-id');					
					lastMove.push({id: id, dir:"tap"})
				}
				
				ev.preventDefault();
			})

			$this.hammer().bind('doubletap', function (ev) {
				
				console.log("multipoint: " + (ev.touches.length > 1));
				if (!tapTimeout) {
					startTapTimeout();
					var id = $this.attr('data-combo-id');
					lastMove[lastMove.length -1] = {id: id, dir:"Dtap"};
				}
				
				ev.preventDefault();
			})


		});
	};
}
(jQuery));

