"""
Backend opcional para EntreNos - App de Cartas de Amor

Este backend é OPCIONAL e FUTURO.
O app frontend funciona 100% sem ele usando apenas Firebase.

Uso futuro planejado:
- Notificações push personalizadas
- Processamento de mensagens automatizado
- Análise de sentimentos
- Agendamento de mensagens
- Integração com outros serviços

Para executar (quando implementado):
pip install -r requirements.txt
python app.py
"""

from flask import Flask, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)

# Habilitar CORS para permitir requisições do frontend
CORS(app)

@app.route('/')
def home():
    """Página inicial do backend - informações gerais"""
    return jsonify({
        "app": "EntreNos Backend",
        "status": "ativo",
        "message": "Backend opcional para funcionalidades futuras",
        "frontend_standalone": True,
        "endpoints_disponiveis": [
            "/ping - Teste de conexão",
            "/health - Status do servidor"
        ]
    })

@app.route('/ping')
def ping():
    """Endpoint de teste - verifica se o backend está respondendo"""
    return jsonify({
        "status": "success",
        "message": "EntreNos ativo",
        "backend_version": "0.1.0",
        "frontend_integration": "pendente"
    })

@app.route('/health')
def health():
    """Endpoint de health check para monitoramento"""
    return jsonify({
        "status": "healthy",
        "service": "entrenos-backend",
        "version": "0.1.0",
        "environment": os.getenv('FLASK_ENV', 'development')
    })

# Endpoints futuros (comentados - não implementados ainda)
"""
@app.route('/api/notifications/send', methods=['POST'])
def send_notification():
    # Futuro: enviar notificações push personalizadas
    pass

@app.route('/api/messages/analyze', methods=['POST'])
def analyze_message():
    # Futuro: análise de sentimentos das mensagens
    pass

@app.route('/api/messages/schedule', methods=['POST'])
def schedule_message():
    # Futuro: agendamento de mensagens
    pass

@app.route('/api/users/preferences', methods=['GET', 'PUT'])
def user_preferences():
    # Futuro: gerenciar preferências do usuário
    pass
"""

# Endpoint para envio de push notifications (implementado)
@app.route('/api/push/send', methods=['POST'])
def send_push_notification():
    """
    Envia notificação push para dispositivos mobile
    Estrutura esperada:
    {
        "target_user_id": "user_B",
        "title": "Nova mensagem",
        "body": "Alguém deixou uma mensagem para você",
        "data": {
            "message_id": "abc123",
            "type": "frase|carta"
        }
    }
    """
    try:
        from firebase_admin import messaging, credentials
        import firebase_admin
        
        # Inicializar Firebase Admin SDK (se ainda não inicializado)
        if not firebase_admin._apps:
            # Substitua com suas credenciais reais do Firebase
            cred = credentials.Certificate("path/to/serviceAccountKey.json")
            firebase_admin.initialize_app(cred)
        
        data = request.get_json()
        
        # Validar dados
        required_fields = ['target_user_id', 'title', 'body']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "error": f"Campo obrigatório: {field}",
                    "status": "error"
                }), 400
        
        target_user_id = data['target_user_id']
        title = data['title']
        body = data['body']
        notification_data = data.get('data', {})
        
        # Buscar tokens ativos do usuário no Firestore
        # Nota: Isso requer integração com Firestore ou Firebase Admin SDK
        
        # Simulação - na implementação real, buscar do Firestore
        target_tokens = []  # Array de tokens FCM do usuário alvo
        
        if not target_tokens:
            return jsonify({
                "error": "Nenhum token encontrado para o usuário",
                "status": "error"
            }), 404
        
        # Criar mensagem multicast
        message = messaging.MulticastMessage(
            notification=messaging.Notification(
                title=title,
                body=body
            ),
            data=notification_data,
            tokens=target_tokens,
            android=messaging.AndroidConfig(
                priority='high',
                notification=messaging.AndroidNotification(
                    icon='ic_notification',
                    color='#d4c4a8',
                    sound='default',
                    click_action='FLUTTER_NOTIFICATION_CLICK'
                )
            ),
            apns=messaging.APNSConfig(
                payload=messaging.APNSPayload(
                    aps=messaging.Aps(
                        sound='default',
                        badge=1,
                        content_available=True
                    )
                )
            )
        )
        
        # Enviar notificação
        response = messaging.send_multicast(message)
        
        # Processar resultados
        success_count = response.success_count
        failure_count = response.failure_count
        
        # Limpar tokens inválidos
        if failure_count > 0:
            invalid_tokens = []
            for idx, result in enumerate(response.responses):
                if not result.success:
                    invalid_tokens.append(target_tokens[idx])
            
            # Remover tokens inválidos do Firestore
            # implementar cleanup_tokens(invalid_tokens)
        
        return jsonify({
            "status": "success",
            "message": "Notificação enviada",
            "success_count": success_count,
            "failure_count": failure_count,
            "invalid_tokens": len(invalid_tokens) if failure_count > 0 else 0
        })
        
    except Exception as e:
        return jsonify({
            "error": f"Erro ao enviar notificação: {str(e)}",
            "status": "error"
        }), 500

# Endpoint para registrar token (alternativa ao registro direto no frontend)
@app.route('/api/push/register', methods=['POST'])
def register_push_token():
    """
    Registra token FCM para um usuário
    Alternativa ao registro direto no frontend
    """
    try:
        data = request.get_json()
        
        required_fields = ['token', 'user_id', 'platform']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "error": f"Campo obrigatório: {field}",
                    "status": "error"
                }), 400
        
        # Salvar token no Firestore
        # Implementar lógica de salvamento
        
        return jsonify({
            "status": "success",
            "message": "Token registrado com sucesso"
        })
        
    except Exception as e:
        return jsonify({
            "error": f"Erro ao registrar token: {str(e)}",
            "status": "error"
        }), 500

if __name__ == '__main__':
    # Configuração de desenvolvimento
    debug_mode = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    port = int(os.getenv('PORT', 5000))
    
    print("🚀 Iniciando backend EntreNos (opcional)")
    print("📝 Lembre-se: o frontend funciona independentemente!")
    print(f"🌐 Servidor rodando em: http://localhost:{port}")
    print(f"🔍 Teste: http://localhost:{port}/ping")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug_mode
    )
