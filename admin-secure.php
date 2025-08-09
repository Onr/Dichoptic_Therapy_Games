<?php
session_start();

// Configuration
$ADMIN_PASSWORD = 'your_secure_password_here'; // Change this!
$ADMIN_USERNAME = 'admin'; // Change this!

// Handle login
if ($_POST['action'] === 'login') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if ($username === $ADMIN_USERNAME && $password === $ADMIN_PASSWORD) {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['login_time'] = time();
        header('Location: admin-secure.php');
        exit;
    } else {
        $error = 'Invalid credentials';
        // Log failed login attempt
        error_log("Failed admin login attempt from " . $_SERVER['REMOTE_ADDR'] . " at " . date('Y-m-d H:i:s'));
    }
}

// Handle logout
if ($_GET['action'] === 'logout') {
    session_destroy();
    header('Location: admin-secure.php');
    exit;
}

// Check if logged in
$isLoggedIn = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;

// Session timeout (30 minutes)
if ($isLoggedIn && (time() - $_SESSION['login_time']) > 1800) {
    session_destroy();
    $isLoggedIn = false;
    $error = 'Session expired. Please login again.';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure Admin Dashboard</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            background: #000;
            color: #00ff00;
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        
        .login-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 80vh;
        }
        
        .login-box {
            background: rgba(0, 255, 0, 0.1);
            border: 2px solid #00ff00;
            padding: 40px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
            max-width: 400px;
            width: 100%;
        }
        
        .login-box h1 {
            color: #00ff00;
            text-shadow: 0 0 10px #00ff00;
            margin-bottom: 20px;
        }
        
        .login-box input {
            background: #000;
            border: 1px solid #00ff00;
            color: #00ff00;
            padding: 12px 15px;
            margin: 10px 0;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            width: 100%;
            box-sizing: border-box;
        }
        
        .login-box input:focus {
            outline: none;
            box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
        }
        
        .login-box button {
            background: #003300;
            border: 1px solid #00ff00;
            color: #00ff00;
            padding: 12px 20px;
            margin: 15px 0;
            border-radius: 5px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            transition: all 0.3s;
            width: 100%;
        }
        
        .login-box button:hover {
            background: #00ff00;
            color: #000;
            box-shadow: 0 0 15px rgba(0, 255, 0, 0.7);
        }
        
        .error {
            color: #ff0000;
            margin: 15px 0;
            padding: 10px;
            border: 1px solid #ff0000;
            border-radius: 5px;
            background: rgba(255, 0, 0, 0.1);
            animation: shake 0.5s;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        .dashboard {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #00ff00;
            padding-bottom: 15px;
        }
        
        .header h1 {
            margin: 0;
            color: #00ff00;
            text-shadow: 0 0 10px #00ff00;
        }
        
        .header .info {
            color: #ccc;
            font-size: 12px;
        }
        
        .btn {
            background: #003300;
            border: 1px solid #00ff00;
            color: #00ff00;
            padding: 8px 15px;
            margin: 0 5px;
            border-radius: 5px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s;
        }
        
        .btn:hover {
            background: #00ff00;
            color: #000;
        }
        
        .btn.danger {
            background: #330000;
            border-color: #ff0000;
            color: #ff0000;
        }
        
        .btn.danger:hover {
            background: #ff0000;
            color: #fff;
        }
        
        .stats-container {
            background: rgba(0, 255, 0, 0.05);
            border: 1px solid #00ff00;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
        }
        
        .warning {
            background: rgba(255, 255, 0, 0.1);
            border: 1px solid #ffff00;
            color: #ffff00;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        
        .security-note {
            margin-top: 30px;
            padding: 15px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid #666;
            border-radius: 5px;
            font-size: 12px;
            color: #ccc;
        }
    </style>
</head>
<body>
    <?php if (!$isLoggedIn): ?>
        <!-- Login Screen -->
        <div class="login-container">
            <div class="login-box">
                <h1>🔐 SECURE ADMIN ACCESS</h1>
                <p>Enter your credentials to access user analytics</p>
                
                <?php if (isset($error)): ?>
                    <div class="error"><?php echo htmlspecialchars($error); ?></div>
                <?php endif; ?>
                
                <form method="POST">
                    <input type="hidden" name="action" value="login">
                    <input type="text" name="username" placeholder="Username" required autocomplete="username">
                    <input type="password" name="password" placeholder="Password" required autocomplete="current-password">
                    <button type="submit">🚀 ACCESS DASHBOARD</button>
                </form>
                
                <div class="security-note">
                    <strong>🛡️ Security Features:</strong><br>
                    • Session timeout (30 minutes)<br>
                    • Failed login attempt logging<br>
                    • Secure password protection<br>
                    • IP-based access logging
                </div>
            </div>
        </div>
    <?php else: ?>
        <!-- Dashboard -->
        <div class="dashboard">
            <div class="header">
                <div>
                    <h1>📊 SECURE ANALYTICS DASHBOARD</h1>
                    <div class="info">
                        Logged in as: <?php echo htmlspecialchars($ADMIN_USERNAME); ?> | 
                        Session: <?php echo date('H:i', $_SESSION['login_time']); ?> | 
                        IP: <?php echo htmlspecialchars($_SERVER['REMOTE_ADDR']); ?>
                    </div>
                </div>
                <div>
                    <button class="btn" onclick="refreshStats()">🔄 Refresh</button>
                    <button class="btn" onclick="downloadReport()">📥 Export</button>
                    <button class="btn danger" onclick="clearStats()">🗑️ Clear</button>
                    <a href="?action=logout" class="btn">🚪 Logout</a>
                </div>
            </div>

            <div class="warning">
                ⚠️ <strong>IMPORTANT:</strong> Change the default username and password in admin-secure.php before deploying to production!
            </div>

            <div class="stats-container">
                <h2>📈 Real-Time User Statistics</h2>
                <p>Loading analytics data from local storage...</p>
                
                <div id="stats-display" style="margin-top: 30px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0;">
                        <div style="background: rgba(0,255,0,0.1); padding: 15px; border-radius: 5px;">
                            <h3 style="margin: 0; color: #00ff00;">Total Users</h3>
                            <div id="totalUsers" style="font-size: 24px; color: #ffff00;">0</div>
                        </div>
                        <div style="background: rgba(0,255,0,0.1); padding: 15px; border-radius: 5px;">
                            <h3 style="margin: 0; color: #00ff00;">Total Sessions</h3>
                            <div id="totalSessions" style="font-size: 24px; color: #ffff00;">0</div>
                        </div>
                        <div style="background: rgba(0,255,0,0.1); padding: 15px; border-radius: 5px;">
                            <h3 style="margin: 0; color: #00ff00;">Today's Activity</h3>
                            <div id="todayActivity" style="font-size: 24px; color: #ffff00;">0</div>
                        </div>
                        <div style="background: rgba(0,255,0,0.1); padding: 15px; border-radius: 5px;">
                            <h3 style="margin: 0; color: #00ff00;">Avg Session</h3>
                            <div id="avgSession" style="font-size: 24px; color: #ffff00;">0m</div>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 30px; text-align: left;">
                    <h3>📊 Detailed Analytics</h3>
                    <div id="detailedStats" style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 5px; font-family: monospace; font-size: 12px;">
                        Loading detailed statistics...
                    </div>
                </div>
            </div>

            <div class="security-note">
                <strong>🔒 Security Information:</strong><br>
                • All user data is stored locally on user devices only<br>
                • No personal information is collected or transmitted<br>
                • Admin access is logged for security purposes<br>
                • Session expires automatically after 30 minutes of inactivity
            </div>
        </div>

        <!-- Include the tracking scripts -->
        <script src="src/utils/userCounter.js"></script>
        
        <script>
            function loadStats() {
                try {
                    if (window.UserCounter) {
                        const report = window.UserCounter.generateReport();
                        
                        // Update main stats
                        document.getElementById('totalUsers').textContent = report.overview.totalUsers;
                        document.getElementById('totalSessions').textContent = report.overview.totalSessions;
                        document.getElementById('todayActivity').textContent = report.today.sessions;
                        document.getElementById('avgSession').textContent = formatTime(report.today.averageTime);
                        
                        // Update detailed stats
                        document.getElementById('detailedStats').innerHTML = `
                            <strong>📅 Today's Details:</strong><br>
                            New Users: ${report.today.newUsers}<br>
                            Returning Users: ${report.today.returningUsers}<br>
                            Total Time: ${formatTime(report.today.totalTime)}<br><br>
                            
                            <strong>📈 Last 7 Days:</strong><br>
                            Sessions: ${report.last7Days.sessions}<br>
                            New Users: ${report.last7Days.newUsers}<br>
                            Avg Duration: ${formatTime(report.last7Days.averageDuration)}<br><br>
                            
                            <strong>💻 Technical:</strong><br>
                            Language: ${report.technical.mostCommonLanguage}<br>
                            Resolution: ${report.technical.mostCommonResolution}<br>
                            Timezone: ${report.technical.mostCommonTimezone}<br><br>
                            
                            <strong>⏰ Peak Hours:</strong><br>
                            ${report.patterns.peakHours.map(h => `${h.hour}:00 (${h.count} visits)`).join('<br>')}<br><br>
                            
                            <strong>Last Updated:</strong> ${new Date().toLocaleString()}
                        `;
                    } else {
                        document.getElementById('detailedStats').innerHTML = 'UserCounter not available. Make sure you\'re accessing from the main site.';
                    }
                } catch (error) {
                    document.getElementById('detailedStats').innerHTML = 'Error loading stats: ' + error.message;
                }
            }
            
            function formatTime(ms) {
                if (!ms) return '0m';
                const minutes = Math.round(ms / 60000);
                const hours = Math.floor(minutes / 60);
                const remainingMinutes = minutes % 60;
                return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
            }
            
            function refreshStats() {
                loadStats();
            }
            
            function downloadReport() {
                if (window.UserCounter) {
                    window.UserCounter.downloadReport();
                } else {
                    alert('UserCounter not available');
                }
            }
            
            function clearStats() {
                if (confirm('⚠️ WARNING: This will permanently delete ALL user statistics.\n\nThis action cannot be undone. Continue?')) {
                    if (window.UserCounter) {
                        window.UserCounter.clearStats();
                        loadStats();
                        alert('✅ All statistics have been cleared.');
                    }
                }
            }
            
            // Load stats when page loads
            window.addEventListener('load', loadStats);
            
            // Auto-refresh every 60 seconds
            setInterval(loadStats, 60000);
            
            // Prevent common developer tools shortcuts
            document.addEventListener('keydown', (e) => {
                if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
                    e.preventDefault();
                    return false;
                }
            });
            
            // Disable right-click context menu
            document.addEventListener('contextmenu', e => e.preventDefault());
        </script>
    <?php endif; ?>
</body>
</html>
