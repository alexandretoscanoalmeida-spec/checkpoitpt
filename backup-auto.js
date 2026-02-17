/**
 * Sistema de Backup Automático - VERSÃO COM ATIVIDADE POR TRABALHADOR (ORDEM CRONOLÓGICA)
 */

class BackupAutoSystem {
    constructor() {
        console.log('🔧 [CONSTRUCTOR] Iniciando construção do BackupAutoSystem');
        this.initialized = false;
        this.checkInterval = null;
        this.init();
    }

    init() {
        console.log('🔧 [INIT] Iniciando init()');
        if (this.initialized) {
            console.log('🔧 [INIT] Já inicializado, abortando');
            return;
        }
        
        console.log('📧 Inicializando sistema de backup...');
        this.loadConfig();
        
        console.log('🔧 [INIT] Configurações carregadas:', {
            enabled: this.enabled,
            emailTo: this.emailTo,
            hasUserId: !!this.emailjsUserId,
            hasServiceId: !!this.emailjsServiceId,
            hasTemplateId: !!this.emailjsTemplateId
        });
        
        if (this.emailjsUserId && typeof emailjs !== 'undefined') {
            try {
                emailjs.init(this.emailjsUserId);
                console.log('✅ EmailJS inicializado com userId:', this.emailjsUserId.substring(0, 5) + '...');
            } catch (e) {
                console.error('❌ Erro EmailJS:', e);
            }
        } else {
            console.warn('⚠️ EmailJS não configurado ou não carregado');
        }
        
        if (this.checkInterval) {
            console.log('🔧 [INIT] Limpando intervalo anterior');
            clearInterval(this.checkInterval);
        }
        
        console.log('🔧 [INIT] Configurando intervalo de verificação (60 segundos)');
        this.checkInterval = setInterval(() => {
            console.log('⏰ [INTERVALO] Executando checkAutoBackup()');
            this.checkAutoBackup();
        }, 60 * 1000);
        
        console.log('🔧 [INIT] Configurando timeout para execução imediata (5 segundos)');
        setTimeout(() => {
            console.log('⏰ [TIMEOUT] Executando checkAutoBackup()');
            this.checkAutoBackup();
        }, 5000);
        
        this.initialized = true;
        console.log('✅ Sistema pronto - initialized =', this.initialized);
    }

    loadConfig() {
        console.log('🔧 [loadConfig] Carregando configurações do localStorage');
        
        this.enabled = localStorage.getItem('ponto_auto_backup_enabled') === 'true';
        console.log('🔧 [loadConfig] enabled =', this.enabled, '(raw:', localStorage.getItem('ponto_auto_backup_enabled'), ')');
        
        this.emailTo = localStorage.getItem('ponto_auto_backup_email');
        console.log('🔧 [loadConfig] emailTo =', this.emailTo);
        
        this.emailjsUserId = localStorage.getItem('ponto_emailjs_user_id');
        console.log('🔧 [loadConfig] emailjsUserId =', this.emailjsUserId ? '***' + this.emailjsUserId.slice(-4) : 'não definido');
        
        this.emailjsServiceId = localStorage.getItem('ponto_emailjs_service_id');
        console.log('🔧 [loadConfig] emailjsServiceId =', this.emailjsServiceId);
        
        this.emailjsTemplateId = localStorage.getItem('ponto_emailjs_template_id');
        console.log('🔧 [loadConfig] emailjsTemplateId =', this.emailjsTemplateId);
        
        this.scheduledTime = localStorage.getItem('ponto_auto_backup_time') || '18:00';
        console.log('🔧 [loadConfig] scheduledTime =', this.scheduledTime);
    }

