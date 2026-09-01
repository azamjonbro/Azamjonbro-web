---
slug: running-it-after-launch
title: Shipping is not the last step
project: Algoritm Education · Oxford Education
summary: Deploying is easy. The interesting part is what happens at 2am three months later when nobody is watching.
status: draft
tags: [Linux, Nginx, PM2, SSL]
---

Algoritm Education and Oxford Education are education platforms running on
their own domains. Both are Node applications behind Nginx on a VPS. Getting
them online took an afternoon. Keeping them online is the actual job.

The thing nobody tells you about `git push` deployment is that the moment it
works, you have taken on an obligation.

## The process will die

Not maybe. An unhandled rejection, a memory leak, the kernel's OOM killer
choosing your process, a VPS reboot after a host migration. `node server.js`
in an SSH session survives none of these — and it does not survive you closing
the laptop either.

PM2 exists for this:

```bash
pm2 start ecosystem.config.js
pm2 save          # remember the current process list
pm2 startup       # and bring it back after a reboot
```

`pm2 save` and `pm2 startup` are the two commands people skip, and skipping
them means the site survives a crash but not a restart. Which is worse,
because it fails in the one situation nobody is watching.

```js
module.exports = {
  apps: [{
    name: 'algoritm',
    script: './dist/server.js',
    instances: 'max',        // one per core
    exec_mode: 'cluster',    // and restarts stay zero-downtime
    max_memory_restart: '400M',
    env: { NODE_ENV: 'production' },
  }],
}
```

Cluster mode is worth it for a second reason beyond throughput: `pm2 reload`
restarts workers one at a time, so a deploy does not drop requests.

## Nginx is the part that should be boring

Node should not be answering the internet directly. Nginx in front gives you
TLS, compression, static files served without touching the app, and a place to
put limits.

```nginx
server {
  listen 443 ssl http2;
  server_name algoritmedu.uz;

  # Static assets never reach Node
  location /assets/ {
    root /var/www/algoritm/dist;
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

`X-Forwarded-Proto` matters more than it looks. Without it the app thinks
every request is plain HTTP, and anything that depends on knowing otherwise —
secure cookies, redirect building, canonical URLs — quietly does the wrong
thing.

## Certificates expire on a Saturday

Let's Encrypt certificates last ninety days. Ninety days is long enough to
forget entirely, and the expiry will not be convenient.

```bash
sudo certbot --nginx -d algoritmedu.uz -d www.algoritmedu.uz
systemctl list-timers | grep certbot   # confirm the renewal timer exists
sudo certbot renew --dry-run           # confirm it will actually work
```

The dry run is the step that matters. Renewal usually fails for a reason that
did not exist at issue time — a changed Nginx block, a firewall rule, a
webroot that moved. Finding that out during a dry run is free.

## Logs you will actually read

`console.log` into a terminal nobody has open is not logging.

```bash
pm2 logs algoritm --lines 200
pm2 install pm2-logrotate     # or the disk fills, and then everything fails
```

`pm2-logrotate` is not optional on a small VPS. A full disk takes down the
database, the web server and the ability to SSH in and fix it, roughly in that
order.

## Back up the thing you cannot rebuild

Code is in git. The server can be rebuilt in an hour. The database cannot.

```bash
0 3 * * * mongodump --archive=/backups/db-$(date +\%F).gz --gzip
```

A backup you have never restored is a hypothesis. Restore one into a scratch
database occasionally and confirm it contains what you think.

## The part worth keeping

"It's deployed" is the middle of the work, not the end. A production service
needs to survive a crash, a reboot, a certificate expiry, a full disk and a
year of nobody looking at it. None of that is difficult — it is just work that
happens after the part that felt like finishing.
