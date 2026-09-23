export const planets = [
    {
      name: 'mercury', displayName: 'Mercury', subtitle: 'Closest planet to the Sun',
      gravity: 3.70, mass: 3.3011e23, radius: 2439.7, diameter: 4879.4,
      averageTemperature: '167 °C', atmosphere: 'Extremely thin exosphere', atmosphericDensity: 0,
      escapeVelocity: 4.25, dayLength: '58.6 Earth days', distanceFromSun: '57.9 million km',
      texture: 'https://edu.solarsystemscope.com/textures/download/2k_mercury.jpg', accentColor: '#9d9a94', surfaceColor: 0x4f4d49,
      description: 'A cratered rocky world with extreme temperature swings and almost no atmosphere.', hasSolidSurface: true,
      scale: 0.52
    },
    {
      name: 'venus', displayName: 'Venus', subtitle: 'Second planet from the Sun',
      gravity: 8.87, mass: 4.8675e24, radius: 6051.8, diameter: 12103.6,
      averageTemperature: '464 °C', atmosphere: 'CO₂, nitrogen; sulfuric-acid clouds', atmosphericDensity: 65,
      escapeVelocity: 10.36, dayLength: '243 Earth days', distanceFromSun: '108.2 million km',
      texture: 'https://edu.solarsystemscope.com/textures/download/2k_venus_atmosphere.jpg', accentColor: '#c7a15b', surfaceColor: 0x80603b,
      description: 'A hot world wrapped in a dense carbon-dioxide atmosphere beneath bright cloud decks.', hasSolidSurface: true,
      scale: 0.93
    },
    {
      name: 'earth', displayName: 'Earth', subtitle: 'Third planet from the Sun',
      gravity: 9.81, mass: 5.9722e24, radius: 6371.0, diameter: 12742,
      averageTemperature: '15 °C', atmosphere: 'Nitrogen, oxygen, argon', atmosphericDensity: 1.225,
      escapeVelocity: 11.186, dayLength: '23 h 56 min', distanceFromSun: '149.6 million km',
      texture: 'https://edu.solarsystemscope.com/textures/download/2k_earth_daymap.jpg', clouds: 'https://edu.solarsystemscope.com/textures/download/2k_earth_clouds.jpg', accentColor: '#4d78a6', surfaceColor: 0x465767,
      description: 'Our ocean world, with a nitrogen-oxygen atmosphere and the baseline gravity for every comparison.', hasSolidSurface: true,
      scale: 1
    },
    {
      name: 'mars', displayName: 'Mars', subtitle: 'Fourth planet from the Sun',
      gravity: 3.71, mass: 6.4171e23, radius: 3389.5, diameter: 6779,
      averageTemperature: '−63 °C', atmosphere: 'Mostly carbon dioxide', atmosphericDensity: 0.020,
      escapeVelocity: 5.03, dayLength: '24 h 37 min', distanceFromSun: '227.9 million km',
      texture: 'https://edu.solarsystemscope.com/textures/download/2k_mars.jpg', accentColor: '#a75536', surfaceColor: 0x653323,
      description: 'A cold desert world with a thin carbon-dioxide atmosphere, giant volcanoes and deep canyons.', hasSolidSurface: true,
      scale: 0.64
    },
    {
      name: 'jupiter', displayName: 'Jupiter', subtitle: 'Fifth planet from the Sun',
      gravity: 24.79, mass: 1.8982e27, radius: 69911, diameter: 139820,
      averageTemperature: '−110 °C', atmosphere: 'Hydrogen and helium', atmosphericDensity: 0.16,
      escapeVelocity: 59.5, dayLength: '9 h 56 min', distanceFromSun: '778.5 million km',
      texture: 'https://edu.solarsystemscope.com/textures/download/2k_jupiter.jpg', accentColor: '#b99b7b', surfaceColor: 0x776759,
      description: 'The largest planet, a deep hydrogen-helium world with banded clouds and powerful storms.', hasSolidSurface: false,
      scale: 2.3
    },
    {
      name: 'saturn', displayName: 'Saturn', subtitle: 'Sixth planet from the Sun',
      gravity: 10.44, mass: 5.6834e26, radius: 58232, diameter: 116464,
      averageTemperature: '−140 °C', atmosphere: 'Hydrogen and helium', atmosphericDensity: 0.19,
      escapeVelocity: 35.5, dayLength: '10 h 42 min', distanceFromSun: '1.43 billion km',
      texture: 'https://edu.solarsystemscope.com/textures/download/2k_saturn.jpg', rings: 'https://edu.solarsystemscope.com/textures/download/2k_saturn_ring_alpha.png', accentColor: '#c1ae79', surfaceColor: 0x81765c,
      description: 'A low-density gas giant encircled by a broad, intricate system of icy rings.', hasSolidSurface: false,
      scale: 2.05
    },
    {
      name: 'uranus', displayName: 'Uranus', subtitle: 'Seventh planet from the Sun',
      gravity: 8.69, mass: 8.6810e25, radius: 25362, diameter: 50724,
      averageTemperature: '−195 °C', atmosphere: 'Hydrogen, helium, methane', atmosphericDensity: 0.42,
      escapeVelocity: 21.3, dayLength: '17 h 14 min', distanceFromSun: '2.87 billion km',
      texture: 'https://edu.solarsystemscope.com/textures/download/2k_uranus.jpg', accentColor: '#87b8bd', surfaceColor: 0x5c8184,
      description: 'An ice giant with methane-rich upper clouds and a rotation axis tipped dramatically sideways.', hasSolidSurface: false,
      scale: 1.42
    },
    {
      name: 'neptune', displayName: 'Neptune', subtitle: 'Eighth planet from the Sun',
      gravity: 11.15, mass: 1.02413e26, radius: 24622, diameter: 49244,
      averageTemperature: '−200 °C', atmosphere: 'Hydrogen, helium, methane', atmosphericDensity: 0.45,
      escapeVelocity: 23.5, dayLength: '16 h 6 min', distanceFromSun: '4.50 billion km',
      texture: 'https://edu.solarsystemscope.com/textures/download/2k_neptune.jpg', accentColor: '#345b9b', surfaceColor: 0x243e6c,
      description: 'A distant ice giant with fast winds, deep-blue upper clouds and violent weather systems.', hasSolidSurface: false,
      scale: 1.38
    }
];

export const earth = planets.find((planet) => planet.name === 'earth');
export const planetByName = (name) => planets.find((planet) => planet.name === name) || earth;
