// worker.js - VERSÃO CORRIGIDA COM DESTAQUE PARA VALORES NEGATIVOS
class WorkerInterface {
    constructor() {
    this.currentWorker = JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (!this.currentWorker) {
        window.location.href = 'index.html';
        return;
    }
    
    this.currentDate = new Date();
    this.currentYear = this.currentDate.getFullYear();
    this.currentMonth = this.currentDate.getMonth() + 1;
    
    // ADICIONAR ESTA LINHA:
    this.ultimaSemana = this.getWeekNumber(this.currentDate);
    
    this.init();
}

// ===== FUNÇÃO PARA CARREGAR BIBLIOTECA QRCODE (IGUAL AO ADMIN) =====
loadQRCodeLibrary() {
    return new Promise((resolve, reject) => {
        // Verificar se já está carregada
        if (typeof QRCode !== 'undefined') {
            console.log('✅ QRCode library já disponível');
            resolve();
            return;
        }
        
        console.log('📥 A carregar biblioteca QRCode...');
        
        // Criar script element
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js';
        script.async = true;
        
        script.onload = () => {
            console.log('✅ QRCode library carregada com sucesso');
            // Pequeno delay para garantir inicialização
            setTimeout(resolve, 100);
        };
        
        script.onerror = () => {
            console.error('❌ Erro ao carregar QRCode library');
            reject(new Error('Falha ao carregar biblioteca QRCode'));
        };
        
        document.head.appendChild(script);
    });
}

// worker.js - ADICIONAR ESTE MÉTODO init() COMPLETO
init() {
    console.log("Inicializando WorkerInterface...");
    
    this.loadWorkerData();
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
    
    this.setupEventListeners();
    this.initializeFilters();
    this.updateTodayRegistries();
    this.loadAllRegistries();
    this.loadBankHours();
    
    // ADICIONAR ESTA LINHA:
    this.loadMySchedule(); // Carregar horário da semana atual
    
    // Verificar mudança de semana automaticamente
    setInterval(() => {
        const hoje = new Date();
        const semanaAtual = this.getWeekNumber(hoje);
        
        // Se a semana mudou desde a última verificação
        if (this.ultimaSemana !== semanaAtual) {
            console.log(`📅 Semana mudou de ${this.ultimaSemana} para ${semanaAtual}. Recarregando horário...`);
            this.loadMySchedule();
            this.ultimaSemana = semanaAtual;
        }
    }, 3600000); // Verificar a cada hora
    
    console.log("WorkerInterface inicializado com sucesso");
}

