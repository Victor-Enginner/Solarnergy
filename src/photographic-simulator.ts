import { calculateSolarSpecs, MIN_PANELS, MAX_PANELS } from './solar-calculator.ts';

export interface PhotoSimulatorElements {
  container: HTMLElement;
  sliderEl?: HTMLInputElement | null;
  countDisplayEl?: HTMLElement | null;
  kwpDisplayEl?: HTMLElement | null;
  savingsDisplayEl?: HTMLElement | null;
  generationDisplayEl?: HTMLElement | null;
  tierDisplayEl?: HTMLElement | null;
  batteryDisplayEl?: HTMLElement | null;
  whatsappBtnEl?: HTMLAnchorElement | null;
  tierBtns?: NodeListOf<HTMLButtonElement> | null;
  backBtnEl?: HTMLButtonElement | null;
  modeToggleBtns?: NodeListOf<HTMLButtonElement> | null;
  houseImgEl?: HTMLImageElement | null;
  tierBadgeEl?: HTMLElement | null;
}

export class PhotographicSolarSimulator {
  private currentPanels = 16;
  private currentMode: 'morning' | 'night' = 'morning';
  private currentTier: 'compact' | 'standard' | 'villa' = 'standard';
  private elements: PhotoSimulatorElements;

  // Authentic, pristine photographic images for each configuration with sky
  private tierImages = {
    morning: {
      compact: '/assets/images/lumen_compact_morning.webp',
      standard: '/assets/images/lumen_standard_morning.webp',
      villa: '/assets/images/lumen_villa_morning.webp',
    },
    night: {
      compact: '/assets/images/lumen_compact_night.webp',
      standard: '/assets/images/lumen_standard_night.webp',
      villa: '/assets/images/lumen_villa_night.webp',
    },
  };

  private tierLabels = {
    compact: 'Compacto: 8 Placas • Fileira Discreta Integrada',
    standard: 'Residencial Padrão: 16 Placas • Cobertura Balanceada',
    villa: 'Villa Total: 28 Placas • Cobertura Máxima Edge-to-Edge',
  };

  constructor(elements: PhotoSimulatorElements) {
    this.elements = elements;
    this.preloadImages();
    this.init();
  }

  private preloadImages() {
    try {
      Object.values(this.tierImages).forEach((tierGroup) => {
        Object.values(tierGroup).forEach((src) => {
          const img = new Image();
          img.src = src;
        });
      });
    } catch {
      // safe fallback in non-browser environments
    }
  }

  private init() {
    this.bindEvents();
    this.setPanelCount(16);
  }

  public setPanelCount(count: number) {
    this.currentPanels = Math.max(MIN_PANELS, Math.min(MAX_PANELS, Math.round(count)));
    const specs = calculateSolarSpecs(this.currentPanels);
    this.currentTier = specs.complexityId;

    if (this.elements.sliderEl) {
      this.elements.sliderEl.value = String(this.currentPanels);
    }
    if (this.elements.countDisplayEl) {
      this.elements.countDisplayEl.textContent = `${this.currentPanels} Placas`;
    }
    if (this.elements.kwpDisplayEl) {
      this.elements.kwpDisplayEl.textContent = `${specs.powerKwp} kWp`;
    }
    if (this.elements.generationDisplayEl) {
      this.elements.generationDisplayEl.textContent = `${specs.monthlyGenerationKwh.toLocaleString('pt-BR')} kWh/mês`;
    }
    if (this.elements.savingsDisplayEl) {
      this.elements.savingsDisplayEl.textContent = `R$ ${specs.sevenYearSavingsBrl.toLocaleString('pt-BR')}`;
    }
    if (this.elements.tierDisplayEl) {
      this.elements.tierDisplayEl.textContent = specs.complexityTier;
    }
    if (this.elements.batteryDisplayEl) {
      this.elements.batteryDisplayEl.textContent = specs.batteryRecommended;
    }
    if (this.elements.tierBadgeEl) {
      this.elements.tierBadgeEl.textContent = this.tierLabels[this.currentTier];
    }
    if (this.elements.whatsappBtnEl) {
      this.elements.whatsappBtnEl.href = specs.whatsappUrl;
    }

    if (this.elements.tierBtns) {
      this.elements.tierBtns.forEach((btn) => {
        const tier = btn.dataset.tier;
        btn.classList.toggle('is-active', tier === specs.complexityId);
      });
    }

    this.updateHousePhoto();
  }

  private updateHousePhoto() {
    if (!this.elements.houseImgEl) return;
    const targetSrc = this.tierImages[this.currentMode][this.currentTier];

    if (this.elements.houseImgEl.src.includes(targetSrc)) return;

    // Smooth luxury crossfade
    this.elements.houseImgEl.style.opacity = '0.35';
    setTimeout(() => {
      if (this.elements.houseImgEl) {
        this.elements.houseImgEl.src = targetSrc;
        this.elements.houseImgEl.onload = () => {
          if (this.elements.houseImgEl) {
            this.elements.houseImgEl.style.opacity = '1';
          }
        };
      }
    }, 120);
  }

  public setMode(mode: 'morning' | 'night') {
    this.currentMode = mode;
    if (this.elements.modeToggleBtns) {
      this.elements.modeToggleBtns.forEach((btn) => {
        btn.classList.toggle('is-active', btn.dataset.mode === mode);
      });
    }
    this.updateHousePhoto();
  }

  private bindEvents() {
    if (this.elements.sliderEl) {
      this.elements.sliderEl.oninput = () => {
        this.setPanelCount(parseInt(this.elements.sliderEl!.value, 10));
      };
    }

    if (this.elements.tierBtns) {
      this.elements.tierBtns.forEach((btn) => {
        btn.onclick = () => {
          const tier = btn.dataset.tier;
          if (tier === 'compact') this.setPanelCount(8);
          else if (tier === 'standard') this.setPanelCount(16);
          else if (tier === 'villa') this.setPanelCount(28);
        };
      });
    }

    if (this.elements.modeToggleBtns) {
      this.elements.modeToggleBtns.forEach((btn) => {
        btn.onclick = () => {
          const mode = btn.dataset.mode as 'morning' | 'night';
          this.setMode(mode);
        };
      });
    }

    if (this.elements.backBtnEl) {
      this.elements.backBtnEl.onclick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    }
  }
}
