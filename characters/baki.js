module.exports = {
  name: 'Baki Hanma',
  nickname: 'baki',
  imgURL: 'https://i.imgur.com/jbGDzr4.jpg',
  maxHealth: 120,
  health: 120,
  energy: 20,
  strength: 30,
  defense: 25,
  speed: 40,
  gearSecondCost: 40,
  endorphinCost: 0,
  endorphinRoundsLeft: 0,
  deathConcentrationCost: 0,
  unconciousCost: 0,
  extraTurn: 0,
  passive: function () {
    this.energy = Math.min(this.energy + 5, 100)

    //remove endorphin
    if (this.endorphinRoundsLeft > 0) {
      if (this.endorphinRoundsLeft === 1) {
        this.defense = Math.max(this.defense - 40, 0)
      }
      this.endorphinRoundsLeft--
    }

    //remove extra turns
    if (this.extraTurn > 0) this.extraTurn--
  },
  passiveEffect: `+${5}⚡ per round`,
  abilityMissed: function (enemy, speed) {
    if ((enemy.speed - speed) > Math.floor(Math.random() * 100)) return true
    return false
  },
  abilities: function () {
    const abilityMissed = this.abilityMissed
    const myself = this;
    return [
      {
        name: 'Seiken',
        cost: 0,
        effect: `${Math.ceil(myself.strength * (myself.energy / 100))}💥`,
        execute(enemy) {
          if (abilityMissed(enemy, myself.speed)) {
            return { status: 'miss' }
          } else {
            const damage = Math.ceil(myself.strength * (myself.energy / 100) * ((100 - enemy.defense) / 100))
            enemy.health -= damage
            return { status: 'success', type: 'attack', damage }
          }
        }
      },
      {
        name: 'Train',
        cost: 0,
        effect: `+${25}⚡ & +${4}💚 & +${1}🤜`,
        execute() {
          let starting_energy = myself.energy
          let starting_health = myself.health
          let starting_strength = myself.strength
          myself.energy = Math.min(myself.energy + 25, 100)
          myself.health = Math.min(myself.health + 4, myself.maxHealth)
          myself.strength = Math.min(myself.strength + 1, 100)
          return { status: 'success', type: 'restore', buff: `+${myself.energy - starting_energy}⚡ & +${myself.health - starting_health}💚 & +${myself.strength - starting_strength}🤜` }
        }
      },
      {
        name: 'Armlock',
        cost: 55,
        effect: `${Math.ceil(myself.strength * 1.5)}💥 & -${5}🤜 on enemy`,
        execute(enemy) {
          myself.energy -= this.cost;
          if (abilityMissed(enemy, myself.speed)) {
            return { status: 'miss' }
          } else {
            const damage = Math.ceil((myself.strength * 2) * ((100 - enemy.defense) / 100))
            enemy.health -= damage
            let enemy_starting_strength = enemy.strength
            enemy.strength = Math.max(enemy.strength - 5, 0)
            return { status: 'success', type: 'attack', damage, debuff: `${enemy.strength - enemy_starting_strength}🤜 applied on ${enemy.name}` }
          }
        }
      },
      {
        name: 'Single-Leg Figure-Four',
        cost: 55,
        effect: `${Math.ceil(myself.strength * 1.5)}💥 & -${5}💨 on enemy`,
        execute(enemy) {
          myself.energy -= this.cost;
          if (abilityMissed(enemy, myself.speed)) {
            return { status: 'miss' }
          } else {
            const damage = Math.ceil((myself.strength * 2) * ((100 - enemy.defense) / 100))
            enemy.health -= damage
            let enemy_starting_speed = enemy.speed
            enemy.speed = Math.max(enemy.speed - 5, 0)
            return { status: 'success', type: 'attack', damage, debuff: `${enemy.speed - enemy_starting_speed}💨 applied on ${enemy.name}` }
          }
        }
      },
      {
        name: 'Three-Level Attack',
        cost: 90,
        effect: `${myself.strength}💥 & ${myself.strength}💥 & ${Math.ceil(myself.strength * .5)}💥`,
        execute(enemy) {
          myself.energy -= this.cost;

          const damage = Math.ceil((myself.strength) * ((100 - enemy.defense) / 100))
          enemy.health = Math.floor(Math.max(enemy.health - damage, 0))

          const secondDamage = Math.ceil((myself.strength) * ((100 - enemy.defense) / 100))
          enemy.health = Math.floor(Math.max(enemy.health - secondDamage, 0))

          const thirdDamage = Math.ceil(Math.ceil(myself.strength * .5) * ((100 - enemy.defense) / 100))
          enemy.health = Math.floor(Math.max(enemy.health - thirdDamage, 0))

          return { status: 'success', type: 'attack', damage, secondDamage, thirdDamage }
        }
      },
      {
        name: 'Endorphin',
        cost: myself.endorphinCost,
        effect: `+${40}🛡 for 2 🕑, -${40}🛡 after 2 🕑`,
        execute() {
          myself.energy -= this.cost;
          let starting_defense = myself.defense
          myself.defense = Math.min(myself.defense + 40, 100)
          myself.endorphinCost = Infinity
          myself.endorphinRoundsLeft = 2
          return { status: 'success', type: 'buff', buff: `received +${myself.defense - starting_defense}🛡` }
        }
      },
      {
        name: 'Death Concentration',
        cost: (myself.health <= myself.maxHealth * .25) ? myself.deathConcentrationCost : Infinity,
        effect: `+${50}💚 & +${15}💨 (📋💚 < 25%)`,
        execute() {
          myself.energy -= this.cost
          let starting_health = myself.health
          let starting_speed = myself.speed
          myself.health = Math.min(myself.health + 50, myself.maxHealth)
          myself.speed = Math.min(myself.speed + 15, 100)
          myself.deathConcentrationCost = Infinity
          return { status: 'success', type: 'buff', buff: `received +${myself.health - starting_health}💚 & +${myself.speed - starting_speed}💨` }
        }
      },
      {
        name: '0.5 Second Unconscious',
        cost: myself.unconciousCost,
        effect: `Skip enemy's next 🕑 (Restarts this 🕑)`,
        execute() {
          myself.energy -= this.cost;
          myself.extraTurn = 2
          myself.unconciousCost = Infinity
          return { status: 'success', type: 'buff', buff: `restarted 🕑, enemy's next 🕑 is skipped` }
        }
      },
    ]
  }

}
