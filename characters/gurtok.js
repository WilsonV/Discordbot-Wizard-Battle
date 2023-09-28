const helpfulFunctions = require('./Util/helpfulFunctions')
const pipIcon = require('../pipIconID')
//Pheonix more accessible

module.exports = {
  name: 'Gurtok Firebender',
  nickname: 'gurtok',
  imgURL: './Images/gurtok/gurtok.png',
  maxHealth: 5800,
  health: 5800,
  pips: 2,
  damage: 65,
  resist: 30,
  accuracy: 75,
  healBoost: 0,
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
        cost: 1,
        effect: `${Math.floor(38 * myself.pips * (1 + (myself.damage / 100)))}💥`,
        execute(enemy) {
          let pips = myself.pips
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(38 * pips * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)
            return { status: 'success', type: 'attack', damage }
          }

        }
      },
      {
        name: 'Re-Fuel',
        cost: 0,
        effect: `+${4}${pipIcon} & +${150}💚`,
        execute() {
          let pipsGained = myself.addPips(4)
          let healed = myself.heal(150)
          return { status: 'success', type: 'restore', buff: `${healed}💚 & +${pipsGained}${pipIcon}` }
        }
      },
      {
        name: 'Burning Meteor',
        cost: 5,
        effect: `${Math.floor(750 * (1 + (myself.damage / 100)))}💥 & +${5}🗡`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(750 * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)
            myself.damage += 5
            return { status: 'success', type: 'attack', damage, buff: `received +${5}🗡` }
          }
        }
      },
      {
        name: 'Smoking Immolate',
        cost: 7,
        effect: `Take ${Math.floor(300 * (1 + (myself.damage / 100)))}💥 & Deal ${Math.floor(950 * (1 + (myself.damage / 100)))}💥 & -${5}🎯`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let selfDamage = Math.floor(300 * (1 + (myself.damage / 100)))
            selfDamage = myself.takeDamage(selfDamage)

            let damage = Math.floor(950 * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)

            let enemy_starting_accuracy = enemy.accuracy
            enemy.accuracy = Math.max(enemy.accuracy - 5, 0)
            return { status: 'success', type: 'attack', damage, debuff: `You took ${selfDamage}💥 & applied ${enemy.accuracy - enemy_starting_accuracy}🎯 on ${enemy.name}` }
          }
        }
      },
      {
        name: 'Burning Dragon',
        cost: 10,
        effect: `${Math.floor(1000 * (1 + (myself.damage / 100)))}💥 & -${25}🛡 & +${20}🗡`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(1000 * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)
            myself.damage += 20
            let enemy_starting_resist = enemy.resist
            enemy.resist = Math.max(enemy.resist - 25, 0)
            return { status: 'success', type: 'attack', damage, buff: `received +${10}🗡`, debuff: `applied ${enemy.resist - enemy_starting_resist}🛡 on ${enemy.name}` }
          }
        }
      },
      {
        name: 'Everlasting Pheonix',
        cost: (myself.health <= myself.maxHealth * .2) ? myself.pheonixCost : Infinity,
        effect: `+${50}%💚 & +${8}${pipIcon} & +${50}🗡 (📋💚 < 20%)`,
        execute() {
          let pipsGained = myself.addPips(8)
          let healed = myself.heal(Math.floor(myself.maxHealth * .5))
          myself.pheonixCost = Infinity
          return { status: 'success', type: 'restore', buff: `+${healed}💚 & +${pipsGained}${pipIcon}` }
        }
      }
    ]
  },
  ...helpfulFunctions

}
