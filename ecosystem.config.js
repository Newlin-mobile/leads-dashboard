module.exports = {
  apps: [{
    name: 'leads-dashboard',
    script: 'npm',
    args: 'start',
    cwd: '/root/projects/leads-dashboard',
    env: {
      PORT: 3007,
      NODE_ENV: 'production'
    }
  }]
};
