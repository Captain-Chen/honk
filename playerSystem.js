var playerModule = (function(){

	// player functions
	function findId(player, list){
		for(var i = 0; i < list.length; i++){
			if(list[i].name == player)
				return i;
		}
		return false;
	}
	
	function exists(player, list){
		for(var i = 0; i < list.length; i++){
			if(list[i].name == player)
				return true;
		}
		return false;
	}
	
	function remove(player, list){
		list.forEach(function(user, index){
			if(user.name == player)
				list.splice(index, 1); // delete player from list
		});
	}
	
	// to-do: make this function more generic
	// function updateStats(index, fish, list){
		// list[index].fishingExp += fish.exp;
		// // check if the player has enough experience points
		// if(list[index].fishingExp >= 100){
			// var levelNumTimes = Math.floor(list[index].fishingExp / 100);
			// // level up n-times
			// for(var i = 0; i < levelNumTimes; i++)
				// list[index].fishingLvl += 1;
			
			// list[index].fishingExp -= 100 * levelNumTimes;
			// //$.say(list[index].name + '\'s fishing level increased to Lv.' + list[index].fishingLvl + '!');
		// }
	// }
	return {
		findId: findId,
		exists: exists,
		remove: remove
	};
	
})();