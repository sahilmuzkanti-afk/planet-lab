export class UI {
    constructor(callbacks) {
      this.callbacks = callbacks;
      this.screens = {
        loading: document.getElementById('loading-ui'),
        landing: document.getElementById('landing-ui'),
        solar: document.getElementById('solar-ui'),
        detail: document.getElementById('detail-ui'),
        lab: document.getElementById('lab-ui'),
        experiment: document.getElementById('experiment-ui')
      };
      this.transitionShade = document.getElementById('transition-shade');
      this.settings = document.getElementById('experiment-settings');
      this.results = document.getElementById('experiment-results');
      this.status = document.getElementById('experiment-status');
      this.currentExperiment = 'drop';
      this.bind();
    }

    bind() {
      document.getElementById('start-journey').addEventListener('click', () => this.callbacks.startJourney());
      document.getElementById('previous-planet').addEventListener('click', () => this.callbacks.previousPlanet());
      document.getElementById('next-planet').addEventListener('click', () => this.callbacks.nextPlanet());
      document.getElementById('explore-planet').addEventListener('click', () => this.callbacks.explorePlanet());
      document.getElementById('solar-home').addEventListener('click', () => this.callbacks.home());
      document.getElementById('detail-back').addEventListener('click', () => this.callbacks.backToSolar());
      document.getElementById('enter-lab').addEventListener('click', () => this.callbacks.enterLab());
      document.getElementById('lab-back-planet').addEventListener('click', () => this.callbacks.backToPlanet());
      document.getElementById('back-to-lab').addEventListener('click', () => this.callbacks.backToLab());
      document.getElementById('run-test').addEventListener('click', () => this.callbacks.runExperiment(this.readSettings()));
      document.getElementById('reset-test').addEventListener('click', () => this.callbacks.resetExperiment());
      document.getElementById('change-settings').addEventListener('click', () => {
        this.callbacks.resetExperiment();
        const first = this.settings.querySelector('input, select');
        if (first) first.focus();
      });
      document.querySelectorAll('[data-experiment]').forEach((button) => {
        button.addEventListener('click', () => this.callbacks.openExperiment(button.dataset.experiment));
      });
    }

    show(name) {
      Object.values(this.screens).forEach((screen) => screen.classList.add('hidden'));
      if (name && this.screens[name]) this.screens[name].classList.remove('hidden');
    }

    showLoading(progress, message = 'Loading Solar System...') {
      this.show('loading');
      document.getElementById('loading-progress').textContent = `${Math.round(progress)}%`;
      document.getElementById('loading-message').textContent = message;
    }

    showLanding() {
      this.show('landing');
    }

    showSolar(planet, index, total) {
      this.show('solar');
      this.updateSolar(planet, index, total);
    }

    updateSolar(planet, index, total) {
      document.documentElement.style.setProperty('--accent', planet.accentColor);
      document.getElementById('solar-subtitle').textContent = planet.subtitle;
      document.getElementById('solar-name').textContent = planet.displayName;
      document.getElementById('solar-gravity').textContent = planet.gravity.toFixed(2);
      document.getElementById('solar-distance').textContent = planet.distanceFromSun;
      document.getElementById('explore-planet').textContent = `EXPLORE ${planet.displayName.toUpperCase()}`;
      document.getElementById('planet-position').textContent = `${index + 1} / ${total}`;
    }

    showDetail(planet) {
      this.show('detail');
      document.documentElement.style.setProperty('--accent', planet.accentColor);
      document.getElementById('detail-subtitle').textContent = planet.subtitle;
      document.getElementById('detail-name').textContent = planet.displayName.toUpperCase();
      document.getElementById('detail-description').textContent = planet.description;
      document.getElementById('detail-stats').innerHTML = this.statRows([
        ['Gravity', `${planet.gravity.toFixed(2)} m/s²`],
        ['Mass', this.formatMass(planet.mass)],
        ['Radius', `${planet.radius.toLocaleString()} km`],
        ['Average temp.', planet.averageTemperature],
        ['Atmosphere', planet.atmosphere],
        ['Escape velocity', `${planet.escapeVelocity.toFixed(2)} km/s`],
        ['Length of day', planet.dayLength],
        ['Distance from Sun', planet.distanceFromSun]
      ]);
    }

    statRows(rows) {
      return rows.map(([label, value]) => `<div class="stat-row"><dt>${label}</dt><dd>${value}</dd></div>`).join('');
    }

    formatMass(value) {
      const power = Math.floor(Math.log10(value));
      const coefficient = value / 10 ** power;
      return `${coefficient.toFixed(3)} × 10${this.superscript(power)} kg`;
    }

    superscript(number) {
      const map = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
      return String(number).split('').map((char) => map[char]).join('');
    }

    showLab(planet) {
      this.show('lab');
      document.documentElement.style.setProperty('--accent', planet.accentColor);
      document.getElementById('lab-location').textContent = `${planet.displayName.toUpperCase()} LAB`;
      document.getElementById('lab-note').textContent = planet.hasSolidSurface
        ? `Experiments use ${planet.displayName}'s surface gravity and atmospheric conditions.`
        : `${planet.displayName} has no solid Earth-like surface. Tests run in an orbital/reference-level gravity laboratory.`;
    }

    showExperiment(name, planet) {
      this.show('experiment');
      this.currentExperiment = name;
      document.documentElement.style.setProperty('--accent', planet.accentColor);
      document.getElementById('experiment-context').textContent = `EARTH VS ${planet.displayName.toUpperCase()}`;
      document.getElementById('experiment-title').textContent = this.experimentLabel(name);
      document.getElementById('selected-world-label').textContent = planet.displayName.toUpperCase();
      document.getElementById('selected-world-gravity').textContent = `${planet.gravity.toFixed(2)} m/s²`;
      this.settings.innerHTML = this.settingsMarkup(name);
      this.clearResults();
      this.setStatus('Ready.');
    }

    experimentLabel(name) {
      return {
        drop: 'DROP TEST',
        jump: 'JUMP TEST',
        throw: 'THROW TEST',
        weight: 'WEIGHT TEST',
        pendulum: 'PENDULUM TEST',
        launch: 'LAUNCH TEST',
        feather: 'FEATHER VS HAMMER'
      }[name];
    }

    settingsMarkup(name) {
      if (name === 'drop') {
        return `
          <div class="setting"><label for="drop-object">Object</label><select id="drop-object"><option value="bowling">Bowling Ball</option><option value="basketball">Basketball</option><option value="rock">Rock</option><option value="hammer">Hammer</option><option value="feather">Feather</option></select></div>
          <div class="setting"><label for="drop-height">Drop height</label><select id="drop-height"><option value="5">5 m</option><option value="10">10 m</option><option value="20" selected>20 m</option><option value="50">50 m</option></select></div>`;
      }
      if (name === 'jump') {
        return `<div class="setting wide"><label for="jump-speed">Initial vertical speed</label><input id="jump-speed" type="number" min="1" max="8" step="0.1" value="3"></div>`;
      }
      if (name === 'throw') {
        return `
          <div class="setting"><label for="throw-speed">Launch speed</label><input id="throw-speed" type="number" min="2" max="40" step="1" value="15"></div>
          <div class="setting"><label for="throw-angle">Launch angle</label><input id="throw-angle" type="number" min="10" max="80" step="1" value="45"></div>`;
      }
      if (name === 'weight') {
        return `<div class="setting wide"><label for="mass-value">Mass</label><input id="mass-value" type="number" min="1" max="500" step="1" value="70"></div>`;
      }
      if (name === 'pendulum') {
        return `<div class="setting wide"><label for="pendulum-length">Pendulum length</label><input id="pendulum-length" type="number" min="0.2" max="5" step="0.1" value="1"></div>`;
      }
      if (name === 'launch') {
        return `<div class="setting wide"><label>Simulation</label><select id="launch-mode"><option>Reference-level escape velocity</option></select></div>`;
      }
      return `<div class="setting wide"><label for="feather-height">Drop height</label><select id="feather-height"><option value="10">10 m</option><option value="20" selected>20 m</option><option value="50">50 m</option></select></div>`;
    }

    readSettings() {
      const value = (id, fallback) => {
        const element = document.getElementById(id);
        return element ? element.value : fallback;
      };
      return {
        object: value('drop-object', 'bowling'),
        height: Number(value(this.currentExperiment === 'feather' ? 'feather-height' : 'drop-height', 20)),
        jumpSpeed: Number(value('jump-speed', 3)),
        speed: Number(value('throw-speed', 15)),
        angle: Number(value('throw-angle', 45)),
        mass: Number(value('mass-value', 70)),
        length: Number(value('pendulum-length', 1))
      };
    }

    setStatus(text) {
      this.status.textContent = text;
    }

    setResults(rows) {
      this.results.innerHTML = rows.map(([label, value]) => `<div class="result-row"><span>${label}</span><b>${value}</b></div>`).join('');
    }

    clearResults() {
      this.results.innerHTML = '';
    }

    setRunEnabled(enabled) {
      document.getElementById('run-test').disabled = !enabled;
    }

    transition(active) {
      this.transitionShade.classList.toggle('active', active);
    }
}
