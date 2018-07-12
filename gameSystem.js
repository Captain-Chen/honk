var gameSystem = (function(){
	
	// fishing stuff
	var currentFishers = [];
	
	// fisherman "class" is a "type of" player
	function Fisherman(name){
		this.name = name;
		this.fishingLvl = 1;
		this.fishingExp = 0;
	}
	
	Fisherman.prototype.toString = function(){
		return this.name + ', Fishing Lvl. ' + this.fishingLvl + ', Exp: ' + this.fishingExp + '\n';
	};
	
	/**
     * @event command
     */
    $.bind('command', function(event) {
        var sender = event.getSender().toLowerCase(),
            command = event.getCommand(),
            args = event.getArgs(),
            action = args[0],
            actionArg1 = args[1],
            actionArg2 = args[2];

        /**	
         * @commandpath fish
         */
        if (command.equalsIgnoreCase('fish')){
            if (!action) {
				if(!playerModule.exists(sender, currentFishers)){
					currentFishers.push(new Fisherman(sender));	
					$.say(sender + ' casts out a line.. ');
					//$.panelsocketserver.updatePanel([], 'fishing');
					
					setTimeout(function(){
						var fish = fishingModule.castLine(sender); //  starts everything
						if(fish.rarity != 'nothing')
							$.say($.whisperPrefix(sender) + ' you caught a ' + fish);
						
						playerModule.remove(sender, currentFishers);
					}, 5e3);
				}
				else
				{
					$.say($.whisperPrefix(sender) + ' you are already fishing!');
					return;
				}
			}
			
			// options for command
			if(typeof action != 'undefined'){
				if(action.equalsIgnoreCase('bait')){
					if(fishingModule.isBaitActive()){
						$.say('There is already bait in the water. Try again after the effects have worn off!');
						return;
					}
					
					// check if user has enough points
					if($.getUserPoints(sender) > 1000){
						$.inidb.decr('points', sender, 1000);
						$.say(sender + ' used ' + $.getPointsString(1000) + 
						' to buy bait and tossed it into the water.' +
						' The fish appear to be biting more. (Duration 10 mins)');
						fishingModule.useBait();
					}
					else
					{
						$.say($.whisperPrefix(sender) + ' you need at least ' + $.getPointsString(1000) + ' in order to buy bait!');
						return;
					}
				}
				else if(action.equalsIgnoreCase('list'))
				{
					$.say('You can currently catch: ' + fishingModule.fishList());
				}
			}
		}
		
		/**	
         * @commandpath dungeon
         */
		if (command.equalsIgnoreCase('dungeon')) {
            if (!action) {
				dungeonModule.startDungeon(sender);
			}
			
			// options for command
			if(typeof action != 'undefined'){
				
			}
		}
    });

    /**
     * @event initReady
     */
    $.bind('initReady', function() {
        $.registerChatCommand('./honk/gameSystem.js', 'fish', 7);
		$.registerChatCommand('./honk/gameSystem.js', 'dungeon', 7);
    });
})(dungeonModule || fishingModule || playerModule);