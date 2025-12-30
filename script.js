// Configuração do Firebase (substitua com suas credenciais reais)
const firebaseConfig = {
    apiKey: "AIzaSyDemoKey-SubstituaComSuaChaveReal",
    authDomain: "entrenos-app.firebaseapp.com",
    projectId: "entrenos-app",
    storageBucket: "entrenos-app.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456789"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const messaging = firebase.messaging();

// Sistema de Notificações Push
class PushNotificationManager {
    constructor() {
        this.isSupported = this.checkSupport();
        this.token = null;
        this.userId = this.getSelectedUserId(); // Usuário selecionado dinamicamente
        this.init();
    }

    // Obter ID do usuário selecionado
    getSelectedUserId() {
        return localStorage.getItem('entrenos_user_id') || 'usu-Lucas';
    }

    // Verificar suporte a notificações
    checkSupport() {
        const isServiceWorkerSupported = 'serviceWorker' in navigator;
        const isNotificationSupported = 'Notification' in window;
        const isMessagingSupported = messaging !== undefined;
        
        return isServiceWorkerSupported && isNotificationSupported && isMessagingSupported;
    }

    // Inicializar sistema de push
    async init() {
        if (!this.isSupported) {
            console.log('Notificações push não suportadas neste navegador');
            this.showUnsupportedMessage();
            return;
        }

        try {
            // Solicitar permissão
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                await this.getToken();
                await this.setupServiceWorker();
            } else {
                console.log('Permissão de notificação negada');
                this.showPermissionDeniedMessage();
            }
        } catch (error) {
            console.error('Erro ao inicializar notificações:', error);
        }
    }

    // Obter token FCM
    async getToken() {
        try {
            this.token = await messaging.getToken();
            console.log('Token FCM obtido:', this.token);
            
            // Salvar token no Firestore
            await this.saveTokenToFirestore();
            
            // Escutar mudanças de token
            messaging.onTokenRefresh(() => {
                this.handleTokenRefresh();
            });
            
            // Configurar handlers de mensagens
            this.setupMessageHandlers();
            
        } catch (error) {
            console.error('Erro ao obter token FCM:', error);
        }
    }

    // Salvar token no Firestore
    async saveTokenToFirestore() {
        if (!this.token) return;

        try {
            const tokenData = {
                token: this.token,
                userId: this.userId,
                platform: this.detectPlatform(),
                userAgent: navigator.userAgent,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                isActive: true
            };

            // Salvar na coleção de tokens
            await db.collection('push_tokens').doc(this.token).set(tokenData);
            console.log('Token salvo no Firestore');
            
        } catch (error) {
            console.error('Erro ao salvar token:', error);
        }
    }

    // Detectar plataforma
    detectPlatform() {
        const ua = navigator.userAgent;
        if (/Android/i.test(ua)) return 'android';
        if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
        if (/Windows/i.test(ua)) return 'windows';
        if (/Mac/i.test(ua)) return 'macos';
        return 'web';
    }

    // Configurar Service Worker
    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registrado:', registration);
                
                // Configurar messaging com service worker
                messaging.useServiceWorker(registration);
                
            } catch (error) {
                console.error('Erro ao registrar Service Worker:', error);
            }
        }
    }

    // Configurar handlers de mensagens
    setupMessageHandlers() {
        // Mensagem recebida quando app está em foreground
        messaging.onMessage((payload) => {
            console.log('Mensagem recebida em foreground:', payload);
            this.showForegroundNotification(payload);
        });

        // Mensagem recebida quando app está em background (handle pelo service worker)
        // Isso será configurado no service worker
    }

    // Mostrar notificação em foreground
    showForegroundNotification(payload) {
        const { notification, data } = payload;
        
        // Criar notificação customizada
        const notificationOptions = {
            body: notification.body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'entrenos-message',
            requireInteraction: false,
            silent: false,
            data: data
        };

        new Notification(notification.title, notificationOptions);
    }

    // Lidar com refresh de token
    async handleTokenRefresh() {
        try {
            const newToken = await messaging.getToken();
            console.log('Token atualizado:', newToken);
            
            // Desativar token antigo
            if (this.token) {
                await this.deactivateToken(this.token);
            }
            
            // Ativar novo token
            this.token = newToken;
            await this.saveTokenToFirestore();
            
        } catch (error) {
            console.error('Erro ao atualizar token:', error);
        }
    }

    // Desativar token no Firestore
    async deactivateToken(token) {
        try {
            await db.collection('push_tokens').doc(token).update({
                isActive: false,
                deactivatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Erro ao desativar token:', error);
        }
    }

    // Mostrar mensagem de não suporte
    showUnsupportedMessage() {
        const message = 'Notificações push não disponíveis neste navegador. Use o app móvel para receber notificações.';
        this.showInfoMessage(message);
    }

    // Mostrar mensagem de permissão negada
    showPermissionDeniedMessage() {
        const message = 'Notificações foram bloqueadas. Habilite nas configurações do navegador para receber alertas de novas mensagens.';
        this.showInfoMessage(message);
    }

    // Mostrar mensagem informativa
    showInfoMessage(message) {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'push-info-message';
        infoDiv.textContent = message;
        
        Object.assign(infoDiv.style, {
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #f0e6d2 0%, #e8d4b0 100%)',
            color: '#5d4e37',
            padding: '12px 20px',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontFamily: 'Georgia, serif',
            boxShadow: '0 2px 10px rgba(93, 78, 55, 0.2)',
            zIndex: '999',
            maxWidth: '90%',
            textAlign: 'center',
            lineHeight: '1.4'
        });
        
        document.body.appendChild(infoDiv);
        
        // Remover após 8 segundos
        setTimeout(() => {
            infoDiv.style.opacity = '0';
            setTimeout(() => {
                if (infoDiv.parentNode) {
                    infoDiv.parentNode.removeChild(infoDiv);
                }
            }, 300);
        }, 8000);
    }
}

// Função para enviar mensagem rápida da sidebar
function enviarMensagemRapida(mensagem) {
    // Pedir confirmação antes de enviar
    const confirmacao = confirm(`Tem certeza que deseja enviar esta mensagem?\n\n"${mensagem}"`);
    
    if (confirmacao) {
        // Salvar mensagem no Firestore
        salvarMensagemNoFirestore(mensagem, 'frase');
    }
}

// Função para enviar a carta personalizada
function enviarCarta() {
    const textarea = document.getElementById('message');
    const mensagem = textarea.value.trim();
    
    // Verificar se a mensagem não está vazia
    if (mensagem === '') {
        mostrarConfirmacaoVisual('❤️ Por favor, escreva uma mensagem antes de enviar.', 'error');
        textarea.focus();
        return;
    }
    
    // Pedir confirmação antes de enviar
    const confirmacao = confirm(`Tem certeza que deseja enviar esta carta?\n\n"${mensagem.substring(0, 100)}${mensagem.length > 100 ? '...' : ''}"`);
    
    if (confirmacao) {
        // Salvar mensagem no Firestore
        salvarMensagemNoFirestore(mensagem, 'carta');
    }
}

// Função para salvar mensagem no Firestore
async function salvarMensagemNoFirestore(texto, tipo) {
    try {
        // Obter ID do usuário selecionado
        const currentUserId = localStorage.getItem('entrenos_user_id') || 'usu-Lucas';
        
        // Estrutura da mensagem conforme especificado
        const mensagem = {
            texto: texto,
            tipo: tipo, // "frase" ou "carta"
            de: currentUserId, // usuário selecionado dinamicamente
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Salvar na coleção "mensagens"
        await db.collection('mensagens').add(mensagem);
        
        // Limpar textarea se for carta
        if (tipo === 'carta') {
            const textarea = document.getElementById('message');
            textarea.value = '';
            textarea.focus();
        }
        
        // Mostrar confirmação visual suave
        const mensagemSucesso = tipo === 'frase' 
            ? `✨ Mensagem enviada com sucesso!\n\n"${texto}"`
            : `💌 Carta enviada com sucesso!\n\nSua mensagem foi entregue com amor.`;
        
        mostrarConfirmacaoVisual(mensagemSucesso, 'success');
        
    } catch (error) {
        console.error('Erro ao salvar mensagem:', error);
        mostrarConfirmacaoVisual('❌ Erro ao enviar mensagem. Tente novamente.', 'error');
    }
}

// Função para mostrar confirmação visual suave
function mostrarConfirmacaoVisual(mensagem, tipo = 'success') {
    // Criar elemento de notificação
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao ${tipo}`;
    notificacao.textContent = mensagem;
    
    // Estilos da notificação
    Object.assign(notificacao.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: tipo === 'success' 
            ? 'linear-gradient(135deg, #d4c4a8 0%, #c4b5a0 100%)'
            : 'linear-gradient(135deg, #e8b4b8 0%, #d49096 100%)',
        color: '#ffffff',
        padding: '15px 25px',
        borderRadius: '25px',
        fontSize: '1rem',
        fontFamily: 'Georgia, serif',
        boxShadow: '0 4px 15px rgba(93, 78, 55, 0.3)',
        zIndex: '1000',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease',
        maxWidth: '300px',
        textAlign: 'center',
        whiteSpace: 'pre-line'
    });
    
    // Adicionar ao body
    document.body.appendChild(notificacao);
    
    // Animar entrada
    setTimeout(() => {
        notificacao.style.opacity = '1';
        notificacao.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notificacao.style.opacity = '0';
        notificacao.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notificacao.parentNode) {
                notificacao.parentNode.removeChild(notificacao);
            }
        }, 300);
    }, 3000);
}

// Sistema de detecção de novas mensagens e controle de leitura
class MessageManager {
    constructor() {
        this.lastCheckTime = this.getLastCheckTime();
        this.readMessages = this.getReadMessages();
        this.messagesListener = null;
        this.currentUserId = this.getSelectedUserId();
        this.init();
    }

    // Obter ID do usuário selecionado
    getSelectedUserId() {
        return localStorage.getItem('entrenos_user_id') || 'usu-Lucas';
    }

    // Obter nome do usuário selecionado
    getSelectedUserName() {
        return localStorage.getItem('entrenos_user_name') || 'Lucas';
    }

    // Obter ID do outro usuário
    getOtherUserId() {
        const currentUserId = this.getSelectedUserId();
        return currentUserId === 'usu-Lucas' ? 'usu-Emilly' : 'usu-Lucas';
    }

    // Obter nome do outro usuário
    getOtherUserName() {
        const currentUserId = this.getSelectedUserId();
        return currentUserId === 'usu-Lucas' ? 'Emilly' : 'Lucas';
    }

    // Obter último horário verificado do localStorage
    getLastCheckTime() {
        const stored = localStorage.getItem('entrenos_last_check');
        return stored ? new Date(stored) : new Date(0);
    }

    // Salvar último horário verificado
    setLastCheckTime(time) {
        localStorage.setItem('entrenos_last_check', time.toISOString());
        this.lastCheckTime = time;
    }

    // Obter mensagens lidas do localStorage
    getReadMessages() {
        const stored = localStorage.getItem('entrenos_read_messages');
        return stored ? JSON.parse(stored) : [];
    }

    // Marcar mensagem como lida
    markAsRead(messageId) {
        if (!this.readMessages.includes(messageId)) {
            this.readMessages.push(messageId);
            localStorage.setItem('entrenos_read_messages', JSON.stringify(this.readMessages));
        }
    }

    // Verificar se mensagem é nova
    isNewMessage(timestamp, messageId) {
        const messageTime = timestamp.toDate();
        const isAfterLastCheck = messageTime > this.lastCheckTime;
        const wasNotRead = !this.readMessages.includes(messageId);
        return isAfterLastCheck && wasNotRead;
    }

    // Mostrar aviso suave de nova mensagem
    showNewMessageAlert() {
        // Remover aviso anterior se existir
        const existingAlert = document.querySelector('.new-message-alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        // Criar novo aviso
        const alert = document.createElement('div');
        alert.className = 'new-message-alert';
        alert.textContent = `${this.getOtherUserName()} deixou algo aqui pra você 💕`;
        
        document.body.appendChild(alert);

        // Animar entrada
        setTimeout(() => {
            alert.classList.add('show');
        }, 100);

        // Remover após 4 segundos
        setTimeout(() => {
            alert.classList.remove('show');
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.parentNode.removeChild(alert);
                }
            }, 500);
        }, 4000);
    }

    // Formatar timestamp para exibição
    formatTimestamp(timestamp) {
        const date = timestamp.toDate();
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'agora pouco';
        if (diffMins < 60) return `há ${diffMins} min`;
        if (diffHours < 24) return `há ${diffHours} h`;
        if (diffDays < 7) return `há ${diffDays} dias`;
        
        return date.toLocaleDateString('pt-BR');
    }

    // Renderizar mensagem no histórico
    renderMessage(message, messageId) {
        const messagesList = document.getElementById('messagesList');
        const emptyHistory = messagesList.querySelector('.empty-history');
        
        if (emptyHistory) {
            emptyHistory.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message-item';
        
        const isNew = this.isNewMessage(message.timestamp, messageId);
        const isFromOtherUser = message.de !== this.currentUserId;
        
        if (isNew && isFromOtherUser) {
            messageDiv.classList.add('new-message');
            this.markAsRead(messageId);
            this.showNewMessageAlert();
        }

        const senderName = message.de === this.currentUserId ? 'Eu' : this.getOtherUserName();
        const typeLabel = message.tipo === 'frase' ? 'Mensagem rápida' : 'Carta';

        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-type">${typeLabel}</span>
                <span class="message-time">${this.formatTimestamp(message.timestamp)}</span>
            </div>
            <div class="message-text">${this.escapeHtml(message.texto)}</div>
            <div class="message-sender">Enviado por ${senderName}</div>
        `;

        // Inserir no início da lista
        messagesList.insertBefore(messageDiv, messagesList.firstChild);

        // Atualizar contador
        this.updateMessageCount();
    }

    // Escapar HTML para evitar XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Atualizar contador de mensagens
    updateMessageCount() {
        const messagesList = document.getElementById('messagesList');
        const count = messagesList.querySelectorAll('.message-item').length;
        const countElement = document.querySelector('.history-count');
        if (countElement) {
            countElement.textContent = `${count} mensagem${count !== 1 ? 's' : ''}`;
        }
    }

    // Inicializar listener do Firestore
    init() {
        this.messagesListener = db.collection('mensagens')
            .orderBy('timestamp', 'desc')
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const message = change.doc.data();
                        const messageId = change.doc.id;
                        this.renderMessage(message, messageId);
                    }
                });
                
                // Atualizar último horário verificado
                this.setLastCheckTime(new Date());
            }, (error) => {
                console.error('Erro ao ouvir mensagens:', error);
            });
    }

    // Limpar listener quando necessário
    destroy() {
        if (this.messagesListener) {
            this.messagesListener();
        }
    }
}