    loadWorkerData() {
        console.log("Carregando dados do trabalhador...");
        document.getElementById('workerName').textContent = this.currentWorker.name;
        document.getElementById('workerRole').textContent = this.currentWorker.role;
        document.getElementById('workerAvatar').textContent = this.getInitials(this.currentWorker.name);
    }

    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    initializeFilters() {
        console.log("Inicializando filtros...");
        
        const yearSelect = document.getElementById('filterYear');
        yearSelect.innerHTML = '';
        
        for (let year = 2022; year <= 2026; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
        
        yearSelect.value = this.currentYear;
        
        const monthSelect = document.getElementById('filterMonth');
        const months = [
            {value: 0, name: "Todos os meses"},
            {value: 1, name: "Janeiro"},
            {value: 2, name: "Fevereiro"},
            {value: 3, name: "Março"},
            {value: 4, name: "Abril"},
            {value: 5, name: "Maio"},
            {value: 6, name: "Junho"},
            {value: 7, name: "Julho"},
            {value: 8, name: "Agosto"},
            {value: 9, name: "Setembro"},
            {value: 10, name: "Outubro"},
            {value: 11, name: "Novembro"},
            {value: 12, name: "Dezembro"}
        ];
        
        monthSelect.innerHTML = '';
        months.forEach(month => {
            const option = document.createElement('option');
            option.value = month.value;
            option.textContent = month.name;
            monthSelect.appendChild(option);
        });
        
        monthSelect.value = this.currentMonth;
        
        console.log("Filtros inicializados com ano/mês atual");
    }

    updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('pt-PT', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        
        const dateString = now.toLocaleDateString('pt-PT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).replace(/^\w/, c => c.toUpperCase());
        
        document.getElementById('currentTime').textContent = timeString;
        document.getElementById('currentDate').textContent = dateString;
    }

    setupEventListeners() {
        console.log("Configurando event listeners...");
        
        this.setupNavigationButtons();
        this.setupLogoutButton();
        this.setupPunchButtons();
        this.setupAdditionalButtons();
        
        console.log("Todos os event listeners configurados");
    }

    setupNavigationButtons() {
        console.log("Configurando botões de navegação...");
        
        const navLinks = document.querySelectorAll('.nav-link');
        console.log(`Encontrados ${navLinks.length} links de navegação`);
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const page = link.getAttribute('data-page');
                console.log(`Navegando para: ${page}`);
                
                this.navigateTo(page);
            });
        });
    }

    setupLogoutButton() {
        console.log("Configurando botão Sair...");
        
        const logoutBtn = document.getElementById('btnLogout');
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log("Botão Sair clicado!");
                this.performLogout();
            });
            
            console.log("Botão Sair configurado com sucesso");
        } else {
            console.error("Botão Sair não encontrado!");
        }
    }

    setupPunchButtons() {
        const btnIn = document.getElementById('btnIn');
        if (btnIn) {
            btnIn.addEventListener('click', () => {
                console.log("Botão Entrada clicado");
                this.registerPunch('in');
            });
        }
        
        const btnBreakStart = document.getElementById('btnBreakStart');
        if (btnBreakStart) {
            btnBreakStart.addEventListener('click', () => {
                console.log("Botão Início Pausa clicado");
                this.registerPunch('break_start');
            });
        }
        
        const btnBreakEnd = document.getElementById('btnBreakEnd');
        if (btnBreakEnd) {
            btnBreakEnd.addEventListener('click', () => {
                console.log("Botão Fim Pausa clicado");
                this.registerPunch('break_end');
            });
        }
        
        const btnOut = document.getElementById('btnOut');
        if (btnOut) {
            btnOut.addEventListener('click', () => {
                console.log("Botão Saída clicado");
                this.registerPunch('out');
            });
        }
    }

    setupAdditionalButtons() {
        const btnViewQR = document.getElementById('btnViewQR');
        if (btnViewQR) {
            btnViewQR.addEventListener('click', () => {
                console.log("Botão QR Code clicado");
                this.toggleQRCode();
            });
        }
        
        const btnFilter = document.getElementById('btnFilterRegistries');
        if (btnFilter) {
            btnFilter.addEventListener('click', () => {
                console.log("Botão Filtrar clicado");
                this.loadAllRegistries();
            });
        }
        
        document.getElementById('filterMonth').addEventListener('change', () => {
            this.loadAllRegistries();
        });
        
        document.getElementById('filterYear').addEventListener('change', () => {
            this.loadAllRegistries();
        });
    }

    navigateTo(pageId) {
    console.log(`Executando navegação para: ${pageId}`);
    
    const allSections = document.querySelectorAll('.content-section');
    allSections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(pageId);
    if (targetSection) {
        targetSection.classList.add('active');
        console.log(`Seção ${pageId} tornada visível`);
    } else {
        console.error(`Seção ${pageId} não encontrada!`);
    }
    
    const allLinks = document.querySelectorAll('.nav-link');
    allLinks.forEach(link => {
        link.classList.remove('active');
        
        const linkPage = link.getAttribute('data-page');
        if (linkPage === pageId) {
            link.classList.add('active');
            console.log(`Link ${pageId} marcado como ativo`);
        }
    });
    
    this.loadPageContent(pageId);
    
    // ADICIONAR ESTA LINHA - Atualizar horário sempre que aceder à página de horário
    if (pageId === 'horario') {
        this.loadMySchedule();
    }
}

    loadPageContent(pageId) {
        switch(pageId) {
            case 'ponto':
                console.log("Carregando conteúdo: Marcar Ponto");
                this.updateTodayRegistries();
                this.checkLastRegistry();
                break;
                
            case 'registos':
                console.log("Carregando conteúdo: Meus Registos");
                this.loadAllRegistries();
                break;
                
            case 'horario':
                console.log("Carregando conteúdo: Meu Horário");
                this.loadMySchedule();
                break;
                
            case 'bancohoras':
                console.log("Carregando conteúdo: Banco de Horas");
                this.loadBankHours(); // Recarregar sempre que aceder
                break;
        }
    }

    performLogout() {
        console.log("Executando logout...");
        
        sessionStorage.clear();
        this.showNotification("Sessão terminada com sucesso", "success");
        
        setTimeout(() => {
            console.log("Redirecionando para página de login...");
            window.location.href = 'index.html';
        }, 1500);
    }

    registerPunch(type) {
        console.log(`Registrando ponto: ${type}`);
        
        if (!window.PontoApp) {
            this.showNotification("Erro: Aplicação não inicializada!", 'error');
            return;
        }
        
        const registry = window.PontoApp.registerPunch(this.currentWorker.id, type);
        
        const typeText = this.getPunchTypeText(type);
        this.showNotification(`${typeText} registrado às ${registry.time}`, "success");
        
        this.updateTodayRegistries();
        this.checkLastRegistry();
    }

    getPunchTypeText(type) {
        const types = {
            'in': 'Entrada',
            'break_start': 'Início de Pausa',
            'break_end': 'Fim de Pausa',
            'out': 'Saída'
        };
        return types[type] || type;
    }

    showNotification(message, type = 'info') {
        const oldNotifications = document.querySelectorAll('.notification');
        oldNotifications.forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            background: ${type === 'success' ? '#27ae60' : 
                        type === 'error' ? '#e74c3c' : 
                        type === 'warning' ? '#f39c12' : '#3498db'};
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    checkLastRegistry() {
        const today = new Date().toISOString().split('T')[0];
        let registries = window.PontoApp?.registries || [];
        registries = registries.filter(r => 
            r.date === today && r.workerId === this.currentWorker.id
        );
        
        if (registries.length === 0) {
            this.enableButton('btnIn');
            this.disableButton('btnBreakStart');
            this.disableButton('btnBreakEnd');
            this.disableButton('btnOut');
        } else {
            const last = registries[registries.length - 1];
            switch(last.type) {
                case 'in':
                    this.disableButton('btnIn');
                    this.enableButton('btnBreakStart');
                    this.disableButton('btnBreakEnd');
                    this.enableButton('btnOut');
                    break;
                case 'break_start':
                    this.disableButton('btnIn');
                    this.disableButton('btnBreakStart');
                    this.enableButton('btnBreakEnd');
                    this.disableButton('btnOut');
                    break;
                case 'break_end':
                    this.disableButton('btnIn');
                    this.enableButton('btnBreakStart');
                    this.disableButton('btnBreakEnd');
                    this.enableButton('btnOut');
                    break;
                case 'out':
                    this.disableButton('btnIn');
                    this.disableButton('btnBreakStart');
                    this.disableButton('btnBreakEnd');
                    this.disableButton('btnOut');
                    break;
            }
        }
    }

    enableButton(buttonId) {
        const btn = document.getElementById(buttonId);
        if (btn) {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
    }

    disableButton(buttonId) {
        const btn = document.getElementById(buttonId);
        if (btn) {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        }
    }

    updateTodayRegistries() {
        const today = new Date().toISOString().split('T')[0];
        let registries = window.PontoApp?.registries || [];
        registries = registries.filter(r => 
            r.date === today && r.workerId === this.currentWorker.id
        ).sort((a, b) => a.timestamp - b.timestamp);
        
        const tbody = document.getElementById('todayRegistries');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (registries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">Nenhum registro hoje</td></tr>';
            return;
        }
        
        registries.forEach(reg => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${this.getPunchTypeText(reg.type)}</td>
                <td>${reg.time}</td>
                <td>-</td>
            `;
            
            tbody.appendChild(row);
        });
    }

    async toggleQRCode() {
    console.log('📱 A gerar QR Code para:', this.currentWorker.name);
    
    const container = document.getElementById('qrcodeContainer');
    const button = document.getElementById('btnViewQR');
    
    if (!container || !button) return;
    
    if (container.style.display === 'none' || container.style.display === '') {
        container.style.display = 'block';
        button.textContent = '🙈 Ocultar QR Code';
        
        // Mostrar loading
        container.innerHTML = '<div style="text-align: center; padding: 20px;">⏳ A gerar QR Code...</div>';
        
        // ===== PASSO 1: RECARREGAR DADOS DO TRABALHADOR =====
        console.log('🔄 A buscar dados mais recentes do trabalhador...');
        
        const workersData = localStorage.getItem('ponto_workers');
        if (workersData) {
            try {
                const workers = JSON.parse(workersData);
                const workerAtualizado = workers.find(w => w.id === this.currentWorker.id);
                
                if (workerAtualizado) {
                    console.log('✅ Dados atualizados encontrados!');
                    console.log('   PIN antigo:', this.currentWorker.pin);
                    console.log('   PIN novo:', workerAtualizado.pin);
                    
                    this.currentWorker = workerAtualizado;
                    sessionStorage.setItem('currentUser', JSON.stringify(workerAtualizado));
                    document.getElementById('workerName').textContent = workerAtualizado.name;
                    document.getElementById('workerRole').textContent = workerAtualizado.role;
                }
            } catch (e) {
                console.error('❌ Erro ao ler workers:', e);
            }
        }
        
        // ===== PASSO 2: PREPARAR DADOS (MESMO FORMATO DO ADMIN) =====
        const workerData = {
            id: this.currentWorker.id,
            name: this.currentWorker.name || 'Trabalhador',
            pin: this.currentWorker.pin ? 
                this.currentWorker.pin.toString().padStart(4, '0') : 
                this.currentWorker.id.toString().padStart(4, '0'),
            role: this.currentWorker.role || 'Sem Função'
        };
        
        console.log('📱 A gerar QR Code com PIN:', workerData.pin);
        
        // ===== PASSO 3: DEFINIR DADOS DO QR CODE (MESMO FORMATO) =====
        const qrData = `CHECKPOINT:PIN:${workerData.pin}`;
        
        // ===== PASSO 4: FUNÇÃO PARA GERAR QR CODE (IGUAL AO ADMIN) =====
        const generateQR = () => {
            // Limpar container
            container.innerHTML = '';
            
            if (typeof QRCode !== 'undefined') {
                try {
                    // Usar canvas (igual ao admin)
                    const canvas = document.createElement('canvas');
                    
                    QRCode.toCanvas(canvas, qrData, {
                        width: 250,
                        margin: 2,
                        color: {
                            dark: '#000000',
                            light: '#ffffff'
                        }
                    }, (error) => {
                        if (error) {
                            console.error('❌ Erro ao gerar QR Code:', error);
                            this.showQRFallback(container, workerData);
                        } else {
                            // Adicionar canvas
                            container.appendChild(canvas);
                            
                            // Adicionar informações (igual ao admin mas com data/hora)
                            const infoDiv = document.createElement('div');
                            infoDiv.style.marginTop = '15px';
                            infoDiv.style.padding = '15px';
                            infoDiv.style.background = '#f8f9fa';
                            infoDiv.style.borderRadius = '8px';
                            infoDiv.style.textAlign = 'left';
                            
                            const agora = new Date();
                            const horaAtual = agora.toLocaleTimeString('pt-PT');
                            const dataAtual = agora.toLocaleDateString('pt-PT');
                            
                            infoDiv.innerHTML = `
                                <p><strong>Nome:</strong> ${workerData.name}</p>
                                <p><strong>Função:</strong> ${workerData.role}</p>
                                <p><strong>PIN:</strong> ${workerData.pin}</p>
                                <p style="color: #28a745; font-size: 12px; margin-top: 10px; border-top: 1px solid #dee2e6; padding-top: 10px;">
                                    ✅ Dados atualizados: ${dataAtual} ${horaAtual}
                                </p>
                            `;
                            container.appendChild(infoDiv);
                            
                            console.log('✅ QR Code gerado com sucesso');
                        }
                    });
                    
                } catch (error) {
                    console.error('❌ Erro:', error);
                    this.showQRFallback(container, workerData);
                }
            } else {
                console.warn('⚠️ QRCode não disponível');
                this.showQRFallback(container, workerData);
            }
        };
        
        // ===== PASSO 5: FUNÇÃO DE FALLBACK (MESMO ESTILO DO ADMIN) =====
        // (Já existe a função showQRFallback, vamos usá-la)
        
        // ===== PASSO 6: CARREGAR BIBLIOTECA E GERAR (IGUAL AO ADMIN) =====
        try {
            await this.loadQRCodeLibrary();
            generateQR();
        } catch (error) {
            console.error('❌ Erro ao carregar biblioteca:', error);
            this.showQRFallback(container, workerData);
        }
        
        container.style.animation = 'fadeIn 0.3s ease';
        
    } else {
        container.style.display = 'none';
        button.textContent = '📱 Ver Meu QR Code';
    }
}

    loadAllRegistries() {
        console.log("Carregando todos os registros...");
        
        const month = parseInt(document.getElementById('filterMonth').value);
        const year = parseInt(document.getElementById('filterYear').value);
        
        console.log(`Filtrando por: Mês ${month}, Ano ${year}`);
        
        let allRegistries = window.PontoApp?.registries || [];
        
        let workerRegistries = allRegistries.filter(r => r.workerId === this.currentWorker.id);
        
        const registriesByDate = {};
        workerRegistries.forEach(reg => {
            if (!registriesByDate[reg.date]) {
                registriesByDate[reg.date] = [];
            }
            registriesByDate[reg.date].push(reg);
        });
        
        const structuredData = [];
        
        Object.keys(registriesByDate).forEach(date => {
            const dateObj = new Date(date);
            const recordYear = dateObj.getFullYear();
            const recordMonth = dateObj.getMonth() + 1;
            
            if ((month === 0 || recordMonth === month) && recordYear === year) {
                const dayRegistries = registriesByDate[date].sort((a, b) => a.timestamp - b.timestamp);
                
                const entry = dayRegistries.find(r => r.type === 'in');
                const breakStart = dayRegistries.find(r => r.type === 'break_start');
                const breakEnd = dayRegistries.find(r => r.type === 'break_end');
                const exit = dayRegistries.find(r => r.type === 'out');
                
                let hours = 0;
                if (entry && exit) {
                    const entryTime = new Date(entry.timestamp);
                    const exitTime = new Date(exit.timestamp);
                    
                    let totalMs = exitTime - entryTime;
                    
                    if (breakStart && breakEnd) {
                        const breakStartTime = new Date(breakStart.timestamp);
                        const breakEndTime = new Date(breakEnd.timestamp);
                        totalMs -= (breakEndTime - breakStartTime);
                    }
                    
                    hours = totalMs / (1000 * 60 * 60);
                    hours = Math.round(hours * 100) / 100;
                }
                
                let status = 'Conforme';
                if (entry) {
                    const entryTime = new Date(entry.timestamp);
                    const entryHour = entryTime.getHours();
                    const entryMinute = entryTime.getMinutes();
                    
                    if (entryHour > 9 || (entryHour === 9 && entryMinute > 10)) {
                        status = 'Atraso';
                    }
                }
                
                structuredData.push({
                    date: date,
                    entry: entry ? entry.time : '-',
                    breakStart: breakStart ? breakStart.time : '-',
                    breakEnd: breakEnd ? breakEnd.time : '-',
                    exit: exit ? exit.time : '-',
                    hours: hours > 0 ? hours.toFixed(2) + 'h' : '-',
                    status: status
                });
            }
        });
        
        structuredData.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const tbody = document.getElementById('allRegistries');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (structuredData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum registro encontrado</td></tr>';
            
            document.getElementById('totalHours').textContent = '0h';
            document.getElementById('workedDays').textContent = '0';
            document.getElementById('averageHours').textContent = '0h';
            document.getElementById('lastRegistry').textContent = '-';
            
            const periodText = month === 0 ? 
                `Ano ${year}` : 
                `${this.getMonthName(month)} ${year}`;
            
            document.getElementById('totalHoursPeriod').textContent = periodText;
            document.getElementById('workedDaysPeriod').textContent = periodText;
            
            return;
        }
        
        structuredData.forEach(item => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${new Date(item.date).toLocaleDateString('pt-PT')}</td>
                <td>${item.entry}</td>
                <td>${item.breakStart}</td>
                <td>${item.breakEnd}</td>
                <td>${item.exit}</td>
                <td>${item.hours}</td>
                <td>
                    <span class="status-badge ${item.status === 'Conforme' ? 'status-ok' : 'status-warning'}">
                        ${item.status}
                    </span>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        this.calculateStatistics(structuredData, month, year);
    }

    calculateStatistics(data, month, year) {
        let totalHours = 0;
        let workedDays = data.length;
        
        data.forEach(item => {
            if (item.hours !== '-') {
                totalHours += parseFloat(item.hours);
            }
        });
        
        const averageHours = workedDays > 0 ? totalHours / workedDays : 0;
        
        const lastRegistry = data.length > 0 ? 
            `${new Date(data[0].date).toLocaleDateString('pt-PT')} ${data[0].exit !== '-' ? data[0].exit : data[0].entry}` : 
            '-';
        
        document.getElementById('totalHours').textContent = totalHours.toFixed(2) + 'h';
        document.getElementById('workedDays').textContent = workedDays;
        document.getElementById('averageHours').textContent = averageHours.toFixed(2) + 'h';
        document.getElementById('lastRegistry').textContent = lastRegistry;
        
        const periodText = month === 0 ? 
            `Ano ${year}` : 
            `${this.getMonthName(month)} ${year}`;
        
        document.getElementById('totalHoursPeriod').textContent = periodText;
        document.getElementById('workedDaysPeriod').textContent = periodText;
        
        console.log(`Estatísticas calculadas: ${totalHours.toFixed(2)}h em ${workedDays} dias`);
    }

    getMonthName(monthNumber) {
        const months = [
            "Todos os meses", "Janeiro", "Fevereiro", "Março", "Abril", 
            "Maio", "Junho", "Julho", "Agosto", "Setembro", 
            "Outubro", "Novembro", "Dezembro"
        ];
        return months[monthNumber];
    }

    // worker.js - CORREÇÃO: Carregar horário baseado na semana atual
loadMySchedule() {
    console.log("📅 Carregando horário da semana atual...");
    
    if (!window.PontoApp) {
        console.error("PontoApp não inicializado");
        this.showNotification("Erro ao carregar horário", 'error');
        return;
    }
    
    const workerId = this.currentWorker.id;
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const semanaAtual = this.getWeekNumber(hoje);
    
    console.log(`📅 Semana atual: ${semanaAtual} do ano ${anoAtual}`);
    
    // 1. VERIFICAR SE TEM HORÁRIO ESPECÍFICO PARA ESTA SEMANA
    let horarioDaSemana = null;
    let templateId = null;
    
    if (window.PontoApp.weekScheduleAssignments && 
        window.PontoApp.weekScheduleAssignments[workerId] &&
        window.PontoApp.weekScheduleAssignments[workerId][anoAtual] &&
        window.PontoApp.weekScheduleAssignments[workerId][anoAtual][semanaAtual]) {
        
        templateId = window.PontoApp.weekScheduleAssignments[workerId][anoAtual][semanaAtual];
        console.log(`✅ Encontrado horário específico para semana ${semanaAtual}: template ID ${templateId}`);
        
        // Buscar template
        if (window.PontoApp.scheduleTemplates) {
            horarioDaSemana = window.PontoApp.scheduleTemplates.find(t => t.id === templateId);
        }
    }
    
    // 2. SE NÃO TEM HORÁRIO PARA A SEMANA, USAR HORÁRIO PADRÃO DO TRABALHADOR
    if (!horarioDaSemana) {
        console.log("ℹ️ Usando horário padrão do trabalhador");
        
        // Verificar se o trabalhador tem horário definido
        const scheduleData = window.PontoApp.schedules[workerId];
        
        if (scheduleData && scheduleData.reference) {
            // Criar um template temporário a partir do horário padrão
            horarioDaSemana = {
                id: 0,
                name: 'Horário Padrão',
                days: scheduleData.reference,
                totalHours: this.calcularTotalHorasSemana(scheduleData.reference)
            };
        }
    }
    
    // 3. SE AINDA NÃO TEM, USAR HORÁRIO PADRÃO FIXO
    if (!horarioDaSemana) {
        console.log("ℹ️ Usando horário padrão fixo");
        horarioDaSemana = {
            id: 0,
            name: 'Horário Base',
            days: [
                { day: 1, start: '09:00', end: '17:00', break: '13:00-14:00' },
                { day: 2, start: '09:00', end: '17:00', break: '13:00-14:00' },
                { day: 3, start: '09:00', end: '17:00', break: '13:00-14:00' },
                { day: 4, start: '09:00', end: '17:00', break: '13:00-14:00' },
                { day: 5, start: '09:00', end: '17:00', break: '13:00-14:00' }
            ],
            totalHours: 35
        };
    }
    
    // 4. PREENCHER A TABELA DE HORÁRIO
    this.renderScheduleTable(horarioDaSemana, semanaAtual, anoAtual);
    
    // 5. MOSTRAR INFORMAÇÃO DA SEMANA
    this.showWeekInfo(semanaAtual, anoAtual, horarioDaSemana.name);
}

// Função auxiliar para calcular total de horas da semana
calcularTotalHorasSemana(days) {
    if (!days || days.length === 0) return 0;
    
    let total = 0;
    days.forEach(day => {
        if (day.start && day.end) {
            const start = this.timeToMinutes(day.start);
            const end = this.timeToMinutes(day.end);
            let dayHours = (end - start) / 60;
            
            if (day.break) {
                const [breakStart, breakEnd] = day.break.split('-').map(t => this.timeToMinutes(t));
                if (breakStart && breakEnd) {
                    dayHours -= (breakEnd - breakStart) / 60;
                }
            }
            total += dayHours;
        }
    });
    return parseFloat(total.toFixed(1));
}

// Função auxiliar para converter time para minutos
timeToMinutes(time) {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

// Função para obter número da semana
getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

// Função para renderizar a tabela de horário
renderScheduleTable(horario, semana, ano) {
    const container = document.getElementById('horarioContent');
    if (!container) return;
    
    const diasSemana = [
        { id: 1, nome: 'Segunda-feira' },
        { id: 2, nome: 'Terça-feira' },
        { id: 3, nome: 'Quarta-feira' },
        { id: 4, nome: 'Quinta-feira' },
        { id: 5, nome: 'Sexta-feira' }
    ];
    
    let html = `
        <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <p><strong>Semana ${semana} de ${ano}</strong> - ${horario.name}</p>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Dia</th>
                        <th>Entrada</th>
                        <th>Saída</th>
                        <th>Pausa</th>
                        <th>Horas</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    diasSemana.forEach(dia => {
        const daySchedule = horario.days.find(d => d.day === dia.id);
        
        if (daySchedule) {
            const horas = this.calcularHorasDia(daySchedule);
            html += `
                <tr>
                    <td>${dia.nome}</td>
                    <td>${daySchedule.start || '-'}</td>
                    <td>${daySchedule.end || '-'}</td>
                    <td>${daySchedule.break || '-'}</td>
                    <td>${horas}h</td>
                </tr>
            `;
        } else {
            html += `
                <tr>
                    <td>${dia.nome}</td>
                    <td colspan="4" style="color: #6c757d;">Sem horário definido</td>
                </tr>
            `;
        }
    });
    
    html += `
                </tbody>
                <tfoot>
                    <tr style="background: #f8f9fa; font-weight: bold;">
                        <td colspan="4" style="text-align: right;">Total Semanal:</td>
                        <td>${horario.totalHours}h</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

// Função para calcular horas de um dia
calcularHorasDia(daySchedule) {
    if (!daySchedule || !daySchedule.start || !daySchedule.end) return 0;
    
    const start = this.timeToMinutes(daySchedule.start);
    const end = this.timeToMinutes(daySchedule.end);
    let total = (end - start) / 60;
    
    if (daySchedule.break) {
        const [breakStart, breakEnd] = daySchedule.break.split('-').map(t => this.timeToMinutes(t));
        if (breakStart && breakEnd) {
            total -= (breakEnd - breakStart) / 60;
        }
    }
    
    return total.toFixed(1);
}

// Função para mostrar informação da semana
showWeekInfo(semana, ano, nomeHorario) {
    // Calcular datas da semana
    const hoje = new Date();
    const primeiroDiaAno = new Date(ano, 0, 1);
    const diasOffset = (semana - 1) * 7 - (primeiroDiaAno.getDay() - 1);
    const inicioSemana = new Date(primeiroDiaAno);
    inicioSemana.setDate(primeiroDiaAno.getDate() + diasOffset);
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 4); // Sexta-feira
    
    const options = { day: '2-digit', month: '2-digit' };
    const dataInicio = inicioSemana.toLocaleDateString('pt-PT', options);
    const dataFim = fimSemana.toLocaleDateString('pt-PT', options);
    
    // Mostrar no título ou em algum lugar
    const header = document.querySelector('#horario .header h1');
    if (header) {
        header.innerHTML = `Meu Horário <span style="font-size: 16px; color: #6c757d;">(Semana ${semana} - ${dataInicio} a ${dataFim})</span>`;
    }
}

    // ===== FUNÇÃO DO BANCO DE HORAS =====
    loadBankHours() {
        console.log("Carregando banco de horas real...");
        
        if (!window.PontoApp) {
            console.error("PontoApp não inicializado");
            this.showNotification("Erro ao carregar banco de horas", 'error');
            return;
        }
        
        // Obter dados do banco de horas usando a função dedicada
        const bankData = window.PontoApp.getBankBalance(this.currentWorker.id);
        
        const currentBalance = bankData.hours || 0;
        const history = bankData.history || [];
        
        console.log(`💰 Saldo atual: ${currentBalance.toFixed(2)}h`);
        
        // Calcular horas positivas e negativas
        let positiveHours = 0;
        let negativeHours = 0;
        
        history.forEach(mov => {
            if (mov.hours > 0) {
                positiveHours += mov.hours;
            } else {
                negativeHours += Math.abs(mov.hours);
            }
        });
        
        // Atualizar interface
        const bankHoursCurrent = document.getElementById('bankHoursCurrent');
        const bankHoursPositive = document.getElementById('bankHoursPositive');
        const bankHoursNegative = document.getElementById('bankHoursNegative');
        const bankPositiveInfo = document.getElementById('bankPositiveInfo');
        const bankNegativeInfo = document.getElementById('bankNegativeInfo');
        
        if (bankHoursCurrent) {
            bankHoursCurrent.textContent = currentBalance.toFixed(1) + 'h';
            // CORREÇÃO: Adicionar cor para valores negativos
            if (currentBalance < 0) {
                bankHoursCurrent.style.color = '#e74c3c';
                bankHoursCurrent.style.fontWeight = 'bold';
            } else {
                bankHoursCurrent.style.color = '';
                bankHoursCurrent.style.fontWeight = '';
            }
        }
        
        if (bankHoursPositive) {
            bankHoursPositive.textContent = positiveHours.toFixed(1) + 'h';
        }
        
        if (bankHoursNegative) {
            bankHoursNegative.textContent = negativeHours.toFixed(1) + 'h';
        }
        
        if (bankPositiveInfo) {
            bankPositiveInfo.textContent = positiveHours > 0 ? 'Horas extras acumuladas' : 'Sem horas extras';
        }
        
        if (bankNegativeInfo) {
            bankNegativeInfo.textContent = negativeHours > 0 ? 'Faltas/atrasos' : 'Sem horas negativas';
        }
        
        // Preencher tabela de movimentos
        const tbody = document.getElementById('bankMovements');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (history.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum movimento registado</td></tr>';
            return;
        }
        
        // Ordenar do mais recente para o mais antigo
        const sortedMovements = [...history].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        // Calcular saldo acumulado (do mais antigo para o mais recente)
        const oldestToNewest = [...history].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );
        
        let runningBalance = 0;
        const movementsWithBalance = [];
        
        oldestToNewest.forEach(mov => {
            runningBalance += mov.hours || 0;
            movementsWithBalance.push({
                ...mov,
                balance: runningBalance.toFixed(1) + 'h'
            });
        });
        
        // Inverter para mostrar do mais recente para o mais antigo
        movementsWithBalance.reverse();
        
        // Preencher tabela
        movementsWithBalance.forEach(mov => {
            const row = document.createElement('tr');
            
            const typeDisplay = mov.type === 'extra' ? 'Horas Extras' : 
                               mov.type === 'deduction' ? 'Dedução' : 
                               mov.type === 'reversal' ? 'Reversão' : mov.type;
            
            const hoursDisplay = mov.hours > 0 ? `+${mov.hours.toFixed(1)}h` : `${mov.hours.toFixed(1)}h`;
            
            row.innerHTML = `
                <td>${new Date(mov.date).toLocaleDateString('pt-PT')}</td>
                <td>${typeDisplay}</td>
                <td style="color: ${mov.hours > 0 ? 'green' : 'red'}; font-weight: bold;">
                    ${hoursDisplay}
                </td>
                <td>${mov.description || '-'}</td>
                <td>${mov.balance}</td>
            `;
            
            tbody.appendChild(row);
        });
        
        console.log(`✅ Banco de horas carregado: ${history.length} movimentos`);
    }
	
showQRFallback(container, workerData) {
    const agora = new Date();
    const horaAtual = agora.toLocaleTimeString('pt-PT');
    const dataAtual = agora.toLocaleDateString('pt-PT');
    
    container.innerHTML = `
        <div style="width: 250px; height: 250px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; border-radius: 10px; margin: 0 auto;">
            <div style="text-align: center; color: white;">
                <div style="font-size: 48px; margin-bottom: 10px;">🔑</div>
                <div style="font-size: 18px; margin-bottom: 5px;">Use o PIN</div>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; margin-bottom: 5px;">${workerData.pin}</div>
                <div style="font-size: 12px; opacity: 0.8;">para fazer login</div>
            </div>
        </div>
        <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: left;">
            <p><strong>Nome:</strong> ${workerData.name}</p>
            <p><strong>Função:</strong> ${workerData.role}</p>
            <p><strong>PIN:</strong> ${workerData.pin}</p>
            <p style="color: #28a745; font-size: 12px; margin-top: 10px; border-top: 1px solid #dee2e6; padding-top: 10px;">
                ✅ Dados atualizados: ${dataAtual} ${horaAtual}
            </p>
        </div>
    `;
}
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM carregado, iniciando aplicação...");
    
    setTimeout(() => {
        try {
            window.workerApp = new WorkerInterface();
            console.log("Aplicação iniciada com sucesso!");
        } catch (error) {
            console.error("Erro ao iniciar aplicação:", error);
        }
    }, 100);
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
        window.workerApp = new WorkerInterface();
    }, 100);
	
}