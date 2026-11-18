# 5. Segurança e LGPD

## 5.1 Dados pessoais tratados e base legal

O sistema trata **dois grupos de dados**, com finalidades diferentes (BRASIL, 2018). Na fase de pesquisa, todos os usuários da ferramenta são também participantes; por isso a base legal adotada é o **consentimento** (art. 7º, I), registrado na tabela `consents` (RF13) e no TCLE.

**Controlador:** o pesquisador responsável, sob orientação docente, até que a coordenação do curso confirme se a instituição assume esse papel. `[[confirmar com a coordenação]]`

### a) Usuários da ferramenta
| Dado | Finalidade | Base legal (LGPD) | Retenção |
|---|---|---|---|
| E-mail | Login e recuperação de acesso | Consentimento (art. 7º, I), no aceite do termo de uso | Enquanto a conta existir |
| Nome | Identificação na interface | Art. 7º, I | Enquanto a conta existir |
| Perfil (estudante, professor, administrador) | Controle de acesso (RF08) | Art. 7º, I | Enquanto a conta existir |
| *Hash* da senha | Autenticação | Art. 7º, I | Enquanto a conta existir |
| Histórico de análises e respostas do quiz | Estudo e acompanhamento do próprio usuário (RF05, RF16) | Art. 7º, I | Enquanto a conta existir; excluído junto com a conta |
| Imagens enviadas | Análise solicitada pelo usuário | Art. 7º, I | Até a exclusão da análise; imagens sem análise associada são eliminadas por rotina diária |
| Registros de acesso (logs) | Segurança e diagnóstico de falhas | Legítimo interesse (art. 7º, IX) | 90 dias; sem e-mail nem imagem (RNF04) |
| Registro de consentimento | Prova do consentimento (art. 8º, §2º) | Cumprimento de obrigação (art. 7º, II) | Mantido anonimizado após a exclusão da conta, pelo prazo de guarda da pesquisa |

### b) Participantes da pesquisa (elicitação, avaliação do protótipo, estudo de caso)
| Dado | Finalidade | Base legal (LGPD) | Retenção |
|---|---|---|---|
| Respostas dos formulários (sem nome nem e-mail; **pseudonimizadas**, porque data e hora e a amostra pequena tornam a reidentificação possível) | Elicitação e avaliação | Consentimento (art. 7º, I), registrado no TCLE | Prazo definido no TCLE e no parecer ético `[[definir]]`; depois, eliminação |
| Contato voluntário para testar o protótipo | Convite para testes | Consentimento (art. 7º, I), em formulário separado e guardado em arquivo separado das respostas | Até o fim da pesquisa |

**Operador e transferência internacional:** os formulários usam o Google Forms, cujos servidores podem ficar fora do Brasil (art. 33). Os dados são exportados para arquivo local protegido e apagados do Google após a consolidação, e o TCLE informa isso ao participante.

**Imagens de pacientes:** os *patches* do NCT-CRC-HE-100K são públicos e não contêm identificação de pacientes (KATHER et al., 2018). Como a elicitação mostrou que a maioria enviaria fotos de microscópio, o sistema adota três barreiras:
1. a área de envio orienta a enviar só o recorte de tecido e proíbe etiqueta da lâmina, número de exame ou nome (RN08);
2. o termo de uso proíbe o envio de dados de pacientes;
3. os metadados EXIF (inclusive localização) são removidos antes do armazenamento.

**Direitos do titular (art. 18):** o usuário pode consultar, exportar os próprios dados (independentemente do CSV pedagógico do RF10) e excluir a conta. A exclusão remove análises, imagens e tentativas do quiz; o registro de consentimento é anonimizado e mantido como prova (`ON DELETE SET NULL` em `infra/db/schema.sql`).

## 5.2 Autenticação
- Login por e-mail e senha. Senha com **mínimo de 10 caracteres**, verificada contra uma lista de senhas comuns.
- Senhas armazenadas apenas como **hash Argon2id** (RNF07).
- Sessão em **cookie `HttpOnly`, `Secure` e `SameSite=Lax`**, com expiração por inatividade (8 h) e renovação. A sessão fica no Redis (`session:{id}`, com tempo de vida de 8 h) e pode ser revogada. Nenhum token fica acessível ao JavaScript.
- **Recuperação de acesso:** na fase de pesquisa, a senha é redefinida pelo administrador; a recuperação por e-mail fica para depois do MVP.
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

As ameaças seguem a lista OWASP Top 10 de 2021 (OPEN WORLDWIDE APPLICATION SECURITY PROJECT, 2021).

| Ameaça | Medida |
|---|---|
| Injeção | Consultas parametrizadas via ORM; validação de toda entrada com Zod (TypeScript) e Pydantic (Python) |
| Upload malicioso | Verificação do **tipo real** pelo conteúdo do arquivo, não pela extensão; limite de 5 MB; reprocessamento da imagem antes de armazenar (remove metadados EXIF) |
| XSS | Escape automático do React; *Content Security Policy* restritiva |
| CSRF | Cookie `SameSite`; verificação de origem nas rotas que alteram dados |
| Quebra de controle de acesso | RBAC no servidor; testes automatizados de acesso indevido (CT16) |
| Abuso / negação de serviço | Limite de 30 envios por minuto por usuário e 5 conexões de eventos simultâneas (Redis); a fila controla a carga sobre a inferência |
| Dependências vulneráveis | Dependabot e `npm audit` / `pip-audit` na integração contínua |
| Registro insuficiente | Logs estruturados com `correlation_id`, sem dados pessoais |
