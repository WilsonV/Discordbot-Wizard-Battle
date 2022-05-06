module.exports = {
  name: 'Goku',
  nickname: 'goku',
  imgURL: 'https://i.imgur.com/5ADvBr9.png',
  maxHealth: 120,
  health: 120,
  energy: 35,
  strength: 35,
  defense: 35,
  speed: 50,
  ssjCost: 60,
  UICost: 100,
  abilityMissed: function(enemy,speed){
    if((enemy.speed - speed) > Math.floor(Math.random() * 100)) return true
    return false
  },
  abilities: function(){
    const abilityMissed = this.abilityMissed
    const myself = this;
  return [

    {
      name: 'Ki Blast',
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
      name: 'Power Up',
      cost: 0,
      effect: `+${25}⚡ & +${2}💚`,
      execute(){
        let starting_energy = myself.energy
        let starting_health = myself.health
        myself.energy = Math.min(myself.energy + 30,100)
        myself.health = Math.min(myself.health + 2,myself.maxHealth)
        return {status: 'success', type: 'restore', buff: `+${myself.energy-starting_energy}⚡ & +${myself.health-starting_health}💚`}
      }
    },
    {
      name: 'Kamehameha',
      cost: 45,
      effect: `${ Math.ceil(myself.strength*2)}💥`,
      execute(enemy){
        myself.energy -= this.cost;
        if( abilityMissed(enemy,myself.speed) ) {
          return {status:'miss'}
        }else{
          const damage = Math.ceil((myself.strength*2) * ((100-enemy.defense)/100))
          enemy.health -= damage
          return {status:'success',type:'attack', damage}
        }
      }
    },
    {
      name: 'Super Sayain',
      cost: myself.ssjCost,
      effect: `+${20}🤜 & +${65}⚡`,
      newImg:'https://i.imgur.com/jBjCMz2.gif',
      execute(){
        myself.energy -= this.cost;
        let starting_energy = myself.energy
        let starting_strength = myself.strength
        myself.energy = Math.min(myself.energy + 65,100)
        myself.strength = myself.strength + 20
        myself.ssjCost = Infinity
        myself.imgURL = this.newImg
        return {status: 'success', type: 'restore', buff: `+${myself.energy-starting_energy}⚡ & +${myself.strength-starting_strength}🤜`}
      }
    },{
      name: 'Ultra Instinct',
      cost: myself.UICost,
      effect: `+${50}💨 & +${60}⚡`,
      newImg:'https://i.imgur.com/cL9vdLK.gif',
      execute(){
        myself.energy -= this.cost;
        let starting_energy = myself.energy
        let starting_speed = myself.speed
        myself.energy = Math.min(myself.energy + 60,100)
        myself.speed = myself.speed + 50
        myself.UICost = Infinity
        myself.ssjCost = Infinity
        myself.imgURL = this.newImg
        return {status: 'success', type: 'restore', buff: `+${myself.energy-starting_energy}⚡ & +${myself.speed-starting_speed}💨`}
      }
    },
  ]
  }

}
