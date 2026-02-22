// app.js - VERSÃO COM ATUALIZAÇÃO AUTOMÁTICA EM TEMPO REAL
class PontoApp {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.qrScanner = null;
        this.workers = [];
        this.schedules = {};
        this.registries = [];
        this.reports = [];
        this.hoursBank = {};
        this.roles = [];
        this.adminRegistries = [];
        this.scheduleTemplates = [];
        this.scheduleAssignments = {};
        this.weekScheduleAssignments = {};
        
        // Controlo de dias já processados
        this.processedDays = JSON.parse(localStorage.getItem('ponto_processed_days') || '{}');
        
        this.init();
        
        // Iniciar verificação automática
        this.startAutoBankUpdate();
    }

    init() {
        console.log('🔧 PontoApp iniciando...');
        this.loadData();
        this.setupEventListeners();
        this.checkAuth();
        
        // Validar consistência do banco de horas ao iniciar
        this.validateHoursBankConsistency();
        
        // VERIFICAÇÃO CRÍTICA: Se os relatórios estiverem vazios ou com zeros, recriar dados
        this.ensureDataIsValid();
    }

    // NOVO: Iniciar verificação automática do banco de horas
    startAutoBankUpdate() {
        console.log('⏰ Iniciando verificação automática do banco de horas...');
        
        // Verificar imediatamente
        this.checkAndUpdateBankBalances();
        
        // Verificar a cada minuto
        setInterval(() => {
            this.checkAndUpdateBankBalances();
        }, 60000); // 60 segundos
        
        // Verificar também quando a janela ganhar foco
        window.addEventListener('focus', () => {
            console.log('🪟 Janela reativada - verificando banco de horas');
            this.checkAndUpdateBankBalances();
        });
    }

    // NOVO: Verificar e atualizar saldos do banco de horas
    checkAndUpdateBankBalances() {
        const hoje = new Date().toISOString().split('T')[0];
        const horaAtual = new Date().getHours();
        const minutoAtual = new Date().getMinutes();
        
        // Considerar que o dia "terminou" após as 23:59
        const diaTerminou = horaAtual >= 23 && minutoAtual >= 59;
        
        console.log(`🔍 Verificando banco de horas - Data: ${hoje}, Hora: ${horaAtual}:${minutoAtual}, Dia terminou: ${diaTerminou}`);
        
        // Processar cada trabalhador ativo
        this.workers.filter(w => w.active).forEach(worker => {
            this.processWorkerDay(worker.id, hoje, diaTerminou);
        });
        
        // Se o dia terminou, marcar como processado para não repetir
        if (diaTerminou && !this.processedDays[hoje]) {
            this.processedDays[hoje] = true;
            localStorage.setItem('ponto_processed_days', JSON.stringify(this.processedDays));
            console.log(`✅ Dia ${hoje} marcado como processado`);
        }
    }

    // NOVO: Processar um dia específico para um trabalhador
    processWorkerDay(workerId, data, forcarAtualizacao = false) {
        const worker = this.workers.find(w => w.id === workerId);
        if (!worker) return;
        
        const schedule = this.schedules[workerId]?.reference || [];
        const diaSemana = new Date(data).getDay();
        
        // Ignorar fins de semana
        if (diaSemana === 0 || diaSemana === 6) return;
        
        // Verificar se tem horário para este dia
        const daySchedule = schedule.find(s => s.day === diaSemana);
        if (!daySchedule) return;
        
        const horasPrevistas = this.calculateReferenceHours(daySchedule);
        
        // Verificar registos do dia
        const registrosHoje = this.registries.filter(r => 
            r.workerId === workerId && r.date === data
        );
        
        // Verificar registos administrativos
        const adminHoje = (this.adminRegistries || []).filter(r => 
            r.workerId === workerId && r.date === data
        );
        
        // Se tem registo administrativo, não processar automático
        if (adminHoje.length > 0) {
            console.log(`   👤 Worker ${workerId}: Tem registo administrativo em ${data} - ignorando automático`);
            return;
        }
        
        // Calcular horas trabalhadas
        const horasTrabalhadas = this.calculateWorkedHours(registrosHoje);
        const diferenca = horasPrevistas - horasTrabalhadas;
        
        // Verificar se já processámos este dia para este trabalhador
        const chave = `${workerId}_${data}`;
        const ultimoProcessamento = localStorage.getItem(`ponto_processed_${chave}`);
        
        // Só processar se:
        // 1. A diferença for significativa (>0.1h = 6 minutos)
        // 2. E (o dia terminou OU já passou da hora de fim do expediente)
        const horaFimExpediente = this.getHoraFimExpediente(daySchedule);
        const passouHoraFim = this.passouDoHorario(horaFimExpediente);
        
        if (Math.abs(diferenca) > 0.1 && (forcarAtualizacao || passouHoraFim || this.isEndOfDay())) {
            
            // Verificar se já processámos esta diferença
            if (ultimoProcessamento) {
                const diferencaProcessada = parseFloat(ultimoProcessamento);
                if (Math.abs(diferenca - diferencaProcessada) < 0.1) {
                    // Já processámos esta diferença
                    return;
                }
            }
            
            console.log(`   ⚠️ Worker ${workerId} - Dia ${data}: Diferença de ${diferenca.toFixed(2)}h (previsto: ${horasPrevistas}h, trabalhado: ${horasTrabalhadas}h)`);
            
            if (diferenca > 0) {
                // Faltou tempo
                this.updateHoursBank(
                    workerId,
                    diferenca,
                    'subtract',
                    `Atualização automática - Dia ${data}: trabalhou ${horasTrabalhadas.toFixed(1)}h (previsto ${horasPrevistas}h)`
                );
            } else if (diferenca < 0) {
                // Fez horas extras
                const extra = Math.abs(diferenca);
                this.updateHoursBank(
                    workerId,
                    extra,
                    'add',
                    `Atualização automática - Hora extra dia ${data}: trabalhou ${horasTrabalhadas.toFixed(1)}h (previsto ${horasPrevistas}h)`
                );
            }
            
            // Guardar que processámos esta diferença
            localStorage.setItem(`ponto_processed_${chave}`, diferenca.toFixed(2));
        }
    }

    // NOVO: Obter hora de fim do expediente
    getHoraFimExpediente(daySchedule) {
        if (!daySchedule || !daySchedule.end) return '18:00';
        return daySchedule.end;
    }

    // NOVO: Verificar se já passou do horário de fim
    passouDoHorario(horaFim) {
        const agora = new Date();
        const [hora, minuto] = horaFim.split(':').map(Number);
        
        const horaAtual = agora.getHours();
        const minutoAtual = agora.getMinutes();
        
        return horaAtual > hora || (horaAtual === hora && minutoAtual >= minuto);
    }

    // NOVO: Verificar se é fim do dia
    isEndOfDay() {
        const agora = new Date();
        const hora = agora.getHours();
        const minuto = agora.getMinutes();
        
        // Considerar fim do dia após as 23:59
        return hora >= 23 && minuto >= 59;
    }

