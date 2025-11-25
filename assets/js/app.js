/**
 * ForgeGrid Production Script
 * Optimized for performance, accessibility, and reliability.
 */
(function () {
	'use strict';

	// --- Configuration ---
	const CONFIG = {
		video: {
			basePath: 'assets/videos/',
			files: {
				hero: 'hero-video.mp4',
				analytics: 'analytics.mp4',
				errorHandler: 'error_handler.mp4'
			},
			// Add smooth opacity transition to heroVideo
			elements.heroVideo.style.transition = 'opacity ' + CONFIG.video.fadeDuration + 'ms ease-in-out';
			rotationInterval: 10000,
			fadeDuration: 800
		},
		observer: {
			threshold: 0.1,
			rootMargin: '0px 0px -50px 0px'
		}
	};

	// --- State Management ---
	const state = {
		currentVideoIndex: 0,
		rotationTimeout: null,
		preloadedVideos: new Set(),
		isReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
		lastFocusedElement: null
	};

	// --- DOM Elements Cache ---
	const elements = {
		heroVideo: document.getElementById('heroVideo'),
		spotlightCards: document.getElementsByClassName('spotlight-card'),
		modals: document.querySelectorAll('.modal')
	};

	// --- Utilities ---
	const getVideoPath = (key) => CONFIG.video.basePath + CONFIG.video.files[key];

	// --- Modal System ---
	const Modal = {
		open: function (modalId) {
			const modal = document.getElementById(modalId);
			if (!modal) return;

			state.lastFocusedElement = document.activeElement;
			modal.classList.add('active');
			modal.setAttribute('aria-hidden', 'false');
			document.body.style.overflow = 'hidden';

			// Focus management
			const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
			if (focusable) focusable.focus();

			// Video handling
			const video = modal.querySelector('video');
			if (video) {
				const source = video.querySelector('source');
				if (source && source.dataset.src && !source.src) {
					source.src = source.dataset.src;
					video.load();
				}
				video.play().catch(e => console.debug('Auto-play prevented:', e));
			}
		},

		close: function (modalId) {
			const modal = document.getElementById(modalId);
			if (!modal) return;

			modal.classList.remove('active');
			modal.setAttribute('aria-hidden', 'true');
			document.body.style.overflow = '';

			// Video handling
			const video = modal.querySelector('video');
			if (video) video.pause();

			// Restore focus
			if (state.lastFocusedElement) {
				state.lastFocusedElement.focus();
			}
		}
	};

	// Expose Modal API globally for HTML onclick handlers
	window.openModal = Modal.open;
	window.closeModal = Modal.close;

	// Global Event Listeners for Modals
	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') {
			const activeModal = document.querySelector('.modal.active');
			if (activeModal) Modal.close(activeModal.id);
		}

		// Focus Trap inside Modal
		if (event.key === 'Tab') {
			const activeModal = document.querySelector('.modal.active');
			if (activeModal) {
				const focusables = activeModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
				const first = focusables[0];
				const last = focusables[focusables.length - 1];

				if (event.shiftKey) {
					if (document.activeElement === first) {
						last.focus();
						event.preventDefault();
					}
				} else {
					if (document.activeElement === last) {
						first.focus();
						event.preventDefault();
					}
				}
			}
		}
	});

	// --- Animation System ---
	const Animation = {
		init: function () {
			if (state.isReducedMotion) return;

			const observer = new IntersectionObserver((entries) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						entry.target.classList.add('visible');
						observer.unobserve(entry.target); // Optimize: stop observing once visible
					}
				});
			}, CONFIG.observer);

			document.querySelectorAll('section > div').forEach(el => {
				el.classList.add('fade-in-up');
				observer.observe(el);
			});
		}
	};

	// --- Spotlight Effect (Optimized) ---
	const Spotlight = {
		init: function () {
			if (state.isReducedMotion || window.matchMedia('(hover: none)').matches) return;

			let ticking = false;
			document.addEventListener('mousemove', (e) => {
				if (!ticking) {
					window.requestAnimationFrame(() => {
						this.update(e);
						ticking = false;
					});
					ticking = true;
				}
			}, { passive: true });
		},

		update: function (e) {
			// Convert HTMLCollection to Array for better performance in loop if needed, 
			// but for loop is fast enough. Caching elements.spotlightCards is key.
			for (let i = 0; i < elements.spotlightCards.length; i++) {
				const card = elements.spotlightCards[i];
				const rect = card.getBoundingClientRect();
				const x = e.clientX - rect.left;
				const y = e.clientY - rect.top;

				card.style.setProperty('--mouse-x', `${x}px`);
				card.style.setProperty('--mouse-y', `${y}px`);
			}
		}
	};

	// --- Video System ---
	const VideoManager = {
		init: function () {
			if (!elements.heroVideo) return;

			// Network-aware loading
			if ('connection' in navigator) {
				const conn = navigator.connection;
				if (conn && (conn.saveData || conn.effectiveType.includes('2g'))) {
					elements.heroVideo.preload = 'none';
					return; // Don't auto-play heavy videos on slow connections
				}
			}

			this.preloadNext();
			elements.heroVideo.addEventListener('ended', this.handleEnd.bind(this));
			this.scheduleRotation();

			// Lazy load other videos
			this.initLazyLoading();
		},

		initLazyLoading: function () {
			const lazyVideos = document.querySelectorAll('video[loading="lazy"]');
			if ('IntersectionObserver' in window) {
				const videoObserver = new IntersectionObserver((entries) => {
					entries.forEach(entry => {
						if (entry.isIntersecting) {
							const video = entry.target;
							// Only play if not already playing
							if (video.paused) {
								video.play().catch(() => { });
							}
							videoObserver.unobserve(video);
						}
					});
				});
				lazyVideos.forEach(v => videoObserver.observe(v));
			}
		},

		preloadNext: function () {
			const nextIndex = (state.currentVideoIndex + 1) % Object.keys(CONFIG.video.files).length;
			const keys = Object.keys(CONFIG.video.files);
			const nextSrc = getVideoPath(keys[nextIndex]);

			if (!state.preloadedVideos.has(nextSrc)) {
				const link = document.createElement('link');
				link.rel = 'prefetch';
				link.as = 'video';
				link.href = nextSrc;
				document.head.appendChild(link);
				state.preloadedVideos.add(nextSrc);
			}
		},

		scheduleRotation: function () {
			const keys = Object.keys(CONFIG.video.files);
			const currentKey = keys[state.currentVideoIndex];
			const isAnalytics = CONFIG.video.files[currentKey] === CONFIG.video.files.analytics;

			if (isAnalytics) return; // Wait for 'ended' event

			if (state.rotationTimeout) clearTimeout(state.rotationTimeout);
			state.rotationTimeout = setTimeout(() => this.rotate(), CONFIG.video.rotationInterval);
		},

		rotate: function () {
			const keys = Object.keys(CONFIG.video.files);
			state.currentVideoIndex = (state.currentVideoIndex + 1) % keys.length;
			const nextKey = keys[state.currentVideoIndex];
			const nextSrc = getVideoPath(nextKey);
			const isAnalytics = nextKey === 'analytics';

			elements.heroVideo.style.opacity = '0';

			setTimeout(() => {
				const source = elements.heroVideo.querySelector('source');
				if (!source) return;

				source.src = nextSrc;
				elements.heroVideo.loop = !isAnalytics;
				if (isAnalytics) {
					elements.heroVideo.removeAttribute('loop');
				} else {
					elements.heroVideo.setAttribute('loop', '');
				}

				elements.heroVideo.load();
				elements.heroVideo.play()
					.then(() => {
						elements.heroVideo.style.opacity = '0.5';
						this.preloadNext();
						this.scheduleRotation();
					})
					.catch(err => {
						console.warn('Video rotation failed:', err);
						elements.heroVideo.style.opacity = '0.5';
						this.scheduleRotation(); // Try next rotation anyway
					});
			}, CONFIG.video.fadeDuration);
		},

		handleEnd: function () {
			const keys = Object.keys(CONFIG.video.files);
			const currentKey = keys[state.currentVideoIndex];
			if (currentKey === 'analytics') {
				setTimeout(() => this.rotate(), 100);
			}
		}
	};

	// --- Initialization ---
	document.addEventListener('DOMContentLoaded', () => {
		document.body.classList.add('loaded');
		Animation.init();
		Spotlight.init();
		VideoManager.init();
	});

})();
