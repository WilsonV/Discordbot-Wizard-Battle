const pipIcon = require('../pipIconID')
module.exports = {
  name: 'Lydia Greyrose',
  nickname: 'lydia',
  imgURL: 'https://i.imgur.com/LUGZvy7.jpg',
  maxHealth: 4500,
  health: 4500,
  pips: 6,
  damage: 25,
  resist: 40,
  accuracy: 80,
  frozenGiantBoost: { active: false, turnsLeft: 0, resist: 0 },
  iceAgeCost: 0,
  passive: function () {
    this.health = Math.min(this.health + 100, this.maxHealth)

    if (this.resist < 70) {
      this.resist = Math.min(this.resist + 1, 100)
    }

    if (this.frozenGiantBoost.active) {
      this.frozenGiantBoost.turnsLeft--

      if (this.frozenGiantBoost.turnsLeft <= 0) {
        this.frozenGiantBoost.active = false
        this.frozenGiantBoost.turnsLeft = 0

        this.resist = Math.max(this.resist - this.frozenGiantBoost.resist, 0)
      }
    }
  },
  passiveEffect: `+${100}💚 & +${1}🛡 (up to 70🛡)`,
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
        name: 'Cool Down',
        cost: 0,
        effect: `+${2}${pipIcon} & +${100}💖 & +${300}💚`,
        execute() {
          let pipsGained = myself.addPips(2)
          let healed = myself.heal(300)
          myself.maxHealth += 100
          return { status: 'success', type: 'restore', buff: `${healed}💚 & +${pipsGained}${pipIcon} & +${100}💖` }
        }
      },
      {
        name: 'Frozen Wyvern',
        cost: 5,
        effect: `${Math.floor(350 * (1 + (myself.damage / 100)))}💥 & +${2}🗡 & +${2}🛡`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(400 * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)
            myself.damage += 2
            let starting_resist = myself.resist
            myself.resist = Math.min(myself.resist + 2, 100)
            return { status: 'success', type: 'attack', damage, buff: `received +${2}🗡 & +${myself.resist - starting_resist}🛡` }
          }
        }
      },
      {
        name: 'Thieving Colossus',
        cost: 7,
        effect: `${Math.floor(700 * (1 + (myself.damage / 100)))}💥 & Steal ${5}🛡`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(700 * (1 + (myself.damage / 100)))
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
        effect: `${Math.floor(1000 * (1 + (myself.damage / 100)))}💥 & +${500}💖 & +${30}🛡 for 3🕑`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(1000 * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)

            myself.maxHealth += 500

            let starting_resist = myself.resist
            myself.resist = Math.min(myself.resist + 30, 100)

            myself.frozenGiantBoost = { active: true, turnsLeft: 3, resist: myself.resist - starting_resist }
            return { status: 'success', type: 'attack', damage, buff: `received ${500}💖 & +${myself.frozenGiantBoost.resist}🛡 for 3🕑` }
          }
        }
      },
      {
        name: 'Ice Age',
        cost: myself.iceAgeCost,
        effect: `convert ${50}%🛡 -> 🗡, +${500}💖 & +${800}💚`,
        execute() {

          let deduct = Math.floor(myself.resist / 2)

          myself.resist -= deduct
          myself.damage += deduct

          myself.maxHealth += 500
          let healed = myself.heal(800)
          myself.iceAgeCost = Infinity
          return { status: 'success', type: 'restore', buff: `+${500}💖 & +${healed}💚 & -${deduct}🛡 & +${deduct}🗡` }
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