    checkAutoBackup() {
        console.log('🔍 [checkAutoBackup] INICIANDO VERIFICAÇÃO');
        this.loadConfig();
        
        // VERIFICAÇÃO 1: Enabled
        console.log('🔍 [checkAutoBackup] Verificando enabled:', this.enabled);
        if (!this.enabled) {
            console.log('⏳ Backup automático desativado');
            return;
        }
        
        // VERIFICAÇÃO 2: EmailTo
        console.log('🔍 [checkAutoBackup] Verificando emailTo:', this.emailTo);
        if (!this.emailTo) {
            console.log('⏳ Email de destino não configurado');
            return;
        }
        
        // VERIFICAÇÃO 3: UserId
        console.log('🔍 [checkAutoBackup] Verificando emailjsUserId:', !!this.emailjsUserId);
        if (!this.emailjsUserId) {
            console.log('⏳ EmailJS User ID não configurado');
            return;
        }
        
        // VERIFICAÇÃO 4: ServiceId
        console.log('🔍 [checkAutoBackup] Verificando emailjsServiceId:', !!this.emailjsServiceId);
        if (!this.emailjsServiceId) {
            console.log('⏳ EmailJS Service ID não configurado');
            return;
        }
        
        // VERIFICAÇÃO 5: TemplateId
        console.log('🔍 [checkAutoBackup] Verificando emailjsTemplateId:', !!this.emailjsTemplateId);
        if (!this.emailjsTemplateId) {
            console.log('⏳ EmailJS Template ID não configurado');
            return;
        }
        
        // VERIFICAÇÃO 6: Último backup
        const lastBackup = localStorage.getItem('ponto_last_auto_backup');
        const today = new Date().toISOString().split('T')[0];
        console.log('🔍 [checkAutoBackup] lastBackup =', lastBackup, 'today =', today);
        
        if (lastBackup === today) {
            console.log('⏳ Backup já realizado hoje');
            return;
        }
        
        // VERIFICAÇÃO 7: Horário
        const now = new Date();
        const [sHour, sMin] = this.scheduledTime.split(':').map(Number);
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const scheduledMinutes = sHour * 60 + sMin;
        
        console.log('⏰ Horário atual:', now.getHours() + ':' + now.getMinutes());
        console.log('⏰ Horário programado:', sHour + ':' + sMin);
        console.log('⏰ Comparação:', currentMinutes, '>=', scheduledMinutes, '?', currentMinutes >= scheduledMinutes);
        
        // Executar backup se horário atingido
        if (currentMinutes >= scheduledMinutes) {
            console.log('🚀 Executando backup automático (horário atingido)');
            this.executeAutoBackup();
        } else {
            console.log('⏳ Aguardando horário programado');
        }
    }

