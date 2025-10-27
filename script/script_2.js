const { Client, Databases, Storage, Avatars, Query } = Appwrite;

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('67c08acf000251b3be4d');

const db = new Databases(client);
const storage = new Storage(client);
const avatars = new Avatars(client);

class EpreuveManager {
  constructor() {
    this.epreuves = [];
    this.currentChallenge = null;
    this.currentPage = 0;
    this.pageSize = 50;
    this.offset = 0;
    this.hasMore = true;
    this.bucketId = '6872dbe700352666825d';
    this.init();
  }

  async init() {
    this.content = document.querySelector('.content');
    this.dots = document.querySelector('.dots');
    this.trialName = document.querySelector('.trial-name');
    this.navBtns = document.querySelectorAll('.nav-btn');
    this.loading = document.querySelector('.loading');

    await this.loadEpreuves();
    this.setupNav();
    this.setupGestures();
    this.loadRandomChallenge();
  }

  async loadEpreuves() {
    this.showLoading();
    try {
      const res = await db.listDocuments(
        '67ea6aa9001de008920e',
        '6877f4870029b9159e52',
        [
          Query.limit(this.pageSize),
          Query.offset(this.offset),
          Query.orderAsc('name')
        ]
      );
      console.log("Documents récupérés :", res);

      const newEpreuves = res.documents.map(doc => {
        return {
          id: doc.$id,
          name: doc.name,
          pages: doc.pages,
          color: doc.color,
          thumbails: Array.isArray(doc.thumbails) ? doc.thumbails : [],
          image: typeof doc.image === 'string' && doc.image.length > 0 ? doc.image : ''
        };
      });

      this.epreuves.push(...newEpreuves);
      console.log("Liste cumulée des épreuves :", this.epreuves);

      if (res.documents.length < this.pageSize) {
        this.hasMore = false;
      } else {
        this.offset += this.pageSize;
      }
      console.log("Épreuves transformées :", this.epreuves);
    } catch (err) {
      console.error('Erreur Appwrite:', err);
    } finally {
      this.hideLoading();
    }
  }

  async loadRandomChallenge() {
    if (!this.epreuves.length) return;
    this.showLoading();
    this.currentChallenge = this.epreuves[Math.floor(Math.random() * this.epreuves.length)];
    this.currentPage = 0;
    this.trialName.textContent = this.currentChallenge.name;
    this.trialName.style.color = this.currentChallenge.color;
    await this.createPages();
    this.createDots();
    this.hideLoading();
  }

  async createPages() {
    this.content.innerHTML = '';
    const numPages = this.currentChallenge.pages || 0;
    const thumbs = this.currentChallenge.thumbails || [];

    const pagePromises = [];
    for (let i = 0; i < numPages; i++) {
      pagePromises.push(this._createImagePage(i, thumbs[i]));
    }

    const pageElements = await Promise.all(pagePromises);
    pageElements.forEach(el => {
      this.content.appendChild(el);
    });
  }

  async _createImagePage(pageIndex, thumbailUrl) {
    const pageDiv = document.createElement('div');
    pageDiv.className = 'page active'; // <-- Ajoute 'active' à toutes les pages

    console.log("=== _createImagePage", pageIndex, thumbailUrl);

    // fallback si thumbnail n’existe pas
    let urlToUse = thumbailUrl;
    if (!urlToUse) {
      urlToUse = this.currentChallenge.image || '';
    }

    if (urlToUse) {
      try {
        // utiliser Avatars pour proxifier l’URL distante
        const proxied = avatars.getImage({
          url: urlToUse,
          width: 800,    // largeur maximale désirée
          height: 0      // 0 pour garder le ratio
        });
        console.log("URL proxy via Avatars:", proxied);

        const img = document.createElement('img');
        img.alt = `Page ${pageIndex + 1}`;
        img.src = proxied.href || proxied;  // selon ce que retourne Avatars
        pageDiv.appendChild(img);
      } catch (err) {
        console.error(`Erreur avatars.getImage pour page ${pageIndex}, url ${urlToUse}`, err);
        const p = document.createElement('p');
        p.textContent = `(Erreur à charger l’image via Avatars pour page ${pageIndex + 1})`;
        pageDiv.appendChild(p);
      }
    } else {
      console.warn(`Aucun thumbnail / image pour pageIndex`, pageIndex);
      const p = document.createElement('p');
      p.textContent = `(Image non définie pour la page ${pageIndex + 1})`;
      pageDiv.appendChild(p);
    }

    return pageDiv;
  }

  createDots() {
    this.dots.innerHTML = '';
    for (let i = 0; i < this.currentChallenge.pages; i++) {
      const dot = document.createElement('div');
      dot.className = `dot ${i === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => this.goToPage(i));
      this.dots.appendChild(dot);
    }
  }

  goToPage(index) {
    if (index < 0 || index >= this.currentChallenge.pages) return;
    const pages = document.querySelectorAll('.page');
    const dots = document.querySelectorAll('.dot');
    pages[this.currentPage].classList.remove('active');
    dots[this.currentPage].classList.remove('active');
    this.currentPage = index;
    pages[index].classList.add('active');
    dots[index].classList.add('active');
  }

  setupNav() {
    this.navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => btn.style.transform = '', 200);
      });
    });
  }

  setupGestures() {
    let startX, startY, isScrolling;
    this.content.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isScrolling = undefined;
    });
    this.content.addEventListener('touchmove', e => {
      if (!isScrolling) {
        const deltaX = e.touches[0].clientX - startX;
        const deltaY = e.touches[0].clientY - startY;
        isScrolling = Math.abs(deltaY) > Math.abs(deltaX);
      }
      e.preventDefault();
    }, { passive: false });
    this.content.addEventListener('touchend', e => {
      const deltaX = e.changedTouches[0].clientX - startX;
      const deltaY = e.changedTouches[0].clientY - startY;
      // Changement de page (horizontal) ou nouvelle épreuve (vertical)
      if (!isScrolling && Math.abs(deltaX) > 50) {
        this.goToPage(this.currentPage + (deltaX > 0 ? -1 : 1));
      } else if (isScrolling && Math.abs(deltaY) > 100) {
        this.loadRandomChallenge();// glisse haut/bas pour nouvelle épreuve
      }
    });
  }

  showLoading() {
    this.loading.style.opacity = '1';
    this.loading.style.pointerEvents = 'all';
  }

  hideLoading() {
    this.loading.style.opacity = '0';
    this.loading.style.pointerEvents = 'none';
  }
}

// Initialisation
window.addEventListener('load', () => new EpreuveManager());