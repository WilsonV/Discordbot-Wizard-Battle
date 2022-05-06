module.exports = {
  name: 'Light Yagamy',
  nickname: 'light',
  imgURL: 'https://i.imgur.com/xmfqeEa.jpg',
  maxHealth: 130,
  health: 130,
  energy: 10,
  strength: 30,
  defense: 15,
  speed: 25,
  shinigamyEyesCost: 0,
  kiraCost: 0,
  abilityMissed: function (enemy, speed) {
    if ((enemy.speed - speed) > Math.floor(Math.random() * 100)) return true
    return false
  },
  abilities: function () {
    const abilityMissed = this.abilityMissed
    const myself = this;
    return [
      {
        name: 'Punch',
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
        effect: `+${20}⚡ & +${5}💚`,
        execute() {
          let starting_energy = myself.energy
          let starting_health = myself.health
          myself.energy = Math.min(myself.energy + 20, 100)
          myself.health = Math.min(myself.health + 5, myself.maxHealth)
          return { status: 'success', type: 'restore', buff: `+${myself.energy - starting_energy}⚡ & +${myself.health - starting_health}💚` }
        }
      },
      {
        name: 'Relinquish',
        cost: 25,
        effect: `-${100}%⚡ & +100% Max💚`,
        execute(enemy) {
          let starting_energy = myself.energy
          let starting_health = myself.health
          myself.energy = 0
          myself.health = Math.min(myself.health + myself.maxHealth, myself.maxHealth)
          return { status: 'success', type: 'restore', buff: `${myself.energy - starting_energy}⚡ & +${myself.health - starting_health}💚` }
        }
      },
      {
        name: 'Shinigami Eyes',
        cost: myself.shinigamyEyesCost,
        effect: `+${80}⚡ & -30% Max💚`,
        execute(enemy) {
          myself.energy -= this.cost;
          let starting_energy = myself.energy
          let starting_health = myself.health
          myself.energy = Math.min(myself.energy + 80, 100)
          myself.health = Math.floor(Math.max(myself.health * .7, 0))
          myself.shinigamyEyesCost = Infinity
          return { status: 'success', type: 'restore', buff: `+${myself.energy - starting_energy}⚡ & ${myself.health - starting_health}💚` }
        }
      },
      {
        name: 'Kira',
        cost: myself.kiraCost,
        effect: `Divide 💚&⚡ With Enemy (70/30)`,
        execute(enemy) {
          myself.energy -= this.cost;
          let my_starting_energy = myself.energy
          let my_starting_health = myself.health
          let enemy_starting_energy = enemy.energy
          let enemy_starting_health = enemy.health

          const healthPool = myself.health + enemy.health
          const energyPool = myself.energy + enemy.energy

          myself.energy = Math.floor(Math.min(energyPool * .7, 100))
          myself.health = Math.floor(Math.min(healthPool * .7, myself.maxHealth))

          enemy.energy = Math.floor(Math.min(energyPool * .3, 100))
          enemy.health = Math.floor(Math.min(healthPool * .3, enemy.maxHealth))

          myself.kiraCost = Infinity
          return { status: 'success', type: 'restore', buff: `${myself.energy - my_starting_energy}⚡ & ${myself.health - my_starting_health}💚\n ${enemy.name} Restored ${enemy.energy - enemy_starting_energy}⚡ & ${enemy.health - enemy_starting_health}💚` }
        }
      },
      {
        name: 'Death Note',
        cost: 100,
        effect: `-${80}%💚 on enemy`,
        execute(enemy) {
          myself.energy -= this.cost
          if (abilityMissed(enemy, myself.speed)) {
            return { status: 'miss' }
          } else {
            let starting_health = enemy.health
            enemy.health = Math.floor(Math.max(enemy.health - (enemy.maxHealth * .8), 0))
            return { status: 'success', type: 'attack', damage: (starting_health - enemy.health) }
          }
        }
      },
    ]
  }

}