    async executeAutoBackup() {
        console.log('📤 [executeAutoBackup] INICIANDO EXECUÇÃO DO BACKUP');
        
        try {
            // VERIFICAÇÃO 1: PontoApp
            console.log('📤 [executeAutoBackup] Verificando window.PontoApp:', !!window.PontoApp);
            if (!window.PontoApp) {
                throw new Error('PontoApp não inicializado');
            }
            
            // VERIFICAÇÃO 2: emailjs
            console.log('📤 [executeAutoBackup] Verificando typeof emailjs:', typeof emailjs);
            if (typeof emailjs === 'undefined') {
                throw new Error('EmailJS não carregado');
            }
            
            // VERIFICAÇÃO 3: Re-inicializar EmailJS
            console.log('📤 [executeAutoBackup] Reinicializando EmailJS com userId:', this.emailjsUserId ? '***' + this.emailjsUserId.slice(-4) : 'não definido');
            emailjs.init(this.emailjsUserId);
            
            console.log(`📧 Backup para: ${this.emailTo}`);
            
            // VERIFICAÇÃO 4: Carregar dados do PontoApp
            console.log('📤 [executeAutoBackup] Carregando workers...');
            const workers = window.PontoApp.workers || [];
            console.log('📤 workers carregados:', workers.length);
            
            console.log('📤 [executeAutoBackup] Carregando registries...');
            const allRegistries = window.PontoApp.registries || [];
            console.log('📤 registries totais:', allRegistries.length);
            
            // Buscar registos dos últimos 30 dias para atividade recente
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
            
            const recentRegistries = allRegistries
                .filter(r => r.date >= thirtyDaysAgoStr);
            
            console.log('📤 registries dos últimos 30 dias:', recentRegistries.length);
            
            console.log('📤 [executeAutoBackup] Carregando reports...');
            const reports = window.PontoApp.reports || [];
            console.log('📤 reports:', reports.length);
            
            console.log('📤 [executeAutoBackup] Carregando adminRegistries...');
            const adminRegistries = window.PontoApp.adminRegistries || [];
            console.log('📤 adminRegistries:', adminRegistries.length);
            
            console.log('📤 [executeAutoBackup] Carregando hoursBank...');
            const hoursBank = window.PontoApp.hoursBank || {};
            console.log('📤 hoursBank keys:', Object.keys(hoursBank).length);
            
            const backupDate = new Date().toLocaleDateString('pt-PT');
            const backupTime = new Date().toLocaleTimeString('pt-PT');
            console.log('📤 backupDate:', backupDate, 'backupTime:', backupTime);
            
            // Calcular estatísticas
            const today = new Date().toISOString().split('T')[0];
            console.log('📤 today (ISO):', today);
            
            const todayRegistries = allRegistries.filter(r => r.date === today);
            console.log('📤 todayRegistries:', todayRegistries.length);
            
            const activeWorkers = workers.filter(w => w.active);
            console.log('📤 activeWorkers:', activeWorkers.length);
            
            let totalBankHours = 0;
            let totalBankValue = 0;
            Object.values(hoursBank).forEach(bank => {
                totalBankHours += bank.hours || 0;
                totalBankValue += bank.value || 0;
            });
            console.log('📤 totalBankHours:', totalBankHours, 'totalBankValue:', totalBankValue);
            
            // ===== FORMATAR TRABALHADORES ATIVOS (COM HTML) =====
            console.log('📤 Formatando workersText com HTML...');
            let workersText = '';
            if (activeWorkers.length > 0) {
                workersText = activeWorkers.map(w => {
                    return `<div style="padding: 8px 0; border-bottom: 1px solid #eee;">
                                <strong>${w.name}</strong> - ${w.role || 'Sem cargo'} 
                                <span style="color: #666; float: right;">${w.hourlyRate || 0}€/h</span>
                            </div>`;
                }).join('');
                console.log('✅ workersText formatado com HTML, comprimento:', workersText.length);
            } else {
                workersText = '<div style="text-align: center; color: #666; padding: 10px;">Nenhum trabalhador ativo</div>';
                console.log('⚠️ Nenhum trabalhador ativo');
            }
            
            // ===== FORMATAR ATIVIDADE POR TRABALHADOR (ORDEM CRONOLÓGICA) =====
            console.log('📤 Formatando atividade por trabalhador (ordem cronológica)...');
            
            // Agrupar registos por trabalhador
            const registriesByWorker = {};
            recentRegistries.forEach(reg => {
                if (!registriesByWorker[reg.workerId]) {
                    registriesByWorker[reg.workerId] = [];
                }
                registriesByWorker[reg.workerId].push(reg);
            });
            
            const typeMap = {
                'in': '✅ Entrada',
                'out': '🔴 Saída',
                'break_start': '⏸️ Início Pausa',
                'break_end': '▶️ Fim Pausa'
            };
            
            let activityByWorkerHTML = '';
            
            // Ordenar trabalhadores por nome
            const sortedWorkers = [...activeWorkers].sort((a, b) => a.name.localeCompare(b.name));
            
            sortedWorkers.forEach(worker => {
                const workerRegistries = registriesByWorker[worker.id] || [];
                
                if (workerRegistries.length > 0) {
                    // ORDENAR REGISTOS DO MAIS ANTIGO PARA O MAIS RECENTE (ordem cronológica)
                    const sortedRegistries = [...workerRegistries].sort((a, b) => {
                        // Comparar primeiro por data, depois por hora
                        const dateA = new Date(a.date + 'T' + a.time);
                        const dateB = new Date(b.date + 'T' + b.time);
                        return dateA - dateB; // Mais antigo primeiro
                    });
                    
                    // Limitar a 15 registos por trabalhador
                    const limitedRegistries = sortedRegistries.slice(0, 15);
                    
                    // Criar tabela para este trabalhador
                    let workerTable = `
                        <div style="margin-bottom: 25px; border: 1px solid #2a5298; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <div style="background: linear-gradient(135deg, #1e3c72, #2a5298); color: white; padding: 12px 15px; font-weight: bold; font-size: 16px;">
                                👤 ${worker.name} - ${worker.role || 'Sem cargo'} (${worker.hourlyRate || 0}€/h)
                            </div>
                            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                                <thead>
                                    <tr style="background-color: #e8f0fe; border-bottom: 2px solid #2a5298;">
                                        <th style="padding: 10px; text-align: left;">Data</th>
                                        <th style="padding: 10px; text-align: left;">Hora</th>
                                        <th style="padding: 10px; text-align: left;">Tipo</th>
                                    </tr>
                                </thead>
                                <tbody>
                    `;
                    
                    limitedRegistries.forEach(reg => {
                        const type = typeMap[reg.type] || reg.type;
                        workerTable += `
                            <tr style="border-bottom: 1px solid #e9ecef;">
                                <td style="padding: 8px 10px;">${reg.date}</td>
                                <td style="padding: 8px 10px;">${reg.time}</td>
                                <td style="padding: 8px 10px;">${type}</td>
                            </tr>
                        `;
                    });
                    
                    if (workerRegistries.length > 15) {
                        workerTable += `
                            <tr>
                                <td colspan="3" style="padding: 8px 10px; text-align: center; color: #666; font-style: italic; background: #f8f9fa;">
                                    ... e mais ${workerRegistries.length - 15} registos
                                </td>
                            </tr>
                        `;
                    }
                    
                    workerTable += `
                                </tbody>
                            </table>
                        </div>
                    `;
                    
                    activityByWorkerHTML += workerTable;
                }
            });
            
            // Se não houver registos para nenhum trabalhador ativo
            if (!activityByWorkerHTML) {
                activityByWorkerHTML = '<div style="text-align: center; color: #666; padding: 20px; border: 1px dashed #ccc; border-radius: 8px;">Nenhuma atividade nos últimos 30 dias</div>';
            }
            
            // Próximo backup
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const nextBackup = `${tomorrow.toLocaleDateString('pt-PT')} ${this.scheduledTime}`;
            console.log('📤 nextBackup:', nextBackup);
            
            // Contagem de backups
            const backupCount = parseInt(localStorage.getItem('ponto_auto_backup_count') || '0');
            console.log('📤 backupCount:', backupCount);
            
            // ID do relatório
            const reportId = 'BK-' + Date.now().toString().slice(-8);
            console.log('📤 reportId:', reportId);
            
            // PARÂMETROS DO TEMPLATE
            const templateParams = {
                to_email: this.emailTo,
                to_name: this.emailTo.split('@')[0],
                from_name: 'Check Point Ponto',
                backup_date: backupDate,
                backup_time: backupTime,
                total_workers: String(workers.length),
                active_workers: String(activeWorkers.length),
                total_registries: String(allRegistries.length),
                today_registries: String(todayRegistries.length),
                total_reports: String(reports.length),
                total_admin: String(adminRegistries.length),
                total_bank_hours: totalBankHours.toFixed(2),
                total_bank_value: totalBankValue.toFixed(2) + '€',
                workers_text: workersText,
                activity_by_worker: activityByWorkerHTML,
                report_id: reportId,
                next_backup: nextBackup,
                backup_count: String(backupCount)
            };
            
            console.log('📤 [executeAutoBackup] templateParams construído. Keys:', Object.keys(templateParams));
            
            // VALIDAÇÃO FINAL
            let allGood = true;
            for (let [key, value] of Object.entries(templateParams)) {
                if (value === undefined || value === null || value === '') {
                    console.warn(`⚠️ [VALIDACAO] ${key} está vazio/undefined`);
                    allGood = false;
                } else {
                    console.log(`✅ [VALIDACAO] ${key}: OK (${typeof value}, length: ${value.length || value.toString().length})`);
                }
            }
            
            if (!allGood) {
                console.warn('⚠️ Algumas variáveis estão vazias, mas continuando mesmo assim');
            }
            
            console.log('📨 Enviando email com EmailJS...');
            console.log('Service ID:', this.emailjsServiceId);
            console.log('Template ID:', this.emailjsTemplateId);
            
            // Enviar
            const response = await emailjs.send(
                this.emailjsServiceId,
                this.emailjsTemplateId,
                templateParams
            );
            
            console.log('✅ Resposta do EmailJS:', response);
            
            if (response.status === 200 || response.status === 2000) {
                console.log('✅ Backup bem sucedido! Status:', response.status);
                
                localStorage.setItem('ponto_last_auto_backup', new Date().toISOString().split('T')[0]);
                localStorage.setItem('ponto_auto_backup_count', (backupCount + 1).toString());
                
                console.log('📝 localStorage atualizado');
                
                if (window.PontoApp?.showNotification) {
                    window.PontoApp.showNotification('✅ Backup enviado com sucesso!', 'success');
                }
                
                console.log('✅ Processo completo');
            } else {
                throw new Error(`Erro ${response.status}: ${response.text}`);
            }
            
        } catch (error) {
            console.error('❌ Erro detalhado no executeAutoBackup:', error);
            console.error('❌ Stack:', error.stack);
            console.error('❌ Status:', error.status);
            console.error('❌ Text:', error.text);
            
            if (window.PontoApp?.showNotification) {
                window.PontoApp.showNotification('❌ Erro no backup: ' + error.message, 'error');
            }
        }
    }
}

// Inicializar
console.log('🔧 [GLOBAL] Script backup-auto.js carregado');

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 [DOM] DOMContentLoaded disparado');
    
    // Inicializar em páginas de administração
    const isAdminPage = window.location.pathname.includes('admin.html') || 
                        document.querySelector('.dashboard') || 
                        document.querySelector('.admin-panel');
    
    console.log('🔧 [DOM] isAdminPage?', isAdminPage, 'pathname:', window.location.pathname);
    
    if (isAdminPage) {
        console.log('🔧 [DOM] Página de admin detectada, agendando inicialização...');
        
        setTimeout(() => {
            console.log('🔧 [DOM] Executando inicialização do BackupAutoSystem');
            try {
                window.backupAutoSystem = new BackupAutoSystem();
                console.log('✅ Backup automático inicializado e disponível em window.backupAutoSystem');
                
                // BOTÃO DE TESTE REMOVIDO
                
            } catch (error) {
                console.error('❌ Erro na inicialização:', error);
            }
        }, 1500);
    } else {
        console.log('🔧 [DOM] Não é página de admin, não inicializando');
    }
});

window.BackupAutoSystem = BackupAutoSystem;
console.log('🔧 [GLOBAL] BackupAutoSystem disponível em window');