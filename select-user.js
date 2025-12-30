// Gerenciador de seleção de usuário
class UserSelectionManager {
    constructor() {
        this.userCards = document.querySelectorAll('.user-card');
        this.init();
    }

    init() {
        // Adicionar event listeners aos cards
        this.userCards.forEach(card => {
            card.addEventListener('click', (e) => this.handleUserSelection(e));
            
            // Adicionar feedback visual para touch
            card.addEventListener('touchstart', (e) => {
                card.style.transform = 'translateY(-2px) scale(1.01)';
            });
            
            card.addEventListener('touchend', (e) => {
                setTimeout(() => {
                    card.style.transform = '';
                }, 150);
            });
        });

        // Verificar se já existe usuário selecionado
        this.checkExistingUser();
    }

    handleUserSelection(event) {
        const card = event.currentTarget;
        const userId = card.dataset.user;
        const userName = card.dataset.name;

        // Prevenir múltiplos cliques
        if (card.classList.contains('selecting') || card.classList.contains('loading')) {
            return;
        }

        // Adicionar estado de seleção
        card.classList.add('selecting', 'loading');
        const statusElement = card.querySelector('.selection-status');
        statusElement.textContent = `Entrando como ${userName}...`;

        // Salvar usuário no localStorage
        this.saveUserSelection(userId, userName);

        // Simular tempo de carregamento para feedback visual
        setTimeout(() => {
            this.redirectToApp();
        }, 1500);
    }

    saveUserSelection(userId, userName) {
        const userData = {
            id: userId,
            name: userName,
            selectedAt: new Date().toISOString()
        };

        localStorage.setItem('entrenos_selected_user', JSON.stringify(userData));
        
        // Também salvar o ID do usuário para uso no app
        localStorage.setItem('entrenos_user_id', userId);
        localStorage.setItem('entrenos_user_name', userName);
    }

    redirectToApp() {
        // Redirecionar para a página principal do app
        window.location.href = 'app.html';
    }

    checkExistingUser() {
        const savedUser = localStorage.getItem('entrenos_selected_user');
        
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                console.log(`Usuário já selecionado: ${userData.name} (${userData.id})`);
                
                // Opcional: redirecionar automaticamente se já existe usuário
                // this.redirectToApp();
            } catch (error) {
                console.error('Erro ao ler usuário salvo:', error);
                // Limpar dados corrompidos
                localStorage.removeItem('entrenos_selected_user');
                localStorage.removeItem('entrenos_user_id');
                localStorage.removeItem('entrenos_user_name');
            }
        }
    }

    // Método para limpar seleção (útil para debugging)
    clearSelection() {
        localStorage.removeItem('entrenos_selected_user');
        localStorage.removeItem('entrenos_user_id');
        localStorage.removeItem('entrenos_user_name');
        console.log('Seleção de usuário limpa');
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    window.userSelection = new UserSelectionManager();
    
    // Adicionar método global para debugging (opcional)
    window.clearUserSelection = () => {
        window.userSelection.clearSelection();
        location.reload();
    };
});

// Prevenir comportamento padrão de toque em mobile
document.addEventListener('touchstart', function(e) {
    if (e.target.closest('.user-card')) {
        e.preventDefault();
    }
}, { passive: false });
