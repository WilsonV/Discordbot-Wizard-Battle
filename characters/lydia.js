const helpfulFunctions = require('./Util/helpfulFunctions')
const pipIconID = require('../pipIconID')

module.exports = {
  name: 'Lydia Greyrose',
  nickname: 'lydia',
  imgURL: './Images/lydia/lydia.jpg',
  maxHealth: 7000,
  health: 7000,
  pips: 6,
  damage: 30,
  resist: 30,
  accuracy: 80,
  healBoost: 0,
  frozenGiantBoost: { active: false, turnsLeft: 0, resist: 0 },
  iceAgeCost: 7,
  passive: function () {
    this.heal(50)

    if (this.resist < 60) {
      this.resist = Math.min(this.resist + 2, 100)
    }

    if (this.frozenGiantBoost.active) {
      this.frozenGiantBoost.turnsLeft--

      if (this.frozenGiantBoost.turnsLeft <= 0) {
        this.frozenGiantBoost.active = false
        this.frozenGiantBoost.turnsLeft = 0

        this.resist = Math.max(this.resist - this.frozenGiantBoost.resist, 0)
        return `You've lost ${this.frozenGiantBoost.resist}🛡`
      }
    }
  },
  passiveEffect: `+${50}💚 & +${2}🛡 (up to 60🛡)`,
  abilityMissed: function () {
    if (this.accuracy >= Math.floor(Math.random() * 101)) return false
    return true
  },
  abilities: function () {
    const abilityMissed = this.abilityMissed
    const myself = this
    return [
      {
        name: 'Snowburst',
        cost: 1,
        effect: `${Math.floor(25 * myself.pips * (1 + (myself.damage / 100)))}💥`,
        execute(enemy) {
          let pips = myself.pips
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(25 * pips * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)
            return { status: 'success', type: 'attack', damage }
          }

        }
      },
      {
        name: 'Cool Down',
        cost: 0,
        effect: `+${3}${pipIconID} & +${50}💖 & +${100}💚`,
        execute() {
          let pipsGained = myself.addPips(3)
          let healed = myself.heal(100)
          myself.maxHealth += 50
          return { status: 'success', type: 'restore', buff: `${healed}💚 & +${pipsGained}${pipIconID} & +${50}💖` }
        }
      },
      {
        name: 'Frozen Wyvern',
        cost: 5,
        effect: `${Math.floor(550 * (1 + (myself.damage / 100)))}💥 & +${3}🗡 & +${1}🛡`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(550 * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)
            myself.damage += 3
            let starting_resist = myself.resist
            myself.resist = Math.min(myself.resist + 1, 100)
            return { status: 'success', type: 'attack', damage, buff: `received +${2}🗡 & +${myself.resist - starting_resist}🛡` }
          }
        }
      },
      {
        name: 'Thieving Colossus',
        cost: 7,
        effect: `${Math.floor(800 * (1 + (myself.damage / 100)))}💥 & Steal ${5}🛡`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(800 * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)

            let enemy_starting_resist = enemy.resist
            let starting_resist = myself.resist
            enemy.resist = Math.max(enemy.resist - 5, 0)
            myself.resist = Math.min(myself.resist + (enemy_starting_resist - enemy.resist), 100)
            return { status: 'success', type: 'attack', damage, debuff: `stole ${enemy_starting_resist - enemy.resist}🛡 from ${enemy.name} and gained ${myself.resist - starting_resist}🛡` }
          }
        }
      },
      {
        name: 'Frozen Ice Giant',
        cost: 10,
        effect: `${Math.floor(1200 * (1 + (myself.damage / 100)))}💥 & +${200}💖 & +${30}🛡 for 2🕑`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(1200 * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)

            myself.maxHealth += 200

            let starting_resist = myself.resist
            myself.resist = Math.min(myself.resist + 30, 100)

            myself.frozenGiantBoost = { active: true, turnsLeft: 2, resist: myself.resist - starting_resist }
            return { status: 'success', type: 'attack', damage, buff: `received ${200}💖 & +${myself.frozenGiantBoost.resist}🛡 for 2🕑` }
          }
        }
      },
      {
        name: 'Thaw',
        cost: myself.iceAgeCost,
        effect: `convert all 🛡 -> 🗡, +${10}${pipIconID}`,
        execute() {

          let deduct = myself.resist

          myself.resist = 0
          myself.damage += deduct

          let pipsGained = myself.addPips(10)

          myself.iceAgeCost = Infinity
          return { status: 'success', type: 'restore', buff: `+${pipsGained}${pipIconID} & -${deduct}🛡 & +${deduct}🗡` }
        }
      }
    ]
  },
  ...helpfulFunctions

}
