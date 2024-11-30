// 生产环境配置
module.exports = {
  apps: [
    {
      name: 'beicun',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: './',
      instances: '1',
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '8G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      merge_logs: true,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 4000,
      source_map_support: false,
      node_args: '--max-old-space-size=1536',
    }
  ]
}
