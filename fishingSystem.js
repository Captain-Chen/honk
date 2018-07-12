/*
 * fishing system.js
 */
var fishingModule = (function(){
		
	// fish "class"
	function Fish(name, rarity, exp){
		this.name = name;
		this.rarity = rarity;
		this.exp = exp;
	}
	
	// add toString prototype that will be instantiated for all Fish objects
	Fish.prototype.toString = function(){
		return this.name + ' (' + this.rarity + ')';
	};
	
	// list of fishes
	var fishData = {
		rare: [
			['honk fish', 250],
			['catfish', 120],
			['rainbow trout', 200],
			['pike', 275],
			['bonito', 300],
			['bluefin tuna', 300],
			['arowana', 375]
		],
		common: [
			['sardine', 12],
			['anchovy', 15],
			['salmon', 25],
			['bass', 50],
			['guppy', 8],
			['trout', 30],
			['smelt', 8],
			['pale chub', 10],
			['dace', 13]
		],
		junk: [
			['old boot', 1],
			['sock', 2],
			['shoe', 3],
			['rock', 0],
			['tin can', 1],
			['tire', 2],
			['DVD case', 3],
			['plastic bag jellyfish', 4],
			['garbage bag', 0]
		],
		nothing: [
			['nothing', 0]
		]
	};
	
	// fish "factory"
	var fishes = {};
	Object.keys(fishData).forEach(function(rarity){
		fishes[rarity] = []; // defines a new property with an array
		for(var i = 0; i < fishData[rarity].length; i++){
			fishes[rarity][i] = new Fish(fishData[rarity][i][0], rarity, fishData[rarity][i][1]);
		}
	});
	
	function getRandomFish(){
    var result = CalculateResult(0, 100) + baitModifier;
		if(result >= 94){
			return fishes.rare[Math.floor(Math.random() * fishes.rare.length)];
		}
		else if(result >= 40)
		{
			return fishes.common[Math.floor(Math.random() * fishes.common.length)];
		}
		else
		{
			return fishes.junk[Math.floor(Math.random() * fishes.junk.length)];
		}
	}
	
	var baitModifier = 0; // gets modified by the buyBait and baitExpiration functions
	
	function castLine(sender){
		
		var successRate = CalculateResult(0, 100) + baitModifier,
			caughtFish = {};
		
		if(successRate >= 35){
			successRate = CalculateResult(0, 100) + baitModifier; // recalculate
			$.say('Something bit the line! ' + sender + ' pulls back on their rod and begins reeling in.');
			if(successRate >= 25){
				caughtFish = getRandomFish();
			}
			else
			{
				$.say($.whisperPrefix(sender) + ' your line snapped.. you lost your catch..');
				caughtFish = fishes.nothing[0];
			}
		}
		else
		{
			$.say('Nothing is biting..');
			caughtFish = fishes.nothing[0];
		}
		return caughtFish;
	}
	
	// helper functions
	function CalculateResult(min, max){ 
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	
	function SortByRarity(a, b){ return a.rarity < b.rarity; }
	
	function fishList(sort){
		var listOfFish = fishes.common.concat(fishes.rare),
			output;
		
		output = listOfFish[0];
		for(var i = 1; i < listOfFish.length-1; i++)
			output += ', ' + listOfFish[i];
		
		output += ', and ' + listOfFish[listOfFish.length - 1];
		
		return output;
	}
	
	function useBait(){
		if(baitModifier != 0){
			$.say('There is already bait in the water. Wait for the effects to wear off first and try again!');
			return;
		}
		else
		{
			baitModifier = 10;
			setTimeout(baitExpiration, 6e5);
		}
	}
	
	function isBaitActive(){
		return baitModifier > 0;
	}
	
	function baitExpiration(){
		baitModifier = 0;
		$.say('The effects of the bait have expired..');
	}
	
	// public functions
	return {
		castLine: castLine,
		useBait: useBait,
		fishList: fishList,
		isBaitActive: isBaitActive
	};
})();