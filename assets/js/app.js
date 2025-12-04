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
		isFading: false,
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

			// record the intended (visible) target opacity from CSS (fallback to 0.5)
			try {
				state.heroTargetOpacity = parseFloat(window.getComputedStyle(elements.heroVideo).opacity) || 0.5;
			} catch (e) {
				state.heroTargetOpacity = 0.5;
			}

			// Network-aware loading
			if ('connection' in navigator) {
				const conn = navigator.connection;
				if (conn && (conn.saveData || conn.effectiveType.includes('2g'))) {
					elements.heroVideo.preload = 'none';
					return; // Don't auto-play heavy videos on slow connections
				}
			}

			// Ensure we don't loop the first video so it can end and rotate
			elements.heroVideo.removeAttribute('loop');

			this.preloadNext();
			elements.heroVideo.addEventListener('ended', this.handleEnd.bind(this));
			elements.heroVideo.addEventListener('timeupdate', this.handleTimeUpdate.bind(this), { passive: true });

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

		/**
		 * Fade helper — changes opacity using CSS transition and resolves when done.
		 */
		fadeTo: function (targetOpacity, durationOverride) {
			if (!elements.heroVideo) return Promise.resolve();

			const duration = typeof durationOverride === 'number' ? durationOverride : CONFIG.video.fadeDuration;
			const el = elements.heroVideo;

			return new Promise(resolve => {
				// 1. Ensure transition property is set explicitly
				el.style.transition = `opacity ${duration}ms ease-in-out`;
				
				// 2. Force reflow to ensure the browser registers the transition start state
				void el.offsetHeight;

				// 3. Set the target opacity
				el.style.opacity = String(targetOpacity);

				// 4. Wait for the duration (plus a tiny buffer) using setTimeout
				// This is more reliable than transitionend which can be missed if the tab is backgrounded
				setTimeout(() => {
					resolve();
				}, duration + 50);
			});
		},

		handleTimeUpdate: function () {
			if (!elements.heroVideo || state.isFading) return;

			const duration = elements.heroVideo.duration || 0;
			const current = elements.heroVideo.currentTime || 0;
			const remaining = duration - current;

			// Trigger rotation shortly before end to allow for cross-fade effect.
			// We use a buffer slightly larger than the fade duration to ensure the fade-out
			// completes before the video actually ends.
			// fadeDuration (0.8s) + buffer (0.4s) = 1.2s before end
			if (duration > 0 && remaining <= (CONFIG.video.fadeDuration / 1000) + 0.4) {
				this.rotate();
			}
		},

		rotate: function () {
			if (!elements.heroVideo || state.isFading) return;

			const keys = Object.keys(CONFIG.video.files);
			const nextIndex = (state.currentVideoIndex + 1) % keys.length;
			const nextKey = keys[nextIndex];
			const nextSrc = getVideoPath(nextKey);

			// Mark busy so additional rotate/ended/timeupdate events don't double-run
			state.isFading = true;

			const doSwap = async () => {
				try {
					// 1. Fade out to black/transparent
					await this.fadeTo(0);

					// 2. Swap source
					const source = elements.heroVideo.querySelector('source');
					if (source) {
						source.src = nextSrc;
						// Update the video element src as well if it was set directly
						if (elements.heroVideo.src) elements.heroVideo.src = nextSrc;
					} else {
						elements.heroVideo.src = nextSrc;
					}

					elements.heroVideo.removeAttribute('loop');
					elements.heroVideo.load();

					// 3. Wait for play to actually start
					try {
						await elements.heroVideo.play();
					} catch (err) {
						console.warn('Video rotation failed:', err);
					}

					// 4. Fade back in to original opacity
					await this.fadeTo(state.heroTargetOpacity || 0.5);

					// 5. Update state
					state.currentVideoIndex = nextIndex;
					this.preloadNext();
				} catch (e) {
					console.error('Rotation error:', e);
				} finally {
					state.isFading = false;
				}
			};

			// Execute immediately
			doSwap();
		},

		handleEnd: function () {
			// Fallback if timeupdate didn't catch it (e.g. user tabbed away)
			if (!state.isFading) {
				this.rotate();
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
