// Функция для оптимизации загрузки видео
document.addEventListener('DOMContentLoaded', function() {
    // Находим все видео на странице
    const videos = document.querySelectorAll('video[data-lazy]');
    
    // Создаем observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Если элемент входит в зону видимости
            if (entry.isIntersecting) {
                const video = entry.target;
                // Загружаем источник видео
                if (video.dataset.src) {
                    video.src = video.dataset.src;
                    video.removeAttribute('data-src');
                }
                // Запускаем воспроизведение если нужно
                if (video.dataset.autoplay) {
                    video.play().catch(function(error) {
                        console.log("Воспроизведение видео отложено:", error);
                    });
                }
                // Перестаем наблюдать за этим видео
                observer.unobserve(video);
            }
        });
    }, {
        // Загружаем видео когда оно на 50px приближается к viewport
        rootMargin: '50px'
    });
    
    // Начинаем наблюдение за всеми видео
    videos.forEach(video => {
        observer.observe(video);
    });
});