ensureDataIsValid() {
    console.log('🔍 Verificando se os dados são válidos...');
    
    // Verificar se há relatórios com valores não-zero
    const hasValidReports = this.reports && this.reports.length > 0;
    
    // Verificar se há registos administrativos
    const hasAdminRegistries = this.adminRegistries && this.adminRegistries.length > 0;
    
    // Verificar se há registos de ponto
    const hasRegistries = this.registries && this.registries.length > 0;
    
    // Verificar se há horários configurados
    const hasSchedules = Object.keys(this.schedules).length > 0;
    
    console.log('📊 Estado dos dados:', {
        workers: this.workers.length,
        registries: this.registries.length,
        reports: this.reports.length,
        adminRegistries: this.adminRegistries?.length || 0,
        schedules: Object.keys(this.schedules).length,
        hasValidReports,
        hasAdminRegistries,
        hasRegistries,
        hasSchedules
    });
    
    // Se NÃO HOUVER trabalhadores, aí sim precisamos de dados iniciais
    if (this.workers.length === 0) {
        console.log('⚠️ Nenhum trabalhador encontrado. A criar dados de exemplo...');
        this.initializeSampleData();
        return;
    }
    
    // Se faltam relatórios, gerar apenas os relatórios em falta, NÃO apagar dados
    if (!hasValidReports || !hasAdminRegistries || !hasRegistries || !hasSchedules) {
        console.log('⚠️ Alguns dados estão incompletos. A gerar dados em falta...');
        
        // Gerar relatórios em branco para trabalhadores que não têm
        this.generateMissingReports();
        
        // Garantir que arrays existem
        if (!this.adminRegistries) this.adminRegistries = [];
        if (!this.reports) this.reports = [];
        
        console.log('✅ Dados em falta gerados com sucesso!');
    } else {
        console.log('✅ Dados válidos encontrados!');
    }
}

