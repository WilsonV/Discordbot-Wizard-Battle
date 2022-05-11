const pipIcon = require('../pipIconID')
module.exports = {
  name: 'Zeus Sky Father',
  nickname: 'zeus',
  imgURL: 'https://i.imgur.com/ePHDibK.png',
  maxHealth: 3100,
  health: 3100,
  pips: 5,
  damage: 55,
  resist: 30,
  accuracy: 80,
  extraTurn: 0,
  shatterCost: 4,
  passive: function () {
    this.damage++
    //remove extra turns
    if (this.extraTurn > 0) this.extraTurn--

  },
  passiveEffect: `+${1}🗡`,
  abilityMissed: function () {
    if (this.accuracy >= Math.floor(Math.random() * 101)) return false
    return true
  },
  abilities: function () {
    //const abilityMissed = this.abilityMissed
    const myself = this
    return [
      {
        name: 'Shattering Blitz',
        cost: 0,
        effect: `${Math.floor(65 * myself.pips * (1 + (myself.damage / 100)))}💥 & -${1}🛡`,
        execute(enemy) {
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(65 * myself.pips * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)
            let enemy_starting_resist = enemy.resist
            enemy.resist = Math.max(enemy.resist - 1, 0)
            return { status: 'success', type: 'attack', damage, debuff: `applied -${enemy_starting_resist - enemy.resist}🛡 on ${enemy.name}` }
          }

        }
      },
      {
        name: 'Legendary Buff',
        cost: 0,
        effect: `+${5}${pipIcon} & +${50}💚 & +${1}🗡`,
        execute() {
          let pipsGained = myself.addPips(5)
          let healed = myself.heal(50)
          myself.damage++
          return { status: 'success', type: 'restore', buff: `${healed}💚 & +${pipsGained}${pipIcon} & +${1}🗡` }
        }
      },
      {
        name: 'Minotaur',
        cost: 6,
        effect: `${Math.floor(50 * (1 + (myself.damage / 100)))}💥 & +${5}🗡 Then ${Math.floor(400 * (1 + (myself.damage / 100)))}💥`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(50 * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)
            myself.damage += 5
            let secondDamage = Math.floor(400 * (1 + (myself.damage / 100)))
            secondDamage = enemy.takeDamage(secondDamage)

            return { status: 'success', type: 'attack', damage, secondDamage, buff: `received +${5}🗡` }
          }
        }
      },
      {
        name: 'Piercing Orthrus',
        cost: 8,
        effect: `${Math.floor(200 * (1 + (myself.damage / 100)))}💥 & -${10}🛡 Then ${Math.floor(700 * (1 + (myself.damage / 100)))}💥`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(200 * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)

            let enemy_starting_resist = enemy.resist
            enemy.resist = Math.max(enemy.resist - 10, 0)

            let secondDamage = Math.floor(700 * (1 + (myself.damage / 100)))
            secondDamage = enemy.takeDamage(secondDamage)

            return { status: 'success', type: 'attack', damage, secondDamage, debuff: `applied -${enemy_starting_resist - enemy.resist}🛡 on ${enemy.name}` }
          }
        }
      },
      {
        name: 'Fearful Medusa',
        cost: 11,
        effect: `${Math.floor(1100 * (1 + (myself.damage / 100)))}💥 & -${10}🗡, gain ${2}🕑`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(1100 * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)

            let enemy_starting_damage = enemy.damage
            enemy.damage = Math.max(enemy.damage - 10, 0)

            myself.extraTurn += 2

            return { status: 'success', type: 'attack', damage, buff: `received +${2}🕑`, debuff: `applied -${enemy_starting_damage - enemy.damage}🗡 on ${enemy.name}` }
          }
        }
      },
      {
        name: 'Shatter',
        cost: myself.shatterCost,
        effect: `Reduce enemies 🛡 to 0`,
        execute(enemy) {
          let enemy_starting_resist = enemy.resist
          enemy.resist = 0
          myself.shatterCost = Infinity
          return { status: 'success', type: 'debuff', debuff: `-${enemy_starting_resist - enemy.resist}🛡` }
        }
      }
    ]
  },
  takeDamage: function (damage, ignoreResist = false) {
    if (ignoreResist) {
      damage = Math.floor(damage)
    } else {
      damage = Math.floor(damage * (Math.min(Math.max(100 - this.resist, 0), 100) / 100))
    }
    this.health = Math.max(this.health - damage, 0)
    return damage
  },
  addPips: function (amount = 1) {
    let starting_pips = this.pips
    amount = Math.abs(amount)
    this.pips = Math.min(this.pips + amount, 14)
    return this.pips - starting_pips
  },
  heal: function (amount = 0) {
    let starting_health = this.health
    amount = Math.abs(amount)
    this.health = Math.min(this.health + amount, this.maxHealth)
    return this.health - starting_health
  }

}
