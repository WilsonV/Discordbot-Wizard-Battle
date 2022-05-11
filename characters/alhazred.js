const pipIconID = require('../pipIconID')

module.exports = {
  name: 'Alhazred',
  nickname: 'alhazred',
  imgURL: 'https://i.imgur.com/QzDYq3G.png',
  maxHealth: 6500,
  health: 6500,
  pips: 5,
  damage: 50,
  resist: 35,
  accuracy: 103,
  blindJudgementCost: 0,
  fairJudgementCost: 0,
  passive: function () {
    this.addPips(3)
    this.accuracy = Math.max(this.accuracy - 3, 0)
  },
  passiveEffect: `+${3}${pipIconID} & -${3}🎯`,
  abilityMissed: function () {
    if (this.accuracy >= Math.floor(Math.random() * 101)) return false
    return true
  },
  abilities: function () {
    //const abilityMissed = this.abilityMissed
    const myself = this
    return [
      {
        name: 'Burst',
        cost: 0,
        effect: `${Math.floor(60 * myself.pips * (1 + (myself.damage / 100)))}💥`,
        execute(enemy) {
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(60 * myself.pips * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)
            return { status: 'success', type: 'attack', damage }
          }

        }
      },
      {
        name: 'Helping Hand',
        cost: 0,
        effect: `+${3}${pipIconID} & +${100}💚 & +${1}🗡`,
        execute() {
          let pipsGained = myself.addPips(3)
          let healed = myself.heal(100)
          myself.damage++
          return { status: 'success', type: 'restore', buff: `${healed}💚 & +${pipsGained}${pipIconID} & +${1}🗡` }
        }
      },
      {
        name: 'Piercing Hydra',
        cost: 6,
        effect: `${Math.floor(250 * (1 + (myself.damage / 100)))}💥 x3 & -${3}🛡 after each 💥`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let enemy_starting_resist = enemy.resist

            let damage = Math.floor(250 * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)
            enemy.resist = Math.max(enemy.resist - 3, 0)

            let secondDamage = Math.floor(250 * (1 + (myself.damage / 100)))
            secondDamage = enemy.takeDamage(secondDamage)
            enemy.resist = Math.max(enemy.resist - 3, 0)

            let thirdDamage = Math.floor(250 * (1 + (myself.damage / 100)))
            thirdDamage = enemy.takeDamage(thirdDamage)
            enemy.resist = Math.max(enemy.resist - 3, 0)

            return { status: 'success', type: 'attack', damage, secondDamage, thirdDamage, debuff: ` & ${enemy_starting_resist - enemy.resist}🛡 on ${enemy.name}` }
          }
        }
      },
      {
        name: 'Ra',
        cost: 8,
        effect: `${Math.floor(800 * (1 + (myself.damage / 100)))}💥 & -${2}${pipIconID}`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(800 * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)

            let enemy_starting_pips = enemy.pips
            enemy.pips = Math.max(enemy.pips - 2, 0)
            return { status: 'success', type: 'attack', damage, debuff: `-${enemy_starting_pips - enemy.pips}${pipIconID} on ${enemy.name}` }
          }
        }
      },
      {
        name: 'Destructive Nova',
        cost: 11,
        effect: `${Math.floor(1400 * (1 + (myself.damage / 100)))}💥 & reduce enemy 🛡 down to your 🛡`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(1400 * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)

            let enemy_starting_resist = enemy.resist
            enemy.resist = Math.min(myself.resist, enemy.resist)

            return { status: 'success', type: 'attack', damage, debuff: `applied -${enemy_starting_resist - enemy.resist}🛡 on ${enemy.name}` }
          }
        }
      },
      {
        name: 'Fair Judgement',
        cost: myself.fairJudgementCost,
        effect: `Even out all stats between you and the enemy`,
        execute(enemy) {
          //Average stats
          const swapStats = {
            maxHealth: Math.floor((enemy.maxHealth + myself.maxHealth) / 2),
            health: Math.floor((enemy.health + myself.health) / 2),
            pips: Math.floor((enemy.pips + myself.pips) / 2),
            damage: Math.floor((enemy.damage + myself.damage) / 2),
            resist: Math.floor((enemy.resist + myself.resist) / 2),
            accuracy: Math.floor((enemy.accuracy + myself.accuracy) / 2),
          }
          //Give stats to players
          Object.assign(enemy, swapStats)
          Object.assign(myself, swapStats)

          //Limit health to maxHealth
          enemy.health = Math.min(enemy.health, enemy.maxHealth)
          myself.health = Math.min(myself.health, myself.maxHealth)

          myself.blindJudgementCost = Infinity
          myself.fairJudgementCost = Infinity

          return { status: 'success', type: 'buff', buff: `evened out stats with ${enemy.name}` }
        }

      },
      {
        name: 'Blind Judgement',
        cost: myself.blindJudgementCost,
        effect: `Blindly swap all stats with enemy`,
        execute(enemy) {
          const swapStats = {
            maxHealth: (Math.random() < 0.5),
            health: (Math.random() < 0.5),
            pips: (Math.random() < 0.5),
            damage: (Math.random() < 0.5),
            resist: (Math.random() < 0.5),
            accuracy: (Math.random() < 0.5)
          }

          if (swapStats.maxHealth) [enemy.maxHealth, myself.maxHealth] = [myself.maxHealth, enemy.maxHealth]
          if (swapStats.health) [enemy.health, myself.health] = [myself.health, enemy.health]
          if (swapStats.pips) [enemy.pips, myself.pips] = [myself.pips, enemy.pips]
          if (swapStats.damage) [enemy.damage, myself.damage] = [myself.damage, enemy.damage]
          if (swapStats.resist) [enemy.resist, myself.resist] = [myself.resist, enemy.resist]
          if (swapStats.accuracy) [enemy.accuracy, myself.accuracy] = [myself.accuracy, enemy.accuracy]

          //Limit health to maxHealth
          enemy.health = Math.min(enemy.health, enemy.maxHealth)
          myself.health = Math.min(myself.health, myself.maxHealth)
          myself.blindJudgementCost = Infinity
          myself.fairJudgementCost = Infinity

          return { status: 'success', type: 'buff', buff: `swapped ${swapStats.maxHealth ? `💖,` : ''}${swapStats.health ? `💚,` : ''}${swapStats.pips ? `${pipIconID},` : ''}${swapStats.damage ? `🗡,` : ''}${swapStats.resist ? `🛡,` : ''}${swapStats.accuracy ? `🎯,` : ''}` }
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