generateMissingReports() {
    console.log('📊 A gerar relatórios em falta para trabalhadores...');
    
    // Garantir que os arrays existem
    if (!this.reports) this.reports = [];
    if (!this.adminRegistries) this.adminRegistries = [];
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    // Para cada trabalhador ativo, verificar se tem relatório do mês atual
    this.workers.forEach(worker => {
        if (!worker.active) return;
        
        // Verificar se já existe relatório para este mês/ano
        const hasReport = this.reports.some(r => 
            r.workerId === worker.id && 
            r.year === currentYear && 
            r.month === currentMonth
        );
        
        if (!hasReport) {
            console.log(`   A criar relatório em branco para ${worker.name} (${currentMonth}/${currentYear})`);
            
            // Criar relatório com zeros
            const blankReport = {
                id: Date.now() + worker.id,
                workerId: worker.id,
                year: currentYear,
                month: currentMonth,
                totalReference: 0,
                totalWorked: 0,
                justifiedAbsence: 0,
                unjustifiedAbsence: 0,
                vacation: 0,
                training: 0,
                horasExtras: 0,
                horasFaltadas: 0,
                hoursBank: 0,
                bankValue: 0,
                deductionValue: 0,
                generatedAt: new Date().toISOString()
            };
            
            this.reports.push(blankReport);
        }
    });
    
    // Garantir que schedules existe para todos os trabalhadores
    this.workers.forEach(worker => {
        if (!this.schedules[worker.id]) {
            console.log(`   A criar horário padrão para ${worker.name}`);
            
            // Criar horário padrão (9h-17h com pausa)
            this.schedules[worker.id] = {
                reference: [
                    { day: 1, start: '09:00', end: '17:00', break: '13:00-14:00' },
                    { day: 2, start: '09:00', end: '17:00', break: '13:00-14:00' },
                    { day: 3, start: '09:00', end: '17:00', break: '13:00-14:00' },
                    { day: 4, start: '09:00', end: '17:00', break: '13:00-14:00' },
                    { day: 5, start: '09:00', end: '17:00', break: '13:00-14:00' }
                ]
            };
        }
    });
    
    this.saveAllData();
    console.log('✅ Relatórios em falta gerados com sucesso');
}

    loadData() {
        console.log('📂 Carregando dados do localStorage...');
        
        try {
            const workersData = localStorage.getItem('ponto_workers');
            const schedulesData = localStorage.getItem('ponto_schedules');
            const registriesData = localStorage.getItem('ponto_registries');
            const reportsData = localStorage.getItem('ponto_reports');
            const hoursBankData = localStorage.getItem('ponto_hours_bank');
            const rolesData = localStorage.getItem('ponto_roles');
            const adminRegistriesData = localStorage.getItem('ponto_admin_registries');
            const scheduleTemplatesData = localStorage.getItem('ponto_schedule_templates');
            const scheduleAssignmentsData = localStorage.getItem('ponto_schedule_assignments');
            const weekScheduleAssignmentsData = localStorage.getItem('ponto_week_schedule_assignments');

            if (!workersData) {
                console.log('🆕 Nenhum dado encontrado. Criando dados iniciais...');
                this.initializeSampleData();
            } else {
                console.log('✅ Dados existentes encontrados');
                
                this.workers = workersData ? JSON.parse(workersData) : [];
                this.schedules = schedulesData ? JSON.parse(schedulesData) : {};
                this.registries = registriesData ? JSON.parse(registriesData) : [];
                this.reports = reportsData ? JSON.parse(reportsData) : [];
                this.hoursBank = hoursBankData ? JSON.parse(hoursBankData) : {};
                this.roles = rolesData ? JSON.parse(rolesData) : [];
                this.adminRegistries = adminRegistriesData ? JSON.parse(adminRegistriesData) : [];
                this.scheduleTemplates = scheduleTemplatesData ? JSON.parse(scheduleTemplatesData) : [];
                this.scheduleAssignments = scheduleAssignmentsData ? JSON.parse(scheduleAssignmentsData) : {};
                this.weekScheduleAssignments = weekScheduleAssignmentsData ? JSON.parse(weekScheduleAssignmentsData) : {};
            }
            
            console.log(`✅ Carregados: ${this.workers.length} trabalhadores, ${this.registries.length} registros`);
            console.log(`💰 Banco de Horas: ${Object.keys(this.hoursBank).length} trabalhadores com saldo`);
            console.log(`📋 Registos Admin: ${this.adminRegistries.length} registos`);
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            console.log('🔄 Criando novos dados devido ao erro...');
            this.initializeSampleData();
        }
    }

    // Validar consistência do banco de horas
    validateHoursBankConsistency() {
        console.log('🔍 Validando consistência do banco de horas...');
        
        Object.keys(this.hoursBank).forEach(workerId => {
            const bank = this.hoursBank[workerId];
            const worker = this.workers.find(w => w.id === parseInt(workerId));
            
            if (bank && bank.history && Array.isArray(bank.history)) {
                // Calcular saldo a partir do histórico
                let calculatedHours = 0;
                bank.history.forEach(mov => {
                    calculatedHours += mov.hours || 0;
                });
                
                // Se houver discrepância (>0.01 para evitar erros de arredondamento)
                if (Math.abs(calculatedHours - bank.hours) > 0.01) {
                    console.warn(`⚠️ Discrepância detectada no banco de horas do worker ${workerId}. Corrigindo...`);
                    console.warn(`   Saldo armazenado: ${bank.hours.toFixed(2)}h, Calculado: ${calculatedHours.toFixed(2)}h`);
                    
                    // Corrigir saldo
                    bank.hours = calculatedHours;
                    
                    // Recalcular valor se worker existir
                    if (worker) {
                        bank.value = calculatedHours * worker.hourlyRate;
                    }
                    
                    this.saveAllData();
                }
            }
        });
        
        console.log('✅ Validação do banco de horas concluída');
    }

    initializeSampleData() {
        console.log('🎯 Inicializando dados de exemplo...');
        
        this.roles = [
            { id: 1, name: 'Auxiliar de Educação', baseHours: 40 },
            { id: 2, name: 'Educadora de Infância', baseHours: 40 },
            { id: 3, name: 'Administrativa', baseHours: 40 },
            { id: 4, name: 'Limpeza', baseHours: 40 },
            { id: 5, name: 'Direção', baseHours: 40 }
        ];

        this.workers = [
            {
                id: 1,
                name: 'Administrador',
                role: 'Administrativa',
                roleId: 3,
                hourlyRate: 25,
                pin: '1234',
                weeklyHours: 40,
                isAdmin: true,
                active: true
            },
            {
                id: 2,
                name: 'Maria Silva',
                role: 'Educadora de Infância',
                roleId: 2,
                hourlyRate: 15,
                pin: '0001',
                weeklyHours: 40,
                isAdmin: false,
                active: true
            },
            {
                id: 3,
                name: 'João Santos',
                role: 'Auxiliar de Educação',
                roleId: 1,
                hourlyRate: 12,
                pin: '0002',
                weeklyHours: 40,
                isAdmin: false,
                active: true
            },
            {
                id: 4,
                name: 'Sandra Fernandes',
                role: 'Auxiliar de Educação',
                roleId: 1,
                hourlyRate: 12,
                pin: '0003',
                weeklyHours: 40,
                isAdmin: false,
                active: true
            },
            {
                id: 5,
                name: 'Carolina Batista',
                role: 'Educadora de Infância',
                roleId: 2,
                hourlyRate: 15,
                pin: '0004',
                weeklyHours: 40,
                isAdmin: false,
                active: true
            },
            {
                id: 6,
                name: 'Alexandre Almeida',
                role: 'Auxiliar de Educação',
                roleId: 1,
                hourlyRate: 12,
                pin: '0005',
                weeklyHours: 40,
                isAdmin: false,
                active: true
            },
            {
                id: 7,
                name: 'ADMIN EMERGÊNCIA',
                role: 'Direção',
                roleId: 5,
                hourlyRate: 20,
                pin: '9999',
                weeklyHours: 40,
                isAdmin: true,
                active: true
            }
        ];

        this.schedules = {
            2: {
                reference: [
                    { day: 1, start: '09:00', end: '17:00', break: '13:00-14:00' },
                    { day: 2, start: '09:00', end: '17:00', break: '13:00-14:00' },
                    { day: 3, start: '09:00', end: '17:00', break: '13:00-14:00' },
                    { day: 4, start: '09:00', end: '17:00', break: '13:00-14:00' },
                    { day: 5, start: '09:00', end: '17:00', break: '13:00-14:00' }
                ]
            },
            3: {
                reference: [
                    { day: 1, start: '08:00', end: '16:00', break: '12:00-13:00' },
                    { day: 2, start: '08:00', end: '16:00', break: '12:00-13:00' },
                    { day: 3, start: '08:00', end: '16:00', break: '12:00-13:00' },
                    { day: 4, start: '08:00', end: '16:00', break: '12:00-13:00' },
                    { day: 5, start: '08:00', end: '16:00', break: '12:00-13:00' }
                ]
            },
            4: {
                reference: [
                    { day: 1, start: '09:00', end: '17:00', break: '13:00-14:00' },
                    { day: 2, start: '09:00', end: '17:00', break: '13:00-14:00' },
                    { day: 3, start: '09:00', end: '17:00', break: '13:00-14:00' },
                    { day: 4, start: '09:00', end: '17:00', break: '13:00-14:00' },
                    { day: 5, start: '09:00', end: '17:00', break: '13:00-14:00' }
                ]
            },
            5: {
                reference: [
                    { day: 1, start: '09:00', end: '17:00', break: '13:00-14:00' },
                    { day: 2, start: '09:00', end: '17:00', break: '13:00-14:00' },
                    { day: 3, start: '09:00', end: '17:00', break: '13:00-14:00' },
                    { day: 4, start: '09:00', end: '17:00', break: '13:00-14:00' },
                    { day: 5, start: '09:00', end: '17:00', break: '13:00-14:00' }
                ]
            },
            6: {
                reference: [
                    { day: 1, start: '09:00', end: '17:00', break: '13:00-14:00' },
                    { day: 2, start: '09:00', end: '17:00', break: '13:00-14:00' },
                    { day: 3, start: '09:00', end: '17:00', break: '13:00-14:00' },
                    { day: 4, start: '09:00', end: '17:00', break: '13:00-14:00' },
                    { day: 5, start: '09:00', end: '17:00', break: '13:00-14:00' }
                ]
            }
        };

        this.scheduleTemplates = [
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
            }
        ];

        this.scheduleAssignments = {};
        this.weekScheduleAssignments = {};
        
        // Dados de exemplo para registos administrativos
        this.adminRegistries = [
            {
                id: 1001,
                workerId: 4,
                type: 'justified',
                date: '2026-03-10',
                hours: 8,
                notes: 'Consulta médica',
                createdAt: '2026-03-10T10:00:00.000Z'
            },
            {
                id: 1002,
                workerId: 4,
                type: 'justified',
                date: '2026-03-15',
                hours: 4,
                notes: 'Acompanhamento familiar',
                createdAt: '2026-03-15T09:00:00.000Z'
            },
            {
                id: 1003,
                workerId: 5,
                type: 'vacation',
                date: '2026-02-05',
                hours: 8,
                notes: 'Férias',
                createdAt: '2026-02-01T00:00:00.000Z'
            },
            {
                id: 1004,
                workerId: 5,
                type: 'vacation',
                date: '2026-02-06',
                hours: 8,
                notes: 'Férias',
                createdAt: '2026-02-01T00:00:00.000Z'
            },
            {
                id: 1005,
                workerId: 6,
                type: 'training',
                date: '2026-02-12',
                hours: 6,
                notes: 'Formação em primeiros socorros',
                createdAt: '2026-02-10T00:00:00.000Z'
            },
            {
                id: 1006,
                workerId: 7,
                type: 'unjustified',
                date: '2026-02-18',
                hours: 8,
                notes: 'Falta sem justificação',
                createdAt: '2026-02-18T00:00:00.000Z'
            },
            {
                id: 1007,
                workerId: 5,
                type: 'training',
                date: '2026-01-20',
                hours: 4,
                notes: 'Workshop de desenvolvimento',
                createdAt: '2026-01-15T00:00:00.000Z'
            }
        ];
        
        // Dados de exemplo para o banco de horas
        this.hoursBank = {
            2: {
                hours: -1.0,
                value: -15.00,
                history: [
                    {
                        date: '2024-01-15',
                        type: 'extra',
                        hours: 2.0,
                        value: 30.00,
                        description: 'Horas extras - Projeto urgente'
                    },
                    {
                        date: '2024-01-12',
                        type: 'deduction',
                        hours: -4.0,
                        value: -60.00,
                        description: 'Falta Justificada - Consulta médica'
                    },
                    {
                        date: '2024-01-08',
                        type: 'extra',
                        hours: 3.0,
                        value: 45.00,
                        description: 'Horas extras - Reunião noturna'
                    },
                    {
                        date: '2024-01-05',
                        type: 'deduction',
                        hours: -2.0,
                        value: -30.00,
                        description: 'Falta Injustificada - Atraso'
                    }
                ]
            },
            4: {
                hours: -16.00,
                value: -192.00,
                history: [
                    {
                        date: '2026-03-10',
                        type: 'deduction',
                        hours: -8.0,
                        value: -96.00,
                        description: 'Falta Justificada - Consulta médica'
                    },
                    {
                        date: '2026-03-15',
                        type: 'deduction',
                        hours: -4.0,
                        value: -48.00,
                        description: 'Falta Justificada - Acompanhamento familiar'
                    },
                    {
                        date: '2026-02-01',
                        type: 'deduction',
                        hours: -4.0,
                        value: -48.00,
                        description: 'Falta Justificada - Assistência à família'
                    }
                ]
            },
            6: {
                hours: -8.00,
                value: -96.00,
                history: [
                    {
                        date: '2026-02-12',
                        type: 'deduction',
                        hours: -8.0,
                        value: -96.00,
                        description: 'Formação - Horas contabilizadas como trabalho'
                    }
                ]
            }
        };
        
        // Registos de ponto para horas trabalhadas
        this.registries = [
            { id: 2001, workerId: 4, date: '2026-03-02', time: '09:00', type: 'in', timestamp: 1740906000000 },
            { id: 2002, workerId: 4, date: '2026-03-02', time: '13:00', type: 'break_start', timestamp: 1740920400000 },
            { id: 2003, workerId: 4, date: '2026-03-02', time: '14:00', type: 'break_end', timestamp: 1740924000000 },
            { id: 2004, workerId: 4, date: '2026-03-02', time: '17:00', type: 'out', timestamp: 1740934800000 },
            { id: 2005, workerId: 4, date: '2026-03-03', time: '08:55', type: 'in', timestamp: 1740992100000 },
            { id: 2006, workerId: 4, date: '2026-03-03', time: '13:00', type: 'break_start', timestamp: 1741006800000 },
            { id: 2007, workerId: 4, date: '2026-03-03', time: '14:00', type: 'break_end', timestamp: 1741010400000 },
            { id: 2008, workerId: 4, date: '2026-03-03', time: '17:05', type: 'out', timestamp: 1741021500000 },
            { id: 2009, workerId: 5, date: '2026-02-02', time: '09:00', type: 'in', timestamp: 1738573200000 },
            { id: 2010, workerId: 5, date: '2026-02-02', time: '13:00', type: 'break_start', timestamp: 1738587600000 },
            { id: 2011, workerId: 5, date: '2026-02-02', time: '14:00', type: 'break_end', timestamp: 1738591200000 },
            { id: 2012, workerId: 5, date: '2026-02-02', time: '17:00', type: 'out', timestamp: 1738602000000 },
            { id: 2013, workerId: 5, date: '2026-02-03', time: '09:05', type: 'in', timestamp: 1738659900000 },
            { id: 2014, workerId: 5, date: '2026-02-03', time: '13:00', type: 'break_start', timestamp: 1738674000000 },
            { id: 2015, workerId: 5, date: '2026-02-03', time: '14:00', type: 'break_end', timestamp: 1738677600000 },
            { id: 2016, workerId: 5, date: '2026-02-03', time: '17:00', type: 'out', timestamp: 1738688400000 },
            { id: 2017, workerId: 6, date: '2026-02-02', time: '09:00', type: 'in', timestamp: 1738573200000 },
            { id: 2018, workerId: 6, date: '2026-02-02', time: '13:00', type: 'break_start', timestamp: 1738587600000 },
            { id: 2019, workerId: 6, date: '2026-02-02', time: '14:00', type: 'break_end', timestamp: 1738591200000 },
            { id: 2020, workerId: 6, date: '2026-02-02', time: '17:00', type: 'out', timestamp: 1738602000000 },
            { id: 2021, workerId: 7, date: '2026-02-02', time: '09:00', type: 'in', timestamp: 1738573200000 },
            { id: 2022, workerId: 7, date: '2026-02-02', time: '13:00', type: 'break_start', timestamp: 1738587600000 },
            { id: 2023, workerId: 7, date: '2026-02-02', time: '14:00', type: 'break_end', timestamp: 1738591200000 },
            { id: 2024, workerId: 7, date: '2026-02-02', time: '17:00', type: 'out', timestamp: 1738602000000 },
            { id: 2025, workerId: 5, date: '2026-01-05', time: '09:00', type: 'in', timestamp: 1736067600000 },
            { id: 2026, workerId: 5, date: '2026-01-05', time: '13:00', type: 'break_start', timestamp: 1736082000000 },
            { id: 2027, workerId: 5, date: '2026-01-05', time: '14:00', type: 'break_end', timestamp: 1736085600000 },
            { id: 2028, workerId: 5, date: '2026-01-05', time: '17:00', type: 'out', timestamp: 1736096400000 }
        ];
        
        // Relatórios gerados
        this.reports = [];
        
        // Gerar relatórios para os dados existentes (usando setTimeout para não bloquear)
