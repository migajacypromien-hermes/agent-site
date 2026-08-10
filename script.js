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

        // Draw connections
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

        // Draw particles
        for (const p of particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Move particle
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

    const autonomousActions = [
        { cmd: "voytecu.agent --deploy-service prod-cluster-9", res: "[AGENT-01] Authenticated. Allocating containerized nodes...\n[EXEC] Running terraform apply --auto-approve\n[DONE] Service deployed to edge nodes in 340ms." },
        { cmd: "agent.execute --task='fix failing unit test'", res: "[AGENT-02] Parsing stacktrace in background...\n[REASONING] Unhandled null pointer in auth.ts:42\n[EXEC] Applied patch and re-ran tests: 100% PASS." },
        { cmd: "voytecu.sentinel --status", res: "[SENTINEL] 8 Autonomous Agent threads running active monitoring loops.\n[STATUS] System health 100%. No human intervention required." }
    ];

    let actionIndex = 0;

    function handleCommand(userText) {
        const commandText = userText.trim();
        if (!commandText) {
            // Auto run next predefined action if empty
            const action = autonomousActions[actionIndex % autonomousActions.length];
            actionIndex++;
            appendCommandLine(action.cmd);
            simulateExecution(action.res);
            return;
        }

        appendCommandLine(commandText);
        input.value = '';

        // Dynamic intelligent response simulation
        const responseText = `[VOYTECU AGENT] Received intent: "${commandText}"\n[AGENT EXEC] Synthesizing execution plan & dispatching command runner...\n[SUCCESS] Action completed on remote agent worker cleanly.`;
        simulateExecution(responseText);
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
            }, (idx + 1) * 400);
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