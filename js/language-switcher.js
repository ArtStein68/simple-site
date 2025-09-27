// Оборачиваем весь код в функцию, чтобы её можно было вызвать вручную после загрузки футера.
function initializeLanguageSwitcher() {
    // Ждем, пока элементы выпадающего списка станут доступными в DOM
    setTimeout(() => {
        const dropdownItems = document.querySelectorAll('[data-lang]');
        
        if (!dropdownItems || dropdownItems.length === 0) {
            console.log('Элементы переключателя языков не найдены. Попробуем снова.');
            return;
        }

        dropdownItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const lang = this.getAttribute('data-lang');
                console.log('Выбранный язык:', lang);

                if (lang === 'ru') {
                    // Принудительный редирект на русскую версию
                    window.location.href = 'https://ru.ai-video-expert.online/contact.html';
                } else {
                    // Принудительный редирект на английскую версию
                    window.location.href = 'https://www.ai-video-expert.online/contact.html';
                }
            });
        });
    }, 1000); // Даём время для загрузки динамического контента
}

// Инициализация при готовности DOM
document.addEventListener('DOMContentLoaded', initializeLanguageSwitcher);

// Повторная попытка инициализации при загрузке футера
document.addEventListener('footerLoaded', initializeLanguageSwitcher);