setTimeout(() => {
    console.log('📊 A gerar relatórios iniciais...');
    
    // Usar a nova função para gerar relatórios em falta
    if (typeof this.generateMissingReports === 'function') {
        this.generateMissingReports();
    } else {
        // Fallback para o código antigo
        this.generateMonthlyReport(4, 2026, 3, false);
        this.generateMonthlyReport(5, 2026, 2, false);
        this.generateMonthlyReport(6, 2026, 2, false);
        this.generateMonthlyReport(7, 2026, 2, false);
        this.generateMonthlyReport(5, 2026, 1, false);
    }
}, 500);

this.saveAllData();
console.log('✅ Dados iniciais criados com sucesso!');
    }

    saveAllData() {
        try {
            localStorage.setItem('ponto_workers', JSON.stringify(this.workers));
            localStorage.setItem('ponto_schedules', JSON.stringify(this.schedules));
            localStorage.setItem('ponto_registries', JSON.stringify(this.registries));
            localStorage.setItem('ponto_reports', JSON.stringify(this.reports));
            localStorage.setItem('ponto_hours_bank', JSON.stringify(this.hoursBank));
            localStorage.setItem('ponto_roles', JSON.stringify(this.roles));
            localStorage.setItem('ponto_admin_registries', JSON.stringify(this.adminRegistries || []));
            localStorage.setItem('ponto_schedule_templates', JSON.stringify(this.scheduleTemplates || []));
            localStorage.setItem('ponto_schedule_assignments', JSON.stringify(this.scheduleAssignments || {}));
            localStorage.setItem('ponto_week_schedule_assignments', JSON.stringify(this.weekScheduleAssignments || {}));
            
            console.log('💾 Dados salvos com sucesso');
        } catch (error) {
            console.error('❌ Erro ao salvar dados:', error);
        }
    }

    updateHoursBank(workerId, hours, action = 'add', description = '') {
        if (!this.hoursBank[workerId]) {
            this.hoursBank[workerId] = { 
                hours: 0, 
                value: 0, 
                history: [] 
            };
        }
        
        const worker = this.workers.find(w => w.id === workerId);
        const hourlyRate = worker ? worker.hourlyRate : 0;
        
        // Calcular novo saldo
        let newHours = this.hoursBank[workerId].hours;
        let newValue = this.hoursBank[workerId].value;
        
        if (action === 'add') {
            newHours += hours;
            newValue += hours * hourlyRate;
            
            this.hoursBank[workerId].history.push({
                date: new Date().toISOString().split('T')[0],
                type: 'extra',
                hours: hours,
                value: hours * hourlyRate,
                description: description || 'Horas extras trabalhadas ou compensação'
            });
        } else if (action === 'subtract') {
            newHours -= hours;
            newValue -= hours * hourlyRate;
            
            this.hoursBank[workerId].history.push({
                date: new Date().toISOString().split('T')[0],
                type: 'deduction',
                hours: -hours,
                value: -hours * hourlyRate,
                description: description || 'Dedução por ausência ou horas faltadas'
            });
        }
        
        // Garantir que o saldo é consistente com o histórico
        let calculatedHours = 0;
        this.hoursBank[workerId].history.forEach(mov => {
            calculatedHours += mov.hours;
        });
        
        // Se houver discrepância, corrigir
        if (Math.abs(calculatedHours - newHours) > 0.01) {
            console.warn('⚠️ Discrepância no banco de horas. Corrigindo...');
            newHours = calculatedHours;
            newValue = calculatedHours * hourlyRate;
        }
        
        this.hoursBank[workerId].hours = newHours;
        this.hoursBank[workerId].value = newValue;
        
        this.saveAllData();
        
        console.log(`💰 Banco de horas atualizado: ${workerId} -> ${newHours.toFixed(2)}h (${action} ${hours}h)`);
        return newHours;
    }

    getBankBalance(workerId) {
        const bank = this.hoursBank[workerId] || { hours: 0, value: 0, history: [] };
        const worker = this.workers.find(w => w.id === workerId);
        
        // Recalcular saldo a partir do histórico para garantir consistência
        let calculatedHours = 0;
        if (bank.history && Array.isArray(bank.history)) {
            bank.history.forEach(mov => {
                calculatedHours += mov.hours || 0;
            });
        }
        
        // Se o saldo armazenado não corresponder ao histórico, corrigir
        if (Math.abs(calculatedHours - bank.hours) > 0.01) {
            console.warn(`⚠️ Corrigindo saldo do banco para worker ${workerId}`);
            bank.hours = calculatedHours;
            
            if (worker) {
                bank.value = calculatedHours * worker.hourlyRate;
            }
            
            this.saveAllData();
        }
        
        return bank;
    }

    setupEventListeners() {
    console.log('🔗 Configurando event listeners...');
    
    setTimeout(() => {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            console.log('✅ Formulário de login encontrado');
            
            // CORREÇÃO 1: Passar o evento 'e' para handleLogin()
            loginForm.addEventListener('submit', (e) => {
                console.log('📝 Formulário submetido');
                // Não fazer preventDefault aqui - deixa o handleLogin() tratar
                this.handleLogin(e);  // ← CORRIGIDO: passa o evento
            });
            
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                // CORREÇÃO 2: Também para o clique no botão
                submitBtn.addEventListener('click', (e) => {
                    e.preventDefault(); // Prevenir comportamento padrão do botão
                    // Criar e disparar evento de submit no formulário
                    const submitEvent = new Event('submit', { 
                        bubbles: true, 
                        cancelable: true 
                    });
                    loginForm.dispatchEvent(submitEvent);
                });
            }
        } else {
            console.warn('⚠️ Formulário de login não encontrado na página atual');
        }

        const scanQRBtn = document.getElementById('scanQR');
        if (scanQRBtn) {
            scanQRBtn.addEventListener('click', () => this.toggleQRScanner());
        }
    }, 100);
}

    async handleLogin(e) {
    console.log('🔐 Processando login...');
    
    // ===== PARTE 1: PREVENIR COMPORTAMENTO PADRÃO =====
    if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // ===== PARTE 2: OBTER ELEMENTOS DO FORMULÁRIO =====
    const pinInput = document.getElementById('userPin');
    const userTypeSelect = document.getElementById('userType');
    
    if (!pinInput || !userTypeSelect) {
        console.error('❌ Elementos do formulário não encontrados');
        if (this.showNotification) {
            this.showNotification('Erro no formulário de login!', 'error');
        }
        return false;
    }
    
    // ===== PARTE 3: VALIDAR PIN =====
    const pin = pinInput.value.trim();
    const userType = userTypeSelect.value;
    
    console.log(`🔑 PIN: ${pin}, Tipo: ${userType}`);
    
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        this.showNotification('PIN inválido! Deve ter exatamente 4 dígitos.', 'error');
        return false;
    }
    
    // ===== PARTE 4: GARANTIR QUE OS DADOS EXISTEM (CORREÇÃO 5) =====
    console.log('📊 Verificando dados dos trabalhadores...');
    
    // Verificar se workers existe e tem conteúdo
    if (!this.workers || this.workers.length === 0) {
        console.log('⚠️ workers não encontrado ou vazio. Tentando recuperar...');
        
        // TENTATIVA 1: Carregar do localStorage
        console.log('📂 Tentativa 1: Carregar do localStorage');
        this.loadData();
        
        // Verificar se após loadData os workers foram carregados
        if (!this.workers || this.workers.length === 0) {
            console.log('⚠️ Tentativa 1 falhou. workers ainda vazio.');
            
            // TENTATIVA 2: Verificar se há dados noutra localStorage key
            console.log('📂 Tentativa 2: Verificar backup de emergência');
            const backupData = localStorage.getItem('ponto_pre_import_backup');
            if (backupData) {
                try {
                    const backup = JSON.parse(backupData);
                    if (backup.workers && backup.workers.length > 0) {
                        console.log(`✅ Backup encontrado com ${backup.workers.length} trabalhadores`);
                        this.workers = backup.workers;
                        this.saveAllData();
                    }
                } catch (backupError) {
                    console.error('❌ Erro ao ler backup:', backupError);
                }
            }
            
            // TENTATIVA 3: Criar dados de exemplo
            if (!this.workers || this.workers.length === 0) {
                console.log('🆕 Tentativa 3: Criar dados de exemplo');
                this.initializeSampleData();
            }
        }
        
        // Pequena pausa para garantir que os dados foram atribuídos
        // (em JavaScript é síncrono, mas por segurança)
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Verificação final
        if (!this.workers || this.workers.length === 0) {
            console.error('❌ TODAS AS TENTATIVAS FALHARAM. Não foi possível carregar dados.');
            this.showNotification('Erro crítico: não foi possível carregar os dados!', 'error');
            return false;
        } else {
            console.log(`✅ Dados recuperados com sucesso! ${this.workers.length} trabalhadores disponíveis.`);
        }
    } else {
        console.log(`✅ workers já carregado com ${this.workers.length} trabalhadores`);
    }
    
    // ===== PARTE 5: PROCURAR O TRABALHADOR PELO PIN =====
    console.log('🔍 A procurar trabalhador com PIN:', pin);
    console.log('📋 PINs disponíveis:', this.workers.map(w => w.pin).join(', '));
    
    const worker = this.workers.find(w => w.pin === pin);
    
    if (!worker) {
        console.log(`❌ PIN ${pin} não encontrado na lista de trabalhadores.`);
        
        // Debug: mostrar os primeiros 3 trabalhadores para referência
        const sampleWorkers = this.workers.slice(0, 3).map(w => `${w.name}: ${w.pin}`);
        console.log('📋 Exemplos de trabalhadores:', sampleWorkers);
        
        this.showNotification('PIN inválido!', 'error');
        return false;
    }
    
    // ===== PARTE 6: VALIDAR ESTADO DO TRABALHADOR =====
    console.log(`✅ Trabalhador encontrado: ${worker.name} (Admin: ${worker.isAdmin})`);
    
    if (!worker.active) {
        this.showNotification('Este trabalhador está inativo!', 'error');
        return false;
    }
    
    if (userType === 'admin' && !worker.isAdmin) {
        this.showNotification('Este utilizador não tem permissões de administrador!', 'error');
        return false;
    }
    
    // ===== PARTE 7: PROCESSAR LOGIN BEM-SUCEDIDO =====
    console.log(`✅ Login bem-sucedido: ${worker.name} (${userType})`);
    
    this.currentUser = worker;
    this.isAdmin = userType === 'admin';
    
    // Limpar sessão anterior antes de definir nova
    sessionStorage.clear();
    
    sessionStorage.setItem('currentUser', JSON.stringify(worker));
    sessionStorage.setItem('isAdmin', this.isAdmin);
    
    this.showNotification(`Bem-vindo, ${worker.name}!`, 'success');
    
    // ===== PARTE 8: REDIRECIONAR =====
    setTimeout(() => {
        if (this.isAdmin) {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'worker.html';
        }
    }, 1000);
    
    return true;
}

    toggleQRScanner() {
    console.log('📱 Alternar scanner QR');
    
    // Delegar para o leitor no index.html
    const scanQRBtn = document.getElementById('scanQR');
    const qrReaderContainer = document.getElementById('qr-reader-container');
    const closeBtn = document.getElementById('closeQRReader');
    
    if (!scanQRBtn || !qrReaderContainer) {
        console.warn('Elementos do leitor QR não encontrados');
        this.showNotification('Use o botão "Ler QR Code" no formulário', 'info');
        return;
    }
    
    // Verificar estado atual
    if (qrReaderContainer.style.display === 'none' || qrReaderContainer.style.display === '') {
        // Abrir o leitor - simular clique no botão principal
        console.log('Abrindo leitor QR através do botão principal');
        scanQRBtn.click();
    } else {
        // Fechar o leitor
        if (closeBtn) {
            console.log('Fechando leitor QR');
            closeBtn.click();
        }
    }
}

    checkAuth() {
    console.log('🔒 Verificando autenticação...');
    const currentPage = window.location.pathname.split('/').pop();
    
    // Se NÃO estiver na página de login, verificar autenticação
    if (currentPage !== 'index.html' && currentPage !== '' && !currentPage.includes('index')) {
        const user = sessionStorage.getItem('currentUser');
        if (!user) {
            console.log('❌ Não autenticado, redirecionando para login');
            window.location.href = 'index.html';
        } else {
            this.currentUser = JSON.parse(user);
            this.isAdmin = sessionStorage.getItem('isAdmin') === 'true';
        }
        return;
    }
    
    // NA PÁGINA DE LOGIN: NÃO redirecionar automaticamente
    // Apenas carregar dados se existirem, sem redirecionar
    const user = sessionStorage.getItem('currentUser');
    if (user) {
        console.log('👤 Utilizador com sessão ativa na página de login - aguardando novo login');
        this.currentUser = JSON.parse(user);
        this.isAdmin = sessionStorage.getItem('isAdmin') === 'true';
        // NÃO redirecionar - permitir novo login
    }
}

    logout() {
        console.log('🚪 Realizando logout...');
        sessionStorage.clear();
        this.showNotification('Logout realizado com sucesso!', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    showNotification(message, type = 'success') {
        console.log(`💬 Notificação [${type}]: ${message}`);
        
        const oldNotifications = document.querySelectorAll('.ponto-notification');
        oldNotifications.forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `ponto-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            background-color: ${type === 'success' ? '#27ae60' : 
                              type === 'error' ? '#e74c3c' : 
                              type === 'warning' ? '#f39c12' : '#3498db'};
        `;
        
        if (!document.getElementById('ponto-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'ponto-notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .ponto-notification {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
        
        return notification;
    }

    generateQRCode(workerId) {
        const worker = this.workers.find(w => w.id === workerId);
        if (!worker) return null;
        
        return `CHECKPOINT:PIN:${worker.pin}|NAME:${worker.name}|ROLE:${worker.role}`;
    }

    generateQRCodeElement(workerId, elementId, size = 200) {
        const worker = this.workers.find(w => w.id === workerId);
        if (!worker) return null;
        
        const qrData = this.generateQRCode(workerId);
        const container = document.getElementById(elementId);
        
        if (!container) return null;
        
        container.innerHTML = '';
        
        if (typeof QRCode !== 'undefined') {
            try {
                new QRCode(container, {
                    text: qrData,
                    width: size,
                    height: size,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });
                return true;
            } catch (error) {
                console.error('Erro ao gerar QR Code:', error);
                container.innerHTML = `
                    <div style="width: ${size}px; height: ${size}px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border-radius: 10px; margin: 0 auto;">
                        <p style="color: #666; text-align: center;">
                            Erro ao gerar QR Code<br>
                            <small>PIN: ${worker.pin}</small>
                        </p>
                    </div>
                `;
                return false;
            }
        } else {
            container.innerHTML = `
                <div style="width: ${size}px; height: ${size}px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border-radius: 10px; margin: 0 auto;">
                    <p style="color: #666; text-align: center;">
                        QR Code não disponível<br>
                        <small>PIN: ${worker.pin}</small>
                    </p>
                </div>
            `;
            return false;
        }
    }

    // MODIFICADO: registerPunch - Forçar atualização após registo
    registerPunch(workerId, type) {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const time = now.toTimeString().split(' ')[0].substring(0, 5);
        
        const registry = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            workerId: workerId,
            date: today,
            time: time,
            type: type,
            timestamp: now.getTime()
        };
        
        this.registries.push(registry);
        this.saveAllData();
        
        // Após cada registo, verificar se precisa atualizar banco de horas
        setTimeout(() => {
            this.processWorkerDay(workerId, today, true);
        }, 100);
        
        return registry;
    }

    getTodayRegistries(workerId) {
        const today = new Date().toISOString().split('T')[0];
        return this.registries
            .filter(r => r.workerId === workerId && r.date === today)
            .sort((a, b) => a.timestamp - b.timestamp);
    }

    calculateWorkedHours(registries) {
        if (!registries || registries.length === 0) return 0;
        
        let totalMinutes = 0;
        let lastEntry = null;
        
        const sortedRegistries = [...registries].sort((a, b) => a.timestamp - b.timestamp);
        
        for (const reg of sortedRegistries) {
            if (reg.type === 'in' || reg.type === 'break_end') {
                lastEntry = reg;
            } else if (lastEntry && (reg.type === 'break_start' || reg.type === 'out')) {
                const startTime = this.timeToMinutes(lastEntry.time);
                const endTime = this.timeToMinutes(reg.time);
                totalMinutes += (endTime - startTime);
                lastEntry = null;
            }
        }
        
        return totalMinutes / 60;
    }

    timeToMinutes(time) {
        if (!time) return 0;
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    getWeekNumber(date = new Date()) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
        const week1 = new Date(d.getFullYear(), 0, 4);
        return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    }

    getWeekDates(year, weekNumber) {
        const firstDayOfYear = new Date(year, 0, 1);
        const daysOffset = (weekNumber - 1) * 7 - (firstDayOfYear.getDay() - 1);
        const weekStart = new Date(firstDayOfYear);
        weekStart.setDate(firstDayOfYear.getDate() + daysOffset);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        return { 
            start: weekStart.toISOString().split('T')[0], 
            end: weekEnd.toISOString().split('T')[0] 
        };
    }

    getAllWeeks(year) {
        const weeks = [];
        const totalWeeks = 52;
        
        for (let week = 1; week <= totalWeeks; week++) {
            const weekDates = this.getWeekDates(year, week);
            weeks.push({
                weekNumber: week,
                year: year,
                startDate: weekDates.start,
                endDate: weekDates.end
            });
        }
        
        return weeks;
    }

generateMonthlyReport(workerId, year, month, skipSave = false) {
    const worker = this.workers.find(w => w.id === workerId);
    if (!worker) {
        console.log('Trabalhador não encontrado');
        return null;
    }
    
    console.log(`📊 Gerando relatório para ${worker.name} - ${month}/${year}`);
    
    // Se o trabalhador não tem horário, criar um padrão
    if (!this.schedules[workerId]) {
        this.schedules[workerId] = {
            reference: [
                { day: 1, start: '09:00', end: '17:00', break: '13:00-14:00' },
                { day: 2, start: '09:00', end: '17:00', break: '13:00-14:00' },
                { day: 3, start: '09:00', end: '17:00', break: '13:00-14:00' },
                { day: 4, start: '09:00', end: '17:00', break: '13:00-14:00' },
                { day: 5, start: '09:00', end: '17:00', break: '13:00-14:00' }
            ]
        };
    }
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    let totalWorked = 0;
    let totalReference = 0;
    let justifiedAbsence = 0;
    let vacation = 0;
    let training = 0;
    
    const schedule = this.schedules[workerId]?.reference || [];
    
    // Mapa de registos de ponto por data
    const registriesByDate = {};
    this.registries
        .filter(r => r.workerId === workerId)
        .forEach(reg => {
            if (!registriesByDate[reg.date]) {
                registriesByDate[reg.date] = [];
            }
            registriesByDate[reg.date].push(reg);
        });
    
    // Mapa de registos administrativos por data
    const adminByDate = {};
    (this.adminRegistries || [])
        .filter(r => r.workerId === workerId)
        .forEach(reg => {
            if (!adminByDate[reg.date]) {
                adminByDate[reg.date] = [];
            }
            adminByDate[reg.date].push(reg);
        });
    
    // Processar todos os dias do mês
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const dayOfWeek = d.getDay();
        
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;
        
        const daySchedule = schedule.find(s => s.day === dayOfWeek);
        if (!daySchedule) continue;
        
        const refHours = this.calculateReferenceHours(daySchedule);
        totalReference += refHours;
        
        const adminRegs = adminByDate[dateStr] || [];
        
        if (adminRegs.length > 0) {
            adminRegs.forEach(adminReg => {
                switch(adminReg.type) {
                    case 'justified':
                        justifiedAbsence += adminReg.hours;
                        break;
                    case 'vacation':
                        vacation += adminReg.hours;
                        break;
                    case 'training':
                        training += adminReg.hours;
                        break;
                }
            });
        } else {
            const dayRegistries = registriesByDate[dateStr] || [];
            if (dayRegistries.length > 0) {
                const workedHours = this.calculateWorkedHours(dayRegistries);
                totalWorked += workedHours;
            }
        }
    }
    
    // OBTER SALDO ATUAL DO BANCO DE HORAS
    const bankData = this.getBankBalance(workerId);
    const bankHours = bankData.hours;
    const bankValue = bankData.value;
    
    console.log(`📊 Resumo final:`, {
        'Horas Referência': totalReference.toFixed(2),
        'Horas Trabalhadas': totalWorked.toFixed(2),
        'Faltas Justificadas': justifiedAbsence.toFixed(2),
        'Férias': vacation.toFixed(2),
        'Formação': training.toFixed(2),
        'Banco Horas (saldo)': bankHours.toFixed(2)
    });
    
    const report = {
        id: Date.now(),
        workerId: workerId,
        year: year,
        month: month,
        totalReference: parseFloat(totalReference.toFixed(2)),
        totalWorked: parseFloat(totalWorked.toFixed(2)),
        justifiedAbsence: parseFloat(justifiedAbsence.toFixed(2)),
        unjustifiedAbsence: 0,
        vacation: parseFloat(vacation.toFixed(2)),
        training: parseFloat(training.toFixed(2)),
        horasExtras: 0,
        horasFaltadas: 0,
        hoursBank: parseFloat(bankHours.toFixed(2)),
        bankValue: parseFloat(bankValue.toFixed(2)),
        deductionValue: 0,
        generatedAt: new Date().toISOString()
    };
    
    if (!skipSave) {
        // Remover relatório existente se houver
        const existingIndex = this.reports.findIndex(r => 
            r.workerId === workerId && r.year === year && r.month === month
        );
        if (existingIndex !== -1) {
            this.reports.splice(existingIndex, 1);
        }
        
        this.reports.push(report);
        this.saveAllData();
    }
    
    return report;
}

    calculateReferenceHours(schedule) {
        if (!schedule.start || !schedule.end) return 0;
        
        const start = this.timeToMinutes(schedule.start);
        const end = this.timeToMinutes(schedule.end);
        let total = end - start;
        
        if (schedule.break) {
            const [breakStart, breakEnd] = schedule.break.split('-').map(t => this.timeToMinutes(t));
            if (breakStart && breakEnd) {
                total -= (breakEnd - breakStart);
            }
        }
        
        return total / 60;
    }

    exportBackup() {
        const backup = {
            workers: this.workers,
            schedules: this.schedules,
            registries: this.registries,
            reports: this.reports,
            hoursBank: this.hoursBank,
            roles: this.roles,
            adminRegistries: this.adminRegistries || [],
            scheduleTemplates: this.scheduleTemplates || [],
            scheduleAssignments: this.scheduleAssignments || {},
            weekScheduleAssignments: this.weekScheduleAssignments || {},
            exportedAt: new Date().toISOString(),
            version: '1.4'
        };
        
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `checkpoint_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        localStorage.setItem('ponto_last_backup', new Date().toISOString());
        this.showNotification('Backup exportado com sucesso!', 'success');
    }

    importBackup(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const backup = JSON.parse(e.target.result);
                    
                    if (!backup.workers || !backup.schedules || !backup.registries) {
                        throw new Error('Arquivo de backup inválido!');
                    }
                    
                    const currentBackup = {
                        workers: this.workers,
                        schedules: this.schedules,
                        registries: this.registries,
                        reports: this.reports,
                        hoursBank: this.hoursBank,
                        roles: this.roles,
                        adminRegistries: this.adminRegistries || [],
                        scheduleTemplates: this.scheduleTemplates || [],
                        scheduleAssignments: this.scheduleAssignments || {},
                        weekScheduleAssignments: this.weekScheduleAssignments || {},
                        exportedAt: new Date().toISOString(),
                        version: '1.4'
                    };
                    
                    localStorage.setItem('ponto_pre_import_backup', JSON.stringify(currentBackup));
                    
                    this.workers = backup.workers;
                    this.schedules = backup.schedules;
                    this.registries = backup.registries;
                    this.reports = backup.reports || [];
                    this.hoursBank = backup.hoursBank || {};
                    this.roles = backup.roles || this.roles;
                    this.adminRegistries = backup.adminRegistries || [];
                    this.scheduleTemplates = backup.scheduleTemplates || [];
                    this.scheduleAssignments = backup.scheduleAssignments || {};
                    this.weekScheduleAssignments = backup.weekScheduleAssignments || {};
                    
                    // Validar consistência após importação
                    this.validateHoursBankConsistency();
                    
                    this.saveAllData();
                    
                    sessionStorage.clear();
                    
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
            reader.readAsText(file);
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM completamente carregado - Inicializando PontoApp');
    
    if (!window.PontoApp) {
        window.PontoApp = new PontoApp();
        console.log('✅ PontoApp inicializado com sucesso');
    }
});

window.addEventListener('load', function() {
    console.log('🪟 Janela completamente carregada');
    
    if (!window.PontoApp) {
        window.PontoApp = new PontoApp();
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PontoApp;
}