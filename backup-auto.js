/**
 * Sistema de Backup Automático - VERSÃO CORRIGIDA
 * CORREÇÃO: Verificação contínua e execução no momento exato
 */

class BackupAutoSystem {
    constructor() {
        console.log('🔧 [CONSTRUCTOR] Iniciando construção do BackupAutoSystem');
        this.initialized = false;
        this.checkInterval = null;
        this.lastExecutedDay = null; // Guarda o último dia em que executou
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
        
        if (this.emailjsUserId && typeof emailjs !== 'undefined') {
            try {
                emailjs.init(this.emailjsUserId);
                console.log('✅ EmailJS inicializado');
            } catch (e) {
                console.error('❌ Erro EmailJS:', e);
            }
        }
        
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        
        // VERIFICAR A CADA 30 SEGUNDOS (mais frequente)
        console.log('🔧 [INIT] Configurando intervalo de verificação (30 segundos)');
        this.checkInterval = setInterval(() => {
            console.log('⏰ [INTERVALO] Verificando backup automático...');
            this.checkAutoBackup();
        }, 30 * 1000); // 30 segundos
        
        // Executar imediatamente
        setTimeout(() => {
            console.log('⏰ [TIMEOUT] Execução imediata');
            this.checkAutoBackup();
        }, 2000);
        
        this.initialized = true;
        console.log('✅ Sistema pronto');
    }

    loadConfig() {
        this.enabled = localStorage.getItem('ponto_auto_backup_enabled') === 'true';
        this.emailTo = localStorage.getItem('ponto_auto_backup_email');
        this.emailjsUserId = localStorage.getItem('ponto_emailjs_user_id');
        this.emailjsServiceId = localStorage.getItem('ponto_emailjs_service_id');
        this.emailjsTemplateId = localStorage.getItem('ponto_emailjs_template_id');
        this.scheduledTime = localStorage.getItem('ponto_auto_backup_time') || '18:00';
        
        // Carregar último dia executado
        this.lastExecutedDay = localStorage.getItem('ponto_last_auto_backup_day');
        
        console.log('🔧 Configurações:', {
            enabled: this.enabled,
            emailTo: this.emailTo,
            scheduledTime: this.scheduledTime,
            lastExecutedDay: this.lastExecutedDay
        });
    }

    checkAutoBackup() {
        this.loadConfig(); // Recarregar configurações a cada verificação
        
        // ===== VERIFICAÇÕES BÁSICAS =====
        if (!this.enabled) {
            console.log('⏳ Backup automático desativado');
            return;
        }
        
        if (!this.emailTo || !this.emailjsUserId || !this.emailjsServiceId || !this.emailjsTemplateId) {
            console.log('⏳ Configuração incompleta');
            return;
        }
        
        // ===== VERIFICAR SE JÁ EXECUTOU HOJE =====
        const today = new Date().toISOString().split('T')[0];
        
        if (this.lastExecutedDay === today) {
            console.log('⏳ Backup já executado hoje');
            return;
        }
        
        // ===== VERIFICAR SE JÁ PASSOU DA HORA PROGRAMADA =====
        const now = new Date();
        const [sHour, sMin] = this.scheduledTime.split(':').map(Number);
        
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        // CONDIÇÃO CORRIGIDA: Verificar se já passou da hora programada
        const horaPassou = (currentHour > sHour) || 
                          (currentHour === sHour && currentMinute >= sMin);
        
        console.log(`⏰ Comparação: ${currentHour}:${currentMinute} >= ${sHour}:${sMin}? ${horaPassou}`);
        
        if (horaPassou) {
            console.log('🚀 HORÁRIO ATINGIDO! Executando backup automático...');
            this.executeAutoBackup();
        } else {
            const minutosRestantes = (sHour * 60 + sMin) - (currentHour * 60 + currentMinute);
            console.log(`⏳ Próxima verificação em 30 segundos. Faltam ${minutosRestantes} minutos`);
        }
    }

    async executeAutoBackup() {
        console.log('📤 [executeAutoBackup] INICIANDO EXECUÇÃO');
        
        try {
            if (!window.PontoApp) {
                throw new Error('PontoApp não inicializado');
            }
            
            if (typeof emailjs === 'undefined') {
                throw new Error('EmailJS não carregado');
            }
            
            // Reinicializar EmailJS
            emailjs.init(this.emailjsUserId);
            
            console.log(`📧 Backup para: ${this.emailTo}`);
            
            // ===== COLETAR DADOS =====
            const workers = window.PontoApp.workers || [];
            const allRegistries = window.PontoApp.registries || [];
            const reports = window.PontoApp.reports || [];
            const adminRegistries = window.PontoApp.adminRegistries || [];
            const hoursBank = window.PontoApp.hoursBank || {};
            
            // Calcular estatísticas
            const today = new Date().toISOString().split('T')[0];
            const todayRegistries = allRegistries.filter(r => r.date === today);
            const activeWorkers = workers.filter(w => w.active);
            
            let totalBankHours = 0;
            let totalBankValue = 0;
            Object.values(hoursBank).forEach(bank => {
                totalBankHours += bank.hours || 0;
                totalBankValue += bank.value || 0;
            });
            
            // ===== FORMATAR TRABALHADORES =====
            let workersText = '';
            if (activeWorkers.length > 0) {
                workersText = activeWorkers.map(w => {
                    return `<div style="padding: 8px 0; border-bottom: 1px solid #eee;">
                                <strong>${w.name}</strong> - ${w.role || 'Sem cargo'} 
                                <span style="color: #666; float: right;">${w.hourlyRate || 0}€/h</span>
                            </div>`;
                }).join('');
            } else {
                workersText = '<div style="text-align: center;">Nenhum trabalhador ativo</div>';
            }
            
            // ===== FORMATAR ATIVIDADE RECENTE (últimos 7 dias) =====
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
            
            const recentRegistries = allRegistries
                .filter(r => r.date >= sevenDaysAgoStr)
                .sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time))
                .slice(0, 50);
            
