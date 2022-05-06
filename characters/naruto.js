module.exports = {
  name: 'Naruto Uzumaki',
  nickname: 'naruto',
  imgURL: 'https://i.imgur.com/mye5P9i.png',
  maxHealth: 145,
  health: 145,
  energy: 25,
  strength: 25,
  defense: 25,
  speed: 55,
  nineTailsCost: 30,
  abilityMissed: function(enemy,speed){
    if((enemy.speed - speed) > Math.floor(Math.random() * 100)) return true
    return false
  },
  abilities: function(){
    const abilityMissed = this.abilityMissed
    const myself = this;
  return [
    {
      name: 'Kunai',
      cost: 0,
      effect: `${ Math.ceil(myself.strength * (myself.energy/100))}💥`,
      execute(enemy){
        if( abilityMissed(enemy,myself.speed) ) {
          return {status: 'miss'}
        }else{
          const damage = Math.ceil(myself.strength * (myself.energy/100) * ((100-enemy.defense)/100))
          enemy.health -= damage
          return {status:'success',type:'attack', damage}
        }
      }
    },
    {
      name: 'Charge Chakra',
      cost: 0,
      effect: `+${35}⚡ & +${3}💚`,
      execute(){
        let starting_energy = myself.energy
        let starting_health = myself.health
        myself.energy = Math.min(myself.energy + 30,100)
        myself.health = Math.min(myself.health + 3,myself.maxHealth)
        return {status: 'success', type: 'restore', buff: `+${myself.energy-starting_energy}⚡ & +${myself.health-starting_health}💚`}
      }
    },
    {
      name: 'Shadow Clone Assult',
      cost: 30,
      effect: `${ Math.ceil(myself.strength + 15)}💥`,
      execute(enemy){
        myself.energy -= this.cost;
        if( abilityMissed(enemy,myself.speed) ) {
          return {status:'miss'}
        }else{
          const damage = Math.ceil((myself.strength + 15) * ((100-enemy.defense)/100))
          enemy.health -= damage
          return {status:'success',type:'attack', damage}
        }
      }
    },
    {
      name: 'Rasengan',
      cost: 50,
      effect: `${ Math.ceil(myself.strength * 2.6)}💥`,
      execute(enemy){
        myself.energy -= this.cost;
        if( abilityMissed(enemy,myself.speed) ) {
          return {status:'miss'}
        }else{
          const damage = Math.ceil((myself.strength * 2.6) * ((100-enemy.defense)/100))
          enemy.health -= damage
          return {status:'success',type:'attack', damage}
        }
      }
    },
    {
      name: 'Rasenshuriken',
      cost: 55,
      effect: `${ Math.ceil(myself.strength * 3)}💥 & -${15}💨, -${5}🛡 on enemy`,
      execute(enemy){
        myself.energy -= this.cost;
        if( abilityMissed(enemy,myself.speed) ) {
          return {status:'miss'}
        }else{
          let starting_defense = enemy.defense
          enemy.defense = Math.max(enemy.defense - 5,0)

          let starting_speed = enemy.speed
          enemy.speed = Math.max(enemy.speed - 15,0)

          const damage = Math.ceil((myself.strength * 3) * ((100-enemy.defense)/100))
          enemy.health -= damage
          return {status:'success',type:'attack', damage, debuff: `applied ${starting_speed - enemy.speed}💨 & ${starting_defense - enemy.defense}🛡 on ${enemy.name}`}
        }
      }
    },
    {
      name: 'Nine Tails',
      cost: myself.nineTailsCost,
      effect: `+${50}⚡ & x2💚`,
      newImg: 'https://i.imgur.com/9B724Dc.gif',
      execute(){
        myself.energy -= this.cost;
        let starting_energy = myself.energy
        let starting_health = myself.health
        myself.energy = Math.min(myself.energy + 80,100)
        myself.health = Math.min(myself.health*2,myself.maxHealth)
        myself.nineTailsCost = Infinity
        myself.imgURL = this.newImg
        return {status: 'success', type: 'restore', buff: `+${myself.energy-starting_energy}⚡ & +${myself.health-starting_health}💚`}
      }
    },
  ]
  }

}