// Função para adicionar efeitos visuais aos botões (opcional)
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se usuário está selecionado
    const selectedUser = localStorage.getItem('entrenos_user_id');
    if (!selectedUser) {
        // Redirecionar para seleção de usuário se não houver usuário
        window.location.href = 'select-user.html';
        return;
    }
    
    // Inicializar gerenciador de mensagens
    window.messageManager = new MessageManager();
    
    // Inicializar gerenciador de notificações push
    window.pushManager = new PushNotificationManager();
    
    // Adicionar efeito de digitação suave ao textarea
    const textarea = document.getElementById('message');
    if (textarea) {
        textarea.addEventListener('focus', function() {
            this.style.transform = 'scale(1.02)';
        });
        
        textarea.addEventListener('blur', function() {
            this.style.transform = 'scale(1)';
        });
    }
    
    // Adicionar contador de caracteres (opcional)
    const messageButtons = document.querySelectorAll('.message-btn');
    messageButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });
});

// Função para atalhos de teclado (opcional)
document.addEventListener('keydown', function(event) {
    // Ctrl + Enter para enviar a carta
    if (event.ctrlKey && event.key === 'Enter') {
        const textarea = document.getElementById('message');
        if (document.activeElement === textarea) {
            enviarCarta();
        }
    }
    
    // Esc para limpar o textarea
    if (event.key === 'Escape') {
        const textarea = document.getElementById('message');
        if (document.activeElement === textarea) {
            if (textarea.value.trim() !== '') {
                const confirmacao = confirm('Deseja limpar a mensagem?');
                if (confirmacao) {
                    textarea.value = '';
                }
            }
        }
    }
});

// PWA Service Worker Registration
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js")
            .then(reg => console.log("Service Worker registrado:", reg.scope))
            .catch(err => console.error("Erro no SW:", err));
    });
}
