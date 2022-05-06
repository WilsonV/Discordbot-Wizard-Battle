module.exports = {
  name: 'Levi Ackerman',
  nickname: 'levi',
  imgURL: 'https://i.imgur.com/8ovTZ5k.png',
  maxHealth: 160,
  health: 160,
  energy: 50,
  strength: 45,
  defense: 20,
  speed: 30,
  abilityMissed: function(enemy,speed){
    if((enemy.speed - speed) > Math.floor(Math.random() * 100)) return true
    return false
  },
  abilities: function(){
    const abilityMissed = this.abilityMissed
    const myself = this
  return [
    {
      name: 'Slash',
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
      effect: `+${25}⚡ & +${4}💚`,
      execute(){
        let starting_energy = myself.energy
        let starting_health = myself.health
        myself.energy = Math.min(myself.energy + 25,100)
        myself.health = Math.min(myself.health + 4,myself.maxHealth)
        return {status: 'success', type: 'restore', buff: `+${myself.energy-starting_energy}⚡ & +${myself.health-starting_health}💚`}
      }
    },
    {
      name: 'Double Spin Slash',
      cost: 35,
      effect: `${ Math.ceil(myself.strength)}💥`,
      execute(enemy){
        myself.energy -= this.cost;
        if( abilityMissed(enemy,myself.speed) ) {
          return {status:'miss'}
        }else{
          const damage = Math.ceil(myself.strength * ((100-enemy.defense)/100))
          enemy.health -= damage
          return {status:'success',type:'attack', damage}
        }
      }
    },
    {
      name: 'Thunder Spear',
      cost: 60,
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
      name: 'Twin Bey-Blade',
      cost: 100,
      effect: `${ Math.ceil(myself.strength*3)}💥 & +${35}⚡ & +${30}💨`,
      execute(enemy){
        myself.energy -= this.cost;
        if( abilityMissed(enemy,myself.speed) ) {
          return {status:'miss'}
        }else{
          let starting_speed = myself.speed
          const damage = Math.ceil((myself.strength*3) * ((100-enemy.defense)/100))
          enemy.health -= damage
          myself.energy += 35
          myself.speed = Math.min(myself.speed + 30,100)
          return {status:'success',type:'attack', damage, buff:`restored +${35}⚡ & Gained +${myself.speed - starting_speed}💨`}
        }
      }
    }
  ]
  }

}
