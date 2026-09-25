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
