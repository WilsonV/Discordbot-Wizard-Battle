module.exports = {
  name: 'Gojo Satoru',
  nickname: 'gojo',
  imgURL: 'https://i.imgur.com/1W6uRmD.jpg',
  maxHealth: 120,
  health: 120,
  energy: 45,
  strength: 25,
  defense: 20,
  speed: 40,
  sixEyesCost: 0,
  infinityCost: 0,
  unlimitedVoidCost: 0,
  abilityMissed: function (enemy, speed) {
    if ((enemy.speed - speed) > Math.floor(Math.random() * 100)) return true
    return false
  },
  abilities: function () {
    const abilityMissed = this.abilityMissed
    const myself = this;
    return [

      {
        name: 'Swift Attack',
        cost: 0,
        effect: `${Math.ceil(myself.strength * (myself.energy / 100))}💥`,
        execute(enemy) {
          if (abilityMissed(enemy, myself.speed)) {
            return { status: 'miss' }
          } else {
            const damage = Math.ceil(myself.strength * (myself.energy / 100) * ((100 - enemy.defense) / 100))
            enemy.health -= damage
            return { status: 'success', type: 'attack', damage }
          }
        }
      },
      {
        name: 'Rest',
        cost: 0,
        effect: `+${22}⚡ & +${8}💚`,
        execute() {
          let starting_energy = myself.energy
          let starting_health = myself.health
          myself.energy = Math.min(myself.energy + 22, 100)
          myself.health = Math.min(myself.health + 8, myself.maxHealth)
          return { status: 'success', type: 'restore', buff: `+${myself.energy - starting_energy}⚡ & +${myself.health - starting_health}💚` }
        }
      },
      {
        name: 'Unlimited Void',
        cost: myself.unlimitedVoidCost,
        effect: `-${100}⚡ on Enemy`,
        execute(enemy) {
          myself.energy -= this.cost;
          if (abilityMissed(enemy, myself.speed)) {
            return { status: 'miss' }
          } else {
            let starting_energy = enemy.energy
            enemy.energy = Math.floor(Math.max(enemy.energy - 100, 0))
            myself.unlimitedVoidCost = Infinity
            return { status: 'success', type: 'debuff', debuff: `${enemy.energy - starting_energy}⚡` }
          }
        }
      },
      {
        name: 'Inifity',
        cost: myself.infinityCost,
        effect: `-${100}%💨 on Enemy`,
        execute(enemy) {
          myself.energy -= this.cost;
          let starting_speed = enemy.speed
          enemy.speed = 0
          myself.infinityCost = Infinity
          return { status: 'success', type: 'debuff', debuff: `${enemy.speed - starting_speed}💨` }
        }
      },
      {
        name: 'Six Eyes',
        cost: myself.sixEyesCost,
        effect: `+${100}⚡`,
        newImg: 'https://i.imgur.com/6sVNbgL.gif',
        execute() {
          myself.energy -= this.cost;
          let starting_energy = myself.energy
          myself.energy = Math.min(myself.energy + 100, 100)
          myself.sixEyesCost = Infinity
          myself.imgURL = this.newImg
          return { status: 'success', type: 'restore', buff: `+${myself.energy - starting_energy}⚡` }
        }
      },
      {
        name: 'Maximum Cursed Energy Output',
        cost: 100,
        effect: `${ Math.ceil(myself.strength*5)}💥`,
        execute(enemy){
          myself.energy -= this.cost;
          if( abilityMissed(enemy,myself.speed) ) {
            return {status:'miss'}
          }else{
            const damage = Math.ceil((myself.strength*5) * ((100-enemy.defense)/100))
            enemy.health -= damage
            return {status:'success',type:'attack', damage}
          }
        }
      }
    ]
  }

}
