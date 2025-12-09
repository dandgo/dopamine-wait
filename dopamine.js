const { chromium } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PID_FILE = path.join(os.tmpdir(), 'dopamine_browser.pid');
const USER_DATA_DIR = path.join(__dirname, '.dopamine-profile');
const TARGET_URLS = [
    'https://www.tiktok.com/',
    'https://www.instagram.com/reels/'
];

async function start() {
    console.log('Starting DopamineWait...');

    // Ensure cleanup of previous run if any (though stop command handles it)
    if (fs.existsSync(PID_FILE)) {
        try {
            const oldPid = parseInt(fs.readFileSync(PID_FILE, 'utf8'), 10);
            // Check if process exists 
            process.kill(oldPid, 0);
            console.log('DopamineWait already running (PID: ' + oldPid + ')');
            // Logic choice: Should we restart? Or attach?
            // Requirement implies fresh start for each prompt, or maybe reuse?
            // "Automatically open... and immediately close..."
            // If it's already running, maybe we just leave it?
            // But if previous 'stop' failed, we might want to kill it.
            // Let's assume 'stop' works. If start called while running, maybe just focus?
            // For now, let's overwrite.
        } catch (e) {
            // Process doesn't exist, stale file
            cleanup();
        }
    }

    try {
        // Launch Persistent Context
        // HEADLESS: FALSE is crucial
        const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
            headless: false,
            viewport: null, // Use full available space
            args: ['--start-maximized'] // Start maximized
        });

        // Write PID now that we successfully launched
        fs.writeFileSync(PID_FILE, process.pid.toString());
        console.log(`PID ${process.pid} written to ${PID_FILE}`);

        const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

        // Navigate
        // Randomly choose one? Or just TikTok?
        // Let's pick TikTok as primary.
        await page.goto(TARGET_URLS[0]);

        // Keep running until killed
        // We can listen for close event to cleanup PID if user closes manually
        context.on('close', () => {
            console.log('Browser context closed.');
            cleanup();
            process.exit(0);
        });

    } catch (error) {
        console.error('Failed to launch browser:', error);
        cleanup();
        process.exit(1);
    }
}

function stop() {
    console.log('Stopping DopamineWait...');
    if (fs.existsSync(PID_FILE)) {
        try {
            const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8'), 10);
            // Verify it's a number
            if (!isNaN(pid)) {
                process.kill(pid, 'SIGKILL');
                console.log(`Killed process ${pid}`);
            }
        } catch (e) {
            if (e.code === 'ESRCH') {
                console.log('Process not found (already stopped?)');
            } else {
                console.error(`Error killing process: ${e.message}`);
            }
        }
        cleanup();
    } else {
        console.log('No PID file found.');
    }
}

function cleanup() {
    try {
        if (fs.existsSync(PID_FILE)) {
            fs.unlinkSync(PID_FILE);
            console.log('Cleaned up PID file.');
        }
    } catch (e) {
        console.error('Error during cleanup:', e);
    }
}

const command = process.argv[2];

if (command === 'start') {
    start();
} else if (command === 'stop') {
    stop();
} else {
    console.log('Usage: node dopamine.js [start|stop]');
    console.log('Command not recognized.');
}
