module.exports = {
  name: 'Eren Yeager',
  nickname: 'eren',
  imgURL: 'https://i.imgur.com/KLuYUJp.jpg',
  maxHealth: 110,
  health: 110,
  energy: 35,
  strength: 15,
  defense: 25,
  speed: 15,
  attackTitanForm: false,
  regenerageCost: 0,
  passive: function(){
      this.health = Math.min(this.health + 3,this.maxHealth)
  },
  passiveEffect: `+${3}💚 per round`,
  abilityMissed: function (enemy, speed) {
    if ((enemy.speed - speed) > Math.floor(Math.random() * 100)) return true
    return false
  },
  abilities: function () {
    const abilityMissed = this.abilityMissed
    const myself = this
    return this.attackTitanForm ? [
      {
        name: 'Titan Punch',
        cost: 0,
        effect: `${Math.ceil(myself.strength * (myself.energy / 100))}💥 +${10}⚡`,
        execute(enemy) {
          if (abilityMissed(enemy, myself.speed)) {
            return { status: 'miss' }
          } else {
            let starting_energy = myself.energy
            const damage = Math.ceil(myself.strength * (myself.energy / 100) * ((100 - enemy.defense) / 100))
            myself.energy = Math.min(myself.energy + 10, 100)
            enemy.health -= damage
            return { status: 'success', type: 'attack', damage, buff: `restored ${myself.energy - starting_energy}⚡` }
          }
        }
      },
      {
        name: 'Rest',
        cost: 0,
        effect: `+${30}⚡`,
        execute() {
          let starting_energy = myself.energy
          myself.energy = Math.min(myself.energy + 30, 100)
          return { status: 'success', type: 'restore', buff: `+${myself.energy - starting_energy}⚡` }
        }
      },
      {
        name: 'Regenerate',
        cost: this.regenerageCost,
        effect: `Convert 1⚡ -> 3💚, up to 100%💚`,
        execute() {
          let starting_energy = myself.energy
          let starting_health = myself.health
          let missingHealth = myself.maxHealth - myself.health
          let maxEnergyNeeded = Math.floor(missingHealth / 3) + ((missingHealth % 3)?1:0)

          if (myself.energy >= maxEnergyNeeded) {
            myself.energy -= maxEnergyNeeded
            myself.health = myself.maxHealth
          } else {
            myself.health += (myself.energy * 3)
            myself.energy = 0
          }
          myself.regenerageCost = Infinity
          return { status: 'success', type: 'restore', buff: `${starting_energy - myself.energy}⚡ to ${myself.health - starting_health}💚` }
        }
      },
      {
        name: 'Hardening',
        cost: 15,
        effect: `Increase 🛡 by ${3} & +${3}🤜`,
        execute() {
          myself.energy -= this.cost
          let starting_defense = myself.defense
          myself.defense = Math.min(myself.defense + 3, 100)
          let starting_strength = myself.strength
          myself.strength = Math.min(myself.strength + 3, 100)
          return { status: 'success', type: 'buff', buff: `recieved +${myself.defense - starting_defense}🛡 & +${myself.strength - starting_strength}🤜` }
        }
      },
      {
        name: 'Screech',
        cost: 15,
        effect: `+${15}💨 & -${5}🛡 on enemy`,
        execute(enemy) {
          myself.energy -= this.cost
          if (abilityMissed(enemy, myself.speed)) {
            return { status: 'miss' }
          } else {
            let starting_speed = myself.speed
            myself.speed = Math.min(myself.speed + 15, 100)

            let enemy_starting_defense = enemy.defense
            enemy.defense = Math.max(enemy.defense - 5, 0)
            return { status: 'success', type: 'buff', buff: `gained ${myself.speed - starting_speed}💨 & applied ${enemy.defense - enemy_starting_defense}🛡 on ${enemy.name}` }
          }
        }
      },
      {
        name: 'Titan Assult',
        cost: 60,
        effect: `${Math.ceil(myself.strength * 3)}💥 & +${10}💖`,
        execute(enemy) {
          myself.energy -= this.cost
          if (abilityMissed(enemy, myself.speed)) {
            return { status: 'miss' }
          } else {
            const damage = Math.ceil(Math.ceil(myself.strength * 3) * ((100 - enemy.defense) / 100))
            enemy.health -= damage
            myself.maxHealth += 10
            return { status: 'success', type: 'attack', damage, buff: `+${10}💖` }
          }
        }
      }
    ] : [ //Human Form
      {
        name: 'Slash',
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
        name: 'Rest',
        cost: 0,
        effect: `+${25}⚡ & +${4}💚`,
        execute() {
          let starting_energy = myself.energy
          let starting_health = myself.health
          myself.energy = Math.min(myself.energy + 25, 100)
          myself.health = Math.min(myself.health + 4, myself.maxHealth)
          return { status: 'success', type: 'restore', buff: `+${myself.energy - starting_energy}⚡ & +${myself.health - starting_health}💚` }
        }
      },
      {
        name: 'Attack Titan',
        cost: 60,
        effect: `Transform to Attack Titan`,
        newImg: 'https://i.imgur.com/NX9iU6g.png',
        execute(enemy) {
          myself.energy -= this.cost;
          myself.attackTitanForm = true
          let starting_maxHealth = myself.maxHealth
          let starting_defense = myself.defense
          let starting_strength = myself.strength
          let starting_speed = myself.speed

          myself.maxHealth += 30
          myself.health = myself.maxHealth
          myself.defense = Math.min(myself.defense + 10,100)
          myself.strength = Math.min(myself.strength + 20,100)
          myself.speed = Math.min(myself.speed + 30, 100)
          myself.energy = Math.min(myself.energy + 40, 100)
          myself.imgURL = this.newImg
          return { status: 'success', type: 'transform', form: 'Attack Titan', buff: `${myself.maxHealth-starting_maxHealth}💖 & +${myself.defense-starting_defense}🛡 & +${40}⚡ & +${myself.strength-starting_strength}🤜 & +${myself.speed-starting_speed}💨` }

        }
      }
    ]
  }

}
