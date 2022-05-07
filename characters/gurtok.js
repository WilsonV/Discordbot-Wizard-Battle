const pipIcon = require('../pipIconID')
module.exports = {
  name: 'Gurtok Firebender',
  nickname: 'gurtok',
  imgURL: 'https://i.imgur.com/XloQdIC.png',
  maxHealth: 3000,
  health: 3000,
  pips: 4,
  damage: 55,
  resist: 30,
  accuracy: 75,
  pheonixCost: 0,
  passive: function () {
    this.addPips(1)
    this.damage++
  },
  passiveEffect: `+${1}${pipIcon} & +${1}🗡`,
  abilityMissed: function () {
    if (this.accuracy >= Math.floor(Math.random() * 101)) return false
    return true
  },
  abilities: function () {
    //const abilityMissed = this.abilityMissed
    const myself = this
    return [
      {
        name: 'Blaze',
        cost: 0,
        effect: `${Math.floor(this.damage * this.pips * (1 + (myself.damage / 100)))}💥`,
        execute(enemy) {
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(myself.damage * myself.pips * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)
            return { status: 'success', type: 'attack', damage }
          }

        }
      },
      {
        name: 'Re-Fuel',
        cost: 0,
        effect: `+${2}${pipIcon} & +${150}💚`,
        execute() {
          let pipsGained = myself.addPips(2)
          let healed = myself.heal(150)
          return { status: 'success', type: 'restore', buff: `${healed}💚 & +${pipsGained}${pipIcon}` }
        }
      },
      {
        name: 'Burning Meteor',
        cost: 5,
        effect: `${Math.floor(400 * (1 + (myself.damage / 100)))}💥 & +${5}🗡`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(400 * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)
            myself.damage += 5
            return { status: 'success', type: 'attack', damage, buff: `received +${5}🗡` }
          }
        }
      },
      {
        name: 'Smoking Immolate',
        cost: 7,
        effect: `Take ${Math.floor(300 * (1 + (myself.damage / 100)))}💥 & Deal ${Math.floor(800 * (1 + (myself.damage / 100)))}💥 & -${10}🎯`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let selfDamage = Math.floor(300 * (1 + (myself.damage / 100)))
            selfDamage = myself.takeDamage(selfDamage)

            let damage = Math.floor(800 * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)

            let enemy_starting_accuracy = enemy.accuracy
            enemy.accuracy = Math.max(enemy.accuracy - 10, 0)
            return { status: 'success', type: 'attack', damage, debuff: `You took ${selfDamage}💥 & applied ${enemy.accuracy - enemy_starting_accuracy}🎯 on ${enemy.name}` }
          }
        }
      },
      {
        name: 'Burning Dragon',
        cost: 10,
        effect: `${Math.floor(800 * (1 + (myself.damage / 100)))}💥 & -${5}🛡 & ${10}🗡`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(800 * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)
            myself.damage += 10
            let enemy_starting_resist = enemy.resist
            enemy.resist = Math.max(enemy.resist - 5, 0)
            return { status: 'success', type: 'attack', damage, buff: `received +${10}🗡`, debuff: `applied ${enemy.resist - enemy_starting_resist}🛡 on ${enemy.name}` }
          }
        }
      },
      {
        name: 'Everlasting Pheonix',
        cost: (myself.health <= myself.maxHealth * .05) ? myself.pheonixCost : Infinity,
        effect: `+${50}%💚 & +${3}${pipIcon} (📋💚 < 5%)`,
        execute() {
          let pipsGained = myself.addPips(3)
          let healed = myself.heal(Math.floor(myself.maxHealth * .5))
          myself.pheonixCost = Infinity
          return { status: 'success', type: 'restore', buff: `+${healed}💚 & +${pipsGained}${pipIcon}` }
        }
      }
    ]
  },
  takeDamage: function (damage) {
    damage = Math.floor(damage * (Math.min(Math.max(100 - this.resist, 0), 100) / 100))
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
