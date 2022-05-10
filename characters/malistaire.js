const pipIconID = require('../pipIconID')
//needs more pips
module.exports = {
  name: 'Malistaire Drake',
  nickname: 'malistaire',
  imgURL: 'https://i.imgur.com/726wGkw.png',
  maxHealth: 3300,
  health: 3300,
  pips: 3,
  damage: 45,
  resist: 35,
  accuracy: 85,
  extraTurn: 0,
  funeralCeremony: { active: false, cost: 8, turnsLeft: 0, damage: 0, pips: 0 },
  passive: function (enemy) {

    enemy.damage = Math.max(enemy.damage - 1, 0)
    this.damage++

    if (this.funeralCeremony.active) {
      this.funeralCeremony.turnsLeft--

      if (this.funeralCeremony.turnsLeft <= 0) {
        this.funeralCeremony.active = false
        this.funeralCeremony.turnsLeft = 0

        this.damage += this.funeralCeremony.damage
        let pipsGained = this.addPips(this.funeralCeremony.pips)

        enemy.damage = 0
        enemy.resist = 0
        return `You've gained ${this.funeralCeremony.damage}🗡, ${pipsGained}${pipIconID} & ${enemy.name} has lost all 🗡 and 🛡`
      }
    }

  },
  passiveEffect: `-${1}🗡 on enemy & gain +${1}🗡, convert ${50}% all 💥 to 💚`,
  abilityMissed: function () {
    if (this.accuracy >= Math.floor(Math.random() * 101)) return false
    return true
  },
  abilities: function () {
    //const abilityMissed = this.abilityMissed
    const myself = this
    return [
      {
        name: 'Torment',
        cost: 0,
        effect: `${Math.floor(60 * myself.pips * (1 + (myself.damage / 100)))}💥`,
        execute(enemy) {
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = enemy.takeDamage(Math.floor(65 * myself.pips * (1 + (myself.damage / 100))))
            let healed = myself.heal(Math.floor(damage / 2))
            return { status: 'success', type: 'attack', damage, buff: `received ${healed}💚` }
          }

        }
      },
      {
        name: 'Empower',
        cost: 0,
        effect: `+${6}${pipIconID} & +${200}💚`,
        execute() {
          let pipsGained = myself.addPips(6)
          let healed = myself.heal(200)
          return { status: 'success', type: 'restore', buff: `${healed}💚 & +${pipsGained}${pipIconID}` }
        }
      },
      {
        name: 'Plague Vampire',
        cost: 6,
        effect: `${Math.floor(450 * (1 + (myself.damage / 100)))}💥, -${5}🎯 & -${3}🗡`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(450 * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)
            let healed = myself.heal(Math.floor(damage / 2))
            let enemy_starting_accuracy = enemy.accuracy
            enemy.accuracy = Math.max(enemy.accuracy - 5, 0)
            let enemy_starting_damage = enemy.damage
            enemy.damage = Math.max(enemy.damage - 5, 0)
            return { status: 'success', type: 'attack', damage, buff: `received ${healed}💚, applied ${enemy.accuracy - enemy_starting_accuracy}🎯 & ${enemy.damage - enemy_starting_damage}🗡` }
          }
        }
      },
      {
        name: `Wraith's Curse`,
        cost: 7,
        effect: `${Math.floor(700 * (1 + (myself.damage / 100)))}💥 & Steal ${10}🗡`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(700 * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)
            let healed = myself.heal(Math.floor(damage / 2))

            let enemy_starting_damage = enemy.damage
            let starting_damage = myself.damage
            enemy.damage = Math.max(enemy.damage - 10, 0)
            myself.damage += (enemy_starting_damage - enemy.damage)
            return { status: 'success', type: 'attack', damage, debuff: `received +${healed}💚 & stole ${enemy_starting_damage - enemy.damage}🗡 from ${enemy.name} and gained ${myself.damage - starting_damage}🗡` }
          }
        }
      },
      {
        name: 'Skeletal Dragon Guardian',
        cost: 11,
        effect: `${Math.floor(900 * (1 + (myself.damage / 100)))}💥 & +${5}🛡`,
        execute(enemy) {
          myself.pips -= this.cost
          if (myself.abilityMissed()) {
            return { status: 'miss' }
          } else {
            let damage = Math.floor(900 * (1 + (myself.damage / 100)))
            damage = enemy.takeDamage(damage)
            let healed = myself.heal(Math.floor(damage / 2))

            let starting_resist = myself.resist
            myself.resist = Math.min(myself.resist + 5, 100)

            return { status: 'success', type: 'attack', damage, buff: `received +${healed}💚 & gained ${myself.resist - starting_resist}🛡` }
          }
        }
      },
      {
        name: 'Funeral Ceremony',
        cost: myself.funeralCeremony.cost,
        effect: `lose ${50}%💚 and ${50}%💖, in ${5}🕑 gain +${50}🗡, +${4}${pipIconID} & enemy loses all 🗡 and 🛡`,
        execute(enemy) {
          myself.funeralCeremony = { active: true, cost: Infinity, turnsLeft: 5, damage: 50, pips: 4 }
          let starting_health = myself.health
          let starting_maxhealth = myself.maxHealth
          myself.health = Math.floor(myself.health / 2)
          myself.maxHealth = Math.floor(myself.maxHealth / 2)
          return { status: 'success', type: 'buff', buff: `lost ${starting_health - myself.health}💚 & ${starting_maxhealth - myself.maxHealth}💖, will gain ${50}🗡 & ${4}${pipIconID} in ${5}🕑 & ${enemy.name} will lose all 🗡 and 🛡 in ${5}🕑` }
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
