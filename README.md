# EntreNos - App de Cartas de Amor

## FASE 2.1 - Conexão Firebase Firestore

### Configuração do Firebase

1. **Criar projeto no Firebase Console**
   - Acesse https://console.firebase.google.com
   - Crie um novo projeto chamado "entrenos-app"

2. **Configurar Firestore**
   - No menu lateral, vá para "Firestore Database"
   - Clique em "Criar banco de dados"
   - Escolha "Iniciar em modo de teste" (por enquanto)
   - Selecione uma localização (ex: "southamerica-east1")

3. **Obter credenciais**
   - Em Configurações do projeto > Geral
   - Em "Seus aplicativos", clique no ícone da web (</>)
   - Copie o objeto de configuração firebaseConfig

4. **Atualizar as credenciais**
   - Abra o arquivo `script.js`
   - Substitua o objeto `firebaseConfig` com suas credenciais reais

### Estrutura de Dados

As mensagens são salvas na coleção `mensagens` com a seguinte estrutura:

```javascript
{
  texto: string,           // conteúdo da mensagem
  tipo: "frase" | "carta", // tipo de mensagem
  de: "A" | "B",          // remetente (fixo "A" por enquanto)
  timestamp: serverTimestamp() // data/hora do envio
}
```

### Funcionalidades Implementadas

- ✅ Sidebar com mensagens rápidas
- ✅ Carta personalizada com textarea
- ✅ Confirmação antes de enviar
- ✅ Salvamento real no Firebase Firestore
- ✅ Notificações visuais suaves (sem alerts)
- ✅ Layout responsivo mantido
- ✅ Tratamento de erros

### Como Usar

1. Configure o Firebase conforme instruções acima
2. Abra `index.html` no navegador
3. Envie mensagens usando os botões da sidebar ou escrevendo uma carta
4. As mensagens ficam salvas no Firestore em tempo real

### Próximos Passos (Fases Futuras)

- Sistema de login/autenticação
- Troca dinâmica entre usuário "A" e "B"
- Notificações push
- Histórico de mensagens
- Interface para visualizar mensagens recebidas
