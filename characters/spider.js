const pipIconID = require('../pipIconID')
module.exports = {
  name: 'Grandfather Spider',
  nickname: 'spider',
  imgURL: 'https://i.imgur.com/2nUwJXf.png',
  maxHealth: 3800,
  health: 3800,
  pips: 1,
  damage: 60,
  resist: 30,
  accuracy: 75,
  extraTurn: 0,
  calmBeforeStorm: { cost: 0, active: false, turnsLeft: 0, damage: 0, resist: 0 },
  enfeeble: { playable: true, cost: 0 },
  spinTheWheel: { cost: 0, turnsToActive: 0 },
  passive: function (enemy) {

    //do damage
    let damage = enemy.takeDamage(Math.floor(100 * this.damage))

    if (this.spinTheWheel.turnsToActive > 0) {
      this.spinTheWheel.turnsToActive--

      if (this.spinTheWheel.turnsToActive === 0) {
        this.spinTheWheel.cost = 0
      }
    }

    return `You've hit ${enemy.name} for ${damage}💥`
  },
  passiveEffect: `Hit enemy for ${Math.floor(100 * this.damage)}💥`,
  abilityMissed: function () {
    if (this.accuracy >= Math.floor(Math.random() * 101)) return false
    return true
  },
  abilities: function () {
    //const abilityMissed = this.abilityMissed
    const myself = this
    return [
      {
        name: 'Dark Siphon',
        cost: 0,
        effect: `${Math.floor(70 * myself.pips * (1 + (myself.damage / 100)))}💥 & Steal ${2}🗡`,
        execute(enemy) {
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(70 * myself.pips * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)

            let enemy_starting_damage = enemy.damage
            let starting_damage = myself.damage
            enemy.damage = Math.max(enemy.damage - 2, 0)
            myself.damage += (enemy_starting_damage - enemy.damage)

            return { status: 'success', type: 'attack', damage, debuff: `stole ${enemy_starting_damage - enemy.damage}🗡 from ${enemy.name} and gained ${myself.damage - starting_damage}🗡` }
          }

        }
      },
      {
        name: 'Shadow Deal',
        cost: 0,
        effect: `+${6}${pipIconID} & -${200}💚`,
        execute() {
          let pipsGained = myself.addPips(6)
          myself.health -= 200

          return { status: 'success', type: 'buff', buff: `gained ${amount}${rndBuff} & lost ${200}💚` }
        }
      },
      {
        name: 'Shadow Hydra',
        cost: 6,
        effect: `${Math.floor(300 * (1 + (myself.damage / 100)))}💥 x3 & +${3}🗡 after each 💥`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {

            let damage = Math.floor(300 * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)
            myself.damage += 3

            let secondDamage = Math.floor(300 * (1 + (myself.damage / 100)))
            secondDamage = enemy.takeDamage(secondDamage)
            myself.damage += 3

            let thirdDamage = Math.floor(300 * (1 + (myself.damage / 100)))
            thirdDamage = enemy.takeDamage(thirdDamage)
            myself.damage += 3

            return { status: 'success', type: 'attack', damage, secondDamage, thirdDamage, buff: ` & +${9}🗡` }
          }
        }
      },
      {
        name: `Kraken's Destruction`,
        cost: 7,
        effect: `${Math.floor(500 * (1 + (myself.damage / 100)))}💥 (Ignores Resist)`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(500 * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage, true)

            return { status: 'success', type: 'attack', damage }
          }
        }
      },
      {
        name: 'Shadow-Enfused Storm Lord',
        cost: 11,
        effect: `${Math.floor(1600 * (1 + (myself.damage / 100)))}💥`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(1600 * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)
            return { status: 'success', type: 'attack', damage }
          }
        }
      },
      {
        name: 'Spin the wheel!',
        cost: myself.spinTheWheel.cost,
        effect: `Blindly swap all stats with enemy [3🕥 Cooldown]`,
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
          myself.spinTheWheel = { cost: Infinity, turnsToActive: 3 }

          return { status: 'success', type: 'buff', buff: `swapped ${swapStats.maxHealth ? `💖,` : ''}${swapStats.health ? `💚,` : ''}${swapStats.pips ? `${pipIconID},` : ''}${swapStats.damage ? `🗡,` : ''}${swapStats.resist ? `🛡,` : ''}${swapStats.accuracy ? `🎯,` : ''}` }
        }
      },
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
