/*
 * dungeonSystem.js
	based off the adventureSystem
 */
var dungeonModule = (function() {
	var dungeons = [],
		currentParty = [],
		monsterList = [],
		jobList = [],
		itemList = [],
		maxPartySize = 4,
		maxNumOfMonsters = 4,
		numOfFights = 0,
		numOfTotalFights = 0,
		partyVictory = false;
		
	// initialize stuff
	initJobs();
	initItems();
	initMonsters();
		
	// enumerator
	var state = {
		idle: 0,
		starting: 1,
		inProgress : 2
	};
		
	var combatDialog = [];
		currentParty.type = 'players',
		currentParty.users = [],
		currentParty.state = 0;
	
	// "class" functions
	function Job(name, HP, ATK, SPD){
		this.name = name;
		this.HP = HP;
		this.ATK = ATK;
		this.SPD = SPD;
	}
	
	function Creature(name, HP, ATK, SPD){
		this.name = name;
		this.HP = HP;
		this.ATK = ATK;
		this.SPD = SPD;
	}
	
	function Weapon(name, HP, ATK, SPD){
		this.name = name;
		this.HP = HP;
		this.ATK = ATK;
		this.SPD = SPD;
	}
	
	function initJobs(){
		jobList = [
			// Name, Health, Attack, Speed
			new Job('Honk Squire', 15, 10, 8),
			new Job('Honk Cleric', 13, 7, 10),
			new Job('Honk Mage', 12, 12, 10),
			new Job('Honk Thief', 14, 6, 15)
		];
	}
	
	function initItems(){
		itemList = [
			new Weapon('Claymore', 2, 6, -2),
			new Weapon('Knife', 0, 2, 2),
			new Weapon('Wand', 0, 3, 0),
			new Weapon('Spiked Club', 1, 4, -1)
		];
	}
	
	// Name, Health, Attack, Speed
	function initMonsters(){
		monsterList = [
			new Creature('Slimemoss', 3, 3, 10)//,
			// new Creature('Omnom', 6, 4, 12)
			// new Creature('Lizardman', 11, 9, 8),
			// new Creature('Wisp', 5, 4, 10),
			// new Creature('Lilith', 6, 6, 10)
			//new Creature('Dragon', 20, 11, 8)
		];
	}
	
	function getMonsters(){
    // populate list of monsters
    var monsters = [],
		maxNumOfMonsters = currentParty.users.length + 1;
		numOfMonsters = Math.random() * (maxNumOfMonsters - 1) + 1;
		
	var name, counts = {};
	
    for(var i = 0; i < numOfMonsters; i++){
      var monster = monsterList[Math.floor(Math.random() * monsterList.length)];
	  
	  // check if monster already exists in list
	  if(exists(monster, monsters)){
		  // recount the number of monsters with the same name
		  monsters.forEach(function(mon){
			  counts[mon.name] = (counts[mon.name] || 0) + 1; 
		  });
		  name = monster.name + ' #' + (counts[monster.name]+1);
	  }
	  else
	  {
		  name = monster.name;
	  }
	  
      monsters.push({
        name: name,
        HP: monster.HP,
		maxHP: monster.HP,
        ATK: monster.ATK,
        SPD: monster.SPD,
        meter: 0,
        isPlayer: false,
      });
    }
    return monsters;
  }
	
	
	/**
	* @function exists
	* @param {string} actor, {objectType} list
	* @returns {boolean}
	*/
	
	function exists(actor, list){
		for(var i = 0; i < list.length; i++)
		{
			if(list[i].name == actor.name){
				return true;
			}
			return false;
		}
	}
	
    /**
     * @function checkUserAlreadyJoined
     * @param {string} username
     * @returns {boolean}
     */
    function checkUserAlreadyJoined(username) {
        for (var i in currentParty.users) {
            if (currentParty.users[i].name == username) {
                return true;
            }
        }
        return false;
    }
	
	function initiateDungeon(sender){
		var joinTime = 30;
		// check if the dungeon hasn't been started yet
		if(currentParty.state == state.idle){
			currentParty.state = state.starting; // change state
			$.say($.whisperPrefix(sender) + 'is trying to form a party to venture into the dungeon. Join the party with !dungeon.');
			
			// start the dungeon on a timer
			setTimeout(startDungeon, joinTime * 1e3);
		}
		else if(currentParty.state == state.inProgress)
		{
			$.say($.whisperPrefix(sender) + 'the current party party has departed. Please try again after they have returned');
			return;
		}
		
		if(checkUserAlreadyJoined(sender)){
			$.say($.whisperPrefix(sender) + 'you already have joined the party!');
			return;
		}
		else
		{
			// join the party
			joinDungeon(sender);
		}	
	}
	
	// main update loop
	function mainUpdateLoop(){
		var t,
		progress = 0;
		
		// initiate the encounter
		startEncounter();
		
		// feed out combat log to chat
		t = setInterval(
		function(){
			if(progress < combatDialog.length)
			{
				$.panelsocketserver.updateDungeon(combatDialog[progress]);
			}
			else
			{
				endDungeon();
				clearInterval(t);
			}
			progress++;
		}, 7e3);
	}
	
	function startDungeon(){
		currentParty.state = state.inProgress; // dungeon in progress
		numOfTotalFights = Math.floor(Math.random() * currentParty.users.length + 1); // set number of fights based on party size+1
		partyVictory = true;
		$.say(currentParty.users.length > 1 ? 'The party sets off into the dungeon...' : 'The adventurer sets off alone into the dungeon..');
		mainUpdateLoop(); // start loop
	}
	
	function endDungeon(){
		var clearMessage = currentParty.users.length > 1 ? getList(currentParty) + ' return' : currentParty.users[0].name +  ' returns';

		if(partyVictory){
			$.panelsocketserver.updateDungeon(clearMessage + ' victorious.');
		}else{
			$.panelsocketserver.updateDungeon(clearMessage + ' wounded and worse for wear.');
		}
		clearDungeon();
	}
	
	function clearDungeon(){
		currentParty = {
        state: state.idle,
        users: [],
		type: 'players'
		};
		
		combatDialog = [];
		
		numOfTotalFights = 0,
			numOfFights = 0;
	}

	function joinDungeon(username){
		var job = jobList[Math.floor(Math.random() * jobList.length)]; // [0, 4)
		
		$.say(username + ' has joined the party as a ' + job.name + '.');
		
		currentParty.users.push({
			name: username,
			job: job.name,
			HP: job.HP,
			maxHP: job.HP,
			ATK: job.ATK,
			SPD: job.SPD,
			meter: 0,
			isPlayer: true
		});
		
		if(!(currentParty.users.length > maxPartySize))
			$.say('There are ' + (maxPartySize - currentParty.users.length) + ' slots left in the party.')
	}
	
	function findTreasure(){
		var playerID = ChooseRandom(currentParty.users),
			itemID = ChooseRandom(itemList);

		var player = currentParty.users[playerID],
			item = itemList[itemID];
			
		if(CalculateResult() >= 95){
			$.say('You find a treasure chest... but it was actually a mimic!');
			$.say(player.name + ' was eaten by the mimic!');
			currentParty.users.splice(playerID, 1); // delete creature if it died
		}
		else
		{
			$.say('You find a treasure chest loaded with goodies! ' + 
				player.name + ' snagged a ' + item.name + ' and equipped it!');
			
			// player equips the item
			player.HP += item.HP; player.maxHP += item.HP;
			player.ATK += item.ATK;
			player.SPD += item.SPD;
		}
	}
	
	function startEncounter(){
		var monsters = getMonsters();
			monsters.type = 'monsters',
			energyThreshold = 100,
			partyVictory = false;

		if(!monsters.length){
			$.say('The monsters are not ready. Please try again');
			return;
		}
		
		if(monsters.length > 1){
			combatDialog.push('A ' + getList(monsters) + ' encroach upon the party!');
		}else{
			combatDialog.push('A ' + getList(monsters) + ' draws near!');
		}
		
		// main combat loop
		do{
			var actors = currentParty.users.concat(monsters);
			actors.sort(SortBySpeed);
			
			for(var i = 0; i < actors.length; i++){
				var actor = actors[i];
				if(actor.HP <= 0) continue;
				
				actor.meter += actor.SPD;
				if(actor.meter > energyThreshold){
					var opponents, opponentIdx, opponent;
					if(actor.isPlayer){
						opponents = monsters;
					}else{
						opponents = currentParty.users;
					}
					if(!opponents.length) break; // no opponents
					opponentIdx = ChooseRandom(opponents); // find random opponent
					opponent = opponents[opponentIdx];
					
					var died = attack(actor, opponent);
					if(died) opponents.splice(opponentIdx, 1);// delete creature if it died
				}
			}
		}while(!hasEncounterEnded(currentParty.users, monsters));
		
		partyVictory = atLeastOneAlive(currentParty.users);
	}
	
	function resetStats(){
		// go through list of players and reset their health to their maximum
		for(player in currentParty.users)
			player.HP = player.maxHP;
	}

	function hasEncounterEnded(thisParty, otherParty){
		if(atLeastOneAlive(thisParty) && atLeastOneAlive(otherParty))
			return false; // something is still alive
		
		return true; // either the entire party died or all the monsters died
	}
	
	function attack(attacker, defender){
		var attackCost = 100,
			maxDamage = Math.floor(attacker.ATK * 1.3);
			minDamage = Math.ceil(attacker.ATK / 4),
			attackDamage = Math.floor(Math.random() * (maxDamage - minDamage) + minDamage),
			attackVerb = getAttackVerb(attacker),
			currentTurn = '';
		
		currentTurn = attacker.name + attackVerb + defender.name + ' for ' + attackDamage + ' points of damage!';
		// modifications
		defender.HP -= attackDamage;
		attacker.meter -= attackCost;
				
		if(defender.HP <= 0)
		{
			currentTurn += ' ' + defender.name + ' was defeated!';
			combatDialog.push(currentTurn);
			return true; // it died
		}
		
		combatDialog.push(currentTurn);
		return false; // it did not die
	}
	
	function getAttackVerb(actor){
		var attackVerb = " hits ";
		if(actor.isPlayer){
			switch(actor.job){
				case "Honk Squire":
					attackVerb = " slashes ";
					break;
				case "Honk Mage":
					attackVerb = " burns ";
					break;
				case "Honk Cleric":
					attackVerb = " smites ";
					break;
				case "Honk Thief":
					attackVerb = " stabs ";
					break;
			}
		}
		return attackVerb;
	}
	
	// helper functions
	function getList(list){
		var output = "";
		
		if(list.type == 'players'){
			output = list.users[0].name;
			for(var i = 1; i < list.users.length-1; i++)
			{
				output += ', ' + list.users[i].name;
			}
			
			output += list.users.length > 2 ? ', and ' : ' and ' + list.users[list.users.length-1].name;
		}
		else if(list.type == 'monsters')
		{
			output = list[0].name;
			if(list.length > 1){
				for(var i = 1; i < list.length-1; i++)
				{
					output += ', ' + list[i].name;
				}
				output += list.length > 2 ? ', and ' : ' and ' + list[list.length-1].name;
			}
		}
		return output;
	}
	
	function SortBySpeed(a, b){ return b.SPD - a.SPD; }
	function CalculateResult(){ return $.randRange(0, 100) }
	function RoundTracker(currentRound, totalRounds){return '(' + (currentRound+1) + '/' + (totalRounds+1) + ')';}
	function ChooseRandom(list){ return (Math.floor(Math.random() * list.length));}
	function atLeastOneAlive(creatures){
	  for(var i = 0; i < creatures.length; i++){
		if(creatures[i].HP > 0) return true;
	  }
	  return false;
	}
	
	// public functions
	return {
		startDungeon: initiateDungeon
	};
})();
