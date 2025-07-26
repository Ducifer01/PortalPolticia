// Funcionalidades do website
document.addEventListener('DOMContentLoaded', function() {
    
    // Navegação suave
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Highlight da seção ativa na navegação
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
        
        let currentSection = '';
        const navHeight = document.querySelector('.navbar').offsetHeight;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - navHeight - 50;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
    
    // Adicionar estilo para link ativo
    const style = document.createElement('style');
    style.textContent = `
        .nav-menu a.active {
            color: #fbbf24 !important;
            font-weight: 600;
        }
    `;
    document.head.appendChild(style);
    
    // Atualizar link ativo no scroll
    window.addEventListener('scroll', updateActiveNavLink);
    updateActiveNavLink(); // Executar uma vez no carregamento
    
    // Animação de entrada para elementos
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Aplicar animação aos cards e elementos
    const animatedElements = document.querySelectorAll('.analysis-card, .argument-card, .timeline-item, .reference-item');
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
    
    // Funcionalidade de expandir/colapsar argumentos (opcional)
    const argumentCards = document.querySelectorAll('.argument-card');
    
    argumentCards.forEach(card => {
        const proSection = card.querySelector('.argument-pro');
        const contraSection = card.querySelector('.argument-contra');
        
        if (proSection && contraSection) {
            // Inicialmente mostrar apenas o argumento pró
            contraSection.style.display = 'none';
            
            // Adicionar botão para expandir
            const expandButton = document.createElement('button');
            expandButton.textContent = 'Ver Refutação';
            expandButton.className = 'expand-button';
            expandButton.style.cssText = `
                background: #3b82f6;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 1rem;
                font-weight: 500;
                transition: background-color 0.3s ease;
            `;
            
            expandButton.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#2563eb';
            });
            
            expandButton.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '#3b82f6';
            });
            
            expandButton.addEventListener('click', function() {
                if (contraSection.style.display === 'none') {
                    contraSection.style.display = 'block';
                    this.textContent = 'Ocultar Refutação';
                    
                    // Animação suave
                    contraSection.style.opacity = '0';
                    contraSection.style.transform = 'translateY(-10px)';
                    
                    setTimeout(() => {
                        contraSection.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        contraSection.style.opacity = '1';
                        contraSection.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    contraSection.style.display = 'none';
                    this.textContent = 'Ver Refutação';
                }
            });
            
            proSection.appendChild(expandButton);
        }
    });
    
    // Funcionalidade de busca (opcional)
    function addSearchFunctionality() {
        const searchContainer = document.createElement('div');
        searchContainer.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 999;
            background: white;
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            display: none;
        `;
        
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Buscar no texto...';
        searchInput.style.cssText = `
            width: 200px;
            padding: 8px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 14px;
        `;
        
        searchContainer.appendChild(searchInput);
        document.body.appendChild(searchContainer);
        
        // Atalho de teclado para busca (Ctrl+F)
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                searchContainer.style.display = searchContainer.style.display === 'none' ? 'block' : 'none';
                if (searchContainer.style.display === 'block') {
                    searchInput.focus();
                }
            }
        });
        
        // Funcionalidade de busca
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const textElements = document.querySelectorAll('p, h1, h2, h3, h4, li');
            
            textElements.forEach(element => {
                const text = element.textContent.toLowerCase();
                if (searchTerm && text.includes(searchTerm)) {
                    element.style.backgroundColor = '#fef3c7';
                } else {
                    element.style.backgroundColor = '';
                }
            });
        });
    }
    
    // Adicionar funcionalidade de busca
    addSearchFunctionality();
    
    // Botão de voltar ao topo
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = '↑';
    backToTopButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #3b82f6;
        color: white;
        border: none;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    document.body.appendChild(backToTopButton);
    
    // Mostrar/ocultar botão baseado no scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopButton.style.opacity = '1';
        } else {
            backToTopButton.style.opacity = '0';
        }
    });
    
    // Contador de referências clicadas (analytics simples)
    const referenceLinks = document.querySelectorAll('.reference-link');
    let referenceClicks = {};
    
    referenceLinks.forEach(link => {
        link.addEventListener('click', function() {
            const refId = this.getAttribute('href');
            referenceClicks[refId] = (referenceClicks[refId] || 0) + 1;
            console.log('Referência clicada:', refId, 'Total de cliques:', referenceClicks[refId]);
        });
    });
    
    // Funcionalidade de compartilhamento (se necessário)
    function addShareButtons() {
        const shareContainer = document.createElement('div');
        shareContainer.style.cssText = `
            position: fixed;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 999;
        `;
        
        const shareButtons = [
            {
                name: 'Twitter',
                url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(document.title)}&url=${encodeURIComponent(window.location.href)}`,
                color: '#1da1f2'
            },
            {
                name: 'Facebook',
                url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                color: '#4267b2'
            },
            {
                name: 'WhatsApp',
                url: `https://wa.me/?text=${encodeURIComponent(document.title + ' ' + window.location.href)}`,
                color: '#25d366'
            }
        ];
        
        shareButtons.forEach(button => {
            const btn = document.createElement('a');
            btn.href = button.url;
            btn.target = '_blank';
            btn.textContent = button.name.charAt(0);
            btn.style.cssText = `
                width: 40px;
                height: 40px;
                background: ${button.color};
                color: white;
                text-decoration: none;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 14px;
                transition: transform 0.3s ease;
            `;
            
            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.1)';
            });
            
            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
            
            shareContainer.appendChild(btn);
        });
        
        document.body.appendChild(shareContainer);
    }
    
    // Adicionar botões de compartilhamento (comentado por padrão)
    // addShareButtons();
    
    console.log('Website carregado com sucesso!');
    console.log('Funcionalidades ativas: navegação suave, animações, busca (Ctrl+F), botão voltar ao topo');
});

