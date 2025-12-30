# Backend Opcional - EntreNos

## ⚠️ IMPORTANTE: Backend é OPCIONAL

Este backend **NÃO é obrigatório** para o funcionamento do EntreNos. O aplicativo funciona 100% usando apenas:
- HTML/CSS/JavaScript (frontend)
- Firebase Firestore (banco de dados)

## 🎯 Propósito do Backend

Este backend foi criado como **preparação para funcionalidades futuras**, sem afetar o funcionamento atual.

## 🚀 Funcionalidades Futuras Planejadas

### Notificações Push Personalizadas
- Enviar notificações personalizadas para dispositivos móveis
- Agendar notificações em horários específicos
- Notificar quando novas mensagens chegarem

### Análise de Inteligência
- Análise de sentimentos das mensagens
- Sugestões de respostas baseadas no contexto
- Detecção de padrões de comunicação

### Automações
- Agendamento de mensagens para datas especiais
- Lembretes de aniversários e datas comemorativas
- Backup automático de conversas

### Integrações Externas
- Conexão com serviços de música (playlist do casal)
- Integração com calendários compartilhados
- Sincronização com outras plataformas de mensagem

## 🛠️ Como Usar (Quando Implementado)

### Instalação
```bash
cd backend
pip install -r requirements.txt
```

### Execução
```bash
python app.py
```

### Endpoints Disponíveis
- `GET /` - Informações gerais do backend
- `GET /ping` - Teste de conexão
- `GET /health` - Status do servidor

## 📁 Estrutura do Projeto

```
backend/
├── app.py              # Aplicação Flask principal
├── requirements.txt    # Dependências Python
└── README.md          # Este arquivo
```

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente (Opcional)
```bash
FLASK_ENV=development
FLASK_DEBUG=True
PORT=5000
```

## 🚨 Importante

1. **O frontend NÃO depende deste backend**
2. **Firebase continua sendo o banco de dados principal**
3. **Este backend é apenas para funcionalidades extras**
4. **Nenhuma chamada fetch é obrigatória no frontend**

## 🔄 Status Atual

- ✅ Estrutura básica criada
- ✅ Endpoints de teste funcionando
- ⏳ Funcionalidades futuras não implementadas
- ⏳ Integração com frontend pendente

## 📞 Suporte

Se tiver dúvidas sobre o backend opcional, lembre-se:
- O app funciona perfeitamente sem ele
- Ele é um extra para funcionalidades futuras
- Foque primeiro no frontend + Firebase
