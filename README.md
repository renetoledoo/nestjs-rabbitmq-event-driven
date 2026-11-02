<div align="center">

# Event-Driven Architecture with NestJS & RabbitMQ

**Arquitetura orientada a eventos com microsserviços NestJS, RabbitMQ e comunicação assíncrona.**

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

## Visão geral

Uma requisição HTTP cria um pedido no **Order Service**, que publica o evento `orders.created` no RabbitMQ. A intenção é permitir que **Payment Service** e **Inventory Service** recebam o mesmo evento por meio de filas próprias, sem chamadas HTTP diretas entre os serviços.

O projeto também explora uma fila de falhas para pagamentos (`payment.failed`) e um consumidor dedicado a inspecioná-las.

## Arquitetura

<img width="1672" height="941" alt="Arquitetura EDA com NestJS e RabbitMQ" src="https://github.com/user-attachments/assets/ad0e2ed1-cab7-4764-8d05-90e27124b109" />

> **Sobre o desenho:** representação conceitual do fluxo de eventos. O Inventory Service atualmente apenas registra o evento recebido; não reserva estoque. O gateway de pagamento é simulado e lança um erro intencional. A ligação e o provisionamento da dead-letter exchange precisam ser verificados na instância RabbitMQ antes de considerar o caminho de DLQ funcional.

### Serviços

| Serviço | Responsabilidade no código atual | Entrada / fila |
| --- | --- | --- |
| **Order Service** | Recebe pedidos via REST, valida o DTO e publica `orders.created` | `POST /order/create` |
| **Payment Service** | Consome o evento, simula um gateway, tenta novamente em caso de erro e envia ACK/NACK | `payment.orders.created` |
| **Inventory Service** | Consome o evento e registra os dados no console | `inventory.orders.created` |
| **Payment DLQ Service** | Consome e registra mensagens recebidas na fila de falhas | `payment.failed` |

### Fluxo do evento

1. O cliente envia `POST /order/create` para o **Order Service**.
2. O produtor publica uma mensagem no exchange `orders.exchange`, do tipo `topic`, com routing key `orders.created`.
3. Filas independentes são previstas para os consumidores de pagamento e inventário, permitindo que cada um receba sua cópia do evento quando os bindings estiverem configurados.
4. O **Payment Service** executa a simulação de pagamento com um decorator de retry: até **3 tentativas**, com intervalo de **5 segundos** entre tentativas.
5. Em caso de sucesso, o consumidor confirma a mensagem com `ack`; após falha, usa `nack(message, false, false)` para rejeitar sem recolocar na mesma fila.
6. A fila de pagamento está configurada com referência à DLX `payment.dlx` e à routing key `payment.failed`. Para o redirecionamento ocorrer, a exchange e seus bindings precisam existir corretamente no broker.

> [!IMPORTANT]
> O retorno booleano de `channel.publish()` no produtor **não confirma entrega ao consumidor nem persistência no broker**: indica controle de fluxo do buffer de escrita. Publisher confirms seriam uma evolução importante.

## Estrutura do projeto

```text
.
├── order-service/           # API HTTP e publicação de eventos
│   └── docker-compose.yml   # RabbitMQ local com Management UI
├── payment-service/         # Consumidor e simulação de pagamento
├── inventory-service/       # Consumidor de eventos de pedidos
├── payment-dlq-service/     # Consumidor da fila de falhas
├── assets/
│   └── architecture.png
└── README.md
```

## Como executar localmente

**Pré-requisitos:** Node.js e npm compatíveis com os projetos, Docker com Compose e quatro terminais para os serviços NestJS.

### 1. Subir o RabbitMQ

```bash
cd order-service
cp .env.example .env
```

Configure `RABBITMQ_DEFAULT_USER`, `RABBITMQ_DEFAULT_PASS` e `RABBITMQ_URL` em `order-service/.env`. Exemplo de URL para desenvolvimento: `amqp://usuario:senha@localhost:5672`.

