// script.js - Interactive features & particle canvas background for VoytecU

document.addEventListener('DOMContentLoaded', () => {
    initCanvasBackground();
    initTerminalSimulation();
});

/* -------------------------------------------------------------
   Interactive Particle Background Canvas
------------------------------------------------------------- */
function initCanvasBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = Math.min(Math.floor(width * 0.05), 65);

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            radius: Math.random() * 1.8 + 0.8,
            color: Math.random() > 0.4 ? '#00f2fe' : '#8b5cf6'
        });
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 130) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 242, 254, ${0.15 * (1 - dist / 130)})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }

        for (const p of particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.fill();
            ctx.shadowBlur = 0;

            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;
        }

        requestAnimationFrame(draw);
    }

    draw();
}

/* -------------------------------------------------------------
   Interactive Terminal Command Simulation
------------------------------------------------------------- */
function initTerminalSimulation() {
    const input = document.getElementById('terminal-input');
    const sendBtn = document.getElementById('send-cmd-btn');
    const output = document.getElementById('terminal-output');

    if (!input || !output || !sendBtn) return;

    const agentInfo = {
        model: 'voytecu-operator-2.6',
        version: '2.6.0',
        context: 128000,
        contextUsed: 18432,
        quota: 847,
        quotaLimit: 1000,
        tasks: 3,
        uptime: '14d 07h 32m',
        region: 'eu-central-1',
        tools: ['terminal', 'browser', 'filesystem', 'git', 'http']
    };

    const autonomousActions = [
        { cmd: "voytecu.agent --deploy-service prod-cluster-9", res: "[AGENT-01] Authenticated. Allocating containerized nodes...\n[EXEC] Running terraform apply --auto-approve\n[DONE] Service deployed to edge nodes in 340ms." },
        { cmd: "agent.execute --task='fix failing unit test'", res: "[AGENT-02] Parsing stacktrace in background...\n[REASONING] Unhandled null pointer in auth.ts:42\n[EXEC] Applied patch and re-ran tests: 100% PASS." },
        { cmd: "voytecu.sentinel --status", res: "[SENTINEL] 8 Autonomous Agent threads running active monitoring loops.\n[STATUS] System health 100%. No human intervention required." }
    ];

    let actionIndex = 0;

    const commandHelp = [
        'agent help              Show all available agent commands',
        'agent model             Show the active inference model',
        'agent context           Show context window usage',
        'agent status            Show agent health and runtime status',
        'agent quota             Show remaining execution quota',
        'agent tasks             Show active autonomous tasks',
        'agent tools             List tools available to the agent',
        'agent memory            Show demo memory state',
        'agent ping              Measure simulated agent latency',
        'agent version           Show agent runtime version',
        'agent clear             Clear the terminal output',
        'agent reset             Reset the demo agent state'
    ].join('\n');

    function handleCommand(userText) {
        const commandText = userText.trim();
        if (!commandText) {
            const action = autonomousActions[actionIndex % autonomousActions.length];
            actionIndex++;
            appendCommandLine(action.cmd);
            simulateExecution(action.res);
            return;
        }

        appendCommandLine(commandText);
        input.value = '';

        const response = executeCommand(commandText);
        if (response === '__CLEAR__') {
            output.innerHTML = '';
            return;
        }
        if (response === '__RESET__') {
            agentInfo.contextUsed = 18432;
            agentInfo.quota = 847;
            agentInfo.tasks = 3;
            simulateExecution('[RESET] Demo agent state restored.\n[READY] Autonomous runtime is online.');
            return;
        }

        simulateExecution(response);
    }

    function executeCommand(rawCommand) {
        const normalized = rawCommand.toLowerCase().replace(/\s+/g, ' ').trim();
        const parts = normalized.split(' ');

        // Both "agent help" and "agent --help" are supported.
        if (parts[0] === 'agent') {
            const subcommand = (parts[1] || 'help').replace(/^--/, '');

            switch (subcommand) {
                case 'help':
                    return `[AGENT CLI] Available commands:\n${commandHelp}`;
                case 'model':
                    return `[MODEL] ${agentInfo.model}\n[MODE] Autonomous tool-use / reasoning\n[PROVIDER] VoytecU Runtime`;
                case 'context':
                    return `[CONTEXT] ${agentInfo.contextUsed.toLocaleString()} / ${agentInfo.context.toLocaleString()} tokens used\n[WINDOW] ${Math.round((agentInfo.contextUsed / agentInfo.context) * 100)}% utilized\n[STATUS] Healthy`;
                case 'status':
                    return `[STATUS] ONLINE\n[UPTIME] ${agentInfo.uptime}\n[REGION] ${agentInfo.region}\n[WORKERS] 8 active / 8 healthy\n[QUEUE] ${agentInfo.tasks} tasks in progress`;
                case 'quota':
                case 'quta':
                    return `[QUOTA] ${agentInfo.quota} / ${agentInfo.quotaLimit} execution units remaining\n[RESET] Demo quota refreshes in 02h 18m\n[STATUS] Within limits`;
                case 'tasks':
                    return `[TASKS] ${agentInfo.tasks} autonomous tasks active\n  • deploy-service     RUNNING   68%\n  • test-repair        REASONING 42%\n  • sentinel-monitor   WATCHING  100%`;
                case 'tools':
                    return `[TOOLS] ${agentInfo.tools.length} capabilities available:\n${agentInfo.tools.map(tool => `  • ${tool}`).join('\n')}`;
                case 'memory':
                    return `[MEMORY] Session memory: ENABLED\n[MEMORY] Short-term facts: 24\n[MEMORY] Long-term slots: 8 / 32\n[SYNC] Last checkpoint: 12s ago`;
                case 'ping':
                    return `[PING] agent-node-01\n[PONG] 1.2ms\n[ROUTE] edge → eu-central-1\n[STATUS] Stable`;
                case 'version':
                    return `[VERSION] VoytecU Agent Runtime ${agentInfo.version}\n[PROTOCOL] Agent Command Interface v1\n[BUILD] autonomous-2026.08`;
                case 'clear':
                    return '__CLEAR__';
                case 'reset':
                    return '__RESET__';
                default:
                    return `[ERROR] Unknown agent command: ${escapeHtml(parts[1] || '')}\n[HINT] Run "agent help" to list available commands.`;
            }
        }

        if (normalized === 'help' || normalized === '--help') {
            return `[CLI] Type "agent help" to inspect the autonomous agent command interface.`;
        }

        // Keep the original free-form terminal demo behavior.
        return `[VOYTECU AGENT] Received intent: "${rawCommand}"\n[AGENT EXEC] Synthesizing execution plan & dispatching command runner...\n[SUCCESS] Action completed on remote agent worker cleanly.`;
    }

    function appendCommandLine(cmd) {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = `<span class="t-prompt">user@voytecu:~$</span> <span class="t-cmd">${escapeHtml(cmd)}</span>`;
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }

    function simulateExecution(resText) {
        const lines = resText.split('\n');
        lines.forEach((lineText, idx) => {
            setTimeout(() => {
                const line = document.createElement('div');
                line.className = 'terminal-line t-action';
                line.textContent = lineText;
                output.appendChild(line);
                output.scrollTop = output.scrollHeight;
            }, (idx + 1) * 220);
        });
    }

    function escapeHtml(text) {
        return text.replace(/[&<>"']/g, function(m) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
        });
    }

    sendBtn.addEventListener('click', () => handleCommand(input.value));

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleCommand(input.value);
        }
    });
}