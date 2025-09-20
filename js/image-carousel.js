document.addEventListener('DOMContentLoaded', () => {
    const imageCarousels = document.querySelectorAll('.image-carousel');

    imageCarousels.forEach(imgElement => {
        const imageUrls = imgElement.dataset.images.split(',').map(url => url.trim());
        const interval = parseInt(imgElement.dataset.interval) || 2000; 
        let currentIndex = 0;

        imageUrls.forEach(url => {
            const img = new Image();
            img.src = url;
        });

        function changeImage() {
            currentIndex = (currentIndex + 1) % imageUrls.length;
            imgElement.src = imageUrls[currentIndex];
        }

        setInterval(changeImage, interval);
    });
});