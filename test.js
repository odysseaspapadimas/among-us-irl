let players = [{"name": 'ez', 'lol': 0}, {"name": 'lol', 'lol': 1}];

console.log(players[0].name);

let me = players.filter(player => {
    return player.name == 'ez';
})

console.log(me)