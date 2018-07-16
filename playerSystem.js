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
	
	return {
		findId: findId,
		exists: exists,
		remove: remove
	};
	
})();