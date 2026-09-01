---
slug: notifications-are-state
title: A notification is state, not a cron job
project: Oil
summary: The difference between a system that tells you something and a system you mute after two days.
status: draft
tags: [Node.js, Telegram Bot API, Automation]
---

Oil tracks operations and sends the notifications that go with them —
thresholds, reminders, the things somebody needs to act on. It replaces the
job of remembering.

The naive version of that is a scheduled job that looks at the data and sends
a message. It works on the first day and gets muted on the third.

## Why the obvious version fails

```js
setInterval(async () => {
  const low = await Tank.find({ level: { $lt: 20 } })
  for (const tank of low) await telegram.send(chat, `${tank.name} is low`)
}, 5 * 60 * 1000)
```

A tank below twenty percent stays below twenty percent. This sends the same
message every five minutes until somebody fills it, which means:

- the useful message is buried in eleven identical ones
- the person learns that the alerts are noise
- when something genuinely new happens, nobody reads it

The system is technically correct and practically worthless. It is not
reporting an **event**. It is reporting a **condition**, over and over.

## Alert on the edge, not the level

What matters is the moment the condition changed. Store that:

```js
// One row per (subject, rule). This is the alert's memory.
{
  subject: tankId,
  rule: 'level-low',
  active: true,
  firedAt: ISODate(...),
  clearedAt: null,
}
```

Then the job compares the world to the memory and only speaks about the
difference:

```js
const breaching = tank.level < rule.threshold
const alert = await Alert.findOne({ subject: tank.id, rule: rule.id })

if (breaching && !alert?.active) {
  await notify(`${tank.name} dropped below ${rule.threshold}%`)
  await Alert.upsert({ ...key, active: true, firedAt: new Date() })
}

if (!breaching && alert?.active) {
  await notify(`${tank.name} is back above ${rule.threshold}%`)
  await Alert.update(key, { active: false, clearedAt: new Date() })
}
```

Two messages per incident instead of a hundred. The recovery message matters
as much as the alert — without it, the only way to learn a problem ended is to
go and look, which is the thing the system was supposed to remove.

## Add hysteresis or it will flap

A value sitting exactly on the threshold will cross it repeatedly, and you are
back to spam with extra steps. Fire at one number, clear at another:

```js
const FIRE  = 20
const CLEAR = 25
```

The gap should be wider than the noise in the measurement. That is the whole
technique, and it is older than software.

## Delivery is not the same as sending

`await telegram.send(...)` can fail. The network can drop, the bot can be
rate-limited, the user can have blocked it. If the alert row is written before
the message actually goes out, the system now believes it told somebody
something it did not tell them — the worst possible state, because it will
never try again.

Write the intent first, deliver second, record the delivery:

- `pending` — decided to send
- `sent` — the API accepted it
- `failed` — with the reason and an attempt count

A retry then means "find pending and failed rows", not "recompute everything
and hope". Telegram rate-limits per chat; a queue with a small delay between
sends is not optimisation, it is the difference between messages arriving and
`429`s.

## Make it possible to be quiet

Every alert rule needs an owner, a schedule and an off switch. Nobody needs a
tank reading at 03:00. A rule that cannot be silenced gets silenced at the
application level — the entire bot muted — and then none of them work.

## The part worth keeping

A notification system is not "code that sends messages". It is a small state
machine per rule, and the messages are what falls out of the transitions.
Model the state and the messages become obvious. Skip the state and you are
writing `setInterval` and apologising.