            let activityHTML = '';
            if (recentRegistries.length > 0) {
                const typeMap = {
                    'in': '✅ Entrada',
                    'out': '🔴 Saída',
                    'break_start': '⏸️ Início Pausa',
                    'break_end': '▶️ Fim Pausa'
                };
                
                activityHTML = recentRegistries.map(reg => {
                    const worker = workers.find(w => w.id === reg.workerId);
                    return `<tr>
                        <td>${worker ? worker.name : 'Desconhecido'}</td>
                        <td>${reg.date}</td>
                        <td>${reg.time}</td>
                        <td>${typeMap[reg.type] || reg.type}</td>
                    </tr>`;
                }).join('');
            } else {
                activityHTML = '<tr><td colspan="4" style="text-align: center;">Nenhuma atividade recente</td></tr>';
            }
            
            // ===== PRÓXIMO BACKUP =====
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const nextBackup = `${tomorrow.toLocaleDateString('pt-PT')} ${this.scheduledTime}`;
            
            // ===== CONTAGEM DE BACKUPS =====
            const backupCount = parseInt(localStorage.getItem('ponto_auto_backup_count') || '0');
            
            // ===== PARÂMETROS DO TEMPLATE =====
            const templateParams = {
                to_email: this.emailTo,
                to_name: this.emailTo.split('@')[0],
                from_name: 'Check Point Ponto',
                backup_date: new Date().toLocaleDateString('pt-PT'),
                backup_time: new Date().toLocaleTimeString('pt-PT'),
                total_workers: String(workers.length),
                active_workers: String(activeWorkers.length),
                total_registries: String(allRegistries.length),
                today_registries: String(todayRegistries.length),
                total_reports: String(reports.length),
                total_admin: String(adminRegistries.length),
                total_bank_hours: totalBankHours.toFixed(2),
                total_bank_value: totalBankValue.toFixed(2) + '€',
                workers_text: workersText,
                activity_table: activityHTML,
                report_id: 'BK-' + Date.now().toString().slice(-8),
                next_backup: nextBackup,
                backup_count: String(backupCount + 1)
            };
            
            console.log('📨 Enviando email...');
            
            const response = await emailjs.send(
                this.emailjsServiceId,
                this.emailjsTemplateId,
                templateParams
            );
            
            if (response.status === 200 || response.status === 2000) {
                console.log('✅ Backup bem sucedido!');
                
                // GUARDAR QUE EXECUTOU HOJE
                const today = new Date().toISOString().split('T')[0];
                localStorage.setItem('ponto_last_auto_backup', new Date().toISOString());
                localStorage.setItem('ponto_last_auto_backup_day', today);
                localStorage.setItem('ponto_auto_backup_count', (backupCount + 1).toString());
                
                if (window.PontoApp?.showNotification) {
                    window.PontoApp.showNotification('✅ Backup enviado com sucesso!', 'success');
                }
            } else {
                throw new Error(`Erro ${response.status}`);
            }
            
        } catch (error) {
            console.error('❌ Erro detalhado:', error);
            if (window.PontoApp?.showNotification) {
                window.PontoApp.showNotification('❌ Erro no backup: ' + error.message, 'error');
            }
        }
    }
}

// Inicializar
console.log('🔧 Script backup-auto.js carregado');

// Garantir que só inicializa UMA vez
if (!window.backupAutoSystemInitialized) {
    document.addEventListener('DOMContentLoaded', () => {
        const isAdminPage = window.location.pathname.includes('admin.html') || 
                            document.querySelector('.dashboard');
        
        if (isAdminPage) {
            console.log('🔧 Página de admin detectada');
            
            setTimeout(() => {
                try {
                    window.backupAutoSystem = new BackupAutoSystem();
                    window.backupAutoSystemInitialized = true;
                    console.log('✅ Backup automático inicializado');
                } catch (error) {
                    console.error('❌ Erro na inicialização:', error);
                }
            }, 1500);
        }
    });
}

window.BackupAutoSystem = BackupAutoSystem;