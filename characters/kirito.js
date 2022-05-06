module.exports = {
  name: 'Kirito',
  nickname: 'kirito',
  imgURL: 'https://i.imgur.com/dJROQrP.jpg',
  maxHealth: 100,
  health: 100,
  energy: 35,
  strength: 33,
  defense: 20,
  speed: 55,
  dualWieldActive: false,
  dualWieldCost: 50,
  plotArmorBoostActive: false,
  plotArmorBoostCost: 40,
  abilityMissed: function (enemy, speed) {
    if ((enemy.speed - speed) > Math.floor(Math.random() * 100)) return true
    return false
  },
  abilities: function () {
    const abilityMissed = this.abilityMissed
    const myself = this;
    return [

      {
        name: 'Swift Strike',
        cost: 0,
        effect: `${Math.ceil(myself.strength * (myself.energy / 100))}💥 ${myself.dualWieldActive? `& ${Math.ceil(myself.strength * (myself.energy / 100))}💥` : ``}`,
        execute(enemy) {
          if (abilityMissed(enemy, myself.speed)) {
            return { status: 'miss' }
          } else {
            let secondDamage;
            const damage = Math.ceil(myself.strength * (myself.energy / 100) * ((100 - enemy.defense) / 100))
            enemy.health = Math.floor(Math.max(enemy.health - damage,0))
            if (myself.dualWieldActive){
              secondDamage = damage
              enemy.health = Math.floor(Math.max(enemy.health - secondDamage,0)) //Do damage twice for dual wield
            }
            return { status: 'success', type: 'attack', damage, secondDamage }
          }
        }
      },
      {
        name: 'Regen Potion',
        cost: 0,
        effect: `+${25+(myself.plotArmorBoostActive?15:0)}⚡ & +${10}💚`,
        execute() {
          let starting_energy = myself.energy
          let starting_health = myself.health
          myself.energy = Math.min(myself.energy + 25 +(myself.plotArmorBoostActive?15:0), 100)
          myself.health = Math.min(myself.health + 10, myself.maxHealth)
          return { status: 'success', type: 'restore', buff: `+${myself.energy - starting_energy}⚡ & +${myself.health - starting_health}💚` }
        }
      },
      {
        name: 'Piercing Leap',
        cost: 25,
        effect: `${25}💥 ${myself.dualWieldActive? `& ${25}💥` : ``} (Ignores 🛡)`,
        execute(enemy) {
          myself.energy -= this.cost;
          if (abilityMissed(enemy, myself.speed)) {
            return { status: 'miss' }
          } else {
            let secondDamage
            const damage = 25
            enemy.health = Math.floor(Math.max(enemy.health - damage, 0))
            if (myself.dualWieldActive) {
              secondDamage = damage
              enemy.health = Math.floor(Math.max(enemy.health - secondDamage, 0)) //Do damage twice for dual wield
            }
            return { status: 'success', type: 'attack', damage, secondDamage }
          }
        }
      },
      {
        name: 'Meteor Break',
        cost: 35,
        effect: `${myself.strength}💥 ${myself.dualWieldActive? `& ${myself.strength}💥` : ``} & -${5}🛡 on Enemy`,
        execute(enemy) {
          myself.energy -= this.cost;
          let secondDamage;
          let enemy_starting_defense = enemy.defense
          const damage = Math.ceil(myself.strength * ((100 - enemy.defense) / 100))
          enemy.health = Math.floor(Math.max(enemy.health - damage, 0))
          if (myself.dualWieldActive){
            secondDamage = damage
            enemy.health = Math.floor(Math.max(enemy.health - secondDamage, 0))//Do damage twice for dual wield
          }
          enemy.defense = Math.max(enemy.defense - 5, 0)
          return { status: 'success', type: 'attack', damage, secondDamage, debuff: `applied ${enemy.defense - enemy_starting_defense}🛡 on ${enemy.name}` }
        }
      },
      {
        name: 'Plot Armor Boost',
        cost: myself.plotArmorBoostCost,
        effect: `+${20}💚 now & +${15}⚡ on all 'Regen Potion'`,
        execute() {
          myself.energy -= this.cost;
          let starting_health = myself.health
          myself.health = Math.min(myself.health + 20, myself.maxHealth)
          myself.plotArmorBoostCost = Infinity
          myself.plotArmorBoostActive = true
          return { status: 'success', type: 'restore', buff: `+${15}⚡ on all 'Regen Potion' & +${myself.health - starting_health}💚` }
        }
      },
      {
        name: 'Dual Wield',
        cost: myself.dualWieldCost,
        effect: `All 💥 hit twice & -${10}💨 & +${50}⚡`,
        newImg: 'https://i.imgur.com/7282IaU.png',
        execute() {
          myself.energy -= this.cost;
          let starting_speed = myself.speed
          myself.speed = Math.max(myself.speed - 10, 0)
          myself.dualWieldActive = true
          myself.dualWieldCost = Infinity
          myself.imgURL = this.newImg
          myself.energy += 50
          return { status: 'success', type: 'restore', buff: `+${50}⚡ & Double 💥 & ${myself.speed - starting_speed}💨` }
        }
      },
    ]
  }

}
