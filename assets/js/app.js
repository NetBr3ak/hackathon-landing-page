// Video Configuration - Single source of truth
const VIDEO_CONFIG = {
	basePath: 'assets/videos/',
	files: {
		hero: 'hero-video.mp4',
		analytics: 'analytics.mp4',
		errorHandler: 'error_handler.mp4'
	},
	getPath: function (key) {
		return this.basePath + this.files[key];
	}
};

// Modal Functions
function openModal(modalId) {
	const modal = document.getElementById(modalId);
	modal.classList.add('active');
	document.body.style.overflow = 'hidden';

	// Lazy load and auto-play video when modal opens
	const video = modal.querySelector('video');
	if (video) {
		const source = video.querySelector('source');
		if (source && source.dataset.src && !source.src) {
			source.src = source.dataset.src;
			video.load();
		}
		video.play();
	}
}

function closeModal(modalId) {
	const modal = document.getElementById(modalId);
	modal.classList.remove('active');
	document.body.style.overflow = 'auto';

	// Pause video when modal closes
	const video = modal.querySelector('video');
	if (video) {
		video.pause();
	}
}

// Close modal with ESC key
document.addEventListener('keydown', function (event) {
	if (event.key === 'Escape') {
		const activeModal = document.querySelector('.modal.active');
		if (activeModal) {
			activeModal.classList.remove('active');
			document.body.style.overflow = 'auto';

			// Pause video when closing with ESC
			const video = activeModal.querySelector('video');
			if (video) {
				video.pause();
			}
		}
	}
});

// Intersection Observer for fade-in animations
const observerOptions = {
	threshold: 0.1,
	rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
	entries.forEach(entry => {
		if (entry.isIntersecting) {
			entry.target.classList.add('visible');
		}
	});
}, observerOptions);

// Observe all sections for animations
document.addEventListener('DOMContentLoaded', () => {
	// Show page after fonts and critical content loaded
	document.body.classList.add('loaded');

	const animatedElements = document.querySelectorAll('section > div');
	animatedElements.forEach(el => {
		el.classList.add('fade-in-up');
		observer.observe(el);
	});

	// Lazy load videos on viewport enter
	const videos = document.querySelectorAll('video[loading="lazy"]');
	const videoObserver = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				const video = entry.target;
				video.play().catch(() => { });
				videoObserver.unobserve(video);
			}
		});
	});
	videos.forEach(video => videoObserver.observe(video));
});

// Spotlight Effect
document.addEventListener('mousemove', e => {
	const cards = document.getElementsByClassName('spotlight-card');
	for (const card of cards) {
		const rect = card.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		card.style.setProperty('--mouse-x', `${x}px`);
		card.style.setProperty('--mouse-y', `${y}px`);
	}
});

// Hero Video Rotation System
const heroVideo = document.getElementById('heroVideo');
const videoSources = [
	VIDEO_CONFIG.getPath('hero'),
	VIDEO_CONFIG.getPath('analytics'),
	VIDEO_CONFIG.getPath('errorHandler')
];
let currentVideoIndex = 0;
let rotationTimeout = null;
const preloadedVideos = new Set([videoSources[0]]); // Track preloaded videos

// Preload next video for smooth transitions (once per video)
function preloadNextVideo() {
	const nextIndex = (currentVideoIndex + 1) % videoSources.length;
	const nextSrc = videoSources[nextIndex];

	if (!preloadedVideos.has(nextSrc)) {
		const link = document.createElement('link');
		link.rel = 'prefetch';
		link.as = 'video';
		link.href = nextSrc;
		document.head.appendChild(link);
		preloadedVideos.add(nextSrc);
	}
}

function scheduleNextRotation() {
	const currentVideo = videoSources[currentVideoIndex];
	const isAnalytics = currentVideo === VIDEO_CONFIG.getPath('analytics');

	if (isAnalytics) {
		// For analytics, wait for video to end naturally
		// Event listener will handle rotation
		return;
	} else {
		// For hero-video and error_handler, rotate after 10 seconds
		if (rotationTimeout) clearTimeout(rotationTimeout);
		rotationTimeout = setTimeout(() => {
			rotateVideo();
		}, 10000);
	}
}

function rotateVideo() {
	currentVideoIndex = (currentVideoIndex + 1) % videoSources.length;
	const nextVideoSrc = videoSources[currentVideoIndex];
	const isAnalytics = nextVideoSrc === VIDEO_CONFIG.getPath('analytics');

	// Fade out
	heroVideo.style.opacity = '0';

	setTimeout(() => {
		// Change source
		const source = heroVideo.querySelector('source');
		source.src = nextVideoSrc;

		// For analytics.mp4, disable loop to play once completely
		if (isAnalytics) {
			heroVideo.loop = false;
			heroVideo.removeAttribute('loop');
		} else {
			heroVideo.loop = true;
			heroVideo.setAttribute('loop', '');
		}

		heroVideo.load();

		// Play and fade in
		heroVideo.play().then(() => {
			heroVideo.style.opacity = '0.5';
			preloadNextVideo();
			scheduleNextRotation();
		}).catch(err => {
			console.log('Video playback error:', err);
			heroVideo.style.opacity = '0.5';
			scheduleNextRotation();
		});
	}, 800);
}

// Handle video end event for analytics.mp4
function handleVideoEnd() {
	const currentVideo = videoSources[currentVideoIndex];
	if (currentVideo === VIDEO_CONFIG.getPath('analytics')) {
		// Analytics finished playing, rotate to error_handler
		setTimeout(() => {
			rotateVideo();
		}, 100);
	}
}

// Initialize video rotation system
if (heroVideo) {
	preloadNextVideo();
	heroVideo.addEventListener('ended', handleVideoEnd);
	scheduleNextRotation();

	// Optimize video quality based on connection
	if ('connection' in navigator) {
		const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
		if (connection && connection.effectiveType) {
			// For slow connections, reduce video loading priority
			if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
				heroVideo.preload = 'metadata';
			}
		}
	}
}
