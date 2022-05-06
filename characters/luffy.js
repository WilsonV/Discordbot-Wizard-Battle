module.exports = {
  name: 'Monkey D. Luffy',
  nickname: 'luffy',
  imgURL: 'https://i.imgur.com/xHkiULJ.png',
  maxHealth: 130,
  health: 130,
  energy: 35,
  strength: 35,
  defense: 30,
  speed: 40,
  gearSecondCost: 40,
  abilityMissed: function(enemy,speed){
    if((enemy.speed - speed) > Math.floor(Math.random() * 100)) return true
    return false
  },
  abilities: function(){
    const abilityMissed = this.abilityMissed
    const myself = this;
  return [
    {
      name: 'Rubber Rubber Pistol',
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
      name: 'Rest',
      cost: 0,
      effect: `+${18}⚡ & +${15}💚`,
      execute(){
        let starting_energy = myself.energy
        let starting_health = myself.health
        myself.energy = Math.min(myself.energy + 18,100)
        myself.health = Math.min(myself.health + 15,myself.maxHealth)
        return {status: 'success', type: 'restore', buff: `+${myself.energy-starting_energy}⚡ & +${myself.health-starting_health}💚`}
      }
    },
    {
      name: 'Rubber Rubber Bazooka',
      cost: 55,
      effect: `${ Math.ceil(myself.strength*3)}💥`,
      execute(enemy){
        myself.energy -= this.cost;
        if( abilityMissed(enemy,myself.speed) ) {
          return {status:'miss'}
        }else{
          const damage = Math.ceil((myself.strength*3) * ((100-enemy.defense)/100))
          enemy.health -= damage
          return {status:'success',type:'attack', damage}
        }
      }
    },
    {
      name: 'Gum Gum Balloon',
      cost: 35,
      effect: `${30}💥 & +${9}💚`,
      execute(enemy){
        myself.energy -= this.cost;
        if( abilityMissed(enemy,myself.speed) ) {
          return {status:'miss'}
        }else{
          let starting_health = myself.health
          myself.health = Math.min(myself.health + 9,myself.maxHealth)
          const damage = Math.ceil(30 * ((100-enemy.defense)/100))
          enemy.health -= damage
          return {status:'success',type:'attack', damage, buff: `restored +${myself.health-starting_health}💚`}
        }
      }
    },{
      name: 'Gear Second',
      cost: myself.gearSecondCost,
      effect: `+${90}⚡ & -${30}%💚 & +${35}💨`,
      newImg: 'https://i.imgur.com/2iAwxcN.gif',
      execute(){
        myself.energy -= this.cost;
        let starting_energy = myself.energy
        let starting_health = myself.health
        let starting_speed = myself.speed
        myself.energy = Math.min(myself.energy + 90,100)
        myself.health = Math.floor(Math.min(myself.health*.7,myself.maxHealth))
        myself.speed = Math.min(myself.speed + 35,100)
        myself.imgURL = this.newImg
        myself.gearSecondCost = Infinity
        return {status: 'success', type: 'restore', buff: `+${myself.energy-starting_energy}⚡ & ${myself.health-starting_health}💚 & ${myself.speed - starting_speed}💨`}
      }
    },
  ]
  }

}
