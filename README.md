![CCCCombo!!](https://github.com/christopherdebeer/CCCCombo.js/raw/master/combo.png)

This is a work in progress, eventually a mobile gesture pattern registering library.
© Christopher de Beer 2012


	$('a.btn').CCCCombo({

		// callback
		onCombo: function(combo){
			// do something with results
		},

		// register your combo combinations
		combos: [
			{
				id: "00001",
				desc: "A basic combo"
				moves: [
					{area: ["A"], dir: ["Dtap"]},
					{area: ["B"], dir: ["tap"]}
				]
			},
			{
				id: "00002",
				desc: "Reverse RoundHouse!!",
				moves: [
					{dir: ["ldru", "ruld"]}
				]
			}
		]
	});


Hit Areas
---------

Hit areas or button ID's are assigned to elements as attributes like so

	<a href="#" class="btn" data-combo-id="A">A Button</a>
	<a href="#" class="btn" data-combo-id="B">B Button</a>