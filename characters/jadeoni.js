const pipIconID = require('../pipIconID')
module.exports = {
  name: 'Jade Oni',
  nickname: 'jadeoni',
  imgURL: 'https://i.imgur.com/yA0bnZz.png',
  maxHealth: 6500,
  health: 6500,
  pips: 4,
  damage: 30,
  resist: 20,
  accuracy: 90,
  healBoost: 1,
  centaur: { stage: 1, name: `Elite Centaur`, cost: 4, damage: 450, refundPips: true, damageBoost: 5 },
  dryadSanctuaryCost: 5,
  namasteLevel: 1,
  passive: function (enemy) {

    if (this.health < this.maxHealth * .6) {
      this.heal(200)
    }
  },
  passiveEffect: function () { return `+${Math.floor(200 * this.healBoost)}💚 (📋💚 < 60%)` },
  abilityMissed: function () {
    if (this.accuracy >= Math.floor(Math.random() * 101)) return false
    return true
  },
  abilities: function () {
    //const abilityMissed = this.abilityMissed
    const myself = this
    return [
      {
        name: 'Blessing',
        cost: 0,
        effect: `+${Math.floor(50 * myself.pips * myself.healBoost)}💚`,
        execute() {
          let healed = myself.heal(Math.floor(50 * myself.pips))
          return { status: 'success', type: 'restore', buff: `${healed}💚` }
        }
      },
      {
        name: 'Regenerate',
        cost: 0,
        effect: `+${4}${pipIconID} & +${2}🎯 & +${100}💖`,
        execute() {
          let pipsGained = myself.addPips(4)
          myself.maxHealth += 100
          let starting_accuracy = myself.accuracy
          myself.accuracy = Math.min(myself.accuracy + 2, 100)

          return { status: 'success', type: 'buff', buff: `gained ${100}💖 & +${pipsGained}${pipIconID} & +${myself.accuracy - starting_accuracy}🎯` }
        }
      },
      {
        //Centaur
        name: myself.centaur.name,
        cost: myself.centaur.cost,
        effect: `${Math.floor(myself.centaur.damage * (1 + (myself.damage / 100)))}💥 & +${myself.centaur.damageBoost}🗡 ${myself.centaur.refundPips ? `& +${myself.centaur.cost}${pipIconID}` : ''}`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(myself.centaur.damage * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)
            let pipsGained = 0
            let pipsRefunded = false
            if (myself.centaur.refundPips) {
              pipsGained = myself.addPips(myself.centaur.cost)
              pipsRefunded = true
            }
            let damageGained = myself.centaur.damageBoost
            myself.damage += myself.centaur.damageBoost

            //Increase stage
            if (myself.centaur.stage === 1) {
              myself.centaur = { stage: 2, name: `Champion Centaur`, cost: 7, damage: 800, refundPips: true, damageBoost: 10 }
            } else if (myself.centaur.stage === 2) {
              myself.centaur = { stage: 3, name: `Exalted Centaur`, cost: 10, damage: 1200, refundPips: true, damageBoost: 15 }
            } else if (myself.centaur.stage === 3) {
              myself.centaur = { stage: 4, name: `Warlord Centaur`, cost: 13, damage: 1700, refundPips: false, damageBoost: 30 }
            }
            return { status: 'success', type: 'attack', damage, buff: `gained +${damageGained}🗡 ${pipsRefunded ? `+${pipsGained}${pipIconID}` : ''}` }
          }
        }
      },
      {
        name: `Dryad's Sanctuary`,
        cost: myself.dryadSanctuaryCost,
        effect: `${Math.floor(700 * (1 + (myself.damage / 100)))}💥 & +${10}🛡 & +${30}% healing boost`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(700 * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)

            let starting_resist = myself.resist
            myself.resist = Math.min(myself.resist + 10, 100)
            myself.healBoost += .3
            myself.dryadSanctuaryCost = Infinity
            return { status: 'success', type: 'attack', damage, debuff: `gained +${myself.resist - starting_resist}🛡 & +${30}% healing boost` }
          }
        }
      },
      {
        name: 'Rebirth',
        cost: 11,
        effect: `${Math.floor(1200 * (1 + (myself.damage / 100)))}💥 & +${Math.floor(800 * myself.healBoost)}💚 & +${800}💖`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(1200 * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)
            let healed = myself.heal(800)

            myself.maxHealth += 800

            return { status: 'success', type: 'attack', damage, buff: `received +${healed}💚 & +${800}💖` }
          }
        }
      },
      {
        name: 'Namaste',
        cost: 0,
        effect: `Lose ${(350 * myself.namasteLevel)}💚 for +${15}% healing boost`,
        execute() {
          myself.health = Math.max(myself.health - (350 * myself.namasteLevel), 0)
          myself.healBoost += .15
          let prev_namasteLevel = myself.namasteLevel
          myself.namasteLevel++
          return { status: 'success', type: 'buff', buff: `lost ${(350 * prev_namasteLevel)}💚 & received +${15}% healing boost` }
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
    amount = Math.floor(Math.abs(amount * this.healBoost))
    this.health = Math.min(this.health + amount, this.maxHealth)
    return this.health - starting_health
  }

}
