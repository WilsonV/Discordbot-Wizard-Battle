const pipIconID = require('../pipIconID')
module.exports = {
  name: 'Malistaire Drake',
  nickname: 'malistaire',
  imgURL: 'https://i.imgur.com/726wGkw.png',
  maxHealth: 3300,
  health: 3300,
  pips: 6,
  damage: 45,
  resist: 35,
  accuracy: 85,
  extraTurn: 0,
  passive: function (enemy) {

    enemy.damage = Math.max(enemy.damage - 1, 0)
    this.damage++

  },
  passiveEffect: `-${1}🗡 on enemy & +${1}🗡 for self`,
  abilityMissed: function () {
    if (this.accuracy >= Math.floor(Math.random() * 101)) return false
    return true
  },
  abilities: function () {
    //const abilityMissed = this.abilityMissed
    const myself = this
    return [
      {
        name: 'Wild Bolt',
        cost: 0,
        effect: `${Math.floor(10 * (1 + (myself.damage / 100)))}, ${Math.floor(100 * (1 + (myself.damage / 100)))} or ${Math.floor(1000 * (1 + (myself.damage / 100)))} 💥`,
        execute(enemy) {
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = 10
            switch (Math.floor(Math.random() * 3)) {
              case 0:
                damage = 10
                break;
              case 1:
                damage = 100
                break;
              case 2:
                damage = 1000
                break
              default:
                damage = 10
                break;
            }
            damage = enemy.takeDamage(Math.floor(damage * (1 + (myself.damage / 100))))
            return { status: 'success', type: 'attack', damage }
          }

        }
      },
      {
        name: 'Supercharge',
        cost: 0,
        effect: `+${3}${pipIconID} & (+${200}💚 or +${3}🗡)`,
        execute() {
          let pipsGained = myself.addPips(3)
          let rndBuff = ''
          let amount = 0
          if (Math.floor(Math.random() * 2) < 1) {
            rndBuff = '💚'
            amount = myself.heal(200)
          } else {
            rndBuff = '🗡'
            amount = 3
            myself.damage += 3
          }

          let healed = myself.heal(200)
          return { status: 'success', type: 'buff', buff: `gained ${amount}${rndBuff} & +${pipsGained}${pipIconID}` }
        }
      },
      {
        name: 'Darkwind Tempest',
        cost: 6,
        effect: `+${5}🗡 Then ${Math.floor(480 * (1 + (myself.damage / 100)))}💥 & +${5}🎯`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            myself.damage += 5
            let damage = Math.floor(480 * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)
            let starting_accuracy = myself.accuracy
            myself.accuracy = Math.min(myself.accuracy + 5, 100)
            return { status: 'success', type: 'attack', damage, buff: `received +${5}🗡 & ${myself.accuracy - starting_accuracy}🎯` }
          }
        }
      },
      {
        name: `The Kraken's Wrath`,
        cost: 7,
        effect: `${Math.floor(850 * (1 + (myself.damage / 100)))}💥 & -${10}🎯 & -${10}🗡`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(850 * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)

            let enemy_starting_accuracy = enemy.accuracy
            enemy.accuracy = Math.max(enemy.accuracy - 10, 0)

            let enemy_starting_damage = enemy.damage
            enemy.damage = Math.max(enemy.damage - 10, 0)

            return { status: 'success', type: 'attack', damage, debuff: `applied ${enemy.accuracy - enemy_starting_accuracy}🎯 & ${enemy.damage - enemy_starting_damage}🗡 on ${enemy.name}` }
          }
        }
      },
      {
        name: 'Unforgiving Storm Lord',
        cost: 11,
        effect: `${Math.floor(950 * (1 + (myself.damage / 100)))}💥 & +${2}${pipIconID} & +${1}🕑`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(950 * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)

            let pipsGained = myself.addPips(2)

            myself.extraTurn = 1
            return { status: 'success', type: 'attack', damage, buff: `received +${pipsGained}${pipIconID} & gained 1🕑` }
          }
        }
      },
      {
        name: 'Calm Before The Storm',
        cost: myself.calmBeforeStorm.cost,
        effect: `lose -${myself.damage}🗡 & -${myself.resist}🛡 now, gain +${myself.damage * 2}🗡 & +${myself.resist}🛡 after 3🕑`,
        execute() {
          myself.calmBeforeStorm = { cost: Infinity, active: true, turnsLeft: 3, damage: myself.damage, resist: myself.resist }
          let starting_damage = myself.damage
          let starting_resist = myself.resist
          myself.damage = 0
          myself.resist = 0
          return { status: 'success', type: 'buff', buff: `lost ${starting_damage}🗡 & ${starting_resist}🛡, will gain ${starting_damage * 2}🗡 & ${starting_resist}🛡 in 3🕑` }
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
