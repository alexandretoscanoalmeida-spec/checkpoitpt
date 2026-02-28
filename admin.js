// admin.js - VERSÃO CORRIGIDA
class AdminInterface {
    constructor() {
        console.log('AdminInterface: Construtor iniciado');
        
        // Verificar se PontoApp existe
        if (!window.PontoApp) {
            console.error('PontoApp não encontrado!');
            alert('Erro: Aplicação não inicializada. Recarregue a página.');
            return;
        }
        
        this.currentAdmin = JSON.parse(sessionStorage.getItem('currentUser'));
        this.isAdmin = sessionStorage.getItem('isAdmin') === 'true';
        
        if (!this.currentAdmin || !this.isAdmin) {
            console.log('Redirecionando para login...');
            window.location.href = 'index.html';
            return;
        }
        
        // Inicializar após um pequeno delay para garantir que o DOM está pronto
        setTimeout(() => {
            this.init();
        }, 100);
    }

    init() {
        console.log('AdminInterface.init() iniciado');
        
        try {
            this.loadAdminData();
            this.setupEventListeners();
            this.loadWorkersList();
            this.loadStats();
            this.loadLastRegistries();
            this.loadBackupStats();
            this.loadReportsList();
            this.loadSchedulesList();
            this.loadAdminRegistries();
            this.populateFilters();
            this.initializeScheduleTemplates();
            this.loadQRCodeLibrary();
            this.initAutoBackup();
            
            console.log('AdminInterface inicializado com sucesso');
        } catch (error) {
            console.error('Erro na inicialização:', error);
        }
    }

