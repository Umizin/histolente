# 5. Segurança e LGPD

## 5.1 Dados pessoais tratados e base legal

O sistema trata **dois grupos de dados distintos**, com finalidades e bases legais diferentes (Lei nº 13.709/2018 — LGPD).

### a) Usuários da ferramenta
| Dado | Finalidade | Base legal (LGPD) | Retenção |
|---|---|---|---|
| E-mail | Login e recuperação de acesso | Execução de contrato / procedimentos preliminares a pedido do titular (art. 7º, V) | Enquanto a conta existir |
| Nome | Identificação na interface | Art. 7º, V | Enquanto a conta existir |
| Perfil (estudante, professor, administrador) | Controle de acesso (RF08) | Art. 7º, V | Enquanto a conta existir |
| *Hash* da senha | Autenticação | Art. 7º, V | Enquanto a conta existir |
| Histórico de análises e respostas do quiz | Estudo e acompanhamento do próprio usuário (RF05, RF16) | Art. 7º, V | Enquanto a conta existir; excluído junto com a conta |
| Registros de acesso (logs) | Segurança e diagnóstico de falhas | Legítimo interesse (art. 7º, IX) | 90 dias; sem e-mail nem imagem (RNF04) |

### b) Participantes da pesquisa (elicitação, usabilidade, estudo de caso)
| Dado | Finalidade | Base legal (LGPD) | Retenção |
|---|---|---|---|
| Respostas do formulário (anônimas, sem nome nem e-mail) | Elicitação de requisitos | Consentimento (art. 7º, I), registrado no TCLE; realização de estudos por órgão de pesquisa (art. 7º, IV) `[[confirmar com o orientador]]` | Conforme o TCLE e a orientação do CEP |
| Respostas do SUS e das entrevistas de avaliação (pseudonimizadas: E01, P01…) | Validação do artefato | Idem | Idem |
| Contato voluntário para testar o protótipo | Convite para testes | Consentimento (art. 7º, I), em formulário separado | Até o fim da pesquisa |

**Dados que o sistema não trata:**
- **Dados de pacientes.** Todas as imagens são *patches* anônimos do dataset público NCT-CRC-HE-100K ou imagens enviadas pelo usuário.
- A interface alerta o usuário para **não enviar imagens identificáveis** de pacientes.

**Direitos do titular (art. 18):** o usuário pode consultar, exportar (RF10) e excluir a própria conta e o histórico. A exclusão remove análises, tentativas do quiz e consentimentos em cascata (ver `ON DELETE CASCADE` em `infra/db/schema.sql`).

## 5.2 Autenticação
- Login por e-mail e senha. Senha com **mínimo de 10 caracteres**, verificada contra uma lista de senhas comuns.
- Senhas armazenadas apenas como **hash Argon2id** (RNF07).
- Sessão em **cookie `HttpOnly`, `Secure` e `SameSite=Lax`**, com expiração por inatividade (8 h) e renovação. Nenhum token fica acessível ao JavaScript.
- **Limite de tentativas:** 5 falhas de login por 15 minutos por conta e IP, com bloqueio temporário.
- Mensagens de erro genéricas ("e-mail ou senha inválidos"), para não revelar se a conta existe.

## 5.3 Autorização (controle de acesso por perfil — RBAC)

| Recurso / ação | Estudante | Professor | Administrador |
|---|---|---|---|
| Enviar *patch*, usar galeria e quiz | ✅ | ✅ | ✅ |
| Ver e exportar **o próprio** histórico | ✅ | ✅ | ✅ |
| Enviar lote (até 50 imagens) | — | ✅ | ✅ |
| Ver análises de outros usuários | — | — | — (só métricas agregadas) |
| Definir a versão ativa do modelo | — | — | ✅ |
| Gerenciar usuários e perfis | — | — | ✅ |

- A autorização é verificada **no servidor**, em todo caso de uso (`Usuario.podeVerAnalise`), e nunca só na interface.
- Acesso a recurso de outro usuário retorna **404**, para não revelar que o recurso existe (RN06).

## 5.4 Criptografia e proteção dos dados
| Onde | Medida |
|---|---|
| Em trânsito | HTTPS (TLS 1.2 ou superior) em qualquer ambiente fora do localhost; HSTS ativado |
| Senhas | *Hash* Argon2id com sal por usuário, não reversível |
| Em repouso | Disco criptografado no servidor de hospedagem; *backups* do PostgreSQL criptografados |
| Segredos | Somente em variáveis de ambiente e no cofre de segredos da plataforma de deploy; nunca no Git (`.gitignore` bloqueia `.env`) |
| Comunicação interna | Serviços em redes Docker segregadas; o serviço de inferência não alcança o PostgreSQL (RNF06) |
| Respostas da pesquisa | Fora do Git; armazenamento local protegido por senha |

## 5.5 Proteções da aplicação (OWASP Top 10)
| Ameaça | Medida |
|---|---|
| Injeção | Consultas parametrizadas via ORM; validação de toda entrada com Zod (TypeScript) e Pydantic (Python) |
| Upload malicioso | Verificação do **tipo real** pelo conteúdo do arquivo, não pela extensão; limite de 5 MB; reprocessamento da imagem antes de armazenar (remove metadados EXIF) |
| XSS | Escape automático do React; *Content Security Policy* restritiva |
| CSRF | Cookie `SameSite`; verificação de origem nas rotas que alteram dados |
| Quebra de controle de acesso | RBAC no servidor; testes automatizados de acesso indevido (CT16) |
| Abuso / negação de serviço | Limite de requisições por usuário (Redis); a fila controla a carga sobre a inferência |
| Dependências vulneráveis | Dependabot e `npm audit` / `pip-audit` na integração contínua |
| Registro insuficiente | Logs estruturados com `correlation_id`, sem dados pessoais |
