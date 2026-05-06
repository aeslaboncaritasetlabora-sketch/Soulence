
        function openSearch() {
            document.getElementById('searchModal').classList.add('active');
            document.getElementById('searchInput').focus();
        }

        function closeSearch() {
            document.getElementById('searchModal').classList.remove('active');
        }

        document.getElementById('searchModal').addEventListener('click', function(e) {
            if (e.target === this) closeSearch();
        });

        document.getElementById('searchInput').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const items = document.querySelectorAll('.search-result-item');
            
            items.forEach(item => {
                const name = item.querySelector('h4').textContent.toLowerCase();
                item.style.display = name.includes(searchTerm) ? 'flex' : 'none';
            });
        });

        function showMatch() {
            document.getElementById('matchOverlay').classList.add('active');
            const btn = document.querySelector('.like-btn i');
            btn.classList.remove('far');
            btn.classList.add('fas');
        }

        function hideMatch() {
            document.getElementById('matchOverlay').classList.remove('active');
        }

        window.addEventListener('load', function() {
            const video = document.getElementById('matchVideo');
            const fallback = document.getElementById('matchFallback');
            
            video.addEventListener('canplay', function() {
                video.style.display = 'block';
                fallback.style.display = 'none';
            });
            
            video.addEventListener('error', function() {
                video.style.display = 'none';
                fallback.style.display = 'flex';
            });
            
            video.play().catch(() => {
                video.style.display = 'none';
                fallback.style.display = 'flex';
            });
        });