    setupEventListeners() {
        console.log('Configurando event listeners...');
        
        // Navegação
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                console.log('Navegando para:', page);
                this.navigateTo(page);
            });
        });
        
        // Botões principais
        const btnAddWorker = document.getElementById('btnAddWorker');
        if (btnAddWorker) {
            console.log('Botão "Adicionar Trabalhador" encontrado');
            btnAddWorker.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Clicou em Adicionar Trabalhador');
                this.showAddWorkerModal();
            });
        } else {
            console.warn('Botão btnAddWorker não encontrado');
        }
        
        const btnManageRoles = document.getElementById('btnManageRoles');
        if (btnManageRoles) {
            console.log('Botão "Gerir Funções" encontrado');
            btnManageRoles.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Clicou em Gerir Funções');
                this.manageRoles();
            });
        } else {
            console.warn('Botão btnManageRoles não encontrado');
        }
        
        const btnAddRegistry = document.getElementById('btnAddRegistry');
        if (btnAddRegistry) {
            console.log('Botão "Adicionar Registo" encontrado');
            btnAddRegistry.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Clicou em Adicionar Registo');
                this.showAddRegistryModal();
            });
        } else {
            console.warn('Botão btnAddRegistry não encontrado');
        }
        
        const btnSaveRegistry = document.getElementById('btnSaveRegistry');
        if (btnSaveRegistry) {
            console.log('Botão "Salvar Registo" encontrado');
            btnSaveRegistry.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Clicou em Salvar Registo');
                this.saveAdminRegistry();
            });
        } else {
            console.warn('Botão btnSaveRegistry não encontrado');
        }
        
        const btnExportBackupExcel = document.getElementById('btnExportBackupExcel');
        if (btnExportBackupExcel) {
            console.log('Botão "Exportar Excel" encontrado');
            btnExportBackupExcel.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Clicou em Exportar Excel');
                this.exportBackupExcel();
            });
        } else {
            console.warn('Botão btnExportBackupExcel não encontrado');
        }
        
        const btnExportBackupPDF = document.getElementById('btnExportBackupPDF');
        if (btnExportBackupPDF) {
            console.log('Botão "Exportar PDF" encontrado');
            btnExportBackupPDF.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Clicou em Exportar PDF');
                this.exportBackupPDF();
            });
        } else {
            console.warn('Botão btnExportBackupPDF não encontrado');
        }
        
        const btnImportBackup = document.getElementById('btnImportBackup');
        if (btnImportBackup) {
            console.log('Botão "Importar Backup" encontrado');
            btnImportBackup.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Clicou em Importar Backup');
                this.showImportModal();
            });
        } else {
            console.warn('Botão btnImportBackup não encontrado');
        }
        
        const btnLogout = document.getElementById('btnLogout');
        if (btnLogout) {
            console.log('Botão "Sair" encontrado');
            btnLogout.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Clicou em Sair');
                window.PontoApp.logout();
            });
        } else {
            console.warn('Botão btnLogout não encontrado');
        }
        
        const btnGenerateReport = document.getElementById('btnGenerateReport');
        if (btnGenerateReport) {
            console.log('Botão "Gerar Relatório" encontrado');
            btnGenerateReport.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Clicou em Gerar Relatório');
                this.showGenerateReportModal();
            });
        } else {
            console.warn('Botão btnGenerateReport não encontrado');
        }
        
        const btnFilterWorkers = document.getElementById('btnFilterWorkers');
        if (btnFilterWorkers) {
            console.log('Botão "Filtrar Trabalhadores" encontrado');
            btnFilterWorkers.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Clicou em Filtrar Trabalhadores');
                this.loadWorkersList();
            });
        } else {
            console.warn('Botão btnFilterWorkers não encontrado');
        }
        
        const btnGenerateReportFilter = document.getElementById('btnGenerateReportFilter');
        if (btnGenerateReportFilter) {
            console.log('Botão "Gerar Relatório (filtro)" encontrado');
            btnGenerateReportFilter.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Clicou em Gerar Relatório (filtro)');
                this.generateReport();
            });
        } else {
            console.warn('Botão btnGenerateReportFilter não encontrado');
        }
        
        const btnExportReportExcel = document.getElementById('btnExportReportExcel');
        if (btnExportReportExcel) {
            console.log('Botão "Exportar Relatório Excel" encontrado');
            btnExportReportExcel.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Clicou em Exportar Relatório Excel');
                this.exportReportExcel();
            });
        } else {
            console.warn('Botão btnExportReportExcel não encontrado');
        }
        
        const btnExportReportPDF = document.getElementById('btnExportReportPDF');
        if (btnExportReportPDF) {
            console.log('Botão "Exportar Relatório PDF" encontrado');
            btnExportReportPDF.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Clicou em Exportar Relatório PDF');
                this.exportReportPDF();
            });
        } else {
            console.warn('Botão btnExportReportPDF não encontrado');
        }
        
        const btnClearData = document.getElementById('btnClearData');
        if (btnClearData) {
            console.log('Botão "Limpar Dados" encontrado');
            btnClearData.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Clicou em Limpar Dados');
                this.clearAllData();
            });
        } else {
            console.warn('Botão btnClearData não encontrado');
        }
        
        const btnApplyFilters = document.getElementById('btnApplyFilters');
        if (btnApplyFilters) {
            console.log('Botão "Aplicar Filtros" encontrado');
            btnApplyFilters.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Clicou em Aplicar Filtros');
                this.loadLastRegistries();
            });
        } else {
            console.warn('Botão btnApplyFilters não encontrado');
        }
        
        const scheduleWorker = document.getElementById('scheduleWorker');
        if (scheduleWorker) {
            console.log('Select "scheduleWorker" encontrado');
            scheduleWorker.addEventListener('change', (e) => {
                const workerId = e.target.value;
                if (workerId) {
                    this.showWeekScheduleEditor(workerId);
                }
            });
        } else {
            console.warn('Select scheduleWorker não encontrado');
        }
        
        const btnManageTemplates = document.getElementById('btnManageTemplates');
        if (btnManageTemplates) {
            console.log('Botão "Gerir Templates" encontrado');
            btnManageTemplates.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Clicou em Gerir Templates');
                this.manageScheduleTemplates();
            });
        } else {
            console.warn('Botão btnManageTemplates não encontrado');
        }
        
        const btnConfigureAutoBackup = document.getElementById('btnConfigureAutoBackup');
        if (btnConfigureAutoBackup) {
            console.log('Botão "Configurar Backup" encontrado');
            btnConfigureAutoBackup.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Clicou em Configurar Backup');
                this.showAutoBackupConfigModal();
            });
        } else {
            console.warn('Botão btnConfigureAutoBackup não encontrado');
        }
        
        const btnTestEmailBackup = document.getElementById('btnTestEmailBackup');
        if (btnTestEmailBackup) {
            console.log('Botão "Testar Email" encontrado');
            btnTestEmailBackup.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Clicou em Testar Email');
                this.testEmailBackup();
            });
        } else {
            console.warn('Botão btnTestEmailBackup não encontrado');
        }
        
        const btnManualEmailBackup = document.getElementById('btnManualEmailBackup');
        if (btnManualEmailBackup) {
            console.log('Botão "Enviar Backup Manual" encontrado');
            btnManualEmailBackup.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Clicou em Enviar Backup Manual');
                this.sendManualEmailBackup();
            });
        } else {
            console.warn('Botão btnManualEmailBackup não encontrado');
        }
        
        console.log('Todos os event listeners foram configurados');
    }

    // Inicializar sistema de backup automático
    initAutoBackup() {
        // Inicializar EmailJS se não estiver inicializado
        if (typeof emailjs !== 'undefined' && !window.emailjsInitialized) {
            const emailjsUserId = localStorage.getItem('ponto_emailjs_user_id');
            if (emailjsUserId) {
                emailjs.init(emailjsUserId);
                window.emailjsInitialized = true;
            }
        }
        
        // Verificar se precisa fazer backup automático agora
        this.checkAutoBackup();
        
        // Atualizar status do backup automático
        this.updateAutoBackupStatus();
    }

    // Verificar backup automático
    checkAutoBackup() {
        const autoBackupEnabled = localStorage.getItem('ponto_auto_backup_enabled') === 'true';
        if (!autoBackupEnabled) return;
        
        const lastBackup = localStorage.getItem('ponto_last_auto_backup');
        const today = new Date().toISOString().split('T')[0];
        
        if (lastBackup !== today) {
            // Verificar hora programada
            const scheduledTime = localStorage.getItem('ponto_auto_backup_time') || '18:00';
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const [scheduledHour, scheduledMinute] = scheduledTime.split(':').map(Number);
            
            if (currentHour >= scheduledHour && currentMinute >= scheduledMinute) {
                // Executar backup automático
                this.executeAutoBackup();
            }
        }
    }

    // Executar backup automático
    async executeAutoBackup() {
    try {
        const emailTo = localStorage.getItem('ponto_auto_backup_email');
        const emailjsUserId = localStorage.getItem('ponto_emailjs_user_id');
        const emailjsServiceId = localStorage.getItem('ponto_emailjs_service_id');
        const emailjsTemplateId = localStorage.getItem('ponto_emailjs_template_id');
        
        if (!emailTo || !emailjsUserId || !emailjsServiceId || !emailjsTemplateId) {
            console.log('Backup automático: Configuração incompleta');
            return;
        }
        
        console.log('📧 Executando backup automático para:', emailTo);
        
        // Usar o BackupAutoSystem se disponível (preferencial)
        if (window.backupAutoSystem) {
            console.log('✅ Usando BackupAutoSystem para backup automático');
            await window.backupAutoSystem.executeAutoBackup();
            return;
        }
        
        // Fallback apenas se não existir (nunca deve acontecer)
        console.warn('⚠️ BackupAutoSystem não disponível');
        
    } catch (error) {
        console.error('❌ Erro no backup automático:', error);
    }
}

    // Preparar dados para backup
    prepareBackupData() {
        return {
            workers: window.PontoApp.workers,
            registries: window.PontoApp.registries,
            reports: window.PontoApp.reports,
            adminRegistries: window.PontoApp.adminRegistries || [],
            hoursBank: window.PontoApp.hoursBank,
            schedules: window.PontoApp.schedules,
            scheduleTemplates: window.PontoApp.scheduleTemplates || [],
            backupDate: new Date().toISOString(),
            totalRecords: window.PontoApp.registries.length + window.PontoApp.workers.length + window.PontoApp.reports.length
        };
    }

    // Calcular estatísticas para backup
    calculateBackupStats(backupData) {
        const today = new Date().toISOString().split('T')[0];
        const todayRegistries = (backupData.registries || []).filter(r => r.date === today);
        const activeWorkers = (backupData.workers || []).filter(w => w.active);
        
        let totalBankHours = 0;
        let totalBankValue = 0;
        
        Object.values(backupData.hoursBank || {}).forEach(bank => {
            totalBankHours += bank.hours || 0;
            totalBankValue += bank.value || 0;
        });
        
        return {
            workers: backupData.workers?.length || 0,
            registries: backupData.registries?.length || 0,
            reports: backupData.reports?.length || 0,
            adminRegistries: backupData.adminRegistries?.length || 0,
            activeWorkers: activeWorkers.length,
            todayRegistries: todayRegistries.length,
            totalBankHours: totalBankHours,
            totalBankValue: totalBankValue
        };
    }

    // Formatar lista de trabalhadores para email
    formatWorkersList(workers) {
        if (!workers || workers.length === 0) return '<li>Nenhum trabalhador</li>';
        
        const activeWorkers = workers.filter(w => w.active).slice(0, 10);
        
        return activeWorkers.map(w => `
            <li style="padding: 5px 0; border-bottom: 1px solid #eee;">
                <strong>${w.name}</strong> - ${w.role} 
                <span style="color: #666; float: right;">${w.hourlyRate}€/h</span>
            </li>
        `).join('');
    }

    // Formatar atividade recente para email
    formatRecentActivity(registries) {
        if (!registries || registries.length === 0) return '<li>Nenhuma atividade recente</li>';
        
        const recent = registries.slice(0, 15);
        
        return recent.map(r => {
            const worker = window.PontoApp.workers?.find(w => w.id === r.workerId);
            const typeText = {
                'in': '✅ Entrada',
                'out': '🔴 Saída',
                'break_start': '⏸️ Início Pausa',
                'break_end': '▶️ Fim Pausa'
            }[r.type] || r.type;
            
            return `
                <li style="padding: 4px 0; font-size: 12px;">
                    <strong>${r.date} ${r.time}</strong> - 
                    ${worker ? worker.name : 'Desconhecido'}: ${typeText}
                </li>
            `;
        }).join('');
    }

    // Atualizar status do backup automático na UI
    updateAutoBackupStatus() {
        const autoBackupEnabled = localStorage.getItem('ponto_auto_backup_enabled') === 'true';
        const lastBackup = localStorage.getItem('ponto_last_auto_backup');
        const backupCount = localStorage.getItem('ponto_auto_backup_count') || '0';
        const emailTo = localStorage.getItem('ponto_auto_backup_email') || 'Não configurado';
        const scheduledTime = localStorage.getItem('ponto_auto_backup_time') || '18:00';
        
        // Verificar se tem configuração completa
        const hasEmailjsUserId = !!localStorage.getItem('ponto_emailjs_user_id');
        const hasEmailjsServiceId = !!localStorage.getItem('ponto_emailjs_service_id');
        const hasEmailjsTemplateId = !!localStorage.getItem('ponto_emailjs_template_id');
        const hasCompleteConfig = hasEmailjsUserId && hasEmailjsServiceId && hasEmailjsTemplateId && !!emailTo;
        
        const statusText = document.getElementById('backupStatusText');
        const lastAutoBackup = document.getElementById('lastAutoBackup');
        const nextAutoBackup = document.getElementById('nextAutoBackup');
        const autoBackupCount = document.getElementById('autoBackupCount');
        
        if (statusText) {
            if (autoBackupEnabled) {
                statusText.textContent = hasCompleteConfig ? 'Ativado' : 'Configuração incompleta';
                statusText.style.color = hasCompleteConfig ? '#27ae60' : '#f39c12';
            } else {
                statusText.textContent = 'Desativado';
                statusText.style.color = '#e74c3c';
            }
        }
        
        if (lastAutoBackup) {
            lastAutoBackup.textContent = lastBackup ? 
                new Date(lastBackup).toLocaleDateString('pt-PT') : 'Nunca';
        }
        
        if (nextAutoBackup) {
            if (autoBackupEnabled && hasCompleteConfig) {
                const today = new Date().toISOString().split('T')[0];
                const nextDate = lastBackup === today ? 'Amanhã às ' + scheduledTime : 'Hoje às ' + scheduledTime;
                nextAutoBackup.textContent = nextDate;
            } else {
                nextAutoBackup.textContent = '-';
            }
        }
        
        if (autoBackupCount) {
            autoBackupCount.textContent = backupCount;
        }
    }

    // Mostrar modal de configuração de backup automático
    showAutoBackupConfigModal() {
        const autoBackupEnabled = localStorage.getItem('ponto_auto_backup_enabled') === 'true';
        const emailTo = localStorage.getItem('ponto_auto_backup_email') || '';
        const scheduledTime = localStorage.getItem('ponto_auto_backup_time') || '18:00';
        const emailjsUserId = localStorage.getItem('ponto_emailjs_user_id') || '';
        const emailjsServiceId = localStorage.getItem('ponto_emailjs_service_id') || '';
        const emailjsTemplateId = localStorage.getItem('ponto_emailjs_template_id') || '';
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>⚙️ Configurar Backup Automático por Email</h3>
                    <button class="btn btn-small btn-close close-modal">×</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                        <p><strong>⚠️ Configuração do EmailJS:</strong></p>
                        <p>1. Criar conta gratuita em <a href="https://www.emailjs.com" target="_blank">emailjs.com</a></p>
                        <p>2. Adicionar serviço de email (Gmail, Outlook, etc.)</p>
                        <p>3. Criar template de email com as variáveis: to_email, to_name, from_name, subject, backup_date, backup_time, total_workers, total_registries, total_reports, total_admin, total_bank_hours, total_bank_value, active_workers, today_registries</p>
                        <p>4. Copiar os IDs abaixo do dashboard do EmailJS</p>
                    </div>
                    
                    <form id="autoBackupConfigForm">
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="enableAutoBackup" ${autoBackupEnabled ? 'checked' : ''}>
                                Ativar Backup Automático Diário
                            </label>
                        </div>
                        
                        <div class="form-group">
                            <label for="emailjsUserId">EmailJS User ID (Public Key):</label>
                            <input type="text" id="emailjsUserId" value="${emailjsUserId}" 
                                   placeholder="Ex: user_AbCdEfGhIjKlMnOpQrStUv" 
                                   style="font-family: monospace;" required>
                            <small>Encontre em Account > API Keys</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="emailjsServiceId">EmailJS Service ID:</label>
                            <input type="text" id="emailjsServiceId" value="${emailjsServiceId}" 
                                   placeholder="Ex: service_abc123" 
                                   style="font-family: monospace;" required>
                            <small>ID do serviço de email configurado</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="emailjsTemplateId">EmailJS Template ID:</label>
                            <input type="text" id="emailjsTemplateId" value="${emailjsTemplateId}" 
                                   placeholder="Ex: template_xyz789" 
                                   style="font-family: monospace;" required>
                            <small>ID do template de email criado</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="backupEmail">Email para envio:</label>
                            <input type="email" id="backupEmail" value="${emailTo}" required 
                                   placeholder="seu.email@exemplo.com">
                        </div>
                        
                        <div class="form-group">
                            <label for="backupTime">Hora do envio diário:</label>
                            <input type="time" id="backupTime" value="${scheduledTime}" required>
                            <small>O backup será enviado automaticamente todos os dias a esta hora</small>
                        </div>
                    </form>
                    
                    <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 5px;">
                        <p><strong>💡 Dica:</strong> Use o botão "Testar Envio por Email" para verificar se a configuração está correta.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal">Cancelar</button>
                    <button class="btn btn-primary" id="btnSaveAutoBackupConfig">💾 Guardar Configuração</button>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').appendChild(modal);
        
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal(modal));
        });
        
        const btnSaveConfig = modal.querySelector('#btnSaveAutoBackupConfig');
        if (btnSaveConfig) {
            btnSaveConfig.addEventListener('click', () => this.saveAutoBackupConfig());
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });
    }

    // Guardar configuração de backup automático
    saveAutoBackupConfig() {
        const enableAutoBackup = document.getElementById('enableAutoBackup').checked;
        const emailjsUserId = document.getElementById('emailjsUserId').value.trim();
        const emailjsServiceId = document.getElementById('emailjsServiceId').value.trim();
        const emailjsTemplateId = document.getElementById('emailjsTemplateId').value.trim();
        const backupEmail = document.getElementById('backupEmail').value.trim();
        const backupTime = document.getElementById('backupTime').value;
        
        // Validar campos se estiver ativado
        if (enableAutoBackup) {
            if (!emailjsUserId) {
                window.PontoApp.showNotification('Insira o EmailJS User ID!', 'error');
                return;
            }
            
            if (!emailjsServiceId) {
                window.PontoApp.showNotification('Insira o EmailJS Service ID!', 'error');
                return;
            }
            
            if (!emailjsTemplateId) {
                window.PontoApp.showNotification('Insira o EmailJS Template ID!', 'error');
                return;
            }
            
            if (!backupEmail) {
                window.PontoApp.showNotification('Insira o email para envio!', 'error');
                return;
            }
            
            // Inicializar EmailJS com o User ID fornecido
            if (typeof emailjs !== 'undefined') {
                try {
                    emailjs.init(emailjsUserId);
                    window.emailjsInitialized = true;
                } catch (error) {
                    console.error('Erro ao inicializar EmailJS:', error);
                    window.PontoApp.showNotification('Erro ao configurar EmailJS. Verifique o User ID.', 'error');
                    return;
                }
            }
        }
        
        // Guardar todas as configurações
        localStorage.setItem('ponto_auto_backup_enabled', enableAutoBackup.toString());
        localStorage.setItem('ponto_emailjs_user_id', emailjsUserId);
        localStorage.setItem('ponto_emailjs_service_id', emailjsServiceId);
        localStorage.setItem('ponto_emailjs_template_id', emailjsTemplateId);
        localStorage.setItem('ponto_auto_backup_email', backupEmail);
        localStorage.setItem('ponto_auto_backup_time', backupTime);
        
        this.updateAutoBackupStatus();
        
        const modal = document.querySelector('.modal.active');
        if (modal) {
            this.closeModal(modal);
        }
        
        window.PontoApp.showNotification('Configuração de backup automático guardada!', 'success');
    }

    // Testar envio por email
    async testEmailBackup() {
        const emailTo = localStorage.getItem('ponto_auto_backup_email');
        const emailjsUserId = localStorage.getItem('ponto_emailjs_user_id');
        const emailjsServiceId = localStorage.getItem('ponto_emailjs_service_id');
        const emailjsTemplateId = localStorage.getItem('ponto_emailjs_template_id');
        
        if (!emailTo || !emailjsUserId || !emailjsServiceId || !emailjsTemplateId) {
            window.PontoApp.showNotification('Configure primeiro todas as credenciais do EmailJS!', 'error');
            this.showAutoBackupConfigModal();
            return;
        }
        
        if (typeof emailjs === 'undefined') {
            window.PontoApp.showNotification('Biblioteca EmailJS não carregada!', 'error');
            return;
        }
        
        try {
            window.PontoApp.showNotification('Enviando email de teste...', 'info');
            
            // Inicializar EmailJS
            emailjs.init(emailjsUserId);
            
            // Preparar dados para o teste
            const backupData = this.prepareBackupData();
            const backupDate = new Date().toISOString().split('T')[0];
            const backupTime = new Date().toLocaleTimeString('pt-PT');
            const stats = this.calculateBackupStats(backupData);
            
            // Parâmetros do template
            const templateParams = {
                to_email: emailTo,
                to_name: emailTo.split('@')[0],
                from_name: 'Check Point Ponto',
                subject: `🔧 TESTE - Backup Automático - ${backupDate}`,
                backup_date: backupDate,
                backup_time: backupTime,
                total_workers: stats.workers,
                total_registries: stats.registries,
                total_reports: stats.reports,
                total_admin: stats.adminRegistries,
                total_bank_hours: stats.totalBankHours.toFixed(2),
                total_bank_value: stats.totalBankValue.toFixed(2) + '€',
                active_workers: stats.activeWorkers,
                today_registries: stats.todayRegistries
            };
            
            // Enviar email
            const response = await emailjs.send(
                emailjsServiceId,
                emailjsTemplateId,
                templateParams
            );
            
            if (response.status === 200 || response.status === 2000) {
                window.PontoApp.showNotification('✅ Email de teste enviado com sucesso!', 'success');
            } else {
                throw new Error(`Erro no envio: ${response.text || 'Resposta inválida'}`);
            }
            
        } catch (error) {
            console.error('Erro no teste de email:', error);
            window.PontoApp.showNotification('❌ Erro no teste: ' + error.message, 'error');
        }
    }

    // Enviar backup manualmente por email
    async sendManualEmailBackup() {
    console.log('📧 Enviando backup manual...');
    
    const emailTo = localStorage.getItem('ponto_auto_backup_email');
    const emailjsUserId = localStorage.getItem('ponto_emailjs_user_id');
    const emailjsServiceId = localStorage.getItem('ponto_emailjs_service_id');
    const emailjsTemplateId = localStorage.getItem('ponto_emailjs_template_id');
    
    if (!emailTo || !emailjsUserId || !emailjsServiceId || !emailjsTemplateId) {
        window.PontoApp.showNotification('Configure primeiro todas as credenciais do EmailJS!', 'error');
        this.showAutoBackupConfigModal();
        return;
    }
    
    // Verificar se o BackupAutoSystem existe
    if (window.backupAutoSystem) {
        console.log('✅ Usando BackupAutoSystem para backup manual');
        await window.backupAutoSystem.executeAutoBackup();
        return;
    }
    
    // Fallback apenas se não existir
    window.PontoApp.showNotification('Sistema de backup não inicializado!', 'error');
}

    // Exportar backup para Excel (para email)
    async exportBackupExcelForEmail() {
        if (typeof XLSX === 'undefined') {
            throw new Error('Biblioteca Excel não carregada');
        }
        
        const backup = {
            workers: window.PontoApp.workers,
            schedules: [],
            registries: window.PontoApp.registries,
            reports: window.PontoApp.reports,
            hoursBank: window.PontoApp.hoursBank,
            roles: window.PontoApp.roles,
            adminRegistries: window.PontoApp.adminRegistries || [],
            scheduleTemplates: window.PontoApp.scheduleTemplates || [],
            scheduleAssignments: window.PontoApp.scheduleAssignments || {},
            weekScheduleAssignments: window.PontoApp.weekScheduleAssignments || {},
            exportedAt: new Date().toISOString(),
            version: '1.4'
        };
        
        Object.keys(window.PontoApp.schedules).forEach(workerId => {
            const schedule = window.PontoApp.schedules[workerId];
            if (schedule.reference) {
                schedule.reference.forEach(daySchedule => {
                    backup.schedules.push({
                        workerId: parseInt(workerId),
                        day: daySchedule.day,
                        start: daySchedule.start,
                        end: daySchedule.end,
                        break: daySchedule.break || ''
                    });
                });
            }
        });
        
        const workbook = XLSX.utils.book_new();
        
        const workersSheet = XLSX.utils.json_to_sheet(backup.workers);
        XLSX.utils.book_append_sheet(workbook, workersSheet, 'Trabalhadores');
        
        if (backup.registries.length > 0) {
            const registriesSheet = XLSX.utils.json_to_sheet(backup.registries);
            XLSX.utils.book_append_sheet(workbook, registriesSheet, 'Registos');
        }
        
        if (backup.reports.length > 0) {
            const reportsSheet = XLSX.utils.json_to_sheet(backup.reports);
            XLSX.utils.book_append_sheet(workbook, reportsSheet, 'Relatórios');
        }
        
        // Adicionar mais abas conforme necessário...
        
        // Retornar dados do workbook (em produção, converter para blob e anexar ao email)
        return XLSX.write(workbook, { type: 'binary', bookType: 'xlsx' });
    }

    initializeScheduleTemplates() {
        if (!window.PontoApp.scheduleTemplates) {
            window.PontoApp.scheduleTemplates = [
                {
                    id: 1,
                    name: 'Horário A - Normal (9h-17h)',
                    days: [
                        { day: 1, start: '09:00', end: '17:00', break: '13:00-14:00' },
                        { day: 2, start: '09:00', end: '17:00', break: '13:00-14:00' },
                        { day: 3, start: '09:00', end: '17:00', break: '13:00-14:00' },
                        { day: 4, start: '09:00', end: '17:00', break: '13:00-14:00' },
                        { day: 5, start: '09:00', end: '17:00', break: '13:00-14:00' }
                    ],
                    totalHours: 35
                },
                {
                    id: 2,
                    name: 'Horário B - Manhã (8h-16h)',
                    days: [
                        { day: 1, start: '08:00', end: '16:00', break: '12:00-13:00' },
                        { day: 2, start: '08:00', end: '16:00', break: '12:00-13:00' },
                        { day: 3, start: '08:00', end: '16:00', break: '12:00-13:00' },
                        { day: 4, start: '08:00', end: '16:00', break: '12:00-13:00' },
                        { day: 5, start: '08:00', end: '16:00', break: '12:00-13:00' }
                    ],
                    totalHours: 35
                },
                {
                    id: 3,
                    name: 'Horário C - Tarde (10h-18h)',
                    days: [
                        { day: 1, start: '10:00', end: '18:00', break: '14:00-15:00' },
                        { day: 2, start: '10:00', end: '18:00', break: '14:00-15:00' },
                        { day: 3, start: '10:00', end: '18:00', break: '14:00-15:00' },
                        { day: 4, start: '10:00', end: '18:00', break: '14:00-15:00' },
                        { day: 5, start: '10:00', end: '18:00', break: '14:00-15:00' }
                    ],
                    totalHours: 35
                },
                {
                    id: 4,
                    name: 'Horário D - Parcial (9h-13h)',
                    days: [
                        { day: 1, start: '09:00', end: '13:00', break: '' },
                        { day: 2, start: '09:00', end: '13:00', break: '' },
                        { day: 3, start: '09:00', end: '13:00', break: '' },
                        { day: 4, start: '09:00', end: '13:00', break: '' },
                        { day: 5, start: '09:00', end: '13:00', break: '' }
                    ],
                    totalHours: 20
                },
                {
                    id: 5,
                    name: 'Horário E - Flexível (8h30-17h30)',
                    days: [
                        { day: 1, start: '08:30', end: '17:30', break: '13:00-14:00' },
                        { day: 2, start: '08:30', end: '17:30', break: '13:00-14:00' },
                        { day: 3, start: '08:30', end: '17:30', break: '13:00-14:00' },
                        { day: 4, start: '08:30', end: '17:30', break: '13:00-14:00' },
                        { day: 5, start: '08:30', end: '17:30', break: '13:00-14:00' }
                    ],
                    totalHours: 40
                }
            ];
            localStorage.setItem('ponto_schedule_templates', JSON.stringify(window.PontoApp.scheduleTemplates));
        }
    }

    loadAdminData() {
        document.getElementById('adminName').textContent = this.currentAdmin.name;
        document.getElementById('adminAvatar').textContent = 
            this.currentAdmin.name.split(' ').map(n => n[0]).join('').toUpperCase();
        
        const adminNameElement = document.getElementById('adminName');
        if (adminNameElement) {
            adminNameElement.style.whiteSpace = 'normal';
            adminNameElement.style.wordWrap = 'break-word';
            adminNameElement.style.display = 'block';
        }
    }

    navigateTo(page) {
        console.log('Navegando para página:', page);
        
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });
        
        const section = document.getElementById(page);
        if (section) {
            section.style.display = 'block';
            console.log('Seção exibida:', page);
            
            if (page === 'reports') {
                this.populateReportTypeFilter();
                this.loadReportsList();
            }
            
            if (page === 'backup') {
                this.updateAutoBackupStatus();
            }
        } else {
            console.error('Seção não encontrada:', page);
        }
        
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) {
                link.classList.add('active');
            }
        });
        
        switch(page) {
            case 'reports':
                this.loadReportsList();
                break;
            case 'schedules':
                this.loadSchedulesList();
                break;
            case 'registries':
                this.loadAdminRegistries();
                break;
            case 'backup':
                this.loadBackupStats();
                this.updateAutoBackupStatus();
                break;
            case 'dashboard':
                this.loadStats();
                this.loadLastRegistries();
                break;
            case 'workers':
                this.loadWorkersList();
                break;
        }
        
        if (page === 'schedules') {
            document.getElementById('scheduleWorker').value = '';
            document.getElementById('scheduleEditor').style.display = 'none';
        }
    }

    populateFilters() {
        console.log('Populando filtros...');
        
        const roleFilter = document.getElementById('filterRole');
        if (roleFilter) {
            roleFilter.innerHTML = '<option value="all">Todas</option>';
            window.PontoApp.roles.forEach(role => {
                roleFilter.innerHTML += `<option value="${role.id}">${role.name}</option>`;
            });
        }
        
        const reportWorker = document.getElementById('reportWorker');
        if (reportWorker) {
            reportWorker.innerHTML = '<option value="all">Todos os Trabalhadores</option>';
            window.PontoApp.workers.forEach(worker => {
                if (worker.active) {
                    reportWorker.innerHTML += `<option value="${worker.id}">${worker.name}</option>`;
                }
            });
        }
        
        const scheduleWorker = document.getElementById('scheduleWorker');
        if (scheduleWorker) {
            scheduleWorker.innerHTML = '<option value="">Selecione um trabalhador</option>';
            window.PontoApp.workers.forEach(worker => {
                if (worker.active) {
                    scheduleWorker.innerHTML += `<option value="${worker.id}">${worker.name}</option>`;
                }
            });
        }
        
        const filterWorker = document.getElementById('filterWorker');
        if (filterWorker) {
            filterWorker.innerHTML = '<option value="all">Todos</option>';
            window.PontoApp.workers.forEach(worker => {
                if (worker.active) {
                    filterWorker.innerHTML += `<option value="${worker.id}">${worker.name}</option>`;
                }
            });
        }
        
        const registryWorker = document.getElementById('registryWorker');
        if (registryWorker) {
            registryWorker.innerHTML = '<option value="all">Todos os Trabalhadores</option>';
            window.PontoApp.workers.forEach(worker => {
                if (worker.active) {
                    registryWorker.innerHTML += `<option value="${worker.id}">${worker.name}</option>`;
                }
            });
        }
        
        const today = new Date().toISOString().split('T')[0];
        const registryDate = document.getElementById('registryDate');
        if (registryDate) {
            registryDate.value = today;
        }
        
        const currentYear = new Date().getFullYear();
        const yearSelect = document.getElementById('reportYear');
        if (yearSelect) {
            yearSelect.value = currentYear;
        }
        
        const currentMonth = new Date().getMonth() + 1;
        const monthSelect = document.getElementById('reportMonth');
        if (monthSelect) {
            monthSelect.value = currentMonth;
        }
        
        const filterSort = document.getElementById('filterSort');
        if (filterSort) {
            filterSort.value = 'oldest';
        }
        
        console.log('Filtros populados');
    }

    populateReportTypeFilter() {
        const reportTypeFilter = document.getElementById('reportTypeFilter');
        if (reportTypeFilter) {
            reportTypeFilter.innerHTML = `
                <option value="all">Todos os Tipos</option>
                <option value="worked">Horas Trabalhadas</option>
                <option value="justified">Faltas Justificadas</option>
                <option value="vacation">Férias</option>
                <option value="training">Formação</option>
                <option value="unjustified">Faltas Injustificadas</option>
                <option value="bank">Banco de Horas</option>
            `;
        }
    }

    loadWorkersList() {
        console.log('Carregando lista de trabalhadores...');
        
        const filterRole = document.getElementById('filterRole')?.value || 'all';
        const filterActive = document.getElementById('filterActive')?.value || 'all';
        const filterSort = document.getElementById('filterSortWorkers')?.value || 'name';
        
        const tbody = document.getElementById('workersList');
        if (!tbody) {
            console.error('Elemento workersList não encontrado');
            return;
        }
        
        tbody.innerHTML = '';
        
        let filteredWorkers = window.PontoApp.workers.filter(worker => {
            if (filterRole !== 'all' && worker.roleId !== parseInt(filterRole)) return false;
            if (filterActive !== 'all') {
                const active = filterActive === 'active';
                return worker.active === active;
            }
            return true;
        });
        
        filteredWorkers.sort((a, b) => {
            switch(filterSort) {
                case 'name': return a.name.localeCompare(b.name);
                case 'role': return a.role.localeCompare(b.role);
                case 'active': return (b.active ? 1 : 0) - (a.active ? 1 : 0);
                default: return a.id - b.id;
            }
        });
        
        if (filteredWorkers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum trabalhador encontrado</td></tr>';
            return;
        }
        
        filteredWorkers.forEach(worker => {
            const row = document.createElement('tr');
            
            const nameCell = document.createElement('td');
            nameCell.textContent = worker.name;
            
            const roleCell = document.createElement('td');
            roleCell.textContent = worker.role;
            
            const rateCell = document.createElement('td');
            rateCell.textContent = `${worker.hourlyRate.toFixed(2)} €/h`;
            
            const pinCell = document.createElement('td');
            pinCell.textContent = worker.pin;
            
            const statusCell = document.createElement('td');
            const statusBadge = document.createElement('span');
            statusBadge.className = `status-badge ${worker.active ? 'status-presente' : 'status-ausente'}`;
            statusBadge.textContent = worker.active ? 'Ativo' : 'Inativo';
            statusCell.appendChild(statusBadge);
            
            const actionsCell = document.createElement('td');
            actionsCell.className = 'actions';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-small btn-warning';
            editBtn.textContent = '✏️ Editar';
            editBtn.onclick = () => this.editWorker(worker.id);
            
            const scheduleBtn = document.createElement('button');
            scheduleBtn.className = 'btn btn-small btn-secondary';
            scheduleBtn.textContent = '🕐 Horário';
            scheduleBtn.onclick = () => {
                const scheduleSelect = document.getElementById('scheduleWorker');
                if (scheduleSelect) {
                    scheduleSelect.value = worker.id;
                    this.showWeekScheduleEditor(worker.id);
                }
                this.navigateTo('schedules');
            };
            
            const qrBtn = document.createElement('button');
            qrBtn.className = 'btn btn-small';
            qrBtn.textContent = '📱 QR';
            qrBtn.onclick = () => this.showWorkerQR(worker);
            
            actionsCell.appendChild(editBtn);
            actionsCell.appendChild(scheduleBtn);
            actionsCell.appendChild(qrBtn);
            
            row.appendChild(nameCell);
            row.appendChild(roleCell);
            row.appendChild(rateCell);
            row.appendChild(pinCell);
            row.appendChild(statusCell);
            row.appendChild(actionsCell);
            
            tbody.appendChild(row);
        });
        
        console.log('Lista de trabalhadores carregada:', filteredWorkers.length, 'trabalhadores');
    }

    // NOVA FUNÇÃO: Gerir funções (roles)
    manageRoles() {
        console.log('Abrindo gestão de funções...');
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>⚙️ Gestão de Funções</h3>
                    <button class="btn btn-small btn-close close-modal">×</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 20px;">
                        <button id="btnAddRole" class="btn btn-primary">➕ Adicionar Nova Função</button>
                    </div>
                    
                    <div id="rolesList" style="max-height: 400px; overflow-y: auto;">
                        <!-- Lista de funções aparecerá aqui -->
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal">Fechar</button>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').appendChild(modal);
        
        modal.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => this.closeModal(modal));
});
        
        const btnAddRole = modal.querySelector('#btnAddRole');
        if (btnAddRole) {
            btnAddRole.addEventListener('click', () => this.showAddRoleModal());
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });
        
        this.loadRolesList();
    }

    // NOVA FUNÇÃO: Carregar lista de funções
    loadRolesList() {
        const container = document.getElementById('rolesList');
        if (!container) return;
        
        if (!window.PontoApp.roles || window.PontoApp.roles.length === 0) {
            container.innerHTML = '<p class="text-center">Nenhuma função encontrada.</p>';
            return;
        }
        
        let html = '<div class="cards-grid" style="grid-template-columns: 1fr;">';
        
        window.PontoApp.roles.forEach(role => {
            const workerCount = window.PontoApp.workers.filter(w => w.roleId === role.id).length;
            
            html += `
                <div class="card" style="margin-bottom: 10px;">
                    <div class="card-header">
                        <h4>${role.name}</h4>
                        <div style="display: flex; gap: 5px;">
                            <span class="status-badge status-presente" style="font-size: 12px;">${workerCount} trabalhadores</span>
                        </div>
                    </div>
                    <div class="card-body">
                        <p><strong>Horas base:</strong> ${role.baseHours || 40}h/semana</p>
                        <div class="actions" style="margin-top: 10px;">
                            <button class="btn btn-small btn-warning" onclick="adminInterface.editRole(${role.id})">✏️ Editar</button>
                            <button class="btn btn-small btn-danger" onclick="adminInterface.deleteRole(${role.id})" ${workerCount > 0 ? 'disabled' : ''}>🗑️ Excluir</button>
                        </div>
                        ${workerCount > 0 ? '<small style="color: #e74c3c;">Não pode excluir função com trabalhadores associados</small>' : ''}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    // NOVA FUNÇÃO: Mostrar modal para adicionar função
    showAddRoleModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h3>Adicionar Nova Função</h3>
                    <button class="btn btn-small btn-close close-modal">×</button>
                </div>
                <div class="modal-body">
                    <form id="addRoleForm">
                        <div class="form-group">
                            <label for="roleName">Nome da Função:</label>
                            <input type="text" id="roleName" required placeholder="Ex: Auxiliar de Educação">
                        </div>
                        <div class="form-group">
                            <label for="roleBaseHours">Horas base por semana:</label>
                            <input type="number" id="roleBaseHours" min="0" max="168" step="1" value="40" required>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal">Cancelar</button>
                    <button class="btn btn-primary" id="btnSaveRole">Adicionar</button>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').appendChild(modal);
        
        modal.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => this.closeModal(modal));
});
        
        const btnSaveRole = modal.querySelector('#btnSaveRole');
        if (btnSaveRole) {
            btnSaveRole.addEventListener('click', () => this.saveNewRole());
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });
    }

    // NOVA FUNÇÃO: Guardar nova função
    saveNewRole() {
        const name = document.getElementById('roleName')?.value.trim();
        const baseHours = parseInt(document.getElementById('roleBaseHours')?.value) || 40;
        
        if (!name) {
            window.PontoApp.showNotification('Digite um nome para a função!', 'error');
            return;
        }
        
        // Verificar se já existe
        const existingRole = window.PontoApp.roles.find(r => r.name.toLowerCase() === name.toLowerCase());
        if (existingRole) {
            window.PontoApp.showNotification('Já existe uma função com este nome!', 'error');
            return;
        }
        
        const newRole = {
            id: Math.max(...window.PontoApp.roles.map(r => r.id), 0) + 1,
            name: name,
            baseHours: baseHours
        };
        
        window.PontoApp.roles.push(newRole);
        window.PontoApp.saveAllData();
        
        // Atualizar filtros
        this.populateFilters();
        
        // Fechar modal
        const modal = document.querySelector('.modal.active');
        if (modal) {
            this.closeModal(modal);
        }
        
        // Recarregar lista de funções
        setTimeout(() => {
            this.loadRolesList();
        }, 100);
        
        window.PontoApp.showNotification('Função adicionada com sucesso!', 'success');
    }

    // NOVA FUNÇÃO: Editar função
    editRole(roleId) {
        const role = window.PontoApp.roles.find(r => r.id === roleId);
        if (!role) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h3>Editar Função</h3>
                    <button class="btn btn-small btn-close close-modal">×</button>
                </div>
                <div class="modal-body">
                    <form id="editRoleForm">
                        <div class="form-group">
                            <label for="editRoleName">Nome da Função:</label>
                            <input type="text" id="editRoleName" value="${role.name}" required>
                        </div>
                        <div class="form-group">
                            <label for="editRoleBaseHours">Horas base por semana:</label>
                            <input type="number" id="editRoleBaseHours" min="0" max="168" step="1" value="${role.baseHours || 40}" required>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal">Cancelar</button>
                    <button class="btn btn-primary" id="btnUpdateRole">Guardar Alterações</button>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').appendChild(modal);
        
        modal.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => this.closeModal(modal));
});
        
        const btnUpdateRole = modal.querySelector('#btnUpdateRole');
        if (btnUpdateRole) {
            btnUpdateRole.addEventListener('click', () => this.updateRole(roleId));
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });
    }

    // NOVA FUNÇÃO: Atualizar função
    updateRole(roleId) {
        const name = document.getElementById('editRoleName')?.value.trim();
        const baseHours = parseInt(document.getElementById('editRoleBaseHours')?.value) || 40;
        
        if (!name) {
            window.PontoApp.showNotification('Digite um nome para a função!', 'error');
            return;
        }
        
        const role = window.PontoApp.roles.find(r => r.id === roleId);
        if (!role) return;
        
        // Verificar se já existe outra função com este nome
        const existingRole = window.PontoApp.roles.find(r => r.id !== roleId && r.name.toLowerCase() === name.toLowerCase());
        if (existingRole) {
            window.PontoApp.showNotification('Já existe outra função com este nome!', 'error');
            return;
        }
        
        role.name = name;
        role.baseHours = baseHours;
        
        // Atualizar função nos trabalhadores
        window.PontoApp.workers.forEach(worker => {
            if (worker.roleId === roleId) {
                worker.role = name;
            }
        });
        
        window.PontoApp.saveAllData();
        
        // Atualizar filtros
        this.populateFilters();
        this.loadWorkersList();
        
        // Fechar modal
        const modal = document.querySelector('.modal.active');
        if (modal) {
            this.closeModal(modal);
        }
        
        // Recarregar lista de funções
        setTimeout(() => {
            this.loadRolesList();
        }, 100);
        
        window.PontoApp.showNotification('Função atualizada com sucesso!', 'success');
    }

    // NOVA FUNÇÃO: Excluir função
    deleteRole(roleId) {
        const workerCount = window.PontoApp.workers.filter(w => w.roleId === roleId).length;
        
        if (workerCount > 0) {
            window.PontoApp.showNotification('Não pode excluir uma função com trabalhadores associados!', 'error');
            return;
        }
        
        if (confirm('Tem certeza que deseja excluir esta função?')) {
            const index = window.PontoApp.roles.findIndex(r => r.id === roleId);
            if (index !== -1) {
                window.PontoApp.roles.splice(index, 1);
                window.PontoApp.saveAllData();
                
                // Atualizar filtros
                this.populateFilters();
                
                // Recarregar lista de funções
                this.loadRolesList();
                
                window.PontoApp.showNotification('Função excluída com sucesso!', 'success');
            }
        }
    }

    // Função para editar trabalhador (incluindo função)
    editWorker(workerId) {
        console.log('Editando trabalhador:', workerId);
        
        const worker = window.PontoApp.workers.find(w => w.id === workerId);
        if (!worker) {
            window.PontoApp.showNotification('Trabalhador não encontrado!', 'error');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>Editar Trabalhador</h3>
                    <button class="btn btn-small btn-close close-modal">×</button>
                </div>
                <div class="modal-body">
                    <form id="editWorkerForm" class="form-grid">
                        <div class="form-group full-width">
                            <label for="editWorkerName">Nome:</label>
                            <input type="text" id="editWorkerName" value="${worker.name}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editWorkerRole">Função:</label>
                            <select id="editWorkerRole" required>
                                ${window.PontoApp.roles.map(role => 
                                    `<option value="${role.id}" ${worker.roleId === role.id ? 'selected' : ''}>${role.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="editWorkerRate">Custo/Hora (€):</label>
                            <input type="number" id="editWorkerRate" step="0.5" min="0" value="${worker.hourlyRate}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editWorkerPIN">PIN (4 dígitos):</label>
                            <input type="text" id="editWorkerPIN" maxlength="4" pattern="\\d{4}" value="${worker.pin}" required>
                        </div>
                        
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="editWorkerActive" ${worker.active ? 'checked' : ''}>
                                Ativo
                            </label>
                        </div>
                        
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="editWorkerIsAdmin" ${worker.isAdmin ? 'checked' : ''}>
                                Administrador
                            </label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal">Cancelar</button>
                    <button class="btn btn-primary" id="btnSaveWorkerEdit">💾 Guardar Alterações</button>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').appendChild(modal);
        
        modal.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => this.closeModal(modal));
});
        
        const btnSaveWorkerEdit = modal.querySelector('#btnSaveWorkerEdit');
        if (btnSaveWorkerEdit) {
            btnSaveWorkerEdit.addEventListener('click', () => this.saveWorkerEdit(worker.id));
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });
    }

    // Guardar edição do trabalhador
    saveWorkerEdit(workerId) {
        console.log('Guardando edição do trabalhador:', workerId);
        
        const name = document.getElementById('editWorkerName')?.value.trim();
        const roleId = parseInt(document.getElementById('editWorkerRole')?.value);
        const hourlyRate = parseFloat(document.getElementById('editWorkerRate')?.value);
        const pin = document.getElementById('editWorkerPIN')?.value.trim();
        const active = document.getElementById('editWorkerActive')?.checked || false;
        const isAdmin = document.getElementById('editWorkerIsAdmin')?.checked || false;
        
        if (!name || !roleId || !hourlyRate || !pin) {
            window.PontoApp.showNotification('Preencha todos os campos!', 'error');
            return;
        }
        
        if (!/^\d{4}$/.test(pin)) {
            window.PontoApp.showNotification('PIN deve ter exatamente 4 dígitos!', 'error');
            return;
        }
        
        // Verificar se o PIN já existe para outro trabalhador
        const existingWorker = window.PontoApp.workers.find(w => w.pin === pin && w.id !== workerId);
        if (existingWorker) {
            window.PontoApp.showNotification('Este PIN já está a ser usado por outro trabalhador!', 'error');
            return;
        }
        
        const role = window.PontoApp.roles.find(r => r.id === roleId);
        if (!role) {
            window.PontoApp.showNotification('Função não encontrada!', 'error');
            return;
        }
        
        const workerIndex = window.PontoApp.workers.findIndex(w => w.id === workerId);
        if (workerIndex === -1) {
            window.PontoApp.showNotification('Trabalhador não encontrado!', 'error');
            return;
        }
        
        // Atualizar trabalhador
        window.PontoApp.workers[workerIndex] = {
            ...window.PontoApp.workers[workerIndex],
            name: name,
            roleId: roleId,
            role: role.name,
            hourlyRate: hourlyRate,
            pin: pin,
            active: active,
            isAdmin: isAdmin
        };
        
        window.PontoApp.saveAllData();
        
        this.loadWorkersList();
        this.populateFilters(); // Atualizar filtros
        
        const modal = document.querySelector('.modal.active');
        if (modal) {
            this.closeModal(modal);
        }
        
        window.PontoApp.showNotification('Trabalhador atualizado com sucesso!', 'success');
    }

    // Função para mostrar modal de adicionar trabalhador
    showAddWorkerModal() {
        console.log('Abrindo modal para adicionar trabalhador');
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>Adicionar Novo Trabalhador</h3>
                    <button class="btn btn-small btn-close close-modal">×</button>
                </div>
                <div class="modal-body">
                    <form id="addWorkerForm" class="form-grid">
                        <div class="form-group full-width">
                            <label for="newWorkerName">Nome:</label>
                            <input type="text" id="newWorkerName" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="newWorkerRole">Função:</label>
                            <select id="newWorkerRole" required>
                                <option value="">Selecione uma função</option>
                                ${window.PontoApp.roles.map(role => 
                                    `<option value="${role.id}">${role.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="newWorkerRate">Custo/Hora (€):</label>
                            <input type="number" id="newWorkerRate" step="0.5" min="0" value="10" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="newWorkerPIN">PIN (4 dígitos):</label>
                            <input type="text" id="newWorkerPIN" maxlength="4" pattern="\\d{4}" required>
                        </div>
                        
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="newWorkerActive" checked>
                                Ativo
                            </label>
                        </div>
                        
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="newWorkerIsAdmin">
                                Administrador
                            </label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal">Cancelar</button>
                    <button class="btn btn-primary" id="btnSaveNewWorker">Adicionar</button>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').appendChild(modal);
        
        modal.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => this.closeModal(modal));
});
        
        const btnSaveNewWorker = modal.querySelector('#btnSaveNewWorker');
        if (btnSaveNewWorker) {
            btnSaveNewWorker.addEventListener('click', () => this.saveNewWorker());
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });
    }

    // Guardar novo trabalhador
    saveNewWorker() {
        console.log('Guardando novo trabalhador...');
        
        const name = document.getElementById('newWorkerName')?.value.trim();
        const roleId = parseInt(document.getElementById('newWorkerRole')?.value);
        const hourlyRate = parseFloat(document.getElementById('newWorkerRate')?.value);
        const pin = document.getElementById('newWorkerPIN')?.value.trim();
        const active = document.getElementById('newWorkerActive')?.checked || false;
        const isAdmin = document.getElementById('newWorkerIsAdmin')?.checked || false;
        
        if (!name || !roleId || !hourlyRate || !pin) {
            window.PontoApp.showNotification('Preencha todos os campos!', 'error');
            return;
        }
        
        if (!/^\d{4}$/.test(pin)) {
            window.PontoApp.showNotification('PIN deve ter exatamente 4 dígitos!', 'error');
            return;
        }
        
        // Verificar se o PIN já existe
        const existingWorker = window.PontoApp.workers.find(w => w.pin === pin);
        if (existingWorker) {
            window.PontoApp.showNotification('Este PIN já está a ser usado por outro trabalhador!', 'error');
            return;
        }
        
        const role = window.PontoApp.roles.find(r => r.id === roleId);
        if (!role) {
            window.PontoApp.showNotification('Função não encontrada!', 'error');
            return;
        }
        
        // Gerar novo ID
        const newId = Math.max(...window.PontoApp.workers.map(w => w.id), 0) + 1;
        
        const newWorker = {
            id: newId,
            name: name,
            roleId: roleId,
            role: role.name,
            hourlyRate: hourlyRate,
            pin: pin,
            active: active,
            isAdmin: isAdmin
        };
        
        window.PontoApp.workers.push(newWorker);
        window.PontoApp.saveAllData();
        
        this.loadWorkersList();
        this.populateFilters(); // Atualizar filtros
        
        const modal = document.querySelector('.modal.active');
        if (modal) {
            this.closeModal(modal);
        }
        
        window.PontoApp.showNotification('Trabalhador adicionado com sucesso!', 'success');
    }

    loadStats() {
        console.log('Carregando estatísticas...');
        
        const totalWorkers = window.PontoApp.workers.length;
        const activeWorkers = window.PontoApp.workers.filter(w => w.active).length;
        const today = new Date().toISOString().split('T')[0];
        const todayRegistries = window.PontoApp.registries.filter(r => r.date === today);
        
        document.getElementById('statsTotalWorkers').textContent = totalWorkers;
        document.getElementById('statsActiveWorkers').textContent = activeWorkers;
        document.getElementById('statsTodayRegistries').textContent = todayRegistries.length;
        
        let totalHours = 0;
        const workersToday = [...new Set(todayRegistries.map(r => r.workerId))];
        
        workersToday.forEach(workerId => {
            const workerRegistries = todayRegistries.filter(r => r.workerId === workerId);
            if (workerRegistries.length > 0) {
                totalHours += window.PontoApp.calculateWorkedHours(workerRegistries);
            }
        });
        
        document.getElementById('statsTotalHours').textContent = totalHours.toFixed(2);
        
        let totalBankHours = 0;
        let totalBankValue = 0;
        let totalJustifiedHours = 0;
        let totalJustifiedValue = 0;
        let totalVacationHours = 0;
        let totalVacationValue = 0;
        let totalTrainingHours = 0;
        let totalTrainingValue = 0;
        let totalUnjustifiedHours = 0;
        let totalUnjustifiedValue = 0;
        
        window.PontoApp.workers.forEach(worker => {
            const bankData = window.PontoApp.getBankBalance(worker.id);
            totalBankHours += bankData.hours || 0;
            totalBankValue += bankData.value || 0;
        });
        
        console.log(`💰 Banco de Horas Total Calculado: ${totalBankHours.toFixed(2)}h (${totalBankValue.toFixed(2)}€)`);
        
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        const adminRegistries = window.PontoApp.adminRegistries || [];
        adminRegistries.forEach(reg => {
            const regDate = new Date(reg.date);
            if (regDate.getMonth() + 1 === currentMonth && regDate.getFullYear() === currentYear) {
                const worker = window.PontoApp.workers.find(w => w.id === reg.workerId);
                const value = reg.hours * (worker?.hourlyRate || 0);
                
                switch(reg.type) {
                    case 'justified':
                        totalJustifiedHours += reg.hours;
                        totalJustifiedValue += value;
                        break;
                    case 'vacation':
                        totalVacationHours += reg.hours;
                        totalVacationValue += value;
                        break;
                    case 'training':
                        totalTrainingHours += reg.hours;
                        totalTrainingValue += value;
                        break;
                    case 'unjustified':
                        totalUnjustifiedHours += reg.hours;
                        totalUnjustifiedValue += value;
                        break;
                }
            }
        });
        
        const bankHoursElement = document.getElementById('statsBankHours');
        const bankValueElement = document.getElementById('statsBankValue');
        
        if (bankHoursElement) {
            bankHoursElement.textContent = totalBankHours.toFixed(2);
            if (totalBankHours < 0) {
                bankHoursElement.style.color = '#e74c3c';
                bankHoursElement.style.fontWeight = 'bold';
            } else {
                bankHoursElement.style.color = '';
                bankHoursElement.style.fontWeight = '';
            }
        }
        
        if (bankValueElement) {
            bankValueElement.textContent = totalBankValue.toFixed(2) + '€';
            if (totalBankValue < 0) {
                bankValueElement.style.color = '#e74c3c';
                bankValueElement.style.fontWeight = 'bold';
            } else {
                bankValueElement.style.color = '';
                bankValueElement.style.fontWeight = '';
            }
        }
        
        document.getElementById('statsJustifiedAbsence').textContent = totalJustifiedValue.toFixed(2) + '€';
        document.getElementById('statsJustifiedHours').textContent = totalJustifiedHours.toFixed(2);
        
        document.getElementById('statsVacationHours').textContent = totalVacationHours.toFixed(2);
        document.getElementById('statsVacationValue').textContent = totalVacationValue.toFixed(2) + '€';
        
        document.getElementById('statsTrainingHours').textContent = totalTrainingHours.toFixed(2);
        document.getElementById('statsTrainingValue').textContent = totalTrainingValue.toFixed(2) + '€';
        
        document.getElementById('statsUnjustifiedAbsence').textContent = totalUnjustifiedHours.toFixed(2);
        document.getElementById('statsUnjustifiedValue').textContent = totalUnjustifiedValue.toFixed(2) + '€';
        
        let pendingCount = 0;
        workersToday.forEach(workerId => {
            const workerRegistries = todayRegistries.filter(r => r.workerId === workerId);
            const lastRegistry = workerRegistries[workerRegistries.length - 1];
            if (lastRegistry && lastRegistry.type !== 'out') {
                pendingCount++;
            }
        });
        
        document.getElementById('statsPendingRegistries').textContent = pendingCount;
        
        console.log('📊 Estatísticas carregadas com sucesso:');
        console.log(`💰 Banco de Horas Total: ${totalBankHours.toFixed(2)}h (${totalBankValue.toFixed(2)}€)`);
    }

    loadLastRegistries() {
        console.log('Carregando últimos registros...');
        
        const tbody = document.getElementById('lastRegistriesList');
        if (!tbody) {
            console.error('Elemento lastRegistriesList não encontrado');
            return;
        }
        
        tbody.innerHTML = '';
        
        const period = document.getElementById('filterPeriod')?.value || 'today';
        const workerId = document.getElementById('filterWorker')?.value || 'all';
        const typeFilter = document.getElementById('filterType')?.value || 'all';
        const sortOrder = document.getElementById('filterSort')?.value || 'oldest';
        
        let allRegistries = [...window.PontoApp.registries];
        
        if (window.PontoApp.adminRegistries) {
            window.PontoApp.adminRegistries.forEach(adminReg => {
                const typeText = {
                    'justified': 'Falta Justificada',
                    'vacation': 'Férias',
                    'training': 'Formação',
                    'unjustified': 'Falta Injustificada'
                }[adminReg.type] || adminReg.type;
                
                allRegistries.push({
                    id: adminReg.id,
                    workerId: adminReg.workerId,
                    date: adminReg.date,
                    time: '00:00',
                    type: adminReg.type,
                    timestamp: new Date(adminReg.date).getTime(),
                    hours: adminReg.hours,
                    isAdminRegistry: true
                });
            });
        }
        
        let filteredRegistries = allRegistries;
        
        if (workerId !== 'all') {
            filteredRegistries = filteredRegistries.filter(r => r.workerId === parseInt(workerId));
        }
        
        if (typeFilter !== 'all') {
            filteredRegistries = filteredRegistries.filter(r => r.type === typeFilter);
        }
        
        const now = new Date();
        if (period === 'today') {
            const today = now.toISOString().split('T')[0];
            filteredRegistries = filteredRegistries.filter(r => r.date === today);
        } else if (period === 'week') {
            const oneWeekAgo = new Date(now);
            oneWeekAgo.setDate(now.getDate() - 7);
            filteredRegistries = filteredRegistries.filter(r => new Date(r.date) >= oneWeekAgo);
        } else if (period === 'month') {
            const oneMonthAgo = new Date(now);
            oneMonthAgo.setMonth(now.getMonth() - 1);
            filteredRegistries = filteredRegistries.filter(r => new Date(r.date) >= oneMonthAgo);
        }
        
        filteredRegistries.sort((a, b) => {
            if (sortOrder === 'newest') {
                return b.timestamp - a.timestamp;
            } else {
                return a.timestamp - b.timestamp;
            }
        });
        
        const lastRegistries = filteredRegistries.slice(0, 50);
        
        if (lastRegistries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum registro encontrado</td></tr>';
            return;
        }
        
        lastRegistries.forEach(reg => {
            const worker = window.PontoApp.workers.find(w => w.id === reg.workerId);
            if (!worker) return;
            
            const row = document.createElement('tr');
            
            const nameCell = document.createElement('td');
            nameCell.textContent = worker.name;
            
            const scheduleCell = document.createElement('td');
            scheduleCell.textContent = worker.role;
            
            const typeCell = document.createElement('td');
            let typeText = '';
            if (reg.isAdminRegistry) {
                typeText = {
                    'justified': 'Falta Justificada',
                    'vacation': 'Férias',
                    'training': 'Formação',
                    'unjustified': 'Falta Injustificada'
                }[reg.type] || reg.type;
            } else {
                typeText = {
                    'in': 'Entrada',
                    'break_start': 'Início Pausa',
                    'break_end': 'Fim Pausa',
                    'out': 'Saída'
                }[reg.type] || reg.type;
            }
            typeCell.textContent = typeText;
            
            const dateCell = document.createElement('td');
            dateCell.textContent = reg.isAdminRegistry ? reg.date : `${reg.date} ${reg.time}`;
            
            const durationCell = document.createElement('td');
            if (reg.isAdminRegistry) {
                durationCell.textContent = reg.hours ? `${reg.hours}h` : '-';
            } else {
                durationCell.textContent = '-';
            }
            
            row.appendChild(nameCell);
            row.appendChild(scheduleCell);
            row.appendChild(typeCell);
            row.appendChild(dateCell);
            row.appendChild(durationCell);
            tbody.appendChild(row);
        });
        
        console.log('Últimos registros carregados:', lastRegistries.length, 'registros');
    }

    loadAdminRegistries() {
        console.log('Carregando registros administrativos...');
        
        const tbody = document.getElementById('adminRegistriesList');
        if (!tbody) {
            console.error('Elemento adminRegistriesList não encontrado');
            return;
        }
        
        tbody.innerHTML = '';
        
        if (!window.PontoApp.adminRegistries) {
            window.PontoApp.adminRegistries = [];
        }
        
        if (window.PontoApp.adminRegistries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum registro administrativo encontrado</td></tr>';
            return;
        }
        
        const sortedRegistries = [...window.PontoApp.adminRegistries].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        
        sortedRegistries.forEach(reg => {
            const worker = window.PontoApp.workers.find(w => w.id === reg.workerId);
            if (!worker) return;
            
            const row = document.createElement('tr');
            
            const dateCell = document.createElement('td');
            dateCell.textContent = reg.date;
            
            const nameCell = document.createElement('td');
            nameCell.textContent = worker.name;
            
            const typeCell = document.createElement('td');
            const typeText = {
                'justified': 'Falta Justificada',
                'vacation': 'Férias',
                'training': 'Formação',
                'unjustified': 'Falta Injustificada'
            }[reg.type] || reg.type;
            typeCell.textContent = typeText;
            
            const hoursCell = document.createElement('td');
            hoursCell.textContent = reg.hours.toFixed(2) + 'h';
            
            const valueCell = document.createElement('td');
            const value = reg.hours * worker.hourlyRate;
            valueCell.textContent = value.toFixed(2) + '€';
            
            const notesCell = document.createElement('td');
            notesCell.textContent = reg.notes || '-';
            
            const actionsCell = document.createElement('td');
            actionsCell.className = 'actions';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-small btn-danger';
            deleteBtn.textContent = '🗑️';
            deleteBtn.onclick = () => this.deleteAdminRegistry(reg.id);
            
            actionsCell.appendChild(deleteBtn);
            
            row.appendChild(dateCell);
            row.appendChild(nameCell);
            row.appendChild(typeCell);
            row.appendChild(hoursCell);
            row.appendChild(valueCell);
            row.appendChild(notesCell);
            row.appendChild(actionsCell);
            
            tbody.appendChild(row);
        });
        
        console.log('Registros administrativos carregados:', window.PontoApp.adminRegistries.length, 'registros');
    }

    showAddRegistryModal() {
        console.log('Abrindo modal para adicionar registro administrativo');
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Adicionar Registo Administrativo</h3>
                    <button class="btn btn-small btn-close close-modal">×</button>
                </div>
                <div class="modal-body">
                    <form id="addRegistryForm" class="form-grid">
                        <div class="form-group">
                            <label for="adminRegistryWorker">Trabalhador:</label>
                            <select id="adminRegistryWorker" required>
                                <option value="">Selecione um trabalhador</option>
                                ${window.PontoApp.workers.map(w => 
                                    `<option value="${w.id}">${w.name} - ${w.role}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="adminRegistryType">Tipo:</label>
                            <select id="adminRegistryType" required>
                                <option value="justified">Falta Justificada</option>
                                <option value="vacation">Férias</option>
                                <option value="training">Formação</option>
                                <option value="unjustified">Falta Injustificada</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="adminRegistryDate">Data:</label>
                            <input type="date" id="adminRegistryDate" required value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        <div class="form-group">
                            <label for="adminRegistryHours">Horas:</label>
                            <input type="number" id="adminRegistryHours" step="0.5" min="0" value="8" required>
                        </div>
                        <div class="form-group full-width">
                            <label for="adminRegistryNotes">Observações:</label>
                            <textarea id="adminRegistryNotes" rows="3" placeholder="Observações (opcional)"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal">Cancelar</button>
                    <button class="btn btn-primary" id="btnSaveAdminRegistry">Salvar</button>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').appendChild(modal);
        
        modal.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => this.closeModal(modal));
});
        
        const btnSaveAdminRegistry = modal.querySelector('#btnSaveAdminRegistry');
        if (btnSaveAdminRegistry) {
            btnSaveAdminRegistry.addEventListener('click', () => this.saveAdminRegistryFromModal());
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });
    }

    saveAdminRegistryFromModal() {
        console.log('Salvando registro administrativo do modal...');
        
        const form = document.getElementById('addRegistryForm');
        if (!form) {
            console.error('Formulário não encontrado');
            return;
        }
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const workerId = parseInt(document.getElementById('adminRegistryWorker').value);
        const type = document.getElementById('adminRegistryType').value;
        const date = document.getElementById('adminRegistryDate').value;
        const hours = parseFloat(document.getElementById('adminRegistryHours').value);
        const notes = document.getElementById('adminRegistryNotes').value;
        
        if (!workerId || !type || !date || !hours) {
            window.PontoApp.showNotification('Preencha todos os campos obrigatórios!', 'error');
            return;
        }
        
        if (!window.PontoApp.adminRegistries) {
            window.PontoApp.adminRegistries = [];
        }
        
        const newRegistry = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            workerId: workerId,
            type: type,
            date: date,
            hours: hours,
            notes: notes || '',
            createdAt: new Date().toISOString()
        };
        
        window.PontoApp.adminRegistries.push(newRegistry);
        
        const worker = window.PontoApp.workers.find(w => w.id === workerId);
        if (worker) {
            const value = hours * worker.hourlyRate;
            
            if (!window.PontoApp.hoursBank[workerId]) {
                window.PontoApp.hoursBank[workerId] = { hours: 0, value: 0, history: [] };
            }
            
            window.PontoApp.hoursBank[workerId].hours -= hours;
            window.PontoApp.hoursBank[workerId].value -= value;
            
            window.PontoApp.hoursBank[workerId].history.push({
                date: date,
                type: type,
                hours: -hours,
                value: -value,
                description: `Registro administrativo: ${type}`,
                notes: notes
            });
        }
        
        window.PontoApp.saveAllData();
        
        this.loadAdminRegistries();
        this.loadStats();
        this.loadLastRegistries();
        
        const modal = document.querySelector('.modal.active');
        if (modal) {
            this.closeModal(modal);
        }
        
        window.PontoApp.showNotification('Registro administrativo adicionado com sucesso!', 'success');
    }

    saveAdminRegistry() {
        console.log('Salvando registro administrativo do formulário...');
        
        const workerSelect = document.getElementById('registryWorker');
        const typeSelect = document.getElementById('registryType');
        const dateInput = document.getElementById('registryDate');
        const hoursInput = document.getElementById('registryHours');
        
        if (!workerSelect || !typeSelect || !dateInput || !hoursInput) {
            window.PontoApp.showNotification('Campos do formulário não encontrados!', 'error');
            return;
        }
        
        const workerId = workerSelect.value === 'all' ? null : parseInt(workerSelect.value);
        const type = typeSelect.value;
        const date = dateInput.value;
        const hours = parseFloat(hoursInput.value);
        
        if (!date || !hours || hours <= 0) {
            window.PontoApp.showNotification('Preencha todos os campos corretamente!', 'error');
            return;
        }
        
        if (workerId === null) {
            const activeWorkers = window.PontoApp.workers.filter(w => w.active);
            let savedCount = 0;
            
            activeWorkers.forEach(worker => {
                if (!window.PontoApp.adminRegistries) {
                    window.PontoApp.adminRegistries = [];
                }
                
                const newRegistry = {
                    id: Date.now() + Math.floor(Math.random() * 1000) + worker.id,
                    workerId: worker.id,
                    type: type,
                    date: date,
                    hours: hours,
                    notes: 'Aplicado a todos os trabalhadores',
                    createdAt: new Date().toISOString()
                };
                
                window.PontoApp.adminRegistries.push(newRegistry);
                
                if (!window.PontoApp.hoursBank[worker.id]) {
                    window.PontoApp.hoursBank[worker.id] = { hours: 0, value: 0, history: [] };
                }
                
                const value = hours * worker.hourlyRate;
                window.PontoApp.hoursBank[worker.id].hours -= hours;
                window.PontoApp.hoursBank[worker.id].value -= value;
                
                window.PontoApp.hoursBank[worker.id].history.push({
                    date: date,
                    type: type,
                    hours: -hours,
                    value: -value,
                    description: `Registro administrativo: ${type}`,
                    notes: 'Aplicado a todos os trabalhadores'
                });
                
                savedCount++;
            });
            
            window.PontoApp.saveAllData();
            
            this.loadAdminRegistries();
            this.loadStats();
            this.loadLastRegistries();
            
            window.PontoApp.showNotification(`Registro aplicado a ${savedCount} trabalhadores!`, 'success');
        } else {
            const worker = window.PontoApp.workers.find(w => w.id === workerId);
            if (!worker) {
                window.PontoApp.showNotification('Trabalhador não encontrado!', 'error');
                return;
            }
            
            if (!window.PontoApp.adminRegistries) {
                window.PontoApp.adminRegistries = [];
            }
            
            const newRegistry = {
                id: Date.now() + Math.floor(Math.random() * 1000),
                workerId: workerId,
                type: type,
                date: date,
                hours: hours,
                notes: '',
                createdAt: new Date().toISOString()
            };
            
            window.PontoApp.adminRegistries.push(newRegistry);
            
            if (!window.PontoApp.hoursBank[workerId]) {
                window.PontoApp.hoursBank[workerId] = { hours: 0, value: 0, history: [] };
            }
            
            const value = hours * worker.hourlyRate;
            window.PontoApp.hoursBank[workerId].hours -= hours;
            window.PontoApp.hoursBank[workerId].value -= value;
            
            window.PontoApp.hoursBank[workerId].history.push({
                date: date,
                type: type,
                hours: -hours,
                value: -value,
                description: `Registro administrativo: ${type}`
            });
            
            window.PontoApp.saveAllData();
            
            this.loadAdminRegistries();
            this.loadStats();
            this.loadLastRegistries();
            
            window.PontoApp.showNotification('Registro administrativo adicionado com sucesso!', 'success');
        }
        
        hoursInput.value = '8';
    }

    deleteAdminRegistry(registryId) {
        if (confirm('Tem certeza que deseja excluir este registro administrativo?')) {
            const index = window.PontoApp.adminRegistries.findIndex(r => r.id === registryId);
            if (index !== -1) {
                const registry = window.PontoApp.adminRegistries[index];
                const worker = window.PontoApp.workers.find(w => w.id === registry.workerId);
                
                if (worker) {
                    const value = registry.hours * worker.hourlyRate;
                    if (window.PontoApp.hoursBank[registry.workerId]) {
                        window.PontoApp.hoursBank[registry.workerId].hours += registry.hours;
                        window.PontoApp.hoursBank[registry.workerId].value += value;
                        
                        window.PontoApp.hoursBank[registry.workerId].history.push({
                            date: new Date().toISOString().split('T')[0],
                            type: 'reversal',
                            hours: registry.hours,
                            value: value,
                            description: `Reversão de registro administrativo: ${registry.type}`,
                            notes: 'Excluído pelo administrador'
                        });
                    }
                }
                
                window.PontoApp.adminRegistries.splice(index, 1);
                window.PontoApp.saveAllData();
                
                this.loadAdminRegistries();
                this.loadStats();
                this.loadLastRegistries();
                
                window.PontoApp.showNotification('Registro administrativo excluído!', 'success');
            }
        }
    }

    loadBackupStats() {
        console.log('Carregando estatísticas de backup...');
        
        const backupWorkersCount = document.getElementById('backupWorkersCount');
        const backupRegistriesCount = document.getElementById('backupRegistriesCount');
        const backupAdminRegistriesCount = document.getElementById('backupAdminRegistriesCount');
        const backupReportsCount = document.getElementById('backupReportsCount');
        const lastBackupDate = document.getElementById('lastBackupDate');
        const autoBackupCount = document.getElementById('autoBackupCount');
        
        if (backupWorkersCount) backupWorkersCount.textContent = window.PontoApp.workers.length;
        if (backupRegistriesCount) backupRegistriesCount.textContent = window.PontoApp.registries.length;
        
        const adminRegistriesCount = window.PontoApp.adminRegistries ? window.PontoApp.adminRegistries.length : 0;
        if (backupAdminRegistriesCount) backupAdminRegistriesCount.textContent = adminRegistriesCount;
        
        if (backupReportsCount) backupReportsCount.textContent = window.PontoApp.reports.length;
        
        if (autoBackupCount) {
            const count = localStorage.getItem('ponto_auto_backup_count') || '0';
            autoBackupCount.textContent = count;
        }
        
        const lastBackup = localStorage.getItem('ponto_last_backup');
        if (lastBackup && lastBackupDate) {
            lastBackupDate.textContent = new Date(lastBackup).toLocaleString('pt-PT');
        } else if (lastBackupDate) {
            lastBackupDate.textContent = 'Nunca';
        }
        
        console.log('Estatísticas de backup carregadas');
    }

    generateReport() {
        console.log('Gerando relatório...');
        
        const workerId = document.getElementById('reportWorker')?.value;
        const month = parseInt(document.getElementById('reportMonth')?.value);
        const year = parseInt(document.getElementById('reportYear')?.value);
        const typeFilter = document.getElementById('reportTypeFilter')?.value || 'all';
        
        if (!workerId || !month || !year) {
            window.PontoApp.showNotification('Preencha todos os campos!', 'error');
            return;
        }
        
        if (workerId === 'all') {
            const activeWorkers = window.PontoApp.workers.filter(w => w.active);
            let generatedCount = 0;
            
            const reportResults = document.getElementById('reportResults');
            if (reportResults) {
                reportResults.innerHTML = '';
                
                const table = document.createElement('table');
                table.className = 'table-container';
                table.style.width = '100%';
                table.style.marginTop = '20px';
                
                const thead = document.createElement('thead');
                thead.innerHTML = `
                    <tr>
                        <th>Trabalhador</th>
                        <th>Horas Referência</th>
                        <th>Horas Trabalhadas</th>
                        <th>Faltas Justificadas</th>
                        <th>Férias</th>
                        <th>Formação</th>
                        <th>Faltas Injustificadas</th>
                        <th>Banco Horas</th>
                        <th>Valor Banco (€)</th>
                    </tr>
                `;
                
                const tbody = document.createElement('tbody');
                
                let totalReference = 0;
                let totalWorked = 0;
                let totalJustified = 0;
                let totalVacation = 0;
                let totalTraining = 0;
                let totalUnjustified = 0;
                let totalBankHours = 0;
                let totalBankValue = 0;
                
                activeWorkers.forEach(worker => {
                    // Gerar relatório para cada trabalhador
                    const report = window.PontoApp.generateMonthlyReport(worker.id, year, month, false);
                    
                    if (report) {
                        // Aplicar filtro de tipo
                        if (!this.shouldIncludeReport(report, typeFilter)) {
                            return;
                        }
                        
                        generatedCount++;
                        
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${worker.name}</td>
                            <td>${report.totalReference.toFixed(2)}</td>
                            <td>${report.totalWorked.toFixed(2)}</td>
                            <td>${report.justifiedAbsence.toFixed(2)}</td>
                            <td>${report.vacation.toFixed(2)}</td>
                            <td>${report.training.toFixed(2)}</td>
                            <td>${report.unjustifiedAbsence.toFixed(2)}</td>
                            <td>${report.hoursBank.toFixed(2)}</td>
                            <td>${report.bankValue.toFixed(2)}</td>
                        `;
                        tbody.appendChild(row);
                        
                        totalReference += report.totalReference;
                        totalWorked += report.totalWorked;
                        totalJustified += report.justifiedAbsence;
                        totalVacation += report.vacation;
                        totalTraining += report.training;
                        totalUnjustified += report.unjustifiedAbsence;
                        totalBankHours += report.hoursBank;
                        totalBankValue += report.bankValue;
                    }
                });
                
                if (generatedCount === 0) {
                    reportResults.innerHTML = '<p class="text-center">Nenhum relatório encontrado com os filtros selecionados.</p>';
                    return;
                }
                
                const totalRow = document.createElement('tr');
                totalRow.style.fontWeight = 'bold';
                totalRow.style.backgroundColor = '#f8f9fa';
                totalRow.innerHTML = `
                    <td>TOTAL</td>
                    <td>${totalReference.toFixed(2)}</td>
                    <td>${totalWorked.toFixed(2)}</td>
                    <td>${totalJustified.toFixed(2)}</td>
                    <td>${totalVacation.toFixed(2)}</td>
                    <td>${totalTraining.toFixed(2)}</td>
                    <td>${totalUnjustified.toFixed(2)}</td>
                    <td>${totalBankHours.toFixed(2)}</td>
                    <td>${totalBankValue.toFixed(2)}</td>
                `;
                tbody.appendChild(totalRow);
                
                table.appendChild(thead);
                table.appendChild(tbody);
                reportResults.appendChild(table);
                
                const exportBtn = document.createElement('button');
                exportBtn.className = 'btn btn-success';
                exportBtn.style.marginTop = '15px';
                exportBtn.innerHTML = '📊 Exportar Esta Tabela';
                exportBtn.onclick = () => this.exportReportTableToExcel(table, month, year);
                reportResults.appendChild(exportBtn);
            }
            
            window.PontoApp.showNotification(`Relatórios gerados para ${generatedCount} trabalhadores!`, 'success');
        } else {
            const report = window.PontoApp.generateMonthlyReport(parseInt(workerId), year, month);
            if (report) {
                this.showReportDetails(report);
            }
        }
        
        this.loadReportsList();
    }

    shouldIncludeReport(report, typeFilter) {
        switch(typeFilter) {
            case 'all':
                return true;
            case 'worked':
                return report.totalWorked > 0;
            case 'justified':
                return report.justifiedAbsence > 0;
            case 'vacation':
                return report.vacation > 0;
            case 'training':
                return report.training > 0;
            case 'unjustified':
                return report.unjustifiedAbsence > 0;
            case 'bank':
                return report.hoursBank !== 0;
            default:
                return true;
        }
    }

    exportReportTableToExcel(tableElement, month, year) {
        console.log('Exportando tabela para Excel...');
        
        if (typeof XLSX === 'undefined') {
            window.PontoApp.showNotification('Biblioteca Excel não carregada!', 'error');
            return;
        }
        
        try {
            const rows = tableElement.querySelectorAll('tr');
            const data = [];
            
            rows.forEach(row => {
                const rowData = [];
                row.querySelectorAll('th, td').forEach(cell => {
                    rowData.push(cell.textContent.trim());
                });
                data.push(rowData);
            });
            
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.aoa_to_sheet(data);
            
            const colWidths = [];
            for (let i = 0; i < data[0].length; i++) {
                colWidths.push({ wch: Math.max(...data.map(row => row[i] ? row[i].length : 0)) + 2 });
            }
            worksheet['!cols'] = colWidths;
            
            XLSX.utils.book_append_sheet(workbook, worksheet, `Relatório ${month}_${year}`);
            
            const fileName = `relatorio_agregado_${month}_${year}_${new Date().getTime()}.xlsx`;
            XLSX.writeFile(workbook, fileName);
            
            window.PontoApp.showNotification('Tabela exportada para Excel!', 'success');
        } catch (error) {
            console.error('Erro ao exportar tabela:', error);
            window.PontoApp.showNotification('Erro ao exportar tabela!', 'error');
        }
    }

    exportReportExcel() {
        console.log('Exportando relatório para Excel...');
        
        const workerId = document.getElementById('reportWorker')?.value;
        const month = parseInt(document.getElementById('reportMonth')?.value);
        const year = parseInt(document.getElementById('reportYear')?.value);
        const typeFilter = document.getElementById('reportTypeFilter')?.value || 'all';
        
        if (!workerId || !month || !year) {
            window.PontoApp.showNotification('Selecione o período primeiro!', 'error');
            return;
        }
        
        let reportsToExport = [];
        
        if (workerId === 'all') {
            // Gerar relatórios para todos os trabalhadores ativos
            const activeWorkers = window.PontoApp.workers.filter(w => w.active);
            
            activeWorkers.forEach(worker => {
                const report = window.PontoApp.generateMonthlyReport(worker.id, year, month, true);
                if (report && this.shouldIncludeReport(report, typeFilter)) {
                    reportsToExport.push(report);
                }
            });
        } else {
            const report = window.PontoApp.reports.find(r => 
                r.workerId === parseInt(workerId) && r.month === month && r.year === year
            );
            if (report) {
                if (this.shouldIncludeReport(report, typeFilter)) {
                    reportsToExport = [report];
                }
            } else {
                const newReport = window.PontoApp.generateMonthlyReport(parseInt(workerId), year, month);
                if (newReport && this.shouldIncludeReport(newReport, typeFilter)) {
                    reportsToExport = [newReport];
                }
            }
        }
        
        if (reportsToExport.length === 0) {
            window.PontoApp.showNotification('Nenhum relatório encontrado para este período!', 'warning');
            return;
        }
        
        if (typeof XLSX === 'undefined') {
            window.PontoApp.showNotification('Biblioteca Excel não carregada!', 'error');
            return;
        }
        
        try {
            const workbook = XLSX.utils.book_new();
            
            const summaryData = [
                ['Relatório Mensal - Check Point'],
                [`Período: ${month}/${year}`],
                [`Data de exportação: ${new Date().toLocaleDateString('pt-PT')}`],
                [],
                ['Trabalhador', 'Horas Referência', 'Horas Trabalhadas', 'Diferença', 
                 'Faltas Justificadas', 'Férias', 'Formação', 'Faltas Injustificadas',
                 'Banco Horas', 'Valor Banco', 'Deduções', 'Total Líquido']
            ];
            
            reportsToExport.forEach(report => {
                const worker = window.PontoApp.workers.find(w => w.id === report.workerId);
                if (worker) {
                    const totalLiquido = (report.totalReference * worker.hourlyRate) - report.deductionValue + report.bankValue;
                    summaryData.push([
                        worker.name,
                        report.totalReference.toFixed(2),
                        report.totalWorked.toFixed(2),
                        (report.totalWorked - report.totalReference).toFixed(2),
                        report.justifiedAbsence.toFixed(2),
                        report.vacation.toFixed(2),
                        report.training.toFixed(2),
                        report.unjustifiedAbsence.toFixed(2),
                        report.hoursBank.toFixed(2),
                        report.bankValue.toFixed(2),
                        report.deductionValue.toFixed(2),
                        totalLiquido.toFixed(2)
                    ]);
                }
            });
            
            const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');
            
            reportsToExport.forEach((report, index) => {
                const worker = window.PontoApp.workers.find(w => w.id === report.workerId);
                if (worker) {
                    const detailedData = [
                        [`Relatório Detalhado - ${worker.name}`],
                        [`Período: ${month}/${year}`],
                        [`Função: ${worker.role}`],
                        [`Custo/Hora: ${worker.hourlyRate.toFixed(2)}€`],
                        [],
                        ['Item', 'Horas', 'Valor (€)', 'Observações'],
                        ['Horas de Referência', report.totalReference.toFixed(2), (report.totalReference * worker.hourlyRate).toFixed(2), 'Horas contratuais do mês'],
                        ['Horas Trabalhadas', report.totalWorked.toFixed(2), (report.totalWorked * worker.hourlyRate).toFixed(2), 'Horas efetivamente trabalhadas'],
                        ['Diferença', (report.totalWorked - report.totalReference).toFixed(2), ((report.totalWorked - report.totalReference) * worker.hourlyRate).toFixed(2), report.totalWorked >= report.totalReference ? 'Horas extras' : 'Horas em falta'],
                        ['Faltas Justificadas', report.justifiedAbsence.toFixed(2), (report.justifiedAbsence * worker.hourlyRate).toFixed(2), 'Horas com justificação médica ou similar'],
                        ['Horas de Férias', report.vacation.toFixed(2), (report.vacation * worker.hourlyRate).toFixed(2), 'Horas de férias'],
                        ['Horas de Formação', report.training.toFixed(2), (report.training * worker.hourlyRate).toFixed(2), 'Horas em formação'],
                        ['Faltas Injustificadas', report.unjustifiedAbsence.toFixed(2), report.deductionValue.toFixed(2), 'Horas sem justificação'],
                        ['Banco de Horas', report.hoursBank.toFixed(2), report.bankValue.toFixed(2), 'Saldo acumulado'],
                        ['Salário Base', '', (report.totalReference * worker.hourlyRate).toFixed(2), 'Salário contratual'],
                        ['Deduções', '', '-' + report.deductionValue.toFixed(2), 'Valor descontado'],
                        ['Ajuste Banco Horas', '', report.bankValue.toFixed(2), 'Valor do banco de horas'],
                        ['TOTAL LÍQUIDO', '', ((report.totalReference * worker.hourlyRate) - report.deductionValue + report.bankValue).toFixed(2), 'Valor final a pagar']
                    ];
                    
                    const detailedSheet = XLSX.utils.aoa_to_sheet(detailedData);
                    XLSX.utils.book_append_sheet(workbook, detailedSheet, worker.name.substring(0, 31));
                }
            });
            
            const fileName = `relatorios_${month}_${year}_${new Date().getTime()}.xlsx`;
            XLSX.writeFile(workbook, fileName);
            
            window.PontoApp.showNotification(`${reportsToExport.length} relatório(s) exportado(s) para Excel!`, 'success');
        } catch (error) {
            console.error('Erro ao exportar para Excel:', error);
            window.PontoApp.showNotification('Erro ao exportar para Excel!', 'error');
        }
    }

    loadReportsList() {
        console.log('Carregando lista de relatórios...');
        
        const tbody = document.getElementById('reportsList');
        if (!tbody) {
            console.error('Elemento reportsList não encontrado');
            return;
        }
        
        tbody.innerHTML = '';
        
        if (window.PontoApp.reports.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" class="text-center">Nenhum relatório gerado</td></tr>';
            return;
        }
        
        const sortedReports = [...window.PontoApp.reports].sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            if (a.month !== b.month) return b.month - a.month;
            return b.id - a.id;
        });
        
        sortedReports.forEach(report => {
            const worker = window.PontoApp.workers.find(w => w.id === report.workerId);
            if (!worker) return;
            
            const row = document.createElement('tr');
            
            const nameCell = document.createElement('td');
            nameCell.textContent = worker.name;
            
            const periodCell = document.createElement('td');
            periodCell.textContent = `${report.month}/${report.year}`;
            
            const refCell = document.createElement('td');
            refCell.textContent = report.totalReference.toFixed(2) + 'h';
            
            const workedCell = document.createElement('td');
            workedCell.textContent = report.totalWorked.toFixed(2) + 'h';
            
            const justifiedCell = document.createElement('td');
            justifiedCell.textContent = report.justifiedAbsence.toFixed(2) + 'h';
            
            const vacationCell = document.createElement('td');
            vacationCell.textContent = report.vacation.toFixed(2) + 'h';
            
            const trainingCell = document.createElement('td');
            trainingCell.textContent = report.training.toFixed(2) + 'h';
            
            const unjustifiedCell = document.createElement('td');
            unjustifiedCell.textContent = report.unjustifiedAbsence.toFixed(2) + 'h';
            
            const bankCell = document.createElement('td');
            bankCell.textContent = report.hoursBank.toFixed(2) + 'h';
            
            const actionsCell = document.createElement('td');
            actionsCell.className = 'actions';
            
            const viewBtn = document.createElement('button');
            viewBtn.className = 'btn btn-small btn-primary';
            viewBtn.textContent = '👁️';
            viewBtn.onclick = () => this.showReportDetails(report);
            
            const exportBtn = document.createElement('button');
            exportBtn.className = 'btn btn-small btn-success';
            exportBtn.textContent = '📥';
            exportBtn.onclick = () => this.exportSingleReportExcel(report);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-small btn-danger';
            deleteBtn.textContent = '🗑️';
            deleteBtn.onclick = () => this.deleteReport(report.id);
            
            actionsCell.appendChild(viewBtn);
            actionsCell.appendChild(exportBtn);
            actionsCell.appendChild(deleteBtn);
            
            row.appendChild(nameCell);
            row.appendChild(periodCell);
            row.appendChild(refCell);
            row.appendChild(workedCell);
            row.appendChild(justifiedCell);
            row.appendChild(vacationCell);
            row.appendChild(trainingCell);
            row.appendChild(unjustifiedCell);
            row.appendChild(bankCell);
            row.appendChild(actionsCell);
            
            tbody.appendChild(row);
        });
        
        console.log('Lista de relatórios carregada:', sortedReports.length, 'relatórios');
    }

    showReportDetails(report) {
        console.log('Mostrando detalhes do relatório:', report.id);
        
        const worker = window.PontoApp.workers.find(w => w.id === report.workerId);
        if (!worker) return;
        
        // Obter histórico do banco de horas
        const bankData = window.PontoApp.getBankBalance(report.workerId);
        const bankHistory = bankData.history || [];
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3>Detalhes do Relatório</h3>
                    <button class="btn btn-small btn-close close-modal">×</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 20px;">
                        <p><strong>Trabalhador:</strong> ${worker.name}</p>
                        <p><strong>Período:</strong> ${report.month}/${report.year}</p>
                        <p><strong>Função:</strong> ${worker.role}</p>
                        <p><strong>Custo/Hora:</strong> ${worker.hourlyRate.toFixed(2)}€</p>
                    </div>
                    
                    <div class="cards-grid" style="grid-template-columns: repeat(2, 1fr);">
                        <div class="card">
                            <div class="card-header">
                                <h4>Horas Referência</h4>
                            </div>
                            <div class="card-body">
                                <p class="stat-number">${report.totalReference}h</p>
                                <p class="stat-info">Valor: ${(report.totalReference * worker.hourlyRate).toFixed(2)}€</p>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div class="card-header">
                                <h4>Horas Trabalhadas</h4>
                            </div>
                            <div class="card-body">
                                <p class="stat-number">${report.totalWorked}h</p>
                                <p class="stat-info">Diferença: ${(report.totalWorked - report.totalReference).toFixed(2)}h</p>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div class="card-header">
                                <h4>Faltas Justificadas</h4>
                            </div>
                            <div class="card-body">
                                <p class="stat-number">${report.justifiedAbsence}h</p>
                                <p class="stat-info">Valor: ${(report.justifiedAbsence * worker.hourlyRate).toFixed(2)}€</p>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div class="card-header">
                                <h4>Férias</h4>
                            </div>
                            <div class="card-body">
                                <p class="stat-number">${report.vacation}h</p>
                                <p class="stat-info">Valor: ${(report.vacation * worker.hourlyRate).toFixed(2)}€</p>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div class="card-header">
                                <h4>Formação</h4>
                            </div>
                            <div class="card-body">
                                <p class="stat-number">${report.training}h</p>
                                <p class="stat-info">Valor: ${(report.training * worker.hourlyRate).toFixed(2)}€</p>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div class="card-header">
                                <h4>Faltas Injustificadas</h4>
                            </div>
                            <div class="card-body">
                                <p class="stat-number">${report.unjustifiedAbsence}h</p>
                                <p class="stat-info">Deduções: ${report.deductionValue.toFixed(2)}€</p>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div class="card-header">
                                <h4>Banco de Horas</h4>
                            </div>
                            <div class="card-body">
                                <p class="stat-number">${report.hoursBank}h</p>
                                <p class="stat-info">Valor: ${report.bankValue.toFixed(2)}€</p>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div class="card-header">
                                <h4>Total Líquido</h4>
                            </div>
                            <div class="card-body">
                                <p class="stat-number">${((report.totalReference * worker.hourlyRate) - report.deductionValue + report.bankValue).toFixed(2)}€</p>
                                <p class="stat-info">Valor final a pagar</p>
                            </div>
                        </div>
                    </div>
                    
                    ${bankHistory.length > 0 ? `
                        <div style="margin-top: 30px;">
                            <h4>Histórico do Banco de Horas</h4>
                            <div class="table-container" style="max-height: 200px; overflow-y: auto;">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Data</th>
                                            <th>Tipo</th>
                                            <th>Horas</th>
                                            <th>Descrição</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${bankHistory.sort((a, b) => new Date(b.date) - new Date(a.date)).map(mov => `
                                            <tr>
                                                <td>${new Date(mov.date).toLocaleDateString('pt-PT')}</td>
                                                <td>${mov.type === 'extra' ? 'Horas Extras' : mov.type === 'deduction' ? 'Dedução' : mov.type}</td>
                                                <td style="color: ${mov.hours > 0 ? 'green' : 'red'}; font-weight: bold;">
                                                    ${mov.hours > 0 ? '+' : ''}${mov.hours.toFixed(2)}h
                                                </td>
                                                <td>${mov.description || '-'}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal">Fechar</button>
                    <button class="btn btn-primary" id="btnExportThisReport">📥 Exportar</button>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').appendChild(modal);
        
        modal.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => this.closeModal(modal));
});
        
        const btnExportThisReport = modal.querySelector('#btnExportThisReport');
        if (btnExportThisReport) {
            btnExportThisReport.addEventListener('click', () => this.exportSingleReportExcel(report));
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });
    }

    exportSingleReportExcel(report) {
        if (typeof XLSX === 'undefined') {
            window.PontoApp.showNotification('Biblioteca Excel não carregada!', 'error');
            return;
        }
        
        try {
            const worker = window.PontoApp.workers.find(w => w.id === report.workerId);
            if (!worker) return;
            
            const workbook = XLSX.utils.book_new();
            
            const data = [
                ['Relatório Individual - Check Point'],
                [`Trabalhador: ${worker.name}`],
                [`Função: ${worker.role}`],
                [`Período: ${report.month}/${report.year}`],
                [`Custo/Hora: ${worker.hourlyRate.toFixed(2)}€`],
                [`Data de exportação: ${new Date().toLocaleDateString('pt-PT')}`],
                [],
                ['Item', 'Horas', 'Valor (€)', 'Observações'],
                ['Horas de Referência', report.totalReference.toFixed(2), (report.totalReference * worker.hourlyRate).toFixed(2), 'Horas contratuais do mês'],
                ['Horas Trabalhadas', report.totalWorked.toFixed(2), (report.totalWorked * worker.hourlyRate).toFixed(2), 'Horas efetivamente trabalhadas'],
                ['Diferença', (report.totalWorked - report.totalReference).toFixed(2), ((report.totalWorked - report.totalReference) * worker.hourlyRate).toFixed(2), report.totalWorked >= report.totalReference ? 'Horas extras' : 'Horas em falta'],
                ['Faltas Justificadas', report.justifiedAbsence.toFixed(2), (report.justifiedAbsence * worker.hourlyRate).toFixed(2), 'Horas com justificação'],
                ['Horas de Férias', report.vacation.toFixed(2), (report.vacation * worker.hourlyRate).toFixed(2), 'Horas de férias'],
                ['Horas de Formação', report.training.toFixed(2), (report.training * worker.hourlyRate).toFixed(2), 'Horas em formação'],
                ['Faltas Injustificadas', report.unjustifiedAbsence.toFixed(2), report.deductionValue.toFixed(2), 'Horas sem justificação'],
                ['Banco de Horas', report.hoursBank.toFixed(2), report.bankValue.toFixed(2), 'Saldo acumulado'],
                ['Salário Base', '', (report.totalReference * worker.hourlyRate).toFixed(2), 'Salário contratual'],
                ['Deduções', '', '-' + report.deductionValue.toFixed(2), 'Valor descontado'],
                ['Ajuste Banco Horas', '', report.bankValue.toFixed(2), 'Valor do banco de horas'],
                ['TOTAL LÍQUIDO', '', ((report.totalReference * worker.hourlyRate) - report.deductionValue + report.bankValue).toFixed(2), 'Valor final a pagar']
            ];
            
            const worksheet = XLSX.utils.aoa_to_sheet(data);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');
            
            const fileName = `relatorio_${worker.name.replace(/\s+/g, '_')}_${report.month}_${report.year}.xlsx`;
            XLSX.writeFile(workbook, fileName);
            
            window.PontoApp.showNotification('Relatório exportado para Excel!', 'success');
        } catch (error) {
            console.error('Erro ao exportar relatório:', error);
            window.PontoApp.showNotification('Erro ao exportar relatório!', 'error');
        }
    }

    exportReportPDF() {
        console.log('Exportando relatório para PDF...');
        
        const workerId = document.getElementById('reportWorker')?.value;
        const month = parseInt(document.getElementById('reportMonth')?.value);
        const year = parseInt(document.getElementById('reportYear')?.value);
        
        if (!workerId || !month || !year) {
            window.PontoApp.showNotification('Selecione o período primeiro!', 'error');
            return;
        }
        
        if (workerId === 'all') {
            this.exportAllReportsPDF(month, year);
        } else {
            const report = window.PontoApp.reports.find(r => 
                r.workerId === parseInt(workerId) && r.month === month && r.year === year
            );
            if (report) {
                this.exportSingleReportPDF(report.id);
            } else {
                window.PontoApp.showNotification('Relatório não encontrado!', 'error');
            }
        }
    }

    exportAllReportsPDF(month, year) {
        console.log('Exportando todos os relatórios para PDF...');
        
        if (typeof window.jspdf === 'undefined') {
            window.PontoApp.showNotification('Biblioteca PDF não carregada!', 'error');
            return;
        }
        
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            const reports = window.PontoApp.reports.filter(r => r.month === month && r.year === year);
            
            if (reports.length === 0) {
                window.PontoApp.showNotification('Nenhum relatório encontrado para este período!', 'warning');
                return;
            }
            
            let yPos = 20;
            
            doc.setFontSize(20);
            doc.setTextColor(67, 97, 238);
            doc.text('RELATÓRIOS MENSAL - CHECK POINT', 105, yPos, { align: 'center' });
            
            yPos += 10;
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(`Período: ${month}/${year}`, 105, yPos, { align: 'center' });
            
            yPos += 10;
            doc.text(`Data de exportação: ${new Date().toLocaleDateString('pt-PT')}`, 105, yPos, { align: 'center' });
            
            yPos += 20;
            
            const summaryData = [
                ['Trabalhador', 'Horas Ref.', 'Horas Trab.', 'Faltas Just.', 'Férias', 'Formação', 'Faltas Injust.', 'Banco Horas', 'Valor Banco']
            ];
            
            let totalReference = 0;
            let totalWorked = 0;
            let totalJustified = 0;
            let totalVacation = 0;
            let totalTraining = 0;
            let totalUnjustified = 0;
            let totalBankHours = 0;
            let totalBankValue = 0;
            
            reports.forEach(report => {
                const worker = window.PontoApp.workers.find(w => w.id === report.workerId);
                if (worker) {
                    summaryData.push([
                        worker.name.substring(0, 15),
                        report.totalReference.toFixed(1),
                        report.totalWorked.toFixed(1),
                        report.justifiedAbsence.toFixed(1),
                        report.vacation.toFixed(1),
                        report.training.toFixed(1),
                        report.unjustifiedAbsence.toFixed(1),
                        report.hoursBank.toFixed(1),
                        report.bankValue.toFixed(2) + '€'
                    ]);
                    
                    totalReference += report.totalReference;
                    totalWorked += report.totalWorked;
                    totalJustified += report.justifiedAbsence;
                    totalVacation += report.vacation;
                    totalTraining += report.training;
                    totalUnjustified += report.unjustifiedAbsence;
                    totalBankHours += report.hoursBank;
                    totalBankValue += report.bankValue;
                }
            });
            
            summaryData.push([
                'TOTAL',
                totalReference.toFixed(1),
                totalWorked.toFixed(1),
                totalJustified.toFixed(1),
                totalVacation.toFixed(1),
                totalTraining.toFixed(1),
                totalUnjustified.toFixed(1),
                totalBankHours.toFixed(1),
                totalBankValue.toFixed(2) + '€'
            ]);
            
            doc.autoTable({
                head: [summaryData[0]],
                body: summaryData.slice(1),
                startY: yPos,
                theme: 'grid',
                headStyles: { fillColor: [67, 97, 238] },
                pageBreak: 'auto'
            });
            
            doc.save(`relatorios_${month}_${year}.pdf`);
            window.PontoApp.showNotification('Relatórios exportados para PDF!', 'success');
        } catch (error) {
            console.error('Erro ao exportar para PDF:', error);
            window.PontoApp.showNotification('Erro ao exportar para PDF!', 'error');
        }
    }

    exportSingleReportPDF(reportId) {
        console.log('Exportando relatório único para PDF:', reportId);
        
        if (typeof window.jspdf === 'undefined') {
            window.PontoApp.showNotification('Biblioteca PDF não carregada!', 'error');
            return;
        }
        
        try {
            const report = window.PontoApp.reports.find(r => r.id === reportId);
            if (!report) {
                window.PontoApp.showNotification('Relatório não encontrado!', 'error');
                return;
            }
            
            const worker = window.PontoApp.workers.find(w => w.id === report.workerId);
            if (!worker) return;
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            let yPos = 20;
            
            doc.setFontSize(20);
            doc.setTextColor(67, 97, 238);
            doc.text('RELATÓRIO INDIVIDUAL - CHECK POINT', 105, yPos, { align: 'center' });
            
            yPos += 10;
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text(`${worker.name}`, 105, yPos, { align: 'center' });
            
            yPos += 10;
            doc.setFontSize(12);
            doc.text(`Período: ${report.month}/${report.year}`, 105, yPos, { align: 'center' });
            
            yPos += 10;
            doc.text(`Função: ${worker.role} | Custo/Hora: ${worker.hourlyRate.toFixed(2)}€`, 105, yPos, { align: 'center' });
            
            yPos += 20;
            
            const data = [
                ['Descrição', 'Horas', 'Valor (€)'],
                ['Horas de Referência', report.totalReference.toFixed(2), (report.totalReference * worker.hourlyRate).toFixed(2)],
                ['Horas Trabalhadas', report.totalWorked.toFixed(2), (report.totalWorked * worker.hourlyRate).toFixed(2)],
                ['Diferença', (report.totalWorked - report.totalReference).toFixed(2), ((report.totalWorked - report.totalReference) * worker.hourlyRate).toFixed(2)],
                ['Faltas Justificadas', report.justifiedAbsence.toFixed(2), (report.justifiedAbsence * worker.hourlyRate).toFixed(2)],
                ['Horas de Férias', report.vacation.toFixed(2), (report.vacation * worker.hourlyRate).toFixed(2)],
                ['Horas de Formação', report.training.toFixed(2), (report.training * worker.hourlyRate).toFixed(2)],
                ['Faltas Injustificadas', report.unjustifiedAbsence.toFixed(2), report.deductionValue.toFixed(2)],
                ['Banco de Horas', report.hoursBank.toFixed(2), report.bankValue.toFixed(2)],
                ['', '', ''],
                ['SALÁRIO BASE', '', (report.totalReference * worker.hourlyRate).toFixed(2)],
                ['(-) DEDUÇÕES', '', '-' + report.deductionValue.toFixed(2)],
                ['(+) BANCO HORAS', '', '+' + report.bankValue.toFixed(2)],
                ['TOTAL LÍQUIDO', '', ((report.totalReference * worker.hourlyRate) - report.deductionValue + report.bankValue).toFixed(2)]
            ];
            
            doc.autoTable({
                head: [data[0]],
                body: data.slice(1, 9),
                startY: yPos,
                theme: 'grid',
                headStyles: { fillColor: [67, 97, 238] },
                styles: { fontSize: 10 }
            });
            
            const finalY = doc.lastAutoTable.finalY || yPos + 100;
            
            doc.autoTable({
                body: data.slice(10),
                startY: finalY + 10,
                theme: 'plain',
                styles: { fontSize: 11, fontStyle: 'bold' },
                columnStyles: {
                    0: { cellWidth: 60 },
                    1: { cellWidth: 30 },
                    2: { cellWidth: 40 }
                }
            });
            
            doc.save(`relatorio_${worker.name.replace(/\s+/g, '_')}_${report.month}_${report.year}.pdf`);
            window.PontoApp.showNotification('Relatório exportado para PDF!', 'success');
        } catch (error) {
            console.error('Erro ao exportar relatório para PDF:', error);
            window.PontoApp.showNotification('Erro ao exportar relatório para PDF!', 'error');
        }
    }

    deleteReport(reportId) {
        if (confirm('Tem certeza que deseja excluir este relatório?')) {
            const index = window.PontoApp.reports.findIndex(r => r.id === reportId);
            if (index !== -1) {
                window.PontoApp.reports.splice(index, 1);
                window.PontoApp.saveAllData();
                this.loadReportsList();
                window.PontoApp.showNotification('Relatório excluído!', 'success');
            }
        }
    }

    loadSchedulesList() {
        console.log('Carregando lista de horários...');
        
        const tbody = document.getElementById('schedulesList');
        if (!tbody) {
            console.error('Elemento schedulesList não encontrado');
            return;
        }
        
        tbody.innerHTML = '';
        
        if (window.PontoApp.workers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">Nenhum trabalhador encontrado</td></tr>';
            return;
        }
        
        window.PontoApp.workers.forEach(worker => {
            const row = document.createElement('tr');
            
            const nameCell = document.createElement('td');
            nameCell.textContent = worker.name;
            
            const weeksCell = document.createElement('td');
            const scheduledWeeks = this.getWorkerScheduledWeeks(worker.id);
            
            if (scheduledWeeks > 0) {
                weeksCell.innerHTML = `
                    <span style="display: inline-block; padding: 4px 8px; background: #d4edda; 
                                 border-radius: 12px; color: #155724; font-weight: 600; font-size: 12px;">
                        ${scheduledWeeks} semana(s)
                    </span>
                    <br>
                    <small style="color: #6c757d; font-size: 11px;">
                        ${this.getWorkerScheduleYears(worker.id)}
                    </small>
                `;
            } else {
                weeksCell.innerHTML = `
                    <span style="display: inline-block; padding: 4px 8px; background: #f8d7da; 
                                 border-radius: 12px; color: #721c24; font-weight: 600; font-size: 12px;">
                        Sem atribuições
                    </span>
                `;
            }
            
            const actionsCell = document.createElement('td');
            actionsCell.className = 'actions';
            
            const detailsBtn = document.createElement('button');
            detailsBtn.className = 'btn btn-small';
            detailsBtn.textContent = '👁️ Ver';
            detailsBtn.onclick = () => {
                this.showWorkerScheduleDetails(worker.id);
            };
            
            actionsCell.appendChild(detailsBtn);
            
            row.appendChild(nameCell);
            row.appendChild(weeksCell);
            row.appendChild(actionsCell);
            
            tbody.appendChild(row);
        });
        
        console.log('Lista de horários carregada');
    }

    getWorkerScheduledWeeks(workerId) {
        if (!window.PontoApp.weekScheduleAssignments || !window.PontoApp.weekScheduleAssignments[workerId]) {
            return 0;
        }
        
        let totalWeeks = 0;
        Object.keys(window.PontoApp.weekScheduleAssignments[workerId]).forEach(year => {
            const yearAssignments = window.PontoApp.weekScheduleAssignments[workerId][year];
            if (yearAssignments && typeof yearAssignments === 'object') {
                totalWeeks += Object.keys(yearAssignments).length;
            }
        });
        
        return totalWeeks;
    }

    getWorkerScheduleYears(workerId) {
        if (!window.PontoApp.weekScheduleAssignments || !window.PontoApp.weekScheduleAssignments[workerId]) {
            return '';
        }
        
        const years = Object.keys(window.PontoApp.weekScheduleAssignments[workerId]);
        if (years.length === 0) return '';
        
        if (years.length === 1) {
            return `Ano: ${years[0]}`;
        } else {
            return `Anos: ${years.join(', ')}`;
        }
    }

    showWorkerScheduleDetails(workerId) {
        const worker = window.PontoApp.workers.find(w => w.id === workerId);
        if (!worker) return;
        
        const scheduledWeeks = this.getWorkerScheduledWeeks(workerId);
        
        let message = `Trabalhador: ${worker.name}\n`;
        message += `Total de semanas com horário: ${scheduledWeeks}\n\n`;
        
        if (window.PontoApp.weekScheduleAssignments[workerId]) {
            message += 'Atribuições por ano:\n';
            Object.keys(window.PontoApp.weekScheduleAssignments[workerId]).forEach(year => {
                const yearAssignments = window.PontoApp.weekScheduleAssignments[workerId][year];
                const weekCount = Object.keys(yearAssignments).length;
                message += `• ${year}: ${weekCount} semana(s)\n`;
            });
        } else {
            message += 'Nenhuma atribuição por semana.';
        }
        
        alert(message);
    }

    showWeekScheduleEditor(workerId) {
        console.log('Mostrando editor de horário por semanas para trabalhador:', workerId);
        
        const editor = document.getElementById('scheduleEditor');
        if (!editor) return;
        
        const worker = window.PontoApp.workers.find(w => w.id === parseInt(workerId));
        if (!worker) return;
        
        editor.style.display = 'block';
        editor.innerHTML = `
            <div class="week-schedule-editor">
                <h3>📅 Horário de ${worker.name}</h3>
                <p>Configure o horário por semanas do ano</p>
                
                <div style="margin: 20px 0;">
                    <h4>Selecionar Semanas</h4>
                    <div class="week-selection-grid" style="display: grid; grid-template-columns: repeat(10, 1fr); gap: 5px; max-height: 200px; overflow-y: auto; padding: 10px; border: 1px solid #ddd; border-radius: 8px; background: #f8f9fa;">
                        ${Array.from({length: 52}, (_, i) => i + 1).map(week => `
                            <div class="week-item" data-week="${week}" style="padding: 8px; text-align: center; background: white; border: 1px solid #dee2e6; border-radius: 4px; cursor: pointer; transition: all 0.2s;">
                                Sem ${week}
                            </div>
                        `).join('')}
                    </div>
                    <div style="margin-top: 10px;">
                        <button id="btnSelectAllWeeks" class="btn btn-small">Selecionar Todas</button>
                        <button id="btnClearSelection" class="btn btn-small">Limpar Seleção</button>
                    </div>
                </div>
                
                <div style="margin: 20px 0;">
                    <h4>Selecionar Horário Predefinido</h4>
                    <select id="weekTemplateSelect" class="filter-select" style="width: 100%;">
                        <option value="">Selecione um horário...</option>
                        ${window.PontoApp.scheduleTemplates.map(template => `
                            <option value="${template.id}">${template.name} (${template.totalHours}h/semana)</option>
                        `).join('')}
                    </select>
                </div>
                
                <div style="margin: 20px 0;">
                    <button id="btnApplyWeekSchedule" class="btn btn-primary">✅ Aplicar Horário às Semanas Selecionadas</button>
                    <button id="btnRemoveSelected" class="btn btn-danger" style="margin-left: 10px;">🗑️ Remover Horário das Semanas Selecionadas</button>
                </div>
                
                <div id="weekAssignmentsList">
                    <!-- Atribuições aparecerão aqui -->
                </div>
            </div>
        `;
        
        const weekItems = editor.querySelectorAll('.week-item');
        weekItems.forEach(item => {
            item.addEventListener('click', () => {
                item.classList.toggle('selected');
            });
        });
        
        const btnSelectAllWeeks = editor.querySelector('#btnSelectAllWeeks');
        if (btnSelectAllWeeks) {
            btnSelectAllWeeks.addEventListener('click', () => {
                weekItems.forEach(item => {
                    item.classList.add('selected');
                });
            });
        }
        
        const btnClearSelection = editor.querySelector('#btnClearSelection');
        if (btnClearSelection) {
            btnClearSelection.addEventListener('click', () => {
                weekItems.forEach(item => {
                    item.classList.remove('selected');
                });
            });
        }
        
        const btnApplyWeekSchedule = editor.querySelector('#btnApplyWeekSchedule');
        if (btnApplyWeekSchedule) {
            btnApplyWeekSchedule.addEventListener('click', () => {
                this.applyWeekSchedule(workerId);
            });
        }
        
        const btnRemoveSelected = editor.querySelector('#btnRemoveSelected');
        if (btnRemoveSelected) {
            btnRemoveSelected.addEventListener('click', () => {
                this.removeSelectedWeekAssignments(workerId);
            });
        }
        
        this.loadWeekAssignments(workerId);
    }

    loadWeekAssignments(workerId) {
        const container = document.getElementById('weekAssignmentsList');
        if (!container) return;
        
        if (!window.PontoApp.weekScheduleAssignments || !window.PontoApp.weekScheduleAssignments[workerId]) {
            container.innerHTML = '<p>Nenhuma atribuição de horário por semana.</p>';
            return;
        }
        
        let html = '<h4>Horários Atribuídos</h4>';
        html += '<div style="max-height: 200px; overflow-y: auto;">';
        
        Object.keys(window.PontoApp.weekScheduleAssignments[workerId]).forEach(year => {
            const yearAssignments = window.PontoApp.weekScheduleAssignments[workerId][year];
            
            Object.keys(yearAssignments).forEach(week => {
                const templateId = yearAssignments[week];
                const template = window.PontoApp.scheduleTemplates.find(t => t.id === templateId);
                
                if (template) {
                    html += `
                        <div class="week-assignment-item">
                            <div>
                                <strong>Ano ${year}, Semana ${week}</strong><br>
                                <small>${template.name} (${template.totalHours}h)</small>
                            </div>
                            <button class="btn btn-small btn-danger" onclick="adminInterface.removeWeekAssignment(${workerId}, ${year}, ${week})">🗑️</button>
                        </div>
                    `;
                }
            });
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    applyWeekSchedule(workerId) {
        const selectedWeeks = Array.from(document.querySelectorAll('.week-item.selected'))
            .map(item => parseInt(item.dataset.week));
        
        const templateId = document.getElementById('weekTemplateSelect').value;
        
        if (selectedWeeks.length === 0) {
            window.PontoApp.showNotification('Selecione pelo menos uma semana!', 'error');
            return;
        }
        
        if (!templateId) {
            window.PontoApp.showNotification('Selecione um horário predefinido!', 'error');
            return;
        }
        
        const template = window.PontoApp.scheduleTemplates.find(t => t.id === parseInt(templateId));
        if (!template) {
            window.PontoApp.showNotification('Horário predefinido não encontrado!', 'error');
            return;
        }
        
        const currentYear = new Date().getFullYear();
        
        if (!window.PontoApp.weekScheduleAssignments) {
            window.PontoApp.weekScheduleAssignments = {};
        }
        if (!window.PontoApp.weekScheduleAssignments[workerId]) {
            window.PontoApp.weekScheduleAssignments[workerId] = {};
        }
        if (!window.PontoApp.weekScheduleAssignments[workerId][currentYear]) {
            window.PontoApp.weekScheduleAssignments[workerId][currentYear] = {};
        }
        
        selectedWeeks.forEach(week => {
            window.PontoApp.weekScheduleAssignments[workerId][currentYear][week] = parseInt(templateId);
        });
        
        localStorage.setItem('ponto_week_schedule_assignments', JSON.stringify(window.PontoApp.weekScheduleAssignments));
        
        this.loadWeekAssignments(workerId);
        
        document.querySelectorAll('.week-item.selected').forEach(item => {
            item.classList.remove('selected');
        });
        
        window.PontoApp.showNotification(`Horário aplicado a ${selectedWeeks.length} semana(s)!`, 'success');
    }

    removeSelectedWeekAssignments(workerId) {
        const selectedWeeks = Array.from(document.querySelectorAll('.week-item.selected'))
            .map(item => parseInt(item.dataset.week));
        
        if (selectedWeeks.length === 0) {
            window.PontoApp.showNotification('Selecione pelo menos uma semana!', 'error');
            return;
        }
        
        if (!confirm(`Remover horário de ${selectedWeeks.length} semana(s) selecionada(s)?`)) {
            return;
        }
        
        const currentYear = new Date().getFullYear();
        
        if (window.PontoApp.weekScheduleAssignments[workerId] && 
            window.PontoApp.weekScheduleAssignments[workerId][currentYear]) {
            
            selectedWeeks.forEach(week => {
                delete window.PontoApp.weekScheduleAssignments[workerId][currentYear][week];
            });
            
            if (Object.keys(window.PontoApp.weekScheduleAssignments[workerId][currentYear]).length === 0) {
                delete window.PontoApp.weekScheduleAssignments[workerId][currentYear];
            }
            
            localStorage.setItem('ponto_week_schedule_assignments', JSON.stringify(window.PontoApp.weekScheduleAssignments));
            
            this.loadWeekAssignments(workerId);
            
            document.querySelectorAll('.week-item.selected').forEach(item => {
                item.classList.remove('selected');
            });
            
            window.PontoApp.showNotification(`Horário removido de ${selectedWeeks.length} semana(s)!`, 'success');
        }
    }

    removeWeekAssignment(workerId, year, week) {
        if (confirm(`Remover horário da semana ${week} do ano ${year}?`)) {
            if (window.PontoApp.weekScheduleAssignments[workerId] && 
                window.PontoApp.weekScheduleAssignments[workerId][year]) {
                delete window.PontoApp.weekScheduleAssignments[workerId][year][week];
                
                if (Object.keys(window.PontoApp.weekScheduleAssignments[workerId][year]).length === 0) {
                    delete window.PontoApp.weekScheduleAssignments[workerId][year];
                }
                
                localStorage.setItem('ponto_week_schedule_assignments', JSON.stringify(window.PontoApp.weekScheduleAssignments));
                
                this.loadWeekAssignments(workerId);
                
                window.PontoApp.showNotification('Atribuição removida!', 'success');
            }
        }
    }

    manageScheduleTemplates() {
        console.log('Gerindo templates de horário...');
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3>Gerir Horários Predefinidos</h3>
                    <button class="btn btn-small btn-close close-modal">×</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 20px;">
                        <button id="btnAddTemplate" class="btn btn-primary">➕ Adicionar Novo Horário</button>
                    </div>
                    
                    <div id="templatesList" style="max-height: 400px; overflow-y: auto;">
                        <!-- Lista de templates aparecerá aqui -->
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal">Fechar</button>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').appendChild(modal);
        
        modal.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => this.closeModal(modal));
});
        
        const btnAddTemplate = modal.querySelector('#btnAddTemplate');
        if (btnAddTemplate) {
            btnAddTemplate.addEventListener('click', () => this.showAddTemplateModal());
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });
        
        this.loadTemplatesList();
    }

    loadTemplatesList() {
        const container = document.getElementById('templatesList');
        if (!container) return;
        
        if (!window.PontoApp.scheduleTemplates || window.PontoApp.scheduleTemplates.length === 0) {
            container.innerHTML = '<p class="text-center">Nenhum horário predefinido encontrado.</p>';
            return;
        }
        
        let html = '<div class="cards-grid" style="grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));">';
        
        window.PontoApp.scheduleTemplates.forEach(template => {
            html += `
                <div class="card">
                    <div class="card-header">
                        <h4>${template.name}</h4>
                        <div>${template.totalHours}h/semana</div>
                    </div>
                    <div class="card-body">
                        <table style="width: 100%; font-size: 12px; margin-bottom: 10px;">
                            <thead>
                                <tr>
                                    <th>Dia</th>
                                    <th>Entrada</th>
                                    <th>Saída</th>
                                    <th>Pausa</th>
                                </tr>
                            </thead>
                            <tbody>
            `;
            
            const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
            template.days.forEach((day, index) => {
                html += `
                    <tr>
                        <td>${days[index]}</td>
                        <td>${day.start}</td>
                        <td>${day.end}</td>
                        <td>${day.break || '-'}</td>
                    </tr>
                `;
            });
            
            html += `
                            </tbody>
                        </table>
                        <div class="actions">
                            <button class="btn btn-small btn-warning" onclick="adminInterface.editTemplate(${template.id})">✏️ Editar</button>
                            <button class="btn btn-small btn-danger" onclick="adminInterface.deleteTemplate(${template.id})">🗑️ Excluir</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    showAddTemplateModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-header">
                    <h3>Adicionar Horário Predefinido</h3>
                    <button class="btn btn-small btn-close close-modal">×</button>
                </div>
                <div class="modal-body">
                    <form id="addTemplateForm">
                        <div class="form-group">
                            <label for="templateName">Nome do Horário:</label>
                            <input type="text" id="templateName" required placeholder="Ex: Horário A - Normal">
                        </div>
                        
                        <div style="margin: 20px 0;">
                            <h4>Horário Semanal</h4>
                            <table style="width: 100%;">
                                <thead>
                                    <tr>
                                        <th>Dia</th>
                                        <th>Entrada</th>
                                        <th>Saída</th>
                                        <th>Pausa</th>
                                        <th>Horas</th>
                                    </tr>
                                </thead>
                                <tbody id="templateDaysTable">
                                    <!-- Dias serão adicionados aqui -->
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="form-group">
                            <label>Total Semanal: <span id="templateTotalHours">0</span> horas</label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal">Cancelar</button>
                    <button class="btn btn-primary" id="btnSaveTemplate">Salvar Horário</button>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').appendChild(modal);
        
        modal.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => this.closeModal(modal));
});
        
        const btnSaveTemplate = modal.querySelector('#btnSaveTemplate');
        if (btnSaveTemplate) {
            btnSaveTemplate.addEventListener('click', () => this.saveTemplate());
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });
        
        this.loadTemplateDaysEditor();
    }

    loadTemplateDaysEditor() {
    const tbody = document.getElementById('templateDaysTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const days = [
        { id: 1, name: 'Segunda-feira' },
        { id: 2, name: 'Terça-feira' },
        { id: 3, name: 'Quarta-feira' },
        { id: 4, name: 'Quinta-feira' },
        { id: 5, name: 'Sexta-feira' }
    ];
    
    days.forEach(day => {
        const row = document.createElement('tr');
        
        // Dia da semana
        const dayCell = document.createElement('td');
        dayCell.textContent = day.name;
        row.appendChild(dayCell);
        
        // COLUNA ENTRADA - classe específica
        const startCell = document.createElement('td');
        const startInput = document.createElement('input');
        startInput.type = 'time';
        startInput.value = '09:00';
        startInput.dataset.day = day.id;
        startInput.className = 'template-start-input'; // Classe DISTINTA para entrada
        startInput.setAttribute('data-field', 'start'); // Atributo adicional para segurança
        startCell.appendChild(startInput);
        row.appendChild(startCell);
        
        // COLUNA SAÍDA - classe específica
        const endCell = document.createElement('td');
        const endInput = document.createElement('input');
        endInput.type = 'time';
        endInput.value = '17:00';
        endInput.dataset.day = day.id;
        endInput.className = 'template-end-input'; // Classe DISTINTA para saída
        endInput.setAttribute('data-field', 'end');
        endCell.appendChild(endInput);
        row.appendChild(endCell);
        
        // COLUNA PAUSA
        const breakCell = document.createElement('td');
        const breakInput = document.createElement('input');
        breakInput.type = 'text';
        breakInput.placeholder = '13:00-14:00';
        breakInput.value = '13:00-14:00';
        breakInput.dataset.day = day.id;
        breakInput.className = 'template-break-input';
        breakCell.appendChild(breakInput);
        row.appendChild(breakCell);
        
        // COLUNA HORAS (calculadas automaticamente)
        const hoursCell = document.createElement('td');
        hoursCell.className = 'template-day-hours';
        hoursCell.dataset.day = day.id;
        hoursCell.textContent = '8.0h'; // 9h-17h = 8h, com pausa de 1h = 7h? Vamos calcular certo
        row.appendChild(hoursCell);
        
        tbody.appendChild(row);
        
        // FUNÇÃO PARA CALCULAR HORAS DESTE DIA
        const updateDayHours = () => {
            const hours = this.calculateTemplateDayHours(
                day.id,
                startInput.value,
                endInput.value,
                breakInput.value
            );
            hoursCell.textContent = hours.toFixed(1) + 'h';
            this.updateTemplateTotalHours();
        };
        
        // Adicionar event listeners para atualizar em tempo real
        startInput.addEventListener('change', updateDayHours);
        endInput.addEventListener('change', updateDayHours);
        breakInput.addEventListener('change', updateDayHours);
        
        // Calcular horas iniciais
        setTimeout(() => {
            updateDayHours();
        }, 10);
    });
    
    this.updateTemplateTotalHours();
}

    calculateTemplateDayHours(day, start, end, breakTime) {
        const startMinutes = window.PontoApp.timeToMinutes(start);
        const endMinutes = window.PontoApp.timeToMinutes(end);
        
        let totalMinutes = endMinutes - startMinutes;
        
        if (breakTime) {
            const [breakStart, breakEnd] = breakTime.split('-').map(t => window.PontoApp.timeToMinutes(t));
            if (breakStart && breakEnd) {
                totalMinutes -= (breakEnd - breakStart);
            }
        }
        
        const hours = totalMinutes / 60;
        const hoursCell = document.querySelector(`.template-day-hours[data-day="${day}"]`);
        if (hoursCell) {
            hoursCell.textContent = hours.toFixed(1) + 'h';
        }
        
        return hours;
    }

    updateTemplateTotalHours() {
    let total = 0;
    
    for (let day = 1; day <= 5; day++) {
        // ✅ CORREÇÃO: Usar as novas classes
        const startInput = document.querySelector(`.template-start-input[data-day="${day}"]`);
        const endInput = document.querySelector(`.template-end-input[data-day="${day}"]`);
        const breakInput = document.querySelector(`.template-break-input[data-day="${day}"]`);
        
        if (startInput && endInput) {
            const hours = this.calculateTemplateDayHours(
                day,
                startInput.value,
                endInput.value,
                breakInput?.value || ''
            );
            total += hours;
        }
    }
    
    const totalElement = document.getElementById('templateTotalHours');
    if (totalElement) {
        totalElement.textContent = total.toFixed(1);
    }
}

    saveTemplate() {
    console.log('💾 A guardar novo horário...');
    
    const templateName = document.getElementById('templateName')?.value;
    if (!templateName) {
        window.PontoApp.showNotification('Digite um nome para o horário!', 'error');
        return;
    }
    
    const days = [];
    let totalHours = 0;
    
    // Percorrer os dias da semana (1 = Segunda, 5 = Sexta)
    for (let day = 1; day <= 5; day++) {
        // USAR AS CLASSES ESPECÍFICAS CRIADAS ACIMA
        const startInput = document.querySelector(`.template-start-input[data-day="${day}"]`);
        const endInput = document.querySelector(`.template-end-input[data-day="${day}"]`);
        const breakInput = document.querySelector(`.template-break-input[data-day="${day}"]`);
        
        // Verificar se os inputs existem e têm valores
        if (startInput && endInput && startInput.value && endInput.value) {
            
            // Calcular horas deste dia específico
            const dayHours = this.calculateTemplateDayHours(
                day,
                startInput.value,
                endInput.value,
                breakInput?.value || ''
            );
            
            totalHours += dayHours;
            
            // Adicionar ao array de dias
            days.push({
                day: day,
                start: startInput.value,
                end: endInput.value,
                break: breakInput?.value || ''
            });
            
            console.log(`   Dia ${day}: ${startInput.value} - ${endInput.value} = ${dayHours.toFixed(1)}h`);
        } else {
            console.warn(`   Dia ${day}: inputs não encontrados ou vazios`);
        }
    }
    
    // Validar se pelo menos um dia foi configurado
    if (days.length === 0) {
        window.PontoApp.showNotification('Configure pelo menos um dia de trabalho!', 'error');
        return;
    }
    
    // CRIAR O NOVO TEMPLATE
    const newTemplate = {
        id: Date.now(), // ID único baseado no timestamp
        name: templateName,
        days: days,
        totalHours: parseFloat(totalHours.toFixed(1)) // Arredondar para 1 casa decimal
    };
    
    // Adicionar ao array global
    if (!window.PontoApp.scheduleTemplates) {
        window.PontoApp.scheduleTemplates = [];
    }
    
    window.PontoApp.scheduleTemplates.push(newTemplate);
    
    // Guardar no localStorage
    localStorage.setItem('ponto_schedule_templates', JSON.stringify(window.PontoApp.scheduleTemplates));
    
    console.log('✅ HORÁRIO CRIADO COM SUCESSO:', newTemplate);
    
    // Notificar o utilizador
    window.PontoApp.showNotification('Horário predefinido adicionado com sucesso!', 'success');
    
    // Fechar o modal atual
    const modal = document.querySelector('.modal.active');
    if (modal) {
        this.closeModal(modal);
    }
    
    // Recarregar a lista de templates (se o modal de gestão estiver aberto)
    setTimeout(() => {
        const templatesModal = document.querySelector('.modal.active');
        if (templatesModal && templatesModal.querySelector('#templatesList')) {
            this.loadTemplatesList();
        }
    }, 300);
}

    editTemplate(templateId) {
    console.log('Editando template:', templateId);
    if (confirm('Para editar, é melhor criar um novo horário com as alterações. Deseja criar um novo baseado neste?')) {
        const template = window.PontoApp.scheduleTemplates.find(t => t.id === templateId);
        if (template) {
            this.showAddTemplateModal();
            
            setTimeout(() => {
                document.getElementById('templateName').value = template.name + ' (Cópia)';
                template.days.forEach(day => {
                    // ✅ CORREÇÃO: Usar as novas classes
                    const startInput = document.querySelector(`.template-start-input[data-day="${day.day}"]`);
                    const endInput = document.querySelector(`.template-end-input[data-day="${day.day}"]`);
                    const breakInput = document.querySelector(`.template-break-input[data-day="${day.day}"]`);
                    
                    if (startInput) startInput.value = day.start;
                    if (endInput) endInput.value = day.end;
                    if (breakInput) breakInput.value = day.break || '';
                    
                    this.calculateTemplateDayHours(day.day, day.start, day.end, day.break || '');
                });
                
                this.updateTemplateTotalHours();
            }, 100);
        }
    }
}

    deleteTemplate(templateId) {
        if (confirm('Tem certeza que deseja excluir este horário predefinido?')) {
            const index = window.PontoApp.scheduleTemplates.findIndex(t => t.id === templateId);
            if (index !== -1) {
                window.PontoApp.scheduleTemplates.splice(index, 1);
                localStorage.setItem('ponto_schedule_templates', JSON.stringify(window.PontoApp.scheduleTemplates));
                this.loadTemplatesList();
                window.PontoApp.showNotification('Horário predefinido excluído!', 'success');
            }
        }
    }

    showImportModal() {
        console.log('Abrindo modal de importação');
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Importar Backup</h3>
                    <button class="btn btn-small btn-close close-modal">×</button>
                </div>
                <div class="modal-body">
                    <p>Selecione o arquivo de backup (.xlsx):</p>
                    <input type="file" id="backupFile" accept=".xlsx,.xls">
                    <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 5px;">
                        <p><strong>⚠️ Atenção:</strong></p>
                        <p>1. Esta ação substituirá todos os dados atuais!</p>
                        <p>2. Faça um backup antes de importar.</p>
                        <p>3. Verifique se o arquivo é do sistema de ponto.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal">Cancelar</button>
                    <button class="btn btn-primary" id="btnConfirmImport">Importar</button>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').appendChild(modal);
        
        modal.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => this.closeModal(modal));
});
        
        const btnConfirmImport = modal.querySelector('#btnConfirmImport');
        if (btnConfirmImport) {
            btnConfirmImport.addEventListener('click', () => this.importBackup());
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });
    }

    showGenerateReportModal() {
        console.log('Abrindo modal para gerar relatório');
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Gerar Relatório</h3>
                    <button class="btn btn-small btn-close close-modal">×</button>
                </div>
                <div class="modal-body">
                    <form id="generateReportForm" class="form-grid">
                        <div class="form-group full-width">
                            <label for="genReportWorker">Trabalhador:</label>
                            <select id="genReportWorker" required>
                                <option value="">Selecione um trabalhador</option>
                                ${window.PontoApp.workers.map(w => 
                                    `<option value="${w.id}">${w.name} - ${w.role}</option>`
                                ).join('')}
                        </select>
                        </div>
                        <div class="form-group">
                            <label for="genReportMonth">Mês:</label>
                            <select id="genReportMonth" required>
                                ${Array.from({length: 12}, (_, i) => 
                                    `<option value="${i+1}" ${new Date().getMonth() === i ? 'selected' : ''}>
                                        ${['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][i]}
                                    </option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="genReportYear">Ano:</label>
                            <input type="number" id="genReportYear" value="${new Date().getFullYear()}" min="2020" max="2030" required>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal">Cancelar</button>
                    <button class="btn btn-primary" id="btnGenerateReportFromModal">Gerar</button>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').appendChild(modal);
        
        modal.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => this.closeModal(modal));
});
        
        const btnGenerateReportFromModal = modal.querySelector('#btnGenerateReportFromModal');
        if (btnGenerateReportFromModal) {
            btnGenerateReportFromModal.addEventListener('click', () => this.generateReportFromModal());
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });
    }

    generateReportFromModal() {
        console.log('Gerando relatório do modal...');
        
        const workerId = parseInt(document.getElementById('genReportWorker').value);
        const month = parseInt(document.getElementById('genReportMonth').value);
        const year = parseInt(document.getElementById('genReportYear').value);
        
        if (!workerId || !month || !year) {
            window.PontoApp.showNotification('Preencha todos os campos!', 'error');
            return;
        }
        
        const report = window.PontoApp.generateMonthlyReport(workerId, year, month);
        if (report) {
            this.showReportDetails(report);
            this.loadReportsList();
            const modal = document.querySelector('.modal.active');
            if (modal) {
                this.closeModal(modal);
            }
        }
    }

    showWorkerQR(worker) {
        console.log('Mostrando QR Code para:', worker.name);
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h3>QR Code - ${worker.name}</h3>
                    <button class="btn btn-small btn-close close-modal">×</button>
                </div>
                <div class="modal-body" style="text-align: center;">
                    <div id="workerQRCode" style="width: 250px; height: 250px; margin: 20px auto;"></div>
                    <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                        <p><strong>Nome:</strong> ${worker.name}</p>
                        <p><strong>Função:</strong> ${worker.role}</p>
                        <p><strong>PIN:</strong> ${worker.pin}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal">Fechar</button>
                    <button class="btn btn-primary" id="btnPrintQR">🖨️ Imprimir</button>
                </div>
            </div>
        `;
        
        document.getElementById('modalContainer').appendChild(modal);
        
        modal.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => this.closeModal(modal));
});
        
        setTimeout(() => {
            window.PontoApp.generateQRCodeElement(worker.id, 'workerQRCode', 250);
        }, 100);
        
        const btnPrintQR = modal.querySelector('#btnPrintQR');
        if (btnPrintQR) {
            btnPrintQR.addEventListener('click', () => {
                this.printQR(worker.name, worker.pin, worker.role);
            });
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });
    }

    exportBackupExcel() {
        console.log('Exportando backup para Excel...');
        
        if (typeof XLSX === 'undefined') {
            window.PontoApp.showNotification('Biblioteca Excel não carregada!', 'error');
            return;
        }
        
        try {
            const backup = {
                workers: window.PontoApp.workers,
                schedules: [],
                registries: window.PontoApp.registries,
                reports: window.PontoApp.reports,
                hoursBank: window.PontoApp.hoursBank,
                roles: window.PontoApp.roles,
                adminRegistries: window.PontoApp.adminRegistries || [],
                scheduleTemplates: window.PontoApp.scheduleTemplates || [],
                scheduleAssignments: window.PontoApp.scheduleAssignments || {},
                weekScheduleAssignments: window.PontoApp.weekScheduleAssignments || {},
                exportedAt: new Date().toISOString(),
                version: '1.3'
            };
            
            Object.keys(window.PontoApp.schedules).forEach(workerId => {
                const schedule = window.PontoApp.schedules[workerId];
                if (schedule.reference) {
                    schedule.reference.forEach(daySchedule => {
                        backup.schedules.push({
                            workerId: parseInt(workerId),
                            day: daySchedule.day,
                            start: daySchedule.start,
                            end: daySchedule.end,
                            break: daySchedule.break || ''
                        });
                    });
                }
            });
            
            const workbook = XLSX.utils.book_new();
            
            const workersSheet = XLSX.utils.json_to_sheet(backup.workers);
            XLSX.utils.book_append_sheet(workbook, workersSheet, 'Trabalhadores');
            
            if (backup.registries.length > 0) {
                const registriesSheet = XLSX.utils.json_to_sheet(backup.registries);
                XLSX.utils.book_append_sheet(workbook, registriesSheet, 'Registos');
            }
            
            if (backup.reports.length > 0) {
                const reportsSheet = XLSX.utils.json_to_sheet(backup.reports);
                XLSX.utils.book_append_sheet(workbook, reportsSheet, 'Relatórios');
            }
            
            if (backup.schedules.length > 0) {
                const schedulesSheet = XLSX.utils.json_to_sheet(backup.schedules);
                XLSX.utils.book_append_sheet(workbook, schedulesSheet, 'Horários');
            }
            
            const hoursBankArray = [];
            Object.keys(backup.hoursBank).forEach(workerId => {
                const bank = backup.hoursBank[workerId];
                hoursBankArray.push({
                    workerId: parseInt(workerId),
                    hours: bank.hours || 0,
                    value: bank.value || 0
                });
            });
            
            if (hoursBankArray.length > 0) {
                const hoursBankSheet = XLSX.utils.json_to_sheet(hoursBankArray);
                XLSX.utils.book_append_sheet(workbook, hoursBankSheet, 'BancoHoras');
            }
            
            const rolesSheet = XLSX.utils.json_to_sheet(backup.roles);
            XLSX.utils.book_append_sheet(workbook, rolesSheet, 'Funções');
            
            if (backup.adminRegistries.length > 0) {
                const adminRegistriesSheet = XLSX.utils.json_to_sheet(backup.adminRegistries);
                XLSX.utils.book_append_sheet(workbook, adminRegistriesSheet, 'RegistosAdmin');
            }
            
            if (backup.scheduleTemplates.length > 0) {
                const templatesSheet = XLSX.utils.json_to_sheet(backup.scheduleTemplates);
                XLSX.utils.book_append_sheet(workbook, templatesSheet, 'TemplatesHorarios');
            }
            
            if (Object.keys(backup.scheduleAssignments).length > 0) {
                const assignmentsArray = [];
                Object.keys(backup.scheduleAssignments).forEach(workerId => {
                    backup.scheduleAssignments[workerId].forEach(assignment => {
                        assignmentsArray.push({
                            workerId: parseInt(workerId),
                            templateId: assignment.templateId,
                            weeks: assignment.weeks.join(','),
                            assignedAt: assignment.assignedAt
                        });
                    });
                });
                
                if (assignmentsArray.length > 0) {
                    const assignmentsSheet = XLSX.utils.json_to_sheet(assignmentsArray);
                    XLSX.utils.book_append_sheet(workbook, assignmentsSheet, 'AtribuicoesHorarios');
                }
            }
            
            if (Object.keys(backup.weekScheduleAssignments).length > 0) {
                const weekAssignmentsArray = [];
                Object.keys(backup.weekScheduleAssignments).forEach(workerId => {
                    Object.keys(backup.weekScheduleAssignments[workerId]).forEach(year => {
                        Object.keys(backup.weekScheduleAssignments[workerId][year]).forEach(week => {
                            weekAssignmentsArray.push({
                                workerId: parseInt(workerId),
                                year: parseInt(year),
                                week: parseInt(week),
                                templateId: backup.weekScheduleAssignments[workerId][year][week]
                            });
                        });
                    });
                });
                
                if (weekAssignmentsArray.length > 0) {
                    const weekAssignmentsSheet = XLSX.utils.json_to_sheet(weekAssignmentsArray);
                    XLSX.utils.book_append_sheet(workbook, weekAssignmentsSheet, 'AtribuicoesSemanas');
                }
            }
            
            const fileName = `backup_checkpoint_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, fileName);
            
            localStorage.setItem('ponto_last_backup', new Date().toISOString());
            window.PontoApp.showNotification('Backup exportado para Excel!', 'success');
        } catch (error) {
            console.error('Erro ao exportar backup para Excel:', error);
            window.PontoApp.showNotification('Erro ao exportar backup para Excel!', 'error');
        }
    }

    exportBackupPDF() {
        console.log('Exportando backup para PDF...');
        
        if (typeof window.jspdf === 'undefined') {
            window.PontoApp.showNotification('Biblioteca PDF não carregada!', 'error');
            return;
        }
        
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.setFontSize(20);
            doc.setTextColor(67, 97, 238);
            doc.text('CHECK POINT - BACKUP COMPLETO', 105, 20, { align: 'center' });
            
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(`Data do backup: ${new Date().toLocaleDateString('pt-PT')} ${new Date().toLocaleTimeString('pt-PT')}`, 105, 30, { align: 'center' });
            
            let yPos = 45;
            doc.setFontSize(14);
            doc.text('ESTATÍSTICAS DO SISTEMA', 105, yPos, { align: 'center' });
            
            yPos += 15;
            doc.setFontSize(12);
            doc.text(`Trabalhadores: ${window.PontoApp.workers.length}`, 20, yPos);
            yPos += 7;
            doc.text(`Registos: ${window.PontoApp.registries.length}`, 20, yPos);
            yPos += 7;
            doc.text(`Registos Admin: ${(window.PontoApp.adminRegistries || []).length}`, 20, yPos);
            yPos += 7;
            
            const activeWorkers = window.PontoApp.workers.filter(w => w.active).length;
            doc.text(`Trabalhadores Ativos: ${activeWorkers}`, 20, yPos);
            yPos += 7;
            
            const today = new Date().toISOString().split('T')[0];
            const todayRegistries = window.PontoApp.registries.filter(r => r.date === today);
            doc.text(`Registos Hoje: ${todayRegistries.length}`, 20, yPos);
            
            yPos += 15;
            doc.setFontSize(14);
            doc.text('LISTA DE TRABALHADORES', 105, yPos, { align: 'center' });
            
            const workersData = [
                ['Nome', 'Função', 'Custo/Hora', 'Estado']
            ];
            
            window.PontoApp.workers.forEach(worker => {
                workersData.push([
                    worker.name,
                    worker.role,
                    worker.hourlyRate.toFixed(2) + '€',
                    worker.active ? 'Ativo' : 'Inativo'
                ]);
            });
            
            doc.autoTable({
                head: [workersData[0]],
                body: workersData.slice(1),
                startY: yPos + 5,
                theme: 'grid',
                headStyles: { fillColor: [67, 97, 238] },
                pageBreak: 'auto'
            });
            
            doc.save(`backup_checkpoint_${new Date().toISOString().split('T')[0]}.pdf`);
            window.PontoApp.showNotification('Backup exportado para PDF!', 'success');
        } catch (error) {
            console.error('Erro ao exportar backup para PDF:', error);
            window.PontoApp.showNotification('Erro ao exportar backup para PDF!', 'error');
        }
    }

    clearAllData() {
    console.log('Limpando apenas registos de ponto e administrativos...');
    
    if (confirm('⚠️ ATENÇÃO: Esta ação irá apagar TODOS os registos de ponto, registos administrativos, relatórios e banco de horas!\n\nOs trabalhadores, funções e horários serão mantidos.\n\nTem certeza?')) {
        
        // 1. VERIFICAR SE PontoApp EXISTE
        if (!window.PontoApp) {
            window.PontoApp.showNotification('Erro: Aplicação não inicializada!', 'error');
            return;
        }
        
        // 2. GUARDAR REFERÊNCIAS AOS DADOS QUE QUEREMOS PRESERVAR
        const workersPreservados = window.PontoApp.workers;
        const rolesPreservados = window.PontoApp.roles;
        const schedulesPreservados = window.PontoApp.schedules;
        const scheduleTemplatesPreservados = window.PontoApp.scheduleTemplates;
        const scheduleAssignmentsPreservados = window.PontoApp.scheduleAssignments;
        const weekScheduleAssignmentsPreservados = window.PontoApp.weekScheduleAssignments;
        
        // 3. LIMPAR APENAS OS DADOS DE REGISTOS
        window.PontoApp.registries = [];
        window.PontoApp.reports = [];
        window.PontoApp.adminRegistries = [];
        window.PontoApp.hoursBank = {};
        window.PontoApp.processedDays = {};
        
        // 4. RESTAURAR OS DADOS PRESERVADOS (garantia dupla)
        window.PontoApp.workers = workersPreservados;
        window.PontoApp.roles = rolesPreservados;
        window.PontoApp.schedules = schedulesPreservados;
        window.PontoApp.scheduleTemplates = scheduleTemplatesPreservados;
        window.PontoApp.scheduleAssignments = scheduleAssignmentsPreservados;
        window.PontoApp.weekScheduleAssignments = weekScheduleAssignmentsPreservados;
        
        // 5. ATUALIZAR O LOCALSTORAGE COM OS DADOS LIMPOS
        window.PontoApp.saveAllData();
        
        // 6. LIMPAR APENAS AS CHAVES ESPECÍFICAS DO LOCALSTORAGE QUE QUEREMOS APAGAR
        localStorage.removeItem('ponto_registries');
        localStorage.removeItem('ponto_reports');
        localStorage.removeItem('ponto_admin_registries');
        localStorage.removeItem('ponto_hours_bank');
        localStorage.removeItem('ponto_processed_days');
        
        // 7. NÃO LIMPAR SESSIONSTORAGE (mantém login do admin)
        // sessionStorage NÃO é limpo!
        
        // 8. ATUALIZAR TODOS OS COMPONENTES DA INTERFACE QUE MOSTRAM REGISTOS
        this.loadWorkersList();        // Mantém, mas necessário para refresh
        this.loadStats();              // Importante - mostra estatísticas atualizadas
        this.loadLastRegistries();     // Crucial - mostra registos vazios
        this.loadBackupStats();        // Atualiza contadores
        this.loadReportsList();        // Crucial - mostra relatórios vazios
        this.loadAdminRegistries();    // Crucial - mostra registos admin vazios
        this.loadSchedulesList();      // Mantém horários visíveis
        
        // 9. GARANTIR QUE O ADMIN PERMANECE NA PÁGINA
        window.PontoApp.showNotification('✅ Todos os registos foram apagados com sucesso! Trabalhadores e horários mantidos.', 'success');
        
        console.log('✅ Limpeza concluída. Registos apagados, estrutura preservada.');
    }
    }
	
    loadQRCodeLibrary() {
        if (typeof QRCode === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
            document.head.appendChild(script);
        }
    }

    printQR(name, pin, role) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR Code - ${name}</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
                    .container { max-width: 400px; margin: 0 auto; }
                    .qr-placeholder { 
                        width: 300px; 
                        height: 300px; 
                        background: #f0f0f0; 
                        margin: 20px auto; 
                        border: 2px dashed #ccc;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #666;
                    }
                    .info { 
                        margin-top: 20px; 
                        padding: 15px; 
                        background: #f8f9fa; 
                        border-radius: 8px; 
                        text-align: left;
                        display: inline-block;
                    }
                    h2 { color: #2c3e50; margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Check Point - QR Code de Acesso</h2>
                    <div class="qr-placeholder">
                        <p>QR Code impresso separadamente<br>ou use o PIN abaixo</p>
                    </div>
                    <div class="info">
                        <p><strong>Nome:</strong> ${name}</p>
                        <p><strong>PIN:</strong> ${pin}</p>
                        <p><strong>Função:</strong> ${role}</p>
                        <p><strong>Data de emissão:</strong> ${new Date().toLocaleDateString('pt-PT')}</p>
                    </div>
                    <p style="margin-top: 30px; font-size: 12px; color: #666;">
                        Sistema Check Point - Para uso interno
                    </p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    importBackup() {
        const fileInput = document.getElementById('backupFile');
        const file = fileInput.files[0];
        
        if (!file) {
            alert('Selecione um arquivo!');
            return;
        }
        
        if (!file.name.match(/\.(xlsx|xls)$/i)) {
            alert('Por favor, selecione um arquivo Excel (.xlsx ou .xls)');
            return;
        }
        
        if (typeof XLSX === 'undefined') {
            alert('Biblioteca Excel não carregada!');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                const workersSheet = workbook.Sheets['Trabalhadores'];
                
                if (!workersSheet) {
                    throw new Error('Arquivo Excel não contém a aba "Trabalhadores"');
                }
                
                const workers = XLSX.utils.sheet_to_json(workersSheet);
                const registriesSheet = workbook.Sheets['Registos'];
                const reportsSheet = workbook.Sheets['Relatórios'];
                const schedulesSheet = workbook.Sheets['Horários'];
                const adminRegistriesSheet = workbook.Sheets['RegistosAdmin'];
                const templatesSheet = workbook.Sheets['TemplatesHorarios'];
                const assignmentsSheet = workbook.Sheets['AtribuicoesHorarios'];
                const weekAssignmentsSheet = workbook.Sheets['AtribuicoesSemanas'];
                
                const registries = registriesSheet ? XLSX.utils.sheet_to_json(registriesSheet) : [];
                const reports = reportsSheet ? XLSX.utils.sheet_to_json(reportsSheet) : [];
                const schedules = schedulesSheet ? XLSX.utils.sheet_to_json(schedulesSheet) : [];
                const adminRegistries = adminRegistriesSheet ? XLSX.utils.sheet_to_json(adminRegistriesSheet) : [];
                const scheduleTemplates = templatesSheet ? XLSX.utils.sheet_to_json(templatesSheet) : [];
                const scheduleAssignments = {};
                const weekScheduleAssignments = {};
                
                if (assignmentsSheet) {
                    const assignmentsData = XLSX.utils.sheet_to_json(assignmentsSheet);
                    assignmentsData.forEach(assignment => {
                        if (!scheduleAssignments[assignment.workerId]) {
                            scheduleAssignments[assignment.workerId] = [];
                        }
                        scheduleAssignments[assignment.workerId].push({
                            templateId: assignment.templateId,
                            weeks: assignment.weeks ? assignment.weeks.split(',').map(w => parseInt(w)) : [],
                            assignedAt: assignment.assignedAt
                        });
                    });
                }
                
                if (weekAssignmentsSheet) {
                    const weekAssignmentsData = XLSX.utils.sheet_to_json(weekAssignmentsSheet);
                    weekAssignmentsData.forEach(assignment => {
                        if (!weekScheduleAssignments[assignment.workerId]) {
                            weekScheduleAssignments[assignment.workerId] = {};
                        }
                        if (!weekScheduleAssignments[assignment.workerId][assignment.year]) {
                            weekScheduleAssignments[assignment.workerId][assignment.year] = {};
                        }
                        weekScheduleAssignments[assignment.workerId][assignment.year][assignment.week] = assignment.templateId;
                    });
                }
                
                const currentBackup = {
                    workers: window.PontoApp.workers,
                    schedules: window.PontoApp.schedules,
                    registries: window.PontoApp.registries,
                    reports: window.PontoApp.reports,
                    hoursBank: window.PontoApp.hoursBank,
                    roles: window.PontoApp.roles,
                    adminRegistries: window.PontoApp.adminRegistries || [],
                    scheduleTemplates: window.PontoApp.scheduleTemplates || [],
                    scheduleAssignments: window.PontoApp.scheduleAssignments || {},
                    weekScheduleAssignments: window.PontoApp.weekScheduleAssignments || {},
                    exportedAt: new Date().toISOString(),
                    version: '1.3'
                };
                
                localStorage.setItem('ponto_pre_import_backup', JSON.stringify(currentBackup));
                
                window.PontoApp.workers = workers;
                window.PontoApp.registries = registries;
                window.PontoApp.reports = reports;
                window.PontoApp.adminRegistries = adminRegistries;
                window.PontoApp.scheduleTemplates = scheduleTemplates;
                window.PontoApp.scheduleAssignments = scheduleAssignments;
                window.PontoApp.weekScheduleAssignments = weekScheduleAssignments;
                
                const schedulesObj = {};
                schedules.forEach(schedule => {
                    if (schedule.workerId) {
                        if (!schedulesObj[schedule.workerId]) {
                            schedulesObj[schedule.workerId] = { reference: [] };
                        }
                        schedulesObj[schedule.workerId].reference.push({
                            day: schedule.day,
                            start: schedule.start,
                            end: schedule.end,
                            break: schedule.break || ''
                        });
                    }
                });
                window.PontoApp.schedules = schedulesObj;
                
                window.PontoApp.saveAllData();
                localStorage.setItem('ponto_last_backup', new Date().toISOString());
                
                const modal = document.querySelector('.modal.active');
                if (modal) {
                    this.closeModal(modal);
                }
                
                window.PontoApp.showNotification('Backup importado com sucesso!', 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
                
            } catch (error) {
                alert('Erro ao importar backup: ' + error.message);
            }
        };
        
        reader.onerror = () => alert('Erro ao ler arquivo');
        reader.readAsArrayBuffer(file);
    }

    closeModal(modal) {
        console.log('Fechando modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.remove();
                }
            }, 300);
        }
    }
}

// Inicialização - APENAS UMA VEZ
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado - Iniciando AdminInterface');
    
    // Verificar se já existe uma instância
    if (window.adminInterface) {
        console.log('AdminInterface já existe, ignorando...');
        return;
    }
    
    try {
        window.adminInterface = new AdminInterface();
        console.log('AdminInterface criada com sucesso');
    } catch (error) {
        console.error('Erro ao criar AdminInterface:', error);
    }
});