```bash
docker compose up -d
```

Painel RabbitMQ: **http://localhost:15672** (credenciais definidas no `.env`).

### 2. Configurar cada serviço

Na raiz do repositório, copie o `.env.example` para `.env` em `payment-service`, `inventory-service` e `payment-dlq-service`. Defina a mesma `RABBITMQ_URL` em todos.

### 3. Iniciar os serviços

Execute em terminais separados, a partir da raiz:

```bash
cd order-service && npm ci && npm run start:dev
```

```bash
cd payment-service && npm ci && npm run start:dev
```

```bash
cd inventory-service && npm ci && npm run start:dev
```

```bash
cd payment-dlq-service && npm ci && npm run start:dev
```

> [!WARNING]
> A criação e os bindings das exchanges/filas devem ser conferidos no painel do RabbitMQ. O `docker-compose.yml` sobe apenas o broker, não os quatro serviços. O fluxo completo pode exigir ajustes de topologia e inicialização antes de funcionar de ponta a ponta.

### 4. Publicar um pedido de teste

```bash
curl -X POST http://localhost:3000/order/create \
  -H 'Content-Type: application/json' \
  -d '{
    "customerId": "customer-001",
    "items": [{"productId": "product-001", "quantity": 2, "unitPrice": 49.9}],
    "payment": {"method": "credit_card", "installment": 1},
    "delivery": {"addressId": "address-001"}
  }'
```

Acompanhe os logs dos consumidores e as filas no RabbitMQ Management UI. **O gateway simulado atualmente sempre lança uma exceção**, portanto o fluxo de sucesso do pagamento não é demonstrado sem alterar o mock.

## Conceitos de arquitetura

- **Event-Driven Architecture (EDA):** serviços reagem a eventos publicados por outros componentes.
- **Topic exchange e routing key:** roteamento de mensagens para filas vinculadas.
- **Pub/Sub vs. competing consumers:** filas distintas recebem cópias; consumidores da mesma fila disputam mensagens.
- **ACK/NACK:** confirmação ou rejeição explícita de mensagens.
- **Retry:** repetição local da operação antes de rejeitar a mensagem.
- **Dead Letter Queue (DLQ):** destino para mensagens rejeitadas, quando a topologia está corretamente configurada.
- **Desacoplamento:** o produtor publica eventos sem chamar diretamente os consumidores.

## Roadmap

- [x] Separar serviços NestJS por responsabilidade
- [x] Publicar eventos com `amqplib`
- [x] Consumir eventos com `@EventPattern()`
- [x] Implementar retry local no processamento de pagamentos
- [x] Implementar ACK/NACK no consumidor de pagamentos
- [ ] Validar provisionamento da DLX, bindings e redirecionamento real para DLQ
- [ ] Implementar confirmação de publicação (publisher confirms)
- [ ] Persistir pedidos, pagamentos e estoque em bancos de dados
- [ ] Implementar idempotência de consumidores
- [ ] Adicionar correlation IDs, logs estruturados e tracing
- [ ] Criar testes de integração e testes end-to-end com RabbitMQ
- [ ] Evoluir o tratamento de falhas e estratégias de recuperação

## Limitações conhecidas

O projeto ainda não persiste pedidos, não reserva estoque e não executa pagamentos reais. A implementação de retry ocorre **dentro do consumidor**, não por filas de retry. O serviço de DLQ registra mensagens, mas não as reprocessa. Além disso, a topologia completa de dead lettering não é provisionada explicitamente no código do produtor nem no Compose. Esses pontos estão mapeados para futuras evoluções.

## Referências

- [Documentação oficial — NestJS Microservices](https://docs.nestjs.com/microservices/basics)
- [Documentação oficial — NestJS RabbitMQ](https://docs.nestjs.com/microservices/rabbitmq)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/tutorials)
- [Booking Microservices NestJS — referência de organização](https://github.com/meysamhadeli/booking-microservices-nestjs)

---


